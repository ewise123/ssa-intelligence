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
export interface Section2Context {
    kpi_table: {
        metrics: Array<{
            metric: string;
            company: number | string;
            industry_avg: number | string;
            source: string;
        }>;
    };
    summary: string;
}
export interface Section4Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section2Context?: Section2Context;
}
export interface SegmentFinancialMetric {
    metric: string;
    segment: number | string;
    company_avg: number | string;
    industry_avg: number | string;
    source: string;
}
export interface AnalystQuote {
    quote: string;
    analyst: string;
    firm: string;
    source: string;
}
export interface Competitor {
    name: string;
    market_share?: string;
    geography: string;
}
export interface SegmentAnalysis {
    name: string;
    financial_snapshot: {
        table: SegmentFinancialMetric[];
        fx_source: string;
        geography_notes: string;
    };
    performance_analysis: {
        paragraphs: string[];
        analyst_quotes: AnalystQuote[];
        key_drivers: string[];
    };
    competitive_landscape: {
        competitors: Competitor[];
        positioning: string;
        recent_dynamics: string;
    };
}
export interface Section4Output {
    confidence: {
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
    };
    overview: string;
    segments: SegmentAnalysis[];
    sources_used: string[];
}
export declare function buildSegmentAnalysisPrompt(input: Section4Input): string;
export declare function buildSection4SegmentPrompt(input: Section4Input, segmentName: string): string;
export declare function validateSection4Output(output: any): output is Section4Output;
export declare function validateSegmentOutput(output: any): output is SegmentAnalysis;
export declare function formatSection4ForDocument(output: Section4Output): string;
export declare function combineSegmentOutputs(overview: string, segments: SegmentAnalysis[], confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
}): Section4Output;
export declare function getSegmentByName(output: Section4Output, segmentName: string): SegmentAnalysis | undefined;
export declare function compareSegmentToCompany(segment: SegmentAnalysis, metricName: string): {
    segment: number | string;
    company: number | string;
    delta: number | string;
} | null;
//# sourceMappingURL=segment-analysis.d.ts.map