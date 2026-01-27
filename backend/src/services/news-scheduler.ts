/**
 * News Scheduler Service
 * Handles automated daily refresh of news at midnight EST
 */

import * as cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { fetchNewsHybrid, CallDietInput } from './news-fetcher.js';
import { ArticleStatus, MatchType, FetchLayer } from '@prisma/client';

// Cron expression for midnight EST (5 AM UTC during standard time, 4 AM UTC during daylight saving)
// Using 5 AM UTC as a reasonable approximation
const MIDNIGHT_EST_CRON = '0 5 * * *';

let isSchedulerRunning = false;

/**
 * Run the news refresh job
 */
async function runNewsRefresh(): Promise<void> {
  console.log('[scheduler] Starting scheduled news refresh...');
  const startTime = Date.now();

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

    if (revenueOwners.length === 0) {
      console.log('[scheduler] No revenue owners configured, skipping refresh');
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

    console.log(`[scheduler] Fetching news for ${callDiets.length} revenue owners`);

    // Fetch news via hybrid approach
    const result = await fetchNewsHybrid(callDiets);

    console.log(`[scheduler] Got ${result.articles.length} articles`);

    // Filter out tag-only articles
    const filteredArticles = result.articles.filter(
      article => article.company || article.person
    );
    console.log(`[scheduler] After filtering tag-only: ${filteredArticles.length} articles`);

    // Save articles to database
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

        // Find matching tag
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
        console.error('[scheduler] Error saving article:', article.headline, articleError);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[scheduler] Completed: ${savedCount} articles saved in ${duration}s`);

    // Update the refresh_status record (same key used by manual refresh)
    // This ensures the frontend shows the correct "last refreshed" timestamp
    // Include completed steps so the UI shows proper completion state
    const refreshStatus = {
      isRefreshing: false,
      lastRefreshedAt: new Date().toISOString(),
      lastError: null,
      articlesFound: savedCount,
      coverageGaps: [],
      progress: 100,
      progressMessage: 'Complete (scheduled)',
      currentStep: 'done',
      steps: [
        { step: 'Loading revenue owners', status: 'completed' as const, detail: `${revenueOwners.length} owner(s)` },
        { step: 'Layer 1: RSS feeds & APIs', status: 'completed' as const },
        { step: 'Layer 2: AI web search', status: 'completed' as const },
        { step: 'Combining & deduplicating', status: 'completed' as const },
        { step: 'AI processing & categorization', status: 'completed' as const },
        { step: 'Saving to database', status: 'completed' as const, detail: `${savedCount} articles saved` },
      ],
      stats: null,
    };
    await prisma.newsConfig.upsert({
      where: { key: 'refresh_status' },
      create: { key: 'refresh_status', value: JSON.stringify(refreshStatus) },
      update: { value: JSON.stringify(refreshStatus) },
    });

  } catch (error) {
    console.error('[scheduler] Error during scheduled refresh:', error);
  }
}

/**
 * Initialize the news scheduler
 */
export function initNewsScheduler(): void {
  if (isSchedulerRunning) {
    console.log('[scheduler] Scheduler already running');
    return;
  }

  console.log('[scheduler] Initializing news scheduler...');
  console.log(`[scheduler] Cron expression: ${MIDNIGHT_EST_CRON} (approximately midnight EST)`);

  // Schedule the job
  cron.schedule(MIDNIGHT_EST_CRON, () => {
    console.log(`[scheduler] Triggered at ${new Date().toISOString()}`);
    runNewsRefresh();
  }, {
    timezone: 'America/New_York', // Use proper EST/EDT timezone
  });

  isSchedulerRunning = true;
  console.log('[scheduler] News scheduler initialized - will run daily at midnight EST');
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): { running: boolean; nextRun: string } {
  const now = new Date();
  // Calculate next midnight EST
  const nextMidnight = new Date(now);
  nextMidnight.setHours(0, 0, 0, 0);
  if (now.getHours() >= 0) {
    nextMidnight.setDate(nextMidnight.getDate() + 1);
  }

  return {
    running: isSchedulerRunning,
    nextRun: nextMidnight.toISOString(),
  };
}
