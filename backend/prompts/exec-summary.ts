/**
 * Section 1: Executive Summary - TypeScript Implementation
 * Synthesizes findings from all completed sections
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

// Import output types from other sections
export interface Section2Output {
  confidence: {level: string; reason: string};
  summary: string;
  kpi_table: {metrics: Array<any>};
}

export interface Section3Output {
  business_description: {
    overview: string;
    segments: Array<any>;
    geography_positioning: string;
  };
  strategic_priorities: {
    summary: string;
    priorities: Array<any>;
  };
}

export interface Section4Output {
  overview: string;
  segments: Array<{
    name: string;
    performance_analysis: {paragraphs: string[]; key_drivers: string[]};
  }>;
}

export interface Section5Output {
  aggregate_summary: string;
  company_trends: {
    summary: string;
    trends: Array<{trend: string; direction: string; impact_score: number; geography_relevance: string}>;
  };
}

export interface Section6Output {
  benchmark_summary: {
    overall_assessment: string;
    key_strengths: Array<{strength: string; geography_context: string}>;
    key_gaps: Array<{gap: string; magnitude: string; geography_context: string}>;
    competitive_positioning: string;
  };
}

export interface Section7Output {
  opportunities: Array<{
    issue_area: string;
    priority: string;
    severity: number;
    geography_relevance: string;
  }>;
}

export interface Section8Output {
  news_items: Array<{
    date: string;
    headline: string;
    category: string;
    geography_relevance: string;
  }>;
}

export interface Section1Input {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  section2: Section2Output; // REQUIRED
  section3: Section3Output; // REQUIRED
  section4?: Section4Output;
  section5?: Section5Output;
  section6?: Section6Output;
  section7?: Section7Output;
  section8?: Section8Output;
  reportType?: ReportTypeId;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export type BulletCategory = 
  | 'Geography'
  | 'Financial'
  | 'Strategic'
  | 'Competitive'
  | 'Risk'
  | 'Momentum';

export interface ExecutiveBullet {
  bullet: string;
  category: BulletCategory;
  supporting_sections: string[];
  sources: string[];
}

export interface Section1Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  bullet_points: ExecutiveBullet[];
  sources_used: string[];
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

export function buildExecSummaryPrompt(input: Section1Input): string {
  const { 
    foundation, 
    companyName, 
    geography, 
    section2, 
    section3,
    section4,
    section5,
    section6,
    section7,
    section8
  } = input;
  
  const foundationJson = JSON.stringify(foundation, null, 2);
  const section2Json = JSON.stringify(section2, null, 2);
  const section3Json = JSON.stringify(section3, null, 2);
  const section4Json = section4 ? JSON.stringify(section4, null, 2) : 'Not provided';
  const section5Json = section5 ? JSON.stringify(section5, null, 2) : 'Not provided';
  const section6Json = section6 ? JSON.stringify(section6, null, 2) : 'Not provided';
  const section7Json = section7 ? JSON.stringify(section7, null, 2) : 'Not provided';
  const section8Json = section8 ? JSON.stringify(section8, null, 2) : 'Not provided';
  
  const availableSections = [
    'Foundation',
    'Section 2 (Financial Snapshot)',
    'Section 3 (Company Overview)',
    section4 && 'Section 4 (Segment Analysis)',
    section5 && 'Section 5 (Trends)',
    section6 && 'Section 6 (Peer Benchmarking)',
    section7 && 'Section 7 (SKU Opportunities)',
    section8 && 'Section 8 (Recent News)'
  ].filter(Boolean).join(', ');
  
  const basePrompt = `# Section 1: Executive Summary - Synthesis Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 1 (Executive Summary) by synthesizing key findings from ALL completed sections for **${companyName}** in **${geography}**.

---

## SYNTHESIS SECTION NOTICE

**This section SYNTHESIZES findings from other sections.**

**Available sections:** ${availableSections}

---

## INPUT CONTEXT

### Required: Foundation Context

\`\`\`json
${foundationJson}
\`\`\`

### REQUIRED: Section 2 Context (Financial Snapshot)

\`\`\`json
${section2Json}
\`\`\`

### REQUIRED: Section 3 Context (Company Overview)

\`\`\`json
${section3Json}
\`\`\`

### Optional: Section 4 Context (Segment Analysis)

\`\`\`json
${section4Json}
\`\`\`

### Optional: Section 5 Context (Trends)

\`\`\`json
${section5Json}
\`\`\`

### Optional: Section 6 Context (Peer Benchmarking)

\`\`\`json
${section6Json}
\`\`\`

### Optional: Section 7 Context (SKU Opportunities)

\`\`\`json
${section7Json}
\`\`\`

### Optional: Section 8 Context (Recent News)

\`\`\`json
${section8Json}
\`\`\`

---

## SYNTHESIS STRATEGY

Review ALL provided section contexts and identify:

1. **Geography headline:** Most important finding about ${geography} operations
2. **Financial signals:** Key performance metrics and trends
3. **Strategic posture:** Major initiatives or shifts
4. **Competitive position:** Standing vs. peers in ${geography}
5. **Key risks:** 2-3 most material headwinds
6. **Momentum assessment:** Positive, stable, or negative trajectory

**Prioritize:**
- Geography-specific findings (75-80%)
- Material business impacts
- Recent developments
- Quantified insights

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface Section1Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  bullet_points: Array<{
    bullet: string;
    category: 'Geography' | 'Financial' | 'Strategic' | 'Competitive' | 'Risk' | 'Momentum';
    supporting_sections: string[];
    sources: string[];
  }>;
  
  sources_used: string[];
}
\`\`\`

---

## OUTPUT FORMAT RULES

**Valid JSON only:** No markdown, no headings, no prose outside the JSON object.

---

## BULLET POINT REQUIREMENTS

**Format:** 5-7 bullet points total

**Bullet count (STRICT):** Return 5-7 total (target 6). If you draft more than 7, MERGE or CONSOLIDATE lowest-priority or overlapping bullets so the final list is ≤7. Never exceed 7 in the final JSON.

**Required bullets (in order):**

1. **Geography Headline** (Category: Geography)
   - Lead with most impactful ${geography}-specific finding
   - Include: Regional revenue/scale, growth rate, strategic importance
   
2-3. **Financial Performance** (Category: Financial)
   - Mix of growth, profitability, cash/working capital
   - Emphasize ${geography} context
   
4. **Strategic Posture** (Category: Strategic)
   - Recent strategic moves or priorities
   - Emphasize ${geography}-specific initiatives
   
5. **Competitive Position** (Category: Competitive) - Recommended
   - Standing vs. peers in ${geography}
   
6-7. **Key Risks** (Category: Risk) - 1-2 bullets
   - Most material risks or headwinds
   - Emphasize ${geography}-specific or regionally acute
   
Final. **Momentum Assessment** (Category: Momentum) - Recommended
   - Overall trajectory with supporting evidence

---

## SYNTHESIS GUIDELINES

**Section 2:** Pull regional revenue, growth, margins vs benchmarks  
**Section 3:** Pull geography positioning, strategic priorities  
**Section 4:** Pull segment performance in ${geography}  
**Section 5:** Pull high-impact trends (score 7+), aggregate summary  
**Section 6:** Pull overall assessment, competitive positioning, key gaps  
**Section 7:** Pull high-priority opportunities with geography relevance  
**Section 8:** Pull high-impact news (Investment, M&A categories)

---

## GEOGRAPHY FOCUS (75-80%)

**Every bullet must connect to ${geography}:**

✅ CORRECT: "**${geography} operations** generated..."  
❌ WRONG: Pure global statements without regional connection

---

## VALIDATION CHECKLIST

- [ ] Valid JSON syntax
- [ ] 5-7 bullet points total
- [ ] Bullet 1 is geography headline
- [ ] Each bullet cites supporting sections
- [ ] Each bullet cites sources (S#)
- [ ] 75-80% emphasizes ${geography}
- [ ] Categories assigned correctly

---

## CRITICAL REMINDERS

1. Follow style guide: All formatting rules apply
2. Valid JSON only: No markdown, no headings, no prose outside JSON
3. Source everything: No unsourced claims
4. Geography focus: Emphasize the target geography throughout
5. Exact schema match: Follow the TypeScript interface exactly

---

## BEGIN SYNTHESIS

**Company:** ${companyName}  
**Geography:** ${geography}  
**Available Sections:** ${availableSections}

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. SYNTHESIZE KEY FINDINGS NOW.**
`;
  return appendReportTypeAddendum('exec_summary', input.reportType, basePrompt);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateSection1Output(output: any): output is Section1Output {
  if (!output || typeof output !== 'object') return false;
  
  if (!output.confidence || 
      !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
    return false;
  }
  
  if (!Array.isArray(output.bullet_points) || 
      output.bullet_points.length < 5 || 
      output.bullet_points.length > 7) {
    return false;
  }
  
  const validCategories: BulletCategory[] = [
    'Geography', 'Financial', 'Strategic', 'Competitive', 'Risk', 'Momentum'
  ];
  
  for (const bullet of output.bullet_points) {
    if (!bullet.bullet || 
        !bullet.category ||
        !Array.isArray(bullet.supporting_sections) ||
        !Array.isArray(bullet.sources)) {
      return false;
    }
    
    if (!validCategories.includes(bullet.category)) {
      return false;
    }
  }
  
  if (!Array.isArray(output.sources_used)) return false;
  
  return true;
}

export function formatSection1ForDocument(output: Section1Output): string {
  let markdown = `# 1. Executive Summary\n\n`;
  markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
  
  for (const item of output.bullet_points) {
    markdown += `- ${item.bullet}\n`;
  }
  
  markdown += `\n`;
  
  return markdown;
}

/**
 * Gets bullets by category
 */
export function getBulletsByCategory(
  output: Section1Output,
  category: BulletCategory
): ExecutiveBullet[] {
  return output.bullet_points.filter(b => b.category === category);
}

/**
 * Extracts all unique section references
 */
export function getReferencedSections(output: Section1Output): string[] {
  const sections = new Set<string>();
  for (const bullet of output.bullet_points) {
    bullet.supporting_sections.forEach(s => sections.add(s));
  }
  return Array.from(sections).sort();
}

/**
 * Gets geography-specific bullets
 */
export function getGeographyBullets(output: Section1Output): ExecutiveBullet[] {
  return output.bullet_points.filter(b => 
    b.category === 'Geography' || 
    b.bullet.toLowerCase().includes('german') ||
    b.bullet.toLowerCase().includes('region')
  );
}
