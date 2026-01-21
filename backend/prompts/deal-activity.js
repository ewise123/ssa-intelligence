/**
 * Report-Specific Section: Recent Investments and Add-ons
 */

import { appendReportTypeAddendum } from './report-type-addendums.js';

export function buildDealActivityPrompt(input) {
  const { foundation, companyName } = input;
  const foundationJson = JSON.stringify(foundation, null, 2);

  const basePrompt = `# Recent Investments and Add-ons - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Summarize recent investments, add-ons, or exits for **${companyName}** (last 12-24 months where possible).

---

## INPUT CONTEXT (From Foundation)
\`\`\`json
${foundationJson}
\`\`\`

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface DealActivityOutput {
  confidence: { level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string };
  summary: string;
  deals: Array<{
    company: string;
    date: string;
    deal_type: string;
    rationale: string;
    source: string;
  }>;
  sources_used: string[];
}
\`\`\`

## Guidance
- Include at least 3 transactions with sources.
- Note whether each is a platform, add-on, or exit when known.
- Summarize what the activity signals about current focus.

## Example output (format only)
\`\`\`json
{
  "confidence": { "level": "MEDIUM", "reason": "Deal details are sourced but limited integration context." },
  "summary": "Recent activity shows add-on acquisitions in adjacent services and a selective exit.",
  "deals": [
    {
      "company": "Example Platform Co",
      "date": "2024-08",
      "deal_type": "Platform acquisition",
      "rationale": "Entry into healthcare services vertical.",
      "source": "S4"
    },
    {
      "company": "Example Add-on Co",
      "date": "2025-01",
      "deal_type": "Add-on acquisition",
      "rationale": "Expanded geographic coverage and cross-sell.",
      "source": "S5"
    }
  ],
  "sources_used": ["S4", "S5"]
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

  return appendReportTypeAddendum('deal_activity', input.reportType, basePrompt);
}
