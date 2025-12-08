export interface FoundationOutput {
    company_basics: {
        legal_name: string;
        ticker?: string;
        ownership: 'Public' | 'Private' | 'Subsidiary';
        headquarters: string;
        global_revenue_usd: number;
        global_employees: number;
        fiscal_year_end: string;
    };
    geography_specifics: {
        regional_revenue_usd: number;
        regional_revenue_pct: number;
        regional_employees: number;
        facilities: Array<{
            name: string;
            location: string;
            type: string;
        }>;
        key_facts: string[];
    };
    source_catalog: Array<{
        id: string;
        citation: string;
        url?: string;
        type: string;
        date: string;
    }>;
    segment_structure: Array<{
        name: string;
        revenue_pct: number;
        description: string;
    }>;
}
export interface Section3Context {
    business_description: {
        overview: string;
        segments: Array<{
            name: string;
            description: string;
            revenue_pct: number | null;
            geography_relevance: string;
        }>;
        geography_positioning: string;
    };
    strategic_priorities: {
        summary: string;
        priorities: Array<{
            priority: string;
            description: string;
            geography_relevance: string;
            source: string;
        }>;
    };
}
export interface Section4Context {
    segments: Array<{
        name: string;
        performance_drivers: string[];
        competitive_landscape: string;
        risks: string[];
    }>;
}
export interface Section5Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section3Context?: Section3Context;
    section4Context?: Section4Context;
}
export type TrendDirection = 'Positive' | 'Negative' | 'Neutral';
export interface TrendBase {
    trend: string;
    description: string;
    direction: TrendDirection;
    impact_score: number;
    geography_relevance: string;
    source: string;
}
export interface MacroTrend extends TrendBase {
}
export interface MicroTrend extends TrendBase {
    segment_relevance?: string;
}
export interface CompanyTrend extends TrendBase {
    management_commentary?: string;
    analyst_quote?: {
        quote: string;
        analyst: string;
        firm: string;
        source: string;
    };
}
export interface Section5Output {
    confidence: {
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
    };
    aggregate_summary: string;
    macro_trends: {
        summary: string;
        trends: MacroTrend[];
    };
    micro_trends: {
        summary: string;
        trends: MicroTrend[];
    };
    company_trends: {
        summary: string;
        trends: CompanyTrend[];
    };
    sources_used: string[];
}
export declare function buildTrendsPrompt(input: Section5Input): string;
export declare function validateSection5Output(output: any): output is Section5Output;
export declare function formatSection5ForDocument(output: Section5Output): string;
export declare function filterTrendsByDirection(trends: TrendBase[], direction: TrendDirection): TrendBase[];
export declare function getHighImpactTrends(trends: TrendBase[], minScore?: number): TrendBase[];
export declare function calculateAverageImpact(trends: TrendBase[]): number;
//# sourceMappingURL=trends.d.ts.map