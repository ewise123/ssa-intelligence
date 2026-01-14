export const REPORT_TYPE_ADDENDUMS = {
  foundation: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Prioritize industrial sector context, manufacturing footprint, supply chain dynamics, and automation themes.
- Emphasize industrial OEM and B2B customer exposure, end-market cyclicality, and capex intensity.
- Capture plant-level or facilities data where available and tie to regional production indicators.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Prioritize business line mix (banking, insurance, wealth, payments), regulatory context, and capital constraints.
- Emphasize operating efficiency, digital transformation, and leadership priorities from earnings materials.
- Capture business unit metrics and market positioning by segment where disclosed.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Prioritize firm strategy, portfolio composition, recent acquisitions, and platform vs add-on patterns.
- Emphasize value-creation themes, operating model signals, and leadership/operating partner moves.
- Capture deal announcements and portfolio news as primary sources.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Focus only on the most relevant context for the meeting or stated topic of interest.
- Prefer high-signal sources and avoid exhaustive data collection when it does not change the narrative.
- Keep foundation insights concise and directly tied to near-term priorities.`
  },
  exec_summary: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Keep output as close to current Industrials brief tone and structure as possible.
- Emphasize manufacturing footprint, operational efficiency, and supply chain or capacity themes.
- Highlight industrial end-market demand signals and competitive positioning.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Emphasize business model and revenue drivers, performance pressure, and regulatory context.
- Frame insights as hypotheses for leadership discussion; keep tone analytical and non-prescriptive.
- Highlight transformation priorities and leadership attention signals.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Synthesize portfolio direction, value-creation themes, and operating signals.
- Emphasize patterns across the portfolio and near-term momentum.
- Keep questions hypothesis-driven and grounded in deal/portfolio evidence.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Produce 4-6 high-signal bullets only; prioritize immediacy and relevance to the context.
- Avoid exhaustive coverage; focus on key risks, priorities, and recent changes.
- Keep language concise and decision-oriented.`
  },
  financial_snapshot: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Preserve current metric depth and industrial benchmark comparisons.
- Emphasize working capital efficiency, utilization, and margin drivers tied to operations.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Emphasize revenue mix, margins/efficiency ratios, and capital or regulatory metrics.
- Interpret drivers behind performance rather than listing metrics.
- Use segment or business-line metrics where available.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Focus on portfolio-level signals (fund size, acquisition cadence, scale) when public.
- Keep metrics limited and interpretive; avoid forcing detailed line-item KPIs.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Include only material metrics tied to the topic of interest.
- Prefer concise tables and short interpretation over exhaustive coverage.`
  },
  company_overview: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Emphasize industrial product lines, manufacturing footprint, and end-market exposure.
- Keep segment detail and geography positioning aligned with current Industrials outputs.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Frame as institution overview and business model (business lines, revenue drivers).
- Emphasize regulatory context, geographic footprint, and operating priorities.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Frame as firm overview and portfolio composition (platform vs add-on, sector focus).
- Highlight investment strategy and operating model signals.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Keep overview concise and context-specific; prioritize key products/services and segments.
- Limit segments to the most relevant and high-signal items.`
  },
  segment_analysis: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Maintain segment-level operational performance focus and competitor framing.
- Emphasize capacity, efficiency, and industrial end-market dynamics.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Use segments aligned to business lines (banking, insurance, wealth, payments).
- Focus on performance drivers, operating pressure, and regulatory exposure per segment.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Use portfolio clusters or sector buckets instead of traditional product segments.
- Emphasize operating complexity and value-creation themes within clusters.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Limit to key segments only; focus on the most material drivers and context.`
  },
  trends: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Emphasize industrial production indicators, automation, supply chain, and capex cycles.
- Tie trends to operational impact and capacity utilization.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Emphasize regulatory, market, and competitive forces affecting the institution.
- Tie trends to operating pressure, capital, and transformation priorities.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Emphasize deal environment, sector tailwinds/headwinds, and value-creation themes.
- Tie trends to portfolio exposure and strategy.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Include only 2-4 high-impact trends; explain why they matter now.`
  },
  peer_benchmarking: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Keep peer set focused on industrial comparables and operational metrics.
- Emphasize capacity, margin structure, and regional share.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Compare against relevant financial peers and operating ratios.
- Highlight business-line mix or regulatory positioning differences.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Compare to peer firms or similar portfolio strategies where meaningful.
- Avoid forcing detailed financial comparisons if not available.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Keep peer set small and focus on 2-3 differentiators.`
  },
  sku_opportunities: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Preserve current operational issue framing and SKU alignment style.
- Emphasize efficiency, throughput, and supply chain constraints.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Map operating tensions to SSA problem areas (1-3 SKUs per theme).
- Keep alignment analytical and non-prescriptive.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Translate value-creation themes into SSA-relevant problem areas.
- Focus on operating model improvements and transformation themes.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Limit to 1-3 themes; prioritize relevance to the stated context.`
  },
  recent_news: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Emphasize operational investments, capacity changes, and supply chain moves.
- Focus on regional facility and manufacturing-related developments.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Emphasize earnings commentary, regulatory updates, and leadership changes.
- Highlight market positioning and transformation announcements.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Emphasize deal announcements, portfolio news, and firm press releases.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Keep concise; include only news tied to the meeting context.`
  },
  conversation_starters: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Keep tone practical and operational; align with current Industrials output style.
- Focus on execution risks, capacity, and end-market signals.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Use call-ready questions tied to performance signals, leadership focus, or regulatory context.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Use hypothesis-driven questions about portfolio patterns and operating themes.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Keep questions short, focused, and tied to immediate context.`
  },
  appendix: {
    INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Include sources tied to operations, manufacturing footprint, and industrial benchmarks.`,
    FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Include filings, earnings materials, regulatory docs, and credible news.`,
    PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Include deal announcements, firm press, portfolio news, and Pitchbook-style sources.`,
    GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Include only sources referenced in sections.`
  }
};

export function appendReportTypeAddendum(sectionId, reportType, basePrompt) {
  if (!reportType) return basePrompt;
  const addendum = REPORT_TYPE_ADDENDUMS[sectionId]?.[reportType];
  if (!addendum) return basePrompt;
  return `${basePrompt}\n\n---\n\n${addendum}\n`;
}
