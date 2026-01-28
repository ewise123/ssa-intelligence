/**
 * Section 2: Financial Snapshot - TypeScript Implementation
 * Generates prompt and types for Financial Snapshot section
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface Section2Input {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  reportType?: ReportTypeId;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface Section2Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  summary: string;
  
  kpi_table: {
    metrics: Array<{
      metric: string;
      company: number | string;
      industry_avg: number | string;
      source: string;
      unit?: string; // e.g., "USD millions", "%", "bps", "days"
      value_type?: 'currency' | 'percent' | 'ratio' | 'number';
    }>;
  };
  
  fx_source: 'A' | 'B' | 'C';
  industry_source: 'A' | 'B' | 'C';
  
  derived_metrics: Array<{
    metric: string;
    formula: string;
    calculation: string;
    source: string;
  }>;
  
  sources_used: string[];
}

// ============================================================================
// KPI REQUIREMENTS
// ============================================================================

const REQUIRED_KPIS_BY_REPORT_TYPE: Record<ReportTypeId, string[]> = {
  INDUSTRIALS: [
    'Revenue (Latest Period) ($M)',
    'Revenue Growth (YoY) (%)',
    'Gross Margin (%)',
    'EBITDA ($M)',
    'EBITDA Margin (%)',
    'Operating Income (EBIT) ($M)',
    'Operating Margin (%)',
    'Net Income ($M)',
    'Net Margin (%)',
    'Free Cash Flow ($M)',
    'CapEx ($M)',
    'Cash and Equivalents ($M)',
    'Total Debt ($M)',
    'Net Debt ($M)',
    'Net Leverage (x)',
    'Days Sales Outstanding (DSO) (days)',
    'Days Inventory Outstanding (DIO) (days)',
    'Inventory Turns (x)',
    'Days Payable Outstanding (DPO) (days)',
    'Working Capital ($M)'
  ],
  PE: [
    'Assets Under Management (AUM) ($B)',
    'Fund Size (Latest Fund) ($B)',
    'Dry Powder ($B)',
    'Fee-Related Earnings ($M)',
    'Fee-Related Earnings Margin (%)',
    'Management Fee Rate (%)',
    'Realized Value (DPI) (x)',
    'Total Value (TVPI) (x)',
    'Net IRR (%)',
    'Active Portfolio Companies (Count)',
    'Typical Hold Period (years)',
    'Recent Exits (Count, within time horizon)'
  ],
  FS: [
    'Total Assets ($B)',
    'Revenue (or Net Revenue) ($M)',
    'Net Interest Margin (%)',
    'Efficiency Ratio (%)',
    'Return on Equity (ROE) (%)',
    'Return on Assets (ROA) (%)',
    'CET1 Ratio (or Primary Capital Ratio) (%)',
    'Loan/Deposit Ratio (%)',
    'Non-Performing Loan Ratio (%)',
    'Cost of Risk / Credit Loss Ratio (%)',
    'Liquidity Coverage Ratio (%)',
    'Net New Assets / AUM ($B)'
  ],
  GENERIC: [
    'Revenue ($M)',
    'Revenue Growth (YoY) (%)',
    'EBITDA (or Operating Income) ($M)',
    'EBITDA Margin (or Operating Margin) (%)',
    'Net Income ($M)',
    'Net Margin (%)',
    'Free Cash Flow ($M)',
    'Cash and Equivalents ($M)',
    'Total Debt ($M)',
    'Net Debt ($M)'
  ],
  INSURANCE: [
    'Gross Written Premiums ($M)',
    'Net Written Premiums ($M)',
    'Premium Growth (YoY) (%)',
    'Combined Ratio (%)',
    'Loss Ratio (%)',
    'Expense Ratio (%)',
    'Underwriting Income (Loss) ($M)',
    'Net Investment Income ($M)',
    'Investment Yield (%)',
    'Net Income ($M)',
    'Return on Equity (ROE) (%)',
    'Solvency Ratio / RBC Ratio (%)',
    'Reserve to Premium Ratio (x)',
    'Policy Retention Rate (%)'
  ]
};

const getRequiredKpis = (reportType?: ReportTypeId) =>
  REQUIRED_KPIS_BY_REPORT_TYPE[reportType ?? 'GENERIC'] || REQUIRED_KPIS_BY_REPORT_TYPE.GENERIC;

// ============================================================================
// PROMPT BUILDER
// ============================================================================

export function buildFinancialSnapshotPrompt(input: Section2Input): string {
  const { foundation, companyName, geography } = input;
  const requiredKpis = getRequiredKpis(input.reportType);
  
  // Serialize foundation context for injection
  const foundationJson = JSON.stringify(foundation, null, 2);
  const requiredKpiList = requiredKpis
    .map((metric, index) => `${index + 1}. ${metric}`)
    .join('\n');
  const reportTypeFocus = (() => {
    switch (input.reportType) {
      case 'PE':
        return [
          '**Private Equity focus:** Emphasize firm-level performance (AUM, fees, fund performance, exits).',
          'Do NOT include operating KPIs like DSO/DIO unless explicitly reported for the firm.'
        ].join('\n');
      case 'FS':
        return [
          '**Financial Services focus:** Emphasize balance sheet, profitability, capital, and efficiency KPIs.',
          'Do NOT include working capital KPIs (DSO/DIO) unless explicitly reported.'
        ].join('\n');
      case 'INDUSTRIALS':
        return [
          '**Industrials focus:** Emphasize operational efficiency, working capital, and margin KPIs.',
          'Include working capital metrics such as DSO/DIO/Inventory Turns when available.'
        ].join('\n');
      case 'INSURANCE':
        return [
          '**Insurance focus:** Emphasize underwriting performance, loss ratios, and solvency metrics.',
          'Use insurance-specific KPIs (combined ratio, loss ratio, expense ratio, investment yield).',
          'Do NOT include banking metrics (NIM, CET1, DSO) unless company has banking operations.'
        ].join('\n');
      default:
        return [
          '**Generic focus:** Use broad financial KPIs and add 2-4 industry-specific metrics if relevant.',
          'Avoid irrelevant operating KPIs unless the company context supports them.'
        ].join('\n');
    }
  })();
  
  const basePrompt = `# Section 2: Financial Snapshot - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 2 (Financial Snapshot) with comprehensive time-horizon financial analysis for **${companyName}** in **${geography}**.

---

## INPUT CONTEXT (From Foundation)

You have received the following foundation context:

\`\`\`json
${foundationJson}
\`\`\`

---

## RESEARCH REQUIREMENTS

### Primary Research Focus

**Search for financial metrics within the time horizon (current year/LTM if within scope):**

1. **Revenue Metrics (Priority: CRITICAL)**
   - Search: "${companyName} latest revenue" OR "${companyName} most recent 10-Q"
   - Search: "${companyName} ${geography} revenue latest fiscal year"
   - Extract:
     - Total company revenue (latest quarter, LTM if within scope, or latest FY within the time horizon)
     - YoY growth rate (global and ${geography})
     - ${geography} revenue as % of total
     - Segment breakdown if available

2. **Profitability Metrics (Priority: CRITICAL)**
   - Search: "${companyName} EBITDA margin" OR "${companyName} operating margin"
   - Search: "${companyName} most recent earnings release"
   - Extract:
     - EBITDA margin (latest period)
     - Operating margin
     - Gross margin if disclosed
     - Net margin
     - Regional margin data if available
     - YoY margin changes

3. **Working Capital Metrics (Priority: HIGH)**
   - Search: "${companyName} 10-Q balance sheet" OR "${companyName} working capital"
   - Extract:
     - Days Sales Outstanding (DSO)
     - Days Inventory Outstanding (DIO)
     - Days Payables Outstanding (DPO)
     - Cash conversion cycle
     - Inventory turns (calculate if needed: COGS / Avg Inventory)*
     - Calculate from: Current Assets, Current Liabilities, AR, Inventory, AP

4. **Cash Flow Metrics (Priority: HIGH)**
   - Search: "${companyName} latest cash flow statement"
   - Extract:
     - Operating cash flow (latest period)
     - Free cash flow (OCF - CapEx)
     - Free cash flow margin (FCF / Revenue)
     - CapEx as % of revenue

5. **Efficiency Metrics (Priority: MEDIUM)**
   - Search: "${companyName} ROIC" OR "${companyName} return on invested capital"
   - Calculate if needed:
     - ROIC = NOPAT / Invested Capital*
     - Asset turnover = Revenue / Total Assets*
     - Working capital as % of revenue*

6. **Industry Benchmarks (Priority: CRITICAL)**
   - Search: "latest sector benchmarks"
   - Search: "${companyName} peer comparison" OR "${companyName} vs competitors"
   - Search: "Damodaran industry averages" OR "S&P Capital IQ sector"
   - Extract:
     - Industry average for EACH metric above
     - Source: Note if true industry avg (A) or peer set (B)

7. **Geography-Specific Financial Data (Priority: HIGH)**
   - Search: "${companyName} ${geography} financial performance"
   - Search: "${companyName} ${geography} margins" OR "${companyName} ${geography} profitability"
   - Extract:
     - Regional revenue growth vs company
     - Regional margins vs company average
     - Regional investment levels
     - Regional working capital metrics if disclosed

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface Section2Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string; // Max 100 characters
  };
  
  summary: string; // 4-6 sentences, see style guide Section 12
  
  kpi_table: {
    metrics: Array<{
      metric: string;           // Exact name from style guide Section 8
      company: number | string; // Number value or "-" if unavailable
      industry_avg: number | string;
      source: string;           // "S1, S3" format
    }>;
  };
  
  fx_source: 'A' | 'B' | 'C';
  industry_source: 'A' | 'B' | 'C';
  
  derived_metrics: Array<{
    metric: string;
    formula: string;
    calculation: string;
    source: string;
  }>;
  
  sources_used: string[]; // ["S1", "S3", "S7", etc.]
}
\`\`\`

---

## OUTPUT FORMAT RULES

**Valid JSON only:** No markdown, no headings, no prose outside the JSON object.
**Output must start with \`{\` and end with \`}\`.**

---

## NUMBER FORMATTING (STRICT)

- **Units belong in the metric name** (e.g., \`Revenue ($M)\`, \`EBITDA Margin (%)\`, \`Net Leverage (x)\`).
- **Table values must be numeric only** (or \`-\`), with no \`$\`, \`%\`, \`M/B\`, or \`x\` suffixes.
- **Renderer will apply formatting** based on units in the metric name.
- **Output must start with \`{\` and end with \`}\`.** No leading headings or commentary.

## REQUIRED METRICS FOR KPI TABLE

**The table MUST include these metrics (use "-" if unavailable):**

${requiredKpiList}

**Use the exact metric names from the style guide.**
**Do NOT output a markdown table**; populate \`kpi_table.metrics\` with one object per metric.

---

## REPORT-TYPE KPI FOCUS

${reportTypeFocus}

---

## SUMMARY REQUIREMENTS (Section 2.1)

**Write 4-6 sentences covering:**

1. **Revenue trajectory:** Global vs ${geography} trends
   - Example: "**${geography} operations** generated {currency}X.XB revenue (X% of global) in the latest fiscal year, growing X% YoY vs X% globally (S1)."

2. **Profitability evolution:** EBITDA margin changes and drivers
   - Example: "EBITDA margin expanded 80bps to 18.3% driven by pricing actions and operational efficiency, outperforming industry average of 16.5% (S1, S7)."

3. **Working capital position:** DSO/DIO trends
   - Example: "DSO deteriorated 6 days YoY to 68 days, trapping ~$50M in working capital vs peer average of 62 days (S1, S3)."

4. **Cash generation:** Operating cash flow health
   - Example: "Operating cash flow of $850M represented 15.5% of revenue, supporting $400M in growth CapEx (S1)."

5. **Geography-specific performance:** Regional vs company differences
   - Example: "**${geography}** facilities operate at 84% capacity vs 78% company average, with regional margins 90bps above corporate (S3, S5)."

6. **FX impacts:** If material (>5% revenue impact)
   - Example: "EUR/USD headwind of ~3% masked underlying operational performance in European segment (S1)."

**MUST end with:**
\`\`\`
FX rate source: {A/B/C}
Industry average source: {A/B/C}
\`\`\`

---

## GEOGRAPHY FOCUS REQUIREMENT (75-80%)

**Every metric discussion must emphasize ${geography}:**

CORRECT patterns:
- "**${geography}** revenue grew 15% vs 12% globally..."
- "${geography} EBITDA margin of 19.2% exceeds company average of 18.3%..."
- "Regional DSO of 65 days compares favorably to 68-day company average..."
- "${geography} facilities generated $120M free cash flow, 60% of company total..."

WRONG patterns:
- "Company revenue grew 12% YoY..." [No geography mention]
- "Global margins expanded 80bps..." [Not geography-specific]
- "ROIC improved to 12.5%..." [No regional context]

---

## SOURCE CITATION REQUIREMENTS

**Follow style guide Section 5 exactly:**

1. **Use S# references only:** (S1), (S2, S5), etc.
2. **Never use full citations** in summary or table
3. **Source every claim:** No unsourced statements
4. **Reuse foundation source numbers** from input context
5. **Add new sources** if you find additional data (continue numbering: S11, S12...)

**In table:**
- Source column: "S1, S7" (comma-separated, no parentheses)

**In summary:**
- End of sentence: "...growing 15% YoY (S1, S3)."
- Multiple sources: "...margin of 18.3% (S1) vs industry average of 16.5% (S7)."

---

## DATA QUALITY RULES (Style Guide Section 10)

### Unavailable Data
**Use "-" for missing metrics:**
\`\`\`json
{
  "metric": "Gross Margin",
  "company": "-",
  "industry_avg": 42.5,
  "source": "S7"
}
\`\`\`

**Never return a missing-input or data-availability error.** Always return the full schema with "-" placeholders.

### Derived Metrics
**Flag with asterisk and document:**
\`\`\`json
{
  "metric": "Inventory Turns*",
  "company": 4.2,
  "industry_avg": 3.8,
  "source": "S1"
}
\`\`\`

**Then in derived_metrics array:**
\`\`\`json
{
  "metric": "Inventory Turns",
  "formula": "Cost of Sales / Average Inventory",
  "calculation": "Latest FY: $3,200M COGS / $762M avg inventory = 4.2x",
  "source": "S1"
}
\`\`\`

**Rule:** Every derived metric must appear in the KPI table with a \`*\` in the metric name.

### Never Speculate
- If data cannot be verified -> Use "-"
- If you must estimate -> Show methodology explicitly
- Example: "Regional revenue estimated at $1.3B* (Europe total of $2.8B x Germany's ~45% share based on facility count; S1, S3)"

---

## CURRENCY CONVERSION (Style Guide Section 9)

**ALL financial metrics MUST be in USD:**

1. **First mention:** Show both currencies
   - "EUR 1.2B (~$1.3B using 1.08 EUR/USD)"

2. **Subsequent mentions:** USD only
   - "$1.3B revenue"

3. **Use foundation FX rates** from input context
   - If rate missing, search for appropriate rate (see style guide)

4. **Document in output:**
\`\`\`json
{
  "fx_source": "A"  // or "B" or "C" based on source quality
}
\`\`\`

---

## INDUSTRY AVERAGES (Style Guide Section 10)

**Priority order:**

**Source A (Preferred):**
- Search: "Damodaran industry data"
- Search: "S&P Capital IQ sector averages"
- Search: "[Industry association] latest benchmarks"
- True industry dataset from authoritative source

**Source B (Fallback):**
- Calculate from 3-5 peer companies
- Use foundation data if peer metrics provided
- Average manually and show methodology

**Document in output:**
\`\`\`json
{
  "industry_source": "A"  // or "B"
}
\`\`\`

---

## CONFIDENCE SCORING (Style Guide Section 4)

**Assign confidence level:**

**HIGH:**
- Recent 10-K/20-F or 10-Q/6-K (<3 months)
- Geography-specific financial disclosure
- Industry averages from authoritative source (A)
- Multiple primary sources aligned

**MEDIUM:**
- Filings somewhat dated (3-12 months)
- Limited geography-specific detail
- Industry averages from peer set (B)
- Mix of primary and secondary sources

**LOW:**
- Old filings (>12 months) or private company
- No geography-specific financials
- Industry averages unavailable or estimated
- Primarily secondary sources

**Example:**
\`\`\`json
{
  "confidence": {
    "level": "HIGH",
    "reason": "Recent 10-Q with segment detail; geography metrics disclosed"
  }
}
\`\`\`

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown backticks)
- [ ] Confidence assigned with reason
- [ ] Summary is 4-6 sentences
- [ ] Summary emphasizes ${geography} (75-80%)
- [ ] Summary ends with FX and industry source notes
- [ ] All ${requiredKpis.length} required metrics in table (use "-" if unavailable)
- [ ] Table uses exact metric names from style guide
- [ ] ALL metrics cite sources (S# format)
- [ ] Derived metrics flagged with * in table
- [ ] Derived metrics documented in array
- [ ] All currencies in USD
- [ ] Geography focus maintained throughout
- [ ] No speculation (use "-" for unavailable)
- [ ] Sources_used array populated

---

---

## BEGIN RESEARCH

**Company:** ${companyName}  
**Geography:** ${geography}  
**Foundation Context:** [Provided above]

Return a JSON object with keys: confidence, summary, kpi_table, fx_source, industry_source, derived_metrics, sources_used. Do not return an array.

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
`;
  return appendReportTypeAddendum('financial_snapshot', input.reportType, basePrompt);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates Section 2 output against schema
 */
export function validateSection2Output(output: any): output is Section2Output {
  if (!output || typeof output !== 'object') return false;
  
  // Check confidence
  if (!output.confidence || 
      !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level) ||
      typeof output.confidence.reason !== 'string') {
    return false;
  }
  
  // Check summary
  if (typeof output.summary !== 'string' || output.summary.length === 0) {
    return false;
  }
  
  // Check kpi_table
  if (!output.kpi_table || !Array.isArray(output.kpi_table.metrics)) {
    return false;
  }
  
  // Check each metric
  for (const metric of output.kpi_table.metrics) {
    if (!metric.metric || !metric.source) return false;
    if (metric.company === undefined || metric.industry_avg === undefined) {
      return false;
    }
  }
  
  // Check sources
  if (!['A', 'B', 'C'].includes(output.fx_source)) return false;
  if (!['A', 'B', 'C'].includes(output.industry_source)) return false;
  
  // Check derived_metrics
  if (!Array.isArray(output.derived_metrics)) return false;

  // Ensure derived metrics are present in table with asterisk flag
  const tableMetricNames = output.kpi_table.metrics.map(metric => metric.metric);
  for (const derived of output.derived_metrics) {
    const requiredName = `${derived.metric}*`;
    if (!tableMetricNames.includes(requiredName)) return false;
  }
  
  // Check sources_used
  if (!Array.isArray(output.sources_used)) return false;
  
  return true;
}

/**
 * Formats Section 2 output for document generation
 */
export function formatSection2ForDocument(output: Section2Output): string {
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

  const formatTableValue = (
    metricName: string,
    value: number | string
  ) => {
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

  let markdown = `# 2. Financial Snapshot

`;
  markdown += `**Confidence: ${output.confidence.level}** ? ${output.confidence.reason}

`;
  markdown += `## 2.1 Financial Snapshot Summary

`;
  markdown += `${output.summary}

`;
  markdown += `## 2.2 Time Horizon KPIs

`;
  markdown += `Note: Monetary values shown in USD millions unless stated.

`;

  // Build table
  markdown += `| Metric | Company | Industry Avg | Source |
`;
  markdown += `|--------|---------|--------------|--------|
`;

  for (const metric of output.kpi_table.metrics) {
    const company = formatTableValue(metric.metric, metric.company);
    const industry = formatTableValue(metric.metric, metric.industry_avg);
    markdown += `| ${metric.metric} | ${company} | ${industry} | ${metric.source} |
`;
  }

  return markdown;
}

