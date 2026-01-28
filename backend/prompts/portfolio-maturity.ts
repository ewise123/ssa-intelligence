/**
 * Report-Specific Section: Portfolio Maturity and Exit Watchlist
 */

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface PortfolioMaturityInput {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  reportType?: ReportTypeId;
}

export interface PortfolioMaturityOutput {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  summary: string;
  holdings: Array<{
    company: string;
    acquisition_period?: string;
    holding_period_years?: number | null;
    exit_signal: string;
    source: string;
  }>;
  sources_used: string[];
}

export function buildPortfolioMaturityPrompt(input: PortfolioMaturityInput): string {
  const { foundation, companyName } = input;
  const foundationJson = JSON.stringify(foundation, null, 2);

  const basePrompt = `# Portfolio Maturity and Exit Watchlist - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Identify longer-held portfolio assets for **${companyName}** and summarize potential exit signals. Use public evidence; avoid speculation.

---

## INPUT CONTEXT (From Foundation)
\`\`\`json
${foundationJson}
\`\`\`

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface PortfolioMaturityOutput {
  confidence: { level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string };
  summary: string;
  holdings: Array<{
    company: string;
    acquisition_period?: string;
    holding_period_years?: number | null;
    exit_signal: string;
    source: string;
  }>;
  sources_used: string[];
}
\`\`\`

## Guidance
- Include at least 2 holdings if evidence exists.
- Exit signals should be grounded in public activity (refinancing, leadership changes, etc.).

## Example output (format only)
\`\`\`json
{
  "confidence": { "level": "MEDIUM", "reason": "Holding periods inferred from deal announcements." },
  "summary": "Several long-held assets show refinancing and leadership changes consistent with exit prep.",
  "holdings": [
    {
      "company": "Example Holdings Co",
      "acquisition_period": "2018-2019",
      "holding_period_years": 6,
      "exit_signal": "Recent refinancing and management transition.",
      "source": "S3"
    }
  ],
  "sources_used": ["S3"]
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

  return appendReportTypeAddendum('portfolio_maturity', input.reportType, basePrompt);
}
