/**
 * Hybrid News Fetcher Service
 * Layer 1: Deterministic RSS/API fetching (guaranteed baseline coverage)
 * Layer 2: Claude web search (contextual gap filling and enrichment)
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  fetchGoogleNewsRSS,
  fetchSECFilings,
  fetchPEFeeds,
  filterPEFeedArticles,
  deduplicateArticles,
  filterRecentArticles,
  RawArticle,
} from './layer1-fetcher.js';

const anthropic = new Anthropic();

export interface CallDietInput {
  revenueOwnerId: string;
  revenueOwnerName: string;
  companies: Array<{ name: string; ticker?: string; cik?: string }>;
  people: Array<{ name: string; title?: string }>;
  topics: string[]; // Kept for backward compatibility but not used in search
}

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
  priority: 'high' | 'medium' | 'low';
  priorityScore: number;        // 1-10 for sorting (hidden from UI)
  status: 'new_article' | 'update';
  matchType: 'exact' | 'contextual';
  fetchLayer: 'layer1_rss' | 'layer1_api' | 'layer2_llm';
  revenueOwners: string[];
}

export interface CoverageGap {
  company: string;
  revenueOwner?: string;
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
  onProgress?: ProgressCallback
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
  const allCompanies = new Map<string, { name: string; ticker?: string; cik?: string }>();
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
  await onProgress?.(10, 'Starting Layer 1 (RSS/APIs) and Layer 2 (AI Search) in parallel...', { index: 1, status: 'in_progress' });
  console.log('[hybrid] Starting Layer 1 and Layer 2 in parallel...');

  // Run Layer 1 and Layer 2 concurrently
  const [layer1Results, layer2Articles] = await Promise.all([
    // Layer 1: RSS/API fetch
    (async () => {
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

      // Fetch SEC filings for companies with CIK
      let secFilingsCount = 0;
      const companiesWithCIK = companies.filter(c => c.cik);
      for (const company of companiesWithCIK) {
        if (company.cik) {
          const filings = await fetchSECFilings(company.cik, company.name);
          secFilingsCount += filings.length;
          layer1Articles.push(...filings);
        }
      }

      console.log(`[layer1] SEC filings: ${secFilingsCount} articles`);

      // Fetch PE industry feeds and filter for relevant mentions
      const peFeedArticles = await fetchPEFeeds();
      const relevantPEArticles = filterPEFeedArticles(
        peFeedArticles,
        companies.map((c) => c.name),
        people.map((p) => p.name)
      );
      layer1Articles.push(...relevantPEArticles);

      console.log(`[layer1] PE feeds: ${relevantPEArticles.length} relevant articles`);

      return layer1Articles;
    })(),

    // Layer 2: Claude web search (runs independently for ALL companies/people)
    fetchLayer2Contextual(
      companies.map((c) => c.name),
      people.slice(0, 10).map((p) => p.name) // Top 10 people
    ),
  ]);

  const layer1Articles = layer1Results;
  stats.layer1Articles = layer1Articles.length;
  stats.layer2Articles = layer2Articles.length;

  console.log(`[hybrid] Layer 1 complete: ${layer1Articles.length} articles`);
  console.log(`[hybrid] Layer 2 complete: ${layer2Articles.length} articles`);

  await onProgress?.(20, `Layer 1: ${layer1Articles.length} articles`, { index: 1, status: 'completed', detail: `${layer1Articles.length} from RSS/APIs` });
  await onProgress?.(25, 'Fetched SEC EDGAR filings', { index: 2, status: 'completed', detail: 'Included in Layer 1' });
  await onProgress?.(30, 'Scanned PE industry feeds', { index: 3, status: 'completed', detail: 'Included in Layer 1' });
  await onProgress?.(40, `Layer 2: ${layer2Articles.length} articles`, { index: 4, status: 'completed', detail: `${layer2Articles.length} from AI web search` });

  // ═══════════════════════════════════════════════════════════════════
  // COMBINE & DEDUPLICATE (Two-phase: heuristic + LLM)
  // ═══════════════════════════════════════════════════════════════════
  await onProgress?.(58, 'Phase 1: Heuristic deduplication...', { index: 5, status: 'in_progress' });

  const allRawArticles = [...layer1Articles, ...layer2Articles];
  stats.totalRaw = allRawArticles.length;

  // Phase 1: Fast heuristic dedup (URL, fingerprint, similarity)
  const heuristicDeduped = deduplicateArticles(allRawArticles);
  const recentArticles = filterRecentArticles(heuristicDeduped, 3); // 72 hours = 3 days

  console.log(`[hybrid] After heuristic dedup: ${recentArticles.length} articles`);

  await onProgress?.(62, `Heuristic dedup: ${allRawArticles.length} → ${recentArticles.length}`, { index: 5, status: 'in_progress', detail: 'Now running LLM deduplication...' });

  // Phase 2: LLM-based semantic deduplication (pick best source per story)
  const llmDeduped = await deduplicateWithLLM(recentArticles, onProgress);
  stats.afterDedup = llmDeduped.length;

  console.log(`[hybrid] After LLM dedup: ${llmDeduped.length} articles`);

  await onProgress?.(68, `Deduplicated to ${llmDeduped.length} unique articles`, { index: 5, status: 'completed', detail: `${allRawArticles.length} raw → ${recentArticles.length} (heuristic) → ${llmDeduped.length} (LLM)` });

  // ═══════════════════════════════════════════════════════════════════
  // PROCESS WITH LLM
  // ═══════════════════════════════════════════════════════════════════
  await onProgress?.(70, 'Processing articles with Claude AI...', { index: 6, status: 'in_progress' });

  const processed = await processArticlesWithLLM(
    llmDeduped,
    callDiets,
    companies.map((c) => c.name),
    people.map((p) => p.name)
  );

  stats.afterProcessing = processed.articles.length;

  await onProgress?.(90, `Processed ${processed.articles.length} relevant articles`, { index: 6, status: 'completed', detail: `${processed.articles.length} categorized, ${processed.coverageGaps.length} gaps identified` });

  console.log(`[hybrid] Final: ${processed.articles.length} articles, ${processed.coverageGaps.length} gaps`);

  return {
    ...processed,
    stats,
  };
}

/**
 * Layer 2: Claude web search for comprehensive discovery
 * Searches for news in the last 72 hours for ALL companies and people
 */
async function fetchLayer2Contextual(
  companies: string[],
  people: string[]
): Promise<RawArticle[]> {
  if (companies.length === 0 && people.length === 0) {
    return [];
  }

  const searchPrompt = `You are a news intelligence analyst. Search for recent news (last 72 hours / 3 days only) about these companies and people. This is an INDEPENDENT search to complement RSS feeds - search comprehensively.

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
- Only include articles published within the last 72 hours (3 days)
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

  try {
    console.log('[layer2] Starting Claude web search...');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        } as any,
      ],
      messages: [
        {
          role: 'user',
          content: searchPrompt,
        },
      ],
    });

    // Get the last text block
    const textBlocks = response.content.filter((c) => c.type === 'text');
    const textContent = textBlocks[textBlocks.length - 1];

    if (!textContent || textContent.type !== 'text') {
      console.error('[layer2] No text response from Claude');
      return [];
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*"results"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[layer2] Could not find JSON in response');
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const results = parsed.results || [];

    return results.map((r: any) => ({
      headline: r.headline || '',
      description: r.description || '',
      sourceUrl: r.sourceUrl || '',
      sourceName: r.sourceName || 'Web Search',
      publishedAt: r.publishedAt ? new Date(r.publishedAt) : new Date(),
      fetchLayer: 'layer2_llm' as const,
    }));
  } catch (error) {
    console.error('[layer2] Error in contextual search:', error);
    return [];
  }
}

/**
 * Process raw articles with LLM for filtering, categorization, and summarization
 * Focuses on consultant-client engagement usefulness for priority scoring
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

  // Build article summaries for LLM
  const articleSummaries = rawArticles.slice(0, 50).map((a, i) => ({
    id: i,
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

## Revenue Owner Mapping
${callDiets.map((cd) => `- ${cd.revenueOwnerName}: tracks ${cd.companies.map((c) => c.name).concat(cd.people.map((p) => p.name)).join(', ')}`).join('\n')}

## Instructions

1. **Filter out** (be lenient - when in doubt, include the article):
   - Clear duplicates of the same story
   - Completely generic industry commentary with no company-specific angle
   - Extremely routine announcements with no substance

2. **For each relevant article**:
   - Match to tracked company/person
   - Assign category: M&A / Deal Activity, Leadership Changes, Earnings & Operational Performance, Strategy, Value Creation / Cost Initiatives, Digital & Technology Modernization, Fundraising / New Funds, Operating Partner Activity, Supply Chain & Logistics, Plant & Footprint Changes
   - Assign priority: high (actionable), medium (notable), low (informational)
   - Assign priorityScore (1-10): Based on how useful this story would be for a consultant preparing to engage the company or person. Consider:
     * 9-10: Major deals, significant leadership changes, earnings surprises, strategic pivots
     * 7-8: Notable operational changes, new initiatives, meaningful partnerships
     * 5-6: Informative updates, industry context, minor developments
     * 3-4: Routine news, general mentions
     * 1-2: Tangentially related, minimal engagement value
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
      "priority": "high|medium|low",
      "priorityScore": 8,
      "status": "new_article",
      "matchType": "exact|contextual",
      "fetchLayer": "layer from input",
      "revenueOwners": ["Owner Name 1"]
    }
  ],
  "coverageGaps": [
    {
      "company": "Company name",
      "note": "No relevant news found"
    }
  ]
}

Return maximum 30 most relevant articles, sorted by priorityScore (highest first) then recency.`;

  try {
    console.log('[process] Sending articles to Claude for processing...');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
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
        articles: rawArticles.slice(0, 30).map((a) => ({
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
          priority: 'medium' as const,
          priorityScore: 5,
          status: 'new_article' as const,
          matchType: 'contextual' as const,
          fetchLayer: a.fetchLayer,
          revenueOwners: callDiets.map((cd) => cd.revenueOwnerName),
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
      const original = typeof a.id === 'number' ? rawArticles[a.id] : null;
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
        priority: a.priority || 'medium',
        priorityScore: a.priorityScore || 5,
        status: a.status || 'new_article',
        matchType: a.matchType || 'contextual',
        fetchLayer: a.fetchLayer || original?.fetchLayer || 'layer2_llm',
        revenueOwners: a.revenueOwners || [],
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
      articles: rawArticles.slice(0, 30).map((a) => ({
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
        priority: 'medium' as const,
        priorityScore: 5,
        status: 'new_article' as const,
        matchType: 'contextual' as const,
        fetchLayer: a.fetchLayer,
        revenueOwners: callDiets.map((cd) => cd.revenueOwnerName),
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
      model: 'claude-sonnet-4-20250514',
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

// Legacy exports for backward compatibility
export { fetchNewsHybrid as fetchNewsForCallDiets };

/**
 * Ad-hoc search for specific company/person
 * Searches within the last 72 hours
 */
export async function searchNews(params: {
  company?: string;
  person?: string;
  topics?: string[]; // Kept for compatibility but not used
}): Promise<FetchResult> {
  const { company, person } = params;

  if (!company && !person) {
    return { articles: [], coverageGaps: [] };
  }

  const searchPrompt = `You are a news intelligence analyst helping consultants prepare for client engagements. Search for recent news (last 72 hours / 3 days only) about:

${company ? `Company: ${company}` : ''}
${person ? `Person: ${person}` : ''}

## Instructions
1. Search for relevant news articles from the last 72 hours only
2. Filter out routine/generic content (be lenient - include when in doubt)
3. Categorize by topic
4. Assign priorityScore (1-10) based on usefulness for consultant-client engagement
5. Generate both short (1-2 sentences) and long (3-5 sentences) summaries
6. Explain why it matters for client engagement

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
      "priority": "high|medium|low",
      "priorityScore": 8,
      "status": "new_article",
      "matchType": "exact",
      "fetchLayer": "layer2_llm",
      "revenueOwners": []
    }
  ],
  "coverageGaps": []
}

Return maximum 10 most relevant articles, sorted by priorityScore.`;

  console.log(`[search] Ad-hoc search for company="${company}", person="${person}"`);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        } as any,
      ],
      messages: [
        {
          role: 'user',
          content: searchPrompt,
        },
      ],
    });

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
