import { appendReportTypeAddendum } from './report-type-addendums.js';
export function buildTrendsPrompt(input) {
    const { foundation, companyName, geography, section3Context, section4Context } = input;
    const foundationJson = JSON.stringify(foundation, null, 2);
    const section3Json = section3Context ? JSON.stringify(section3Context, null, 2) : 'Not provided';
    const section4Json = section4Context ? JSON.stringify(section4Context, null, 2) : 'Not provided';
    const basePrompt = `# Section 5: Trends - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 5 (Trends) with comprehensive Macro, Micro, and Company-Specific trend analysis for **${companyName}** in **${geography}**.

---

## INPUT CONTEXT

### Required: Foundation Context

\`\`\`json
${foundationJson}
\`\`\`

### Optional: Section 3 Context (Company Overview)

\`\`\`json
${section3Json}
\`\`\`

### Optional: Section 4 Context (Segment Analysis)

\`\`\`json
${section4Json}
\`\`\`

**Note:** Section 3 & 4 context provide additional insights but are NOT required. If unavailable, conduct independent research.

---

## RESEARCH REQUIREMENTS

### 1. Macro Trends (Industry & Economy-Wide)

**Priority: CRITICAL**

**Search for:**
- "sector trends 2024"
- "${geography} sector outlook 2024"
- "${geography} economic indicators 2024"
- "global supply chain trends 2024"
- "automation trends"
- "sustainability trends 2024"

**Extract trends in these categories:**

**Economic Trends:**
- GDP growth, production indices
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
- ${geography} business activity PMI
- ${geography} sector policy changes
- ${geography} infrastructure investments
- Regional economic forecasts

**For EACH macro trend:**
- **Direction:** Positive/Negative/Neutral
- **Impact Score:** 1-10 (see scoring guidance below)
- **Supporting evidence:** Quantitative data with sources
- **Geography relevance:** How it specifically affects ${geography} operations

### 2. Micro/Industry Trends (Sector-Specific)

**Priority: HIGH**

**Search for:**
- "{company segment} market trends 2024" (for each segment)
- "${geography} {segment} industry outlook"
- "{company segment} technology trends"
- "competitive dynamics {segment} ${geography}"

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
- Compare ${geography} vs global dynamics
- Cite analyst commentary (one quote <15 words per source)

### 3. Company-Specific Trends & Issues

**Priority: CRITICAL**

**Search for:**
- "${companyName} earnings transcript 2024" (last 4 quarters)
- "${companyName} ${geography} performance trends"
- "${companyName} analyst commentary"
- "${companyName} challenges" OR "${companyName} headwinds"
- "${companyName} opportunities" OR "${companyName} growth drivers"

**Extract company-specific trends:**

**Performance Trends:**
- Revenue growth trajectory (accelerating/decelerating)
- Margin trends (expansion/compression) and drivers
- Market share changes
- Win/loss rates, customer retention

**Operational Trends:**
- Capacity utilization changes
- Efficiency improvements (utilization, productivity)
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
- Emphasize ${geography} operations (75-80%)
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

\`\`\`typescript
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
      geography_relevance: string; // 1-2 sentences on ${geography} impact
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
\`\`\`

---

## GEOGRAPHY FOCUS (75-80%)

**Every trend must include geography relevance:**

✅ **CORRECT patterns:**

**Macro trend:**
- Trend: "European PMI stabilizing"
- Geography relevance: "**${geography}** production index improved to 48.5 in Q3 2024 from 42.1 in Q1, signaling demand stabilization for key sector customers (S15)."

**Micro trend:**
- Trend: "Commercial aerospace aftermarket strengthening"
- Geography relevance: "Lufthansa and other **${geography}** carriers increasing MRO spending by 15% in 2024; benefits Parker's **Stuttgart** aftermarket operations which serve European airline base (S18, S20)."

**Company trend:**
- Trend: "Market share gains in ${geography} core segment"
- Geography relevance: "**${companyName}** increased market share to 19% from 17% in **${geography}** core segment over last 18 months, primarily at expense of local specialists (S7, S12)."

---

## ANALYST QUOTE REQUIREMENTS

**COPYRIGHT COMPLIANCE (MANDATORY):**
- Maximum 15 words per quote (HARD LIMIT)
- ONE quote per analyst report source (HARD LIMIT)
- Paraphrase all other analyst content

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
- [ ] 75-80% of content emphasizes ${geography}
- [ ] Sources_used array complete

---

## BEGIN RESEARCH

**Company:** ${companyName}  
**Geography:** ${geography}  
**Foundation Context:** [Provided above]  
**Section 3 Context:** [Provided if available]  
**Section 4 Context:** [Provided if available]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
`;
    return appendReportTypeAddendum('trends', input.reportType, basePrompt);
}
export function validateSection5Output(output) {
    if (!output || typeof output !== 'object')
        return false;
    if (!output.confidence ||
        !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
        return false;
    }
    if (typeof output.aggregate_summary !== 'string')
        return false;
    if (!output.macro_trends ||
        typeof output.macro_trends.summary !== 'string' ||
        !Array.isArray(output.macro_trends.trends)) {
        return false;
    }
    if (!output.micro_trends ||
        typeof output.micro_trends.summary !== 'string' ||
        !Array.isArray(output.micro_trends.trends)) {
        return false;
    }
    if (!output.company_trends ||
        typeof output.company_trends.summary !== 'string' ||
        !Array.isArray(output.company_trends.trends)) {
        return false;
    }
    const allTrends = [
        ...output.macro_trends.trends,
        ...output.micro_trends.trends,
        ...output.company_trends.trends
    ];
    for (const trend of allTrends) {
        if (!trend.trend || !trend.description || !trend.direction ||
            typeof trend.impact_score !== 'number' ||
            !trend.geography_relevance || !trend.source) {
            return false;
        }
        if (!['Positive', 'Negative', 'Neutral'].includes(trend.direction)) {
            return false;
        }
        if (trend.impact_score < 1 || trend.impact_score > 10) {
            return false;
        }
    }
    if (!Array.isArray(output.sources_used))
        return false;
    return true;
}
export function formatSection5ForDocument(output) {
    let markdown = `# 5. Trends\n\n`;
    markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
    markdown += `## 5.1 Aggregate Trend Summary\n\n`;
    markdown += `${output.aggregate_summary}\n\n`;
    markdown += `## 5.2 Macro Trends (Industry & Economy-Wide)\n\n`;
    markdown += `${output.macro_trends.summary}\n\n`;
    for (const trend of output.macro_trends.trends) {
        markdown += `- **${trend.trend}**\n`;
        markdown += `  - Direction: ${trend.direction}\n`;
        markdown += `  - Impact Score: ${trend.impact_score}/10\n`;
        markdown += `  - ${trend.description}\n`;
        markdown += `  - **Geography Relevance:** ${trend.geography_relevance}\n`;
        markdown += `  - Source: ${trend.source}\n\n`;
    }
    markdown += `## 5.3 Micro/Industry Trends\n\n`;
    markdown += `${output.micro_trends.summary}\n\n`;
    for (const trend of output.micro_trends.trends) {
        markdown += `- **${trend.trend}**`;
        if (trend.segment_relevance) {
            markdown += ` (${trend.segment_relevance})`;
        }
        markdown += `\n`;
        markdown += `  - Direction: ${trend.direction}\n`;
        markdown += `  - Impact Score: ${trend.impact_score}/10\n`;
        markdown += `  - ${trend.description}\n`;
        markdown += `  - **Geography Relevance:** ${trend.geography_relevance}\n`;
        markdown += `  - Source: ${trend.source}\n\n`;
    }
    markdown += `## 5.4 Company-Specific Trends & Issues\n\n`;
    markdown += `${output.company_trends.summary}\n\n`;
    for (const trend of output.company_trends.trends) {
        markdown += `- **${trend.trend}**\n`;
        markdown += `  - Direction: ${trend.direction}\n`;
        markdown += `  - Impact Score: ${trend.impact_score}/10\n`;
        markdown += `  - ${trend.description}\n`;
        markdown += `  - **Geography Relevance:** ${trend.geography_relevance}\n`;
        if (trend.management_commentary) {
            markdown += `  - **Management:** ${trend.management_commentary}\n`;
        }
        if (trend.analyst_quote) {
            markdown += `  - **Analyst:** *"${trend.analyst_quote.quote}"* - ${trend.analyst_quote.analyst}, ${trend.analyst_quote.firm} (${trend.analyst_quote.source})\n`;
        }
        markdown += `  - Source: ${trend.source}\n\n`;
    }
    return markdown;
}
export function filterTrendsByDirection(trends, direction) {
    return trends.filter(t => t.direction === direction);
}
export function getHighImpactTrends(trends, minScore = 7) {
    return trends.filter(t => t.impact_score >= minScore).sort((a, b) => b.impact_score - a.impact_score);
}
export function calculateAverageImpact(trends) {
    if (trends.length === 0)
        return 0;
    const sum = trends.reduce((acc, t) => acc + t.impact_score, 0);
    return Math.round((sum / trends.length) * 10) / 10;
}
//# sourceMappingURL=trends.js.map
