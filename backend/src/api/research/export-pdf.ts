import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { chromium } from 'playwright';
import { marked } from 'marked';
import { formatSectionContent, sectionOrder } from '../../services/section-formatter.js';
import { buildVisibilityWhere } from '../../middleware/auth.js';

const htmlTemplate = (params: { title: string; meta: string[]; body: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 40px 32px 40px 32px; }
    body { font-family: "Inter", "Helvetica Neue", Arial, sans-serif; color: #111827; }
    h1 { font-size: 28px; margin: 0 0 8px 0; }
    h2 { font-size: 20px; margin: 24px 0 8px 0; }
    h3 { font-size: 16px; margin: 18px 0 6px 0; }
    p, li { font-size: 12px; line-height: 1.5; color: #1f2937; }
    .meta { color: #4b5563; font-size: 11px; line-height: 1.4; margin: 0 0 4px 0; }
    .section { margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
    th, td { border: 1px solid #e5e7eb; padding: 6px; text-align: left; vertical-align: top; }
    th { background: #f9fafb; font-weight: 600; }
    code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 11px; }
    ul { padding-left: 18px; }
    ol { padding-left: 20px; }
  </style>
</head>
<body>
  <div style="margin-bottom:16px;">
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
          select: { stage: true, status: true, lastError: true }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Research job not found' });
    }

    if (job.status !== 'completed' && job.status !== 'failed') {
      return res.status(400).json({ error: 'Report is not ready to export yet' });
    }

    const dateStr = new Date(job.createdAt).toISOString().slice(0, 10);
    const filename = `${job.companyName.replace(/\s+/g, '_')}-${dateStr}.pdf`;

    // Build Markdown using the formatter (mirrors frontend)
    const chunks: string[] = [];

    sectionOrder.forEach(({ id: sectionId, title, field }) => {
      const data = job[field as keyof typeof job];
      const status = job.subJobs.find((s) => s.stage === sectionId)?.status || 'unknown';
      chunks.push(`## ${title}`);
      chunks.push(`_Status: ${status}_`);
      const formatted = formatSectionContent(sectionId as any, data);
      if (formatted && formatted.trim().length) {
        chunks.push(formatted);
      } else {
        chunks.push('_No content generated for this section._');
      }
      chunks.push('');
    });

    const markdown = chunks.join('\n');
    const htmlBody = marked.parse(markdown);

    const html = htmlTemplate({
      title: job.companyName,
      meta: [
        `Geography: ${job.geography || 'N/A'}`,
        `Industry: ${job.industry || 'N/A'}`,
        `Status: ${job.status}`,
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

    const page = await browser.newPage({
      viewport: { width: 1200, height: 1800 }
    });

    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: { top: '40px', bottom: '40px', left: '32px', right: '32px' },
      printBackground: true
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return res.status(500).json({
      error: 'Failed to export PDF',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
