# Section 9: Executive Conversation Starters - Synthesis Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 9 (Executive Conversation Starters) by creating 3-5 actionable discussion topics that link findings to business value for **{companyName}** in **{geography}**.

---

## SYNTHESIS SECTION NOTICE

**This section LINKS ANALYSIS TO ACTION:**

- **Recommended inputs:** Foundation + Sections 5 (Trends), 6 (Peer Gaps), 7 (SKU Opportunities)
- **Output:** 3-5 questions/discussion topics
- **Format:** Each references specific findings with data
- **Purpose:** Bridge from intelligence to executive decision-making

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

### Recommended: Section 5 Context (Trends)

```typescript
{
  company_trends: {
    trends: Array<{
      trend: string;
      direction: 'Positive' | 'Negative' | 'Neutral';
      impact_score: number;
      geography_relevance: string;
      source: string;
    }>;
  };
}
```

### Recommended: Section 6 Context (Peer Benchmarking)

```typescript
{
  benchmark_summary: {
    key_strengths: Array<{strength: string; description: string; geography_context: string}>;
    key_gaps: Array<{gap: string; description: string; geography_context: string; magnitude: string}>;
    competitive_positioning: string;
  };
}
```

### Recommended: Section 7 Context (SKU Opportunities)

```typescript
{
  opportunities: Array<{
    issue_area: string;
    public_problem: string;
    aligned_sku: string;
    priority: 'High' | 'Medium' | 'Low';
    severity: number;
    geography_relevance: string;
    potential_value_levers: string[];
  }>;
}
```

### Optional: Section 2, 4 Context

These can provide additional financial/operational context for conversation starters.

---

## CONVERSATION STARTER STRATEGY

### Your Task: Create Executive-Ready Discussion Topics

**Each conversation starter should:**
1. **Reference specific finding** from report with data
2. **Frame as question or discussion** (not presentation)
3. **Connect to business value** or strategic decision
4. **Be geography-specific** where possible
5. **Link to relevant SSA capability** (if Section 7 available)

**Prioritize topics that:**
- Address material business issues (not peripheral)
- Have clear financial/operational impact
- Are actionable (within management's control)
- Leverage SSA differentiated capabilities

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

```typescript
interface Section9Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  conversation_starters: Array<{
    title: string;              // Short descriptive title (5-10 words)
    question: string;           // Full conversation starter (2-4 sentences)
    supporting_data: string;    // Specific metrics/findings referenced
    business_value: string;     // Why this matters (1-2 sentences)
    ssa_capability?: string;    // Relevant SSA offering if applicable
    supporting_sections: string[]; // ["Section 5", "Section 6", etc.]
    sources: string[];          // ["S1", "S7", "S12"]
    geography_relevance: string; // How this affects {geography} specifically
  }>;
  
  sources_used: string[];
}
```

---

## CONVERSATION STARTER REQUIREMENTS

**Format:** 3-5 conversation starters total

**Each starter must include:**

### 1. Title (Short)
- 5-10 words
- Descriptive of the issue
- Example: "Working Capital Optimization Opportunity"

### 2. Question (Main Content)
- 2-4 sentences
- Frame as question or discussion topic
- Include specific data/metrics
- Reference geography where relevant
- Link to business value

### 3. Supporting Data
- Specific metrics from report
- Quantified where possible
- Sourced appropriately

### 4. Business Value
- Why this matters
- Financial or strategic impact
- 1-2 sentences

### 5. SSA Capability (If Applicable)
- Relevant SSA practice area
- Specific sub-offering if known
- Only include if Section 7 available and relevant

### 6. Geography Relevance
- How this specifically affects {geography}
- Regional context or implications
- 1-2 sentences

---

## CONVERSATION STARTER TEMPLATES

### Template 1: Operational/Financial Gap (from Section 6)

**Example:**
```json
{
  "title": "Working Capital Optimization Opportunity",
  "question": "DSO in **German operations** deteriorated to 68 days vs 62-day peer average, representing approximately $50M in trapped working capital. Have you explored payment term restructuring with major industrial customers? Our Order-to-Cash Acceleration practice has achieved 5-10 day DSO improvements in similar contexts, which could release $30-40M in cash.",
  "supporting_data": "German DSO: 68 days (up 6 days YoY); Peer average: 62 days; Estimated trapped capital: ~$50M (S1, S7)",
  "business_value": "A 5-day DSO improvement would release approximately $35M in working capital, improving cash flow and ROIC. Given current credit environment, cash preservation is critical.",
  "ssa_capability": "3. Operational Excellence → Order-to-Cash Acceleration",
  "supporting_sections": ["Section 2", "Section 6", "Section 7"],
  "sources": ["S1", "S7"],
  "geography_relevance": "Problem is concentrated in **German industrial segment** where customer payment behavior has weakened. Regional focus required for collections process redesign."
}
```

**When to use:**
- Section 6 identifies key gap with geography context
- Quantified financial impact available
- Clear SSA capability alignment (Section 7)

### Template 2: Competitive Positioning Concern (from Section 6)

**Example:**
```json
{
  "title": "Market Share Stabilization Strategy",
  "question": "Company's **German hydraulics** market share declined 200bps over 24 months to 18% while Bosch Rexroth gained 150bps to 25%. What's driving this differential? Could Digital Lean or OEE optimization help close the competitive gap, particularly given your below-average OEE at German facilities (72% vs 78% company average)?",
  "supporting_data": "German hydraulics share: 18% (down from 20%); Bosch Rexroth: 25% (up from 23.5%); German facility OEE: 72% vs 78% company avg (S3, S6, S7)",
  "business_value": "Stabilizing share and improving OEE to company average could unlock €40M in incremental capacity without capital investment, helping defend against Bosch's competitive pressure.",
  "ssa_capability": "1. Capacity & Throughput → OEE Uplift & Bottleneck Removal",
  "supporting_sections": ["Section 6", "Section 7"],
  "sources": ["S3", "S6", "S7"],
  "geography_relevance": "Share losses concentrated in **German market** where Bosch's local presence provides competitive advantage. Operational excellence is key differentiator available to company."
}
```

**When to use:**
- Section 6 shows competitive positioning concern
- Operational gap identified that could help
- Geographic specificity available

### Template 3: Strategic Trend or Opportunity (from Section 5)

**Example:**
```json
{
  "title": "Aerospace Recovery Capacity Constraint",
  "question": "Commercial aerospace demand is accelerating with Airbus production ramping 25% in 2024, yet **German aerospace facilities** are operating at 92% capacity vs 78% company average, potentially constraining ability to capture incremental demand. What's your strategy to expand capacity – organic investment, M&A, or outsourcing? Does the Real-Time Enterprise offering align with your supply chain digitization plans to maximize existing capacity?",
  "supporting_data": "Airbus production up 25% (2024); German aerospace capacity: 92% utilization; Incremental demand opportunity estimated at €80-100M over 3 years (S5, S8)",
  "business_value": "Capturing aerospace growth could add €25-30M in annual revenue with attractive margins (20%+ EBITDA). Missing this cycle due to capacity constraints would be strategically costly.",
  "ssa_capability": "5. Real-Time Enterprise → Control Tower & Performance Management",
  "supporting_sections": ["Section 5", "Section 8"],
  "sources": ["S5", "S8"],
  "geography_relevance": "**German** Airbus production sites ramping faster than North American Boeing sites, creating outsized opportunity for company's European footprint."
}
```

**When to use:**
- Section 5 identifies high-impact positive trend
- Strategic opportunity or constraint
- Forward-looking decision needed

### Template 4: Operational Performance Issue (from Section 7)

**Example:**
```json
{
  "title": "Manufacturing Efficiency Gap",
  "question": "OEE at **German manufacturing facilities** averaged 72% vs company average of 78% and target of 85%, driven by changeover time inefficiencies (4.2 hours vs 2.8-hour standard). Have you considered SMED methodology to reduce changeover times? Improvement to target levels could unlock ~€40M in additional revenue capacity without capital investment.",
  "supporting_data": "German OEE: 72%; Company average: 78%; Target: 85%; Changeover time: 4.2 hrs vs 2.8 hr standard; Capacity opportunity: €40M (S2, S3, S7)",
  "business_value": "Each percentage point of OEE improvement represents ~€5M in incremental revenue capacity. Closing the 13-point gap to target would unlock significant value.",
  "ssa_capability": "1. Capacity & Throughput → OEE Uplift & Bottleneck Removal",
  "supporting_sections": ["Section 7", "Section 2"],
  "sources": ["S2", "S3", "S7"],
  "geography_relevance": "Problem specific to **German facilities**, particularly Stuttgart (largest in region). Regional focus allows concentrated improvement effort."
}
```

**When to use:**
- Section 7 identifies high-priority operational issue
- Clear value quantification available
- SSA capability alignment strong

---

## GEOGRAPHY FOCUS (75-80%)

**Every conversation starter must emphasize {geography}:**

✅ **CORRECT patterns:**
- "DSO in **{geography} operations** deteriorated to..."
- "**{Geography}** market share declined..."
- "**{Geography} facilities** operating at 92% capacity..."

❌ **WRONG patterns:**
- Generic global issues without regional tie-in
- Conversation starters applicable to any geography
- No geographic specificity in the discussion

---

## QUALITY STANDARDS

**Good conversation starters:**
- Reference specific, quantified findings
- Frame genuine strategic questions
- Connect to clear business value
- Are actionable and timely
- Link to SSA capabilities naturally

**Avoid:**
- Generic questions that could apply to any company
- Topics with no clear action or decision
- Issues outside management's control
- Speculative or aspirational topics
- Forced SKU alignments

---

## CONFIDENCE SCORING

**HIGH:**
- Sections 5, 6, 7 all available
- Rich quantified findings across sections
- Clear SSA capability alignments
- Strong geography-specific context

**MEDIUM:**
- At least 2 of Sections 5, 6, 7 available
- Mix of quantified and qualitative findings
- Some SKU alignments possible
- Moderate geography context

**LOW:**
- Limited section context available
- Primarily qualitative findings
- Weak SKU alignment opportunities
- Minimal geography-specific insights

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] 3-5 conversation starters
- [ ] Each has title (5-10 words)
- [ ] Each has question (2-4 sentences)
- [ ] Each has supporting data with metrics
- [ ] Each has business value statement
- [ ] Each has geography relevance
- [ ] SSA capabilities included where applicable
- [ ] Supporting sections cited
- [ ] Sources cited (S# format)
- [ ] 75-80% emphasizes {geography}
- [ ] Sources_used array complete

---

## CRITICAL REMINDERS

1. **Link findings to action** - Not just observations
2. **Frame as questions** - Not presentations
3. **Be specific** - Use actual metrics from report
4. **Geography-focused** - Emphasize {geography} implications
5. **SSA capabilities** - Connect to relevant offerings when applicable
6. **Business value** - Always explain "so what?"
7. **Valid JSON only** - No markdown backticks
8. **Exact schema match** - Follow TypeScript interface

---

## BEGIN SYNTHESIS

**Company:** {companyName}  
**Geography:** {geography}  
**Available Sections:** [List of provided section contexts]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. CREATE CONVERSATION STARTERS NOW.**
