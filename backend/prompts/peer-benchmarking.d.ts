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
    fx_source: 'A' | 'B' | 'C';
    industry_source: 'A' | 'B' | 'C';
}
export interface Section6Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section2Context: Section2Context;
}
export interface PeerInfo {
    name: string;
    ticker?: string;
    geography_presence: string;
    geography_revenue_pct?: number;
}
export interface PeerMetric {
    metric: string;
    company: number | string;
    peer1: number | string;
    peer2: number | string;
    peer3: number | string;
    peer4?: number | string;
    industry_avg: number | string;
    source: string;
}
export interface KeyStrength {
    strength: string;
    description: string;
    geography_context: string;
}
export interface KeyGap {
    gap: string;
    description: string;
    geography_context: string;
    magnitude: 'Significant' | 'Moderate' | 'Minor';
}
export interface Section6Output {
    confidence: {
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
    };
    peer_comparison_table: {
        company_name: string;
        peers: PeerInfo[];
        metrics: PeerMetric[];
    };
    benchmark_summary: {
        overall_assessment: string;
        key_strengths: KeyStrength[];
        key_gaps: KeyGap[];
        competitive_positioning: string;
    };
    sources_used: string[];
}
export declare function buildPeerBenchmarkingPrompt(input: Section6Input): string;
export declare function validateSection6Output(output: any): output is Section6Output;
export declare function formatSection6ForDocument(output: Section6Output): string;
export declare function compareMetric(output: Section6Output, metricName: string): {
    company: number | string;
    peerMin: number | string;
    peerMax: number | string;
    peerAvg: number | string;
    industryAvg: number | string;
} | null;
export declare function getOutperformingMetrics(output: Section6Output): string[];
//# sourceMappingURL=peer-benchmarking.d.ts.map