export const REPORT_TYPE_ADDENDUMS = {
    foundation: {
        INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Prioritize industrial sector context, manufacturing footprint, supply chain dynamics, and automation themes.
- Emphasize industrial OEM and B2B customer exposure, end-market cyclicality, and capex intensity.
- Capture plant-level or facilities data where available and tie to regional production indicators.`,
        FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Prioritize business line mix (banking, wealth, payments), regulatory context, and capital constraints.
- Emphasize operating efficiency, digital transformation, and leadership priorities from earnings materials.
- Capture business unit metrics and market positioning by segment where disclosed.`,
        PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Prioritize firm strategy, portfolio composition, recent acquisitions, and platform vs add-on patterns.
- Emphasize value-creation themes, operating model signals, and leadership/operating partner moves.
- Capture deal announcements and portfolio news as primary sources.`,
        GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Focus only on the most relevant context for the meeting or stated topic of interest.
- Prefer high-signal sources and avoid exhaustive data collection when it does not change the narrative.
- Keep foundation insights concise and directly tied to near-term priorities.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Prioritize lines of business (Life, P&C, Health, Reinsurance), underwriting discipline, and reserve adequacy.
- Emphasize combined ratio components, investment portfolio composition, and regulatory solvency context.
- Capture distribution channel mix (agents, brokers, direct) and catastrophe exposure where disclosed.`
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
- Keep language concise and decision-oriented.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Emphasize underwriting results, investment income performance, and capital position.
- Frame insights around combined ratio drivers, reserve adequacy, and rate environment.
- Keep questions hypothesis-driven and grounded in insurance-specific operating metrics.`
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
- Prefer concise tables and short interpretation over exhaustive coverage.
- Keep the summary focused on 2-3 material drivers within the 4-6 sentence limit.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Emphasize combined ratio, loss ratio, expense ratio, investment yield, and solvency ratios.
- Use insurance-specific metrics: gross/net written premiums, reserve development, policy retention.
- Do NOT include banking metrics (NIM, CET1) unless the company has banking operations.`
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
- Limit segments to the most relevant and high-signal items.
- Avoid deep dives; keep descriptions short and decision-oriented.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Frame as insurer overview with lines of business (Life, P&C, Health, Specialty, Reinsurance).
- Emphasize distribution channels (captive agents, independent brokers, bancassurance, direct).
- Highlight geographic exposure, catastrophe-prone regions, and regulatory jurisdictions.`
    },
    key_execs_and_board: {
        INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Emphasize COO and operations leaders with plant/manufacturing responsibility.
- Highlight leaders focused on supply chain, automation, and capacity expansion.
- Include VP-level manufacturing and quality leaders if disclosed.
- Note board members with industrial operations or manufacturing backgrounds.`,
        PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Emphasize Operating Partners and their value-creation track records.
- Highlight board composition (sponsor representatives vs. independent directors).
- Focus on performance improvement actions and operational transformation initiatives.
- Include portfolio company oversight roles and investment committee members.`,
        FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Emphasize Chief Risk Officer, Chief Compliance Officer, and regulatory-facing leaders.
- Highlight board risk committee composition and expertise.
- Focus on digital transformation and efficiency improvement leaders.
- Note executives with regulatory relationships and compliance backgrounds.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Emphasize Chief Underwriting Officer, Chief Actuary, and Chief Claims Officer.
- Highlight board members with actuarial or insurance regulatory backgrounds.
- Focus on leaders driving combined ratio improvement and claims automation.
- Note executives responsible for distribution strategy and InsurTech initiatives.`,
        GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Focus on the most senior executives and board members.
- Prioritize leaders most relevant to the meeting context.
- Keep background summaries concise and decision-relevant.
- Emphasize recent leadership changes and their strategic implications.`
    },
    investment_strategy: {
        PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Emphasize platform vs add-on patterns, sector theses, and value-creation levers.`
    },
    portfolio_snapshot: {
        PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Emphasize platform vs add-on status and sector clustering.`
    },
    deal_activity: {
        PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Emphasize platform/add-on/exit classification and deal cadence.`
    },
    deal_team: {
        PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Emphasize partners, operating partners, and sector leads tied to the target.`
    },
    portfolio_maturity: {
        PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Emphasize holding period signals, exit watchlist cues, and sponsor intent.`
    },
    leadership_and_governance: {
        FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Emphasize compliance, risk, and governance oversight signals.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Emphasize Chief Underwriting Officer, Chief Actuary, and Chief Claims Officer roles.
- Highlight regulatory relationships, board risk committee composition, and compliance leadership.`
    },
    strategic_priorities: {
        FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Emphasize digital, risk/compliance, and revenue-mix priorities.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Emphasize digital distribution, claims automation, and product simplification priorities.
- Include InsurTech partnerships, embedded insurance strategies, and customer experience initiatives.`
    },
    operating_capabilities: {
        FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Emphasize risk, compliance, digital, and operating efficiency capabilities.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Emphasize underwriting platforms, claims handling systems, and actuarial capabilities.
- Include distribution technology, customer self-service, and fraud detection capabilities.`
    },
    segment_analysis: {
        INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Maintain segment-level operational performance focus and competitor framing.
- Emphasize capacity, efficiency, and industrial end-market dynamics.`,
        FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Use segments aligned to business lines (banking, wealth, payments).
- Focus on performance drivers, operating pressure, and regulatory exposure per segment.`,
        PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Use portfolio clusters or sector buckets instead of traditional product segments.
- Emphasize operating complexity and value-creation themes within clusters.`,
        GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Limit to key segments only; focus on the most material drivers and context.
- Keep segment narratives brief and avoid excess detail.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Use segments aligned to lines of business (Personal Lines, Commercial Lines, Life & Annuities, etc.).
- Focus on loss ratios, pricing adequacy, and reserve development per line.
- Highlight catastrophe exposure and reinsurance arrangements per segment.`
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
- Include only 2-4 high-impact trends; explain why they matter now.
- Keep trend rationale concise.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Emphasize rate hardening/softening cycles, claims inflation, and regulatory changes.
- Include climate and catastrophe trends affecting loss experience.
- Tie trends to underwriting discipline and investment portfolio repositioning.`
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
- Keep peer set small and focus on 2-3 differentiators.
- Keep benchmarking commentary brief and high-signal.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Compare against insurance peers using combined ratio, ROE, and solvency metrics.
- Highlight distribution mix differences and geographic concentration.
- Avoid forcing banking comparisons unless company is a bancassurer.`
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
- Limit to 1-3 themes; prioritize relevance to the stated context.
- Keep issue descriptions short and direct.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Map claims processing, underwriting modernization, and distribution challenges to SSA problem areas.
- Emphasize actuarial and pricing capabilities, fraud detection, and customer experience.
- Keep alignment analytical and non-prescriptive.`
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
- Keep concise; include only news tied to the meeting context.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Emphasize catastrophe events, reserve charges, rate filings, and regulatory actions.
- Highlight M&A activity, distribution partnerships, and InsurTech investments.`
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
- Keep questions short, focused, and tied to immediate context.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Use call-ready questions tied to underwriting results, claims trends, or distribution strategy.
- Frame around combined ratio improvement, reserve adequacy, and capital deployment.`
    },
    appendix: {
        INDUSTRIALS: `## REPORT TYPE ADDENDUM: INDUSTRIALS
- Include sources tied to operations, manufacturing footprint, and industrial benchmarks.`,
        FS: `## REPORT TYPE ADDENDUM: FINANCIAL SERVICES
- Include filings, earnings materials, regulatory docs, and credible news.`,
        PE: `## REPORT TYPE ADDENDUM: PRIVATE EQUITY
- Include deal announcements, firm press, portfolio news, and Pitchbook-style sources.`,
        GENERIC: `## REPORT TYPE ADDENDUM: GENERIC
- Include only sources referenced in sections.`,
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Include statutory filings, AM Best reports, regulatory docs, and credible insurance trade news.
- Highlight catastrophe and claims data sources where used.`
    },
    distribution_analysis: {
        INSURANCE: `## REPORT TYPE ADDENDUM: INSURANCE
- Analyze distribution channel mix: captive agents, independent brokers, direct-to-consumer, bancassurance.
- Include premium share by channel where disclosed.
- Highlight digital distribution capabilities and InsurTech partnerships.
- Note any exclusive distribution agreements or key broker relationships.
- Compare distribution cost efficiency to peers if data available.`
    }
};
export function appendReportTypeAddendum(sectionId, reportType, basePrompt) {
    const prompt = typeof basePrompt === 'string' ? basePrompt : String(basePrompt ?? '');
    if (!reportType)
        return prompt;
    const addendum = REPORT_TYPE_ADDENDUMS[sectionId]?.[reportType];
    if (!addendum)
        return prompt;
    const marker = '## CRITICAL INSTRUCTIONS';
    const insertion = `${marker}\n\n### CRITICAL REPORT TYPE ADDENDUM\n\n${addendum}\n\n`;
    if (prompt.includes(marker)) {
        return prompt.replace(marker, insertion);
    }
    return `${prompt}\n\n---\n\n${addendum}\n`;
}
//# sourceMappingURL=report-type-addendums.js.map