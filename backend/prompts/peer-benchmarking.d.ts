/**
 * Section 6: Peer Benchmarking - TypeScript Implementation
 * Generates prompt and types for Peer Benchmarking section
 */
import { type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';
export interface Section2Context {
    kpi_table: {
        metrics: Array<{
            metric: string;
            company: number | string | null;
            industry_avg: number | string | null;
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
    section2: Section2Context;
    reportType?: ReportTypeId;
}
export interface PeerInfo {
    name: string;
    ticker?: string;
    geography_presence: string;
    geography_revenue_pct?: number;
}
export interface PeerMetric {
    metric: string;
    company: number | string | null;
    peer1: number | string | null;
    peer2: number | string | null;
    peer3: number | string | null;
    peer4?: number | string | null;
    industry_avg: number | string | null;
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
/**
 * Compares company performance vs peers for a specific metric
 */
export declare function compareMetric(output: Section6Output, metricName: string): {
    company: number | string | null;
    peerMin: number | string | null;
    peerMax: number | string | null;
    peerAvg: number | string | null;
    industryAvg: number | string | null;
} | null;
/**
 * Identifies metrics where company outperforms peers
 */
export declare function getOutperformingMetrics(output: Section6Output): string[];
