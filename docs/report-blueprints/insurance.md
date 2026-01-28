# Insurance Report Blueprint

Status: Draft

## Purpose
Distill underwriting performance, investment results, and distribution strategy into actionable context for exec-level conversations and meeting prep.

## Inputs
Required:
- Insurer name
- Time horizon
- Meeting context

Optional:
- Line of business (Life, P&C, Health, Reinsurance, etc.)
- Stakeholders (CEO, CFO, Chief Underwriting Officer, etc.)

Legacy UI context (optional):
- Geography
- Industry
- Extra context prompt

## Wizard fields (order)
1. Report type: Insurance
2. Insurer name + other info (time horizon, meeting context, optional line of business, optional stakeholders)
3. Additional context
4. Review and edit

## Section mapping
Uses base section ids plus Insurance-specific sections.

### Base sections

| Section id | Display title | Default | Focus |
| --- | --- | --- | --- |
| exec_summary | Executive Summary | Yes | Underwriting performance, investment results, and strategic positioning. |
| company_overview | Insurer Overview and Lines of Business | Yes | Business mix by line (Life, P&C, Health), distribution channels, and footprint. |
| financial_snapshot | Performance and Capital Snapshot | Yes | Combined ratio, loss ratio, premiums, investment yield, and solvency metrics. |
| trends | Market, Regulatory, and Competitive Trends | Yes | Rate environment, claims trends, regulatory changes, and catastrophe exposure. |
| sku_opportunities | Operating Priorities and SSA Alignment | Yes | Map underwriting and claims challenges to SSA problem areas. |
| recent_news | Earnings and News Highlights | Yes | Earnings commentary, catastrophe impacts, regulatory updates. |
| conversation_starters | Call-Ready Talking Points | Yes | Hypothesis-driven questions for insurance exec discussions. |
| segment_analysis | Line of Business Deep Dive | No | Optional when line-specific detail is needed. |
| peer_benchmarking | Peer Benchmarking | No | Optional peer comparison when data is available. |
| appendix | Appendix and Sources | Yes | Sources used across sections. |

### Report-specific sections

| Section id | Display title | Default | Focus |
| --- | --- | --- | --- |
| leadership_and_governance | Leadership and Governance | Yes | Executive team, actuarial leadership, and regulatory compliance signals. |
| strategic_priorities | Strategic Priorities and Transformation | Yes | Digital distribution, claims modernization, and product innovation. |
| distribution_analysis | Distribution Channels and Partnerships | Yes | Agent/broker networks, direct-to-consumer, bancassurance, distribution costs. |
| operating_capabilities | Operating Capabilities | No | Claims handling, underwriting platforms, and distribution technology. |

## Default selections
Base sections plus leadership_and_governance, strategic_priorities, and distribution_analysis. Optional sections remain off by default.

## Key insurance metrics
- Gross Written Premiums ($M)
- Net Written Premiums ($M)
- Premium Growth (YoY) (%)
- Combined Ratio (%)
- Loss Ratio (%)
- Expense Ratio (%)
- Underwriting Income (Loss) ($M)
- Net Investment Income ($M)
- Investment Yield (%)
- Net Income ($M)
- Return on Equity (ROE) (%)
- Solvency Ratio / RBC Ratio (%)
- Reserve to Premium Ratio (x)
- Policy Retention Rate (%)

## Notes
- Keep analysis focused on underwriting discipline and distribution efficiency.
- Emphasize combined ratio drivers and reserve adequacy.
- Highlight catastrophe exposure and rate environment context.
- Distribution analysis section is specific to insurance and analyzes channel mix.
