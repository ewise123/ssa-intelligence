/**
 * Shared Types - Common types used across all sections
 * of the Company Intelligence Sheet generation system
 */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type FxSource = 'A' | 'B' | 'C';
export type IndustrySource = 'A' | 'B' | 'C';
export type TrendDirection = 'Positive' | 'Negative' | 'Neutral';
export type Priority = 'High' | 'Medium' | 'Low';
export type Magnitude = 'Significant' | 'Moderate' | 'Minor';
export type NewsCategory = 'Investment' | 'M&A' | 'Operations' | 'Product' | 'Partnership' | 'Regulatory' | 'People' | 'Sustainability';
export type BulletCategory = 'Geography' | 'Financial' | 'Strategic' | 'Competitive' | 'Risk' | 'Momentum';
export type SourceType = 'filing' | 'transcript' | 'analyst_report' | 'news' | 'user_provided' | 'government';
export interface Confidence {
    level: ConfidenceLevel;
    reason: string;
}
export interface SourceReference {
    id: string;
    citation: string;
    url?: string | null;
    type: SourceType;
    date: string;
}
export interface AnalystQuote {
    quote: string;
    analyst: string;
    firm: string;
    source: string;
}
export interface Trend {
    trend: string;
    description: string;
    direction: TrendDirection;
    impact_score: number | null;
    geography_relevance: string;
    source: string;
}
export interface Competitor {
    name: string;
    market_share?: string | null;
    geography: string;
}
export interface FacilityInfo {
    name: string;
    location: string;
    type: string;
}
export interface CompanyBasics {
    legal_name: string;
    ticker?: string;
    ownership: 'Public' | 'Private' | 'Subsidiary';
    headquarters: string;
    global_revenue_usd: number | string | null;
    global_employees: number | null;
    fiscal_year_end: string;
}
export interface GeographySpecifics {
    regional_revenue_usd: number | string | null;
    regional_revenue_pct: number | null;
    regional_employees: number | null;
    facilities: FacilityInfo[];
    key_facts: string[];
}
export interface SegmentStructure {
    name: string;
    revenue_pct: number | null;
    description: string;
}
export interface FinancialMetric {
    metric: string;
    company: number | string | null;
    industry_avg: number | string | null;
    source: string;
    unit?: string;
    value_type?: 'currency' | 'percent' | 'ratio' | 'number';
    currency?: string | null;
}
export interface SegmentFinancialMetric {
    metric: string;
    segment: number | string | null;
    company_avg: number | string | null;
    industry_avg: number | string | null;
    source: string;
    currency?: string | null;
    unit?: string;
    value_type?: 'currency' | 'percent' | 'ratio' | 'number';
}
export interface DerivedMetric {
    metric: string;
    formula: string;
    calculation: string;
    source: string;
}
export interface FxRate {
    rate: number | null;
    source: FxSource;
}
export interface FxRateDetailed {
    currency_pair: string;
    rate: number | null;
    source: FxSource;
    source_description: string;
}
export interface IndustryAverages {
    source: IndustrySource;
    dataset: string;
}
export interface IndustryAveragesDetailed {
    source: IndustrySource;
    dataset: string;
    description: string;
}
export interface Opportunity {
    issue_area: string;
    public_problem: string;
    source: string;
    aligned_sku: string;
    priority: Priority;
    severity: number | null;
    severity_rationale: string;
    geography_relevance: string;
    potential_value_levers: string[];
}
export interface NewsItem {
    date: string;
    headline: string;
    original_language?: string;
    source: string;
    source_name: string;
    implication: string;
    geography_relevance: string;
    category: NewsCategory;
}
/**
 * Type guard for confidence level
 */
export declare function isConfidenceLevel(value: any): value is ConfidenceLevel;
/**
 * Type guard for FX source
 */
export declare function isFxSource(value: any): value is FxSource;
/**
 * Type guard for trend direction
 */
export declare function isTrendDirection(value: any): value is TrendDirection;
/**
 * Type guard for priority
 */
export declare function isPriority(value: any): value is Priority;
/**
 * Type guard for magnitude
 */
export declare function isMagnitude(value: any): value is Magnitude;
/**
 * Type guard for source reference
 */
export declare function isSourceReference(value: any): value is SourceReference;
/**
 * Type guard for analyst quote
 */
export declare function isAnalystQuote(value: any): value is AnalystQuote;
/**
 * Validates impact score is between 1-10
 */
export declare function isValidImpactScore(score: any): score is number;
/**
 * Validates severity score is between 1-10
 */
export declare function isValidSeverityScore(score: any): score is number;
