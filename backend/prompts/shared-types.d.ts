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
    url?: string;
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
    impact_score: number;
    geography_relevance: string;
    source: string;
}
export interface Competitor {
    name: string;
    market_share?: string;
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
    global_revenue_usd: number;
    global_employees: number;
    fiscal_year_end: string;
}
export interface GeographySpecifics {
    regional_revenue_usd: number;
    regional_revenue_pct: number;
    regional_employees: number;
    facilities: FacilityInfo[];
    key_facts: string[];
}
export interface SegmentStructure {
    name: string;
    revenue_pct: number;
    description: string;
}
export interface FinancialMetric {
    metric: string;
    company: number | string;
    industry_avg: number | string;
    source: string;
}
export interface SegmentFinancialMetric {
    metric: string;
    segment: number | string;
    company_avg: number | string;
    industry_avg: number | string;
    source: string;
}
export interface DerivedMetric {
    metric: string;
    formula: string;
    calculation: string;
    source: string;
}
export interface FxRate {
    rate: number;
    source: FxSource;
}
export interface FxRateDetailed {
    currency_pair: string;
    rate: number;
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
    severity: number;
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
export declare function isConfidenceLevel(value: any): value is ConfidenceLevel;
export declare function isFxSource(value: any): value is FxSource;
export declare function isTrendDirection(value: any): value is TrendDirection;
export declare function isPriority(value: any): value is Priority;
export declare function isMagnitude(value: any): value is Magnitude;
export declare function isSourceReference(value: any): value is SourceReference;
export declare function isAnalystQuote(value: any): value is AnalystQuote;
export declare function isValidImpactScore(score: any): score is number;
export declare function isValidSeverityScore(score: any): score is number;
//# sourceMappingURL=shared-types.d.ts.map