/**
 * News Articles API Routes
 * GET /api/news/articles - List articles with filters
 * GET /api/news/articles/:id - Get article detail
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ArticlePriority } from '@prisma/client';

const router = Router();

// GET /api/news/articles - List articles with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      revenueOwnerId,
      companyId,
      personId,
      tagId,
      priority,
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

    // Filter by priority
    if (priority && ['high', 'medium', 'low'].includes(priority as string)) {
      where.priority = priority as ArticlePriority;
    }

    // Filter by sent status
    if (isSent !== undefined) {
      where.isSent = isSent === 'true';
    }

    // Filter by archived status (defaults to false if not specified)
    if (isArchived !== undefined) {
      where.isArchived = isArchived === 'true';
    } else {
      // Default: show non-archived articles
      where.isArchived = false;
    }

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        orderBy: [
          { priorityScore: 'desc' }, // Sort by priorityScore (highest first)
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
      priority: article.priority,
      priorityScore: article.priorityScore,
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

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: { isSent: newIsSent },
    });

    res.json({ success: true, isSent: updated.isSent });
  } catch (error) {
    console.error('Error updating article sent status:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// PATCH /api/news/articles/:id/archive - Toggle or set isArchived status
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

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: { isArchived: newIsArchived },
    });

    res.json({ success: true, isArchived: updated.isArchived });
  } catch (error) {
    console.error('Error updating article archive status:', error);
    res.status(500).json({ error: 'Failed to update article' });
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
