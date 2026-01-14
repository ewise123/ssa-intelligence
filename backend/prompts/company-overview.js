import { appendReportTypeAddendum } from './report-type-addendums.js';
export function buildCompanyOverviewPrompt(input) {
    const { foundation, companyName, geography } = input;
    const foundationJson = JSON.stringify(foundation, null, 2);
    const basePrompt = `# Section 3: Company Overview - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 3 (Company Overview) with comprehensive business description, geographic footprint, strategic priorities, and leadership for **${companyName}** in **${geography}**.

---

## INPUT CONTEXT (From Foundation)

You have received the following foundation context:

\`\`\`json
${foundationJson}
\`\`\`

---

## RESEARCH REQUIREMENTS

### 1. Business Description (Priority: CRITICAL)

**Search for:**
- "${companyName} company profile"
- "${companyName} 10-K business description" OR "${companyName} annual report"
- "${companyName} investor presentation 2024"
- "${companyName} about us" OR "${companyName} company overview"

**Extract:**
- **Core business:** What products/services the company provides
- **Customer base:** Who they serve (industries, end markets)
- **Business model:** How they make money (product, services, subscription, transaction, recurring revenue)
- **Competitive positioning:** Market position (leader, challenger, niche)
- **Segments:** Primary business segments with brief descriptions
- **Geography presence:** Global footprint and key regions

**Geography focus (75-80%):**
- **${geography}-specific operations:** What they do in the region
- **Regional market position:** Market share or competitive standing
- **Regional customer base:** Key customers or industries served
- **Regional capabilities:** Unique or differentiated offerings in region

### 2. Geographic Footprint (Priority: CRITICAL)

**Search for:**
- "${companyName} ${geography} facilities"
- "${companyName} ${geography} locations" OR "${companyName} ${geography} operations"
- "${companyName} operational footprint"
- "${companyName} global locations 2024"

**Extract for ${geography}:**
- **Core facilities:** Locations, size, products made
- **R&D centers:** Locations, focus areas
- **Distribution centers:** Locations, capabilities
- **Sales offices:** Major office locations
- **Headquarters (if regional):** Location and role
- **Employee count:** ${geography} employees (use foundation if available)
- **Facility capabilities:** Automation, capacity, certifications

**Also note:**
- **Global context:** Total facilities worldwide for comparison
- **Recent changes:** New facilities, closures, expansions in ${geography}
- **Strategic importance:** How ${geography} fits in global footprint

### 3. Strategic Priorities (Priority: HIGH)

**Search for:**
- "${companyName} strategic priorities 2024"
- "${companyName} earnings transcript strategic initiatives"
- "${companyName} investor day presentation"
- "${companyName} CEO letter shareholders"
- "${companyName} ${geography} investment" OR "${companyName} ${geography} strategy"

**Extract:**
- **Company-wide priorities:** 3-5 key strategic themes
  - Examples: Digital transformation, sustainability, portfolio optimization, M&A
- **Investment areas:** Where capital is being deployed
  - R&D, capacity expansion, technology, M&A
- **Strategic initiatives:** Specific programs or projects
  - New product launches, efficiency programs, market expansion
- **${geography}-specific strategy:** Regional priorities or investments
  - Capacity additions, market penetration, customer wins
- **Management emphasis:** What leadership talks about most

**Time focus:** Last 12-18 months of announcements and priorities

### 4. Key Leadership (Priority: MEDIUM)

**Search for:**
- "${companyName} executive team"
- "${companyName} proxy statement DEF 14A"
- "${companyName} leadership bios"
- "${companyName} ${geography} leadership" OR "${companyName} regional management"

**Extract:**
- **C-suite:** CEO, CFO, COO (names and brief background)
- **Segment leaders:** Presidents/VPs of major business segments
- **Regional leaders:** ${geography} country manager, regional president
  - Name, title, tenure, background
- **Recent changes:** New hires, departures, reorganizations (last 12 months)

**Note:** Focus on leaders relevant to ${geography} operations or with P&L responsibility

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface Section3Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  business_description: {
    overview: string;        // 4-6 sentences, see requirements below
    segments: Array<{
      name: string;
      description: string;   // 2-3 sentences
      revenue_pct: number | null;
      geography_relevance: string; // How segment operates in {geography}
    }>;
    geography_positioning: string; // 3-4 sentences on regional market position
  };
  
  geographic_footprint: {
    summary: string; // 3-4 sentences
    facilities: Array<{
      name: string;
      location: string;       // City, ${geography}
      type: 'Manufacturing' | 'R&D' | 'Distribution' | 'Office' | 'Headquarters';
      description: string;    // 1-2 sentences on capabilities
      employees?: number;
      source: string;         // single S# (e.g., "S3")
    }>;
    regional_stats: {
      total_facilities: number;
      total_employees: number | null;
      global_facilities_comparison: string; // e.g., "12 of 85 global facilities"
    };
  };
  
  strategic_priorities: {
    summary: string; // 2-3 sentences on overall strategic direction
    priorities: Array<{
      priority: string;       // Title of priority
      description: string;    // 2-3 sentences
      geography_relevance: 'High' | 'Medium' | 'Low'; // Relevance to ${geography}
      geography_details?: string; // If relevant, specific ${geography} initiatives
      source: string;
    }>;
    geography_specific_initiatives: string[]; // Bullet points of ${geography} investments/initiatives
  };
  
  key_leadership: {
    executives: Array<{
      name: string;
      title: string;
      background: string;     // 1 sentence
      tenure?: string;        // "Since 2020" or "3 years"
      geography_relevance: 'High' | 'Medium' | 'Low';
      source: string;
    }>;
    regional_leaders: Array<{
      name: string;
      title: string;
      background: string;
      source: string;
    }>;
  };
  
  sources_used: string[];
}
\`\`\`

---

## SUBSECTION REQUIREMENTS

### 3.1 Business Description

**Overview paragraph (4-6 sentences):**

1. **Company core business** (1-2 sentences)
   - "${companyName} is a global provider of products and services across multiple end markets, with a portfolio spanning priority business lines (S1)."

2. **Revenue/scale** (1 sentence)
   - "The company generated $18.5B in revenue in FY2024 with 58,000 employees globally (S1)."

3. **${geography} operations** (2-3 sentences - 75-80% FOCUS)
   - "**${geography} operations** represent 18% of global revenue with 12 facilities and 4,200 employees concentrated in priority business lines (S1, S3)."
   - "The region serves primarily enterprise and commercial customers, with strong presence in automotive and machine building markets (S3)."

**Segment descriptions:**
- For EACH major segment (typically 3-5 segments)
- 2-3 sentences per segment
- Include revenue % of total if available
- **Critical:** Add "geography_relevance" field explaining ${geography} presence
  - "Hydraulics segment has 8 Core facilities in ${geography}, representing 25% of segment global capacity (S3)"

**Geography positioning paragraph (3-4 sentences):**
- Market position in ${geography}
- Key competitors in region
- Competitive advantages specific to ${geography}
- Market share data if available

### 3.2 Geographic Footprint

**Summary (3-4 sentences):**
- Total facilities in ${geography}
- Types of facilities (operations, R&D, distribution, offices)
- Major facility locations
- Recent expansions or changes
- **Compare to global:** "${geography} hosts 12 of 85 global Core facilities (14% of footprint) (S1, S3)"

**Facilities array:**
- List ALL ${geography} facilities (use foundation data + new research)
- For each: name, location (city), type, capabilities, employee count if available
- Source every facility mention

**Regional stats:**
- Total facilities count
- Total employees (use foundation if available)
- Global comparison context

### 3.3 Strategic Priorities

**Summary (2-3 sentences):**
- Overarching strategic direction
- Key themes from recent communications
- Time horizon (e.g., "3-year transformation plan")

**Priorities array (3-5 priorities):**
- Each priority: title, description, geography relevance
- **Geography relevance:**
  - **High:** Direct impact on ${geography} (investment, expansion, program)
  - **Medium:** Indirect relevance (global program with regional component)
  - **Low:** Minimal ${geography} connection
- If High or Medium, add "geography_details" with specifics

**Geography-specific initiatives (bullet array):**
- ONLY initiatives that specifically mention ${geography}
- Examples:
  - "€75M capacity expansion in Stuttgart, completion Q4 2025 (S8)"
  - "New R&D center in Munich focusing on sustainable aviation, 150 engineers (S12)"

### 3.4 Key Leadership

**Executives array (5-8 leaders):**
- Focus on C-suite and segment/regional leaders
- Geography relevance:
  - **High:** Regional president, country manager, ${geography}-based leaders
  - **Medium:** Segment leader with large ${geography} operations
  - **Low:** Corporate executive with no direct regional role

**Regional leaders array (2-5 leaders):**
- ONLY leaders based in or directly responsible for ${geography}
- Country president, regional VP, site leaders
- Include brief background (1 sentence)

---

## GEOGRAPHY FOCUS REQUIREMENT (75-80%)

**Every subsection must emphasize ${geography}:**

**CORRECT patterns:**

**3.1 Business Description:**
- "**${geography}** operations focus on priority business lines, serving core regional customers and partners..."
- "Regional market position is #2 in a key segment, with estimated 18% market share (S7)..."

**3.2 Geographic Footprint:**
- "**${geography}** hosts 12 Core facilities concentrated in southern region..."
- "Largest regional operations site employs 850 people with leading utilization metrics (S3)..."

**3.3 Strategic Priorities:**
- "Digital transformation priority includes €25M investment in ${geography} process automation (S5)..."
- "**${geography}** is pilot region for AI-powered predictive maintenance program across 6 facilities (S8)..."

**3.4 Key Leadership:**
- "Regional President Klaus Schmidt (8 years tenure) leads ${geography} operations with P&L responsibility for €1.2B revenue (S4)..."

**WRONG patterns:**
- "Company operates 85 facilities globally..." [No regional context]
- "Strategic priorities include digital transformation and sustainability..." [No geography mention]
- "CEO has 25 years experience..." [Not geography-relevant unless regional role]

---

## SOURCE CITATION REQUIREMENTS

**Follow style guide Section 5:**

1. **Source IDs must be S# only.** Reuse IDs from \`foundation.source_catalog\`; do **not** renumber existing sources.
2. **New sources must continue numbering** after the highest existing S#. If foundation ends at S7, your next new source is S8, then S9, etc.
3. **One source per field.** Every \`source\` field must be a single S# (no commas or ranges). If multiple sources apply, pick the most authoritative for the field and list all relevant S# in \`sources_used\`.
4. **Source every factual claim** - no unsourced statements.
5. **Use (S#) format in prose** and S# strings in arrays: \`"source": "S3"\` and \`sources_used: ["S1","S3","S8"]\`.
6. **Never invent IDs or use non-S formats.** Only S# strings are valid.

---

## CONFIDENCE SCORING

**HIGH:**
- Recent 10-K with detailed business description
- ${geography}-specific facility data available
- Recent strategic announcements mentioning region
- Leadership information current and detailed

**MEDIUM:**
- General business description available but dated
- Some ${geography} facility data from multiple sources
- Strategic priorities identified but limited regional detail
- Basic leadership information available

**LOW:**
- Limited public information (private company)
- No ${geography}-specific detail in public sources
- Strategic priorities unclear or outdated
- Leadership information sparse or unavailable

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] Business overview is 4-6 sentences
- [ ] All segments have geography_relevance field
- [ ] Geographic footprint includes facilities array
- [ ] Regional stats include global comparison
- [ ] Strategic priorities rated for geography relevance
- [ ] Geography-specific initiatives array populated
- [ ] Leadership includes geography relevance ratings
- [ ] Regional leaders array populated (if leaders identified)
- [ ] 75-80% of content emphasizes ${geography}
- [ ] All claims cited with sources
- [ ] Sources_used array complete

---

## CRITICAL REMINDERS

1. **Follow style guide** for all formatting
2. **75-80% geography focus** in every subsection
3. **Source every claim** with S# references
4. **Use "–" or null** for unavailable data
5. **Geography relevance** ratings required for segments, priorities, leadership
6. **Valid JSON only** - no markdown backticks
7. **Exact schema match** - follow TypeScript interface
8. **Facilities array** must include all ${geography} locations

---

## BEGIN RESEARCH

**Company:** ${companyName}  
**Geography:** ${geography}  
**Foundation Context:** [Provided above]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
`;
    return appendReportTypeAddendum('company_overview', input.reportType, basePrompt);
}
export function validateSection3Output(output) {
    if (!output || typeof output !== 'object')
        return false;
    if (!output.confidence ||
        !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
        return false;
    }
    if (!output.business_description ||
        typeof output.business_description.overview !== 'string' ||
        !Array.isArray(output.business_description.segments) ||
        typeof output.business_description.geography_positioning !== 'string') {
        return false;
    }
    if (!output.geographic_footprint ||
        typeof output.geographic_footprint.summary !== 'string' ||
        !Array.isArray(output.geographic_footprint.facilities) ||
        !output.geographic_footprint.regional_stats) {
        return false;
    }
    if (!output.strategic_priorities ||
        typeof output.strategic_priorities.summary !== 'string' ||
        !Array.isArray(output.strategic_priorities.priorities) ||
        !Array.isArray(output.strategic_priorities.geography_specific_initiatives)) {
        return false;
    }
    if (!output.key_leadership ||
        !Array.isArray(output.key_leadership.executives) ||
        !Array.isArray(output.key_leadership.regional_leaders)) {
        return false;
    }
    if (!Array.isArray(output.sources_used))
        return false;
    return true;
}
export function formatSection3ForDocument(output) {
    let markdown = `# 3. Company Overview\n\n`;
    markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
    markdown += `## 3.1 Business Description\n\n`;
    markdown += `${output.business_description.overview}\n\n`;
    for (const segment of output.business_description.segments) {
        markdown += `**${segment.name}**${segment.revenue_pct ? ` (${segment.revenue_pct}% of revenue)` : ''}: `;
        markdown += `${segment.description} ${segment.geography_relevance}\n\n`;
    }
    markdown += `**Market Positioning:** ${output.business_description.geography_positioning}\n\n`;
    markdown += `## 3.2 Geographic Footprint\n\n`;
    markdown += `${output.geographic_footprint.summary}\n\n`;
    markdown += `**Key Facilities:**\n\n`;
    for (const facility of output.geographic_footprint.facilities) {
        markdown += `- **${facility.name}** (${facility.location}, ${facility.type}): `;
        markdown += `${facility.description}`;
        if (facility.employees)
            markdown += ` Employees: ${facility.employees}.`;
        markdown += ` (${facility.source})\n`;
    }
    markdown += `\n## 3.3 Strategic Priorities\n\n`;
    markdown += `${output.strategic_priorities.summary}\n\n`;
    for (const priority of output.strategic_priorities.priorities) {
        markdown += `**${priority.priority}** (Geography Relevance: ${priority.geography_relevance}): `;
        markdown += `${priority.description}`;
        if (priority.geography_details) {
            markdown += ` ${priority.geography_details}`;
        }
        markdown += ` (${priority.source})\n\n`;
    }
    if (output.strategic_priorities.geography_specific_initiatives.length > 0) {
        markdown += `**Geography-Specific Initiatives:**\n\n`;
        for (const initiative of output.strategic_priorities.geography_specific_initiatives) {
            markdown += `- ${initiative}\n`;
        }
        markdown += `\n`;
    }
    markdown += `## 3.4 Key Leadership\n\n`;
    markdown += `**Corporate Executives:**\n\n`;
    for (const exec of output.key_leadership.executives) {
        markdown += `- **${exec.name}**, ${exec.title}`;
        if (exec.tenure)
            markdown += ` (${exec.tenure})`;
        markdown += `: ${exec.background} `;
        markdown += `(Geography Relevance: ${exec.geography_relevance}) (${exec.source})\n`;
    }
    if (output.key_leadership.regional_leaders.length > 0) {
        markdown += `\n**Regional Leaders:**\n\n`;
        for (const leader of output.key_leadership.regional_leaders) {
            markdown += `- **${leader.name}**, ${leader.title}: ${leader.background} (${leader.source})\n`;
        }
    }
    return markdown;
}
//# sourceMappingURL=company-overview.js.map

