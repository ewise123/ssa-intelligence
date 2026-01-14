import { appendReportTypeAddendum } from './report-type-addendums.js';
export function buildFoundationPrompt(inputs) {
    const { companyName, geography, focusAreas = [], userFiles = [] } = inputs;
    const focusAreasText = focusAreas.length > 0
        ? focusAreas.join(", ")
        : "All standard sections";
    const userFilesText = userFiles.length > 0
        ? userFiles.map(f => `${f.name} (${f.type})`).join(", ")
        : "None provided";
    const basePrompt = `# Phase 0: Foundation Research - Company Intelligence System

## CRITICAL EXECUTION REQUIREMENTS

**YOU MUST:**
- Complete ALL research sections before returning results
- Never stop midway or ask for approval to continue
- Gather data from ALL 10 source categories
- Output structured JSON matching the exact schema below
- Use "–" for unavailable data (no speculation)
- Continue research even if it takes time

---

## MISSION

Conduct comprehensive Phase 0 research for **${companyName}** in **${geography}** to establish the foundational data layer for a consulting-grade Company Intelligence Sheet.

**Your role:** Senior Research Analyst  
**Output:** Structured JSON data package with validated, source-backed intelligence  
**Geography focus:** 75-80% of research must emphasize ${geography}

---

## RESEARCH STRATEGY

### Detailed Search Strategy (What to Search, Where to Look)

Follow this priority order for data gathering:

#### 1. Company Filings (Priority: CRITICAL)
**Search for:**
- "**${companyName}** 10-K" OR "**${companyName}** 20-F" OR "**${companyName}** annual report"
- "**${companyName}** 10-Q" OR "**${companyName}** 6-K" (last 4 quarters)
- "**${companyName}** investor presentation" + current year
- "**${companyName}** proxy statement DEF 14A"

**Extract:**
- Total revenue (global and ${geography} if disclosed)
- EBITDA, operating income, net income
- Segment revenue breakdown and operating margins
- Geographic revenue split
- Cash flow from operations
- Inventory (absolute value and days)
- Accounts receivable/payable (DSO/DPO if calculable)
- Total employees (global and ${geography})
- Leadership team and reporting structure
- Strategic priorities and investments
- FX rates used in reporting

**Where to look in filings:**
- 10-K/20-F: Part I (Business), Part II (Financial Data), Note on Segments, Note on Geographic Information
- 10-Q/6-K: Consolidated statements, MD&A section, Segment results
- Investor presentations: "Business Highlights", "Geographic Performance", "Strategic Priorities"

---

#### 2. Earnings Transcripts (Priority: CRITICAL)
**Search for:**
- "**${companyName}** earnings transcript Q4 2024"
- "**${companyName}** earnings call Q3 2024"
- "**${companyName}** quarterly results" + last 4 quarters

**Extract:**
- Management commentary on ${geography} performance
- Growth outlook and guidance
- Analyst questions about regional operations
- Margin trends and drivers
- Strategic initiatives mentioned
- Headwinds/tailwinds discussed
- Competitive dynamics noted
- Capital allocation priorities

**Key phrases to search within transcripts:**
- "${geography}", "region", "geographic", "international"
- "margin", "pricing", "volume", "mix"
- "investment", "capacity", "expansion"
- "cost", "efficiency", "productivity"
- Segment names (if company has multiple segments)

---

#### 3. Analyst/Equity Research (Priority: HIGH)
**Search for:**
- "**${companyName}** ${geography} analyst report"
- "**${companyName}** equity research" + last 12 months
- "**${companyName}** investment thesis"
- "**${companyName}** sector research"

**Extract:**
- Revenue/earnings estimates for ${geography}
- Analyst sentiment on regional operations
- Peer comparisons and benchmarking
- Growth drivers/concerns
- Valuation metrics (EV/EBITDA, P/E if relevant)
- Industry average comparisons
- ONE quote per source (max 15 words)

**Remember:** Only ONE quote per analyst report source, max 15 words per quote

---

#### 4. Tier-1 Media & News (Priority: HIGH)
**Search for:**
- "**${companyName}** ${geography} news" + current year
- "**${companyName}** investment ${geography}"
- "**${companyName}** expansion ${geography}"
- "**${companyName}** facility ${geography}"
- Site: wsj.com OR ft.com OR bloomberg.com OR reuters.com "**${companyName}** ${geography}"

**Extract:**
- Recent investments or divestitures in ${geography}
- Facility expansions/closures
- M&A activity
- Product launches
- Strategic partnerships
- Regulatory developments
- Management changes
- Competitive moves

**Prioritize:** Last 12 months, ${geography}-specific news

---

#### 5. Industry/Analyst Reports (Priority: MEDIUM)
**Search for:**
- "Sector report" + current year
- "**${companyName}** industry Gartner OR Forrester OR IDC"
- "Sector trends ${geography}"
- "Business activity PMI ${geography}" + current year

**Extract:**
- Industry growth rates and forecasts
- Macro trends (digitalization, sustainability, nearshoring)
- Sector-specific challenges
- Technology adoption rates
- Competitive landscape insights
- Market sizing and share data

---

#### 6. Government/Regulatory Data (Priority: MEDIUM)
**Search for:**
- "${geography} production statistics"
- "${geography} business activity PMI data"
- "${geography} trade data for key products/services"
- "${geography} employment statistics by sector"

**Extract:**
- Regional economic indicators
- Manufacturing activity indices
- Industrial production growth
- Employment trends
- Trade flows
- Regulatory environment changes

---

#### 7. Segment-Specific Research (Priority: HIGH)
For EACH business segment the company operates:

**Search for:**
- "**${companyName}** [segment name] revenue"
- "**${companyName}** [segment name] ${geography}"
- "[Segment name] market trends ${geography}"
- "[Segment name] competitive landscape"

**Extract:**
- Segment revenue and margin data
- Segment-specific competitors (not just company peers)
- Segment growth drivers
- Technology trends affecting segment
- Customer industries served
- Geographic footprint of segment

---

#### 8. Competitor Intelligence (Priority: MEDIUM)
**Search for:**
- "**${companyName}** competitors ${geography}"
- "[Competitor name] ${geography} revenue" (for 3-5 peers)
- "[Competitor name] market share ${geography}"
- "competitive landscape [segment]"

**Extract:**
- Key competitors by segment
- Peer financial metrics (revenue, margins, growth)
- Competitive positioning
- Recent competitive moves
- Market share data if available

---

#### 9. Supply Chain & Operations (Priority: MEDIUM)
**Search for:**
- "**${companyName}** supply chain ${geography}"
- "**${companyName}** operational footprint"
- "**${companyName}** facilities ${geography}"
- "**${companyName}** distribution network"

**Extract:**
- Manufacturing facilities locations
- Distribution centers
- R&D centers
- Supplier relationships
- Make/buy strategy
- Inventory management approach
- Logistics networks

---

#### 10. Trends & Market Dynamics (Priority: HIGH)
**Search for:**
- "sector trends 2024"
- "${geography} sector outlook 2024"
- "nearshoring trends ${geography}"
- "digitalization trends"
- "ESG sector companies"
- "supply chain resilience"

**Extract:**
- Macro trends (economic, industry-wide)
- Micro trends (company/segment-specific)
- Technology trends (automation, IoT, AI)
- Regulatory trends (ESG, trade policy)
- Direction: Positive/Negative/Neutral
- Impact Score: 1-10 (with justification)

---

## DATA QUALITY REQUIREMENTS

### Currency Conversion Hierarchy
**Always convert to USD using this priority:**
1. **Source A:** Company-disclosed FX rate (from filing/report) → Most reliable
2. **Source B:** Historical average (Bloomberg/Reuters for the period)
3. **Source C:** Current spot rate (Bloomberg/Reuters)

**Note in output:** \`"fx_rate_source": "A"\` or \`"B"\` or \`"C"\`

### Industry Averages Hierarchy
**Use this priority:**
1. **Source A:** True industry average (S&P Capital IQ, Damodaran, industry associations)
2. **Source B:** Peer set average (calculate from 3-5 comparable firms)

**Note in output:** \`"industry_avg_source": "A"\` or \`"B"\`

### Data Validation Rules
- **If data cannot be verified** → Output: \`"–"\`
- **If data is derived/calculated** → Flag with asterisk: \`"12.5*"\`
- **If data conflicts across sources** → Use most recent, most authoritative source
- **If geography-specific data unavailable** → Extrapolate carefully from global data and note methodology

---

## ANALYST QUOTE REQUIREMENTS (COPYRIGHT COMPLIANCE)

**MANDATORY RULES:**
- **Maximum 15 words per quote** (HARD LIMIT for copyright)
- **ONE quote per analyst report source** (HARD LIMIT)
- Paraphrase all other analyst content
- Format: \`"[quote text]" - Analyst Name, Firm Name (S#)\`
- Use quotes strategically where analyst perspective adds credibility

**Example:**
\`\`\`json
{
  "quote": "Regional margin expansion demonstrates operational excellence",
  "analyst": "John Smith",
  "firm": "Goldman Sachs",
  "source_id": "S12"
}
\`\`\`

---

## USER-PROVIDED FILES HANDLING

**If user uploads files** (Excel, PDF, PowerPoint):
1. **Read and extract all relevant data**
2. **Label clearly in sources:** \`"User-provided (Filename.xlsx, Description, Date)"\`
3. **Integrate into analysis** but prioritize public data for verification
4. **Note discrepancies** if user data conflicts with public sources

---

## OUTPUT SCHEMA (JSON)

YOU MUST OUTPUT VALID JSON MATCHING THIS EXACT STRUCTURE. DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON. CRITICAL: YOUR ENTIRE RESPONSE MUST BE A SINGLE VALID JSON OBJECT WITH NO TEXT BEFORE OR AFTER.

\`\`\`typescript
interface FoundationOutput {
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
    id: string; // "S1", "S2", "S3", etc.
    citation: string;
    url?: string;
    type: 'filing' | 'transcript' | 'analyst_report' | 'news' | 'user_provided' | 'government' | 'investor_presentation' | 'industry_report';
    date: string;
  }>;
  
  segment_structure: Array<{
    name: string;
    revenue_pct: number;
    description: string;
  }>;
  
  data_availability: {
    has_10k: boolean;
    has_earnings_transcripts: boolean;
    has_analyst_reports: boolean;
    geography_specific_data: 'high' | 'medium' | 'low';
    overall_confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    confidence_reason: string;
  };
  
  fx_rates: Record<string, {
    rate: number;
    source: 'A' | 'B' | 'C';
  }>;
  
  industry_averages: {
    source: 'A' | 'B' | 'C';
    dataset: string;
  };
}
\`\`\`

---

## OUTPUT VALIDATION REQUIREMENTS

Before returning JSON, verify:
- [ ] All fields populated or marked "–"
- [ ] All currencies converted to USD
- [ ] FX source noted (A/B/C)
- [ ] Industry average source noted (A/B/C)
- [ ] Sources numbered S1, S2, S3... sequentially
- [ ] 75-80% of research emphasized ${geography}
- [ ] No speculation or unsupported claims
- [ ] JSON is valid and parseable
- [ ] Confidence object present (level + reason) in output
- [ ] Source types restricted to: filing, transcript, analyst_report, news, user_provided, government, investor_presentation, industry_report

---

## ERROR HANDLING

**If you encounter:**
- **Low confidence data** → Use "–" but complete the section
- **Missing data** → Use "–" but maintain structure
- **Slow research** → Continue anyway, do not stop
- **Conflicting sources** → Use most authoritative, note discrepancy

**NEVER:**
- Make up numbers or data
- Speculate about unavailable information
- Stop research midway
- Ask user for approval to continue

---

## GEOGRAPHY FOCUS REQUIREMENT (75-80%)

**Every research section MUST emphasize ${geography}:**
- Financial commentary → Regional performance
- Trends → Geographic relevance
- News → Regional developments
- Benchmarking → Regional context
- Operations → Regional footprint

**Example:**
❌ WRONG: "Company revenue grew 12% globally"
✅ CORRECT: "Company revenue grew 15% in ${geography}, outpacing 12% global growth"

---

## CRITICAL REMINDERS

1. **Complete ALL research** before returning output (no stopping midway)
2. **Output structured JSON** matching exact schema
3. **Use "–" for unavailable data** (never speculate)
4. **Convert ALL currencies to USD** with source noted
5. **75-80% geography focus** in all sections
6. **ONE quote per analyst source**, max 15 words
7. **Numbered sources** (S1, S2, S3...) in catalog
8. **Validate JSON** before output

---

## BEGIN RESEARCH

**Company:** ${companyName}  
**Geography:** ${geography}  
**Focus Areas:** ${focusAreasText}  
**User Files:** ${userFilesText}

**START COMPREHENSIVE RESEARCH NOW. DO NOT STOP UNTIL ALL SECTIONS ARE COMPLETE.**
`;
    return appendReportTypeAddendum('foundation', inputs.reportType, basePrompt);
}
//# sourceMappingURL=foundation-prompt.js.map
