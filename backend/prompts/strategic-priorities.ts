/**
 * Report-Specific Section: Strategic Priorities and Transformation
 */

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface StrategicPrioritiesInput {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  reportType?: ReportTypeId;
}

export interface StrategicPrioritiesOutput {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  priorities: Array<{
    priority: string;
    description: string;
    source: string;
  }>;
  transformation_themes: string[];
  sources_used: string[];
}

export function buildStrategicPrioritiesPrompt(input: StrategicPrioritiesInput): string {
  const { foundation, companyName } = input;
  const foundationJson = JSON.stringify(foundation, null, 2);

  const basePrompt = `# Strategic Priorities and Transformation - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Summarize **${companyName}** strategic priorities and transformation agenda. Focus on operational and strategic signals that affect execution.

---

## INPUT CONTEXT (From Foundation)
\`\`\`json
${foundationJson}
\`\`\`

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface StrategicPrioritiesOutput {
  confidence: { level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string };
  priorities: Array<{ priority: string; description: string; source: string }>;
  transformation_themes: string[];
  sources_used: string[];
}
\`\`\`

## Guidance
- Include 3-6 priorities with clear descriptions.
- Highlight 2-5 transformation themes (digital, efficiency, platform, etc.).

## Example output (format only)
\`\`\`json
{
  "confidence": { "level": "MEDIUM", "reason": "Priorities supported by public statements and investor materials." },
  "priorities": [
    {
      "priority": "Portfolio modernization",
      "description": "Shift toward higher-margin, recurring revenue assets through selective acquisitions.",
      "source": "S2"
    },
    {
      "priority": "Operational efficiency",
      "description": "Drive margin expansion via procurement and shared services.",
      "source": "S5"
    }
  ],
  "transformation_themes": ["Digital enablement", "Cost discipline"],
  "sources_used": ["S2", "S5"]
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

  return appendReportTypeAddendum('strategic_priorities', input.reportType, basePrompt);
}
