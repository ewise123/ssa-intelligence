# Industrials Report Blueprint

Status: Draft

## Purpose
Distill end-market exposure, cost structure, and operational levers into actionable context for exec-level conversations and meeting prep.

## Inputs
Required:
- Company name
- Time horizon
- Meeting context

Optional:
- Relevant business segment or end market
- Stakeholders (optional)

Legacy UI context (optional):
- Geography
- Industry
- Extra context prompt

## Wizard fields (order)
1. Report type: Industrials
2. Company name + other info (time horizon, meeting context, optional segment/end market, optional stakeholders)
3. Additional context
4. Review and edit

## Section mapping
Industrials uses the original section set and titles.

| Section id | Display title | Default | Focus |
| --- | --- | --- | --- |
| exec_summary | Executive Summary | Yes | Operating pressure points and call-ready takeaways. |
| financial_snapshot | Financial Snapshot | Yes | Performance drivers and margin dynamics with interpretation. |
| company_overview | Company Overview | Yes | Business model, segments, and end markets. |
| segment_analysis | Segment Analysis | Yes | Segment-level performance and competitor context. |
| trends | Market Trends | Yes | Macro, supply chain, and end-market trends. |
| peer_benchmarking | Peer Benchmarking | Yes | Peer performance and positioning signals. |
| sku_opportunities | SKU Opportunities | Yes | Map operating issues to SSA problem areas. |
| recent_news | Recent News | Yes | Material developments tied to operations or strategy. |
| conversation_starters | Conversation Starters | Yes | Hypothesis-driven executive questions. |
| appendix | Appendix and Sources | Yes | Sources used across sections. |

## Default selections
All sections preselected (baseline behavior).

## Notes
- This is the baseline report type. Prompts and schemas should remain closest to current behavior.
