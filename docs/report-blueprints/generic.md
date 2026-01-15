# Company Brief (Generic) Blueprint

Status: Draft

## Purpose
Distill company-specific strategy, performance, and recent developments into tailored context for exec-level conversations and meeting prep.

## Inputs
Required:
- Company name
- Time horizon
- Meeting context

Optional:
- Topic of interest (strategy, performance, growth, risk)
- Stakeholders

Legacy UI context (optional):
- Geography
- Industry
- Extra context prompt

## Wizard fields (order)
1. Report type: Company Brief (Generic)
2. Company name + other info (time horizon, meeting context, optional topic of interest, optional stakeholders)
3. Additional context
4. Review and edit

## Section mapping
Uses base section ids and titles with a context-specific focus.

| Section id | Display title | Default | Focus |
| --- | --- | --- | --- |
| exec_summary | Executive Summary | Yes | 4-6 high-signal points tied to meeting context. |
| financial_snapshot | Financial Snapshot | Yes | Only material metrics tied to the stated topic. |
| company_overview | Company Overview | Yes | Business model and the most relevant segments. |
| trends | Market Trends | Yes | 2-4 trends that directly affect the context. |
| sku_opportunities | SKU Opportunities | Yes | 1-3 SSA problem areas tied to the context. |
| conversation_starters | Conversation Starters | Yes | Short, call-ready questions for the meeting. |
| appendix | Appendix and Sources | Yes | Sources used across sections. |
| segment_analysis | Segment Analysis | No | Optional deep dive if the context demands it. |
| peer_benchmarking | Peer Benchmarking | No | Optional when peer comparisons are meaningful. |
| recent_news | Recent News | No | Optional when recent developments matter. |

## Default selections
exec_summary, financial_snapshot, company_overview, trends, sku_opportunities, conversation_starters, appendix.

## Notes
- The generic brief should be shorter and more selective than the other report types.
- See `docs/brief-specs/generic-brief.md` for section-level guidance.
