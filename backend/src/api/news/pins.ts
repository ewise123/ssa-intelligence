/**
 * News Article Pinning API Routes
 * POST /api/news/articles/pin-from-data - Save search result to DB and pin
 * POST /api/news/articles/:id/pin - Pin article for current user
 * DELETE /api/news/articles/:id/pin - Unpin article for current user
 * GET /api/news/pins - Get current user's pinned article IDs
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ArticleStatus, MatchType, FetchLayer } from '@prisma/client';

const router = Router();

// GET /api/news/pins - Get current user's pinned article IDs
router.get('/pins', async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const pins = await prisma.userPinnedArticle.findMany({
      where: { userId: req.auth.userId },
      select: { articleId: true },
    });

    res.json({ articleIds: pins.map(p => p.articleId) });
  } catch (error) {
    console.error('Error fetching pins:', error);
    res.status(500).json({ error: 'Failed to fetch pins' });
  }
});

// POST /api/news/articles/pin-from-data - Save a search result to DB and pin it
router.post('/articles/pin-from-data', async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      headline,
      sourceUrl,
      sourceName,
      company,
      person,
      category,
      shortSummary,
      longSummary,
      summary,
      whyItMatters,
      publishedAt,
      matchType,
      fetchLayer,
    } = req.body;

    if (!headline || !sourceUrl) {
      res.status(400).json({ error: 'headline and sourceUrl are required' });
      return;
    }

    // Resolve companyId from TrackedCompany by name (case-insensitive)
    let companyId: string | null = null;
    if (company) {
      const found = await prisma.trackedCompany.findFirst({
        where: { name: { equals: company, mode: 'insensitive' } },
      });
      companyId = found?.id ?? null;
    }

    // Resolve personId from TrackedPerson by name (case-insensitive)
    let personId: string | null = null;
    if (person) {
      const found = await prisma.trackedPerson.findFirst({
        where: { name: { equals: person, mode: 'insensitive' } },
      });
      personId = found?.id ?? null;
    }

    // Resolve tagId from NewsTag by category name
    let tagId: string | null = null;
    if (category) {
      const found = await prisma.newsTag.findUnique({
        where: { name: category },
      });
      tagId = found?.id ?? null;
    }

    // Map string enums to Prisma enums
    const prismaMatchType: MatchType | null =
      matchType === 'exact' ? MatchType.exact :
      matchType === 'contextual' ? MatchType.contextual :
      null;

    const prismaFetchLayer: FetchLayer | null =
      fetchLayer === 'layer1_rss' ? FetchLayer.layer1_rss :
      fetchLayer === 'layer1_api' ? FetchLayer.layer1_api :
      fetchLayer === 'layer2_llm' ? FetchLayer.layer2_llm :
      null;

    // Upsert article by sourceUrl (same pattern as refresh save)
    const savedArticle = await prisma.newsArticle.upsert({
      where: { sourceUrl },
      create: {
        headline,
        shortSummary: shortSummary ?? null,
        longSummary: longSummary ?? null,
        summary: summary ?? null,
        whyItMatters: whyItMatters ?? null,
        sourceUrl,
        sourceName: sourceName ?? null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        companyId,
        personId,
        tagId,
        status: ArticleStatus.new_article,
        matchType: prismaMatchType,
        fetchLayer: prismaFetchLayer,
      },
      update: {
        shortSummary: shortSummary ?? undefined,
        longSummary: longSummary ?? undefined,
        summary: summary ?? undefined,
        whyItMatters: whyItMatters ?? undefined,
      },
    });

    // Create ArticleUser link so the article appears in the user's feed
    await prisma.articleUser.upsert({
      where: {
        articleId_userId: {
          articleId: savedArticle.id,
          userId: req.auth.userId,
        },
      },
      create: {
        articleId: savedArticle.id,
        userId: req.auth.userId,
      },
      update: {},
    });

    // Pin the article for the current user
    await prisma.userPinnedArticle.upsert({
      where: {
        userId_articleId: {
          userId: req.auth.userId,
          articleId: savedArticle.id,
        },
      },
      create: {
        userId: req.auth.userId,
        articleId: savedArticle.id,
      },
      update: {},
    });

    res.status(201).json({ success: true, articleId: savedArticle.id });
  } catch (error) {
    console.error('Error pinning article from data:', error);
    res.status(500).json({ error: 'Failed to save and pin article' });
  }
});

// POST /api/news/articles/:id/pin - Pin article for current user
router.post('/articles/:id/pin', async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id: articleId } = req.params;

    const article = await prisma.newsArticle.findUnique({ where: { id: articleId } });
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    await prisma.userPinnedArticle.upsert({
      where: {
        userId_articleId: {
          userId: req.auth.userId,
          articleId,
        },
      },
      create: {
        userId: req.auth.userId,
        articleId,
      },
      update: {},
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error pinning article:', error);
    res.status(500).json({ error: 'Failed to pin article' });
  }
});

// DELETE /api/news/articles/:id/pin - Unpin article for current user
router.delete('/articles/:id/pin', async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id: articleId } = req.params;

    await prisma.userPinnedArticle.delete({
      where: {
        userId_articleId: {
          userId: req.auth.userId,
          articleId,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error unpinning article:', error);
    res.status(500).json({ error: 'Failed to unpin article' });
  }
});

export default router;
