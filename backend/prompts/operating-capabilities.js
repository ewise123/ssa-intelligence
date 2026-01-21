/**
 * Report-Specific Section: Operating Capabilities
 */

import { appendReportTypeAddendum } from './report-type-addendums.js';

export function buildOperatingCapabilitiesPrompt(input) {
  const { foundation, companyName } = input;
  const foundationJson = JSON.stringify(foundation, null, 2);

  const basePrompt = `# Operating Capabilities - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Summarize operating capabilities for **${companyName}**, including digital, talent, shared services, or hub capacity where relevant.

---

## INPUT CONTEXT (From Foundation)
\`\`\`json
${foundationJson}
\`\`\`

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface OperatingCapabilitiesOutput {
  confidence: { level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string };
  capabilities: Array<{ capability: string; description: string; maturity?: 'Early' | 'Developing' | 'Advanced'; source: string }>;
  gaps?: string[];
  sources_used: string[];
}
\`\`\`

## Guidance
- Include 3-8 capabilities with sources.
- Use gaps only when supported by evidence.

## Example output (format only)
\`\`\`json
{
  "confidence": { "level": "MEDIUM", "reason": "Capabilities inferred from operational updates and platform descriptions." },
  "capabilities": [
    {
      "capability": "Shared services",
      "description": "Centralized finance and procurement supporting portfolio companies.",
      "maturity": "Developing",
      "source": "S3"
    },
    {
      "capability": "Digital enablement",
      "description": "Investment in data platforms and automation to improve operating metrics.",
      "maturity": "Advanced",
      "source": "S6"
    }
  ],
  "gaps": ["Limited disclosed talent retention programs"],
  "sources_used": ["S3", "S6"]
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

  return appendReportTypeAddendum('operating_capabilities', input.reportType, basePrompt);
}
