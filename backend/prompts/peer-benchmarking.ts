/**
 * Section 6: Peer Benchmarking - TypeScript Implementation
 * Generates prompt and types for Peer Benchmarking section
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';

export interface FoundationOutput {
  company_basics: {
    legal_name: string;
    ticker?: string;
    ownership: 'Public' | 'Private' | 'Subsidiary';
    headquarters: string;
    global_revenue_usd: number;
    global_employees: number;
    fiscal_year_end: string;
  };
  geography_specifics: {
    regional_revenue_usd: number;
    regional_revenue_pct: number;
    regional_employees: number;
    facilities: Array<{
      name: string;
      location: string;
      type: string;
    }>;
    key_facts: string[];
  };
  source_catalog: Array<{
    id: string;
    citation: string;
    url?: string;
    type: string;
    date: string;
  }>;
  segment_structure: Array<{
    name: string;
    revenue_pct: number;
    description: string;
  }>;
}

export interface Section2Context {
  kpi_table: {
    metrics: Array<{
      metric: string;
      company: number | string;
      industry_avg: number | string;
      source: string;
    }>;
  };
  fx_source: 'A' | 'B' | 'C';
  industry_source: 'A' | 'B' | 'C';
}

export interface Section6Input {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  section2Context: Section2Context; // REQUIRED
  reportType?: ReportTypeId;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface PeerInfo {
  name: string;
  ticker?: string;
  geography_presence: string;
  geography_revenue_pct?: number;
}

export interface PeerMetric {
  metric: string;
  company: number | string;
  peer1: number | string;
  peer2: number | string;
  peer3: number | string;
  peer4?: number | string;
  industry_avg: number | string;
  source: string;
}

export interface KeyStrength {
  strength: string;
  description: string;
  geography_context: string;
}

export interface KeyGap {
  gap: string;
  description: string;
  geography_context: string;
  magnitude: 'Significant' | 'Moderate' | 'Minor';
}

export interface Section6Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  peer_comparison_table: {
    company_name: string;
    peers: PeerInfo[];
    metrics: PeerMetric[];
  };
  
  benchmark_summary: {
    overall_assessment: string;
    key_strengths: KeyStrength[];
    key_gaps: KeyGap[];
    competitive_positioning: string;
  };
  
  sources_used: string[];
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

export function buildPeerBenchmarkingPrompt(input: Section6Input): string {
  const { foundation, companyName, geography, section2Context } = input;
  
  const foundationJson = JSON.stringify(foundation, null, 2);
  const section2Json = JSON.stringify(section2Context, null, 2);
  
  const basePrompt = `# Section 6: Peer Benchmarking - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 6 (Peer Benchmarking) with comprehensive peer comparison table and benchmark summary for **${companyName}** in **${geography}**.

---

## INPUT CONTEXT

### Required: Foundation Context

\`\`\`json
${foundationJson}
\`\`\`

### REQUIRED: Section 2 Context (Financial Snapshot)

**This section REQUIRES Section 2 financial data to benchmark against peers.**

\`\`\`json
${section2Json}
\`\`\`

---

## RESEARCH REQUIREMENTS

### 1. Identify Comparable Peers (3-5 companies)

**Priority: CRITICAL**

**Search for:**
- "${companyName} competitors"
- "${companyName} peer group"
- "${companyName} competitive landscape ${geography}"
- "{industry} market leaders"
- "analyst reports ${companyName} peers"

**Selection criteria for peers:**

**Must have:**
- Geographic overlap with ${geography} (operations, facilities, or significant revenue)
- Business model overlap (sector, B2B, similar segments)
- Publicly traded (need financial data for comparison)
- Similar scale (0.5x to 2x revenue of ${companyName})

**Prefer:**
- Direct competitors in key segments
- Similar customer base
- Comparable operational footprint in ${geography}

### 2. Gather Peer Financial Data

**Priority: CRITICAL**

**For EACH peer, search for:**
- "[Peer name] 10-K" OR "[Peer name] annual report 2024"
- "[Peer name] Q3 2024 earnings"
- "[Peer name] investor presentation"
- "[Peer name] ${geography} revenue"

**Extract for EACH peer - must match Section 2 metrics:**
1. Revenue (Latest Period)
2. Revenue Growth (YoY)
3. EBITDA Margin
4. Operating Margin
5. Gross Margin
6. Operating Cash Flow
7. Free Cash Flow Margin
8. Days Sales Outstanding (DSO)
9. Days Inventory Outstanding (DIO)
10. Inventory Turns
11. ROIC
12. CapEx as % Revenue
13. Debt/EBITDA

**Geography-specific data (75-80% focus):**
- ${geography} revenue (absolute and % of total)
- ${geography} facilities count
- ${geography} employees
- ${geography} market position or share
- ${geography} growth rate vs global
- ${geography} strategic importance

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface Section6Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  peer_comparison_table: {
    company_name: string; // ${companyName}
    peers: Array<{
      name: string;
      ticker?: string; // Use empty string if unknown; never return null
      geography_presence: string;
      geography_revenue_pct?: number;
    }>;
    metrics: Array<{
      metric: string;
      company: number | string;
      peer1: number | string;
      peer2: number | string;
      peer3: number | string;
      peer4?: number | string;
      industry_avg: number | string;
      source: string;
    }>;
  };
  
  benchmark_summary: {
    overall_assessment: string;
    key_strengths: Array<{
      strength: string;
      description: string;
      geography_context: string;
    }>;
    key_gaps: Array<{
      gap: string;
      description: string;
      geography_context: string;
      magnitude: 'Significant' | 'Moderate' | 'Minor';
    }>;
    competitive_positioning: string;
  };
  
  sources_used: string[];
}
\`\`\`

---

## TABLE REQUIREMENTS (Section 6.1)

**The table MUST use this EXACT format from style guide:**

\`\`\`
| Metric | ${companyName} | Peer 1 | Peer 2 | Peer 3 | Industry Avg |
\`\`\`

**Critical requirements:**
- Use exact metric names from Section 2
- Include ALL Section 2 metrics (use "–" if peer data unavailable)
- Format consistently: $X.XB, X.X%, X.Xx, X days
- Source every metric

---

## BENCHMARK SUMMARY REQUIREMENTS (Section 6.2)

### Overall Assessment (2-3 sentences)
Synthesize how ${companyName} compares to peers with focus on ${geography}.

### Key Strengths (2-4 items)
For each: title, description with metrics, geography context

### Key Gaps (2-4 items)
For each: title, description with gap quantified, geography context, magnitude

### Competitive Positioning (3-4 sentences)
Focus on ${geography}-specific competitive standing

---

## GEOGRAPHY FOCUS (75-80%)

**Every comparison must include ${geography} context:**

✅ **CORRECT patterns:**
- "Superior margin performance driven by higher capacity utilization in **${geography}** facilities (88% vs peer average of 82%)"
- "In **${geography}** a key market segment, company ranks #2 behind [competitor]"

❌ **WRONG patterns:**
- Pure global comparisons without regional context
- Competitive assessment that doesn't reference ${geography}

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] 3-5 peers identified with ${geography} presence
- [ ] Peer descriptions include geography context
- [ ] Table includes ALL Section 2 metrics
- [ ] Metric names match Section 2 exactly
- [ ] All metrics cite sources
- [ ] Overall assessment is 2-3 sentences
- [ ] 2-4 key strengths with geography context
- [ ] 2-4 key gaps with geography context and magnitude
- [ ] Competitive positioning focused on ${geography}
- [ ] 75-80% of content emphasizes ${geography}
- [ ] Sources_used array complete

---

## BEGIN RESEARCH

**Company:** ${companyName}  
**Geography:** ${geography}  
**Foundation Context:** [Provided above]  
**Section 2 Context:** [REQUIRED - provided above]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
`;
  return appendReportTypeAddendum('peer_benchmarking', input.reportType, basePrompt);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateSection6Output(output: any): output is Section6Output {
  if (!output || typeof output !== 'object') return false;
  
  // Check confidence
  if (!output.confidence || 
      !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
    return false;
  }
  
  // Check peer_comparison_table
  if (!output.peer_comparison_table ||
      typeof output.peer_comparison_table.company_name !== 'string' ||
      !Array.isArray(output.peer_comparison_table.peers) ||
      !Array.isArray(output.peer_comparison_table.metrics)) {
    return false;
  }
  
  // Validate peers (3-5 required)
  if (output.peer_comparison_table.peers.length < 3 || 
      output.peer_comparison_table.peers.length > 5) {
    return false;
  }
  
  // Validate metrics
  for (const metric of output.peer_comparison_table.metrics) {
    if (!metric.metric || !metric.source ||
        metric.company === undefined ||
        metric.peer1 === undefined ||
        metric.peer2 === undefined ||
        metric.peer3 === undefined ||
        metric.industry_avg === undefined) {
      return false;
    }
  }
  
  // Check benchmark_summary
  if (!output.benchmark_summary ||
      typeof output.benchmark_summary.overall_assessment !== 'string' ||
      !Array.isArray(output.benchmark_summary.key_strengths) ||
      !Array.isArray(output.benchmark_summary.key_gaps) ||
      typeof output.benchmark_summary.competitive_positioning !== 'string') {
    return false;
  }
  
  // Validate gaps magnitude
  for (const gap of output.benchmark_summary.key_gaps) {
    if (!['Significant', 'Moderate', 'Minor'].includes(gap.magnitude)) {
      return false;
    }
  }
  
  // Check sources
  if (!Array.isArray(output.sources_used)) return false;
  
  return true;
}

export function formatSection6ForDocument(output: Section6Output): string {
  let markdown = `# 6. Peer Benchmarking\n\n`;
  markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
  
  // 6.1 Peer Comparison Table
  markdown += `## 6.1 Peer Comparison Table\n\n`;
  
  // Peer descriptions
  markdown += `**Peer Companies:**\n\n`;
  for (let i = 0; i < output.peer_comparison_table.peers.length; i++) {
    const peer = output.peer_comparison_table.peers[i];
    markdown += `- **Peer ${i + 1}: ${peer.name}**`;
    if (peer.ticker) markdown += ` (${peer.ticker})`;
    markdown += `: ${peer.geography_presence}`;
    if (peer.geography_revenue_pct) {
      markdown += ` Geography revenue: ${peer.geography_revenue_pct}% of total.`;
    }
    markdown += `\n`;
  }
  markdown += `\n`;
  
  // Build table
  const peerNames = output.peer_comparison_table.peers.map((p, i) => `Peer ${i + 1}`);
  markdown += `| Metric | ${output.peer_comparison_table.company_name} | ${peerNames.join(' | ')} | Industry Avg |\n`;
  markdown += `|--------|${'-'.repeat(output.peer_comparison_table.company_name.length + 2)}|${peerNames.map(p => '-'.repeat(p.length + 2)).join('|')}|${'-'.repeat(14)}|\n`;
  
  for (const metric of output.peer_comparison_table.metrics) {
    const values = [
      metric.company,
      metric.peer1,
      metric.peer2,
      metric.peer3
    ];
    if (metric.peer4 !== undefined) values.push(metric.peer4);
    values.push(metric.industry_avg);
    
    markdown += `| ${metric.metric} | ${values.map(v => 
      typeof v === 'number' ? v.toLocaleString() : v
    ).join(' | ')} |\n`;
  }
  markdown += `\n*Sources: ${output.peer_comparison_table.metrics.map(m => m.source).filter((v, i, a) => a.indexOf(v) === i).join(', ')}*\n\n`;
  
  // 6.2 Benchmark Summary
  markdown += `## 6.2 Peer Benchmark Summary\n\n`;
  markdown += `${output.benchmark_summary.overall_assessment}\n\n`;
  
  markdown += `**Key Strengths:**\n\n`;
  for (const strength of output.benchmark_summary.key_strengths) {
    markdown += `- **${strength.strength}**: ${strength.description}\n`;
    markdown += `  - **Geography Context:** ${strength.geography_context}\n\n`;
  }
  
  markdown += `**Key Gaps:**\n\n`;
  for (const gap of output.benchmark_summary.key_gaps) {
    markdown += `- **${gap.gap}** (${gap.magnitude}): ${gap.description}\n`;
    markdown += `  - **Geography Context:** ${gap.geography_context}\n\n`;
  }
  
  markdown += `**Competitive Positioning:**\n\n`;
  markdown += `${output.benchmark_summary.competitive_positioning}\n\n`;
  
  return markdown;
}

/**
 * Compares company performance vs peers for a specific metric
 */
export function compareMetric(
  output: Section6Output,
  metricName: string
): {
  company: number | string;
  peerMin: number | string;
  peerMax: number | string;
  peerAvg: number | string;
  industryAvg: number | string;
} | null {
  const metric = output.peer_comparison_table.metrics.find(m => m.metric === metricName);
  if (!metric) return null;
  
  const peerValues = [metric.peer1, metric.peer2, metric.peer3];
  if (metric.peer4 !== undefined) peerValues.push(metric.peer4);
  
  const numericPeerValues = peerValues
    .filter(v => typeof v === 'number') as number[];
  
  if (numericPeerValues.length === 0) {
    return {
      company: metric.company,
      peerMin: '–',
      peerMax: '–',
      peerAvg: '–',
      industryAvg: metric.industry_avg
    };
  }
  
  return {
    company: metric.company,
    peerMin: Math.min(...numericPeerValues),
    peerMax: Math.max(...numericPeerValues),
    peerAvg: numericPeerValues.reduce((a, b) => a + b, 0) / numericPeerValues.length,
    industryAvg: metric.industry_avg
  };
}

/**
 * Identifies metrics where company outperforms peers
 */
export function getOutperformingMetrics(output: Section6Output): string[] {
  const outperforming: string[] = [];
  
  for (const metric of output.peer_comparison_table.metrics) {
    if (typeof metric.company !== 'number') continue;
    
    const peerValues = [
      metric.peer1,
      metric.peer2,
      metric.peer3,
      metric.peer4
    ].filter(v => typeof v === 'number') as number[];
    
    if (peerValues.length === 0) continue;
    
    const avgPeer = peerValues.reduce((a, b) => a + b, 0) / peerValues.length;
    
    // For metrics where higher is better (margins, growth, turns, ROIC)
    // or where lower is better (DSO, DIO, Debt/EBITDA)
    const higherIsBetter = [
      'Revenue Growth',
      'EBITDA Margin',
      'Operating Margin',
      'Gross Margin',
      'Free Cash Flow Margin',
      'Inventory Turns',
      'ROIC'
    ];
    
    const lowerIsBetter = [
      'Days Sales Outstanding',
      'Days Inventory Outstanding',
      'Cash Conversion Cycle',
      'Debt/EBITDA',
      'CapEx as % Revenue'
    ];
    
    if (higherIsBetter.some(m => metric.metric.includes(m))) {
      if (metric.company > avgPeer) outperforming.push(metric.metric);
    } else if (lowerIsBetter.some(m => metric.metric.includes(m))) {
      if (metric.company < avgPeer) outperforming.push(metric.metric);
    }
  }
  
  return outperforming;
}
