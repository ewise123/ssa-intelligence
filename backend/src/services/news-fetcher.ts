/**
 * Hybrid News Fetcher Service
 * Layer 1: Deterministic RSS/API fetching (guaranteed baseline coverage)
 * Layer 2: Claude web search (contextual gap filling and enrichment)
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  fetchGoogleNewsRSS,
  fetchPEFeeds,
  filterPEFeedArticles,
  deduplicateArticles,
  filterRecentArticles,
  RawArticle,
} from './layer1-fetcher.js';
import { prisma } from '../lib/prisma.js';
import { withRetry, CircuitBreaker } from '../lib/retry.js';

const anthropic = new Anthropic();

// Circuit breaker for Layer 2 API calls (opens after 3 consecutive failures, 5-min cooldown)
const layer2CircuitBreaker = new CircuitBreaker('layer2', 3, 5 * 60 * 1000);

export interface CallDietInput {
  userId: string;
  userName: string;
  companies: Array<{ name: string; ticker?: string }>;
  people: Array<{ name: string; title?: string }>;
  topics: string[]; // Kept for backward compatibility but not used in search
}

/** @deprecated Use CallDietInput with userId/userName instead */
export type LegacyCallDietInput = {
  revenueOwnerId: string;
  revenueOwnerName: string;
  companies: Array<{ name: string; ticker?: string }>;
  people: Array<{ name: string; title?: string }>;
  topics: string[];
};

export interface ArticleSourceInfo {
  sourceUrl: string;
  sourceName: string;
  fetchLayer: 'layer1_rss' | 'layer1_api' | 'layer2_llm';
}

export interface ProcessedArticle {
  headline: string;
  shortSummary: string | null;  // 1-2 sentences for card preview
  longSummary: string | null;   // 3-5 sentences for expanded view
  summary: string | null;       // Legacy field for compatibility
  whyItMatters: string | null;
  sourceUrl: string;            // Primary source URL
  sourceName: string;           // Primary source name
  sources: ArticleSourceInfo[]; // All sources for merged stories
  publishedAt: string;
  company: string | null;
  person: string | null;
  category: string;
  status: 'new_article' | 'update';
  matchType: 'exact' | 'contextual';
  fetchLayer: 'layer1_rss' | 'layer1_api' | 'layer2_llm';
  userNames: string[];
}

export interface CoverageGap {
  company: string;
  userName?: string;
  note: string;
}

export interface FetchResult {
  articles: ProcessedArticle[];
  coverageGaps: CoverageGap[];
  stats?: {
    layer1Articles: number;
    layer2Articles: number;
    totalRaw: number;
    afterDedup: number;
    afterProcessing: number;
  };
  errors?: {
    layer1Error?: string;
    layer2Error?: string;
  };
}

// Progress callback for job queue with step tracking
export type StepUpdate = { index: number; status: 'in_progress' | 'completed' | 'error'; detail?: string };
export type ProgressCallback = (progress: number, message: string, stepUpdate?: StepUpdate) => Promise<void>;

/**
 * Main hybrid fetch function
 * Combines Layer 1 (RSS/APIs) + Layer 2 (Claude web search)
 */
export async function fetchNewsHybrid(
  callDiets: CallDietInput[],
  onProgress?: ProgressCallback,
  days: number = 1
): Promise<FetchResult> {
  if (callDiets.length === 0) {
    return { articles: [], coverageGaps: [] };
  }

  const stats = {
    layer1Articles: 0,
    layer2Articles: 0,
    totalRaw: 0,
    afterDedup: 0,
    afterProcessing: 0,
  };

  // Extract unique companies and people (topics are no longer used for search)
  const allCompanies = new Map<string, { name: string; ticker?: string }>();
  const allPeople = new Map<string, { name: string; title?: string }>();

  for (const cd of callDiets) {
    for (const company of cd.companies) {
      allCompanies.set(company.name.toLowerCase(), company);
    }
    for (const person of cd.people) {
      allPeople.set(person.name.toLowerCase(), person);
    }
  }

  const companies = Array.from(allCompanies.values());
  const people = Array.from(allPeople.values());

  if (companies.length === 0 && people.length === 0) {
    return { articles: [], coverageGaps: [] };
  }

  // ═══════════════════════════════════════════════════════════════════
  // LAYER 1 & LAYER 2: RUN IN PARALLEL
  // ═══════════════════════════════════════════════════════════════════
  // Mark both layers as in_progress since they run simultaneously
  await onProgress?.(10, 'Starting Layer 1 and Layer 2 in parallel...', { index: 1, status: 'in_progress' });
  await onProgress?.(10, 'Starting Layer 1 and Layer 2 in parallel...', { index: 2, status: 'in_progress' });
  console.log('[hybrid] Starting Layer 1 and Layer 2 in parallel...');

  // Track errors from each layer
  const errors: { layer1Error?: string; layer2Error?: string } = {};

  // Run Layer 1 and Layer 2 concurrently, capturing errors
  const [layer1Result, layer2Result] = await Promise.all([
    // Layer 1: RSS/API fetch
    (async (): Promise<{ articles: RawArticle[]; error?: string }> => {
      try {
        const layer1Articles: RawArticle[] = [];

        // Fetch Google News for each company
        let googleNewsCount = 0;
        for (const company of companies) {
          const articles = await fetchGoogleNewsRSS(company.name);
          googleNewsCount += articles.length;
          layer1Articles.push(...articles);
        }

        // Fetch Google News for each person
        for (const person of people) {
          const articles = await fetchGoogleNewsRSS(`"${person.name}"`);
          googleNewsCount += articles.length;
          layer1Articles.push(...articles);
        }

        console.log(`[layer1] Google News: ${googleNewsCount} articles`);

        // Fetch PE industry feeds and filter for relevant mentions
        const peFeedArticles = await fetchPEFeeds();
        const relevantPEArticles = filterPEFeedArticles(
          peFeedArticles,
          companies.map((c) => c.name),
          people.map((p) => p.name)
        );
        layer1Articles.push(...relevantPEArticles);

        console.log(`[layer1] PE feeds: ${relevantPEArticles.length} relevant articles`);

        return { articles: layer1Articles };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown Layer 1 error';
        console.error('[layer1] Error:', errorMsg);
        return { articles: [], error: errorMsg };
      }
    })(),

    // Layer 2: Claude web search (runs independently for ALL companies/people)
    (async (): Promise<{ articles: RawArticle[]; error?: string }> => {
      // Check if circuit breaker is open
      if (layer2CircuitBreaker.isCircuitOpen()) {
        const remainingMs = layer2CircuitBreaker.getRemainingCooldownMs();
        const errorMsg = `AI search temporarily unavailable (cooldown: ${Math.round(remainingMs / 1000)}s remaining)`;
        return { articles: [], error: errorMsg };
      }

      try {
        const articles = await fetchLayer2Contextual(
          companies.map((c) => c.name),
          people.slice(0, 10).map((p) => p.name), // Top 10 people
          days
        );
        return { articles };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown Layer 2 error';
        console.error('[layer2] Error in wrapper:', errorMsg);
        return { articles: [], error: errorMsg };
      }
    })(),
  ]);

  // Extract articles and errors
  const layer1Articles = layer1Result.articles;
  const layer2Articles = layer2Result.articles;
  if (layer1Result.error) errors.layer1Error = layer1Result.error;
  if (layer2Result.error) errors.layer2Error = layer2Result.error;

  stats.layer1Articles = layer1Articles.length;
  stats.layer2Articles = layer2Articles.length;

  console.log(`[hybrid] Layer 1 complete: ${layer1Articles.length} articles${layer1Result.error ? ' (with errors)' : ''}`);
  console.log(`[hybrid] Layer 2 complete: ${layer2Articles.length} articles${layer2Result.error ? ' (with errors)' : ''}`);

  await onProgress?.(30, `Layer 1: ${layer1Articles.length} articles`, {
    index: 1,
    status: layer1Result.error ? 'error' : 'completed',
    detail: layer1Result.error || `${layer1Articles.length} from Google News & PE feeds`
  });
  await onProgress?.(40, `Layer 2: ${layer2Articles.length} articles`, {
    index: 2,
    status: layer2Result.error ? 'error' : 'completed',
    detail: layer2Result.error || `${layer2Articles.length} from AI web search`
  });

  // ═══════════════════════════════════════════════════════════════════
  // COMBINE & DEDUPLICATE (Two-phase: heuristic + LLM)
  // ═══════════════════════════════════════════════════════════════════
  await onProgress?.(45, 'Combining and deduplicating articles...', { index: 3, status: 'in_progress' });

  const allRawArticles = [...layer1Articles, ...layer2Articles];
  stats.totalRaw = allRawArticles.length;

  // Phase 1: Fast heuristic dedup (URL, fingerprint, similarity)
  const heuristicDeduped = deduplicateArticles(allRawArticles);
  const recentArticles = filterRecentArticles(heuristicDeduped, 1); // 24 hours

  console.log(`[hybrid] After heuristic dedup: ${recentArticles.length} articles`);

  await onProgress?.(55, `Heuristic dedup: ${allRawArticles.length} → ${recentArticles.length}`, { index: 3, status: 'in_progress', detail: 'Running LLM deduplication...' });

  // Phase 2: LLM-based semantic deduplication (pick best source per story)
  const llmDeduped = await deduplicateWithLLM(recentArticles, onProgress);

  console.log(`[hybrid] After LLM dedup: ${llmDeduped.length} articles`);

  // Phase 3: Historical deduplication against database (last 30 days)
  await onProgress?.(60, 'Checking against historical articles...', { index: 3, status: 'in_progress', detail: 'Comparing with last 30 days' });
  const historicalDeduped = await deduplicateAgainstDatabase(llmDeduped, onProgress);
  stats.afterDedup = historicalDeduped.length;

  console.log(`[hybrid] After historical dedup: ${historicalDeduped.length} articles`);

  await onProgress?.(65, `Deduplicated to ${historicalDeduped.length} unique articles`, { index: 3, status: 'completed', detail: `${allRawArticles.length} raw → ${recentArticles.length} → ${llmDeduped.length} → ${historicalDeduped.length} unique` });

  // ═══════════════════════════════════════════════════════════════════
  // PROCESS WITH LLM
  // ═══════════════════════════════════════════════════════════════════
  await onProgress?.(70, 'Processing articles with Claude AI...', { index: 4, status: 'in_progress' });

  const processed = await processArticlesWithLLM(
    historicalDeduped,
    callDiets,
    companies.map((c) => c.name),
    people.map((p) => p.name)
  );

  stats.afterProcessing = processed.articles.length;

  await onProgress?.(90, `Processed ${processed.articles.length} relevant articles`, { index: 4, status: 'completed', detail: `${processed.articles.length} categorized, ${processed.coverageGaps.length} gaps identified` });

  console.log(`[hybrid] Final: ${processed.articles.length} articles, ${processed.coverageGaps.length} gaps`);

  return {
    ...processed,
    stats,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

/**
 * Layer 2: Claude web search for comprehensive discovery
 * Searches for news in the specified time period for ALL companies and people
 */
async function fetchLayer2Contextual(
  companies: string[],
  people: string[],
  days: number = 1
): Promise<RawArticle[]> {
  if (companies.length === 0 && people.length === 0) {
    return [];
  }

  const timeDescription = days === 1 ? 'last 24 hours' : `last ${days} days`;
  const searchPrompt = `You are a news intelligence analyst. Search for recent news (${timeDescription} only) about these companies and people. This is an INDEPENDENT search to complement RSS feeds - search comprehensively.

${companies.length > 0 ? `## Companies to Search
${companies.map((c) => `- ${c}`).join('\n')}` : ''}

${people.length > 0 ? `## Key People to Search
${people.map((p) => `- ${p}`).join('\n')}` : ''}

## Search Strategy
For each company/person, search broadly - include:
- Direct news mentions and press releases
- M&A activity, deals, and investments
- Leadership changes and executive appointments
- Earnings reports and financial performance
- Strategic initiatives and partnerships
- Parent company or subsidiary news
- Industry developments affecting them
- Executive speaking engagements, quotes, or interviews

IMPORTANT:
- Only include articles published within the ${timeDescription}
- Prioritize high-quality sources (Reuters, WSJ, Bloomberg, etc.)
- Include actionable business news useful for consultants

Return results as JSON array with this format:
{
  "results": [
    {
      "headline": "Article headline",
      "description": "Brief description (2-3 sentences)",
      "sourceUrl": "https://...",
      "sourceName": "Source name",
      "publishedAt": "2026-01-15",
      "relatedEntity": "Company or person name this relates to"
    }
  ]
}

Return maximum 25 results, prioritizing the most actionable and relevant news.`;

  // Check circuit breaker before making the call
  if (layer2CircuitBreaker.isCircuitOpen()) {
    const remainingMs = layer2CircuitBreaker.getRemainingCooldownMs();
    console.log(`[layer2] Circuit breaker open, skipping. Cooldown remaining: ${Math.round(remainingMs / 1000)}s`);
    return [];
  }

  try {
    console.log('[layer2] Starting Claude web search...');
    console.log('[layer2] Searching for companies:', companies.join(', '));
    console.log('[layer2] Searching for people:', people.join(', '));

    const response = await withRetry(
      () => anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 5,
          } as any,
        ],
        messages: [
          {
            role: 'user',
            content: searchPrompt,
          },
        ],
      }),
      { maxRetries: 2, baseDelayMs: 2000, maxDelayMs: 15000 }
    );

    // Record success for circuit breaker
    layer2CircuitBreaker.recordSuccess();

    console.log('[layer2] Response received, content blocks:', response.content.length);
    console.log('[layer2] Content types:', response.content.map(c => c.type).join(', '));

    // Get the last text block
    const textBlocks = response.content.filter((c) => c.type === 'text');
    console.log('[layer2] Text blocks found:', textBlocks.length);

    const textContent = textBlocks[textBlocks.length - 1];

    if (!textContent || textContent.type !== 'text') {
      console.error('[layer2] No text response from Claude');
      console.error('[layer2] Full response content:', JSON.stringify(response.content, null, 2));
      return [];
    }

    console.log('[layer2] Text response length:', textContent.text.length);
    console.log('[layer2] Text preview:', textContent.text.substring(0, 500));

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*"results"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[layer2] Could not find JSON in response');
      console.error('[layer2] Full text:', textContent.text);
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const results = parsed.results || [];

    console.log('[layer2] Parsed results count:', results.length);

    return results.map((r: any) => ({
      headline: r.headline || '',
      description: r.description || '',
      sourceUrl: r.sourceUrl || '',
      sourceName: r.sourceName || 'Web Search',
      publishedAt: r.publishedAt ? new Date(r.publishedAt) : new Date(),
      fetchLayer: 'layer2_llm' as const,
    }));
  } catch (error: any) {
    // Record failure for circuit breaker
    layer2CircuitBreaker.recordFailure();

    // Detailed error logging
    console.error('[layer2] Error in contextual search');
    console.error('[layer2] Error type:', error?.constructor?.name);
    console.error('[layer2] Error message:', error?.message);
    console.error('[layer2] Error status:', error?.status ?? error?.statusCode ?? 'N/A');
    console.error('[layer2] Error code:', error?.code ?? error?.error?.type ?? 'N/A');
    if (error?.error) {
      console.error('[layer2] Error details:', JSON.stringify(error.error, null, 2));
    }
    if (error?.body) {
      const bodyPreview = typeof error.body === 'string'
        ? error.body.substring(0, 500)
        : JSON.stringify(error.body).substring(0, 500);
      console.error('[layer2] Error body preview:', bodyPreview);
    }
    if (error?.stack) {
      console.error('[layer2] Error stack:', error.stack);
    }
    return [];
  }
}

// Limits for article processing
const ARTICLE_PROCESSING_LIMIT = 250;
const ARTICLE_BATCH_SIZE = 80;

/**
 * Process raw articles with LLM for filtering, categorization, and summarization
 * Batches large volumes to avoid token overflow
 */
async function processArticlesWithLLM(
  rawArticles: RawArticle[],
  callDiets: CallDietInput[],
  companies: string[],
  people: string[]
): Promise<FetchResult> {
  if (rawArticles.length === 0) {
    return { articles: [], coverageGaps: [] };
  }

  const articlesToProcess = rawArticles.slice(0, ARTICLE_PROCESSING_LIMIT);

  // Split into batches to avoid token overflow
  const batches: { articles: RawArticle[]; globalOffset: number }[] = [];
  for (let i = 0; i < articlesToProcess.length; i += ARTICLE_BATCH_SIZE) {
    batches.push({
      articles: articlesToProcess.slice(i, i + ARTICLE_BATCH_SIZE),
      globalOffset: i,
    });
  }

  console.log(`[process] Processing ${articlesToProcess.length} articles in ${batches.length} batch(es) of up to ${ARTICLE_BATCH_SIZE}`);

  const allProcessedArticles: ProcessedArticle[] = [];

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const { articles: batchArticles, globalOffset } = batches[batchIdx];
    console.log(`[process] Batch ${batchIdx + 1}/${batches.length}: ${batchArticles.length} articles (offset ${globalOffset})`);

    const batchResult = await processArticleBatch(
      batchArticles,
      globalOffset,
      rawArticles,
      callDiets,
      companies,
      people
    );
    allProcessedArticles.push(...batchResult.articles);
  }

  // Compute coverage gaps: companies with no articles across all batches
  const coveredCompanies = new Set(
    allProcessedArticles
      .map((a) => a.company?.toLowerCase())
      .filter((c): c is string => c !== null && c !== undefined)
  );
  const coverageGaps: CoverageGap[] = companies
    .filter((c) => !coveredCompanies.has(c.toLowerCase()))
    .map((c) => ({ company: c, note: 'No relevant news found' }));

  return { articles: allProcessedArticles, coverageGaps };
}

/**
 * Process a single batch of articles through the LLM for filtering and categorization
 */
async function processArticleBatch(
  batchArticles: RawArticle[],
  globalOffset: number,
  allRawArticles: RawArticle[],
  callDiets: CallDietInput[],
  companies: string[],
  people: string[]
): Promise<{ articles: ProcessedArticle[]; coverageGaps: CoverageGap[] }> {
  if (batchArticles.length === 0) {
    return { articles: [], coverageGaps: [] };
  }

  // Build article summaries for LLM (use global IDs for enrichment lookup)
  const articleSummaries = batchArticles.map((a, i) => ({
    id: globalOffset + i,
    headline: a.headline,
    description: a.description?.substring(0, 300) || '',
    source: a.sourceName,
    url: a.sourceUrl,
    date: a.publishedAt.toISOString().split('T')[0],
    layer: a.fetchLayer,
  }));

  const prompt = `You are a news intelligence analyst helping consultants prepare for client engagements. Process these raw news articles for revenue owners tracking PE and industrial companies.

## Raw Articles
${JSON.stringify(articleSummaries, null, 2)}

## Companies Being Tracked
${companies.join(', ')}

## People Being Tracked
${people.join(', ')}

## User Mapping
${callDiets.map((cd) => `- ${cd.userName}: tracks ${cd.companies.map((c) => c.name).concat(cd.people.map((p) => p.name)).join(', ')}`).join('\n')}

## Instructions

1. **STRICTLY filter out** (when in doubt, EXCLUDE the article — be aggressive about filtering):
   - Articles where the tracked entity is mentioned only tangentially or for context
   - Articles about a different entity with a similar name
   - General industry news without specific entity focus
   - Generic press releases with no substantive news
   - Routine product updates without strategic significance
   - Event sponsorship or award/recognition announcements
   - Minor personnel changes (non-executive level)
   - Rehashed information from prior announcements
   - Opinion pieces without new factual information
   - Historical references without current relevance
   - Speculation without substantive basis
   - **IMPORTANT: Analyst ratings, upgrades, or downgrades where the tracked company is the ANALYST (not the subject)** - e.g., if tracking "Morgan Stanley" and they downgrade another company's stock, EXCLUDE this because Morgan Stanley is just the analyst, not the subject of the news
   - Articles where the tracked company is providing analysis, ratings, or commentary about OTHER companies
   - **ALL marketing, advertising, promotional, and brand content** — this includes but is not limited to: marketing campaign launches, advertising initiatives, brand promotion activities, product launch announcements that are purely promotional, sponsorship deals, influencer partnerships, social media campaigns, brand awareness initiatives, promotional partnerships, customer engagement programs, loyalty programs, seasonal promotions, and any article that reads like an advertisement or press release promoting products/services rather than reporting substantive business news
   - **ALL content that is promotional in tone or purpose** — if the article's primary intent is to promote, market, or advertise a product, service, event, or brand rather than report on material business developments, EXCLUDE it regardless of the specific category
   - Price target changes, analyst price target updates, or stock rating changes for the company's shares
   - **ALL earnings date announcements and scheduling notices** — EXCLUDE any article about UPCOMING quarterly/annual earnings (e.g., "Company X to report Q3 earnings on DATE", "Company X scheduled to release earnings", "earnings call scheduled for", "reports earnings next week"). Only include articles that contain ACTUAL published earnings results with specific financial figures
   - **ALL routine share transactions** — EXCLUDE share purchases, stock buybacks, insider trading/selling, secondary offerings, block trades, share repurchase programs, and insider ownership changes UNLESS the transaction represents a complete sale of a business/division, a controlling share acquisition (>50% stake), a hostile or friendly takeover attempt, or a significant activist stake (>10%) with stated intent to influence corporate strategy
   - News about banks being underwriters or bookrunners for IPOs where the tracked entity is the underwriter, not the company going public
   - Analyst recommendations, "buy/sell/hold" ratings, or stock picks where the tracked company's stock is being rated (not actionable business news)

   **KEEP only articles that are definitively ABOUT a tracked company/person as the main subject and cover:**
   - Mergers, acquisitions, divestitures, strategic partnerships
   - C-suite appointments/departures, board changes
   - Earnings releases with actual financial results, significant revenue/profit changes
   - Major contract wins/losses, facility changes
   - PE/VC investments, debt refinancing, IPOs
   - Market share changes, competitive threats
   - Technology implementations, workforce restructuring
   - Complete business/division sales, controlling share acquisitions or takeovers

2. **For each relevant article**:
   - Match to tracked company/person
   - Assign category: M&A / Deal Activity, Leadership Changes, Earnings & Operational Performance, Strategy, Value Creation / Cost Initiatives, Digital & Technology Modernization, Fundraising / New Funds, Operating Partner Activity, Supply Chain & Logistics, Plant & Footprint Changes
   - Generate shortSummary: 1-2 sentences for card preview
   - Generate longSummary: 3-5 sentences for detailed view
   - Generate "Why It Matters": 1-2 sentences explaining relevance for consultant engagement
   - Determine matchType: "exact" if article explicitly names the entity, "contextual" if related indirectly
   - Identify which revenue owner(s) this is relevant to
   - If multiple articles cover the SAME story, merge them: use the best headline, combine information in summaries, and list all sources

3. **Identify coverage gaps**: Companies with no relevant news found

## Output Format
Return ONLY valid JSON:
{
  "articles": [
    {
      "id": 0,
      "headline": "Original headline",
      "shortSummary": "1-2 sentence preview",
      "longSummary": "3-5 sentence detailed summary",
      "whyItMatters": "Why this matters for client engagement",
      "sourceUrl": "primary url from input",
      "sourceName": "primary source from input",
      "sources": [
        {"sourceUrl": "url1", "sourceName": "Source 1", "fetchLayer": "layer1_rss"},
        {"sourceUrl": "url2", "sourceName": "Source 2", "fetchLayer": "layer1_rss"}
      ],
      "publishedAt": "date from input",
      "company": "matched company or null",
      "person": "matched person or null",
      "category": "topic category",
      "status": "new_article",
      "matchType": "exact|contextual",
      "fetchLayer": "layer from input",
      "userNames": ["User Name 1"]
    }
  ],
  "coverageGaps": [
    {
      "company": "Company name",
      "note": "No relevant news found"
    }
  ]
}

Return ALL relevant articles, sorted by recency (most recent first).`;

  try {
    console.log('[process] Sending articles to Claude for processing...');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      console.error('[process] No text response');
      // Fall back to raw articles with basic formatting
      return {
        articles: batchArticles.map((a) => ({
          headline: a.headline,
          shortSummary: a.description?.substring(0, 150) || null,
          longSummary: a.description || null,
          summary: a.description?.substring(0, 200) || null,
          whyItMatters: null,
          sourceUrl: a.sourceUrl,
          sourceName: a.sourceName,
          sources: [{ sourceUrl: a.sourceUrl, sourceName: a.sourceName, fetchLayer: a.fetchLayer }],
          publishedAt: a.publishedAt.toISOString().split('T')[0],
          company: null,
          person: null,
          category: 'News',
          status: 'new_article' as const,
          matchType: 'contextual' as const,
          fetchLayer: a.fetchLayer,
          userNames: callDiets.map((cd) => cd.userName),
        })),
        coverageGaps: [],
      };
    }

    // Parse JSON - with robust extraction
    let cleaned = textContent.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Try to find the JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*"articles"[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (parseError) {
      // Try to fix truncated JSON by closing the arrays/objects
      console.log('[process] Attempting to fix truncated JSON...');

      // Find where the articles array might be truncated
      const articlesMatch = cleaned.match(/"articles"\s*:\s*\[/);
      if (articlesMatch) {
        // Count brackets to find incomplete structure
        let bracketCount = 0;
        let braceCount = 0;
        let lastValidIndex = 0;

        for (let i = 0; i < cleaned.length; i++) {
          if (cleaned[i] === '[') bracketCount++;
          if (cleaned[i] === ']') bracketCount--;
          if (cleaned[i] === '{') braceCount++;
          if (cleaned[i] === '}') braceCount--;

          // Track last position where we had a complete article object
          if (bracketCount === 1 && braceCount === 0 && cleaned[i] === '}') {
            lastValidIndex = i + 1;
          }
        }

        // Truncate to last valid article and close the structure
        if (lastValidIndex > 0) {
          cleaned = cleaned.substring(0, lastValidIndex) + '], "coverageGaps": []}';
          try {
            result = JSON.parse(cleaned);
            console.log('[process] Fixed truncated JSON successfully');
          } catch {
            throw parseError; // Re-throw original error if fix didn't work
          }
        } else {
          throw parseError;
        }
      } else {
        throw parseError;
      }
    }

    // Enrich with original URLs if IDs provided and ensure all fields exist
    const processedArticles: ProcessedArticle[] = result.articles.map((a: any) => {
      const original = typeof a.id === 'number' ? allRawArticles[a.id] : null;
      return {
        headline: a.headline || original?.headline || '',
        shortSummary: a.shortSummary || a.summary?.substring(0, 150) || null,
        longSummary: a.longSummary || a.summary || null,
        summary: a.summary || a.longSummary || null,
        whyItMatters: a.whyItMatters || null,
        sourceUrl: a.sourceUrl || original?.sourceUrl || '',
        sourceName: a.sourceName || original?.sourceName || '',
        sources: a.sources || [{ sourceUrl: a.sourceUrl || original?.sourceUrl || '', sourceName: a.sourceName || original?.sourceName || '', fetchLayer: a.fetchLayer || original?.fetchLayer || 'layer2_llm' }],
        publishedAt: a.publishedAt || original?.publishedAt?.toISOString().split('T')[0] || '',
        company: a.company || null,
        person: a.person || null,
        category: a.category || 'News',
        status: a.status || 'new_article',
        matchType: a.matchType || 'contextual',
        fetchLayer: a.fetchLayer || original?.fetchLayer || 'layer2_llm',
        userNames: a.revenueOwners || a.userNames || [],
      };
    });

    return {
      articles: processedArticles,
      coverageGaps: result.coverageGaps || [],
    };
  } catch (error) {
    console.error('[process] Error processing articles:', error);
    // Fall back to raw articles with basic formatting
    console.log('[process] Falling back to raw articles...');
    return {
      articles: batchArticles.map((a) => ({
        headline: a.headline,
        shortSummary: a.description?.substring(0, 150) || null,
        longSummary: a.description || null,
        summary: a.description?.substring(0, 200) || null,
        whyItMatters: null,
        sourceUrl: a.sourceUrl,
        sourceName: a.sourceName,
        sources: [{ sourceUrl: a.sourceUrl, sourceName: a.sourceName, fetchLayer: a.fetchLayer }],
        publishedAt: a.publishedAt.toISOString().split('T')[0],
        company: null,
        person: null,
        category: 'News',
        status: 'new_article' as const,
        matchType: 'contextual' as const,
        fetchLayer: a.fetchLayer,
        userNames: callDiets.map((cd) => cd.userName),
      })),
      coverageGaps: [],
    };
  }
}

/**
 * LLM-based deduplication - identify duplicate stories and pick best source
 */
async function deduplicateWithLLM(
  articles: RawArticle[],
  onProgress?: ProgressCallback
): Promise<RawArticle[]> {
  if (articles.length <= 5) {
    return articles; // Not worth LLM call for small sets
  }

  // Prepare article summaries for LLM
  const articleData = articles.map((a, i) => ({
    id: i,
    headline: a.headline,
    description: a.description?.substring(0, 200) || '',
    source: a.sourceName,
    date: a.publishedAt.toISOString().split('T')[0],
  }));

  const prompt = `You are deduplicating news articles. Multiple sources often report the same story with different headlines.

## Articles to Analyze
${JSON.stringify(articleData, null, 2)}

## Instructions
1. Identify groups of articles that cover the SAME story/event
2. For each group, select the BEST article based on:
   - Source authority (prefer: Reuters, WSJ, Bloomberg, FT, CNBC > regional/niche sites)
   - Comprehensiveness of headline
   - Recency (if dates differ)

3. Return the IDs of articles to KEEP (one per unique story)

## Source Authority Ranking (high to low)
- Tier 1: Reuters, Wall Street Journal, Bloomberg, Financial Times, CNBC, Associated Press
- Tier 2: Business Wire, PR Newswire, Yahoo Finance, Seeking Alpha, MarketWatch
- Tier 3: Industry publications (pehub.com, Bisnow, etc.)
- Tier 4: Regional/local news, aggregators, blogs

## Output Format
Return ONLY valid JSON:
{
  "uniqueArticles": [
    {
      "keepId": 0,
      "story": "Brief description of what this story is about",
      "duplicateIds": [1, 5],
      "reason": "Reuters is most authoritative source"
    }
  ],
  "standalone": [2, 3, 8]
}

- "uniqueArticles": Groups where you found duplicates - include the best ID to keep
- "standalone": IDs of articles that are unique (no duplicates found)`;

  try {
    console.log('[llm-dedup] Sending', articles.length, 'articles for LLM deduplication...');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      console.error('[llm-dedup] No text response');
      return articles;
    }

    let cleaned = textContent.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[llm-dedup] Could not parse JSON');
      return articles;
    }

    const result = JSON.parse(jsonMatch[0]);

    // Collect all IDs to keep
    const keepIds = new Set<number>();

    // Add IDs from unique articles (deduplicated groups)
    if (result.uniqueArticles) {
      for (const group of result.uniqueArticles) {
        keepIds.add(group.keepId);
        console.log(`[llm-dedup] Keeping article ${group.keepId} for "${group.story}" (dropping ${group.duplicateIds?.length || 0} duplicates)`);
      }
    }

    // Add standalone IDs
    if (result.standalone) {
      for (const id of result.standalone) {
        keepIds.add(id);
      }
    }

    // Filter to kept articles
    const dedupedArticles = articles.filter((_, i) => keepIds.has(i));

    const removedCount = articles.length - dedupedArticles.length;
    console.log(`[llm-dedup] Reduced ${articles.length} → ${dedupedArticles.length} articles (removed ${removedCount} duplicates)`);

    return dedupedArticles;
  } catch (error) {
    console.error('[llm-dedup] Error:', error);
    return articles; // Return original on error
  }
}

/**
 * Historical Deduplication: Check new articles against database (last 30 days)
 * Uses LLM to identify if new articles cover the same story as existing ones
 */
async function deduplicateAgainstDatabase(
  newArticles: RawArticle[],
  onProgress?: (progress: number, message: string, stepUpdate?: { index: number; status: 'in_progress' | 'completed' | 'error'; detail?: string }) => Promise<void>
): Promise<RawArticle[]> {
  if (newArticles.length === 0) {
    return newArticles;
  }

  // Fetch recent articles from database (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const existingArticles = await prisma.newsArticle.findMany({
    where: {
      fetchedAt: { gte: thirtyDaysAgo },
    },
    select: {
      id: true,
      headline: true,
      sourceUrl: true,
      shortSummary: true,
      publishedAt: true,
    },
    orderBy: { fetchedAt: 'desc' },
  });

  if (existingArticles.length === 0) {
    console.log('[hist-dedup] No existing articles in database, skipping historical dedup');
    return newArticles;
  }

  console.log(`[hist-dedup] Checking ${newArticles.length} new articles against ${existingArticles.length} existing articles`);

  // First pass: URL matching (fast, exact)
  const existingUrls = new Set(existingArticles.map(a => a.sourceUrl.toLowerCase()));
  const urlFiltered = newArticles.filter(article => {
    const urlLower = article.sourceUrl.toLowerCase();
    if (existingUrls.has(urlLower)) {
      console.log(`[hist-dedup] URL match found, skipping: ${article.headline}`);
      return false;
    }
    return true;
  });

  if (urlFiltered.length === 0) {
    console.log('[hist-dedup] All new articles already exist by URL');
    return [];
  }

  // If we have more than 50 articles to compare, use LLM for semantic comparison
  // For smaller batches, the URL check is sufficient
  if (urlFiltered.length > 20 || existingArticles.length > 100) {
    // Use LLM for semantic deduplication against historical articles
    const result = await llmHistoricalDedup(urlFiltered, existingArticles);
    console.log(`[hist-dedup] After LLM check: ${result.length} unique articles`);
    return result;
  }

  return urlFiltered;
}

/**
 * LLM-based historical deduplication
 * Compares new articles against existing database articles to find semantic duplicates
 */
async function llmHistoricalDedup(
  newArticles: RawArticle[],
  existingArticles: Array<{ id: string; headline: string; sourceUrl: string; shortSummary: string | null; publishedAt: Date | null }>
): Promise<RawArticle[]> {
  // Format existing articles for comparison (limit to avoid token overflow)
  const existingForPrompt = existingArticles.slice(0, 100).map((a, i) => ({
    id: `E${i}`,
    headline: a.headline,
    summary: a.shortSummary || '',
    publishedAt: a.publishedAt?.toISOString().split('T')[0] || 'unknown',
  }));

  // Format new articles
  const newForPrompt = newArticles.map((a, i) => ({
    id: `N${i}`,
    headline: a.headline,
    description: a.description || '',
    publishedAt: a.publishedAt?.toISOString().split('T')[0] || 'unknown',
  }));

  const prompt = `You are deduplicating news articles. Compare the NEW articles against EXISTING articles in our database to identify duplicates.

## EXISTING ARTICLES (already in database, last 30 days)
${JSON.stringify(existingForPrompt, null, 2)}

## NEW ARTICLES (to evaluate)
${JSON.stringify(newForPrompt, null, 2)}

## Task
Identify which NEW articles are duplicates of EXISTING articles. Two articles are duplicates if they cover THE SAME story/event, even if from different sources.

Return JSON with the IDs of NEW articles that should be KEPT (not duplicates):
{
  "keepIds": ["N0", "N2", "N5"],
  "duplicates": [
    {"newId": "N1", "existingId": "E3", "reason": "Same M&A announcement"}
  ]
}

If you're unsure whether an article is a duplicate, EXCLUDE it (don't include in keepIds).`;

  try {
    console.log('[hist-dedup] Sending to LLM for semantic comparison...');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      console.error('[hist-dedup] No text response from LLM');
      return newArticles;
    }

    let cleaned = textContent.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[hist-dedup] Could not parse LLM response');
      return newArticles;
    }

    const result = JSON.parse(jsonMatch[0]);
    const keepIds = new Set(result.keepIds || []);

    // Log duplicates found
    if (result.duplicates && result.duplicates.length > 0) {
      for (const dup of result.duplicates) {
        console.log(`[hist-dedup] Duplicate found: ${dup.newId} matches ${dup.existingId} - ${dup.reason}`);
      }
    }

    // Filter to kept articles
    const keptArticles = newArticles.filter((_, i) => keepIds.has(`N${i}`));
    const removedCount = newArticles.length - keptArticles.length;
    console.log(`[hist-dedup] Reduced ${newArticles.length} → ${keptArticles.length} (removed ${removedCount} historical duplicates)`);

    return keptArticles;
  } catch (error) {
    console.error('[hist-dedup] LLM error:', error);
    return newArticles; // Return original on error
  }
}

// Legacy exports for backward compatibility
export { fetchNewsHybrid as fetchNewsForCallDiets };

/**
 * Deep Dive search for specific company/person
 * Uses the same strict filtering as the main refresh
 */
export async function searchNews(params: {
  company?: string;
  person?: string;
  topics?: string[]; // Kept for compatibility but not used
  days?: number;
}): Promise<FetchResult> {
  const { company, person, days = 1 } = params;

  if (!company && !person) {
    return { articles: [], coverageGaps: [] };
  }

  const timeDescription = days === 1 ? 'last 24 hours' : `last ${days} days`;
  const entityName = company || person;
  const entityType = company ? 'company' : 'person';

  const searchPrompt = `You are a news intelligence analyst helping consultants prepare for client engagements. Search for recent news (${timeDescription} only) about:

${company ? `Company: ${company}` : ''}
${person ? `Person: ${person}` : ''}

## STRICT Filtering Rules - EXCLUDE these types of articles (when in doubt, EXCLUDE — be aggressive about filtering):
- Articles where ${entityName} is mentioned only tangentially or for context
- Articles about a different entity with a similar name
- General industry news without specific focus on ${entityName}
- Generic press releases with no substantive news
- Routine product updates without strategic significance
- Event sponsorship or award/recognition announcements
- Minor personnel changes (non-executive level)
- Rehashed information from prior announcements
- Opinion pieces without new factual information
- Historical references without current relevance
- Speculation without substantive basis
${company ? `- **CRITICAL: Analyst ratings, upgrades, or downgrades where ${company} is the ANALYST (not the subject)** - e.g., if ${company} downgrades another company's stock, EXCLUDE this because ${company} is just the analyst providing the rating, not the subject of the news
- Articles where ${company} is providing analysis, ratings, commentary, or research about OTHER companies` : ''}
- **ALL marketing, advertising, promotional, and brand content** — this includes but is not limited to: marketing campaign launches, advertising initiatives, brand promotion activities, product launch announcements that are purely promotional, sponsorship deals, influencer partnerships, social media campaigns, brand awareness initiatives, promotional partnerships, customer engagement programs, loyalty programs, seasonal promotions, and any article that reads like an advertisement or press release promoting products/services rather than reporting substantive business news
- **ALL content that is promotional in tone or purpose** — if the article's primary intent is to promote, market, or advertise a product, service, event, or brand rather than report on material business developments, EXCLUDE it regardless of the specific category
- Price target changes, analyst price target updates, or stock rating changes for the ${entityType}'s shares
- **ALL earnings date announcements and scheduling notices** — EXCLUDE any article about UPCOMING quarterly/annual earnings (e.g., "${entityName} to report Q3 earnings on DATE", "${entityName} scheduled to release earnings", "earnings call scheduled for", "reports earnings next week"). Only include articles that contain ACTUAL published earnings results with specific financial figures
- **ALL routine share transactions** — EXCLUDE share purchases, stock buybacks, insider trading/selling, secondary offerings, block trades, share repurchase programs, and insider ownership changes UNLESS the transaction represents a complete sale of a business/division, a controlling share acquisition (>50% stake), a hostile or friendly takeover attempt, or a significant activist stake (>10%) with stated intent to influence corporate strategy
${company ? `- News about ${company} being an underwriter or bookrunner for IPOs where ${company} is the underwriter, not the company going public` : ''}
- Analyst recommendations, "buy/sell/hold" ratings, or stock picks where ${entityName}'s stock is being rated (not actionable business news)

## KEEP only articles that are definitively ABOUT ${entityName} as the main subject and cover:
- Mergers, acquisitions, divestitures, strategic partnerships
- C-suite appointments/departures, board changes
- Earnings releases with actual financial results, significant revenue/profit changes
- Major contract wins/losses, facility changes
- PE/VC investments, debt refinancing, IPOs
- Market share changes, competitive threats
- Technology implementations, workforce restructuring
- Complete business/division sales, controlling share acquisitions or takeovers

## Instructions
1. Search comprehensively but filter strictly - when in doubt, EXCLUDE
2. The article must be primarily ABOUT ${entityName}, not just mentioning them
3. Generate both short (1-2 sentences) and long (3-5 sentences) summaries
4. Explain why it matters for client engagement

## Output Format
Return ONLY valid JSON (no markdown, no backticks):
{
  "articles": [
    {
      "headline": "Article headline",
      "shortSummary": "1-2 sentence preview",
      "longSummary": "3-5 sentence detailed summary",
      "whyItMatters": "Why this matters for client engagement",
      "sourceUrl": "https://...",
      "sourceName": "Source name",
      "sources": [{"sourceUrl": "https://...", "sourceName": "Source name", "fetchLayer": "layer2_llm"}],
      "publishedAt": "2026-01-15",
      "company": "${company || 'null'}",
      "person": "${person || 'null'}",
      "category": "Topic category",
      "status": "new_article",
      "matchType": "exact",
      "fetchLayer": "layer2_llm",
      "userNames": []
    }
  ],
  "coverageGaps": []
}

Return only HIGH-QUALITY, RELEVANT articles where ${entityName} is the PRIMARY subject.`;

  console.log(`[search] Ad-hoc search for company="${company}", person="${person}"`);

  try {
    const response = await withRetry(
      () => anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 5,
          } as any,
        ],
        messages: [
          {
            role: 'user',
            content: searchPrompt,
          },
        ],
      }),
      { maxRetries: 2, baseDelayMs: 2000, maxDelayMs: 15000 }
    );

    const textBlocks = response.content.filter((c) => c.type === 'text');
    const textContent = textBlocks[textBlocks.length - 1];

    if (!textContent || textContent.type !== 'text') {
      console.error('[search] No text response from Claude');
      return { articles: [], coverageGaps: [] };
    }

    let cleaned = textContent.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*"articles"[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('[search] Error:', error);
    return { articles: [], coverageGaps: [] };
  }
}
