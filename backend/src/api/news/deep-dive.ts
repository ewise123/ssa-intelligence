/**
 * Deep Dive Background Search API Route
 * POST /api/news/deep-dive - Start background deep dive search
 * GET /api/news/deep-dive/status - Poll search status
 * GET /api/news/deep-dive/articles - Fetch session results
 * POST /api/news/deep-dive/clear - Clear results (keep pinned)
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { fetchNewsHybrid, CallDietInput } from '../../services/news-fetcher.js';
import { ArticleStatus, MatchType, FetchLayer } from '@prisma/client';
import { safeErrorMessage } from '../../lib/error-utils.js';

const router = Router();

// ============================================================================
// Types
// ============================================================================

interface DeepDiveState {
  isSearching: boolean;
  startedAt: string | null;
  completedAt: string | null;
  lastError: string | null;
  articlesFound: number;
  progress: number;
  progressMessage: string;
  currentStep: 'init' | 'verifying' | 'searching' | 'saving' | 'complete' | 'error' | '';
  searchParams: { company?: string; person?: string; days: number } | null;
}

interface DeepDiveSession {
  articleIds: string[];
  searchParams: { company?: string; person?: string; days: number };
  completedAt: string;
}

const DEFAULT_STATE: DeepDiveState = {
  isSearching: false,
  startedAt: null,
  completedAt: null,
  lastError: null,
  articlesFound: 0,
  progress: 0,
  progressMessage: '',
  currentStep: '',
  searchParams: null,
};

// ============================================================================
// Helpers
// ============================================================================

function statusKey(userId: string) {
  return `deep_dive_status_${userId}`;
}

function sessionKey(userId: string) {
  return `deep_dive_session_${userId}`;
}

async function getDeepDiveState(userId: string): Promise<DeepDiveState> {
  try {
    const config = await prisma.newsConfig.findUnique({
      where: { key: statusKey(userId) },
    });
    if (config) {
      return JSON.parse(config.value);
    }
  } catch (err) {
    console.error('[deep-dive] Error reading state:', err);
  }
  return { ...DEFAULT_STATE };
}

async function setDeepDiveState(userId: string, state: DeepDiveState): Promise<void> {
  try {
    const key = statusKey(userId);
    await prisma.newsConfig.upsert({
      where: { key },
      create: { key, value: JSON.stringify(state) },
      update: { value: JSON.stringify(state) },
    });
  } catch (err) {
    console.error('[deep-dive] Error saving state:', err);
  }
}

async function getDeepDiveSession(userId: string): Promise<DeepDiveSession | null> {
  try {
    const config = await prisma.newsConfig.findUnique({
      where: { key: sessionKey(userId) },
    });
    if (config) {
      return JSON.parse(config.value);
    }
  } catch (err) {
    console.error('[deep-dive] Error reading session:', err);
  }
  return null;
}

async function setDeepDiveSession(userId: string, session: DeepDiveSession): Promise<void> {
  try {
    const key = sessionKey(userId);
    await prisma.newsConfig.upsert({
      where: { key },
      create: { key, value: JSON.stringify(session) },
      update: { value: JSON.stringify(session) },
    });
  } catch (err) {
    console.error('[deep-dive] Error saving session:', err);
  }
}

// Advisory lock base ID (unique, refresh uses 937452, orchestrator uses 937451)
const DEEP_DIVE_LOCK_BASE = BigInt(937460);

function lockIdForUser(userId: string): bigint {
  // Simple hash of userId to get a unique lock per user
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return DEEP_DIVE_LOCK_BASE + BigInt(Math.abs(hash) % 1000000);
}

// ============================================================================
// Background Job
// ============================================================================

async function runDeepDive(
  userId: string,
  userName: string,
  params: { company?: string; person?: string; days: number },
): Promise<void> {
  let state = await getDeepDiveState(userId);

  try {
    // 1. Get previous session — find which article IDs are pinned — carry forward
    const prevSession = await getDeepDiveSession(userId);
    let carriedPinnedIds: string[] = [];
    if (prevSession && prevSession.articleIds.length > 0) {
      const pinnedRecords = await prisma.userPinnedArticle.findMany({
        where: {
          userId,
          articleId: { in: prevSession.articleIds },
        },
        select: { articleId: true },
      });
      carriedPinnedIds = pinnedRecords.map(p => p.articleId);
    }

    // 2. Build a synthetic call diet for the hybrid fetcher
    const callDiet: CallDietInput = {
      userId,
      userName,
      companies: params.company ? [{ name: params.company }] : [],
      people: params.person ? [{ name: params.person }] : [],
      topics: [],
    };

    // Progress callback — maps hybrid fetcher progress to deep dive status
    const onProgress = async (progress: number, message: string) => {
      // Scale hybrid progress (0-90) into deep dive range (10-80)
      const scaledProgress = 10 + Math.round(progress * 0.7);
      state.progress = Math.min(scaledProgress, 80);
      state.progressMessage = message;
      state.currentStep = 'searching';
      await setDeepDiveState(userId, state);
    };

    state.currentStep = 'searching';
    state.progress = 10;
    state.progressMessage = 'Fetching from RSS feeds and AI search...';
    await setDeepDiveState(userId, state);

    const result = await fetchNewsHybrid([callDiet], onProgress, params.days);

    // Filter out tag-only articles (must have a company or person match)
    const filteredArticles = result.articles.filter(
      article => article.company || article.person
    );
    console.log(`[deep-dive] After filtering tag-only: ${filteredArticles.length} articles`);

    // 3. Save articles to DB
    state.currentStep = 'saving';
    state.progress = 85;
    state.progressMessage = `Saving ${filteredArticles.length} articles...`;
    await setDeepDiveState(userId, state);

    const newArticleIds: string[] = [];

    for (const article of filteredArticles) {
      try {
        // Resolve companyId
        let companyId: string | null = null;
        if (article.company) {
          const company = await prisma.trackedCompany.findFirst({
            where: { name: { equals: article.company, mode: 'insensitive' } },
          });
          companyId = company?.id || null;
        }

        // Resolve personId
        let personId: string | null = null;
        if (article.person) {
          const person = await prisma.trackedPerson.findFirst({
            where: { name: { equals: article.person, mode: 'insensitive' } },
          });
          personId = person?.id || null;
        }

        // Resolve tagId
        const tag = await prisma.newsTag.findFirst({
          where: { name: { equals: article.category, mode: 'insensitive' } },
        });

        // Map enums
        const matchType = article.matchType === 'exact' ? MatchType.exact :
                         article.matchType === 'contextual' ? MatchType.contextual : null;

        const fetchLayer = article.fetchLayer === 'layer1_rss' ? FetchLayer.layer1_rss :
                          article.fetchLayer === 'layer1_api' ? FetchLayer.layer1_api :
                          article.fetchLayer === 'layer2_llm' ? FetchLayer.layer2_llm : null;

        // Upsert article
        const savedArticle = await prisma.newsArticle.upsert({
          where: { sourceUrl: article.sourceUrl },
          create: {
            headline: article.headline,
            shortSummary: article.shortSummary,
            longSummary: article.longSummary,
            summary: article.summary,
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

        // Save additional sources
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

        // Link article to user
        await prisma.articleUser.upsert({
          where: {
            articleId_userId: {
              articleId: savedArticle.id,
              userId,
            },
          },
          create: {
            articleId: savedArticle.id,
            userId,
          },
          update: {},
        });

        newArticleIds.push(savedArticle.id);
      } catch (articleError) {
        console.error('[deep-dive] Error saving article:', article.headline, articleError);
      }
    }

    // 4. Combine new IDs with carried-forward pinned IDs (dedup)
    const allIds = [...new Set([...newArticleIds, ...carriedPinnedIds])];

    // 5. Store session
    await setDeepDiveSession(userId, {
      articleIds: allIds,
      searchParams: params,
      completedAt: new Date().toISOString(),
    });

    // 6. Set status complete
    state.isSearching = false;
    state.completedAt = new Date().toISOString();
    state.lastError = null;
    state.articlesFound = newArticleIds.length;
    state.progress = 100;
    state.progressMessage = 'Complete';
    state.currentStep = 'complete';
    await setDeepDiveState(userId, state);

    console.log(`[deep-dive] Complete for user ${userId}: ${newArticleIds.length} articles saved`);
  } catch (error) {
    console.error('[deep-dive] Error:', error);
    state.isSearching = false;
    state.lastError = safeErrorMessage(error);
    state.progress = 0;
    state.progressMessage = 'Failed';
    state.currentStep = 'error';
    await setDeepDiveState(userId, state);
  }
}

// ============================================================================
// Routes
// ============================================================================

// POST / - Start background deep dive
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { company, person, days = 1 } = req.body;
    const daysNum = Math.min(Math.max(Number(days) || 1, 1), 30);

    if (!company && !person) {
      res.status(400).json({ error: 'At least one of company or person is required' });
      return;
    }

    const userId = req.auth.userId;
    const lockId = lockIdForUser(userId);

    // Advisory lock to prevent concurrent deep dives per user
    const canProceed = await prisma.$transaction(async (tx) => {
      const lockResult = await tx.$queryRaw<{ locked: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(${lockId}) AS locked
      `;
      if (!lockResult?.[0]?.locked) return false;

      const config = await tx.newsConfig.findUnique({
        where: { key: statusKey(userId) },
      });
      const currentState: DeepDiveState = config ? JSON.parse(config.value) : { ...DEFAULT_STATE };

      if (currentState.isSearching) {
        // Stale detection: if searching for >5 min, auto-recover
        const STALE_THRESHOLD_MS = 5 * 60 * 1000;
        const startedAt = currentState.startedAt ? new Date(currentState.startedAt).getTime() : 0;
        const age = startedAt ? Date.now() - startedAt : Infinity;

        if (age > STALE_THRESHOLD_MS) {
          console.log('[deep-dive] Stale search detected, auto-recovering...');
        } else {
          return false;
        }
      }

      // Set initial searching state
      const newState: DeepDiveState = {
        isSearching: true,
        startedAt: new Date().toISOString(),
        completedAt: null,
        lastError: null,
        articlesFound: 0,
        progress: 5,
        progressMessage: 'Starting deep dive...',
        currentStep: 'init',
        searchParams: { company: company?.trim(), person: person?.trim(), days: daysNum },
      };

      await tx.newsConfig.upsert({
        where: { key: statusKey(userId) },
        create: { key: statusKey(userId), value: JSON.stringify(newState) },
        update: { value: JSON.stringify(newState) },
      });

      return true;
    });

    if (!canProceed) {
      const currentStatus = await getDeepDiveState(userId);
      res.status(409).json({
        error: 'Deep dive already in progress',
        status: currentStatus,
      });
      return;
    }

    // Look up user name for the call diet
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const userName = user?.name || user?.email || userId;

    // Fire background job (don't await)
    const searchParams = { company: company?.trim(), person: person?.trim(), days: daysNum };
    runDeepDive(userId, userName, searchParams).catch(err => {
      console.error('[deep-dive] Unhandled error in background job:', err);
    });

    res.status(202).json({ success: true, message: 'Deep dive started' });
  } catch (error) {
    console.error('[deep-dive] Error starting:', error);
    res.status(500).json({ error: 'Failed to start deep dive' });
  }
});

// GET /status - Poll status
router.get('/status', async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const state = await getDeepDiveState(req.auth.userId);
    res.json(state);
  } catch (error) {
    console.error('[deep-dive] Error fetching status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// GET /articles - Fetch session results
router.get('/articles', async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.auth.userId;
    const session = await getDeepDiveSession(userId);

    if (!session || session.articleIds.length === 0) {
      res.json({ articles: [], searchParams: null, completedAt: null });
      return;
    }

    // Fetch articles by IDs, filter out archived and dismissed
    const articles = await prisma.newsArticle.findMany({
      where: {
        id: { in: session.articleIds },
        isArchived: false,
        isDismissed: false,
      },
      include: {
        company: true,
        person: {
          include: {
            company: { select: { id: true, name: true, ticker: true } },
          },
        },
        tag: true,
        sources: true,
        articleUsers: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    // Transform to match the frontend NewsArticle shape
    const transformed = articles.map(a => ({
      ...a,
      users: a.articleUsers.map((au: { user: { id: string; name: string | null; email: string } }) => au.user),
    }));

    res.json({
      articles: transformed,
      searchParams: session.searchParams,
      completedAt: session.completedAt,
    });
  } catch (error) {
    console.error('[deep-dive] Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// POST /clear - Clear results (keep pinned)
router.post('/clear', async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.auth.userId;
    const session = await getDeepDiveSession(userId);

    if (!session || session.articleIds.length === 0) {
      res.json({ success: true, remaining: 0 });
      return;
    }

    // Find which of the session articles are pinned — keep those
    const pinnedRecords = await prisma.userPinnedArticle.findMany({
      where: {
        userId,
        articleId: { in: session.articleIds },
      },
      select: { articleId: true },
    });
    const pinnedIds = pinnedRecords.map(p => p.articleId);

    // Update session to only keep pinned IDs
    if (pinnedIds.length > 0) {
      await setDeepDiveSession(userId, {
        articleIds: pinnedIds,
        searchParams: session.searchParams,
        completedAt: session.completedAt,
      });
    } else {
      // Remove session entirely
      await prisma.newsConfig.deleteMany({
        where: { key: sessionKey(userId) },
      });
    }

    // Reset status to idle
    await setDeepDiveState(userId, { ...DEFAULT_STATE });

    res.json({ success: true, remaining: pinnedIds.length });
  } catch (error) {
    console.error('[deep-dive] Error clearing:', error);
    res.status(500).json({ error: 'Failed to clear results' });
  }
});

export default router;
