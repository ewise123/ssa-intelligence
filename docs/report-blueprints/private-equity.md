# Private Equity Report Blueprint

Status: Draft

## Purpose
Distill portfolio activity, value-creation themes, and investment strategy into actionable context for exec-level conversations and meeting prep.

## Inputs
Required:
- PE firm name
- Time horizon (for example, last 12 or 24 months)
- Meeting context

Optional:
- Specific fund or strategy focus
- Stakeholders to focus on (partners, deal leads, board members)

Legacy UI context (optional):
- Geography
- Industry
- Extra context prompt

## Wizard fields (order)
1. Report type: Private Equity
2. PE firm name + other info (time horizon, meeting context, optional fund/strategy focus, optional stakeholders)
3. Additional context
4. Review and edit

## Section mapping
Uses base section ids plus PE-specific sections derived from the output examples.

### Base sections
| Section id | Display title | Default | Focus |
| --- | --- | --- | --- |
| exec_summary | Executive Summary | Yes | Portfolio direction, value-creation themes, and operating signals. |
| company_overview | Firm Overview | Yes | Firm positioning, sector focus, and portfolio composition. |
| financial_snapshot | Portfolio Performance Snapshot | Yes | Fund size, scale signals, and reported performance indicators. |
| trends | Deal and Sector Trends | Yes | Deal environment, sector shifts, and value-creation context. |
| sku_opportunities | Value-Creation Themes and SSA Alignment | Yes | Map operating themes to SSA problem areas. |
| recent_news | Firm and Portfolio News | Yes | Deal announcements, leadership moves, portfolio updates. |
| conversation_starters | Call-Ready Talking Points | Yes | Hypothesis-driven questions for PE conversations. |
| segment_analysis | Portfolio Segments and Platforms | No | Optional clustering by sector or platform vs add-on patterns. |
| peer_benchmarking | Peer Firms and Strategy Comparison | No | Optional peer comparison when data is available. |
| appendix | Appendix and Sources | Yes | Sources used across sections. |

### Report-specific sections
| Section id | Display title | Default | Focus |
| --- | --- | --- | --- |
| investment_strategy | Investment Strategy and Focus | Yes | Fund strategy, sector focus, and platform vs add-on approach. |
| portfolio_snapshot | Portfolio Snapshot | Yes | Current portfolio overview grouped by sector or platform. |
| deal_activity | Recent Investments and Add-ons | Yes | Most recent acquisitions, add-ons, and exits. |
| deal_team | Deal Team and Key Stakeholders | No | Partners, deal leads, and operating partners tied to the portfolio. |
| portfolio_maturity | Portfolio Maturity and Exit Watchlist | No | Older holdings and potential exit signals. |

## Default selections
Base sections plus investment_strategy, portfolio_snapshot, and deal_activity. Optional sections remain off by default.

## Notes
- Content should surface patterns across the portfolio, not a generic firm profile.
- See `docs/brief-specs/pe-brief.md` for section-level guidance.
