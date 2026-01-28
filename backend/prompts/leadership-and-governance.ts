/**
 * Report-Specific Section: Leadership and Governance
 */

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface LeadershipAndGovernanceInput {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  reportType?: ReportTypeId;
}

export interface LeadershipAndGovernanceOutput {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  leadership: Array<{
    name: string;
    title: string;
    focus_area?: string;
    source: string;
  }>;
  governance_notes: string;
  sources_used: string[];
}

export function buildLeadershipAndGovernancePrompt(input: LeadershipAndGovernanceInput): string {
  const { foundation, companyName } = input;
  const foundationJson = JSON.stringify(foundation, null, 2);

  const basePrompt = `# Leadership and Governance - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Summarize leadership and governance signals for **${companyName}**. Highlight key leaders, accountability signals, and governance notes that matter for exec-level conversations.

---

## INPUT CONTEXT (From Foundation)
\`\`\`json
${foundationJson}
\`\`\`

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface LeadershipAndGovernanceOutput {
  confidence: { level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string };
  leadership: Array<{
    name: string;
    title: string;
    focus_area?: string;
    source: string;
  }>;
  governance_notes: string;
  sources_used: string[];
}
\`\`\`

## Guidance
- Include at least 3 leaders with source references.
- Governance notes should focus on accountability and operating structure.

## Example output (format only)
\`\`\`json
{
  "confidence": { "level": "MEDIUM", "reason": "Leadership bios confirm roles but limited governance disclosures." },
  "leadership": [
    {
      "name": "Jordan Patel",
      "title": "Chief Executive Officer",
      "focus_area": "Portfolio strategy",
      "source": "S1"
    },
    {
      "name": "Casey Rivera",
      "title": "Chief Operating Officer",
      "focus_area": "Operating model",
      "source": "S4"
    }
  ],
  "governance_notes": "Board and operating committee changes over the past year indicate increased focus on portfolio oversight.",
  "sources_used": ["S1", "S4"]
}
\`\`\`

## CRITICAL REMINDERS

1. Follow style guide: All formatting rules apply
2. Valid JSON only: No markdown, no headings, no prose outside JSON
3. Source everything: No unsourced claims
4. Geography focus: Emphasize the target geography throughout
5. Exact schema match: Follow the TypeScript interface exactly

---

## Source rules (STRICT)
1. **Source IDs must be S# only.** Reuse IDs from \`foundation.source_catalog\`; do **not** renumber existing sources.
2. **One source per field.** Every \`source\` field must be a single S# (no commas or ranges).
3. **If multiple sources apply,** pick the most authoritative for the field and list all relevant S# in \`sources_used\`.
4. **Never invent IDs or use non-S formats.** Only S# strings are valid.

**Example:** \`"source": "S3"\` and \`"sources_used": ["S1","S3","S8"]\`.

**Before outputting JSON, verify:**
- [ ] Valid JSON syntax (no markdown)
- [ ] All \`source\` fields are single S# values
- [ ] \`sources_used\` only contains S# values

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA.**`;

  return appendReportTypeAddendum('leadership_and_governance', input.reportType, basePrompt);
}
