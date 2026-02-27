/**
 * Section 4: Segment Analysis - TypeScript Implementation
 * Comprehensive implementation with fallback strategy for large responses
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
    summary: string;
}
export interface Section4Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section2?: Section2Context;
    reportType?: ReportTypeId;
}
export interface SegmentFinancialMetric {
    metric: string;
    segment: number | string | null;
    company_avg: number | string | null;
    industry_avg: number | string | null;
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
/**
 * Builds comprehensive prompt attempting all segments in one call
 */
export declare function buildSegmentAnalysisPrompt(input: Section4Input): string;
/**
 * Builds fallback prompt for individual segment
 * Used when comprehensive prompt truncates
 */
export declare function buildSection4SegmentPrompt(input: Section4Input, segmentName: string): string;
export declare function validateSection4Output(output: any): output is Section4Output;
export declare function validateSegmentOutput(output: any): output is SegmentAnalysis;
export declare function formatSection4ForDocument(output: Section4Output): string;
/**
 * Combines multiple segment outputs into complete Section 4
 */
export declare function combineSegmentOutputs(overview: string, segments: SegmentAnalysis[], confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
}): Section4Output;
/**
 * Gets segment by name
 */
export declare function getSegmentByName(output: Section4Output, segmentName: string): SegmentAnalysis | undefined;
/**
 * Compares segment performance vs company average
 */
export declare function compareSegmentToCompany(segment: SegmentAnalysis, metricName: string): {
    segment: number | string | null;
    company: number | string | null;
    delta: number | string;
} | null;
