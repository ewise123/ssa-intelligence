# Section 6: Peer Benchmarking - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 6 (Peer Benchmarking) with comprehensive peer comparison table and benchmark summary for **{companyName}** in **{geography}**.

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

### REQUIRED: Section 2 Context (Financial Snapshot)

**This section REQUIRES Section 2 financial data to benchmark against peers.**

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
  fx_source: 'A' | 'B' | 'C';
  industry_source: 'A' | 'B' | 'C';
}
```

**If Section 2 context is not provided, you must conduct independent financial research for {companyName} to establish baseline metrics before peer comparison.**

---

## RESEARCH REQUIREMENTS

### 1. Identify Comparable Peers (3-5 companies)

**Priority: CRITICAL**

**Search for:**
- "{companyName} competitors"
- "{companyName} peer group"
- "{companyName} competitive landscape {geography}"
- "{industry} market leaders"
- "analyst reports {companyName} peers"

**Selection criteria for peers:**

**Must have:**
- Geographic overlap with {geography} (operations, manufacturing, or significant revenue)
- Business model overlap (industrial, B2B, similar segments)
- Publicly traded (need financial data for comparison)
- Similar scale (0.5x to 2x revenue of {companyName})

**Prefer:**
- Direct competitors in key segments
- Similar customer base
- Comparable operational footprint in {geography}

**Typical peer examples (industrial sector):**
- For Parker Hannifin: Eaton, Emerson, Bosch, Honeywell
- For Siemens: ABB, Schneider Electric, Rockwell Automation
- Adjust based on actual company and segments

### 2. Gather Peer Financial Data

**Priority: CRITICAL**

**For EACH peer, search for:**
- "[Peer name] 10-K" OR "[Peer name] annual report 2024"
- "[Peer name] Q3 2024 earnings"
- "[Peer name] investor presentation"
- "[Peer name] {geography} revenue"

**Extract for EACH peer:**

**Required metrics (must match Section 2 metrics):**
1. Revenue (Latest Period) - global
2. Revenue Growth (YoY)
3. EBITDA Margin
4. Operating Margin
5. Gross Margin (if disclosed)
6. Operating Cash Flow
7. Free Cash Flow Margin
8. Days Sales Outstanding (DSO)
9. Days Inventory Outstanding (DIO)
10. Inventory Turns
11. ROIC (Return on Invested Capital)
12. CapEx as % Revenue
13. Debt/EBITDA (if applicable)

**Geography-specific data (75-80% focus):**
- {geography} revenue (absolute and % of total)
- {geography} facilities count
- {geography} employees
- {geography} market position or share
- {geography} growth rate vs global
- {geography} strategic importance

**Calculate if not disclosed:**
- Inventory Turns = COGS / Avg Inventory
- ROIC = NOPAT / Invested Capital
- Free Cash Flow = Operating CF - CapEx

### 3. Industry Average Benchmarks

**Priority: HIGH**

**Use Section 2 industry averages as baseline.**

**If additional context needed, search for:**
- "industrial machinery sector benchmarks 2024"
- "Damodaran industry averages {segment}"
- "S&P Capital IQ industrial sector"
- "{segment} industry financial metrics"

**Ensure consistency:**
- Use same industry average source as Section 2
- Same calculation methodologies
- Same time periods

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

```typescript
interface Section6Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  peer_comparison_table: {
    company_name: string; // {companyName}
    peers: Array<{
      name: string;
      ticker?: string;
      geography_presence: string; // Description of {geography} operations
      geography_revenue_pct?: number; // % of revenue from {geography} if available
    }>;
    metrics: Array<{
      metric: string;           // Must match Section 2 metric names exactly
      company: number | string;
      peer1: number | string;
      peer2: number | string;
      peer3: number | string;
      peer4?: number | string;  // Optional 4th peer
      industry_avg: number | string;
      source: string;           // "S#, S#"
    }>;
  };
  
  benchmark_summary: {
    overall_assessment: string; // 2-3 sentences on how company compares overall
    key_strengths: Array<{
      strength: string;         // Title
      description: string;      // 2-3 sentences with metrics
      geography_context: string; // How this manifests in {geography}
    }>;
    key_gaps: Array<{
      gap: string;              // Title
      description: string;      // 2-3 sentences with metrics
      geography_context: string; // How this manifests in {geography}
      magnitude: 'Significant' | 'Moderate' | 'Minor';
    }>;
    competitive_positioning: string; // 3-4 sentences on {geography} competitive standing
  };
  
  sources_used: string[];
}
```

---

## TABLE REQUIREMENTS (Section 6.1)

**The table MUST use this EXACT format from style guide:**

```
| Metric | [Company] | Peer 1 | Peer 2 | Peer 3 | Industry Avg |
```

**Critical requirements:**
- Replace [Company] with actual company name
- Use exact metric names from Section 2
- Include ALL Section 2 metrics (use "–" if peer data unavailable)
- Right-align numbers
- Format consistently: $X.XB, X.X%, X.Xx, X days
- Source every metric

**Example row:**
```json
{
  "metric": "EBITDA Margin",
  "company": "18.3%",
  "peer1": "16.8%",
  "peer2": "19.5%",
  "peer3": "15.2%",
  "industry_avg": "16.5%",
  "source": "S1, S7, S15, S18, S22"
}
```

**Add peer descriptions above table:**
- Name and ticker
- Brief description of {geography} operations
- Revenue % from {geography} if available

---

## BENCHMARK SUMMARY REQUIREMENTS (Section 6.2)

### Overall Assessment (2-3 sentences)

Synthesize how {companyName} compares to peers:
- Relative positioning (leader, middle-of-pack, laggard)
- Key differentiators
- Overall competitive standing in {geography}

**Example:**
"{companyName} operates in the middle of the peer pack on profitability metrics but leads in working capital efficiency, with DSO 6 days better than the peer median (S1, S7). The company's 18.3% EBITDA margin exceeds Eaton (16.8%) and the industry average (16.5%) but trails Bosch Rexroth (19.5%), primarily due to higher R&D intensity (S1, S15, S18). In **{geography}** specifically, the company ranks #2 in market share behind Bosch but demonstrates superior operational metrics at comparable facilities (S7, S12)."

### Key Strengths (2-4 items)

**For each strength:**
- **Title:** "Working capital efficiency" or "Margin superiority"
- **Description:** 2-3 sentences with specific metrics and peer comparisons
- **Geography context:** How this strength manifests in {geography} operations

**Example:**
```json
{
  "strength": "Superior working capital management",
  "description": "DSO of 68 days compares favorably to Eaton (74 days), Emerson (72 days), and industry average (72 days), freeing approximately $50M in additional working capital (S1, S7, S15). Inventory turns of 4.2x exceed peer median of 3.8x, driven by lean manufacturing practices and VMI programs with major customers.",
  "geography_context": "**German facilities** demonstrate best-in-class working capital performance with DSO of 65 days vs 68-day company average, reflecting strong payment discipline with European industrial customers (S3, S7)."
}
```

### Key Gaps (2-4 items)

**For each gap:**
- **Title:** "ROIC underperformance" or "Market share loss"
- **Description:** 2-3 sentences quantifying the gap vs peers
- **Geography context:** How this gap affects {geography}
- **Magnitude:** Significant (>20% gap), Moderate (10-20%), Minor (<10%)

**Example:**
```json
{
  "gap": "Market share erosion in core hydraulics",
  "description": "Company's German hydraulics market share declined 200bps over 24 months to 18% while Bosch Rexroth gained 150bps to 25% (S7, S12). Losses concentrated in mobile hydraulics segment where Bosch's integrated electronics offering has proven more competitive. Peer Eaton also gained modest share (50bps) through aggressive pricing.",
  "geography_context": "**German operations** bore the brunt of share losses, particularly in Baden-Württemberg region where Bosch headquarters provides competitive advantage in customer relationships. Stuttgart facility utilization declined to 82% from 88% two years prior (S3, S7).",
  "magnitude": "Moderate"
}
```

### Competitive Positioning (3-4 sentences)

**Synthesize {geography}-specific competitive standing:**
- Market position relative to peers in region
- Competitive advantages/disadvantages in {geography}
- Strategic implications for regional operations
- Forward-looking competitive dynamics

**Example:**
"In **{geography}**, {companyName} holds a #2 market position with 18-20% share in hydraulics and aerospace systems, trailing only Bosch Rexroth's integrated conglomerate presence (S7, S12). The company's competitive advantages in the region include a larger installed base of legacy systems requiring aftermarket support, stronger Airbus relationships than Eaton, and differentiated digital/IoT capabilities relative to local specialists like Hawe Hydraulik (S5, S8). However, Bosch's broader product portfolio and local presence create persistent margin pressure, and Eaton's recent capacity additions in Poland threaten to disrupt regional supply economics (S15, S18). Going forward, {companyName}'s **German** market position depends heavily on successfully commercializing next-generation sustainable aviation technologies and defending share in mature hydraulics markets through operational excellence."

---

## GEOGRAPHY FOCUS (75-80%)

**Every comparison must include {geography} context:**

✅ **CORRECT patterns:**

**In table descriptions:**
- "Eaton operates 8 manufacturing facilities in {geography} generating approximately 15% of global revenue, competitive with {companyName}'s 12 facilities and 18% revenue share."

**In strengths:**
- "Superior margin performance driven by higher capacity utilization in **{geography}** facilities (88% vs Eaton's 82% in comparable plants) (S3, S15)."

**In gaps:**
- "ROIC lags peer median by 180bps, with **German operations** contributing to underperformance due to older asset base requiring higher maintenance CapEx (S1, S7)."

**In competitive positioning:**
- "In **{geography}** hydraulics market specifically, company ranks #2 behind Bosch Rexroth..."

❌ **WRONG patterns:**
- Pure global comparisons without regional context
- Peer metrics without explaining {geography} relevance
- Competitive assessment that doesn't reference regional dynamics

---

## SOURCE CITATION REQUIREMENTS

**Follow style guide Section 5:**

1. Reuse foundation and Section 2 source numbers
2. Add new peer sources continuing sequential numbering
3. Source every metric in table
4. Source every claim in summary
5. Use "S#, S#, S#" format for multiple sources

**Typical sources:**
- S1: {companyName} 10-K
- S7: Industry benchmarks
- S15: [Peer 1] 10-K
- S18: [Peer 2] 10-K
- S22: [Peer 3] 10-K
- S25: Analyst report on competitive landscape

---

## CONFIDENCE SCORING

**HIGH:**
- Recent peer financials (10-K, 10-Q) available
- {geography}-specific data for company and peers
- Multiple sources confirming peer comparisons
- Clear competitive intelligence on regional market

**MEDIUM:**
- Peer financials available but somewhat dated
- Limited {geography}-specific peer data
- Industry averages used in lieu of some peer metrics
- Competitive positioning requires some inference

**LOW:**
- Difficulty finding comparable peers with {geography} presence
- Dated or incomplete peer financial data
- Significant data gaps requiring estimation
- Unclear competitive dynamics in region

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] 3-5 peers identified with {geography} presence
- [ ] Peer descriptions include geography context
- [ ] Table includes ALL Section 2 metrics
- [ ] Metric names match Section 2 exactly
- [ ] All table cells populated (use "–" if unavailable)
- [ ] All metrics cite sources
- [ ] Overall assessment is 2-3 sentences
- [ ] 2-4 key strengths with geography context
- [ ] 2-4 key gaps with geography context and magnitude
- [ ] Competitive positioning is 3-4 sentences focused on {geography}
- [ ] 75-80% of content emphasizes {geography}
- [ ] Sources_used array complete

---

## CRITICAL REMINDERS

1. **Follow style guide** for all formatting
2. **Requires Section 2** - financial data needed for comparison
3. **75-80% geography focus** - every comparison must show regional context
4. **Exact metric names** - must match Section 2 exactly
5. **Source everything** - no unsourced metrics or claims
6. **Peer geography presence** - required for all peers selected
7. **Valid JSON only** - no markdown backticks
8. **Exact schema match** - follow TypeScript interface

---

## BEGIN RESEARCH

**Company:** {companyName}  
**Geography:** {geography}  
**Foundation Context:** [Provided above]  
**Section 2 Context:** [REQUIRED - provided above]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
