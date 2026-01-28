/**
 * Section 7: SKU-Relevant Opportunity Mapping - TypeScript Implementation
 * Generates prompt and types for SKU Opportunity Mapping section
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface Section5Context {
  company_trends: {
    trends: Array<{
      trend: string;
      description: string;
      direction: 'Positive' | 'Negative' | 'Neutral';
      impact_score: number;
      geography_relevance: string;
      source: string;
    }>;
  };
}

export interface Section6Context {
  benchmark_summary: {
    key_gaps: Array<{
      gap: string;
      description: string;
      geography_context: string;
      magnitude: 'Significant' | 'Moderate' | 'Minor';
    }>;
  };
}

export interface Section7Input {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  section5Context?: Section5Context;
  section6Context?: Section6Context;
  reportType?: ReportTypeId;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export type Priority = 'High' | 'Medium' | 'Low';

export interface Opportunity {
  issue_area: string;
  public_problem: string;
  source: string;
  aligned_sku: string;
  priority: Priority;
  severity: number;
  severity_rationale: string;
  geography_relevance: string;
  potential_value_levers: string[];
}

export interface Section7Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  opportunities: Opportunity[];
  
  sources_used: string[];
}

// ============================================================================
// SKU PRACTICE AREAS (for reference)
// ============================================================================

export const SKU_PRACTICE_AREAS = {
  CAPACITY_THROUGHPUT: '1. Capacity & Throughput Enhancement',
  DIGITAL_LEAN: '2. Cost Optimization Through Digital Lean',
  CASH_FLOW_ROIC: '3. Operational Excellence to Drive Cash Flow Velocity & ROIC',
  OPERATING_MODEL: '4. Improving the Operating Model',
  REAL_TIME_ENTERPRISE: '5. Lead the Journey to Your Real-Time Enterprise'
} as const;

export const SKU_SUB_OFFERINGS = {
  OEE_UPLIFT: 'OEE Uplift & Bottleneck Removal',
  ASSET_RELIABILITY: 'Asset Reliability & Maintenance',
  QUALITY_SYSTEMS: 'Quality Systems',
  LEAN_OPERATIONS: 'Lean Operations',
  DISTRIBUTION_LOGISTICS: 'Distribution & Logistics Optimization',
  ORG_EFFECTIVENESS: 'Organizational Effectiveness',
  VALUE_ENGINEERING: 'Value Engineering',
  INVENTORY_OPT: 'Inventory Optimization',
  ORDER_TO_CASH: 'Order-to-Cash Acceleration',
  ASSET_UTILIZATION: 'Asset & Network Utilization',
  OPERATING_COST: 'Operating Cost Efficiency',
  NETWORK_DESIGN: 'Network & Supply Chain Design',
  MA_SUPPORT: 'Transaction Support (M&A)',
  INTERIM_LEADERSHIP: 'Interim Leadership',
  CAPITAL_PROJECTS: 'Capital Project Management',
  CONTROL_TOWER: 'Control Tower & Performance Management',
  DIGITAL_OPS: 'Digital Operations',
  ENTERPRISE_ENABLE: 'Enterprise Enablement'
} as const;

// ============================================================================
// PROMPT BUILDER
// ============================================================================

export function buildSkuOpportunitiesPrompt(input: Section7Input): string {
  const { foundation, companyName, geography, section5Context, section6Context } = input;
  
  const foundationJson = JSON.stringify(foundation, null, 2);
  const section5Json = section5Context ? JSON.stringify(section5Context, null, 2) : 'Not provided';
  const section6Json = section6Context ? JSON.stringify(section6Context, null, 2) : 'Not provided';
  
  const basePrompt = `# Section 7: SKU-Relevant Opportunity Mapping - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 7 (SKU-Relevant Opportunity Mapping) identifying 2-5 genuine operational problems that align with SSA Industrials practice areas for **${companyName}** in **${geography}**.

---

## CORE PRINCIPLE

**Only map GENUINE alignments. Do NOT force-fit SKUs to problems.**

A blank opportunity section is better than invented opportunities. Every problem must be:
- **Explicitly stated** in public sources (no speculation)
- **Quantified** or specifically described
- **Actionable** (within company's control)
- **Material** (meaningful business impact)

---

## INPUT CONTEXT

### Required: Foundation Context

\`\`\`json
${foundationJson}
\`\`\`

### Recommended: Section 5 Context (Trends)

\`\`\`json
${section5Json}
\`\`\`

### Recommended: Section 6 Context (Peer Gaps)

\`\`\`json
${section6Json}
\`\`\`

**Note:** Section 5 & 6 context help identify problems but are NOT required. If unavailable, conduct independent problem identification.

---

## SSA PRACTICE AREAS (5 Categories)

Reference these when mapping opportunities:

### 1. Capacity & Throughput Enhancement
**When to map:**
- Capacity utilization <80%
- Production bottlenecks mentioned
- Operational efficiency index <75%
- Quality/defect issues
- Equipment downtime problems

### 2. Cost Optimization Through Digital Lean
**When to map:**
- Process waste/inefficiency
- Distribution costs above peer
- SG&A % above peer average
- Organizational restructuring
- SKU complexity issues

### 3. Operational Excellence to Drive Cash Flow Velocity & ROIC
**When to map:**
- DSO/DIO above peer average
- Inventory turns below peer
- ROIC declining
- Working capital issues

### 4. Improving the Operating Model
**When to map:**
- Network optimization discussions
- M&A integration activity
- Leadership transitions
- Major capital projects

### 5. Lead the Journey to Your Real-Time Enterprise
**When to map:**
- ERP/MES system initiatives
- Data visibility gaps
- Digital transformation mentions
- Legacy system challenges

---

## RESEARCH REQUIREMENTS

### Problem Identification Strategy

**Search for problems in these sources:**

1. **Earnings transcripts** (most recent quarters within the time horizon)
   - Search: "${companyName} latest earnings transcript"
   - Look for: Management discussion of challenges, headwinds, initiatives

2. **10-K/10-Q Risk Factors**
   - Search: "${companyName} latest 10-K risk factors"
   - Look for: Material operational or financial risks

3. **Analyst reports**
   - Search: "${companyName} recent analyst report"
   - Look for: Operational concerns, competitive weaknesses

4. **Section 5 Trends** (if provided)
   - Review: Company-specific negative trends
   - Extract: Trends with ${geography} relevance

5. **Section 6 Peer Gaps** (if provided)
   - Review: Key gaps with Moderate/Significant magnitude
   - Extract: Gaps with ${geography} context

**Problem must be:**
- **Explicitly stated:** Direct quote or detailed paraphrase from source
- **Specific:** Not generic
- **Quantified:** Include numbers, percentages, timeframes when available
- **Geography-relevant:** Focus on ${geography}

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface Section7Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  opportunities: Array<{
    issue_area: string;
    public_problem: string;
    source: string;
    aligned_sku: string;
    priority: 'High' | 'Medium' | 'Low';
    severity: number;
    severity_rationale: string;
    geography_relevance: string;
    potential_value_levers: string[];
  }>;
  
  sources_used: string[];
}
\`\`\`

### SOURCE ID PROTOCOL (STRICT)
- **Use S# IDs only.** Reuse existing IDs from foundation.source_catalog; do **not** renumber what already exists.
- **New sources continue numbering** after the highest existing S#. If foundation ends at S9, your next new source is S10, then S11, etc.
- **One source per field.** Every source value in opportunities must be a single S# (no commas or ranges). If multiple sources support the problem, pick the most authoritative for source and include all relevant S# in sources_used.
- **sources_used** must be an array of S# strings, deduplicated, covering every source referenced anywhere.
- **Never output non-S formats** (e.g., URLs, citations, or free text) in source or sources_used.

---

## QUALITY STANDARDS

**High-quality opportunity mapping has:**
- **2-5 opportunities** (not 10+)
- **Strong evidence** for each problem
- **Natural SKU alignments** (obvious fit)
- **Specific value levers** (quantified where possible)
- **Clear business case**

**Do NOT include if:**
- Problem not explicitly stated in research
- SKU alignment requires assumptions
- Value levers are generic
- Priority/severity cannot be assessed
- Problem outside ${geography} scope

**Remember:** An empty opportunity section is ACCEPTABLE if no genuine alignments exist.

---

## GEOGRAPHY FOCUS (75-80%)

**Prioritize problems that are:**
1. **Geography-specific:** "${geography} operations show efficiency index of 72%..." → HIGH
2. **Regional underperformance:** "${geography} DSO worse than global..." → HIGH
3. **Global with regional relevance:** "Company-wide ERP includes ${geography}..." → MEDIUM

**Every opportunity must explain geography relevance.**

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] 2-5 opportunities (or 0 if no genuine alignments)
- [ ] Every problem has explicit source citation
- [ ] Every problem is quantified or specifically described
- [ ] SKU alignments are genuine (not forced)
- [ ] Priority assigned (High/Medium/Low)
- [ ] Severity scored (1-10) with rationale
- [ ] Geography relevance explained
- [ ] Value levers are specific (2-4 per opportunity)
- [ ] Value levers quantified where possible
- [ ] No speculation or generic statements
- [ ] Sources_used array complete

---

## CRITICAL REMINDERS

1. **Only genuine alignments** - do not force fit
2. **Explicit problems only** - no speculation
3. **Geography focus** - prioritize ${geography}-relevant
4. **Quantify everything** - numbers, %, timelines
5. **Specific value levers** - avoid generic statements
6. **2-5 opportunities** - quality over quantity
7. **Empty is acceptable** - if no genuine alignments
8. **Valid JSON only** - no markdown backticks

---

## BEGIN RESEARCH

**Company:** ${companyName}  
**Geography:** ${geography}  
**Foundation Context:** [Provided above]  
**Section 5 Context:** [Provided if available]  
**Section 6 Context:** [Provided if available]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
`;
  return appendReportTypeAddendum('sku_opportunities', input.reportType, basePrompt);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateSection7Output(output: any): output is Section7Output {
  if (!output || typeof output !== 'object') return false;
  
  // Check confidence
  if (!output.confidence || 
      !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
    return false;
  }
  
  // Check opportunities (can be empty array)
  if (!Array.isArray(output.opportunities)) return false;
  
  // Validate each opportunity
  for (const opp of output.opportunities) {
    if (!opp.issue_area || !opp.public_problem || !opp.source ||
        !opp.aligned_sku || !opp.priority || 
        typeof opp.severity !== 'number' ||
        !opp.severity_rationale || !opp.geography_relevance ||
        !Array.isArray(opp.potential_value_levers)) {
      return false;
    }
    
    if (!['High', 'Medium', 'Low'].includes(opp.priority)) {
      return false;
    }
    
    if (opp.severity < 1 || opp.severity > 10) {
      return false;
    }
    
    if (opp.potential_value_levers.length < 2) {
      return false;
    }
  }
  
  // Check sources
  if (!Array.isArray(output.sources_used)) return false;
  
  return true;
}

export function formatSection7ForDocument(output: Section7Output): string {
  let markdown = `# 7. SKU-Relevant Opportunity Mapping\n\n`;
  markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
  
  if (output.opportunities.length === 0) {
    markdown += `No genuine SKU alignments identified based on available public information.\n\n`;
    return markdown;
  }
  
  // Build table
  markdown += `| Issue Area | Public Problem Identified | Aligned SKU | Priority | Severity | Potential Value Levers |\n`;
  markdown += `|------------|---------------------------|-------------|----------|----------|------------------------|\n`;
  
  for (const opp of output.opportunities) {
    const valueLeversList = opp.potential_value_levers.map(vl => `• ${vl}`).join('<br>');
    
    markdown += `| ${opp.issue_area} | ${opp.public_problem} (${opp.source}) | ${opp.aligned_sku} | ${opp.priority} | ${opp.severity}/10 | ${valueLeversList} |\n`;
  }
  
  markdown += `\n`;
  
  // Add detailed context for each opportunity
  markdown += `## Opportunity Details\n\n`;
  
  for (let i = 0; i < output.opportunities.length; i++) {
    const opp = output.opportunities[i];
    markdown += `### ${i + 1}. ${opp.issue_area}\n\n`;
    markdown += `**Priority:** ${opp.priority} | **Severity:** ${opp.severity}/10\n\n`;
    markdown += `**Problem:** ${opp.public_problem}\n\n`;
    markdown += `**Severity Rationale:** ${opp.severity_rationale}\n\n`;
    markdown += `**Geography Relevance:** ${opp.geography_relevance}\n\n`;
    markdown += `**Aligned SKU:** ${opp.aligned_sku}\n\n`;
    markdown += `**Potential Value Levers:**\n`;
    for (const lever of opp.potential_value_levers) {
      markdown += `- ${lever}\n`;
    }
    markdown += `\n`;
  }
  
  return markdown;
}

/**
 * Filters opportunities by priority
 */
export function filterByPriority(
  output: Section7Output,
  priority: Priority
): Opportunity[] {
  return output.opportunities.filter(o => o.priority === priority);
}

/**
 * Gets high-severity opportunities (7+)
 */
export function getHighSeverityOpportunities(
  output: Section7Output,
  minSeverity: number = 7
): Opportunity[] {
  return output.opportunities
    .filter(o => o.severity >= minSeverity)
    .sort((a, b) => b.severity - a.severity);
}

/**
 * Groups opportunities by SKU practice area
 */
export function groupBySKU(output: Section7Output): Record<string, Opportunity[]> {
  const grouped: Record<string, Opportunity[]> = {};
  
  for (const opp of output.opportunities) {
    const practiceArea = opp.aligned_sku.split('→')[0].trim();
    if (!grouped[practiceArea]) {
      grouped[practiceArea] = [];
    }
    grouped[practiceArea].push(opp);
  }
  
  return grouped;
}

/**
 * Calculates average severity score
 */
export function calculateAverageSeverity(output: Section7Output): number {
  if (output.opportunities.length === 0) return 0;
  const sum = output.opportunities.reduce((acc, o) => acc + o.severity, 0);
  return Math.round((sum / output.opportunities.length) * 10) / 10;
}
