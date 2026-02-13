import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import { prisma } from '../../lib/prisma.js';
import { chromium } from 'playwright';
import { marked } from 'marked';
import { sectionOrder } from '../../services/section-formatter.js';
import { buildExportSections, buildResearchMarkdown, isExportReady } from '../../services/export-utils.js';
import { getReportBlueprint } from '../../services/report-blueprints.js';
import { buildVisibilityWhere } from '../../middleware/auth.js';
import { safeErrorMessage } from '../../lib/error-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.resolve(__dirname, '../../../assets');

// ── SSA brand constants (matching docx-export.ts) ─────────────────────
const BRAND_BLUE = '#003399';
const BRAND_DK2 = '#336179';
const BODY_COLOR = '#111827';
const FONT_STACK = '"Avenir Next LT Pro", "Helvetica Neue", Arial, sans-serif';

// ── Load assets as base64 data URIs (once at module init) ─────────────
function loadDataUri(filename: string, mime: string): string {
  return `data:${mime};base64,${fs.readFileSync(path.join(assetsDir, filename)).toString('base64')}`;
}

let headerLogoDataUri = '';
try { headerLogoDataUri = loadDataUri('ssa-header-logo.jpg', 'image/jpeg'); } catch { /* no logo */ }

let footerWaveDataUri = '';
try { footerWaveDataUri = loadDataUri('ssa-footer-logo.png', 'image/png'); } catch { /* no wave */ }

// ── Playwright header template (pages 2+ only; page 1 uses empty) ─────
const pdfHeaderTemplate = headerLogoDataUri
  ? `<div style="width:100%;text-align:center;padding:10px 0 0 0;">
       <img src="${headerLogoDataUri}" style="height:28px;" />
     </div>`
  : `<div style="width:100%;text-align:center;padding:10px 32px 0 32px;font-size:12px;font-family:'Avenir Next LT Pro','Helvetica Neue',Arial,sans-serif;font-weight:700;color:${BRAND_BLUE};">
       SSA &amp; Company
     </div>`;

const emptyHeaderTemplate = '<div></div>';

// ── Playwright footer template (wave background + text) ───────────────
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

// ── HTML template ─────────────────────────────────────────────────────
const htmlTemplate = (params: { title: string; meta: string[]; body: string }) => `
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
    h3 { font-size: 16px; margin: 18px 0 6px 0; color: ${BODY_COLOR}; font-weight: 700; }
    p, li { font-size: 11pt; line-height: 1.5; color: ${BODY_COLOR}; }
    .meta { color: #4b5563; font-size: 11px; line-height: 1.4; margin: 0 0 4px 0; }
    .section { margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
    th, td { border: 1px solid #e5e7eb; padding: 6px; text-align: left; vertical-align: top; }
    th { background: ${BRAND_BLUE}; color: #ffffff; font-weight: 600; -webkit-print-color-adjust: exact; }
    code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 11px; }
    ul { padding-left: 18px; }
    ol { padding-left: 20px; }
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
  </style>
</head>
<body>
  <div class="cover-page">
    ${headerLogoDataUri ? `<img class="cover-logo" src="${headerLogoDataUri}" alt="SSA &amp; Company" />` : ''}
    <h1>${params.title}</h1>
    ${params.meta.map((m) => `<div class="meta">${m}</div>`).join('')}
  </div>
  ${params.body}
</body>
</html>
`;

export async function exportResearchPdf(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const visibilityWhere = buildVisibilityWhere(req.auth);
    const job = await prisma.researchJob.findFirst({
      where: { AND: [{ id }, visibilityWhere] },
      include: {
        subJobs: {
          select: { stage: true, status: true, lastError: true, output: true }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Research job not found' });
    }

    if (!isExportReady(job.status)) {
      return res.status(400).json({ error: 'Report is not ready to export yet' });
    }

    const dateStr = new Date(job.createdAt).toISOString().slice(0, 10);
    const sanitize = (name: string) =>
      name.replace(/[^a-zA-Z0-9_\-. ]/g, '').replace(/\s+/g, '_');
    const sanitized = sanitize(job.companyName) || 'report';
    const filename = `${sanitized}-${dateStr}.pdf`;

    const blueprint = getReportBlueprint(job.reportType || 'GENERIC');
    const exportSections = buildExportSections({
      job,
      subJobs: job.subJobs,
      blueprint,
      fallbackOrder: sectionOrder
    });

    const markdown = buildResearchMarkdown({
      companyName: job.companyName,
      geography: job.geography,
      industry: job.industry,
      date: dateStr,
      exportSections,
      skipTitleBlock: true,
    });
    const htmlBody = marked.parse(markdown);

    const html = htmlTemplate({
      title: job.companyName,
      meta: [
        `Geography: ${job.geography || 'N/A'}`,
        `Industry: ${job.industry || 'N/A'}`,
        `Date: ${dateStr}`
      ],
      body: htmlBody as string
    });

    let browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
    } catch (err) {
      console.error('Playwright launch failed:', err);
      return res.status(500).json({ error: 'PDF export unavailable: browser failed to start' });
    }

    try {
      const page = await browser.newPage({
        viewport: { width: 1200, height: 1800 }
      });

      await page.setContent(html, { waitUntil: 'networkidle', timeout: 30000 });

      // Shared PDF options — bottom margin accommodates the wave background
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
        // Merge cover + body
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

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(pdfBuffer);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return res.status(500).json({
      error: 'Failed to export PDF',
      message: safeErrorMessage(error)
    });
  }
}
