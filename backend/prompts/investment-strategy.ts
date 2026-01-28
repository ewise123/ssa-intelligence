/**
 * Report-Specific Section: Investment Strategy and Focus
 */

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface InvestmentStrategyInput {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  reportType?: ReportTypeId;
}

export interface InvestmentStrategyOutput {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  strategy_summary: string;
  focus_areas: string[];
  sector_focus: string[];
  platform_vs_addon_patterns: string[];
  sources_used: string[];
}

export function buildInvestmentStrategyPrompt(input: InvestmentStrategyInput): string {
  const { foundation, companyName } = input;
  const foundationJson = JSON.stringify(foundation, null, 2);

  const basePrompt = `# Investment Strategy and Focus - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Produce a concise investment strategy readout for **${companyName}**, focusing on strategy, sector focus, and platform vs add-on patterns.

---

## INPUT CONTEXT (From Foundation)
\`\`\`json
${foundationJson}
\`\`\`

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface InvestmentStrategyOutput {
  confidence: { level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string };
  strategy_summary: string;
  focus_areas: string[]; // 3-6 items
  sector_focus: string[]; // 2-6 items
  platform_vs_addon_patterns: string[]; // 2-5 items
  sources_used: string[]; // S# references
}
\`\`\`

## Guidance
- Summarize the firm's investment posture and how it differentiates.
- Use source-backed signals from the foundation catalog.
- Avoid generic PE language; highlight observed patterns.

## Example output (format only)
\`\`\`json
{
  "confidence": { "level": "MEDIUM", "reason": "Source coverage is solid but limited detail on sector priorities." },
  "strategy_summary": "Focuses on mid-market platforms in durable sectors with operational value creation and bolt-on M&A.",
  "focus_areas": ["Operational improvement", "Buy-and-build", "Digital enablement"],
  "sector_focus": ["Business services", "Healthcare", "Industrial tech"],
  "platform_vs_addon_patterns": ["Platform-first in new sectors", "Add-ons to deepen regional scale"],
  "sources_used": ["S1", "S3"]
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
2. **If multiple sources apply,** pick the most authoritative for the claim and list all relevant S# in \`sources_used\`.
3. **Never invent IDs or use non-S formats.** Only S# strings are valid.

**Example:** \`"sources_used": ["S1","S3","S8"]\`.

**Before outputting JSON, verify:**
- [ ] Valid JSON syntax (no markdown)
- [ ] \`sources_used\` only contains S# values

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA.**`;

  return appendReportTypeAddendum('investment_strategy', input.reportType, basePrompt);
}
