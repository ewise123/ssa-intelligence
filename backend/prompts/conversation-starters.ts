/**
 * Section 9: Executive Conversation Starters - TypeScript Implementation
 * Links analysis findings to actionable business discussions
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';

export interface FoundationOutput {
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
    id: string;
    citation: string;
    url?: string;
    type: string;
    date: string;
  }>;
}

export interface Section5Output {
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

export interface Section6Output {
  benchmark_summary: {
    key_strengths: Array<{strength: string; description: string; geography_context: string}>;
    key_gaps: Array<{gap: string; description: string; geography_context: string; magnitude: string}>;
    competitive_positioning: string;
  };
}

export interface Section7Output {
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

export interface Section9Input {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  section5?: Section5Output;
  section6?: Section6Output;
  section7?: Section7Output;
  // Optional additional context
  section2?: any;
  section4?: any;
  reportType?: ReportTypeId;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface ConversationStarter {
  title: string;
  question: string;
  supporting_data: string;
  business_value: string;
  ssa_capability?: string;
  supporting_sections: string[];
  sources: string[];
  geography_relevance: string;
}

export interface Section9Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  conversation_starters: ConversationStarter[];
  sources_used: string[];
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

export function buildConversationStartersPrompt(input: Section9Input): string {
  const {
    foundation,
    companyName,
    geography,
    section5,
    section6,
    section7,
    section2,
    section4
  } = input;
  
  const foundationJson = JSON.stringify(foundation, null, 2);
  const section5Json = section5 ? JSON.stringify(section5, null, 2) : 'Not provided';
  const section6Json = section6 ? JSON.stringify(section6, null, 2) : 'Not provided';
  const section7Json = section7 ? JSON.stringify(section7, null, 2) : 'Not provided';
  const section2Json = section2 ? JSON.stringify(section2, null, 2) : 'Not provided';
  const section4Json = section4 ? JSON.stringify(section4, null, 2) : 'Not provided';
  
  const availableSections = [
    'Foundation',
    section2 && 'Section 2 (Financial Snapshot)',
    section4 && 'Section 4 (Segment Analysis)',
    section5 && 'Section 5 (Trends)',
    section6 && 'Section 6 (Peer Benchmarking)',
    section7 && 'Section 7 (SKU Opportunities)'
  ].filter(Boolean).join(', ');
  
  const basePrompt = `# Section 9: Executive Conversation Starters - Synthesis Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 9 (Executive Conversation Starters) by creating 3-5 actionable discussion topics that link findings to business value for **${companyName}** in **${geography}**.

---

## SYNTHESIS SECTION NOTICE

**This section LINKS ANALYSIS TO ACTION.**

**Available sections:** ${availableSections}

---

## INPUT CONTEXT

### Required: Foundation Context

\`\`\`json
${foundationJson}
\`\`\`

### Recommended: Section 5 Context (Trends)

\`\`\`json
${section5Json}
\`\`\`

### Recommended: Section 6 Context (Peer Benchmarking)

\`\`\`json
${section6Json}
\`\`\`

### Recommended: Section 7 Context (SKU Opportunities)

\`\`\`json
${section7Json}
\`\`\`

### Optional: Section 2 Context

\`\`\`json
${section2Json}
\`\`\`

### Optional: Section 4 Context

\`\`\`json
${section4Json}
\`\`\`

---

## CONVERSATION STARTER STRATEGY

**Each conversation starter should:**
1. Reference specific finding from report with data
2. Frame as question or discussion (not presentation)
3. Connect to business value or strategic decision
4. Be ${geography}-specific where possible
5. Link to relevant SSA capability (if Section 7 available)

**Prioritize topics that:**
- Address material business issues
- Have clear financial/operational impact
- Are actionable
- Leverage SSA differentiated capabilities

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface Section9Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  conversation_starters: Array<{
    title: string;
    question: string;
    supporting_data: string;
    business_value: string;
    ssa_capability?: string;
    supporting_sections: string[];
    sources: string[];
    geography_relevance: string;
  }>;
  
  sources_used: string[];
}
\`\`\`

---

## CONVERSATION STARTER TEMPLATES

See prompt documentation for detailed templates:
1. Operational/Financial Gap (from Section 6)
2. Competitive Positioning Concern (from Section 6)
3. Strategic Trend or Opportunity (from Section 5)
4. Operational Performance Issue (from Section 7)

---

## GEOGRAPHY FOCUS (75-80%)

**Every conversation starter must emphasize ${geography}:**

✅ CORRECT: "DSO in **${geography} operations** deteriorated to..."  
❌ WRONG: Generic issues without regional tie-in

---

## QUALITY STANDARDS

**Good conversation starters:**
- Reference specific, quantified findings
- Frame genuine strategic questions
- Connect to clear business value
- Are actionable and timely
- Link to SSA capabilities naturally

---

## VALIDATION CHECKLIST

- [ ] Valid JSON syntax
- [ ] 3-5 conversation starters
- [ ] Each has title (5-10 words)
- [ ] Each has question (2-4 sentences)
- [ ] Each has supporting data with metrics
- [ ] Each has business value statement
- [ ] Each has geography relevance
- [ ] SSA capabilities included where applicable
- [ ] Supporting sections cited
- [ ] Sources cited (S#)
- [ ] 75-80% emphasizes ${geography}

---

## BEGIN SYNTHESIS

**Company:** ${companyName}  
**Geography:** ${geography}  
**Available Sections:** ${availableSections}

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. CREATE CONVERSATION STARTERS NOW.**
`;
  return appendReportTypeAddendum('conversation_starters', input.reportType, basePrompt);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateSection9Output(output: any): output is Section9Output {
  if (!output || typeof output !== 'object') return false;
  
  if (!output.confidence || 
      !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
    return false;
  }
  
  if (!Array.isArray(output.conversation_starters) ||
      output.conversation_starters.length < 3 ||
      output.conversation_starters.length > 5) {
    return false;
  }
  
  for (const starter of output.conversation_starters) {
    if (!starter.title ||
        !starter.question ||
        !starter.supporting_data ||
        !starter.business_value ||
        !Array.isArray(starter.supporting_sections) ||
        !Array.isArray(starter.sources) ||
        !starter.geography_relevance) {
      return false;
    }
  }
  
  if (!Array.isArray(output.sources_used)) return false;
  
  return true;
}

export function formatSection9ForDocument(output: Section9Output): string {
  let markdown = `# 9. Executive Conversation Starters\n\n`;
  markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
  
  for (let i = 0; i < output.conversation_starters.length; i++) {
    const starter = output.conversation_starters[i];
    
    markdown += `### ${i + 1}. ${starter.title}\n\n`;
    markdown += `${starter.question}\n\n`;
    markdown += `**Supporting Data:** ${starter.supporting_data}\n\n`;
    markdown += `**Business Value:** ${starter.business_value}\n\n`;
    
    if (starter.ssa_capability) {
      markdown += `**Relevant SSA Capability:** ${starter.ssa_capability}\n\n`;
    }
    
    markdown += `**Geography Relevance:** ${starter.geography_relevance}\n\n`;
    markdown += `*Supporting Sections: ${starter.supporting_sections.join(', ')}*  \n`;
    markdown += `*Sources: ${starter.sources.join(', ')}*\n\n`;
    markdown += `---\n\n`;
  }
  
  return markdown;
}

/**
 * Filters starters by SSA capability presence
 */
export function getStartersWithSSA(output: Section9Output): ConversationStarter[] {
  return output.conversation_starters.filter(s => s.ssa_capability !== undefined);
}

/**
 * Gets starters referencing specific section
 */
export function getStartersBySection(
  output: Section9Output,
  sectionName: string
): ConversationStarter[] {
  return output.conversation_starters.filter(s =>
    s.supporting_sections.includes(sectionName)
  );
}

/**
 * Extracts all SSA capabilities mentioned
 */
export function getSSACapabilities(output: Section9Output): string[] {
  return output.conversation_starters
    .map(s => s.ssa_capability)
    .filter((c): c is string => c !== undefined);
}
