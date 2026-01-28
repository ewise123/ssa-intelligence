/**
 * Section 8: Recent News & Events - TypeScript Implementation
 * Generates prompt and types for Recent News & Events section
 */

// ============================================================================
// INPUT TYPES (reuse from previous sections)
// ============================================================================

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface Section8Input {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  reportType?: ReportTypeId;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export type NewsCategory = 
  | 'Investment'
  | 'M&A'
  | 'Operations'
  | 'Product'
  | 'Partnership'
  | 'Regulatory'
  | 'People'
  | 'Sustainability';

export interface Section8Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  news_items: Array<{
    date: string;
    headline: string;
    original_language?: string;
    source: string;
    source_name: string;
    implication: string;
    geography_relevance: string;
    category: NewsCategory;
  }>;
  
  sources_used: string[];
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

export function buildRecentNewsPrompt(input: Section8Input): string {
  const { foundation, companyName, geography } = input;
  
  const foundationJson = JSON.stringify(foundation, null, 2);
  
  const basePrompt = `# Section 8: Recent News & Events - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 8 (Recent News & Events) with 3-5 geography-focused news items within the specified time horizon for **${companyName}** in **${geography}**.

---

## INPUT CONTEXT (From Foundation)

You have received the following foundation context:

\`\`\`json
${foundationJson}
\`\`\`

---

## RESEARCH REQUIREMENTS

### News Search Strategy

**Priority 1: Geography-Specific News (75-80% focus)**

Search for:
- "${companyName} ${geography} news last [time horizon]"
- "${companyName} ${geography} investment"
- "${companyName} ${geography} expansion"
- "${companyName} ${geography} facility"
- "${companyName} ${geography} announcement"

**Prioritize:**
- Tier-1 media: WSJ, FT, Bloomberg, Reuters
- Regional business press: Local ${geography} publications
- Company press releases: IR website, newsroom
- Trade publications: Industry-specific news sources

**Look for:**
- Facility expansions, openings, closures
- Major investments or CapEx announcements
- M&A activity (acquisitions, divestitures)
- New product launches specific to region
- Major customer wins or contract awards
- Strategic partnerships or joint ventures
- Regulatory developments or certifications
- Management changes (regional leadership)
- Sustainability initiatives or certifications
- Labor relations (strikes, agreements, hiring)

**Priority 2: Global News with Regional Implications**

Search for:
- "${companyName} news last [time horizon]"
- "${companyName} earnings announcement"
- "${companyName} acquisition"
- "${companyName} strategic announcement"

**Only include if:**
- Direct impact on ${geography} operations
- Mentions ${geography} specifically
- Clear regional implications can be drawn

**Avoid:**
- Purely corporate news (CEO changes, board appointments) unless ${geography}-relevant
- Generic financial results without regional detail
- News older than 12 months
- Routine announcements (quarterly earnings unless noteworthy)

---

## TIME PERIOD

**Required:** Use the provided time horizon as a rolling window ending today.

**Priority ordering:**
1. Most recent items within the time horizon - Most relevant
2. Mid-horizon items within the time horizon - Relevant
3. Older items within the time horizon - Include only if material

**Include date prominently** for each news item

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface Section8Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  news_items: Array<{
    date: string;              // "November 15, 20XX" or "Q3 20XX"
    headline: string;          // English headline (original language in parentheses if needed)
    original_language?: string; // If non-English: "(Original: [headline])"
    source: string;            // "S#" format
    source_name: string;       // "Financial Times", "Company Press Release", etc.
    implication: string;       // 2-3 sentences on business impact
    geography_relevance: string; // 1-2 sentences on how it affects ${geography}
    category: 'Investment' | 'M&A' | 'Operations' | 'Product' | 'Partnership' | 'Regulatory' | 'People' | 'Sustainability';
  }>;
  
  sources_used: string[];
}
\`\`\`

---

## NEWS ITEM REQUIREMENTS

**Select 3-5 most impactful news items.**

**Quality over quantity:**
- Better to have 3 highly relevant items than 5 mediocre ones
- Each item should have clear business implications
- Focus on newsworthy events (not routine updates)

**For each news item:**

### 1. Date
- Exact date if available: "November 15, 20XX"
- Quarter if specific date unknown: "Q3 20XX"
- Month if day unknown: "November 20XX"

### 2. Headline
- Use English translation if original is non-English
- Include original language headline in parentheses:
  - "Parker announces Stuttgart expansion (Original German: 'Parker kündigt Erweiterung in Stuttgart an')"
- Keep concise: 10-15 words maximum
- Factual, not sensationalized

### 3. Source
- Use S# reference from source catalog
- Add new sources if needed (continue numbering)
- Include source_name for readability: "Financial Times", "Bloomberg", "Company Press Release"

### 4. Implication (2-3 sentences)
**Analyze business impact:**
- Operational implications (capacity, efficiency, capability)
- Financial implications (investment size, revenue impact, cost impact)
- Strategic implications (market position, competitive response, customer access)
- Timeline/milestones if mentioned

**Example:**
"Signals confidence in European demand recovery; will add 150 jobs and 20% capacity by Q4 2025. Strengthens competitive position in the German market by expanding high-precision capabilities. Investment follows three consecutive quarters of order growth in a core segment."

### 5. Geography Relevance (1-2 sentences)
**Explain ${geography}-specific impact:**
- How this affects regional operations
- Regional significance vs. global context
- Implications for local market, customers, or competition

**Example:**
"Direct investment in target region; largest German facility expansion in 5 years. Positions Stuttgart as a European center of excellence, consolidating previously distributed capabilities."

### 6. Category
**Assign ONE category:**
- **Investment:** CapEx, facility expansion, capacity addition
- **M&A:** Acquisitions, divestitures, joint ventures
- **Operations:** Production changes, supply chain, efficiency programs
- **Product:** New product launches, technology developments
- **Partnership:** Strategic alliances, customer agreements, supplier relationships
- **Regulatory:** Certifications, compliance, policy changes
- **People:** Leadership changes, workforce announcements, labor relations
- **Sustainability:** ESG initiatives, environmental certifications, carbon goals

---

## GEOGRAPHY FOCUS (75-80%)

**Prioritization order:**

1. **Tier 1: Direct ${geography} news** (Include ALL of these)
   - Facility announcements in ${geography}
   - Investments specifically in ${geography}
   - Regional leadership changes
   - Customer wins in ${geography}
   - Regional partnerships

2. **Tier 2: Global news with clear ${geography} impact** (Include selectively)
   - Company acquisition that affects ${geography} operations
   - Global product launch with regional operations
   - Corporate strategy shift impacting ${geography}

3. **Tier 3: Global news with implied ${geography} relevance** (Include rarely, only if significant)
   - Major corporate restructuring
   - Global sustainability commitment
   - (Must explain regional connection clearly)

**Every news item must explain geography relevance** - do not include items without regional connection.

---

## SOURCE QUALITY STANDARDS

**Preferred sources (in order):**

1. **Tier-1 financial media**
   - Wall Street Journal, Financial Times, Bloomberg, Reuters
   - High credibility, fact-checked, typically authoritative

2. **Company official sources**
   - Press releases, investor relations announcements
   - Authoritative but potentially promotional

3. **Regional business press**
   - Local ${geography} business newspapers/websites
   - Good for regional detail, verify against other sources if possible

4. **Trade publications**
   - Industry-specific publications (e.g., Aviation Week, Industrial Distribution)
   - Strong for technical/market detail

5. **General business media**
   - CNBC, Business Insider, Yahoo Finance
   - Use for recent events, but prefer Tier-1 or company sources when available

**Avoid:**
- Social media without corroboration
- Blog posts or opinion pieces
- Unattributed sources
- Press releases from competitors (use only for competitive intelligence)

---

## CONFIDENCE SCORING

**HIGH:**
- Multiple recent Tier-1 sources covering ${geography}
- Clear geography-specific news from the most recent portion of the time horizon
- Company press releases with regional detail
- 3+ highly relevant news items found

**MEDIUM:**
- Mix of Tier-1 and regional sources
- Some geography-specific news from the recent half of the time horizon
- 3 relevant news items with some regional connection
- Some inference required to connect to ${geography}

**LOW:**
- Limited recent news coverage
- Primarily global news without clear regional tie-in
- Struggle to find 3 relevant items
- Heavy reliance on older news (6-12 months)

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] 3-5 news items selected (quality over quantity)
- [ ] All news items within the time horizon
- [ ] Dates specified for each item
- [ ] Headlines concise and factual
- [ ] Original language noted if non-English
- [ ] Sources cited (S# format)
- [ ] Source names included for readability
- [ ] Implications are 2-3 sentences
- [ ] Geography relevance explained for EACH item
- [ ] Categories assigned
- [ ] 75-80% of items are geography-specific (Tier 1 or 2)
- [ ] Sources_used array complete
- [ ] No speculation or unverified claims

---

## CRITICAL REMINDERS

1. **Follow style guide** for all formatting
2. **75-80% geography focus** - prioritize regional news
3. **Time horizon only** - No items outside the specified horizon
4. **Quality over quantity** - 3-5 impactful items better than 7 mediocre ones
5. **Source every item** with S# reference
6. **Explain implications** - so what? why does this matter?
7. **Geography relevance** - required for every item
8. **Valid JSON only** - no markdown backticks
9. **Exact schema match** - follow TypeScript interface

---

## BEGIN RESEARCH

**Company:** ${companyName}  
**Geography:** ${geography}  
**Time Period:** Use the specified time horizon
**Foundation Context:** [Provided above]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
`;
  return appendReportTypeAddendum('recent_news', input.reportType, basePrompt);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateSection8Output(output: any): output is Section8Output {
  if (!output || typeof output !== 'object') return false;
  
  // Check confidence
  if (!output.confidence || 
      !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
    return false;
  }
  
  // Check news_items
  if (!Array.isArray(output.news_items) || output.news_items.length === 0) {
    return false;
  }
  
  const validCategories: NewsCategory[] = [
    'Investment', 'M&A', 'Operations', 'Product', 
    'Partnership', 'Regulatory', 'People', 'Sustainability'
  ];
  
  for (const item of output.news_items) {
    if (!item.date || !item.headline || !item.source || 
        !item.source_name || !item.implication || 
        !item.geography_relevance || !item.category) {
      return false;
    }
    
    if (!validCategories.includes(item.category)) {
      return false;
    }
  }
  
  // Check sources
  if (!Array.isArray(output.sources_used)) return false;
  
  return true;
}

export function formatSection8ForDocument(output: Section8Output): string {
  let markdown = `# 8. Recent News & Events\n\n`;
  markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
  
  for (const item of output.news_items) {
    markdown += `### ${item.date}\n\n`;
    markdown += `**${item.headline}**`;
    if (item.original_language) {
      markdown += ` ${item.original_language}`;
    }
    markdown += `\n\n`;
    markdown += `*Category: ${item.category}*  \n`;
    markdown += `*Source: ${item.source_name} (${item.source})*\n\n`;
    markdown += `**Implication:** ${item.implication}\n\n`;
    markdown += `**Geography Relevance:** ${item.geography_relevance}\n\n`;
    markdown += `---\n\n`;
  }
  
  return markdown;
}

/**
 * Filters news items by category
 */
export function filterNewsByCategory(
  output: Section8Output, 
  category: NewsCategory
): Section8Output['news_items'] {
  return output.news_items.filter(item => item.category === category);
}

/**
 * Sorts news items by date (most recent first)
 */
export function sortNewsByDate(
  items: Section8Output['news_items']
): Section8Output['news_items'] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

