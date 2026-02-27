/**
 * Section 5: Trends - TypeScript Implementation
 * Generates prompt and types for Trends section
 */
import { type ReportTypeId } from './report-type-addendums.js';
import type { FoundationOutput } from './types.js';
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
    section3?: Section3Context;
    section4?: Section4Context;
    reportType?: ReportTypeId;
}
export type TrendDirection = 'Positive' | 'Negative' | 'Neutral';
export interface TrendBase {
    trend: string;
    description: string;
    direction: TrendDirection;
    impact_score: number | null;
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
/**
 * Filters trends by direction
 */
export declare function filterTrendsByDirection(trends: TrendBase[], direction: TrendDirection): TrendBase[];
/**
 * Gets trends above a certain impact threshold
 */
export declare function getHighImpactTrends(trends: TrendBase[], minScore?: number): TrendBase[];
/**
 * Calculates average impact score
 */
export declare function calculateAverageImpact(trends: TrendBase[]): number;
