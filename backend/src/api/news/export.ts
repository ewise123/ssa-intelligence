/**
 * News Export API Routes
 * GET /api/news/export/pdf/:ownerId - Export as PDF
 * GET /api/news/export/markdown/:ownerId - Export as Markdown
 */

import { Router, Request, Response } from 'express';
import { generateNewsDigestPDF } from '../../services/pdf-export.js';
import { generateNewsDigestMarkdown } from '../../services/markdown-export.js';

const router = Router();

// GET /api/news/export/pdf/:ownerId - Export as PDF
router.get('/pdf/:ownerId', async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
    const { from, to, priority } = req.query;

    // Parse query parameters
    const dateFrom = from ? new Date(from as string) : undefined;
    const dateTo = to ? new Date(to as string) : undefined;
    const priorityFilter = priority
      ? (priority as string).split(',') as ('high' | 'medium' | 'low')[]
      : undefined;

    const pdf = await generateNewsDigestPDF({
      revenueOwnerId: ownerId,
      dateFrom,
      dateTo,
      priorityFilter,
    });

    const filename = `news-digest-${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (error) {
    console.error('PDF export error:', error);

    if (error instanceof Error && error.message === 'Revenue owner not found') {
      res.status(404).json({ error: 'Revenue owner not found' });
      return;
    }

    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// GET /api/news/export/markdown/:ownerId - Export as Markdown
router.get('/markdown/:ownerId', async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
    const { from, to, priority } = req.query;

    // Parse query parameters
    const dateFrom = from ? new Date(from as string) : undefined;
    const dateTo = to ? new Date(to as string) : undefined;
    const priorityFilter = priority
      ? (priority as string).split(',') as ('high' | 'medium' | 'low')[]
      : undefined;

    const markdown = await generateNewsDigestMarkdown({
      revenueOwnerId: ownerId,
      dateFrom,
      dateTo,
      priorityFilter,
    });

    const filename = `news-digest-${new Date().toISOString().split('T')[0]}.md`;

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(markdown);
  } catch (error) {
    console.error('Markdown export error:', error);

    if (error instanceof Error && error.message === 'Revenue owner not found') {
      res.status(404).json({ error: 'Revenue owner not found' });
      return;
    }

    res.status(500).json({ error: 'Failed to generate Markdown' });
  }
});

export default router;
