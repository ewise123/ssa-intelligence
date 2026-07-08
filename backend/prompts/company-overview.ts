/**
 * Section 3: Company Overview - TypeScript Implementation
 * Generates prompt and types for Company Overview section
 */

// ============================================================================
// INPUT TYPES (reuse from section-02)
// ============================================================================

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface Section3Input {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  reportType?: ReportTypeId;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface Section3Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  business_description: {
    overview: string;
    segments: Array<{
      name: string;
      description: string;
      revenue_pct: number | null;
      geography_relevance: string;
    }>;
    geography_positioning: string;
  };
  
  geographic_footprint: {
    summary: string;
    facilities: Array<{
      name: string;
      location: string;
      type: 'Manufacturing' | 'R&D' | 'Distribution' | 'Office' | 'Headquarters';
      description: string;
      employees?: number | null;
      source: string;
    }>;
    regional_stats: {
      total_facilities: number;
      total_employees: number | null;
      global_facilities_comparison: string;
    };
  };
  
  strategic_priorities: {
    summary: string;
    priorities: Array<{
      priority: string;
      description: string;
      geography_relevance: 'High' | 'Medium' | 'Low';
      geography_details?: string;
      source: string;
    }>;
    geography_specific_initiatives: string[];
  };
  
  key_leadership: {
    summary: string;  // 1-2 sentences noting top leadership; detailed profiles in Key Execs section
    executives: Array<{
      name: string;
      title: string;
      tenure?: string;
      source: string;
    }>;
    regional_leader?: {
      name: string;
      title: string;
      source: string;
    } | null;
  };
  
  sources_used: string[];
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

export function buildCompanyOverviewPrompt(input: Section3Input): string {
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
- "${companyName} latest investor presentation"
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
- "${companyName} global locations"

**Extract for ${geography}:**
- **Core facilities:** Locations, size, outputs/services
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
- "${companyName} strategic priorities"
- "${companyName} earnings transcript strategic initiatives"
- "${companyName} investor day presentation"
- "${companyName} CEO letter shareholders"
- "${companyName} ${geography} investment" OR "${companyName} ${geography} strategy"

**Extract:**
- **Company-wide priorities:** 3-8 key strategic themes
  - Examples: Digital transformation, sustainability, portfolio optimization, M&A
- **Investment areas:** Where capital is being deployed
  - R&D, capacity expansion, technology, M&A
- **Strategic initiatives:** Specific programs or projects
  - New product launches, efficiency programs, market expansion
- **${geography}-specific strategy:** Regional priorities or investments
  - Capacity additions, market penetration, customer wins
- **Management emphasis:** What leadership talks about most

**Time focus:** Use the time horizon provided in report inputs.

### 4. Key Leadership (Priority: LOW)

**Note:** This subsection provides brief context only. For detailed executive profiles, board composition, and performance initiatives, see the **Key Execs and Board Members** section.

**Search for:**
- "${companyName} executive team"
- "${companyName} ${geography} leadership"

**Extract (brief list only):**
- **CEO:** Name and tenure
- **CFO:** Name and tenure
- **Regional leader (if known):** ${geography} country manager or regional president

**Keep it simple:** Just names, titles, and tenure. No detailed backgrounds here.

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
      employees?: number | null;
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
    summary: string;          // 1-2 sentences; note detailed profiles in Key Execs section
    executives: Array<{
      name: string;
      title: string;
      tenure?: string;        // "Since 2020" or "3 years"
      source: string;
    }>;
    regional_leader?: {       // Optional: ${geography} country manager or regional president
      name: string;
      title: string;
      source: string;
    } | null;
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
   - "The company generated $18.5B in revenue in the latest fiscal year with 58,000 employees globally (S1)."

3. **${geography} operations** (2-3 sentences - 75-80% FOCUS)
   - "**${geography} operations** represent 18% of global revenue with 12 facilities and 4,200 employees concentrated in priority business lines (S1, S3)."
   - "The region serves primarily enterprise and commercial customers, with strength in key verticals noted in filings (S3)."

**Segment descriptions:**
- For EACH major segment (typically 3-5 segments)
- 2-3 sentences per segment
- Include revenue % of total if available
- **Critical:** Add "geography_relevance" field explaining ${geography} presence
  - "Segment A has 8 facilities in ${geography}, representing 25% of segment global capacity (S3)"

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
- **Compare to global:** "${geography} hosts 12 of 85 global facilities (14% of footprint) (S1, S3)"

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

**Priorities array (3-8 priorities):**
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

**Note:** This is a brief overview only. Detailed executive profiles belong in the **Key Execs and Board Members** section.

**Summary (1-2 sentences):**
- Note the CEO and key leadership context
- Reference Key Execs section for detailed profiles

**Executives array (2-3 leaders max):**
- CEO with tenure
- CFO with tenure
- COO or other key C-suite (if notable)

**Regional leader (optional):**
- Include ONLY if a ${geography}-specific leader is clearly identified
- Just name, title, source - no detailed background

---

## GEOGRAPHY FOCUS REQUIREMENT (75-80%)

**Every subsection must emphasize ${geography}:**

✅ **CORRECT patterns:**

**3.1 Business Description:**
- "**${geography}** operations focus on priority business lines, serving core regional customers and partners..."
- "Regional market position is #2 in a key segment, with estimated 18% market share (S7)..."

**3.2 Geographic Footprint:**
- "**${geography}** hosts 12 facilities concentrated in southern region..."
- "Largest regional operations site employs 850 people with leading utilization metrics (S3)..."

**3.3 Strategic Priorities:**
- "Digital transformation priority includes €25M investment in ${geography} process automation (S5)..."
- "**${geography}** is pilot region for AI-powered predictive maintenance program across 6 facilities (S8)..."

**3.4 Key Leadership:**
- "CEO Jane Smith (since 2019) and CFO John Doe (since 2021) lead the company. For detailed profiles, see Key Execs and Board Members section."

❌ **WRONG patterns:**
- "Company operates 85 facilities globally..." [No regional context]
- "Strategic priorities include digital transformation and sustainability..." [No geography mention]
- Detailed executive backgrounds in this section [Belongs in Key Execs section]

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
- [ ] Leadership summary references Key Execs section
- [ ] Executives array limited to 2-3 top leaders (CEO, CFO)
- [ ] 75-80% of content emphasizes ${geography}
- [ ] All claims cited with sources
- [ ] Sources_used array complete

---

## CRITICAL REMINDERS

1. **Follow style guide:** All formatting rules apply
2. **Valid JSON only:** No markdown, no headings, no prose outside JSON
3. **Source everything:** No unsourced claims
4. **Geography focus:** Emphasize the target geography throughout
5. **Exact schema match:** Follow the TypeScript interface exactly
6. **Use null** for unavailable data
7. **Geography relevance** ratings required for segments and priorities
8. **Facilities array** must include all ${geography} locations
9. **Key leadership** is brief; detailed profiles go in Key Execs and Board Members section

---

## HANDLING MISSING INFORMATION (CRITICAL)

**For private companies or when data cannot be found:**
- **Do NOT fabricate placeholder entries.** Never return entries with names like "Information Not Available", "Not Disclosed", "Unknown", or similar placeholders in any array (executives, facilities, priorities, segments).
- **Return empty arrays** for any category where no real data can be identified (e.g., empty \`executives\` array, empty \`priorities\` array).
- **Use the relevant summary/overview field** to explain what information is missing and why.
- **Set confidence.level to "LOW"** with a clear reason explaining the data limitation.
- **Use \`null\`** for unavailable numeric data (not 0, not -1, not "–").

**This rule supersedes minimum item counts** — it is better to return an empty array with a clear summary than to invent placeholder entries.

---

## BEGIN RESEARCH

**Company:** ${companyName}  
**Geography:** ${geography}  
**Foundation Context:** [Provided above]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
`;
  return appendReportTypeAddendum('company_overview', input.reportType, basePrompt);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateSection3Output(output: any): output is Section3Output {
  if (!output || typeof output !== 'object') return false;
  
  // Check confidence
  if (!output.confidence || 
      !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level)) {
    return false;
  }
  
  // Check business_description
  if (!output.business_description ||
      typeof output.business_description.overview !== 'string' ||
      !Array.isArray(output.business_description.segments) ||
      typeof output.business_description.geography_positioning !== 'string') {
    return false;
  }
  
  // Check geographic_footprint
  if (!output.geographic_footprint ||
      typeof output.geographic_footprint.summary !== 'string' ||
      !Array.isArray(output.geographic_footprint.facilities) ||
      !output.geographic_footprint.regional_stats) {
    return false;
  }
  
  // Check strategic_priorities
  if (!output.strategic_priorities ||
      typeof output.strategic_priorities.summary !== 'string' ||
      !Array.isArray(output.strategic_priorities.priorities) ||
      !Array.isArray(output.strategic_priorities.geography_specific_initiatives)) {
    return false;
  }
  
  // Check key_leadership
  if (!output.key_leadership ||
      typeof output.key_leadership.summary !== 'string' ||
      !Array.isArray(output.key_leadership.executives)) {
    return false;
  }
  
  // Check sources
  if (!Array.isArray(output.sources_used)) return false;
  
  return true;
}

export function formatSection3ForDocument(output: Section3Output): string {
  let markdown = `# 3. Company Overview\n\n`;
  markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
  
  // 3.1 Business Description
  markdown += `## 3.1 Business Description\n\n`;
  markdown += `${output.business_description.overview}\n\n`;
  
  for (const segment of output.business_description.segments) {
    markdown += `**${segment.name}**${segment.revenue_pct != null ? ` (${segment.revenue_pct}% of revenue)` : ''}: `;
    markdown += `${segment.description} ${segment.geography_relevance}\n\n`;
  }
  
  markdown += `**Market Positioning:** ${output.business_description.geography_positioning}\n\n`;
  
  // 3.2 Geographic Footprint
  markdown += `## 3.2 Geographic Footprint\n\n`;
  markdown += `${output.geographic_footprint.summary}\n\n`;
  markdown += `**Key Facilities:**\n\n`;
  
  for (const facility of output.geographic_footprint.facilities) {
    markdown += `- **${facility.name}** (${facility.location}, ${facility.type}): `;
    markdown += `${facility.description}`;
    if (facility.employees != null) markdown += ` Employees: ${facility.employees}.`;
    markdown += ` (${facility.source})\n`;
  }
  
  // 3.3 Strategic Priorities
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
  
  // 3.4 Key Leadership
  markdown += `## 3.4 Key Leadership\n\n`;
  markdown += `${output.key_leadership.summary}\n\n`;

  for (const exec of output.key_leadership.executives) {
    markdown += `- **${exec.name}**, ${exec.title}`;
    if (exec.tenure) markdown += ` (${exec.tenure})`;
    markdown += ` (${exec.source})\n`;
  }

  if (output.key_leadership.regional_leader) {
    markdown += `\n**Regional Leader:** `;
    markdown += `${output.key_leadership.regional_leader.name}, `;
    markdown += `${output.key_leadership.regional_leader.title} `;
    markdown += `(${output.key_leadership.regional_leader.source})\n`;
  }
  
  return markdown;
}

