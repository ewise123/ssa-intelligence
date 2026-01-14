/**
 * Section 2: Financial Snapshot - TypeScript Implementation
 * Generates prompt and types for Financial Snapshot section
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
  fx_rates: Record<string, {
    rate: number;
    source: 'A' | 'B' | 'C';
  }>;
  industry_averages: {
    source: 'A' | 'B' | 'C';
    dataset: string;
  };
}

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
// PROMPT BUILDER
// ============================================================================

export function buildFinancialSnapshotPrompt(input: Section2Input): string {
  const { foundation, companyName, geography } = input;
  
  // Serialize foundation context for injection
  const foundationJson = JSON.stringify(foundation, null, 2);
  
  const basePrompt = `# Section 2: Financial Snapshot - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 2 (Financial Snapshot) with comprehensive current-year/LTM financial analysis for **${companyName}** in **${geography}**.

---

## INPUT CONTEXT (From Foundation)

You have received the following foundation context:

\`\`\`json
${foundationJson}
\`\`\`

---

## RESEARCH REQUIREMENTS

### Primary Research Focus

**Search for current year/LTM financial metrics:**

1. **Revenue Metrics (Priority: CRITICAL)**
   - Search: "${companyName} revenue Q4 2024" OR "${companyName} 10-Q Q3 2024"
   - Search: "${companyName} ${geography} revenue FY2024"
   - Extract:
     - Total company revenue (latest quarter, LTM, or FY)
     - YoY growth rate (global and ${geography})
     - ${geography} revenue as % of total
     - Segment breakdown if available

2. **Profitability Metrics (Priority: CRITICAL)**
   - Search: "${companyName} EBITDA margin" OR "${companyName} operating margin"
   - Search: "${companyName} earnings release Q4 2024"
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
   - Search: "${companyName} cash flow statement 2024"
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
   - Search: "sector benchmarks 2024"
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
      company: number | string; // Number value or "â€“" if unavailable
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

## REQUIRED METRICS FOR KPI TABLE

**The table MUST include these metrics (use "â€“" if unavailable):**

1. Revenue (Latest Period)
2. Revenue Growth (YoY)
3. EBITDA Margin
4. Operating Margin
5. Gross Margin
6. Net Margin
7. Operating Cash Flow
8. Free Cash Flow Margin
9. Days Sales Outstanding (DSO)
10. Days Inventory Outstanding (DIO)
11. Inventory Turns
12. Cash Conversion Cycle
13. ROIC (Return on Invested Capital)
14. CapEx as % Revenue
15. Debt/EBITDA (if applicable)

**Table format MUST match style guide Section 8:**
\`\`\`
| Metric | Company | Industry Avg | Source |
\`\`\`


---

## SUMMARY REQUIREMENTS (Section 2.1)

**Write 4-6 sentences covering:**

1. **Revenue trajectory:** Global vs ${geography} trends
   - Example: "**${geography} operations** generated {currency}X.XB revenue (X% of global) in FY2024, growing X% YoY vs X% globally (S1)."

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

âœ… **CORRECT patterns:**
- "**${geography}** revenue grew 15% vs 12% globally..."
- "${geography} EBITDA margin of 19.2% exceeds company average of 18.3%..."
- "Regional DSO of 65 days compares favorably to 68-day company average..."
- "${geography} facilities generated $120M free cash flow, 60% of company total..."

âŒ **WRONG patterns:**
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
**Use "â€“" (en dash) for missing metrics:**
\`\`\`json
{
  "metric": "Gross Margin",
  "company": "â€“",
  "industry_avg": 42.5,
  "source": "S7"
}
\`\`\`

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
  "calculation": "FY2024: $3,200M COGS / $762M avg inventory = 4.2x",
  "source": "S1"
}
\`\`\`

### Never Speculate
- If data cannot be verified â†’ Use "â€“"
- If you must estimate â†’ Show methodology explicitly
- Example: "Regional revenue estimated at $1.3B* (Europe total of $2.8B Ã— Germany's ~45% share based on facility count; S1, S3)"

---

## CURRENCY CONVERSION (Style Guide Section 9)

**ALL financial metrics MUST be in USD:**

1. **First mention:** Show both currencies
   - "â‚¬1.2B (â‰ˆ$1.3B using 1.08 EUR/USD)"

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
- Search: "[Industry association] benchmarks 2024"
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
    "reason": "Recent Q3 2024 10-Q with segment detail; geography metrics disclosed"
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
- [ ] All 15 required metrics in table (use "â€“" if unavailable)
- [ ] Table uses exact metric names from style guide
- [ ] ALL metrics cite sources (S# format)
- [ ] Derived metrics flagged with * in table
- [ ] Derived metrics documented in array
- [ ] All currencies in USD
- [ ] Geography focus maintained throughout
- [ ] No speculation (use "â€“" for unavailable)
- [ ] Sources_used array populated

---

## CRITICAL REMINDERS

1. **Follow style guide:** ALL formatting rules apply
2. **75-80% geography focus:** Every metric must show regional context
3. **Source everything:** No unsourced claims
4. **Use "â€“" for unavailable:** Never speculate or leave blank
5. **Flag derived metrics:** Asterisk + documentation
6. **Currency in USD:** Convert all amounts
7. **Valid JSON only:** No markdown, no prose outside JSON
8. **Exact schema match:** Follow TypeScript interface

---

## BEGIN RESEARCH

**Company:** ${companyName}  
**Geography:** ${geography}  
**Foundation Context:** [Provided above]

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
  
  // Check sources_used
  if (!Array.isArray(output.sources_used)) return false;
  
  return true;
}

/**
 * Formats Section 2 output for document generation
 */
export function formatSection2ForDocument(output: Section2Output): string {
  let markdown = `# 2. Financial Snapshot\n\n`;
  markdown += `**Confidence: ${output.confidence.level}** â€“ ${output.confidence.reason}\n\n`;
  markdown += `## 2.1 Financial Snapshot Summary\n\n`;
  markdown += `${output.summary}\n\n`;
  markdown += `## 2.2 Current Year / LTM KPIs\n\n`;
  
  // Build table
  markdown += `| Metric | Company | Industry Avg | Source |\n`;
  markdown += `|--------|---------|--------------|--------|\n`;
  
  for (const metric of output.kpi_table.metrics) {
    const company = typeof metric.company === 'number' ? 
      metric.company.toLocaleString() : metric.company;
    const industry = typeof metric.industry_avg === 'number' ?
      metric.industry_avg.toLocaleString() : metric.industry_avg;
    markdown += `| ${metric.metric} | ${company} | ${industry} | ${metric.source} |\n`;
  }
  
  return markdown;
}

