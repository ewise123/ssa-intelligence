/**
 * Section 4: Segment Analysis - TypeScript Implementation
 * Comprehensive implementation with fallback strategy for large responses
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface Section2Context {
  kpi_table: {
    metrics: Array<{
      metric: string;
      company: number | string;
      industry_avg: number | string;
      source: string;
    }>;
  };
  summary: string;
}

export interface Section4Input {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  section2Context?: Section2Context;
  reportType?: ReportTypeId;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface SegmentFinancialMetric {
  metric: string;
  segment: number | string;
  company_avg: number | string;
  industry_avg: number | string;
  source: string;
}

export interface AnalystQuote {
  quote: string;
  analyst: string;
  firm: string;
  source: string;
}

export interface Competitor {
  name: string;
  market_share?: string;
  geography: string;
}

export interface SegmentAnalysis {
  name: string;
  
  financial_snapshot: {
    table: SegmentFinancialMetric[];
    fx_source: string;
    geography_notes: string;
  };
  
  performance_analysis: {
    paragraphs: string[];
    analyst_quotes: AnalystQuote[];
    key_drivers: string[];
  };
  
  competitive_landscape: {
    competitors: Competitor[];
    positioning: string;
    recent_dynamics: string;
  };
}

export interface Section4Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  overview: string;
  segments: SegmentAnalysis[];
  sources_used: string[];
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

/**
 * Builds comprehensive prompt attempting all segments in one call
 */
export function buildSegmentAnalysisPrompt(input: Section4Input): string {
  const { foundation, companyName, geography, section2Context } = input;
  
  const segmentCount = foundation.segment_structure.length;
  const segmentNames = foundation.segment_structure.map(s => s.name).join(', ');
  
  const foundationJson = JSON.stringify(foundation, null, 2);
  const section2Json = section2Context ? JSON.stringify(section2Context, null, 2) : 'Not provided';
  
  const basePrompt = `# Section 4: Segment Analysis - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 4 (Segment Analysis) with comprehensive analysis for EACH business segment of **${companyName}** in **${geography}**.

---

## COMPLEXITY NOTICE

**This section is LARGE and may require fallback strategy:**

If the response gets truncated or you cannot complete all segments in one call, the system will use a **per-segment fallback strategy** where each segment is generated individually and combined later.

**In this prompt:** Attempt to generate ALL segments in one comprehensive response.

---

## INPUT CONTEXT

### Required: Foundation Context

\`\`\`json
${foundationJson}
\`\`\`

### Optional: Section 2 Context (Financial Snapshot)

\`\`\`json
${section2Json}
\`\`\`

---

## RESEARCH REQUIREMENTS

### Primary Data Source: 10-K/10-Q Segment Reporting

**Priority: CRITICAL**

**For public companies:**

**Search for:**
- "${companyName} latest 10-K" OR "${companyName} latest 20-F"
- "${companyName} most recent 10-Q"
- "${companyName} investor presentation segments"

**Navigate to segment reporting sections in 10-K/10-Q**

**Extract for EACH segment:**
- Segment revenue (within the time horizon + latest quarter if available)
- Operating income/EBITDA by segment
- Operating margin by segment
- Geographic revenue breakdown by segment
- Key performance metrics

### Segment-Specific Research

**For EACH of the ${segmentCount} segments:**

#### 1. Financial Performance (Priority: CRITICAL)

**Search for:**
- "${companyName} [segment name] revenue"
- "${companyName} [segment name] ${geography}"
- "${companyName} earnings transcript [segment name]"

#### 2. Performance Drivers (Priority: HIGH)

**Search for:**
- "${companyName} [segment name] growth drivers"
- "${companyName} earnings call [segment name]"

**Extract ${geography}-specific drivers**

#### 3. Competitive Landscape (Priority: HIGH)

**Search for:**
- "[Segment name] market leaders"
- "[Segment name] competitive landscape ${geography}"
- "${companyName} [segment name] market share"

**Identify SEGMENT-SPECIFIC competitors (not company-wide peers)**

#### 4. Analyst Commentary (Priority: MEDIUM)

**Search for:**
- "${companyName} analyst report [segment name]"

**Extract: ONE quote per segment max (<15 words)**

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface Section4Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  overview: string; // 4.1 content - 3-4 sentences
  
  segments: Array<{
    name: string;
    
    financial_snapshot: {
      table: Array<{
        metric: string;
        segment: number | string;
        company_avg: number | string;
        industry_avg: number | string;
        source: string;
      }>;
      fx_source: string;
      geography_notes: string;
    };
    
    performance_analysis: {
      paragraphs: string[];
      analyst_quotes: Array<{
        quote: string;
        analyst: string;
        firm: string;
        source: string;
      }>;
      key_drivers: string[];
    };
    
    competitive_landscape: {
      competitors: Array<{
        name: string;
        market_share?: string;
        geography: string;
      }>;
      positioning: string;
      recent_dynamics: string;
    };
  }>;
  
  sources_used: string[];
}
\`\`\`

**Source formatting (STRICT):**
- Every entry in \`sources_used\` must be an S# string (e.g., "S1", "S2").
- Do NOT include URLs, citations, or free text in \`sources_used\`.
- Dedupe sources; if unsure about a source ID, omit it.

---

## OUTPUT FORMAT RULES

**Valid JSON only:** No markdown, no headings, no prose outside the JSON object.

---

## REQUIRED SECTIONS PER SEGMENT

### 4.X.1 Financial Snapshot
- Table with metrics (use "–" if unavailable)
- Units belong in metric names; table values must be numeric only (or -)
- Geography notes (2-3 sentences on ${geography} performance)

### 4.X.2 Performance Analysis
- 3-5 paragraphs covering growth, margins, initiatives, management commentary
- Key drivers (3-5 bullets)
- Analyst quotes (0-1 per segment, max 15 words)

### 4.X.3 Competitive Landscape
- 3-5 segment-specific competitors with ${geography} presence
- Positioning (2-3 sentences)
- Recent dynamics (2-3 sentences)
- NEVER exceed 5 competitors; if you have more, pick the top 5 most relevant for ${geography}.

---

## GEOGRAPHY FOCUS (75-80% WITHIN EACH SEGMENT)

**Every segment must emphasize ${geography}:**
- Financial performance in ${geography}
- ${geography}-specific drivers
- Regional competitive dynamics
- ${geography} operational context

---

## ANALYST QUOTE REQUIREMENTS

**MANDATORY:**
- Max 15 words per quote
- ONE quote per segment maximum
- ONE quote per analyst source (across all segments)

---

## FALLBACK STRATEGY INDICATOR

**If you cannot complete all segments:**
1. Acknowledge limitation
2. Complete as many segments as possible fully
3. System will invoke per-segment prompts for remaining

---

## VALIDATION CHECKLIST

- [ ] Valid JSON syntax
- [ ] Overview (4.1) is 3-4 sentences
- [ ] All ${segmentCount} segments included
- [ ] Each segment has financial_snapshot, performance_analysis, competitive_landscape
- [ ] Geography focus 75-80% within each segment
- [ ] Segment-specific competitors (not company peers)
- [ ] Sources cited throughout

---

## CRITICAL REMINDERS

1. Follow style guide: All formatting rules apply
2. Valid JSON only: No markdown, no headings, no prose outside JSON
3. Source everything: No unsourced claims
4. Geography focus: Emphasize the target geography throughout
5. Exact schema match: Follow the TypeScript interface exactly

---

## BEGIN RESEARCH

**Company:** ${companyName}  
**Geography:** ${geography}  
**Number of Segments:** ${segmentCount}  
**Segments:** ${segmentNames}

**OUTPUT ONLY VALID JSON. ATTEMPT ALL SEGMENTS. START NOW.**
`;
  return appendReportTypeAddendum('segment_analysis', input.reportType, basePrompt);
}

/**
 * Builds fallback prompt for individual segment
 * Used when comprehensive prompt truncates
 */
export function buildSection4SegmentPrompt(
  input: Section4Input,
  segmentName: string
): string {
  const { foundation, companyName, geography, section2Context } = input;
  
  const segment = foundation.segment_structure.find(s => s.name === segmentName);
  if (!segment) {
    throw new Error(`Segment ${segmentName} not found in foundation data`);
  }
  
  const foundationJson = JSON.stringify(foundation, null, 2);
  const section2Json = section2Context ? JSON.stringify(section2Context, null, 2) : 'Not provided';
  
  return `# Section 4: Segment Analysis - INDIVIDUAL SEGMENT Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate complete analysis for the **${segmentName}** segment of **${companyName}** in **${geography}**.

**This is a FALLBACK prompt:** You are generating ONE segment only. Other segments will be generated separately.

---

## INPUT CONTEXT

### Foundation Context

\`\`\`json
${foundationJson}
\`\`\`

### Section 2 Context (Optional)

\`\`\`json
${section2Json}
\`\`\`

---

## SEGMENT TO ANALYZE

**Segment Name:** ${segmentName}
**Description:** ${segment.description}
**Revenue % of Total:** ${segment.revenue_pct}%

---

## RESEARCH REQUIREMENTS FOR ${segmentName}

### 1. Financial Performance

**Search for:**
- "${companyName} ${segmentName} revenue"
- "${companyName} ${segmentName} ${geography}"
- "${companyName} 10-K segment reporting ${segmentName}"
- "${companyName} earnings transcript ${segmentName}"

**Extract:**
- Segment financials from 10-K/10-Q
- ${geography}-specific revenue and margin data
- YoY growth and trends

### 2. Performance Drivers

**Search for:**
- "${companyName} ${segmentName} growth drivers"
- "${companyName} ${segmentName} market trends"
- "${companyName} earnings call ${segmentName}"

**Extract:**
- Key drivers (volume, price, mix)
- ${geography}-specific drivers
- Strategic initiatives
- Management commentary

### 3. Competitive Landscape

**Search for:**
- "${segmentName} market leaders"
- "${segmentName} competitive landscape ${geography}"
- "${companyName} ${segmentName} competitors"

**Identify:**
- 3-5 segment-specific competitors (NOT company-wide peers)
- ${geography} presence for each competitor
- Market positioning

### 4. Analyst Commentary

**Search for:**
- "${companyName} analyst report ${segmentName}"

**Extract:**
- ONE quote max (<15 words)

---

## OUTPUT REQUIREMENTS

**Output ONLY the segment object (not full Section4Output):**

\`\`\`typescript
interface SegmentOutput {
  name: string; // "${segmentName}"
  
  financial_snapshot: {
    table: Array<{
      metric: string;
      segment: number | string;
      company_avg: number | string;
      industry_avg: number | string;
      source: string;
    }>;
    fx_source: string;
    geography_notes: string;
  };
  
  performance_analysis: {
    paragraphs: string[];
    analyst_quotes: Array<{
      quote: string;
      analyst: string;
      firm: string;
      source: string;
    }>;
    key_drivers: string[];
  };
  
  competitive_landscape: {
    competitors: Array<{
      name: string;
      market_share?: string;
      geography: string;
    }>;
    positioning: string;
    recent_dynamics: string;
  };
  
  sources_used: string[];
}
\`\`\`

**Source formatting (STRICT):**
- Every entry in \`sources_used\` must be an S# string (e.g., "S1", "S2").
- Do NOT include URLs, citations, or free text in \`sources_used\`.
- Dedupe sources; if unsure about a source ID, omit it.

---

## REQUIRED OUTPUT STRUCTURE

### Financial Snapshot (4.X.1)
- Complete table with all metrics (use "–" if unavailable)
- FX source notation
- Geography notes (2-3 sentences on ${geography})

### Performance Analysis (4.X.2)
- 3-5 analytical paragraphs
- 3-5 key drivers (bullets)
- 0-1 analyst quotes (max 15 words)

### Competitive Landscape (4.X.3)
- 3-5 segment-specific competitors
- Positioning (2-3 sentences)
- Recent dynamics (2-3 sentences)

---

## GEOGRAPHY FOCUS (75-80%)

**Every subsection must emphasize ${geography}:**
- ${geography} financial performance
- ${geography}-specific drivers
- ${geography} competitive context

---

## BEGIN RESEARCH

**Segment:** ${segmentName}  
**Company:** ${companyName}  
**Geography:** ${geography}

**OUTPUT ONLY VALID JSON FOR THIS SEGMENT. START NOW.**
`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateSection4Output(output: any): output is Section4Output {
  if (!output || typeof output !== 'object') return false;
  
  // Check confidence
  if (!output.confidence || 
      !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
    return false;
  }
  
  // Check overview
  if (typeof output.overview !== 'string') return false;
  
  // Check segments
  if (!Array.isArray(output.segments) || output.segments.length === 0) {
    return false;
  }
  
  // Validate each segment
  for (const segment of output.segments) {
    if (!segment.name || 
        !segment.financial_snapshot ||
        !segment.performance_analysis ||
        !segment.competitive_landscape) {
      return false;
    }
    
    // Validate financial_snapshot
    if (!Array.isArray(segment.financial_snapshot.table) ||
        typeof segment.financial_snapshot.fx_source !== 'string' ||
        typeof segment.financial_snapshot.geography_notes !== 'string') {
      return false;
    }
    
    // Validate performance_analysis
    if (!Array.isArray(segment.performance_analysis.paragraphs) ||
        !Array.isArray(segment.performance_analysis.analyst_quotes) ||
        !Array.isArray(segment.performance_analysis.key_drivers)) {
      return false;
    }
    
    // Validate competitive_landscape
    if (!Array.isArray(segment.competitive_landscape.competitors) ||
        typeof segment.competitive_landscape.positioning !== 'string' ||
        typeof segment.competitive_landscape.recent_dynamics !== 'string') {
      return false;
    }
    
    // Validate competitors (at least 3)
    if (segment.competitive_landscape.competitors.length < 3) {
      return false;
    }
  }
  
  // Check sources
  if (!Array.isArray(output.sources_used)) return false;
  
  return true;
}

export function validateSegmentOutput(output: any): output is SegmentAnalysis {
  if (!output || typeof output !== 'object') return false;
  
  if (!output.name ||
      !output.financial_snapshot ||
      !output.performance_analysis ||
      !output.competitive_landscape) {
    return false;
  }
  
  // Same validation as above for individual segment
  return true;
}

export function formatSection4ForDocument(output: Section4Output): string {
  const formatNumber = (value: number) =>
    value.toLocaleString('en-US', { maximumFractionDigits: 2 });

  const resolveMetricUnit = (metricName: string) => {
    const match = metricName.match(/\(([^)]+)\)\s*$/);
    const token = match?.[1].toLowerCase();

    if (!token) return null;
    if (token.includes('$b')) return { type: 'currency', suffix: 'B' };
    if (token.includes('$m')) return { type: 'currency', suffix: 'M' };
    if (token.includes('$k')) return { type: 'currency', suffix: 'K' };
    if (token.includes('%')) return { type: 'percent', suffix: '%' };
    if (token.includes('x')) return { type: 'ratio', suffix: 'x' };
    if (token.includes('day')) return { type: 'days', suffix: ' days' };
    if (token.includes('year')) return { type: 'years', suffix: ' years' };
    if (token.includes('count') || token.includes('score')) return { type: 'number', suffix: '' };
    return null;
  };

  const inferValueType = (metricName: string) => {
    const metric = metricName.toLowerCase();
    if (metric.includes('margin') || metric.includes('growth') || metric.includes('irr') || metric.includes('roe') ||
        metric.includes('roa') || metric.includes('rate') || metric.includes('pct') || metric.includes('percent')) {
      return 'percent';
    }
    if (metric.includes('turn') || metric.includes('multiple') || metric.includes('leverage')) return 'ratio';
    if (metric.includes('day') || metric.includes('dso') || metric.includes('dio') || metric.includes('dpo')) {
      return 'days';
    }
    return 'currency';
  };

  const formatTableValue = (metricName: string, value: number | string) => {
    if (typeof value !== 'number') return value;
    const unit = resolveMetricUnit(metricName);
    const formatted = formatNumber(value);

    if (unit?.type === 'percent') return `${formatted}%`;
    if (unit?.type === 'currency') return `$${formatted}${unit.suffix}`;
    if (unit?.type === 'ratio') return `${formatted}x`;
    if (unit?.type === 'days') return `${formatted} days`;
    if (unit?.type === 'years') return `${formatted} years`;

    const fallbackType = inferValueType(metricName);
    if (fallbackType === 'percent') return `${formatted}%`;
    if (fallbackType === 'ratio') return `${formatted}x`;
    if (fallbackType === 'days') return `${formatted} days`;
    return `$${formatted}M`;
  };

  let markdown = `# 4. Segment Analysis

`;
  markdown += `**Confidence: ${output.confidence.level}** ? ${output.confidence.reason}

`;

  // 4.1 Segment Overview
  markdown += `## 4.1 Segment Overview

`;
  markdown += `${output.overview}

`;

  // 4.X for each segment
  for (let i = 0; i < output.segments.length; i++) {
    const segment = output.segments[i];
    const num = i + 2; // Start at 4.2, 4.3, etc.

    markdown += `## 4.${num} ${segment.name}

`;

    // 4.X.1 Financial Snapshot
    markdown += `### 4.${num}.1 Financial Snapshot

`;
    markdown += `Note: Monetary values shown in USD millions unless stated.

`;

    // Table
    markdown += `| Metric | Segment | Company Avg | Industry Avg | Source |
`;
    markdown += `|--------|---------|-------------|--------------|--------|
`;

    for (const metric of segment.financial_snapshot.table) {
      const values = [
        formatTableValue(metric.metric, metric.segment),
        formatTableValue(metric.metric, metric.company_avg),
        formatTableValue(metric.metric, metric.industry_avg)
      ];

      markdown += `| ${metric.metric} | ${values.join(' | ')} | ${metric.source} |
`;
    }

    markdown += `
${segment.financial_snapshot.geography_notes}

`;
    markdown += `*FX Source: ${segment.financial_snapshot.fx_source}*

`;

    // 4.X.2 Performance Analysis
    markdown += `### 4.${num}.2 Performance Analysis

`;

    for (const paragraph of segment.performance_analysis.paragraphs) {
      markdown += `${paragraph}

`;
    }

    if (segment.performance_analysis.key_drivers.length > 0) {
      markdown += `**Key Drivers:**

`;
      for (const driver of segment.performance_analysis.key_drivers) {
        markdown += `- ${driver}
`;
      }
      markdown += `
`;
    }

    if (segment.performance_analysis.analyst_quotes.length > 0) {
      markdown += `**Analyst Perspectives:**

`;
      for (const quote of segment.performance_analysis.analyst_quotes) {
        markdown += `*"${quote.quote}"* - ${quote.analyst}, ${quote.firm} (${quote.source})

`;
      }
    }

    // 4.X.3 Competitive Landscape
    markdown += `### 4.${num}.3 Competitive Landscape

`;

    markdown += `**Key Competitors:**

`;
    for (const comp of segment.competitive_landscape.competitors) {
      markdown += `- **${comp.name}**`;
      if (comp.market_share) markdown += ` (${comp.market_share})`;
      markdown += `: ${comp.geography}
`;
    }
    markdown += `
`;

    markdown += `**Positioning:** ${segment.competitive_landscape.positioning}

`;
    markdown += `**Recent Dynamics:** ${segment.competitive_landscape.recent_dynamics}

`;
  }

  return markdown;
}

/**
 * Combines multiple segment outputs into complete Section 4
 */
export function combineSegmentOutputs(
  overview: string,
  segments: SegmentAnalysis[],
  confidence: {level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string}
): Section4Output {
  // Collect all unique sources
  const allSources = new Set<string>();
  for (const segment of segments) {
    // Extract sources from various places
    for (const metric of segment.financial_snapshot.table) {
      metric.source.split(',').forEach(s => allSources.add(s.trim()));
    }
    for (const quote of segment.performance_analysis.analyst_quotes) {
      allSources.add(quote.source);
    }
  }
  
  return {
    confidence,
    overview,
    segments,
    sources_used: Array.from(allSources).sort()
  };
}

/**
 * Gets segment by name
 */
export function getSegmentByName(
  output: Section4Output,
  segmentName: string
): SegmentAnalysis | undefined {
  return output.segments.find(s => s.name === segmentName);
}

/**
 * Compares segment performance vs company average
 */
export function compareSegmentToCompany(
  segment: SegmentAnalysis,
  metricName: string
): {
  segment: number | string;
  company: number | string;
  delta: number | string;
} | null {
  const metric = segment.financial_snapshot.table.find(m => m.metric === metricName);
  if (!metric) return null;
  
  if (typeof metric.segment === 'number' && typeof metric.company_avg === 'number') {
    return {
      segment: metric.segment,
      company: metric.company_avg,
      delta: metric.segment - metric.company_avg
    };
  }
  
  return {
    segment: metric.segment,
    company: metric.company_avg,
    delta: '–'
  };
}
