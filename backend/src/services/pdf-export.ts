/**
 * News PDF Export Service
 * Generates branded PDF digests using Playwright with SSA branding
 * (cover page, wave footer, Avenir font) matching research PDF export.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import { chromium } from 'playwright';
import { prisma } from '../lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = fs.existsSync(path.resolve(__dirname, '../../assets'))
  ? path.resolve(__dirname, '../../assets')
  : path.resolve(__dirname, '../../../assets');

// ── SSA brand constants ─────────────────────────────────────────────
const BRAND_BLUE = '#003399';
const BRAND_DK2 = '#336179';
const BODY_COLOR = '#111827';
const FONT_STACK = '"Avenir Next LT Pro", "Helvetica Neue", Arial, sans-serif';

// ── Load assets as base64 data URIs (once at module init) ───────────
function loadDataUri(filename: string, mime: string): string {
  return `data:${mime};base64,${fs.readFileSync(path.join(assetsDir, filename)).toString('base64')}`;
}

let headerLogoDataUri = '';
try { headerLogoDataUri = loadDataUri('ssa-header-logo.jpg', 'image/jpeg'); } catch { /* no logo */ }

let footerWaveDataUri = '';
try { footerWaveDataUri = loadDataUri('ssa-footer-logo.png', 'image/png'); } catch { /* no wave */ }

let samiDataUri = '';
try { samiDataUri = loadDataUri('SAMI_News.png', 'image/png'); } catch { /* no mascot */ }

// ── Playwright header template (pages 2+ only; page 1 uses empty) ───
const pdfHeaderTemplate = headerLogoDataUri
  ? `<div style="width:100%;text-align:center;padding:10px 0 0 0;">
       <img src="${headerLogoDataUri}" style="height:28px;" />
     </div>`
  : `<div style="width:100%;text-align:center;padding:10px 32px 0 32px;font-size:12px;font-family:'Avenir Next LT Pro','Helvetica Neue',Arial,sans-serif;font-weight:700;color:${BRAND_BLUE};">
       SSA &amp; Company
     </div>`;

const emptyHeaderTemplate = '<div></div>';

// ── Playwright footer template (wave background + text) ─────────────
const footerTextHtml = `
  <div style="position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);z-index:1;text-align:center;font-family:'Avenir Next LT Pro','Helvetica Neue',Arial,sans-serif;font-size:9px;color:${BRAND_BLUE};line-height:1.4;">
    SSA &amp; Company &#x2022; 685 Third Ave., 22<sup style="font-size:6px;">nd</sup> Floor &#x2022; New York, NY 10017 &#x2022; Tel. (212) 332-3790 &#x2022; <a href="http://www.ssaandco.com" style="color:${BRAND_BLUE};text-decoration:none;">www.ssaandco.com</a>
  </div>`;

const pdfFooterTemplate = footerWaveDataUri
  ? `<div style="position:relative;width:100%;height:100%;overflow:hidden;-webkit-print-color-adjust:exact;margin-bottom:-20px;">
       <img src="${footerWaveDataUri}" style="position:absolute;bottom:0;left:-32px;width:calc(100% + 64px);height:auto;z-index:0;" />
       ${footerTextHtml}
     </div>`
  : `<div style="position:relative;width:100%;height:100%;">
       ${footerTextHtml}
     </div>`;

export interface ExportArticle {
  headline: string;
  shortSummary: string | null;
  longSummary: string | null;
  summary: string | null;
  whyItMatters: string | null;
  sourceUrl: string;
  sourceName: string | null;
  publishedAt: string | Date | null;
  matchType: string | null;
  company: { name: string } | null;
  person: { name: string } | null;
  tag: { name: string } | null;
}

interface ExportOptions {
  userId?: string;
  articleIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  articles?: ExportArticle[];
  userName?: string;
}

export async function generateNewsDigestPDF(options: ExportOptions): Promise<Buffer> {
  const { userId, articleIds, dateFrom, dateTo } = options;

  let userName = options.userName || 'User';

  // If pre-loaded articles provided, use them directly (no DB access)
  let articles;
  if (options.articles) {
    articles = options.articles;
  } else {
    if (userId && !options.userName) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');
      userName = user.name || user.email;
    }

    // Fetch articles — by IDs or by user (all non-archived)
    if (articleIds && articleIds.length > 0) {
      articles = await prisma.newsArticle.findMany({
        where: { id: { in: articleIds } },
        include: { company: true, person: true, tag: true },
        orderBy: [{ publishedAt: 'desc' }],
      });
    } else if (userId) {
      const where: any = {
        articleUsers: { some: { userId } },
        isArchived: false,
      };
      if (dateFrom || dateTo) {
        where.publishedAt = {};
        if (dateFrom) where.publishedAt.gte = dateFrom;
        if (dateTo) where.publishedAt.lte = dateTo;
      }
      articles = await prisma.newsArticle.findMany({
        where,
        include: { company: true, person: true, tag: true },
        orderBy: [{ publishedAt: 'desc' }],
      });
    } else {
      throw new Error('Either userId, articleIds, or articles must be provided');
    }
  }

  // Group articles by company
  const grouped: Record<string, typeof articles> = {};
  for (const article of articles) {
    const companyName = article.company?.name || 'Other';
    if (!grouped[companyName]) grouped[companyName] = [];
    grouped[companyName].push(article);
  }

  const companyNames = Object.keys(grouped).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Build article body HTML
  let bodyHtml = '';
  for (const companyName of companyNames) {
    const companyArticles = grouped[companyName];

    bodyHtml += `<div class="company-group">`;
    bodyHtml += `<div class="company-header">${escapeHtml(companyName).toUpperCase()}</div>`;

    for (let i = 0; i < companyArticles.length; i++) {
      const article = companyArticles[i];

      bodyHtml += `<div class="article">`;

      if (article.tag?.name) {
        bodyHtml += `<div class="tag-badge">${escapeHtml(article.tag.name.toUpperCase())}</div>`;
      }

      bodyHtml += `<h3 class="headline">${escapeHtml(article.headline)}</h3>`;

      const summaryText = article.longSummary || article.shortSummary || article.summary;
      if (summaryText) {
        bodyHtml += `<p class="summary">${escapeHtml(summaryText)}</p>`;
      }

      if (article.whyItMatters) {
        bodyHtml += `<p class="why-it-matters"><strong>Why It Matters:</strong> ${escapeHtml(article.whyItMatters)}</p>`;
      }

      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })
        : 'Unknown date';

      let sourceLine = `${escapeHtml(article.sourceName || 'Unknown source')}  |  ${pubDate}`;
      if (article.sourceUrl) {
        sourceLine += `  |  <a href="${escapeHtml(article.sourceUrl)}" class="source-link">Link to Article</a>`;
      }
      bodyHtml += `<div class="source-line">${sourceLine}</div>`;

      if (i < companyArticles.length - 1) {
        bodyHtml += `<hr class="article-sep" />`;
      }

      bodyHtml += `</div>`;
    }

    bodyHtml += `</div>`;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      font-family: ${FONT_STACK};
      color: ${BODY_COLOR};
      margin: 0;
      -webkit-print-color-adjust: exact;
    }
    h1 { font-size: 28px; margin: 0 0 8px 0; color: ${BRAND_BLUE}; }
    h2 { font-size: 20px; margin: 24px 0 8px 0; color: ${BRAND_DK2}; font-weight: 700; }
    h3 { font-size: 14px; margin: 12px 0 4px 0; color: ${BODY_COLOR}; font-weight: 700; }
    p, li { font-size: 11pt; line-height: 1.5; color: ${BODY_COLOR}; }
    .meta { color: #4b5563; font-size: 11px; line-height: 1.4; margin: 0 0 4px 0; }
    .cover-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
      page-break-after: always;
    }
    .cover-logo { width: 350px; margin-bottom: 32px; }
    .cover-page h1 { font-size: 36px; margin-bottom: 16px; color: ${BRAND_BLUE}; }
    .cover-page .meta { font-size: 13px; }
    .company-group { margin-bottom: 18px; }
    .company-header {
      background: ${BRAND_BLUE};
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 10px;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
      -webkit-print-color-adjust: exact;
    }
    .article { margin-bottom: 6px; }
    .tag-badge {
      font-size: 8px;
      font-weight: 700;
      color: ${BRAND_DK2};
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .headline {
      font-size: 13px;
      font-weight: 700;
      color: ${BODY_COLOR};
      margin: 2px 0 4px 0;
    }
    .summary {
      font-size: 11px;
      line-height: 1.5;
      color: ${BODY_COLOR};
      margin: 0 0 4px 0;
    }
    .why-it-matters {
      font-size: 11px;
      font-style: italic;
      color: ${BRAND_BLUE};
      line-height: 1.5;
      margin: 0 0 4px 0;
    }
    .source-line {
      font-size: 9px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .source-link {
      color: ${BRAND_BLUE};
      text-decoration: underline;
    }
    .article-sep {
      border: none;
      border-top: 0.3px solid #cbd5e1;
      margin: 8px 10px;
    }
  </style>
</head>
<body>
  <div class="cover-page">
    ${samiDataUri ? `<img src="${samiDataUri}" alt="SAMI" style="width:250px;margin-bottom:24px;" />` : ''}
    ${headerLogoDataUri ? `<img class="cover-logo" src="${headerLogoDataUri}" alt="SSA &amp; Company" />` : ''}
    <h1>SSAMI News Digest</h1>
    <div class="meta">Prepared for: ${escapeHtml(userName)}</div>
    <div class="meta">${escapeHtml(dateStr)}</div>
    <div class="meta">${articles.length} article${articles.length !== 1 ? 's' : ''}</div>
  </div>
  ${bodyHtml}
</body>
</html>
`;

  // Render with Playwright
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1800 } });
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 30000 });

    const sharedOpts = {
      format: 'Letter' as const,
      displayHeaderFooter: true,
      footerTemplate: pdfFooterTemplate,
      margin: { top: '80px', bottom: '0.75in', left: '32px', right: '32px' },
      printBackground: true,
      timeout: 30000,
    };

    // Two-pass render: page 1 (no header) + pages 2+ (with header)
    const coverBytes = await page.pdf({
      ...sharedOpts,
      headerTemplate: emptyHeaderTemplate,
      pageRanges: '1',
    });

    let bodyBytes: Buffer | null = null;
    try {
      const raw = await page.pdf({
        ...sharedOpts,
        headerTemplate: pdfHeaderTemplate,
        pageRanges: '2-',
      });
      const check = await PDFDocument.load(raw);
      if (check.getPageCount() > 0) bodyBytes = raw;
    } catch {
      // Single-page document — no body pages
    }

    let pdfBuffer: Buffer;
    if (bodyBytes) {
      const merged = await PDFDocument.create();
      const coverDoc = await PDFDocument.load(coverBytes);
      const bodyDoc = await PDFDocument.load(bodyBytes);

      for (const p of await merged.copyPages(coverDoc, coverDoc.getPageIndices())) {
        merged.addPage(p);
      }
      for (const p of await merged.copyPages(bodyDoc, bodyDoc.getPageIndices())) {
        merged.addPage(p);
      }

      pdfBuffer = Buffer.from(await merged.save());
    } else {
      pdfBuffer = coverBytes;
    }

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
