/**
 * Layer 1 News Fetcher - Deterministic RSS/API Sources
 * Provides reliable, reproducible news fetching via RSS feeds and APIs
 */

import Parser from 'rss-parser';

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'SSA-Intelligence/1.0 (News Aggregator)',
  },
});

/**
 * Resolve Google News redirect URL to the actual article URL.
 * Google News uses encoded redirect URLs that need to be followed.
 */
async function resolveGoogleNewsUrl(googleUrl: string): Promise<string> {
  // If it's not a Google News redirect URL, return as-is
  if (!googleUrl.includes('news.google.com/rss/articles/')) {
    return googleUrl;
  }

  try {
    // Follow the redirect to get the actual article URL
    const response = await fetch(googleUrl, {
      method: 'HEAD',
      redirect: 'manual',
      headers: {
        'User-Agent': 'SSA-Intelligence/1.0 (News Aggregator)',
      },
    });

    // Check for redirect location
    const location = response.headers.get('location');
    if (location) {
      // Google News may do multiple redirects, follow them
      if (location.includes('news.google.com')) {
        return resolveGoogleNewsUrl(location);
      }
      return location;
    }

    // If no redirect, try following with redirect enabled
    const fullResponse = await fetch(googleUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'SSA-Intelligence/1.0 (News Aggregator)',
      },
    });

    // Return the final URL after redirects
    return fullResponse.url || googleUrl;
  } catch (error) {
    console.warn(`[layer1] Failed to resolve Google News URL: ${googleUrl}`, error);
    return googleUrl; // Return original URL as fallback
  }
}

export interface RawArticle {
  headline: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  fetchLayer: 'layer1_rss' | 'layer1_api' | 'layer2_llm';
  queryUsed?: string;
}

/**
 * Fetch news from Google News RSS for a company or person
 */
export async function fetchGoogleNewsRSS(query: string): Promise<RawArticle[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

  try {
    console.log(`[layer1] Fetching Google News RSS for: "${query}"`);
    const feed = await rssParser.parseURL(url);

    // Resolve Google News redirect URLs to actual article URLs
    const articlesWithResolvedUrls = await Promise.all(
      feed.items.slice(0, 15).map(async (item) => {
        const resolvedUrl = await resolveGoogleNewsUrl(item.link || '');
        return {
          headline: item.title || '',
          description: item.contentSnippet || item.content || '',
          sourceUrl: resolvedUrl,
          sourceName: extractSourceFromGoogleNews(item.title || ''),
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          fetchLayer: 'layer1_rss' as const,
          queryUsed: query,
        };
      })
    );

    return articlesWithResolvedUrls;
  } catch (error) {
    console.error(`[layer1] Failed to fetch Google News for "${query}":`, error);
    return [];
  }
}

/**
 * Extract the actual source name from Google News title format
 * Google News titles are often "Headline - Source Name"
 */
function extractSourceFromGoogleNews(title: string): string {
  const parts = title.split(' - ');
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return 'Google News';
}


/**
 * Fetch news from PE/Industry RSS feeds
 */
export async function fetchPEFeeds(): Promise<RawArticle[]> {
  const feeds = [
    { url: 'https://www.altassets.net/feed', name: 'AltAssets' },
    { url: 'https://www.prnewswire.com/rss/financial-services-news.rss', name: 'PR Newswire Finance' },
    { url: 'https://www.prnewswire.com/rss/mergers-and-acquisitions-news.rss', name: 'PR Newswire M&A' },
  ];

  const allArticles: RawArticle[] = [];

  for (const feed of feeds) {
    try {
      console.log(`[layer1] Fetching PE feed: ${feed.name}`);
      const parsedFeed = await rssParser.parseURL(feed.url);

      const articles = parsedFeed.items.slice(0, 20).map((item) => ({
        headline: item.title || '',
        description: item.contentSnippet || item.content || '',
        sourceUrl: item.link || '',
        sourceName: feed.name,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        fetchLayer: 'layer1_rss' as const,
      }));

      allArticles.push(...articles);
      console.log(`[layer1] Found ${articles.length} articles from ${feed.name}`);
    } catch (error) {
      console.error(`[layer1] Failed to fetch ${feed.name}:`, error);
    }
  }

  return allArticles;
}

/**
 * Filter PE feed articles to match Call Diet companies/people
 */
export function filterPEFeedArticles(
  articles: RawArticle[],
  companies: string[],
  people: string[]
): RawArticle[] {
  const companyPatterns = companies.map((c) => new RegExp(escapeRegex(c), 'i'));
  const peoplePatterns = people.map((p) => new RegExp(escapeRegex(p), 'i'));

  return articles.filter((article) => {
    const text = `${article.headline} ${article.description}`.toLowerCase();

    // Check if article mentions any tracked company or person
    const matchesCompany = companyPatterns.some((pattern) => pattern.test(text));
    const matchesPerson = peoplePatterns.some((pattern) => pattern.test(text));

    return matchesCompany || matchesPerson;
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize URL by removing tracking parameters and standardizing format
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'ref', 'source', 'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    // Remove trailing slashes and normalize
    return parsed.origin + parsed.pathname.replace(/\/+$/, '') +
           (parsed.searchParams.toString() ? '?' + parsed.searchParams.toString() : '');
  } catch {
    return url.toLowerCase().trim();
  }
}

/**
 * Create a content fingerprint from headline and description
 * Normalizes text to catch near-duplicates with minor variations
 */
function createContentFingerprint(headline: string, description: string): string {
  const text = `${headline} ${description}`.toLowerCase()
    // Remove source attribution (e.g., "- Reuters", "| Bloomberg")
    .replace(/\s*[-|]\s*[a-z0-9\s]+$/i, '')
    // Remove punctuation
    .replace(/[^\w\s]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Extract significant words (skip very short words)
  const words = text.split(' ').filter(w => w.length > 3);

  // Take first 15 significant words for fingerprint
  return words.slice(0, 15).sort().join('|');
}

/**
 * Calculate similarity between two strings (Jaccard similarity on words)
 */
function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

/**
 * Extract event signature from headline for same-event detection
 * Returns: "company|eventType|target" or null
 */
function extractEventSignature(headline: string): string | null {
  const text = headline.toLowerCase();

  // Deal/M&A patterns: "X acquires Y", "X to sell Y", "X invests in Y"
  const dealPatterns = [
    /(\w+(?:\s+\w+)?)\s+(?:acquires?|acquired|buying|buys|bought)\s+(\w+(?:\s+\w+)?)/i,
    /(\w+(?:\s+\w+)?)\s+(?:to\s+)?sell[s]?\s+(\w+(?:\s+\w+)?)/i,
    /(\w+(?:\s+\w+)?)\s+(?:invests?|invested|investing)\s+(?:in\s+)?(\w+(?:\s+\w+)?)/i,
    /(\w+(?:\s+\w+)?)\s+(?:agrees?\s+to\s+)?(?:acquire|sell|buy)\s+(\w+(?:\s+\w+)?)/i,
    /(\w+(?:\s+\w+)?)\s+secures?\s+investment\s+from\s+(\w+(?:\s+\w+)?)/i,
  ];

  for (const pattern of dealPatterns) {
    const match = text.match(pattern);
    if (match) {
      const company1 = match[1].trim().replace(/[^a-z\s]/g, '');
      const company2 = match[2].trim().replace(/[^a-z\s]/g, '');
      return `deal|${company1}|${company2}`;
    }
  }

  // Fundraising patterns: "X raises $Y", "X closes fund"
  const fundPatterns = [
    /(\w+(?:\s+\w+)?)\s+(?:raises?|raised|closes?|closed)\s+.*?(\$[\d.]+[bmk]|\d+(?:\.\d+)?\s*(?:billion|million|bn|b))/i,
  ];

  for (const pattern of fundPatterns) {
    const match = text.match(pattern);
    if (match) {
      const company = match[1].trim().replace(/[^a-z\s]/g, '');
      return `fund|${company}`;
    }
  }

  // Earnings patterns: "X beats estimates", "X profits soar"
  const earningsPatterns = [
    /(\w+(?:\s+\w+)?)\s+(?:beats?|tops?|exceeds?|misses?)\s+(?:profit|earnings?|estimates?)/i,
    /(\w+(?:\s+\w+)?)\s+(?:profits?|earnings?)\s+(?:soar|surge|jump|fall|drop)/i,
  ];

  for (const pattern of earningsPatterns) {
    const match = text.match(pattern);
    if (match) {
      const company = match[1].trim().replace(/[^a-z\s]/g, '');
      return `earnings|${company}`;
    }
  }

  return null;
}

/**
 * Deduplicate articles using multi-layer approach:
 * 1. Normalized URL matching
 * 2. Event signature matching (same company + event type)
 * 3. Content fingerprint matching (headline + description)
 * 4. High similarity detection (>60% word overlap)
 */
export function deduplicateArticles(articles: RawArticle[]): RawArticle[] {
  const unique: RawArticle[] = [];
  const seenUrls = new Set<string>();
  const seenFingerprints = new Set<string>();
  const seenEvents = new Set<string>();

  // Sort by publishedAt desc so we keep the most recent version
  const sorted = [...articles].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  for (const article of sorted) {
    // Layer 1: Normalized URL check
    const normalizedUrl = normalizeUrl(article.sourceUrl);
    if (seenUrls.has(normalizedUrl)) {
      continue;
    }

    // Layer 2: Event signature check (same company + event type = duplicate)
    const eventSig = extractEventSignature(article.headline);
    if (eventSig && seenEvents.has(eventSig)) {
      console.log(`[dedup] Skipping duplicate event: "${article.headline.substring(0, 50)}..." (event: ${eventSig})`);
      continue;
    }

    // Layer 3: Content fingerprint check
    const fingerprint = createContentFingerprint(article.headline, article.description);
    if (fingerprint.length > 10 && seenFingerprints.has(fingerprint)) {
      continue;
    }

    // Layer 4: Similarity check against existing articles (lowered to 60%)
    const combinedText = `${article.headline} ${article.description}`;
    const isDuplicate = unique.some(existing => {
      const existingText = `${existing.headline} ${existing.description}`;
      const similarity = calculateSimilarity(combinedText, existingText);
      return similarity > 0.6; // 60% threshold (was 80%)
    });

    if (isDuplicate) {
      continue;
    }

    // Article is unique - add it
    seenUrls.add(normalizedUrl);
    if (eventSig) {
      seenEvents.add(eventSig);
    }
    if (fingerprint.length > 10) {
      seenFingerprints.add(fingerprint);
    }
    unique.push(article);
  }

  console.log(`[dedup] Reduced ${articles.length} → ${unique.length} articles (removed ${articles.length - unique.length} duplicates)`);
  return unique;
}

/**
 * Filter articles to only include those from the last N days
 */
export function filterRecentArticles(articles: RawArticle[], days: number = 7): RawArticle[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return articles.filter((article) => article.publishedAt >= cutoff);
}
