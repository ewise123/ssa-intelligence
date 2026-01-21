/**
 * Report-Specific Section: Portfolio Snapshot
 */

import { appendReportTypeAddendum } from './report-type-addendums.js';

export function buildPortfolioSnapshotPrompt(input) {
  const { foundation, companyName, geography } = input;
  const foundationJson = JSON.stringify(foundation, null, 2);

  const basePrompt = `# Portfolio Snapshot - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate a PE portfolio snapshot for **${companyName}**. Provide a concise overview of the current portfolio, grouped by sector or platform when possible.

**Target geography:** ${geography}

---

## INPUT CONTEXT (From Foundation)
\`\`\`json
${foundationJson}
\`\`\`

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface PortfolioSnapshotOutput {
  confidence: { level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string };
  summary: string;
  portfolio_companies: Array<{
    name: string;
    sector: string;
    platform_or_addon: string;
    geography?: string;
    notes?: string;
    source: string;
  }>;
  sources_used: string[];
}
\`\`\`

## Guidance
- Include at least 4 portfolio companies with credible sources.
- Note platform vs add-on where visible.
- Keep the summary focused on portfolio composition patterns.
- Emphasize the target geography (${geography}) in summary and company notes.

## Example output (format only)
\`\`\`json
{
  "confidence": { "level": "MEDIUM", "reason": "Portfolio list is complete but limited geography detail." },
  "summary": "Portfolio skews toward business services and industrial tech, anchored by a few platform assets with add-on rollups.",
  "portfolio_companies": [
    {
      "name": "Example Platform Co",
      "sector": "Business services",
      "platform_or_addon": "Platform",
      "geography": "North America",
      "notes": "Core platform with recurring revenue focus.",
      "source": "S2"
    },
    {
      "name": "Example Add-on Co",
      "sector": "Industrial tech",
      "platform_or_addon": "Add-on",
      "geography": "Europe",
      "notes": "Add-on to expand regional footprint.",
      "source": "S3"
    }
  ],
  "sources_used": ["S2", "S3"]
}
\`\`\`

## CRITICAL REMINDERS

1. Follow style guide: All formatting rules apply
2. Valid JSON only: No markdown, no headings, no prose outside JSON
3. Source everything: No unsourced claims
4. Geography focus: Emphasize the target geography (${geography}) throughout
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

  return appendReportTypeAddendum('portfolio_snapshot', input.reportType, basePrompt);
}
