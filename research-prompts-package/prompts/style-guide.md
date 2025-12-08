# Company Intelligence Sheet - Style Guide

**Version:** 1.0  
**Purpose:** Single source of truth for formatting consistency across all Company Intelligence Sheet sections

This guide ensures that every section prompt produces output that integrates seamlessly into the final document. ALL section prompts MUST reference and follow these standards.

---

## 1. TYPOGRAPHY STANDARDS

### Font Requirements
- **Primary font:** Calibri (light, readable sans serif)
- **Fallback:** Arial if Calibri unavailable
- **Never use:** Times New Roman, Courier, decorative fonts

### Heading Hierarchy

**Heading 1 (H1) - Main Sections:**
- Font: Calibri Bold, 16pt
- Color: Dark blue or black
- Spacing: 12pt before, 6pt after
- Usage: Section titles only (1. Executive Summary, 2. Financial Snapshot, etc.)
- Format: `1. Section Title` (number + period + space + title)

**Heading 2 (H2) - Subsections:**
- Font: Calibri Bold, 14pt
- Color: Dark blue or black
- Spacing: 10pt before, 4pt after
- Usage: Subsection titles (2.1 Financial Snapshot Summary, 4.X.1 Financial Snapshot, etc.)
- Format: `2.1 Subsection Title` (parent.child numbering)

**Heading 3 (H3) - Sub-subsections:**
- Font: Calibri Bold, 12pt
- Color: Dark blue or black
- Spacing: 8pt before, 3pt after
- Usage: Rare; only for deep nesting if absolutely necessary

**Body Text:**
- Font: Calibri Regular, 11pt
- Color: Black
- Line spacing: 1.15
- Paragraph spacing: 6pt after
- Alignment: Left (never justify)

### Bold Usage Rules

**ONLY bold these elements:**
- Critical financial terms on first mention: **EBITDA margin**, **working capital**, **ROIC**
- Geographic emphasis: **Germany operations**, **US facilities**
- Key metrics in prose: **DSO increased to 68 days**, **inventory turns declined**
- Important strategic terms: **strategic priority**, **key risk**, **competitive advantage**

**NEVER bold:**
- Entire sentences
- Emphasis for rhetorical effect
- Headers (already styled)
- Multiple consecutive words unnecessarily
- Company names (unless emphasizing geography-specific mention)

### Italic Usage Rules

**Use italics for:**
- Analyst quotes only: *"Margin expansion demonstrates operational excellence"*
- Foreign language terms: *prima facie*, *raison d'être*
- Emphasis in rare cases: "This is the *only* facility with this capability"

**Format for analyst quotes:**
```
*"[Quote text under 15 words]"* - Analyst Name, Firm Name (S#)
```

---

## 2. TONE AND VOICE

### Writing Principles

**Analytical, Not Promotional:**
- ✅ CORRECT: "EBITDA margin declined 120bps to 18.3% due to input cost inflation"
- ❌ WRONG: "The company achieved strong margins despite challenging conditions"

**Executive-Ready Language:**
- Direct and concise
- No business jargon or buzzwords
- No hedging language ("perhaps", "might", "possibly")
- Clear implications ("This means...", "The impact is...")

**Data-Driven Assertions:**
- Every claim must cite a source: (S1), (S2, S5), etc.
- Quantify wherever possible: "15% growth" not "strong growth"
- Compare to benchmarks: "vs. 12% peer average" or "vs. 18.2% prior year"

### Voice Guidelines

**Use:**
- Active voice: "Management invested $50M" not "A $50M investment was made"
- Present tense for current facts: "The company operates 12 facilities"
- Past tense for historical events: "Revenue grew 8% in FY2023"
- Third person: "Parker Hannifin operates..." not "We operate..." or "You operate..."

**Avoid:**
- First person (I, we, our)
- Second person (you, your) unless in Conversation Starters section
- Passive constructions when active is clearer
- Unnecessary complexity or subordinate clauses

### Example Transformations

❌ **POOR:** "The company has been experiencing some challenges in their German operations which could potentially impact future performance."

✅ **GOOD:** "German operations face margin pressure from labor cost inflation (S3), contributing to a 90bps decline in regional EBITDA margin to 16.5% in Q3 2024 (S1)."

---

## 3. GEOGRAPHY FOCUS ENFORCEMENT

### The 75-80% Rule

**Every section must emphasize the target geography in 75-80% of content.**

This means:
- Lead with geography-specific findings
- Prioritize regional data over global data
- Frame global context in service of regional understanding
- Always show geography vs. company-wide comparisons

### Implementation Examples

**Executive Summary (Section 1):**
- ✅ "**Germany operations** generated €1.2B revenue (22% of global), growing 8% YoY vs. 6% globally..."
- ❌ "Company delivered strong performance with revenue of $5.5B globally..."

**Financial Snapshot (Section 2):**
- ✅ "German facilities operate at 84% capacity vs. 78% company average, with Stuttgart plant achieving 92% OEE..."
- ❌ "Global capacity utilization averaged 78%, with solid performance across regions..."

**Trends (Section 5):**
- ✅ "German manufacturing PMI declined to 43.2 in Q3 2024, signaling continued contraction in industrial demand (S15)..."
- ❌ "Global manufacturing activity remained soft, with PMI indices showing weakness..."

### Geography Mention Patterns

**Use these patterns to maintain focus:**

1. **Lead with geography:** "[Geography] operations represent..."
2. **Compare to global:** "...outpacing the company's 12% global growth rate"
3. **Regional implications:** "This positions the [geography] business to..."
4. **Local context:** "Within [geography], [specific city/region] facilities..."

**Avoid:**
- Long global discussions without regional connection
- Generic statements that could apply anywhere
- Burying geography-specific data in footnotes or subordinate clauses

---

## 4. CONFIDENCE SCORING METHODOLOGY

### Overall Document Confidence

**Assign at document level with justification:**

```
Overall Confidence Level: HIGH
Reason: Multiple primary sources (10-K, earnings transcripts), recent data (<3 months), geography-specific disclosures available.
```

**HIGH Confidence:**
- Multiple primary sources (filings, transcripts, research reports)
- Recent data (<6 months old)
- Geography-specific information readily available
- Limited data conflicts or gaps
- Quantitative metrics available

**MEDIUM Confidence:**
- Mix of primary and secondary sources
- Some data moderately dated (6-18 months)
- Limited geography-specific detail but strong global context
- Some data gaps requiring extrapolation
- Qualitative emphasis due to limited quantitative data

**LOW Confidence:**
- Primarily secondary sources (news, industry reports)
- Older data (>18 months)
- Minimal geography-specific information
- Significant data gaps or conflicts
- Heavy reliance on estimation or inference

### Section-Level Confidence

**Each section must include:**

```
**Confidence: MEDIUM – Mix of primary filings and secondary sources; limited segment-level geographic disclosure.**
```

**Format:**
- Bold "Confidence:" label
- Level in CAPS: HIGH, MEDIUM, or LOW
- En dash separator (–)
- Brief justification (1 sentence, <20 words)

### Justification Examples

✅ **GOOD:**
- "Recent 10-K with detailed segment data; Q4 2024 earnings transcript with regional commentary."
- "Strong primary sources but geography-specific financials not separately disclosed."
- "Limited public data; private company with minimal disclosure requirements."

❌ **POOR:**
- "Good data available."
- "Some confidence issues but generally okay."
- "Based on available information, we believe..."

---

## 5. SOURCE CITATION RULES

### The S# System

**All sources must be:**
1. Numbered consecutively: S1, S2, S3, S4...
2. Listed in full in Appendix 10.1
3. Cited in main body using (S#) format only

**In-text citation format:**
```
German revenue grew 12% YoY to €1.2B in FY2024 (S1, S3).
Management highlighted capacity expansion in Stuttgart (S2).
According to analyst estimates, margins should stabilize in H2 2025 (S7).
```

**Never use:**
- Full citations in main body
- Footnotes for sources (use only for derived metrics)
- URL citations inline
- "According to their 10-K..." (use source number)

### Source Numbering Rules

**Number sources in order of first appearance:**
- First source mentioned = S1
- Second source mentioned = S2
- Continue sequentially through document

**Maintain consistency:**
- Same source gets same number throughout
- If S3 is the "Q4 2024 10-K", always cite it as S3
- Never renumber sources mid-document

### Appendix Source Format (10.1)

**Required format:**
```
**S1:** Parker Hannifin Corporation, Form 10-K for fiscal year ended June 30, 2024 (filed August 28, 2024). https://investor.parker.com/...

**S2:** Parker Hannifin Q4 FY2024 Earnings Conference Call Transcript (August 8, 2024). Seeking Alpha. https://seekingalpha.com/...

**S3:** Financial Times, "Parker Hannifin expands hydraulics capacity in Germany," November 15, 2024. https://ft.com/...

**S4:** User-provided: Parker_Germany_Financials.xlsx (Internal financial analysis, FY2020-2024).

**S5:** German Federal Statistical Office, Manufacturing Production Index (October 2024). https://destatis.de/...
```

**Elements:**
- Bold S# label
- Full citation with title/description
- Publication/filing date in parentheses
- URL if available (no "Retrieved from" prefix)
- For user files: Filename and description

---

## 6. ANALYST QUOTE RULES (COPYRIGHT COMPLIANCE)

### Hard Limits (NON-NEGOTIABLE)

**Rule 1: Maximum 15 words per quote**
- This is a HARD LIMIT for copyright compliance
- Count every word including articles (a, the) and conjunctions (and, but)
- If a natural quote is longer, extract only the most critical phrase

**Rule 2: ONE quote per analyst report source**
- After quoting one sentence from a source, that source is CLOSED for quotation
- All additional content from that source must be paraphrased
- You can cite the source (S7) as many times as needed, but only one direct quote

### Quote Format

**Standard format:**
```
*"[Quote text under 15 words]"* - Analyst Name, Firm Name (S#)
```

**Example:**
```
*"German operations demonstrate best-in-class efficiency metrics"* - Sarah Chen, Morgan Stanley (S12)
```

**Elements:**
- Italicized quote with quotation marks
- En dash separator (–)
- Analyst first and last name
- Firm name
- Source reference (S#) in parentheses

### Quote Placement Strategy

**Use quotes to:**
- Support key financial outlooks or projections
- Validate management claims with independent perspective
- Highlight competitive positioning insights
- Emphasize strategic concerns or opportunities

**Place quotes in:**
- Segment Analysis (4.X.2 Performance Analysis)
- Trends sections (5.2, 5.3, 5.4)
- Financial Snapshot Summary (2.1)
- Occasionally in Executive Summary (if highly impactful)

**Avoid:**
- Quotes in tables or lists
- Quotes for basic facts (use citation instead)
- Multiple quotes in same paragraph (space them out)
- Quotes that repeat what's already stated in prose

### Copyright Compliance Examples

✅ **CORRECT - 14 words:**
*"Regional margin expansion in Germany outpacing expectations despite elevated input costs"* - John Smith, Goldman Sachs (S8)

✅ **CORRECT - Paraphrase after first quote:**
First mention: *"Operations in Germany showing remarkable resilience"* - Jane Doe, JPMorgan (S5)
Later mention: Analyst Jane Doe also noted strong operational discipline and market share gains in the region (S5).

❌ **WRONG - 22 words (TOO LONG):**
*"The company's German operations have demonstrated remarkable resilience and operational efficiency despite challenging macroeconomic headwinds in the manufacturing sector"* - John Smith, Goldman Sachs (S8)

❌ **WRONG - Multiple quotes from same source:**
*"German margins improved significantly"* - Jane Doe, JPMorgan (S5)
[Later in document]
*"Market share gains continue in Europe"* - Jane Doe, JPMorgan (S5)
[VIOLATION: Two quotes from S5]

---

## 7. BULLET FORMATTING RULES

### The CRITICAL Rule: Never Use Manual Bullet Characters

**NEVER type these characters in bullet content:**
- • (bullet point)
- – (en dash)
- — (em dash)  
- - (hyphen for bullets)
- * (asterisk for bullets)

**Why:** Document generation systems add bullets automatically. Manual characters create double bullets (• • text) or formatting breaks.

### Correct Bullet Implementation

**In markdown output for document generation:**
```markdown
- US operations represent 45% of global revenue, growing 8% YoY
- German facilities achieved 92% OEE vs 85% company average
- Strategic investment of €75M in Stuttgart hydraulics expansion announced Q4 2024
```

**In JSON output:**
```json
{
  "bullets": [
    "US operations represent 45% of global revenue, growing 8% YoY",
    "German facilities achieved 92% OEE vs 85% company average",
    "Strategic investment of €75M in Stuttgart hydraulics expansion announced Q4 2024"
  ]
}
```

### Sub-bullets (Level 1)

**For nested information:**
```markdown
- Commercial aerospace recovery accelerating in European markets
  - Direction: Positive
  - Impact Score: 8/10
  - Primary driver: Airbus production ramp-up in Germany (S14)
```

**In JSON:**
```json
{
  "trend": "Commercial aerospace recovery accelerating in European markets",
  "direction": "Positive",
  "impact_score": 8,
  "rationale": "Primary driver: Airbus production ramp-up in Germany (S14)"
}
```

### Common Mistakes to Avoid

❌ **WRONG - Manual bullet in text:**
```
• • German operations grew 12% YoY
```

❌ **WRONG - Manual en dash for sub-bullets:**
```
- Main point here
  – Direction: Positive  [Manual "–" creates problems]
  – Impact: 7/10
```

✅ **CORRECT - Plain text, let system add formatting:**
```
- Main point here
  - Direction: Positive  [System adds sub-bullet automatically]
  - Impact: 7/10
```

---

## 8. TABLE FORMATTING STANDARDS

### General Table Rules

**Column Headers:**
- Bold text
- Light gray background shading (RGB: 242, 242, 242 or equivalent)
- 11pt font size
- Left-aligned for text columns
- Right-aligned for number columns

**Table Borders:**
- Light gray, 0.5pt weight
- All cells have borders (grid style)
- Slightly heavier border for header row (1pt)

**Cell Content:**
- 10pt font (slightly smaller than body text)
- Left-aligned: Text, company names, descriptions
- Right-aligned: Numbers, percentages, currency
- Centered: N/A, –, or other placeholder symbols

**Row Height:**
- Minimum 0.3" for readability
- Auto-expand for wrapped text
- Consistent height within same table

### Number Formatting in Tables

**Currency:**
- Format: `$123.4M` or `€1.2B`
- Always specify currency symbol
- Use M for millions, B for billions
- One decimal place: `$1,234.5M` not `$1,235M` or `$1,234.56M`
- Right-aligned in cells

**Percentages:**
- Format: `12.5%`
- One decimal place (exceptions: if need precision, use two)
- Include % symbol
- Right-aligned in cells

**Ratios and Multiples:**
- Format: `2.5x` or `1.8:1`
- One decimal place
- Include unit (x, :1, etc.)
- Right-aligned in cells

**Dates:**
- Format: `Q4 2024` or `FY2024` or `Nov 2024`
- No long dates: ❌ "November 15, 2024"
- Consistent format within table
- Left-aligned in cells

**Unavailable Data:**
- Use `–` (en dash) not `N/A`, `n/a`, `NA`, or `Data unavailable`
- Center-aligned in cells
- Consistent throughout document

### Required Table Formats

**1. Financial Snapshot Table (Section 2.2):**
```
| Metric                    | Company  | Industry Avg | Source |
|---------------------------|----------|--------------|--------|
| Revenue Growth (YoY)      | 12.5%    | 8.3%         | S1, S7 |
| EBITDA Margin             | 18.3%    | 16.5%        | S1, S7 |
| Inventory Turns*          | 4.2x     | 3.8x         | S1, S7 |
| Days Sales Outstanding    | 68 days  | 62 days      | S1, S7 |
```
**Column names must be EXACTLY as shown.**

**2. Segment Financial Snapshot Table (Section 4.X.1):**
```
| Metric                | Segment  | Company Avg | Industry Avg | Source |
|-----------------------|----------|-------------|--------------|--------|
| Revenue               | $1.2B    | –           | –            | S1     |
| Revenue % of Total    | 22.0%    | –           | –            | S1     |
| YoY Growth            | 15.5%    | 12.5%       | 8.3%         | S1, S7 |
| Operating Margin      | 19.2%    | 18.3%       | 16.5%        | S1, S7 |
```
**Column names must be EXACTLY as shown.**

**3. Peer Benchmarking Table (Section 6.1):**
```
| Metric              | [Company] | Peer 1     | Peer 2     | Peer 3     | Industry Avg |
|---------------------|-----------|------------|------------|------------|--------------|
| Revenue (Latest)    | $5.5B     | $4.2B      | $6.1B      | $3.8B      | –            |
| Revenue Growth      | 12.5%     | 8.0%       | 15.2%      | 6.5%       | 8.3%         |
| EBITDA Margin       | 18.3%     | 16.8%      | 19.5%      | 15.2%      | 16.5%        |
| ROIC                | 12.5%     | 10.8%      | 14.2%      | 9.5%       | 11.2%        |
```
**Replace [Company] with actual company name. Other columns exact.**

**4. SKU Opportunity Table (Section 7):**
```
| Issue Area              | Public Problem Identified           | Aligned SKU                    | Priority | Severity | Potential Value Levers        |
|-------------------------|-------------------------------------|--------------------------------|----------|----------|-------------------------------|
| Inventory Management    | DSO increased 6 days YoY to 68 days | Order-to-Cash Acceleration     | High     | 6/10     | $50M cash trapped; 5-day DSO improvement = $4M cash release |
```
**All column names must match exactly.**

### Table Footnotes

**For derived metrics:**
- Use asterisk (*) after metric name in table
- Add footnote below table or in Appendix 10.3
- Format: `*Calculated as Cost of Sales / Average Inventory`

**Example:**
```
| Metric              | Company | Source |
|---------------------|---------|--------|
| Inventory Turns*    | 4.2x    | S1     |

*Calculated as Cost of Sales / Average Inventory (FY2023 and FY2024 data).
```

---

## 9. CURRENCY CONVERSION RULES

### Always Convert to USD

**Every financial metric must be in US Dollars (USD):**
- Revenue figures
- Profit/EBITDA/operating income
- Investment amounts
- Cost figures
- Working capital metrics

**Show conversions explicitly:**
- €1.2B (≈$1.3B) ← Show both when first introducing
- After first mention: $1.3B ← USD only

### FX Rate Source Hierarchy

**Use this priority order:**

**Source A: Company-Disclosed Rate (Most Reliable)**
- Found in: 10-K/20-F "Basis of Presentation" or "Foreign Currency" notes
- Example: "The company uses an average rate of 1.08 EUR/USD for FY2024 reporting"
- Label in output: `"fx_rate_source": "A"`

**Source B: Historical Average (Reliable)**
- Use: Bloomberg, Reuters, or central bank data for the specific period
- Example: "Bloomberg EUR/USD average for Q3 2024: 1.09"
- Label in output: `"fx_rate_source": "B"`

**Source C: Current Spot Rate (Fallback)**
- Use: Current exchange rate from Bloomberg/Reuters/XE.com
- Only when historical rate unavailable
- Label in output: `"fx_rate_source": "C"`
- Note limitation: "Converted at current spot rate; may not reflect period performance"

### FX Rate Documentation

**In Appendix 10.2, document all rates used:**
```
**FX Rates Used:**
- EUR/USD: 1.08 (Company-disclosed average, FY2024) [Source: A]
- GBP/USD: 1.25 (Bloomberg historical average, Q3 2024) [Source: B]
- JPY/USD: 0.0067 (Current spot rate, December 2, 2024) [Source: C]
```

### Common Currency Conversions

**Major currencies to track:**
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- CNY (Chinese Yuan)
- CHF (Swiss Franc)
- CAD (Canadian Dollar)
- KRW (South Korean Won)
- INR (Indian Rupee)

---

## 10. DATA QUALITY RULES

### Use "–" for Unavailable Data

**The en dash (–) is the ONLY acceptable placeholder for missing data.**

❌ **NEVER use:**
- "N/A"
- "Not available"
- "Data unavailable"
- "Unknown"
- "TBD"
- Empty cells
- "0" or "0.0" (unless actually zero)

✅ **CORRECT:**
```
| Metric              | Company | Industry Avg |
|---------------------|---------|--------------|
| ROIC                | 12.5%   | –            |
| DSO                 | –       | 62 days      |
```

### Derived Metrics - Use Asterisk (*)

**When you calculate a metric not directly disclosed:**

1. Add asterisk after metric name: `Inventory Turns*`
2. Include formula in Appendix 10.3
3. Cite source data used in calculation

**Example in table:**
```
| Metric              | Company | Source |
|---------------------|---------|--------|
| Inventory Turns*    | 4.2x    | S1     |
| ROIC*               | 12.5%   | S1     |
```

**In Appendix 10.3:**
```
**Derived Metrics Footnotes:**

1. **Inventory Turns** = Cost of Sales / Average Inventory
   - FY2024: $3,200M COGS / $762M avg inventory = 4.2x
   - Source: Form 10-K (S1)

2. **ROIC** = NOPAT / Invested Capital
   - NOPAT = Operating Income × (1 - Tax Rate) = $1,010M × (1 - 0.22) = $788M
   - Invested Capital = Total Debt + Total Equity = $2,100M + $4,200M = $6,300M
   - ROIC = $788M / $6,300M = 12.5%
   - Source: Form 10-K (S1)
```

### Never Speculate

**If data cannot be verified from sources:**
- Use "–" placeholder
- Do NOT estimate, extrapolate, or guess
- Do NOT use phrases like "approximately", "estimated to be", "likely around"
- Exception: Explicit extrapolation with methodology disclosed

**Valid extrapolation example:**
```
German revenue: $1.3B* (estimated from "Europe" disclosure of $2.8B × Germany's ~45% share of European revenue based on facility count and disclosed employment data; S1, S3)

*Extrapolated estimate; not separately disclosed by company.
```

**Invalid speculation examples:**
❌ "German revenue likely around $1.3B"
❌ "ROIC estimated at ~12%"
❌ "Margins probably similar to peers at 16-18%"

---

## 11. JSON OUTPUT STRUCTURE REQUIREMENTS

### Critical JSON Rules

**When outputting structured data for downstream processing:**

1. **Valid JSON only** - No markdown, no prose, no backticks
2. **Exact schema match** - Follow TypeScript interface precisely
3. **Consistent typing** - Strings are strings, numbers are numbers, booleans are booleans
4. **No undefined** - Use `null` or empty string/array, never `undefined`
5. **Source references** - Always include source IDs in arrays or comma-separated strings

### Standard JSON Structure

```json
{
  "section_title": "2. Financial Snapshot",
  "confidence": {
    "level": "HIGH",
    "reason": "Recent 10-K and earnings transcripts with detailed segment data"
  },
  "content": {
    "summary": "German operations generated €1.2B revenue...",
    "key_points": [
      "German revenue grew 15% YoY vs 12% globally (S1)",
      "Regional EBITDA margin of 19.2% exceeds company average of 18.3% (S1)",
      "Stuttgart facility operates at 92% OEE (S3)"
    ],
    "tables": [
      {
        "title": "Current Year / LTM KPIs",
        "headers": ["Metric", "Company", "Industry Avg", "Source"],
        "rows": [
          ["Revenue Growth (YoY)", "12.5%", "8.3%", "S1, S7"],
          ["EBITDA Margin", "18.3%", "16.5%", "S1, S7"]
        ]
      }
    ]
  },
  "sources": ["S1", "S3", "S7"],
  "analyst_quotes": [
    {
      "quote": "German operations demonstrate best-in-class efficiency metrics",
      "analyst": "Sarah Chen",
      "firm": "Morgan Stanley",
      "source_id": "S12"
    }
  ]
}
```

### Field Naming Conventions

**Use snake_case for keys:**
- ✅ `"source_id"`, `"analyst_quotes"`, `"key_points"`
- ❌ `"sourceId"`, `"analystQuotes"`, `"keyPoints"`

**Be consistent:**
- If you use `"source_id"` in one place, use it everywhere
- Don't mix `"sources"` (array) with `"source_id"` (string) inconsistently

### Data Types

**Strings:**
```json
{
  "company_name": "Parker Hannifin",
  "geography": "Germany",
  "confidence_reason": "Recent 10-K with detailed data"
}
```

**Numbers:**
```json
{
  "revenue_usd": 5500000000,     // Not "5.5B" or "$5.5B"
  "growth_rate": 12.5,           // Not "12.5%" or "0.125"
  "impact_score": 8              // Integer for scores
}
```

**Booleans:**
```json
{
  "has_10k": true,
  "geography_specific": false
}
```

**Arrays:**
```json
{
  "sources": ["S1", "S3", "S7"],
  "facilities": [
    {"name": "Stuttgart Plant", "type": "Manufacturing"},
    {"name": "Munich R&D Center", "type": "Research"}
  ]
}
```

**Nulls (for unavailable data):**
```json
{
  "regional_employees": null,    // When data not available
  "ticker": null                 // For private companies
}
```

### Source References in JSON

**Always include source IDs:**
```json
{
  "key_findings": [
    {
      "finding": "German revenue grew 15% YoY",
      "source_ids": ["S1"],
      "confidence": "HIGH"
    },
    {
      "finding": "Market share estimated at 18-20% in hydraulics",
      "source_ids": ["S7", "S12"],
      "confidence": "MEDIUM"
    }
  ]
}
```

---

## 12. SECTION-SPECIFIC STYLE NOTES

### Executive Summary (Section 1)

**Format:** 5-7 bullet points, analytical tone

**Structure:**
1. Lead with geography-specific headline
2. Financial performance (2-3 bullets)
3. Strategic posture (1-2 bullets)
4. Key risks (1-2 bullets)
5. Momentum assessment (1 bullet)

**Example opening:**
- **German operations** generated €1.2B revenue (22% of global total) in FY2024, growing 15% YoY and outpacing company-wide growth of 12% (S1)

### Financial Snapshot Summary (Section 2.1)

**Format:** 4-6 sentences of analytical prose

**Must cover:**
1. Revenue trajectory (global + geography)
2. Profitability evolution
3. Working capital position
4. Cash generation
5. Geography-specific performance
6. FX impacts (if material)

**Always end with:** "FX rate source: [A/B/C]" and "Industry average source: [A/B/C]"

### Segment Analysis (Section 4.X.2)

**Voice:** Analytical, management + analyst perspectives

**Include:**
- Performance drivers (quantified where possible)
- Management commentary from earnings calls
- Analyst quotes (one per segment maximum)
- Strategic initiatives
- Geography-specific performance
- Risks and headwinds

### Trends (Section 5)

**Format:** Bulleted trends with sub-bullets

**Each trend includes:**
- Trend description (main bullet)
- Direction: Positive/Negative/Neutral (sub-bullet)
- Impact Score: 1-10 (sub-bullet)
- Supporting evidence with sources (sub-bullet)

**Impact score guidance:**
- 1-3: Minor operational impact
- 4-6: Moderate strategic impact
- 7-8: Major business impact
- 9-10: Critical/transformational impact

### Peer Benchmarking (Section 6.2)

**Format:** 3-4 paragraphs of synthesis

**Structure:**
1. How company compares overall
2. Key strengths vs peers (with metrics)
3. Key gaps vs peers (with metrics)
4. Geographic competitive positioning

### Executive Conversation Starters (Section 9)

**Format:** 3-5 bullet points as questions or discussion topics

**Each starter should:**
- Reference specific finding from report
- Frame as question or discussion (not presentation)
- Link to business value/decision
- Be geography-specific where possible
- Suggest relevant SSA capability

**Example:**
- **Working capital opportunity:** German DSO deteriorated to 68 days vs 62 days company average, trapping ~$50M cash. Have you explored payment term restructuring with major industrial customers? Our Order-to-Cash Acceleration practice typically achieves 5-10 day DSO improvements.

---

## 13. QUALITY CONTROL CHECKLIST

**Before finalizing any section output, verify:**

### Formatting
- [ ] Calibri font used throughout
- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] Bold usage limited to critical terms only
- [ ] No manual bullet characters (•, –, —) in text
- [ ] Tables formatted with exact column headers
- [ ] Numbers formatted consistently (one decimal for %)

### Content
- [ ] 75-80% geography focus maintained
- [ ] Every claim cites source (S#)
- [ ] All currencies converted to USD
- [ ] "–" used for unavailable data (not N/A)
- [ ] Confidence level assigned with justification
- [ ] Analyst quotes ≤15 words, one per source

### Data Quality
- [ ] FX rate source noted (A/B/C)
- [ ] Industry average source noted (A/B/C)
- [ ] Derived metrics flagged with asterisk (*)
- [ ] No speculation or unsupported claims
- [ ] Sources numbered S1, S2, S3... sequentially

### JSON (if applicable)
- [ ] Valid JSON syntax (no markdown backticks)
- [ ] Exact schema match
- [ ] Consistent snake_case naming
- [ ] Proper data types (string, number, boolean)
- [ ] No undefined values (use null instead)

### Tone & Voice
- [ ] Analytical, not promotional
- [ ] Executive-ready language (no jargon)
- [ ] Active voice preferred
- [ ] Third person throughout
- [ ] Data-driven assertions

---

## 14. COMMON MISTAKES TO AVOID

### Typography Mistakes
❌ Using Times New Roman or serif fonts  
❌ Over-bolding (entire sentences or phrases)  
❌ Inconsistent heading capitalization  
❌ Wrong font sizes for headings  

### Content Mistakes
❌ Leading with global data instead of geography  
❌ Generic statements without sources  
❌ Speculation about unavailable data  
❌ Using "N/A" instead of "–"  
❌ Converting currencies incorrectly or inconsistently  

### Citation Mistakes
❌ Full citations in main body (use S# only)  
❌ Analyst quotes >15 words  
❌ Multiple quotes from same source  
❌ Missing source numbers for claims  
❌ Inconsistent S# numbering  

### Bullet Mistakes
❌ Manual bullet characters in text (• – —)  
❌ Inconsistent bullet levels  
❌ Bullets that are too long (>2 sentences)  
❌ Using bullets for single items  

### Table Mistakes
❌ Wrong column headers (not matching required format)  
❌ Inconsistent number formatting  
❌ Left-aligning numbers  
❌ Using "N/A" instead of "–"  
❌ No source column or citations  

### JSON Mistakes
❌ Including markdown backticks in JSON output  
❌ Using camelCase instead of snake_case  
❌ Returning undefined instead of null  
❌ Mismatched data types (strings for numbers)  
❌ Invalid JSON syntax  

---

## 15. DOCUMENT CONSISTENCY REQUIREMENTS

### Cross-Section Consistency

**Ensure these elements are consistent across ALL sections:**

1. **Company name spelling** - Use exact legal name from 10-K
2. **Geography terminology** - "Germany" not "German market" or "Deutschland"
3. **Source numbering** - S# remains same throughout
4. **Metric definitions** - EBITDA = same calculation everywhere
5. **Date formats** - Q4 2024, FY2024, Nov 2024 (pick one style)
6. **Currency symbols** - $ for USD, € for EUR (consistent)

### Terminology Standardization

**Use these preferred terms:**

| Use This ✅ | Not This ❌ |
|------------|------------|
| EBITDA margin | EBITDA % or margin |
| Days sales outstanding (DSO) | Average collection period |
| Days inventory outstanding (DIO) | Inventory days or DIH |
| Operating margin | Operating profit margin or EBIT margin |
| Year-over-year (YoY) | Annual growth or yearly |
| Quarter-over-quarter (QoQ) | Sequential growth |
| Compound annual growth rate (CAGR) | Average growth rate |
| Working capital | Net working capital (unless specifically meaning net) |
| Capacity utilization | Plant utilization or asset utilization |
| Original equipment manufacturer (OEM) | OE or original equipment |

### Abbreviation Standards

**First mention = Full term + (abbreviation)**
- Original Equipment Manufacturer (OEM)
- Days Sales Outstanding (DSO)
- Return on Invested Capital (ROIC)

**Subsequent mentions = Abbreviation only**
- "OEM customers represent..."
- "DSO improved to..."
- "ROIC exceeds..."

**Exception:** Common terms don't need definition (GDP, CEO, CFO, M&A)

---

## 16. VERSION CONTROL & UPDATES

**This style guide is version-controlled:**
- Current Version: 1.0
- Last Updated: December 2, 2024
- Next Review: When significant formatting issues arise

**Change Log:**
- v1.0 (Dec 2, 2024): Initial comprehensive style guide created

**Feedback:**
If you identify formatting inconsistencies or need clarification, flag for style guide update.

---

## FINAL REMINDER

**This style guide is the single source of truth for ALL section prompts.**

Every section prompt must reference this guide and follow these standards to ensure:
- Consistent formatting across the complete document
- Professional, executive-ready quality
- Seamless integration of modular outputs
- Copyright compliance
- Data quality and citation integrity

**When in doubt, refer to this guide.**
