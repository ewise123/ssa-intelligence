import { appendReportTypeAddendum } from './report-type-addendums.js';
export function buildKeyExecsAndBoardPrompt(input) {
    const { foundation, companyName, geography } = input;
    const foundationJson = JSON.stringify(foundation, null, 2);
    const basePrompt = `# Key Execs and Board Members - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate the Key Execs and Board Members section with comprehensive coverage of board composition, C-suite leadership, and business unit/division leaders for **${companyName}** with context relevant to **${geography}**.

---

## INPUT CONTEXT (From Foundation)

You have received the following foundation context:

\`\`\`json
${foundationJson}
\`\`\`

---

## RESEARCH REQUIREMENTS

### 1. Board of Directors (Priority: HIGH)

**Search for:**
- "${companyName} board of directors"
- "${companyName} proxy statement DEF 14A board"
- "${companyName} corporate governance"
- "${companyName} annual report board composition"

**Extract for EACH board member:**
- **Name:** Full name
- **Role:** Chairman, Lead Independent Director, Independent Director, Inside Director, etc.
- **Committee memberships:** Audit, Compensation, Nominating/Governance, Risk, etc.
- **Background:** 2-3 sentences on relevant experience (prior executive roles, industry expertise, board experience)
- **Tenure:** How long on the board (e.g., "Since 2019" or "5 years")
- **Other boards:** Other public company boards they serve on
- **Source:** Single S# citation

**Board summary should include:**
- Total board size and composition (independent vs. inside directors)
- Average tenure and recent refreshment
- Key expertise areas represented (industry, finance, technology, international)
- Diversity statistics if disclosed

### 2. C-Suite and Executive Leadership (Priority: CRITICAL)

**Search for:**
- "${companyName} executive team"
- "${companyName} leadership team"
- "${companyName} management team bios"
- "${companyName} investor presentation executives"
- "${companyName} earnings call CEO CFO commentary"

**Extract for EACH C-suite executive (CEO, CFO, COO, CTO, CMO, CHRO, General Counsel, etc.):**
- **Name:** Full name
- **Title:** Exact title
- **Role description:** 1-2 sentences on responsibilities
- **Background:** 2-3 sentences (career history, education, notable achievements)
- **Tenure:** How long in current role
- **Performance actions:** Specific initiatives they are leading to improve performance (cost reduction, digital transformation, market expansion, M&A integration, etc.)
- **Geography relevance:** High/Medium/Low based on ${geography} involvement
- **Source:** Single S# citation

**C-suite summary should include:**
- Leadership team composition and tenure
- Recent executive changes or additions
- Key strategic focus areas by executive

### 3. Business Unit/Division Leaders (Priority: MEDIUM)

**Search for:**
- "${companyName} business unit leaders"
- "${companyName} segment presidents"
- "${companyName} division heads"
- "${companyName} regional leadership ${geography}"
- "${companyName} investor day segment presentations"

**Extract for key business unit leaders (typically VP/SVP/President level with P&L responsibility):**
- **Name:** Full name
- **Title:** Exact title
- **Business unit:** Which segment/division they lead
- **Role description:** 1-2 sentences on scope
- **Background:** 1-2 sentences
- **Performance actions:** Initiatives specific to their unit
- **Geography relevance:** High/Medium/Low based on ${geography} presence
- **Source:** Single S# citation

**Focus on:**
- Leaders of segments with significant ${geography} operations
- Regional/country presidents for ${geography}
- Leaders of strategically important divisions

### 4. Recent Leadership Changes (Priority: MEDIUM)

**Search for:**
- "${companyName} executive appointment"
- "${companyName} CEO change" OR "${companyName} CFO hire"
- "${companyName} leadership transition"
- "${companyName} reorganization leadership"

**Extract for each change (within the time horizon):**
- **Date:** When announced/effective
- **Change type:** New Hire, Departure, Promotion, Reorganization
- **Description:** What changed (who, what role, context)
- **Implications:** Strategic significance of the change
- **Source:** Single S# citation

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface KeyExecsAndBoardOutput {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };

  board_of_directors: {
    summary: string;  // 2-3 sentences on board composition
    members: Array<{
      name: string;
      role: string;  // "Chairman", "Independent Director", etc.
      committees: string[];  // ["Audit", "Compensation"]
      background: string;  // 2-3 sentences
      tenure: string;  // "Since 2019" or "5 years"
      other_boards: string[];
      source: string;  // Single S#
    }>;
  };

  c_suite: {
    summary: string;  // 2-3 sentences on executive team
    executives: Array<{
      name: string;
      title: string;
      role_description: string;  // 1-2 sentences
      background: string;  // 2-3 sentences
      tenure: string;
      performance_actions: string[];  // Specific improvement initiatives
      geography_relevance?: 'High' | 'Medium' | 'Low';
      source: string;
    }>;
  };

  business_unit_leaders: {
    summary: string;  // 1-2 sentences
    leaders: Array<{
      name: string;
      title: string;
      business_unit: string;
      role_description: string;
      background: string;
      performance_actions: string[];
      geography_relevance?: 'High' | 'Medium' | 'Low';
      source: string;
    }>;
  };

  recent_leadership_changes: Array<{
    date: string;
    change_type: 'New Hire' | 'Departure' | 'Promotion' | 'Reorganization';
    description: string;
    implications: string;
    source: string;
  }>;

  sources_used: string[];
}
\`\`\`

---

## SUBSECTION REQUIREMENTS

### Board of Directors

**Summary (2-3 sentences):**
- Board size, independence ratio, average tenure
- Key expertise areas and diversity
- Recent board changes if any

**Members array:**
- Include ALL board members if 12 or fewer
- For larger boards, prioritize: Chairman, Lead Independent, committee chairs, members with ${geography} experience
- Each member needs committees, background, tenure, other boards

### C-Suite Executives

**Summary (2-3 sentences):**
- Executive team composition and stability
- Average tenure and recent changes
- Key strategic priorities by leader

**Executives array:**
- Include: CEO, CFO, COO, CTO, CMO, CHRO, CLO/General Counsel, and any Chief Digital/Transformation Officers
- For each: detailed background and specific performance improvement actions
- Geography relevance rating for executives with ${geography} oversight

### Business Unit Leaders

**Summary (1-2 sentences):**
- Overview of divisional leadership structure
- Focus on ${geography}-relevant leaders

**Leaders array:**
- Prioritize leaders of segments with ${geography} presence
- Include regional/country leaders for ${geography}
- Focus on leaders mentioned in context of performance improvement

### Recent Leadership Changes

- Include changes within the time horizon
- Cover executive and board-level changes
- Note strategic implications (new strategic direction, succession planning, capability gaps, etc.)

---

## GEOGRAPHY FOCUS REQUIREMENT (50-60%)

**This section focuses on leadership across the organization, but with ${geography} context:**

✅ **CORRECT patterns:**
- "Board includes two members with extensive ${geography} experience, including former CEO of [Regional Company] (S3)."
- "CFO John Smith oversees a transformation program with significant ${geography} components, including shared services consolidation (S5)."
- "VP of ${geography} Operations Maria Garcia leads 4,200 employees across 12 facilities (S8)."

❌ **WRONG patterns:**
- Focusing only on executives without ${geography} connection
- Omitting regional leaders entirely
- Not noting ${geography} relevance for C-suite

---

## SOURCE CITATION REQUIREMENTS

**Follow style guide Section 5:**

1. **Source IDs must be S# only.** Reuse IDs from \`foundation.source_catalog\`; do **not** renumber existing sources.
2. **New sources must continue numbering** after the highest existing S#.
3. **One source per field.** Every \`source\` field must be a single S#.
4. **Source every factual claim** - no unsourced statements.
5. **Use (S#) format in prose** and S# strings in arrays.
6. **Never invent IDs or use non-S formats.**

---

## CONFIDENCE SCORING

**HIGH:**
- Recent proxy statement (DEF 14A) with full board and executive details
- Executive bios on company website current within 6 months
- Investor presentation with leadership team
- Clear information on improvement initiatives

**MEDIUM:**
- Proxy statement available but older than 1 year
- Basic executive list but limited background detail
- Some performance actions identified but not comprehensive

**LOW:**
- Limited public disclosure (private company)
- Outdated or incomplete leadership information
- Cannot identify board composition or key executives
- No information on performance improvement actions

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] Board summary covers composition, tenure, expertise
- [ ] All board members have committees and background
- [ ] C-suite includes CEO, CFO, and other key executives
- [ ] Performance actions are specific (not generic "improving operations")
- [ ] Business unit leaders include ${geography}-relevant positions
- [ ] Geography relevance ratings assigned where appropriate
- [ ] Recent changes include implications
- [ ] All claims cited with sources
- [ ] Sources_used array complete

---

## CRITICAL REMINDERS

1. **Follow style guide:** All formatting rules apply
2. **Valid JSON only:** No markdown, no headings, no prose outside JSON
3. **Source everything:** No unsourced claims
4. **Performance actions:** Be specific about what each leader is doing to improve performance
5. **Geography relevance:** Rate executives for ${geography} involvement
6. **Exact schema match:** Follow the TypeScript interface exactly
7. **Comprehensive coverage:** Don't omit key executives or board members **that can be identified**
8. **Recent changes:** Include leadership transitions and their implications

---

## HANDLING MISSING INFORMATION (CRITICAL)

**For private companies or when leadership cannot be identified:**

- **Do NOT fabricate placeholder entries.** Never return entries with names like "Information Not Available", "Not Disclosed", "Unknown", or similar placeholders. These pollute the output.
- **Return empty arrays** for any people category (executives, members, leaders) where no real individuals can be identified.
- **Use the summary field** to explain what information is missing and why (e.g., "Vyne Dental is a private company with no publicly disclosed executive team.").
- **Set confidence.level to "LOW"** with a clear reason explaining the data limitation.

**Example for a private company with no public leadership data:**
\`\`\`json
{
  "confidence": { "level": "LOW", "reason": "Private company with extremely limited publicly available information" },
  "board_of_directors": { "summary": "Board composition is not publicly disclosed.", "members": [] },
  "c_suite": { "summary": "Executive team details are not publicly available for this private company.", "executives": [] },
  "business_unit_leaders": { "summary": "No business unit leaders could be identified from public sources.", "leaders": [] },
  "recent_leadership_changes": [],
  "sources_used": ["S1"]
}
\`\`\`

**This rule supersedes "Comprehensive coverage"** — it is better to return an empty array with a clear summary than to invent placeholder people entries.

---

## BEGIN RESEARCH

**Company:** ${companyName}
**Geography:** ${geography}
**Foundation Context:** [Provided above]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
`;
    return appendReportTypeAddendum('key_execs_and_board', input.reportType, basePrompt);
}
export function validateKeyExecsAndBoardOutput(output) {
    if (!output || typeof output !== 'object')
        return false;
    if (!output.confidence ||
        !['HIGH', 'MEDIUM', 'LOW'].includes(output.confidence.level) ||
        typeof output.confidence.reason !== 'string') {
        return false;
    }
    if (!output.board_of_directors ||
        typeof output.board_of_directors.summary !== 'string' ||
        !Array.isArray(output.board_of_directors.members)) {
        return false;
    }
    for (const member of output.board_of_directors.members) {
        if (!member ||
            typeof member.name !== 'string' ||
            typeof member.role !== 'string' ||
            !Array.isArray(member.committees) ||
            typeof member.background !== 'string' ||
            typeof member.tenure !== 'string' ||
            !Array.isArray(member.other_boards) ||
            typeof member.source !== 'string') {
            return false;
        }
    }
    if (!output.c_suite ||
        typeof output.c_suite.summary !== 'string' ||
        !Array.isArray(output.c_suite.executives)) {
        return false;
    }
    for (const exec of output.c_suite.executives) {
        if (!exec ||
            typeof exec.name !== 'string' ||
            typeof exec.title !== 'string' ||
            typeof exec.role_description !== 'string' ||
            typeof exec.background !== 'string' ||
            typeof exec.tenure !== 'string' ||
            !Array.isArray(exec.performance_actions) ||
            typeof exec.source !== 'string') {
            return false;
        }
    }
    if (!output.business_unit_leaders ||
        typeof output.business_unit_leaders.summary !== 'string' ||
        !Array.isArray(output.business_unit_leaders.leaders)) {
        return false;
    }
    for (const leader of output.business_unit_leaders.leaders) {
        if (!leader ||
            typeof leader.name !== 'string' ||
            typeof leader.title !== 'string' ||
            typeof leader.business_unit !== 'string' ||
            typeof leader.role_description !== 'string' ||
            typeof leader.background !== 'string' ||
            !Array.isArray(leader.performance_actions) ||
            typeof leader.source !== 'string') {
            return false;
        }
    }
    if (!Array.isArray(output.recent_leadership_changes)) {
        return false;
    }
    for (const change of output.recent_leadership_changes) {
        if (!change ||
            typeof change.date !== 'string' ||
            typeof change.change_type !== 'string' ||
            typeof change.description !== 'string' ||
            typeof change.implications !== 'string' ||
            typeof change.source !== 'string') {
            return false;
        }
    }
    if (!Array.isArray(output.sources_used))
        return false;
    return true;
}
export function formatKeyExecsAndBoardForDocument(output) {
    let markdown = `# Key Execs and Board Members\n\n`;
    markdown += `**Confidence: ${output.confidence.level}** – ${output.confidence.reason}\n\n`;
    markdown += `## Board of Directors\n\n`;
    markdown += `${output.board_of_directors.summary}\n\n`;
    for (const member of output.board_of_directors.members) {
        markdown += `**${member.name}** (${member.role})`;
        if (member.tenure)
            markdown += ` - ${member.tenure}`;
        markdown += `\n`;
        markdown += `- Committees: ${member.committees.join(', ') || 'None listed'}\n`;
        markdown += `- Background: ${member.background}\n`;
        if (member.other_boards.length > 0) {
            markdown += `- Other Boards: ${member.other_boards.join(', ')}\n`;
        }
        markdown += `- Source: ${member.source}\n\n`;
    }
    markdown += `## C-Suite and Executive Leadership\n\n`;
    markdown += `${output.c_suite.summary}\n\n`;
    for (const exec of output.c_suite.executives) {
        markdown += `**${exec.name}**, ${exec.title}`;
        if (exec.tenure)
            markdown += ` (${exec.tenure})`;
        if (exec.geography_relevance)
            markdown += ` [${exec.geography_relevance} Geography Relevance]`;
        markdown += `\n`;
        markdown += `- Role: ${exec.role_description}\n`;
        markdown += `- Background: ${exec.background}\n`;
        if (exec.performance_actions.length > 0) {
            markdown += `- Performance Improvement Actions:\n`;
            for (const action of exec.performance_actions) {
                markdown += `  - ${action}\n`;
            }
        }
        markdown += `- Source: ${exec.source}\n\n`;
    }
    markdown += `## Business Unit/Division Leaders\n\n`;
    markdown += `${output.business_unit_leaders.summary}\n\n`;
    if (output.business_unit_leaders.leaders.length > 0) {
        for (const leader of output.business_unit_leaders.leaders) {
            markdown += `**${leader.name}**, ${leader.title} - ${leader.business_unit}`;
            if (leader.geography_relevance)
                markdown += ` [${leader.geography_relevance} Geography Relevance]`;
            markdown += `\n`;
            markdown += `- Role: ${leader.role_description}\n`;
            markdown += `- Background: ${leader.background}\n`;
            if (leader.performance_actions.length > 0) {
                markdown += `- Performance Actions:\n`;
                for (const action of leader.performance_actions) {
                    markdown += `  - ${action}\n`;
                }
            }
            markdown += `- Source: ${leader.source}\n\n`;
        }
    }
    else {
        markdown += `*None identified in available sources.*\n\n`;
    }
    if (output.recent_leadership_changes.length > 0) {
        markdown += `## Recent Leadership Changes\n\n`;
        for (const change of output.recent_leadership_changes) {
            markdown += `**${change.date}** - ${change.change_type}\n`;
            markdown += `${change.description}\n`;
            markdown += `*Implications:* ${change.implications} (${change.source})\n\n`;
        }
    }
    return markdown;
}
//# sourceMappingURL=key-execs-and-board.js.map