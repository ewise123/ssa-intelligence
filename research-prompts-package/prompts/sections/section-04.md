# Section 4: Segment Analysis - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 4 (Segment Analysis) with comprehensive analysis for EACH business segment of **{companyName}** in **{geography}**.

---

## COMPLEXITY NOTICE

**This section is LARGE and may require fallback strategy:**

If the response gets truncated or you cannot complete all segments in one call, the system will use a **per-segment fallback strategy** where each segment is generated individually and combined later.

**In this prompt:** Attempt to generate ALL segments in one comprehensive response.

**Fallback prompt available:** If needed, use `buildSection4SegmentPrompt()` to generate individual segments.

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
  segment_structure: Array<{
    name: string;
    revenue_pct: number;
    description: string;
  }>
}
```

### Optional: Section 2 Context (Financial Snapshot)

```typescript
{
  kpi_table: {
    metrics: Array<{
      metric: string;
      company: number | string;
      industry_avg: number | string;
      source: string;
    }>;
  },
  summary: string;
}
```

**Note:** Section 2 context provides company-level financial baseline for comparison.

---

## RESEARCH REQUIREMENTS

### Primary Data Source: 10-K/10-Q Segment Reporting

**Priority: CRITICAL**

**For public companies:**

**Search for:**
- "{companyName} 10-K 2024" OR "{companyName} 20-F 2024"
- "{companyName} 10-Q Q3 2024" (most recent quarter)
- "{companyName} investor presentation segments"

**Navigate to segment reporting sections:**
- 10-K/20-F: Look for "Segment Information" or "Business Segment Data" note
- 10-Q/6-K: MD&A section + Segment results note
- Typically in: Note 15-20 of financial statements

**Extract for EACH segment:**
- Segment revenue (last 3 years + latest quarter)
- Operating income / EBITDA by segment
- Operating margin by segment
- Geographic revenue breakdown (if disclosed by segment)
- Assets by segment (if disclosed)
- CapEx by segment (if disclosed)
- Key performance metrics specific to segment

### Segment-Specific Research

**For EACH identified segment:**

#### 1. Financial Performance (Priority: CRITICAL)

**Search for:**
- "{companyName} [segment name] revenue"
- "{companyName} [segment name] earnings"
- "{companyName} earnings transcript [segment name]"
- "{companyName} [segment name] {geography}"

**Extract:**
- Revenue trends (3-year CAGR, YoY growth)
- Margin trends and drivers
- Regional performance (emphasize {geography})
- Growth drivers or headwinds
- Management commentary on segment outlook

#### 2. Performance Drivers (Priority: HIGH)

**Search for:**
- "{companyName} [segment name] growth drivers"
- "{companyName} [segment name] market trends"
- "{companyName} earnings call [segment name]"

**Extract from earnings transcripts:**
- Volume vs. price contribution to growth
- New product launches or wins
- Customer wins or losses
- Capacity expansions or constraints
- Operational efficiency initiatives
- Strategic initiatives specific to segment
- Management tone and emphasis

**Look for {geography}-specific drivers:**
- Regional demand patterns
- Local customer wins
- Facility expansions in {geography}
- Regional operational improvements

#### 3. Competitive Landscape (Priority: HIGH)

**Search for:**
- "[Segment name] market leaders"
- "[Segment name] competitive landscape {geography}"
- "{companyName} [segment name] market share"
- "{companyName} vs [competitor] [segment name]"

**Identify segment-specific competitors:**
- NOT just company-wide peers
- Competitors in THIS specific segment
- May include:
  - Pure-play specialists
  - Divisions of larger conglomerates
  - Regional/local competitors in {geography}

**Extract:**
- Market share data (if available)
- Competitive positioning (#1, #2, challenger, niche)
- Key competitive advantages/disadvantages
- Recent competitive moves
- Pricing dynamics
- {geography}-specific competitive context

#### 4. Analyst Commentary (Priority: MEDIUM)

**Search for:**
- "{companyName} analyst report [segment name]"
- "{companyName} [segment name] outlook"

**Extract:**
- Analyst views on segment prospects
- Estimates for segment growth
- Concerns or risks highlighted
- **ONE quote per analyst source** (max 15 words)

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

```typescript
interface Section4Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  overview: string; // 4.1 content - 3-4 sentences on overall segment portfolio
  
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
      geography_notes: string; // 2-3 sentences on {geography}-specific financials
    };
    
    performance_analysis: {
      paragraphs: string[];      // 3-5 paragraphs of analysis
      analyst_quotes: Array<{
        quote: string;           // <15 words
        analyst: string;
        firm: string;
        source: string;
      }>;
      key_drivers: string[];     // Bullet points
    };
    
    competitive_landscape: {
      competitors: Array<{
        name: string;
        market_share?: string;   // "~20%" or "Market leader"
        geography: string;       // {geography} presence description
      }>;
      positioning: string;       // 2-3 sentences
      recent_dynamics: string;   // 2-3 sentences
    };
  }>;
  
  sources_used: string[];
}
```

---

## SECTION 4.1: SEGMENT OVERVIEW (Always Generated)

**Write 3-4 sentences synthesizing the segment portfolio:**

1. **Segment count and structure** (1 sentence)
   - "The company operates through 3 primary segments: Diversified Industrial (65% of revenue), Aerospace Systems (30%), and Other (5%) (S1)."

2. **{Geography} segment mix** (1-2 sentences)
   - "**{Geography} operations** are concentrated in Diversified Industrial (75% of regional revenue) and Aerospace (25%), with minimal Other segment presence (S1, S3)."

3. **Strategic importance and trends** (1 sentence)
   - "Management is prioritizing aerospace growth given favorable market dynamics while defending industrial market share amid competitive pressure (S2)."

---

## SECTION 4.X: PER-SEGMENT ANALYSIS

### 4.X.1 Financial Snapshot

**Required table format (style guide Section 8):**

```
| Metric | Segment | Company Avg | Industry Avg | Source |
```

**Required metrics (use "–" if unavailable):**
1. Revenue (Latest Period)
2. Revenue % of Total
3. Revenue Growth (YoY)
4. 3-Year Revenue CAGR
5. Operating Margin
6. Operating Income
7. EBITDA Margin (if disclosed)
8. {Geography} Revenue (if disclosed)
9. {Geography} % of Segment (if disclosed)
10. CapEx (if disclosed)
11. Assets (if disclosed)

**Geography notes (2-3 sentences):**
- Explain {geography}-specific performance
- Compare regional vs global segment performance
- Note any regional operational differences

**Example:**
"**{Geography}** operations represent approximately €450M of the segment's $2.8B global revenue (16%), growing 12% YoY vs 8% globally (S1, S3). Regional operating margin of 20.5% exceeds segment average of 19.2% due to higher-value aerospace product mix and superior capacity utilization at Stuttgart facilities (S3). Management noted **{geography}** as fastest-growing region for this segment in Q3 earnings call (S2)."

### 4.X.2 Performance Analysis

**Write 3-5 analytical paragraphs covering:**

**Paragraph 1: Growth trajectory and drivers**
- Revenue growth rates and trends
- Volume vs. price contribution
- Key growth drivers (demand, new products, market share)
- **Emphasize {geography} performance** (75-80%)

**Paragraph 2: Margin dynamics**
- Margin trends and drivers
- Input cost impacts
- Operational efficiency initiatives
- Pricing power
- **{Geography} margin performance vs segment average**

**Paragraph 3: Strategic initiatives**
- Product launches or innovation
- Capacity expansions
- Market penetration efforts
- Technology investments
- **{Geography}-specific initiatives**

**Paragraph 4: Management commentary**
- Outlook from recent calls
- Strategic priorities for segment
- Risk factors or concerns
- **Regional emphasis in management discussion**

**Paragraph 5: Analyst perspectives** (if available)
- Analyst views on segment prospects
- Consensus outlook
- Key debates or concerns
- Include analyst quote if relevant (one per segment max, <15 words)

**Key drivers (bullet array):**
- 3-5 specific drivers of segment performance
- Quantified where possible
- Geography-relevant

**Example:**
```json
{
  "key_drivers": [
    "Commercial aerospace production ramp-up driving 18% order growth YoY, with Airbus programs representing 60% of backlog (S2)",
    "**German aerospace facilities** operating at 92% capacity vs 78% segment average, constraining ability to capture incremental demand (S3)",
    "New sustainable aviation product line launched Q2 2024; Munich R&D center leading development with 150 engineers (S8)",
    "Margin expansion of 120bps YoY from pricing actions and operational leverage at **Stuttgart plant** (S2, S3)"
  ]
}
```

**Analyst quotes (0-1 per segment):**
- Maximum ONE quote per segment
- Maximum 15 words per quote
- Only include if adds meaningful insight

### 4.X.3 Competitive Landscape

**Competitors array (3-5 segment-specific competitors):**

For EACH competitor:
- **Name:** Full company name
- **Market share:** If available ("~20%", "Market leader", "#2 position")
- **Geography presence:** Describe {geography} operations

**Example:**
```json
{
  "name": "Bosch Rexroth",
  "market_share": "~25% (market leader)",
  "geography": "Headquartered in **Germany** with 15 manufacturing facilities; dominant local presence provides competitive advantage in customer relationships and service"
}
```

**Positioning (2-3 sentences):**
- How {companyName} positions in this segment
- Competitive advantages/disadvantages
- Market share trends
- **{Geography}-specific positioning**

**Recent dynamics (2-3 sentences):**
- Competitive moves (M&A, capacity, pricing)
- Market share shifts
- New entrants or exits
- **{Geography} competitive developments**

---

## GEOGRAPHY FOCUS (75-80% WITHIN EACH SEGMENT)

**Every segment analysis must emphasize {geography}:**

✅ **CORRECT patterns:**

**Financial Snapshot:**
- "**{Geography}** aerospace segment revenue of €450M represents 16% of global segment, growing 12% YoY vs 8% globally..."
- "Regional operating margin of 20.5% exceeds segment average of 19.2%..."

**Performance Analysis:**
- "**German facilities** achieved 92% OEE in aerospace segment vs 85% company average..."
- "Stuttgart aerospace plant expanded capacity by 20% in Q2 2024, adding €80M revenue potential..."

**Competitive Landscape:**
- "In **{geography}** specifically, {companyName} ranks #2 behind Bosch Rexroth in hydraulics..."
- "Local competitors Hawe Hydraulik and Bucher Hydraulics hold combined 15% share in **German** mobile hydraulics..."

❌ **WRONG patterns:**
- Pure global segment discussion without regional context
- Competitive landscape that doesn't address {geography}
- Performance analysis without regional metrics

---

## PRIVATE COMPANY HANDLING

**For private companies:**
- Segment data is rarely disclosed publicly
- Use press releases, industry reports, company website
- Focus heavily on qualitative analysis
- Use "–" extensively in financial table
- Note limitations explicitly: "Segment financials not publicly disclosed"
- Still maintain structure (all subsections present)

---

## ANALYST QUOTE REQUIREMENTS (COPYRIGHT)

**MANDATORY RULES:**
- Maximum 15 words per quote (HARD LIMIT)
- ONE quote per segment maximum
- ONE quote per analyst report source (across all segments)
- Paraphrase all other analyst content

**Format:**
```json
{
  "analyst_quotes": [{
    "quote": "German aerospace operations demonstrate superior margin trajectory",
    "analyst": "Sarah Chen",
    "firm": "Morgan Stanley",
    "source": "S12"
  }]
}
```

---

## CONFIDENCE SCORING

**HIGH:**
- Recent 10-K/10-Q with detailed segment reporting
- Geography-specific segment data available
- Multiple sources confirming segment performance
- Analyst coverage of individual segments

**MEDIUM:**
- Segment data available but limited geographic detail
- Some inference required for {geography} performance
- Limited segment-specific analyst commentary
- Older data (6-12 months)

**LOW:**
- Private company or minimal segment disclosure
- No geography-specific segment data
- Heavy reliance on estimation
- Significant data gaps

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] Overview is 3-4 sentences (Section 4.1)
- [ ] One segment object per company segment
- [ ] Each segment has financial_snapshot with table
- [ ] Each segment has performance_analysis with 3-5 paragraphs
- [ ] Each segment has competitive_landscape with 3-5 competitors
- [ ] All financial tables use exact metric names
- [ ] All tables cite sources (S# format)
- [ ] Geography notes provided for each segment
- [ ] Key drivers identified (3-5 per segment)
- [ ] Segment-specific competitors (not just company peers)
- [ ] 75-80% geography focus within each segment
- [ ] Analyst quotes ≤15 words, max one per segment
- [ ] Sources_used array complete

---

## FALLBACK STRATEGY INDICATOR

**If you cannot complete all segments in this response:**

1. **Acknowledge limitation** in your response
2. **Complete as many segments as possible** before truncation
3. **System will invoke per-segment prompts** for remaining segments
4. **Segments will be combined** in post-processing

**Note:** It's better to complete fewer segments fully than many segments partially.

---

## CRITICAL REMINDERS

1. **Follow style guide** for all formatting
2. **10-K/10-Q segment data** is primary source for public companies
3. **75-80% geography focus** within EACH segment analysis
4. **Segment-specific competitors** not company-wide peers
5. **ONE analyst quote per segment** maximum, <15 words
6. **Geography notes** required in every financial snapshot
7. **Valid JSON only** - no markdown backticks
8. **Exact schema match** - follow TypeScript interface
9. **Complete segments fully** - don't truncate mid-segment

---

## BEGIN RESEARCH

**Company:** {companyName}  
**Geography:** {geography}  
**Number of Segments:** {segmentCount}  
**Segments:** {segmentNames}  
**Foundation Context:** [Provided above]  
**Section 2 Context:** [Provided if available]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. ATTEMPT TO COMPLETE ALL SEGMENTS. START RESEARCH NOW.**
