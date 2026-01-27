/**
 * News Articles API Routes
 * GET /api/news/articles - List articles with filters
 * GET /api/news/articles/:id - Get article detail
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

const router = Router();

// GET /api/news/articles - List articles with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      revenueOwnerId,
      companyId,
      personId,
      tagId,
      isSent,
      isArchived,
      limit = '50',
      offset = '0',
    } = req.query;

    // Build where clause
    const where: any = {};

    // Filter by revenue owner
    if (revenueOwnerId) {
      where.revenueOwners = {
        some: { revenueOwnerId: revenueOwnerId as string },
      };
    }

    // Filter by company
    if (companyId) {
      where.companyId = companyId as string;
    }

    // Filter by person
    if (personId) {
      where.personId = personId as string;
    }

    // Filter by tag
    if (tagId) {
      where.tagId = tagId as string;
    }

    // Filter by sent status
    if (isSent !== undefined) {
      where.isSent = isSent === 'true';
    }

    // Filter by archived status
    // Sent and Archived are mutually exclusive
    // - If isArchived is explicitly passed, use it
    // - If isSent is passed (without isArchived), show sent articles regardless of archive status
    // - If neither passed, show all articles (no filter = "All" status)
    if (isArchived !== undefined) {
      where.isArchived = isArchived === 'true';
    }
    // No default filter - "All" shows everything

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        orderBy: [
          { publishedAt: 'desc' },
          { fetchedAt: 'desc' },
        ],
        take: Math.min(parseInt(limit as string, 10), 100),
        skip: parseInt(offset as string, 10),
        include: {
          company: true,
          person: true,
          tag: true,
          sources: true, // Include all sources for merged stories
          revenueOwners: {
            include: {
              revenueOwner: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      }),
      prisma.newsArticle.count({ where }),
    ]);

    // Transform for easier consumption
    const transformedArticles = articles.map(article => ({
      id: article.id,
      headline: article.headline,
      shortSummary: article.shortSummary,
      longSummary: article.longSummary,
      summary: article.summary,
      whyItMatters: article.whyItMatters,
      sourceUrl: article.sourceUrl,
      sourceName: article.sourceName,
      sources: article.sources, // All sources for merged stories
      publishedAt: article.publishedAt,
      fetchedAt: article.fetchedAt,
      status: article.status,
      isSent: article.isSent,
      isArchived: article.isArchived,
      company: article.company,
      person: article.person,
      tag: article.tag,
      revenueOwners: article.revenueOwners.map(ro => ro.revenueOwner),
    }));

    res.json({
      articles: transformedArticles,
      total,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/news/articles/:id - Get single article detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await prisma.newsArticle.findUnique({
      where: { id },
      include: {
        company: true,
        person: true,
        tag: true,
        revenueOwners: {
          include: {
            revenueOwner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    res.json({
      ...article,
      revenueOwners: article.revenueOwners.map(ro => ro.revenueOwner),
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// PATCH /api/news/articles/:id/sent - Toggle isSent status
// Sent and Archived are mutually exclusive - sending un-archives
router.patch('/:id/sent', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isSent } = req.body;

    const article = await prisma.newsArticle.findUnique({ where: { id } });
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // If isSent is provided, use it; otherwise toggle current value
    const newIsSent = typeof isSent === 'boolean' ? isSent : !article.isSent;

    // Sent and Archived are mutually exclusive
    const updated = await prisma.newsArticle.update({
      where: { id },
      data: {
        isSent: newIsSent,
        isArchived: newIsSent ? false : article.isArchived, // Un-archive if marking as sent
      },
    });

    res.json({ success: true, isSent: updated.isSent });
  } catch (error) {
    console.error('Error updating article sent status:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// PATCH /api/news/articles/:id/archive - Toggle or set isArchived status
// Sent and Archived are mutually exclusive - archiving un-sends
router.patch('/:id/archive', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;

    const article = await prisma.newsArticle.findUnique({ where: { id } });
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // If isArchived is provided, use it; otherwise toggle current value
    const newIsArchived = typeof isArchived === 'boolean' ? isArchived : !article.isArchived;

    // Sent and Archived are mutually exclusive
    const updated = await prisma.newsArticle.update({
      where: { id },
      data: {
        isArchived: newIsArchived,
        isSent: newIsArchived ? false : article.isSent, // Un-send if archiving
      },
    });

    res.json({ success: true, isArchived: updated.isArchived });
  } catch (error) {
    console.error('Error updating article archive status:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// POST /api/news/articles/bulk-archive - Archive multiple articles
// Sent and Archived are mutually exclusive - archiving un-sends
router.post('/bulk-archive', async (req: Request, res: Response) => {
  try {
    const { articleIds } = req.body;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      res.status(400).json({ error: 'articleIds must be a non-empty array' });
      return;
    }

    const result = await prisma.newsArticle.updateMany({
      where: { id: { in: articleIds } },
      data: { isArchived: true, isSent: false },
    });

    res.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error bulk archiving articles:', error);
    res.status(500).json({ error: 'Failed to archive articles' });
  }
});

// POST /api/news/articles/bulk-send - Mark multiple articles as sent
// Sent and Archived are mutually exclusive - sending un-archives
router.post('/bulk-send', async (req: Request, res: Response) => {
  try {
    const { articleIds } = req.body;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      res.status(400).json({ error: 'articleIds must be a non-empty array' });
      return;
    }

    const result = await prisma.newsArticle.updateMany({
      where: { id: { in: articleIds } },
      data: { isSent: true, isArchived: false },
    });

    res.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error bulk sending articles:', error);
    res.status(500).json({ error: 'Failed to send articles' });
  }
});

// DELETE /api/news/articles/:id - Delete an article
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await prisma.newsArticle.findUnique({ where: { id } });
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    await prisma.newsArticle.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
