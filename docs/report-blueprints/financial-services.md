# Financial Services Report Blueprint

Status: Draft

## Purpose
Distill operational challenges, performance drivers, and strategic priorities into actionable context for exec-level conversations and meeting prep.

## Inputs
Required:
- Institution name
- Time horizon
- Meeting context

Optional:
- Business focus (banking, wealth, insurance, payments)
- Stakeholders (CEO, CFO, BU head, etc.)

Legacy UI context (optional):
- Geography
- Industry
- Extra context prompt

## Wizard fields (order)
1. Report type: Financial Services
2. Institution name + other info (time horizon, meeting context, optional business focus, optional stakeholders)
3. Additional context
4. Review and edit

## Section mapping
Uses base section ids plus FS-specific sections derived from the output examples.

### Base sections
| Section id | Display title | Default | Focus |
| --- | --- | --- | --- |
| exec_summary | Executive Summary | Yes | Performance drivers, operating pressure, and leadership focus. |
| company_overview | Institution Overview and Business Lines | Yes | Business mix, revenue drivers, and footprint. |
| financial_snapshot | Performance and Capital Snapshot | Yes | Revenue mix, margins, efficiency, and capital metrics. |
| trends | Market, Regulatory, and Competitive Trends | Yes | External forces shaping operating priorities. |
| sku_opportunities | Operating Priorities and SSA Alignment | Yes | Map operating tensions to SSA problem areas. |
| recent_news | Earnings and News Highlights | Yes | Earnings commentary, regulatory updates, leadership changes. |
| conversation_starters | Call-Ready Talking Points | Yes | Hypothesis-driven questions for exec discussions. |
| segment_analysis | Business Line Deep Dive | No | Optional when business-line detail is needed. |
| peer_benchmarking | Peer Benchmarking | No | Optional peer comparison when data is available. |
| appendix | Appendix and Sources | Yes | Sources used across sections. |

### Report-specific sections
| Section id | Display title | Default | Focus |
| --- | --- | --- | --- |
| leadership_and_governance | Leadership and Governance | Yes | Leadership profiles, accountability signals, governance notes. |
| strategic_priorities | Strategic Priorities and Transformation | Yes | Strategic focus areas, transformation agenda, and trade-offs. |
| operating_capabilities | Operating Capabilities | No | Digital capabilities, talent pools, shared services, or hub assessments. |

## Default selections
Base sections plus leadership_and_governance and strategic_priorities. Optional sections remain off by default.

## Notes
- Keep analysis focused on operating tensions and execution challenges.
- See `docs/brief-specs/fs-brief.md` for section-level guidance.
