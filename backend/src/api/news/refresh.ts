/**
 * News Refresh API Route
 * POST /api/news/refresh - Trigger hybrid news fetch (Layer 1 RSS/API + Layer 2 Claude)
 * GET /api/news/refresh/status - Get refresh status
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { fetchNewsHybrid, CallDietInput } from '../../services/news-fetcher.js';
import { ArticleStatus, MatchType, FetchLayer } from '@prisma/client';

const router = Router();

// Refresh status interface
interface RefreshState {
  isRefreshing: boolean;
  startedAt?: string | null;  // Track when refresh started for stale detection
  lastRefreshedAt: string | null;
  lastError: string | null;
  articlesFound: number;
  coverageGaps: { company: string; note: string }[];
  progress: number;
  progressMessage: string;
  currentStep: string;
  steps: { step: string; status: 'pending' | 'in_progress' | 'completed' | 'error'; detail?: string }[];
  stats: {
    layer1Articles: number;
    layer2Articles: number;
    totalRaw: number;
    afterDedup: number;
    afterProcessing: number;
  } | null;
}

const DEFAULT_STATE: RefreshState = {
  isRefreshing: false,
  lastRefreshedAt: null,
  lastError: null,
  articlesFound: 0,
  coverageGaps: [],
  progress: 0,
  progressMessage: '',
  currentStep: '',
  steps: [],
  stats: null,
};

// Database-backed refresh status (works across multiple instances)
async function getRefreshState(): Promise<RefreshState> {
  try {
    const config = await prisma.newsConfig.findUnique({
      where: { key: 'refresh_status' },
    });
    if (config) {
      return JSON.parse(config.value);
    }
  } catch (err) {
    console.error('[refresh] Error reading refresh state:', err);
  }
  return { ...DEFAULT_STATE };
}

async function setRefreshState(state: RefreshState): Promise<void> {
  try {
    await prisma.newsConfig.upsert({
      where: { key: 'refresh_status' },
      create: { key: 'refresh_status', value: JSON.stringify(state) },
      update: { value: JSON.stringify(state) },
    });
  } catch (err) {
    console.error('[refresh] Error saving refresh state:', err);
  }
}

// GET /api/news/refresh/status - Get current refresh status
router.get('/status', async (req: Request, res: Response) => {
  const state = await getRefreshState();
  res.json(state);
});

// POST /api/news/refresh - Trigger news fetch
router.post('/', async (req: Request, res: Response) => {
  // Extract days parameter (default to 1 day)
  const { days = 1 } = req.body || {};
  const daysNum = Math.min(Math.max(Number(days) || 1, 1), 30); // Clamp between 1-30

  // Check current state from database
  let refreshState = await getRefreshState();

  // Prevent concurrent refreshes, but auto-recover from stuck refreshes
  if (refreshState.isRefreshing) {
    // Check if refresh has been stuck for more than 10 minutes (likely crashed/killed on Render)
    const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
    const startedAt = refreshState.startedAt ? new Date(refreshState.startedAt).getTime() : 0;
    const refreshAge = startedAt ? Date.now() - startedAt : Infinity;

    if (refreshAge > STALE_THRESHOLD_MS) {
      console.log('[refresh] Detected stale refresh (started', Math.round(refreshAge / 60000), 'min ago), auto-recovering...');
      // Mark as failed and allow new refresh
      refreshState.isRefreshing = false;
      refreshState.lastError = 'Previous refresh timed out';
      refreshState.steps = refreshState.steps.map(step => ({
        ...step,
        status: step.status === 'in_progress' ? 'error' : step.status,
      }));
      await setRefreshState(refreshState);
    } else {
      res.status(409).json({
        error: 'Refresh already in progress',
        status: refreshState,
      });
      return;
    }
  }

  // Initialize refresh state
  refreshState = {
    ...DEFAULT_STATE,
    isRefreshing: true,
    startedAt: new Date().toISOString(),  // Track start time for stale detection
    progress: 0,
    progressMessage: 'Starting...',
    currentStep: 'init',
    steps: [
      { step: 'Loading revenue owners', status: 'in_progress' },
      { step: 'Layer 1: RSS feeds & APIs', status: 'pending' },
      { step: 'Layer 2: AI web search', status: 'pending' },
      { step: 'Combining & deduplicating', status: 'pending' },
      { step: 'AI processing & categorization', status: 'pending' },
      { step: 'Saving to database', status: 'pending' },
    ],
  };
  await setRefreshState(refreshState);

  try {
    // Get all revenue owners with their call diets
    const revenueOwners = await prisma.revenueOwner.findMany({
      include: {
        companies: {
          include: { company: true },
        },
        people: {
          include: { person: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    // If no revenue owners, nothing to fetch
    if (revenueOwners.length === 0) {
      refreshState.isRefreshing = false;
      refreshState.lastRefreshedAt = new Date().toISOString();
      refreshState.articlesFound = 0;
      refreshState.coverageGaps = [];
      refreshState.progress = 100;
      refreshState.progressMessage = 'Complete';
      await setRefreshState(refreshState);

      res.json({
        success: true,
        articlesFound: 0,
        coverageGaps: [],
        message: 'No revenue owners configured. Add revenue owners with companies/people to track.',
      });
      return;
    }

    // Format call diets for the hybrid fetcher
    const callDiets: CallDietInput[] = revenueOwners.map(ro => ({
      revenueOwnerId: ro.id,
      revenueOwnerName: ro.name,
      companies: ro.companies.map(c => ({
        name: c.company.name,
        ticker: c.company.ticker || undefined,
      })),
      people: ro.people.map(p => ({
        name: p.person.name,
        title: p.person.title || undefined,
      })),
      topics: ro.tags.map(t => t.tag.name),
    }));

    // Mark revenue owners step complete
    refreshState.steps[0].status = 'completed';
    refreshState.steps[0].detail = `${revenueOwners.length} owner(s), ${callDiets.reduce((sum, cd) => sum + cd.companies.length, 0)} companies`;
    await setRefreshState(refreshState);

    console.log('[refresh] Starting hybrid news fetch for', callDiets.length, 'revenue owners');

    // Progress callback with step tracking - saves to database
    const onProgress = async (progress: number, message: string, stepUpdate?: { index: number; status: 'in_progress' | 'completed' | 'error'; detail?: string }) => {
      refreshState.progress = progress;
      refreshState.progressMessage = message;

      if (stepUpdate) {
        refreshState.steps[stepUpdate.index].status = stepUpdate.status;
        if (stepUpdate.detail) {
          refreshState.steps[stepUpdate.index].detail = stepUpdate.detail;
        }
      }
      await setRefreshState(refreshState);
    };

    // Fetch news via hybrid approach
    const result = await fetchNewsHybrid(callDiets, onProgress, daysNum);

    console.log('[refresh] Got', result.articles.length, 'articles');

    // Filter out tag-only articles (must have a company or person match)
    const filteredArticles = result.articles.filter(
      article => article.company || article.person
    );
    console.log('[refresh] After filtering tag-only:', filteredArticles.length, 'articles');

    // Save articles to database
    refreshState.steps[5].status = 'in_progress';
    refreshState.progress = 92;
    refreshState.progressMessage = `Saving ${filteredArticles.length} articles to database...`;
    await setRefreshState(refreshState);

    let savedCount = 0;
    for (const article of filteredArticles) {
      try {
        // Find matching company
        let companyId: string | null = null;
        if (article.company) {
          const company = await prisma.trackedCompany.findFirst({
            where: { name: { equals: article.company, mode: 'insensitive' } },
          });
          companyId = company?.id || null;
        }

        // Find matching person
        let personId: string | null = null;
        if (article.person) {
          const person = await prisma.trackedPerson.findFirst({
            where: { name: { equals: article.person, mode: 'insensitive' } },
          });
          personId = person?.id || null;
        }

        // Find matching tag by category name
        const tag = await prisma.newsTag.findFirst({
          where: { name: { equals: article.category, mode: 'insensitive' } },
        });

        // Map matchType and fetchLayer to Prisma enums
        const matchType = article.matchType === 'exact' ? MatchType.exact :
                         article.matchType === 'contextual' ? MatchType.contextual : null;

        const fetchLayer = article.fetchLayer === 'layer1_rss' ? FetchLayer.layer1_rss :
                          article.fetchLayer === 'layer1_api' ? FetchLayer.layer1_api :
                          article.fetchLayer === 'layer2_llm' ? FetchLayer.layer2_llm : null;

        // Upsert article (update if URL exists, create if new)
        const savedArticle = await prisma.newsArticle.upsert({
          where: { sourceUrl: article.sourceUrl },
          create: {
            headline: article.headline,
            shortSummary: article.shortSummary,
            longSummary: article.longSummary,
            summary: article.summary, // Legacy field
            whyItMatters: article.whyItMatters,
            sourceUrl: article.sourceUrl,
            sourceName: article.sourceName,
            publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
            companyId,
            personId,
            tagId: tag?.id || null,
            status: ArticleStatus.new_article,
            matchType,
            fetchLayer,
          },
          update: {
            shortSummary: article.shortSummary,
            longSummary: article.longSummary,
            summary: article.summary,
            whyItMatters: article.whyItMatters,
            status: ArticleStatus.update,
          },
        });

        // Save additional sources for merged stories
        if (article.sources && article.sources.length > 0) {
          for (const source of article.sources) {
            const sourceFetchLayer = source.fetchLayer === 'layer1_rss' ? FetchLayer.layer1_rss :
                                     source.fetchLayer === 'layer1_api' ? FetchLayer.layer1_api :
                                     source.fetchLayer === 'layer2_llm' ? FetchLayer.layer2_llm : null;

            await prisma.articleSource.upsert({
              where: {
                articleId_sourceUrl: {
                  articleId: savedArticle.id,
                  sourceUrl: source.sourceUrl,
                },
              },
              create: {
                articleId: savedArticle.id,
                sourceUrl: source.sourceUrl,
                sourceName: source.sourceName,
                fetchLayer: sourceFetchLayer,
              },
              update: {
                sourceName: source.sourceName,
                fetchLayer: sourceFetchLayer,
              },
            });
          }
        }

        // Link to revenue owners
        for (const ownerName of article.revenueOwners) {
          const owner = revenueOwners.find(
            ro => ro.name.toLowerCase() === ownerName.toLowerCase()
          );
          if (owner) {
            await prisma.articleRevenueOwner.upsert({
              where: {
                articleId_revenueOwnerId: {
                  articleId: savedArticle.id,
                  revenueOwnerId: owner.id,
                },
              },
              create: {
                articleId: savedArticle.id,
                revenueOwnerId: owner.id,
              },
              update: {},
            });
          }
        }

        savedCount++;
      } catch (articleError) {
        console.error('[refresh] Error saving article:', article.headline, articleError);
      }
    }

    // Update refresh state
    refreshState.steps[5].status = 'completed';
    refreshState.steps[5].detail = `${savedCount} articles saved`;
    refreshState.isRefreshing = false;
    refreshState.lastRefreshedAt = new Date().toISOString();
    refreshState.articlesFound = savedCount;
    refreshState.coverageGaps = result.coverageGaps;
    refreshState.progress = 100;
    refreshState.progressMessage = 'Complete';
    refreshState.stats = result.stats || null;
    await setRefreshState(refreshState);

    res.json({
      success: true,
      articlesFound: savedCount,
      coverageGaps: result.coverageGaps,
      stats: result.stats,
    });
  } catch (error) {
    console.error('[refresh] Error:', error);

    refreshState.isRefreshing = false;
    refreshState.lastError = error instanceof Error ? error.message : 'Unknown error';
    refreshState.progress = 0;
    refreshState.progressMessage = 'Failed';
    // Mark any in_progress steps as error so spinners don't get stuck
    refreshState.steps = refreshState.steps.map(step => ({
      ...step,
      status: step.status === 'in_progress' ? 'error' : step.status,
    }));
    await setRefreshState(refreshState);

    res.status(500).json({
      success: false,
      error: refreshState.lastError,
    });
  }
});

export default router;
