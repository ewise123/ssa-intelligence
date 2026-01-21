/**
 * PDF Export Service
 * Generates print-ready PDF digests of news articles using PDFKit
 */

import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma.js';

interface ExportOptions {
  revenueOwnerId: string;
  dateFrom?: Date;
  dateTo?: Date;
  priorityFilter?: ('high' | 'medium' | 'low')[];
}

export async function generateNewsDigestPDF(options: ExportOptions): Promise<Buffer> {
  const { revenueOwnerId, dateFrom, dateTo, priorityFilter } = options;

  // Fetch revenue owner
  const owner = await prisma.revenueOwner.findUnique({
    where: { id: revenueOwnerId },
  });

  if (!owner) {
    throw new Error('Revenue owner not found');
  }

  // Build date filter
  const defaultDateFrom = new Date();
  defaultDateFrom.setDate(defaultDateFrom.getDate() - 7);

  // Fetch articles for this owner
  const articles = await prisma.newsArticle.findMany({
    where: {
      revenueOwners: { some: { revenueOwnerId } },
      publishedAt: {
        gte: dateFrom || defaultDateFrom,
        lte: dateTo || new Date(),
      },
      ...(priorityFilter && priorityFilter.length > 0 && {
        priority: { in: priorityFilter },
      }),
    },
    include: {
      company: true,
      person: true,
      tag: true,
    },
    orderBy: [
      { priority: 'asc' }, // high, medium, low
      { publishedAt: 'desc' },
    ],
  });

  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `News Intelligence Digest - ${owner.name}`,
      Author: 'SSA Intelligence',
      CreationDate: new Date(),
    },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  // ═══════════════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════════════

  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text('News Intelligence Digest', { align: 'center' });

  doc.moveDown(0.5);

  doc.fontSize(14)
     .font('Helvetica')
     .text(`Prepared for: ${owner.name}`, { align: 'center' });

  doc.fontSize(10)
     .fillColor('#666666')
     .text(`Generated: ${new Date().toLocaleDateString('en-US', {
       weekday: 'long',
       year: 'numeric',
       month: 'long',
       day: 'numeric',
     })}`, { align: 'center' });

  doc.fillColor('#000000');
  doc.moveDown(1);

  // Divider line
  doc.moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .stroke('#cccccc');
  doc.moveDown(1);

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY STATS
  // ═══════════════════════════════════════════════════════════════════

  const highCount = articles.filter(a => a.priority === 'high').length;
  const mediumCount = articles.filter(a => a.priority === 'medium').length;
  const lowCount = articles.filter(a => a.priority === 'low').length;

  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Summary');
  doc.moveDown(0.3);

  doc.fontSize(10)
     .font('Helvetica')
     .text(`Total Articles: ${articles.length}`)
     .text(`High Priority: ${highCount}`)
     .text(`Medium Priority: ${mediumCount}`)
     .text(`Low Priority: ${lowCount}`);

  doc.moveDown(1);

  // ═══════════════════════════════════════════════════════════════════
  // ARTICLES BY PRIORITY
  // ═══════════════════════════════════════════════════════════════════

  const priorityGroups = [
    { label: 'HIGH PRIORITY', priority: 'high', articles: articles.filter(a => a.priority === 'high'), color: '#dc2626' },
    { label: 'MEDIUM PRIORITY', priority: 'medium', articles: articles.filter(a => a.priority === 'medium'), color: '#d97706' },
    { label: 'LOW PRIORITY', priority: 'low', articles: articles.filter(a => a.priority === 'low'), color: '#059669' },
  ];

  for (const group of priorityGroups) {
    if (group.articles.length === 0) continue;

    // Check if we need a new page
    if (doc.y > 700) {
      doc.addPage();
    }

    // Section header with colored bar
    doc.rect(50, doc.y, 495, 20)
       .fill(group.color);

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#ffffff')
       .text(group.label, 55, doc.y - 15);

    doc.fillColor('#000000');
    doc.moveDown(1.2);

    for (const article of group.articles) {
      // Check for page break
      if (doc.y > 680) {
        doc.addPage();
      }

      // Company & Tag badges
      const badges = [
        article.company?.name,
        article.tag?.name,
      ].filter(Boolean).join(' | ');

      if (badges) {
        doc.fontSize(8)
           .fillColor('#666666')
           .text(badges.toUpperCase());
      }

      // Match type indicator
      if (article.matchType) {
        doc.fontSize(7)
           .fillColor(article.matchType === 'exact' ? '#2563eb' : '#7c3aed')
           .text(`[${article.matchType.toUpperCase()} MATCH]`, { continued: false });
      }

      // Headline
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(article.headline);

      // Summary
      if (article.summary) {
        doc.fontSize(9)
           .font('Helvetica')
           .text(article.summary);
      }

      // Why it matters
      if (article.whyItMatters) {
        doc.fontSize(9)
           .font('Helvetica-Oblique')
           .fillColor('#0066cc')
           .text(`Why it matters: ${article.whyItMatters}`);
      }

      // Source & date
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString()
        : 'Unknown date';
      const sourceInfo = `${article.sourceName || 'Unknown source'} | ${pubDate}`;

      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#999999')
         .text(sourceInfo);

      // Source URL
      if (article.sourceUrl) {
        doc.fontSize(7)
           .fillColor('#0066cc')
           .text(article.sourceUrl, { link: article.sourceUrl });
      }

      doc.fillColor('#000000');
      doc.moveDown(1);
    }

    doc.moveDown(0.5);
  }

  // ═══════════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════════

  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8)
       .fillColor('#999999')
       .text(
         `Page ${i + 1} of ${pageCount} | Generated by SSA Intelligence`,
         50,
         doc.page.height - 30,
         { align: 'center', width: 495 }
       );
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
