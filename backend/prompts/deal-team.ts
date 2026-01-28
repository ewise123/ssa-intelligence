/**
 * Report-Specific Section: Deal Team and Key Stakeholders
 */

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface DealTeamInput {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  reportType?: ReportTypeId;
}

export interface DealTeamOutput {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  stakeholders: Array<{
    name: string;
    title: string;
    role: string;
    focus_area?: string;
    source: string;
  }>;
  notes?: string;
  sources_used: string[];
}

export function buildDealTeamPrompt(input: DealTeamInput): string {
  const { foundation, companyName } = input;
  const foundationJson = JSON.stringify(foundation, null, 2);

  const basePrompt = `# Deal Team and Key Stakeholders - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Identify key partners, deal leads, or operating partners relevant to **${companyName}**. Focus on credible public sources and avoid speculation.

---

## INPUT CONTEXT (From Foundation)
\`\`\`json
${foundationJson}
\`\`\`

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface DealTeamOutput {
  confidence: { level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string };
  stakeholders: Array<{
    name: string;
    title: string;
    role: string;
    focus_area?: string;
    source: string;
  }>;
  notes?: string;
  sources_used: string[];
}
\`\`\`

## Guidance
- Include at least 2 stakeholders with source references.
- Use notes for any relationship pathways or coverage context.

## Example output (format only)
\`\`\`json
{
  "confidence": { "level": "MEDIUM", "reason": "Two primary stakeholders confirmed in public bios." },
  "stakeholders": [
    {
      "name": "Alex Jordan",
      "title": "Partner",
      "role": "Deal lead",
      "focus_area": "Business services",
      "source": "S2"
    },
    {
      "name": "Morgan Lee",
      "title": "Operating Partner",
      "role": "Portfolio operations",
      "focus_area": "Go-to-market",
      "source": "S6"
    }
  ],
  "notes": "Coverage appears aligned to North America services platforms.",
  "sources_used": ["S2", "S6"]
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

  return appendReportTypeAddendum('deal_team', input.reportType, basePrompt);
}
