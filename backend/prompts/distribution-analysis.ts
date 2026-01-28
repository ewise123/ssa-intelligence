/**
 * Report-Specific Section: Distribution Analysis (Insurance)
 * Analyzes distribution channels, partnerships, and go-to-market strategies for insurance companies
 */

import { appendReportTypeAddendum, type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';

export interface DistributionAnalysisInput {
  foundation: FoundationOutput;
  companyName: string;
  geography: string;
  reportType?: ReportTypeId;
}

export type DistributionChannelType =
  | 'Captive Agents'
  | 'Independent Brokers'
  | 'Direct'
  | 'Bancassurance'
  | 'Affinity/Worksite'
  | 'Other';

export interface DistributionAnalysisOutput {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  summary: string;
  channels: Array<{
    channel_type: DistributionChannelType;
    description: string;
    premium_share_pct?: number;
    key_partners?: string[];
    trend: 'Growing' | 'Stable' | 'Declining';
    source: string;
  }>;
  distribution_costs: {
    acquisition_cost_ratio?: number;
    commission_rates?: Record<string, number>;
    notes: string;
    source: string;
  };
  digital_capabilities: {
    online_quoting: boolean;
    self_service_portal: boolean;
    mobile_app: boolean;
    notes: string;
    source: string;
  };
  competitive_positioning: string;
  sources_used: string[];
}

export function buildDistributionAnalysisPrompt(input: DistributionAnalysisInput): string {
  const { foundation, companyName, geography } = input;
  const foundationJson = JSON.stringify(foundation, null, 2);

  const basePrompt = `# Distribution Channels and Partnerships - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Analyze distribution channels and partnerships for **${companyName}** in **${geography}**. Identify how the company reaches customers, key distribution partnerships, and digital capabilities that matter for exec-level conversations.

---

## INPUT CONTEXT (From Foundation)
\`\`\`json
${foundationJson}
\`\`\`

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

\`\`\`typescript
interface DistributionAnalysisOutput {
  confidence: { level: 'HIGH' | 'MEDIUM' | 'LOW'; reason: string };
  summary: string;
  channels: Array<{
    channel_type: 'Captive Agents' | 'Independent Brokers' | 'Direct' | 'Bancassurance' | 'Affinity/Worksite' | 'Other';
    description: string;
    premium_share_pct?: number;
    key_partners?: string[];
    trend: 'Growing' | 'Stable' | 'Declining';
    source: string;
  }>;
  distribution_costs: {
    acquisition_cost_ratio?: number;
    commission_rates?: Record<string, number>;
    notes: string;
    source: string;
  };
  digital_capabilities: {
    online_quoting: boolean;
    self_service_portal: boolean;
    mobile_app: boolean;
    notes: string;
    source: string;
  };
  competitive_positioning: string;
  sources_used: string[];
}
\`\`\`

## Guidance

### Channel Types
- **Captive Agents**: Exclusive agents who sell only for this insurer (e.g., State Farm agents)
- **Independent Brokers**: Non-exclusive agents/brokers representing multiple insurers
- **Direct**: Online, phone, or mail channels without intermediaries
- **Bancassurance**: Distribution through bank partnerships
- **Affinity/Worksite**: Group sales through employers, associations, or affinity groups
- **Other**: Any other distribution method (specify in description)

### Analysis Focus
1. Identify all active distribution channels with relative importance
2. Note key partnerships (banks, brokers, affinity groups)
3. Assess digital distribution capabilities
4. Compare to industry norms where data available
5. Highlight channel strategy shifts or investments

### Premium Share Estimates
- If exact percentages not disclosed, estimate ranges based on company commentary
- Mark as optional (omit field) if no reasonable estimate possible

## Example output (format only)
\`\`\`json
{
  "confidence": { "level": "MEDIUM", "reason": "Channel mix disclosed in annual report; digital metrics partially available." },
  "summary": "Multi-channel insurer with strong independent broker relationships and growing direct channel.",
  "channels": [
    {
      "channel_type": "Independent Brokers",
      "description": "Primary commercial lines channel with 15,000+ appointed agents",
      "premium_share_pct": 55,
      "key_partners": ["Marsh", "Aon"],
      "trend": "Stable",
      "source": "S1"
    },
    {
      "channel_type": "Direct",
      "description": "Growing online and call center channel for personal lines",
      "premium_share_pct": 25,
      "trend": "Growing",
      "source": "S3"
    },
    {
      "channel_type": "Bancassurance",
      "description": "Partnership with regional banks for life and annuity products",
      "premium_share_pct": 20,
      "key_partners": ["First National Bank"],
      "trend": "Stable",
      "source": "S4"
    }
  ],
  "distribution_costs": {
    "acquisition_cost_ratio": 18.5,
    "commission_rates": {
      "Independent Brokers": 15,
      "Direct": 5
    },
    "notes": "Acquisition costs trending down due to direct channel growth",
    "source": "S1"
  },
  "digital_capabilities": {
    "online_quoting": true,
    "self_service_portal": true,
    "mobile_app": true,
    "notes": "Invested $50M in digital platform modernization in 2025",
    "source": "S2"
  },
  "competitive_positioning": "Leader in independent broker channel; direct channel growing but behind pure-play direct insurers.",
  "sources_used": ["S1", "S2", "S3", "S4"]
}
\`\`\`

## CRITICAL REMINDERS

1. Follow style guide: All formatting rules apply
2. Valid JSON only: No markdown, no headings, no prose outside JSON
3. Source everything: No unsourced claims
4. Geography focus: Emphasize distribution in **${geography}** specifically
5. Exact schema match: Follow the TypeScript interface exactly
6. Insurance context: This section is designed for insurance companies; adapt for other industries if needed

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
- [ ] All channel_type values match the allowed enum

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA.**`;

  return appendReportTypeAddendum('distribution_analysis', input.reportType, basePrompt);
}
