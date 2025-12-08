# Section 7: SKU-Relevant Opportunity Mapping - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 7 (SKU-Relevant Opportunity Mapping) identifying 2-5 genuine operational problems that align with SSA Industrials practice areas for **{companyName}** in **{geography}**.

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
      description: string;
      direction: 'Positive' | 'Negative' | 'Neutral';
      impact_score: number;
      geography_relevance: string;
      source: string;
    }>;
  }
}
```

### Recommended: Section 6 Context (Peer Gaps)

```typescript
{
  benchmark_summary: {
    key_gaps: Array<{
      gap: string;
      description: string;
      geography_context: string;
      magnitude: 'Significant' | 'Moderate' | 'Minor';
    }>;
  }
}
```

**Note:** Section 5 & 6 context help identify problems but are NOT required. If unavailable, conduct independent problem identification.

---

## SSA PRACTICE AREAS (5 Categories)

Reference these when mapping opportunities:

### 1. Capacity & Throughput Enhancement
**When to map:**
- Capacity utilization <80%
- Production bottlenecks mentioned
- OEE <75%
- Quality/defect issues
- Equipment downtime problems

**Sub-offerings:**
- OEE Uplift & Bottleneck Removal
- Asset Reliability & Maintenance
- Quality Systems

### 2. Cost Optimization Through Digital Lean
**When to map:**
- Process waste/inefficiency
- Distribution costs above peer
- SG&A % above peer average
- Organizational restructuring
- SKU complexity issues

**Sub-offerings:**
- Lean Operations
- Distribution & Logistics Optimization
- Organizational Effectiveness
- Value Engineering

### 3. Operational Excellence to Drive Cash Flow Velocity & ROIC
**When to map:**
- DSO/DIO above peer average
- Inventory turns below peer
- ROIC declining
- Working capital issues
- Cash conversion cycle concerns

**Sub-offerings:**
- Inventory Optimization
- Order-to-Cash Acceleration
- Asset & Network Utilization
- Operating Cost Efficiency

### 4. Improving the Operating Model
**When to map:**
- Network optimization discussions
- M&A integration activity
- Leadership transitions
- Major capital projects

**Sub-offerings:**
- Network & Supply Chain Design
- Transaction Support (M&A)
- Interim Leadership
- Capital Project Management

### 5. Lead the Journey to Your Real-Time Enterprise
**When to map:**
- ERP/MES system initiatives
- Data visibility gaps
- Digital transformation mentions
- Legacy system challenges
- IoT/Industry 4.0 programs

**Sub-offerings:**
- Control Tower & Performance Management
- Digital Operations
- Enterprise Enablement

---

## RESEARCH REQUIREMENTS

### Problem Identification Strategy

**Search for problems in these sources:**

1. **Earnings transcripts** (last 4 quarters)
   - Search: "{companyName} earnings transcript Q4 2024"
   - Look for: Management discussion of challenges, headwinds, initiatives
   - Extract: Specific operational issues mentioned with detail

2. **10-K/10-Q Risk Factors**
   - Search: "{companyName} 10-K 2024 risk factors"
   - Look for: Material operational or financial risks
   - Extract: Quantified challenges, ongoing issues

3. **Analyst reports**
   - Search: "{companyName} analyst report 2024"
   - Look for: Operational concerns, competitive weaknesses
   - Extract: Identified gaps vs peers, efficiency opportunities

4. **Section 5 Trends** (if provided)
   - Review: Company-specific negative trends
   - Extract: Trends with geography relevance to {geography}

5. **Section 6 Peer Gaps** (if provided)
   - Review: Key gaps with Moderate/Significant magnitude
   - Extract: Gaps with specific geography context for {geography}

**Problem must be:**
- **Explicitly stated:** Direct quote or detailed paraphrase from source
- **Specific:** Not generic ("improve operations" is too vague)
- **Quantified:** Include numbers, percentages, timeframes when available
- **Geography-relevant:** Focus on {geography} or clearly applicable to region

---

## OPPORTUNITY MAPPING PROCESS

### Step 1: Extract Problems from Sources

**For EACH identified problem, document:**
- **Exact statement** from source (quote or detailed paraphrase)
- **Source citation** (S# format)
- **Geography relevance** (how it affects {geography} specifically)
- **Quantification** (if available: %, days, $, etc.)

**GOOD examples:**
```
Problem: "OEE at German plants averaged 72% in Q3 vs. 78% company average" (S2)
Geography: Specific to German operations
Quantified: 6 percentage point gap

Problem: "DSO increased 6 days YoY to 68 days; primarily in German industrial segment" (S1)
Geography: German industrial segment specifically
Quantified: 6-day deterioration, 68 days absolute

Problem: "Implementing SAP S/4HANA across European operations; $45M investment over 18 months" (S5)
Geography: European operations (includes {geography})
Quantified: $45M investment, 18-month timeline
```

**BAD examples (do NOT use):**
```
❌ "Company probably has working capital opportunities" (speculation)
❌ "Could benefit from lean manufacturing" (generic, no evidence)
❌ "Likely experiencing throughput constraints" (assumption)
❌ "Operations could be more efficient" (vague, unsourced)
```

### Step 2: Match Problems to SKU Categories

For EACH identified problem:

1. **Identify primary SKU category** (1-5 from list above)
2. **Validate genuine alignment:**
   - Does the SKU specifically address this problem?
   - Is there a clear mechanism of value creation?
   - Would this be a natural conversation with an executive?
3. **If alignment is weak → DO NOT INCLUDE**

**Example alignments:**

| Problem | Aligned SKU | Rationale |
|---------|-------------|-----------|
| "OEE at 72% vs 78% target" | 1. Capacity & Throughput → OEE Uplift | Direct alignment; clear value mechanism |
| "DSO increased to 68 days vs 62 peer avg" | 3. Cash Flow Velocity → Order-to-Cash Acceleration | Direct working capital problem |
| "SAP S/4HANA implementation in progress" | 5. Real-Time Enterprise → Enterprise Enablement | System implementation support |
| "Market share declined 200bps" | ❌ NO SKU ALIGNMENT | Strategic/commercial issue, not operational |

### Step 3: Assess Priority and Severity

**Priority (High/Medium/Low):**
- **High:** Explicitly emphasized by management; strategic importance; time-sensitive
- **Medium:** Operational issue cited; moderate management attention
- **Low:** Minor issue; limited discussion; peripheral concern

**Severity (1-10 scale):**
- **9-10:** Critical/transformational (>$100M or >500bps impact)
- **7-8:** Major impact (>$50M or >200bps)
- **4-6:** Moderate impact (>$10M or >50bps)
- **1-3:** Minor impact (<$10M or <50bps)

**Base on:**
- Financial magnitude mentioned or implied
- Management tone and emphasis
- Risk factor prominence in filings
- Competitive/strategic implications

### Step 4: Articulate Value Levers

For EACH opportunity, list 2-4 specific value levers:

**Must be:**
- Concrete and specific (not generic)
- Fact-based from research where possible
- Quantified when data available
- Actionable and addressable

**GOOD value levers:**
```
✅ "DSO reduction targeting 5-day improvement (~$50M cash release based on $3.6B annual revenue)"
✅ "Bottleneck elimination in machining center (identified as constraint in Q2 call); potential 15% capacity gain"
✅ "OEE improvement from 72% to 78% target (600bps); unlocks ~$35M additional revenue capacity"
```

**BAD value levers:**
```
❌ "Improve operations" (too generic)
❌ "Enhance efficiency" (vague)
❌ "Drive performance" (meaningless)
❌ "Optimize processes" (no specificity)
```

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

```typescript
interface Section7Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  opportunities: Array<{
    issue_area: string;              // Specific operational/financial area (e.g., "Working Capital Management")
    public_problem: string;          // Exact quote or detailed paraphrase with specifics
    source: string;                  // "S#" format
    aligned_sku: string;             // Full name: "1. Capacity & Throughput → OEE Uplift"
    priority: 'High' | 'Medium' | 'Low';
    severity: number;                // 1-10
    severity_rationale: string;      // 1-2 sentences explaining severity score
    geography_relevance: string;     // How this affects {geography} specifically
    potential_value_levers: string[]; // Array of 2-4 specific, quantified levers
  }>;
  
  sources_used: string[];
}
```

**Table format (from style guide Section 8):**
```
| Issue Area | Public Problem Identified | Aligned SKU | Priority | Severity | Potential Value Levers |
```

---

## QUALITY STANDARDS

**High-quality opportunity mapping has:**
- **2-5 opportunities** (not 10+; focus on best alignments)
- **Strong evidence** for each problem (direct quotes/paraphrases)
- **Natural SKU alignments** (obvious fit, not forced)
- **Specific value levers** (quantified where possible)
- **Clear business case** (user immediately understands the opportunity)

**Do NOT include an opportunity if:**
- Problem is not explicitly stated in research
- SKU alignment requires multiple assumptions
- Value levers are generic or speculative
- Priority/severity cannot be reasonably assessed
- Problem is outside {geography} scope

**Remember:** An empty opportunity section is ACCEPTABLE if no genuine alignments exist.

---

## GEOGRAPHY FOCUS (75-80%)

**Prioritize problems that are:**
1. **Geography-specific:** "{geography} plants OEE of 72%..." → HIGH priority
2. **Regional underperformance:** "German DSO 6 days worse than global..." → HIGH priority
3. **Global with regional relevance:** "Company-wide ERP upgrade includes {geography}..." → MEDIUM priority
4. **Outside geography:** "US supply chain issue..." → LOW or exclude

**Every opportunity must explain geography relevance:**
- How the problem manifests in {geography}
- Regional vs global severity
- Why {geography} operations are affected

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] 2-5 opportunities identified (or 0 if no genuine alignments)
- [ ] Every problem has explicit source citation
- [ ] Every problem is quantified or specifically described
- [ ] SKU alignments are genuine (not forced)
- [ ] Priority assigned for each (High/Medium/Low)
- [ ] Severity scored for each (1-10)
- [ ] Severity rationale provided (1-2 sentences)
- [ ] Geography relevance explained for each
- [ ] Value levers are specific (2-4 per opportunity)
- [ ] Value levers quantified where data available
- [ ] No speculation or generic statements
- [ ] Sources_used array complete

---

## EXAMPLE OUTPUT (PARTIAL)

```json
{
  "confidence": {
    "level": "HIGH",
    "reason": "Multiple explicit operational problems identified in recent earnings transcripts with quantification"
  },
  "opportunities": [
    {
      "issue_area": "Working Capital Management - Order-to-Cash",
      "public_problem": "Days Sales Outstanding increased 6 days year-over-year to 68 days, with deterioration concentrated in German industrial segment where customer payment terms have extended amid economic softness (Q3 2024 earnings call, S2). CFO noted approximately $50M in additional working capital trapped vs prior year levels.",
      "source": "S2",
      "aligned_sku": "3. Operational Excellence to Drive Cash Flow Velocity & ROIC → Order-to-Cash Acceleration",
      "priority": "High",
      "severity": 7,
      "severity_rationale": "Material cash impact of ~$50M with trend deteriorating; management explicitly cited as focus area for improvement in Q3 call.",
      "geography_relevance": "Problem is specifically concentrated in **German industrial segment** where customer payment behavior has weakened. Regional DSO of 68 days compares to 62-day company target and peer average of 62 days.",
      "potential_value_levers": [
        "DSO reduction targeting 5-day improvement releases ~$35M cash (based on €1.2B German revenue)",
        "Billing accuracy improvements reducing disputes that delay payments",
        "Credit term renegotiation with top 20 customers representing 60% of receivables",
        "Collections process optimization leveraging best practices from other regions"
      ]
    },
    {
      "issue_area": "Operational Efficiency - Manufacturing Performance",
      "public_problem": "Overall Equipment Effectiveness (OEE) at German manufacturing facilities averaged 72% in Q3 2024 compared to company average of 78% and target of 85%, with management citing changeover time inefficiencies and unplanned downtime as primary drivers (Q3 2024 earnings transcript, S2; Investor Day presentation, S5).",
      "source": "S2, S5",
      "aligned_sku": "1. Capacity & Throughput Enhancement → OEE Uplift & Bottleneck Removal",
      "priority": "High",
      "severity": 8,
      "severity_rationale": "6-percentage point gap vs company average and 13-point gap vs target represents significant underutilization of installed capacity. At €1.2B regional revenue, improvement to target levels could unlock €80-100M additional capacity without capital investment.",
      "geography_relevance": "Problem is specific to **German facilities**, which represent 22% of global production capacity. Stuttgart facility (largest in region with 850 employees) cited as having longest changeover times averaging 4.2 hours vs 2.8-hour company standard.",
      "potential_value_levers": [
        "OEE improvement from 72% to 78% (+600bps) unlocks ~€40M additional revenue capacity at current demand levels",
        "Changeover time reduction via SMED methodology targeting 50% improvement (4.2 hrs to 2.1 hrs)",
        "Unplanned downtime reduction from 8% to 5% through TPM/predictive maintenance programs",
        "Bottleneck elimination in machining centers identified as capacity constraint in Stuttgart and Kaarst facilities"
      ]
    }
  ],
  "sources_used": ["S2", "S5"]
}
```

---

## CRITICAL REMINDERS

1. **Follow style guide** for all formatting
2. **Only genuine alignments** - do not force fit
3. **Explicit problems only** - no speculation
4. **Geography focus** - prioritize {geography}-relevant problems
5. **Quantify everything** - include numbers, %, timelines
6. **Specific value levers** - avoid generic statements
7. **2-5 opportunities** - quality over quantity
8. **Empty is acceptable** - if no genuine alignments exist
9. **Valid JSON only** - no markdown backticks
10. **Exact schema match** - follow TypeScript interface

---

## BEGIN RESEARCH

**Company:** {companyName}  
**Geography:** {geography}  
**Foundation Context:** [Provided above]  
**Section 5 Context:** [Provided if available]  
**Section 6 Context:** [Provided if available]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
