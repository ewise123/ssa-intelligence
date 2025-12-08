# Section 10: Appendix - Auto-Generation Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 10 (Appendix) by consolidating sources, FX rates, industry averages, and derived metrics from ALL completed sections for **{companyName}** in **{geography}**.

---

## AUTO-GENERATION SECTION NOTICE

**This section AUTO-GENERATES from other sections:**

- **Input:** Foundation + ALL completed sections (1-9)
- **Output:** Three subsections (10.1, 10.2, 10.3)
- **Logic:** Collect, deduplicate, renumber if needed, organize
- **Runs last:** After all other sections complete

---

## INPUT CONTEXT

### Required: Foundation Context

```typescript
{
  company_basics: {
    legal_name: string;
    ticker?: string;
    ownership: 'Public' | 'Private' | 'Subsidiary';
    headquarters: string;
    global_revenue_usd: number;
    global_employees: number;
    fiscal_year_end: string;
  },
  source_catalog: Array<{
    id: string;           // "S1", "S2", "S3", etc.
    citation: string;
    url?: string;
    type: 'transcript' | 'analyst_report' | 'news' | 'user_provided' | 'government';
    date: string;
  }>,
  fx_rates: Record<string, {
    rate: number;
    source: 'A' | 'B' | 'C';
  }>,
  industry_averages: {
    source: 'A' | 'B' | 'C';
    dataset: string;
  }
}
```

### Required: ALL Completed Sections

```typescript
{
  section1?: {sources_used: string[]};
  section2?: {sources_used: string[]; fx_source: string; industry_source: string; derived_metrics: Array<any>};
  section3?: {sources_used: string[]};
  section4?: {sources_used: string[]; segments: Array<{financial_snapshot: {fx_source: string; table: Array<any>}}>};
  section5?: {sources_used: string[]};
  section6?: {sources_used: string[]};
  section7?: {sources_used: string[]};
  section8?: {sources_used: string[]};
  section9?: {sources_used: string[]};
}
```

---

## AUTO-GENERATION LOGIC

### Step 1: Collect All Unique Sources

**From foundation.source_catalog:**
- Base source list established during Phase 0 research

**From all sections (1-9):**
- Extract `sources_used` arrays
- Collect any new sources not in foundation
- De-duplicate by source ID (S#)

**Result:**
- Comprehensive list of ALL sources cited across entire document
- Numbered S1, S2, S3... sequentially

### Step 2: Renumber Sources if Needed

**Foundation establishes base numbering:**
- S1, S2, S3... from Phase 0 research

**Sections may add sources:**
- Continue numbering: S11, S12, S13...

**Check for conflicts:**
- If same source appears with different numbers, consolidate
- If numbering gaps exist, optionally renumber for clean sequence
- Document any renumbering in output

**Decision:**
- **Prefer:** Keep foundation numbering intact if possible
- **If needed:** Renumber all sources sequentially and note changes

### Step 3: Collect FX Rates

**From foundation.fx_rates:**
- Base FX rates used in Phase 0

**From Section 2:**
- `fx_source`: 'A', 'B', or 'C'
- May have additional rates

**From Section 4 (if present):**
- Each segment may have `fx_source`
- Consolidate any additional rates

**Result:**
- Complete list of all FX rates used
- Note source quality (A = company-disclosed, B = historical, C = spot)

### Step 4: Collect Industry Averages

**From foundation.industry_averages:**
- Base industry dataset used

**From Section 2:**
- `industry_source`: 'A', 'B', or 'C'
- Dataset name

**Result:**
- Industry average sources used
- Note source quality (A = true industry, B = peer set)

### Step 5: Collect Derived Metrics

**From Section 2:**
- `derived_metrics` array with formulas and calculations

**From Section 4 (if present):**
- Segment-level derived metrics
- May have additional calculations

**From Section 6 (if present):**
- Peer benchmarking calculations

**Result:**
- Complete list of all derived metrics
- Formula and calculation for each
- Source data cited

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

```typescript
interface Section10Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  source_references: Array<{
    id: string;              // "S1", "S2", "S3", etc.
    citation: string;        // Full citation
    url?: string;
    type: string;
    date: string;
    sections_used_in: string[]; // ["Section 1", "Section 2", "Section 5"]
  }>;
  
  fx_rates_and_industry: {
    fx_rates: Array<{
      currency_pair: string;  // "EUR/USD"
      rate: number;
      source: 'A' | 'B' | 'C';
      source_description: string; // "Company-disclosed average FY2024"
    }>;
    industry_averages: {
      source: 'A' | 'B' | 'C';
      dataset: string;
      description: string;
    };
  };
  
  derived_metrics: Array<{
    metric: string;
    formula: string;
    calculation: string;
    source: string;
    section: string;          // Which section used this metric
  }>;
  
  renumbering_notes?: string; // If sources were renumbered, explain
}
```

---

## SECTION 10.1: SOURCE REFERENCES

**Format:**
```
**S1:** [Full citation with title, date, URL]
**S2:** [Full citation]
**S3:** [Full citation]
...
```

**Organization:**
Group similar sources together (optional but recommended):
1. Company filings (10-K, 10-Q, proxies)
2. Earnings transcripts
3. Analyst/equity research
4. Tier-1 media (WSJ, FT, Bloomberg, Reuters)
5. Industry reports
6. User-provided files
7. Government/regulatory data

**For each source:**
- Bold S# label
- Full citation with title
- Date in parentheses
- URL if available
- Note which sections used it

**Example:**
```
**S1:** Parker Hannifin Corporation, Form 10-K for fiscal year ended June 30, 2024 (filed August 28, 2024). https://investor.parker.com/... [Used in: Sections 1, 2, 3, 4, 5, 6, 7]

**S2:** Parker Hannifin Q4 FY2024 Earnings Conference Call Transcript (August 8, 2024). Seeking Alpha. https://seekingalpha.com/... [Used in: Sections 1, 2, 4, 5]

**S3:** Parker Hannifin German Operations Fact Sheet (Company website, accessed November 2024). https://parker.com/... [Used in: Sections 2, 3, 4]

**S4:** User-provided: Parker_Germany_Financials.xlsx (Internal financial analysis, FY2020-2024).  [Used in: Section 2]
```

---

## SECTION 10.2: FX RATES & INDUSTRY AVERAGES

### FX Rates Used

**Format:**
```
**FX Rates Used:**
- EUR/USD: 1.08 (Company-disclosed average, FY2024) [Source: A]
- GBP/USD: 1.25 (Bloomberg historical average, Q3 2024) [Source: B]
- JPY/USD: 0.0067 (Current spot rate, December 2, 2024) [Source: C]
```

**For each rate:**
- Currency pair
- Rate value
- Description of source
- Source quality label (A/B/C)

### Industry Averages

**Format:**
```
**Industry Averages:**
- Industrial machinery sector averages from Damodaran NYU dataset (January 2024) [Source: A]
- Peer set average (calculated from Parker, Eaton, Emerson, Bosch, Honeywell) [Source: B]
```

**Include:**
- Dataset name
- Date/version
- Source quality label (A/B/C)
- Methodology if peer set (Source B)

---

## SECTION 10.3: DERIVED METRICS FOOTNOTES

**Format:**
```
**Derived Metrics Footnotes:**

1. **Inventory Turns** = Cost of Sales / Average Inventory
   - FY2024: $3,200M COGS / $762M avg inventory = 4.2x
   - Source: Form 10-K (S1)
   - Used in: Section 2, Section 6

2. **ROIC** = NOPAT / Invested Capital
   - NOPAT = Operating Income × (1 - Tax Rate) = $1,010M × (1 - 0.22) = $788M
   - Invested Capital = Total Debt + Total Equity = $2,100M + $4,200M = $6,300M
   - ROIC = $788M / $6,300M = 12.5%
   - Source: Form 10-K (S1)
   - Used in: Section 2, Section 6

3. **Free Cash Flow** = Operating Cash Flow - Capital Expenditures
   - FY2024: $850M OCF - $400M CapEx = $450M FCF
   - Source: Form 10-K (S1)
   - Used in: Section 2
```

**For each metric:**
- Numbered list
- Bold metric name
- Formula
- Calculation with actual numbers
- Source data citation
- Which section(s) used it

---

## SOURCE CONSOLIDATION LOGIC

### Handling Duplicate Sources

**If same source cited with different IDs:**
1. Identify duplicates by comparing citations
2. Choose primary ID (typically lowest number)
3. Update references in all sections
4. Note consolidation in `renumbering_notes`

**Example:**
```json
{
  "renumbering_notes": "S12 and S18 were identical sources (same Q3 2024 earnings transcript); consolidated as S12. All S18 references updated to S12."
}
```

### Handling New Sources Not in Foundation

**If sections added sources not in foundation.source_catalog:**
1. Add to source_references array
2. Continue sequential numbering
3. Maintain citations from sections

### Handling Missing Source Details

**If section references source but citation incomplete:**
1. Search foundation.source_catalog for complete citation
2. If not in foundation, note as incomplete
3. Flag for manual review in confidence reason

---

## CONFIDENCE SCORING

**HIGH:**
- All sources from foundation catalog with complete citations
- All FX rates and industry averages documented
- All derived metrics have clear formulas and calculations
- No conflicts or missing information

**MEDIUM:**
- Most sources documented but some citations incomplete
- FX rates and industry averages present but limited detail
- Some derived metrics lack full calculation detail
- Minor conflicts or gaps

**LOW:**
- Significant sources missing complete citations
- FX rates or industry averages poorly documented
- Derived metrics lack formulas or sources
- Major conflicts or missing information

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] All sources from sections included in source_references
- [ ] Sources de-duplicated
- [ ] Sources have complete citations (title, date, URL where applicable)
- [ ] Sections_used_in populated for each source
- [ ] All FX rates documented with sources
- [ ] Industry averages documented
- [ ] All derived metrics have formulas
- [ ] Calculations shown with actual numbers
- [ ] Source citations for all derived metrics
- [ ] Renumbering_notes included if applicable

---

## CRITICAL REMINDERS

1. **Auto-generate from sections** - Don't create new content
2. **Consolidate and de-duplicate** - Single entry per unique source
3. **Complete citations** - Full information for each source
4. **Document all FX rates** - Every currency conversion noted
5. **Show calculations** - Actual numbers for derived metrics
6. **Cross-reference** - Note which sections use each element
7. **Valid JSON only** - No markdown backticks
8. **Exact schema match** - Follow TypeScript interface

---

## BEGIN AUTO-GENERATION

**Company:** {companyName}  
**Geography:** {geography}  
**Available Sections:** [List all completed sections]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. AUTO-GENERATE APPENDIX NOW.**
