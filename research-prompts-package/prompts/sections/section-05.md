# Section 5: Trends - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 5 (Trends) with comprehensive Macro, Micro, and Company-Specific trend analysis for **{companyName}** in **{geography}**.

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
  geography_specifics: {
    regional_revenue_usd: number;
    regional_revenue_pct: number;
    regional_employees: number;
    facilities: Array<{name: string; location: string; type: string}>;
    key_facts: string[];
  },
  source_catalog: Array<{id: string; citation: string; url?: string; type: string; date: string}>,
  segment_structure: Array<{name: string; revenue_pct: number; description: string}>
}
```

### Optional: Section 3 Context (Company Overview)

```typescript
{
  business_description: {
    overview: string;
    segments: Array<{name: string; description: string; revenue_pct: number | null; geography_relevance: string}>;
    geography_positioning: string;
  },
  strategic_priorities: {
    summary: string;
    priorities: Array<{priority: string; description: string; geography_relevance: string; source: string}>;
  }
}
```

### Optional: Section 4 Context (Segment Analysis)

```typescript
{
  segments: Array<{
    name: string;
    performance_drivers: string[];
    competitive_landscape: string;
    risks: string[];
  }>
}
```

**Note:** Section 3 & 4 context provide additional insights but are NOT required. If unavailable, conduct independent research.

---

## RESEARCH REQUIREMENTS

### 1. Macro Trends (Industry & Economy-Wide)

**Priority: CRITICAL**

**Search for:**
- "industrial sector trends 2024"
- "{geography} manufacturing outlook 2024"
- "{geography} economic indicators 2024"
- "global supply chain trends 2024"
- "industrial automation trends"
- "sustainability manufacturing 2024"

**Extract trends in these categories:**

**Economic Trends:**
- GDP growth, industrial production indices
- Inflation, labor costs, commodity prices
- Interest rates, credit conditions
- Trade flows, tariffs, regulations

**Industry Trends:**
- Market growth rates by segment
- Technology adoption (automation, AI, IoT)
- Sustainability/ESG requirements
- Supply chain dynamics (nearshoring, diversification)
- Consolidation/M&A activity

**Regulatory Trends:**
- Environmental regulations
- Safety/quality standards
- Trade policies
- Labor regulations

**Geography-specific emphasis (75-80%):**
- {geography} manufacturing PMI
- {geography} industrial policy changes
- {geography} infrastructure investments
- Regional economic forecasts

**For EACH macro trend:**
- **Direction:** Positive/Negative/Neutral
- **Impact Score:** 1-10 (see scoring guidance below)
- **Supporting evidence:** Quantitative data with sources
- **Geography relevance:** How it specifically affects {geography} operations

### 2. Micro/Industry Trends (Sector-Specific)

**Priority: HIGH**

**Search for:**
- "{company segment} market trends 2024" (for each segment)
- "{geography} {segment} industry outlook"
- "{company segment} technology trends"
- "competitive dynamics {segment} {geography}"

**Extract trends in these categories:**

**Customer/End Market Trends:**
- Demand patterns in key industries
- Customer spending/investment levels
- Order backlog trends
- Geographic shifts in demand

**Technology Trends:**
- Product innovation cycles
- Digital transformation in sector
- Disruptive technologies
- R&D investment priorities

**Competitive Trends:**
- Market share shifts
- Capacity additions/reductions
- Pricing dynamics
- New entrant threats

**For EACH micro trend:**
- Link to specific segment or product line
- Quantify impact where possible
- Compare {geography} vs global dynamics
- Cite analyst commentary (one quote <15 words per source)

### 3. Company-Specific Trends & Issues

**Priority: CRITICAL**

**Search for:**
- "{companyName} earnings transcript 2024" (last 4 quarters)
- "{companyName} {geography} performance trends"
- "{companyName} analyst commentary"
- "{companyName} challenges" OR "{companyName} headwinds"
- "{companyName} opportunities" OR "{companyName} growth drivers"

**Extract company-specific trends:**

**Performance Trends:**
- Revenue growth trajectory (accelerating/decelerating)
- Margin trends (expansion/compression) and drivers
- Market share changes
- Win/loss rates, customer retention

**Operational Trends:**
- Capacity utilization changes
- Efficiency improvements (OEE, productivity)
- Quality metrics trends
- Supply chain performance

**Strategic Trends:**
- Portfolio shifts (acquisitions, divestitures)
- Geographic expansion/contraction
- Go-to-market changes
- Investment priorities

**Risk Factors:**
- Customer concentration
- Supplier dependencies
- Competitive pressures
- Regulatory exposures

**For EACH company trend:**
- Emphasize {geography} operations (75-80%)
- Compare regional vs global performance
- Include management commentary (sourced)
- Include analyst perspectives (one quote <15 words per source)

---

## IMPACT SCORING METHODOLOGY

**Assign Impact Score (1-10) based on:**

**Magnitude:**
- Financial impact (revenue, margin, cash flow)
- Operational impact (capacity, efficiency, capability)
- Strategic impact (market position, competitive advantage)

**Scoring guidance:**

**1-3: Minor impact**
- Operational adjustment required
- <$10M or <50bps margin impact
- Limited management attention

**4-6: Moderate impact**
- Strategic attention needed
- $10-50M or 50-200bps impact
- Multiple quarters to address

**7-8: Major impact**
- Significant business implications
- >$50M or >200bps impact
- Requires substantial resources

**9-10: Critical/transformational**
- Existential threat or transformational opportunity
- >$100M or >500bps impact
- Board/C-suite focus

**Base scores on:**
- Language in sources ("slight" vs "dramatic")
- Management tone in earnings calls
- Financial impact mentioned/implied
- Risk factor prominence in filings
- Analyst sentiment and conviction

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

```typescript
interface Section5Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  aggregate_summary: string; // 3-4 sentences synthesizing overall trend environment
  
  macro_trends: {
    summary: string; // 2-3 sentences
    trends: Array<{
      trend: string;           // Concise title (5-10 words)
      description: string;     // 2-3 sentences with quantitative data
      direction: 'Positive' | 'Negative' | 'Neutral';
      impact_score: number;    // 1-10
      geography_relevance: string; // 1-2 sentences on {geography} impact
      source: string;          // "S#, S#"
    }>;
  };
  
  micro_trends: {
    summary: string; // 2-3 sentences
    trends: Array<{
      trend: string;
      description: string;
      direction: 'Positive' | 'Negative' | 'Neutral';
      impact_score: number;
      segment_relevance?: string; // Which segment(s) affected
      geography_relevance: string;
      source: string;
    }>;
  };
  
  company_trends: {
    summary: string; // 2-3 sentences
    trends: Array<{
      trend: string;
      description: string;
      direction: 'Positive' | 'Negative' | 'Neutral';
      impact_score: number;
      geography_relevance: string;
      management_commentary?: string; // Brief quote or paraphrase
      analyst_quote?: {
        quote: string;         // <15 words
        analyst: string;
        firm: string;
        source: string;
      };
      source: string;
    }>;
  };
  
  sources_used: string[];
}
```

---

## SUBSECTION REQUIREMENTS

### 5.1 Aggregate Trend Summary

**Write 3-4 sentences synthesizing the overall trend environment:**

1. **Macro environment assessment** (1 sentence)
   - "Industrial sector faces mixed macro environment with strong demand recovery in {geography} offset by persistent input cost inflation and tightening monetary policy (S15, S18)."

2. **Industry dynamics** (1 sentence)
   - "Aerospace segment shows robust growth with commercial production ramping up, while industrial hydraulics faces margin pressure from competitive intensity in mature markets (S7, S12)."

3. **Company positioning** (1-2 sentences)
   - "**{companyName}** is well-positioned to capitalize on aerospace recovery given **{geography}** manufacturing footprint and Airbus relationships, but faces near-term headwinds from EUR/USD pressure and wage inflation in the region (S1, S3, S5)."

### 5.2 Macro Trends

**Summary:** 2-3 sentences on overall macro environment

**Trends:** 4-6 key macro trends

**For each trend:**
- Concise title: "Commercial aerospace recovery accelerating"
- Description with data: "Boeing and Airbus combined deliveries up 25% in 2024 vs 2023, with backlog at 14,000+ aircraft signaling multi-year growth runway (S22). Narrow-body production rates targeted to reach pre-pandemic levels by mid-2025."
- Direction and score: Positive, 8/10
- Geography relevance: "**{geography}** Airbus production sites ramping faster than North American Boeing sites; drives strong demand for Parker's **German** aerospace facilities (S22, S24)."

**Example trends to consider:**
- Aerospace production recovery
- Industrial automation adoption
- ESG/sustainability requirements
- Supply chain regionalization
- Inflation/cost pressures
- Labor market tightness
- Digitalization/Industry 4.0

### 5.3 Micro/Industry Trends

**Summary:** 2-3 sentences on sector-specific dynamics

**Trends:** 3-5 key micro trends

**Link to specific segments where possible:**
- "Hydraulics segment": Market consolidation trend
- "Aerospace segment": Sustainable aviation push

**Example trends to consider:**
- Segment-specific demand patterns
- Technology adoption in sector
- Competitive dynamics/market share
- Pricing power trends
- Customer concentration/diversification
- Channel dynamics
- Product lifecycle trends

### 5.4 Company-Specific Trends & Issues

**Summary:** 2-3 sentences on company-specific trajectory

**Trends:** 3-5 key company trends

**Include:**
- Performance trajectories (revenue, margin, market share)
- Operational trends (efficiency, quality, capacity)
- Strategic initiatives (M&A, investments, portfolio)
- Risk factors or headwinds

**Emphasize {geography} throughout:**
- "**German operations** margin expanded 120bps YoY to 19.5%..."
- "**{geography}** facilities operating at 88% capacity vs 78% globally..."
- "Regional order backlog up 18% YoY, highest in 5 years..."

---

## ANALYST QUOTE REQUIREMENTS

**COPYRIGHT COMPLIANCE (MANDATORY):**
- Maximum 15 words per quote (HARD LIMIT)
- ONE quote per analyst report source (HARD LIMIT)
- Paraphrase all other analyst content

**Format:**
```json
{
  "analyst_quote": {
    "quote": "German operations margin trajectory ahead of expectations",
    "analyst": "John Smith",
    "firm": "Goldman Sachs",
    "source": "S12"
  }
}
```

**Use quotes strategically:**
- Support key trends or outlooks
- Validate management claims
- Highlight competitive positioning
- Emphasize strategic concerns

---

## GEOGRAPHY FOCUS (75-80%)

**Every trend must include geography relevance:**

✅ **CORRECT patterns:**

**Macro trend:**
- Trend: "European manufacturing PMI stabilizing"
- Geography relevance: "**{geography}** industrial production index improved to 48.5 in Q3 2024 from 42.1 in Q1, signaling demand stabilization for industrial hydraulics customers (S15)."

**Micro trend:**
- Trend: "Commercial aerospace aftermarket strengthening"
- Geography relevance: "Lufthansa and other **German** carriers increasing MRO spending by 15% in 2024; benefits Parker's **Stuttgart** aftermarket operations which serve European airline base (S18, S20)."

**Company trend:**
- Trend: "Market share gains in German hydraulics"
- Geography relevance: "**{companyName}** increased market share to 19% from 17% in **German** mobile hydraulics over last 18 months, primarily at expense of local specialists (S7, S12)."

❌ **WRONG patterns:**
- No geography mention in relevance field
- Generic statements without regional specificity
- Global trends without explaining {geography} impact

---

## SOURCE CITATION REQUIREMENTS

**Follow style guide Section 5:**

1. Reuse foundation source numbers where applicable
2. Add new sources continuing sequential numbering
3. Source every trend - no unsourced claims
4. Use "S#, S#" format in source field
5. Include analyst quotes as separate field (not in description)

---

## CONFIDENCE SCORING

**HIGH:**
- Recent earnings transcripts with geographic detail
- Current macro data for {geography}
- Analyst reports covering company and region
- Clear trend patterns with quantitative support

**MEDIUM:**
- Some management commentary but limited regional detail
- Mix of current and slightly dated data sources
- Trends identified but limited quantification
- Some inference required for {geography} impact

**LOW:**
- Limited management discussion of trends
- Dated or generic macro data
- Minimal analyst coverage
- Primarily qualitative trend assessment

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] Aggregate summary is 3-4 sentences
- [ ] Each subsection has summary (2-3 sentences)
- [ ] Macro trends: 4-6 trends with all required fields
- [ ] Micro trends: 3-5 trends with all required fields
- [ ] Company trends: 3-5 trends with all required fields
- [ ] All trends have direction (Positive/Negative/Neutral)
- [ ] All trends have impact score (1-10)
- [ ] All trends have geography relevance explained
- [ ] All trends cite sources (S# format)
- [ ] Analyst quotes ≤15 words, one per source
- [ ] 75-80% of content emphasizes {geography}
- [ ] Sources_used array complete

---

## CRITICAL REMINDERS

1. **Follow style guide** for all formatting
2. **75-80% geography focus** - every trend must show regional impact
3. **Impact scoring** - use 1-10 scale with clear methodology
4. **Source everything** - no unsourced trends
5. **Analyst quotes** - max 15 words, one per source
6. **Direction required** - Positive/Negative/Neutral for each trend
7. **Valid JSON only** - no markdown backticks
8. **Exact schema match** - follow TypeScript interface

---

## BEGIN RESEARCH

**Company:** {companyName}  
**Geography:** {geography}  
**Foundation Context:** [Provided above]  
**Section 3 Context:** [Provided if available]  
**Section 4 Context:** [Provided if available]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
