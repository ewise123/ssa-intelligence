import { appendReportTypeAddendum } from './report-type-addendums.js';
export function buildExecSummaryPrompt(input) {
    const { foundation, companyName, geography, section2, section3, section4, section5, section6, section7, section8 } = input;
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

## BEGIN SYNTHESIS

**Company:** ${companyName}  
**Geography:** ${geography}  
**Available Sections:** ${availableSections}

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. SYNTHESIZE KEY FINDINGS NOW.**
`;
    return appendReportTypeAddendum('exec_summary', input.reportType, basePrompt);
}
export function validateSection1Output(output) {
    if (!output || typeof output !== 'object')
        return false;
    if (!output.confidence ||
        !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
        return false;
    }
    if (!Array.isArray(output.bullet_points) ||
        output.bullet_points.length < 5 ||
        output.bullet_points.length > 7) {
        return false;
    }
    const validCategories = [
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
    if (!Array.isArray(output.sources_used))
        return false;
    return true;
}
export function formatSection1ForDocument(output) {
    let markdown = `# 1. Executive Summary\n\n`;
    markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
    for (const item of output.bullet_points) {
        markdown += `- ${item.bullet}\n`;
    }
    markdown += `\n`;
    return markdown;
}
export function getBulletsByCategory(output, category) {
    return output.bullet_points.filter(b => b.category === category);
}
export function getReferencedSections(output) {
    const sections = new Set();
    for (const bullet of output.bullet_points) {
        bullet.supporting_sections.forEach(s => sections.add(s));
    }
    return Array.from(sections).sort();
}
export function getGeographyBullets(output) {
    return output.bullet_points.filter(b => b.category === 'Geography' ||
        b.bullet.toLowerCase().includes('german') ||
        b.bullet.toLowerCase().includes('region'));
}
//# sourceMappingURL=exec-summary.js.map
