/**
 * Shared Types - Common types used across all sections
 * of the Company Intelligence Sheet generation system
 */

// ============================================================================
// COMMON ENUMS AND TYPES
// ============================================================================

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type FxSource = 'A' | 'B' | 'C';
// A = Company-disclosed rate
// B = Bloomberg/Reuters historical average
// C = Current spot rate

export type IndustrySource = 'A' | 'B' | 'C';
// A = True industry dataset (e.g., Damodaran)
// B = Peer set average
// C = Estimated/derived

export type TrendDirection = 'Positive' | 'Negative' | 'Neutral';

export type Priority = 'High' | 'Medium' | 'Low';

export type Magnitude = 'Significant' | 'Moderate' | 'Minor';

export type NewsCategory = 
  | 'Investment'
  | 'M&A'
  | 'Operations'
  | 'Product'
  | 'Partnership'
  | 'Regulatory'
  | 'People'
  | 'Sustainability';

export type BulletCategory = 
  | 'Geography'
  | 'Financial'
  | 'Strategic'
  | 'Competitive'
  | 'Risk'
  | 'Momentum';

export type SourceType = 
  | 'filing'
  | 'transcript'
  | 'analyst_report'
  | 'news'
  | 'user_provided'
  | 'government';

// ============================================================================
// SHARED INTERFACES
// ============================================================================

export interface Confidence {
  level: ConfidenceLevel;
  reason: string;
}

export interface SourceReference {
  id: string;              // "S1", "S2", "S3", etc.
  citation: string;
  url?: string;
  type: SourceType;
  date: string;
}

export interface AnalystQuote {
  quote: string;           // Max 15 words (HARD LIMIT)
  analyst: string;         // Analyst name
  firm: string;            // Firm name
  source: string;          // S# reference
}

export interface Trend {
  trend: string;
  description: string;
  direction: TrendDirection;
  impact_score: number;    // 1-10
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

// ============================================================================
// COMPANY BASICS
// ============================================================================

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

// ============================================================================
// FINANCIAL DATA
// ============================================================================

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

// ============================================================================
// FX AND INDUSTRY AVERAGES
// ============================================================================

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

// ============================================================================
// OPPORTUNITIES (SKU MAPPING)
// ============================================================================

export interface Opportunity {
  issue_area: string;
  public_problem: string;
  source: string;
  aligned_sku: string;
  priority: Priority;
  severity: number;        // 1-10
  severity_rationale: string;
  geography_relevance: string;
  potential_value_levers: string[];
}

// ============================================================================
// NEWS
// ============================================================================

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

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Type guard for confidence level
 */
export function isConfidenceLevel(value: any): value is ConfidenceLevel {
  return ['HIGH', 'MEDIUM', 'LOW'].includes(value);
}

/**
 * Type guard for FX source
 */
export function isFxSource(value: any): value is FxSource {
  return ['A', 'B', 'C'].includes(value);
}

/**
 * Type guard for trend direction
 */
export function isTrendDirection(value: any): value is TrendDirection {
  return ['Positive', 'Negative', 'Neutral'].includes(value);
}

/**
 * Type guard for priority
 */
export function isPriority(value: any): value is Priority {
  return ['High', 'Medium', 'Low'].includes(value);
}

/**
 * Type guard for magnitude
 */
export function isMagnitude(value: any): value is Magnitude {
  return ['Significant', 'Moderate', 'Minor'].includes(value);
}

/**
 * Type guard for source reference
 */
export function isSourceReference(value: any): value is SourceReference {
  return (
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.citation === 'string' &&
    typeof value.type === 'string' &&
    typeof value.date === 'string'
  );
}

/**
 * Type guard for analyst quote
 */
export function isAnalystQuote(value: any): value is AnalystQuote {
  if (typeof value !== 'object') return false;
  
  // Check quote length (max 15 words)
  const wordCount = value.quote?.split(/\s+/).length || 0;
  if (wordCount > 15) return false;
  
  return (
    typeof value.quote === 'string' &&
    typeof value.analyst === 'string' &&
    typeof value.firm === 'string' &&
    typeof value.source === 'string'
  );
}

/**
 * Validates impact score is between 1-10
 */
export function isValidImpactScore(score: any): score is number {
  return typeof score === 'number' && score >= 1 && score <= 10;
}

/**
 * Validates severity score is between 1-10
 */
export function isValidSeverityScore(score: any): score is number {
  return typeof score === 'number' && score >= 1 && score <= 10;
}
