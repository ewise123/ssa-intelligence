export type ReportTypeId = 'GENERIC' | 'INDUSTRIALS' | 'PE' | 'FS' | 'INSURANCE';
export type SectionId = 'foundation' | 'exec_summary' | 'financial_snapshot' | 'company_overview' | 'key_execs_and_board' | 'investment_strategy' | 'portfolio_snapshot' | 'deal_activity' | 'deal_team' | 'portfolio_maturity' | 'leadership_and_governance' | 'strategic_priorities' | 'operating_capabilities' | 'distribution_analysis' | 'segment_analysis' | 'trends' | 'peer_benchmarking' | 'sku_opportunities' | 'recent_news' | 'conversation_starters' | 'appendix';
type AddendumMap = Record<SectionId, Partial<Record<ReportTypeId, string>>>;
export declare const REPORT_TYPE_ADDENDUMS: AddendumMap;
export declare function appendReportTypeAddendum(sectionId: SectionId, reportType: ReportTypeId | undefined, basePrompt: string): string;
export {};
