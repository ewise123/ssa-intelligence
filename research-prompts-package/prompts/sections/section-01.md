# Section 1: Executive Summary - Synthesis Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 1 (Executive Summary) by synthesizing key findings from ALL completed sections for **{companyName}** in **{geography}**.

---

## SYNTHESIS SECTION NOTICE

**This section SYNTHESIZES findings from other sections:**

- **Minimum required:** Foundation + Sections 2 & 3
- **Recommended:** All completed sections (2-8)
- **Output:** 5-7 bullet points summarizing key findings
- **Must lead with:** Geography-specific headline finding

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
  source_catalog: Array<{id: string; citation: string; url?: string; type: string; date: string}>
}
```

### REQUIRED: Section 2 Context (Financial Snapshot)

```typescript
{
  confidence: {level: string; reason: string};
  summary: string;
  kpi_table: {
    metrics: Array<{metric: string; company: any; industry_avg: any; source: string}>;
  };
}
```

### REQUIRED: Section 3 Context (Company Overview)

```typescript
{
  business_description: {
    overview: string;
    segments: Array<{name: string; description: string; revenue_pct: number | null}>;
    geography_positioning: string;
  };
  strategic_priorities: {
    summary: string;
    priorities: Array<{priority: string; description: string; geography_relevance: string}>;
  };
}
```

### Optional: Section 4 Context (Segment Analysis)

```typescript
{
  overview: string;
  segments: Array<{
    name: string;
    performance_analysis: {paragraphs: string[]; key_drivers: string[]};
  }>;
}
```

### Optional: Section 5 Context (Trends)

```typescript
{
  aggregate_summary: string;
  company_trends: {
    summary: string;
    trends: Array<{trend: string; direction: string; impact_score: number; geography_relevance: string}>;
  };
}
```

### Optional: Section 6 Context (Peer Benchmarking)

```typescript
{
  benchmark_summary: {
    overall_assessment: string;
    key_strengths: Array<{strength: string; geography_context: string}>;
    key_gaps: Array<{gap: string; magnitude: string; geography_context: string}>;
    competitive_positioning: string;
  };
}
```

### Optional: Section 7 Context (SKU Opportunities)

```typescript
{
  opportunities: Array<{
    issue_area: string;
    priority: string;
    severity: number;
    geography_relevance: string;
  }>;
}
```

### Optional: Section 8 Context (Recent News)

```typescript
{
  news_items: Array<{
    date: string;
    headline: string;
    category: string;
    geography_relevance: string;
  }>;
}
```

---

## SYNTHESIS STRATEGY

### Your Task: Distill the Most Important Findings

**Review ALL provided section contexts and identify:**

1. **Geography headline:** The single most important finding about {geography} operations
2. **Financial signals:** Key performance metrics and trends
3. **Strategic posture:** Major initiatives or shifts
4. **Competitive position:** Standing vs. peers in {geography}
5. **Key risks:** 2-3 most material headwinds
6. **Momentum assessment:** Is trajectory positive, stable, or negative?

**Prioritize:**
- Geography-specific findings (75-80%)
- Material business impacts
- Recent developments (last 12 months)
- Quantified insights over qualitative

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

```typescript
interface Section1Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  bullet_points: Array<{
    bullet: string;              // Complete bullet text (1-3 sentences)
    category: 'Geography' | 'Financial' | 'Strategic' | 'Competitive' | 'Risk' | 'Momentum';
    supporting_sections: string[]; // ["Section 2", "Section 3", etc.]
    sources: string[];           // ["S1", "S3", "S7"]
  }>;
  
  sources_used: string[];
}
```

---

## BULLET POINT REQUIREMENTS

**Format:** 5-7 bullet points total

**Required bullets (in order):**

### Bullet 1: Geography Headline (REQUIRED)
- **Category:** Geography
- **Content:** Lead with most impactful {geography}-specific finding
- **Include:** Regional revenue/scale, growth rate, strategic importance
- **Example:** "**German operations** generated €1.2B revenue (22% of global total) in FY2024, growing 15% YoY and outpacing company-wide growth of 12%, with regional EBITDA margin of 19.2% exceeding corporate average of 18.3% (S1, S3)."

**What to pull:**
- Section 2: Regional revenue, growth, margins
- Section 3: Geography positioning, facilities
- Section 4: Segment performance in {geography}

### Bullet 2-3: Financial Performance (REQUIRED)
- **Category:** Financial
- **Content:** Mix of growth, profitability, cash/working capital
- **Emphasize:** {geography} context where available
- **Example:** "EBITDA margin expanded 80bps to 18.3% driven by pricing power and operational efficiency in **German facilities**, though DSO deteriorated 6 days to 68 days trapping ~$50M working capital vs peer average of 62 days (S1, S3, S7)."

**What to pull:**
- Section 2: KPI table highlights, summary
- Section 4: Segment margins and performance
- Section 6: Peer gaps or strengths

### Bullet 4: Strategic Posture (REQUIRED)
- **Category:** Strategic
- **Content:** Recent strategic moves or priorities
- **Emphasize:** {geography}-specific initiatives
- **Example:** "Strategic investment of €75M in Stuttgart hydraulics facility expansion (20% capacity addition) and new Munich aerospace R&D center (150 engineers) signals confidence in European aerospace recovery and positions **Germany** as regional hub (S5, S8)."

**What to pull:**
- Section 3: Strategic priorities
- Section 8: Recent investments/announcements
- Section 5: Company-specific positive trends

### Bullet 5: Competitive Position (RECOMMENDED)
- **Category:** Competitive
- **Content:** Standing vs. peers in {geography}
- **Include:** Market position, competitive advantages/disadvantages
- **Example:** "In **German** industrial markets, company holds #2 position with 18-20% share behind Bosch Rexroth, with competitive advantages in aftermarket support and Airbus relationships but facing margin pressure from Bosch's integrated portfolio (S6, S7)."

**What to pull:**
- Section 6: Competitive positioning, benchmark summary
- Section 3: Geography positioning
- Section 4: Segment competitive landscapes

### Bullet 6-7: Key Risks/Headwinds (REQUIRED - 1-2 bullets)
- **Category:** Risk
- **Content:** 2-3 most material risks or headwinds
- **Emphasize:** {geography}-specific or regionally acute
- **Example:** "Key risks include potential market share erosion in **German** hydraulics (already down 200bps over 24 months), EUR/USD headwinds masking operational performance (~3% revenue impact), and wage inflation in **German** manufacturing sector pressuring margins (S5, S6)."

**What to pull:**
- Section 5: Negative trends with high impact scores
- Section 6: Key gaps
- Section 7: High-severity operational issues
- Section 4: Segment risks

### Final Bullet: Momentum Assessment (RECOMMENDED)
- **Category:** Momentum
- **Content:** Overall trajectory assessment
- **Include:** Forward-looking view with supporting evidence
- **Example:** "Overall momentum is POSITIVE with accelerating aerospace demand, margin expansion trajectory, and strategic capacity investments positioning **German operations** for continued outperformance, though working capital and competitive dynamics require management attention (S2, S5, S8)."

**What to pull:**
- Section 5: Trend summary and impact scores
- Section 2: Performance trajectory
- Section 8: Recent positive developments
- Section 6: Competitive positioning

---

## SYNTHESIS GUIDELINES

### How to Extract Key Points from Each Section

**Section 2 (Financial Snapshot):**
- Pull: Regional revenue, growth, margins vs company/industry
- Look for: Metrics significantly above/below benchmarks
- Emphasize: Working capital trends, cash generation

**Section 3 (Company Overview):**
- Pull: Geography positioning statement, strategic priorities with regional relevance
- Look for: High-relevance priorities, recent facility investments
- Emphasize: Regional competitive standing

**Section 4 (Segment Analysis):**
- Pull: Segment performance in {geography}, key drivers
- Look for: Segments with strong regional performance or challenges
- Emphasize: Segment-specific geography strengths

**Section 5 (Trends):**
- Pull: High-impact company trends (score 7+), aggregate summary
- Look for: Negative trends (risks), positive trends (momentum)
- Emphasize: Geography-specific trend impacts

**Section 6 (Peer Benchmarking):**
- Pull: Overall assessment, competitive positioning, key gaps
- Look for: Material gaps (Moderate/Significant), meaningful strengths
- Emphasize: Geography-specific competitive context

**Section 7 (SKU Opportunities):**
- Pull: High-priority opportunities with geography relevance
- Look for: High severity scores (7+), material value potential
- Emphasize: Operational challenges that create risk

**Section 8 (Recent News):**
- Pull: High-impact news (Investment, M&A categories), recent developments
- Look for: Strategic moves in {geography}
- Emphasize: Forward-looking implications

---

## GEOGRAPHY FOCUS (75-80%)

**Every bullet must connect to {geography}:**

✅ **CORRECT patterns:**
- "**{Geography} operations** generated..."
- "Regional margin of X% exceeds..."
- "In **{geography}** specifically, company ranks..."
- "Strategic investment in **{geography}** signals..."

❌ **WRONG patterns:**
- Pure global statements without regional connection
- Generic findings applicable to any geography
- No {geography} mention in bullet

---

## CONFIDENCE SCORING

**HIGH:**
- All required sections (2, 3) provided with rich detail
- Multiple optional sections available (4-8)
- Clear, quantified findings across sections
- Strong geography-specific insights

**MEDIUM:**
- Required sections provided but limited detail
- Some optional sections available
- Mix of quantified and qualitative findings
- Some geography context but not comprehensive

**LOW:**
- Only minimal required sections
- Limited optional context
- Primarily qualitative findings
- Weak geography-specific insights

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] 5-7 bullet points total
- [ ] Bullet 1 is geography headline
- [ ] Bullets 2-3 are financial performance
- [ ] Bullet 4 is strategic posture
- [ ] At least one risk/headwind bullet
- [ ] Each bullet cites supporting sections
- [ ] Each bullet cites sources (S# format)
- [ ] 75-80% of content emphasizes {geography}
- [ ] Bullets are concise (1-3 sentences each)
- [ ] Categories assigned correctly
- [ ] Sources_used array complete

---

## EXAMPLE OUTPUT (PARTIAL)

```json
{
  "confidence": {
    "level": "HIGH",
    "reason": "All required sections plus Segments, Trends, Benchmarking, and News available with strong geography-specific detail"
  },
  "bullet_points": [
    {
      "bullet": "**German operations** generated €1.2B revenue (22% of global total) in FY2024, growing 15% YoY and outpacing company-wide growth of 12%, with regional EBITDA margin of 19.2% exceeding corporate average of 18.3% driven by favorable aerospace product mix and operational excellence at Stuttgart facilities (S1, S3).",
      "category": "Geography",
      "supporting_sections": ["Section 2", "Section 3", "Section 4"],
      "sources": ["S1", "S3"]
    },
    {
      "bullet": "EBITDA margin expanded 80bps to 18.3% driven by pricing actions and operational efficiency, though DSO deteriorated 6 days YoY to 68 days (vs peer average of 62 days) trapping approximately $50M in working capital, with deterioration concentrated in **German** industrial segment where customer payment terms extended amid economic softness (S1, S2, S3, S7).",
      "category": "Financial",
      "supporting_sections": ["Section 2", "Section 6"],
      "sources": ["S1", "S2", "S3", "S7"]
    },
    {
      "bullet": "Strategic investments totaling €120M in **German operations** including Stuttgart hydraulics expansion (20% capacity addition, 150 jobs) and new Munich aerospace R&D center (150 engineers) signal confidence in European aerospace recovery and position **Germany** as regional engineering hub for sustainable aviation technologies (S5, S8).",
      "category": "Strategic",
      "supporting_sections": ["Section 3", "Section 5", "Section 8"],
      "sources": ["S5", "S8"]
    },
    {
      "bullet": "In **German** hydraulics market specifically, company holds #2 position with 18-20% share behind Bosch Rexroth's 25%, with competitive advantages in aftermarket support and differentiated IoT capabilities but facing margin pressure from Bosch's broader portfolio and local presence advantage (S6, S7).",
      "category": "Competitive",
      "supporting_sections": ["Section 6", "Section 3"],
      "sources": ["S6", "S7"]
    },
    {
      "bullet": "Key risks include potential market share erosion in **German** hydraulics (already declined 200bps over 24 months), EUR/USD headwinds masking operational performance (~3% revenue impact), and wage inflation in **German** manufacturing sector averaging 6-8% annually pressuring margins despite pricing actions (S5, S6).",
      "category": "Risk",
      "supporting_sections": ["Section 5", "Section 6"],
      "sources": ["S5", "S6"]
    },
    {
      "bullet": "Overall momentum is POSITIVE with accelerating aerospace demand (order backlog up 18% YoY), capacity expansion investments yielding results, and **German facilities** achieving best-in-class operational metrics (92% OEE vs 85% company average), though working capital management and competitive dynamics in mature industrial markets require continued management attention (S2, S4, S5, S8).",
      "category": "Momentum",
      "supporting_sections": ["Section 2", "Section 4", "Section 5", "Section 8"],
      "sources": ["S2", "S4", "S5", "S8"]
    }
  ],
  "sources_used": ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]
}
```

---

## CRITICAL REMINDERS

1. **Synthesize, don't repeat** - Distill key findings, don't copy sections
2. **Geography first** - Lead with {geography} headline
3. **Be selective** - 5-7 bullets of most important findings only
4. **Quantify** - Include specific metrics and data points
5. **Source everything** - Cite both sections and sources (S#)
6. **Mix signals** - Balance positive and negative, opportunities and risks
7. **Forward-looking** - Include momentum assessment
8. **Valid JSON only** - No markdown backticks
9. **Exact schema match** - Follow TypeScript interface

---

## BEGIN SYNTHESIS

**Company:** {companyName}  
**Geography:** {geography}  
**Available Sections:** [List of provided section contexts]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. SYNTHESIZE KEY FINDINGS NOW.**
