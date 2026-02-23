/**
 * News Export API Routes
 * GET /api/news/export/pdf/:userId - Export as PDF for a user
 * GET /api/news/export/markdown/:userId - Export as Markdown for a user
 * GET /api/news/export/docx/:userId - Export as DOCX for a user
 * GET /api/news/export/pdf?articleIds=id1,id2 - Export specific articles as PDF
 * GET /api/news/export/markdown?articleIds=id1,id2 - Export specific articles as Markdown
 * GET /api/news/export/docx?articleIds=id1,id2 - Export specific articles as DOCX
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { generateNewsDigestPDF } from '../../services/pdf-export.js';
import { generateNewsDigestMarkdown } from '../../services/markdown-export.js';
import { generateNewsDigestDocx } from '../../services/news-docx-export.js';

const router = Router();

// GET /api/news/export/pdf/:userId - Export user's articles as PDF
router.get('/pdf/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;

    // Auth: scoped to self or admin
    if (req.auth && !req.auth.isAdmin && req.auth.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const dateFrom = from ? new Date(from as string) : undefined;
    const dateTo = to ? new Date(to as string) : undefined;

    const pdf = await generateNewsDigestPDF({
      userId,
      dateFrom,
      dateTo,
    });

    const filename = `sami-news-digest-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (error) {
    console.error('PDF export error:', error);
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// GET /api/news/export/markdown/:userId - Export user's articles as Markdown
router.get('/markdown/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;

    if (req.auth && !req.auth.isAdmin && req.auth.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const dateFrom = from ? new Date(from as string) : undefined;
    const dateTo = to ? new Date(to as string) : undefined;

    const markdown = await generateNewsDigestMarkdown({
      userId,
      dateFrom,
      dateTo,
    });

    const filename = `sami-news-digest-${new Date().toISOString().split('T')[0]}.md`;
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(markdown);
  } catch (error) {
    console.error('Markdown export error:', error);
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to generate Markdown' });
  }
});

// GET /api/news/export/pdf?articleIds=id1,id2 - Export specific articles as PDF
router.get('/pdf', async (req: Request, res: Response) => {
  try {
    const { articleIds } = req.query;

    if (!articleIds || typeof articleIds !== 'string') {
      res.status(400).json({ error: 'articleIds query parameter is required' });
      return;
    }

    const ids = articleIds.split(',').filter(Boolean);
    if (ids.length === 0) {
      res.status(400).json({ error: 'At least one articleId is required' });
      return;
    }

    // Non-admin: verify access to all requested articles
    if (req.auth && !req.auth.isAdmin) {
      const accessibleCount = await prisma.articleUser.count({
        where: { articleId: { in: ids }, userId: req.auth.userId },
      });
      if (accessibleCount !== ids.length) {
        res.status(403).json({ error: 'Access denied to one or more articles' });
        return;
      }
    }

    const pdf = await generateNewsDigestPDF({
      userId: req.auth?.userId,
      articleIds: ids,
    });

    const filename = `sami-news-digest-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// GET /api/news/export/markdown?articleIds=id1,id2 - Export specific articles as Markdown
router.get('/markdown', async (req: Request, res: Response) => {
  try {
    const { articleIds } = req.query;

    if (!articleIds || typeof articleIds !== 'string') {
      res.status(400).json({ error: 'articleIds query parameter is required' });
      return;
    }

    const ids = articleIds.split(',').filter(Boolean);
    if (ids.length === 0) {
      res.status(400).json({ error: 'At least one articleId is required' });
      return;
    }

    // Non-admin: verify access to all requested articles
    if (req.auth && !req.auth.isAdmin) {
      const accessibleCount = await prisma.articleUser.count({
        where: { articleId: { in: ids }, userId: req.auth.userId },
      });
      if (accessibleCount !== ids.length) {
        res.status(403).json({ error: 'Access denied to one or more articles' });
        return;
      }
    }

    const markdown = await generateNewsDigestMarkdown({
      userId: req.auth?.userId,
      articleIds: ids,
    });

    const filename = `sami-news-digest-${new Date().toISOString().split('T')[0]}.md`;
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(markdown);
  } catch (error) {
    console.error('Markdown export error:', error);
    res.status(500).json({ error: 'Failed to generate Markdown' });
  }
});

// GET /api/news/export/docx/:userId - Export user's articles as DOCX
router.get('/docx/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;

    if (req.auth && !req.auth.isAdmin && req.auth.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const dateFrom = from ? new Date(from as string) : undefined;
    const dateTo = to ? new Date(to as string) : undefined;

    const docx = await generateNewsDigestDocx({
      userId,
      dateFrom,
      dateTo,
    });

    const filename = `sami-news-digest-${new Date().toISOString().split('T')[0]}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docx);
  } catch (error) {
    console.error('DOCX export error:', error);
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to generate DOCX' });
  }
});

// GET /api/news/export/docx?articleIds=id1,id2 - Export specific articles as DOCX
router.get('/docx', async (req: Request, res: Response) => {
  try {
    const { articleIds } = req.query;

    if (!articleIds || typeof articleIds !== 'string') {
      res.status(400).json({ error: 'articleIds query parameter is required' });
      return;
    }

    const ids = articleIds.split(',').filter(Boolean);
    if (ids.length === 0) {
      res.status(400).json({ error: 'At least one articleId is required' });
      return;
    }

    // Non-admin: verify access to all requested articles
    if (req.auth && !req.auth.isAdmin) {
      const accessibleCount = await prisma.articleUser.count({
        where: { articleId: { in: ids }, userId: req.auth.userId },
      });
      if (accessibleCount !== ids.length) {
        res.status(403).json({ error: 'Access denied to one or more articles' });
        return;
      }
    }

    const docx = await generateNewsDigestDocx({
      userId: req.auth?.userId,
      articleIds: ids,
    });

    const filename = `sami-news-digest-${new Date().toISOString().split('T')[0]}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docx);
  } catch (error) {
    console.error('DOCX export error:', error);
    res.status(500).json({ error: 'Failed to generate DOCX' });
  }
});

// POST /api/news/export/:format/from-data - Export articles from request body (no DB lookup)
router.post('/:format/from-data', async (req: Request, res: Response) => {
  try {
    const { format } = req.params;
    if (!['pdf', 'markdown', 'docx'].includes(format)) {
      res.status(400).json({ error: 'Invalid format. Use pdf, markdown, or docx' });
      return;
    }

    const { articles } = req.body;
    if (!Array.isArray(articles) || articles.length === 0) {
      res.status(400).json({ error: 'articles array is required and must not be empty' });
      return;
    }

    // Resolve userName from auth context
    let userName = 'User';
    if (req.auth?.userId) {
      const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
      if (user) userName = user.name || user.email;
    }

    // Map flat search result shape → nested export shape
    const mapped = articles.map((a: any) => ({
      headline: a.headline || '',
      shortSummary: a.shortSummary || null,
      longSummary: a.longSummary || null,
      summary: a.summary || null,
      whyItMatters: a.whyItMatters || null,
      sourceUrl: a.sourceUrl || '',
      sourceName: a.sourceName || null,
      publishedAt: a.publishedAt || null,
      matchType: a.matchType || null,
      company: a.company?.name ? a.company : (typeof a.company === 'string' && a.company) ? { name: a.company } : null,
      person: a.person?.name ? a.person : (typeof a.person === 'string' && a.person) ? { name: a.person } : null,
      tag: a.tag?.name ? a.tag : (typeof a.category === 'string' && a.category) ? { name: a.category } : null,
    }));

    const exportOpts = { articles: mapped, userName };

    if (format === 'pdf') {
      const pdf = await generateNewsDigestPDF(exportOpts);
      const filename = `sami-deep-dive-${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdf);
    } else if (format === 'markdown') {
      const md = await generateNewsDigestMarkdown(exportOpts);
      const filename = `sami-deep-dive-${new Date().toISOString().split('T')[0]}.md`;
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(md);
    } else {
      const docx = await generateNewsDigestDocx(exportOpts);
      const filename = `sami-deep-dive-${new Date().toISOString().split('T')[0]}.docx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(docx);
    }
  } catch (error) {
    console.error('From-data export error:', error);
    res.status(500).json({ error: 'Failed to generate export' });
  }
});

export default router;
