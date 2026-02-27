/**
 * Complete TypeScript Type Definitions
 * All interfaces for Company Intelligence Sheet generation system
 */
import { Confidence, SourceReference, AnalystQuote, Trend, Competitor, CompanyBasics, GeographySpecifics, SegmentStructure, FinancialMetric, SegmentFinancialMetric, DerivedMetric, FxRate, FxRateDetailed, IndustryAverages, IndustryAveragesDetailed, Opportunity, NewsItem, Magnitude, BulletCategory, FxSource, IndustrySource } from './shared-types.js';
export interface FoundationOutput {
    confidence: Confidence;
    company_basics: CompanyBasics;
    geography_specifics: GeographySpecifics;
    source_catalog: SourceReference[];
    segment_structure: SegmentStructure[];
    fx_rates: Record<string, FxRate>;
    industry_averages: IndustryAverages;
}
export interface ExecutiveBullet {
    bullet: string;
    category: BulletCategory;
    supporting_sections: string[];
    sources: string[];
}
export interface Section1Output {
    confidence: Confidence;
    bullet_points: ExecutiveBullet[];
    sources_used: string[];
}
export interface Section1Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section2: Section2Output;
    section3: Section3Output;
    section4?: Section4Output;
    section5?: Section5Output;
    section6?: Section6Output;
    section7?: Section7Output;
    section8?: Section8Output;
}
export interface Section2Output {
    confidence: Confidence;
    summary: string;
    kpi_table: {
        metrics: FinancialMetric[];
    };
    fx_source: FxSource;
    industry_source: IndustrySource;
    derived_metrics: DerivedMetric[];
    sources_used: string[];
}
export interface Section2Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
}
export interface BusinessSegment {
    name: string;
    description: string;
    revenue_pct: number | null;
    geography_relevance: string;
}
export interface StrategicPriority {
    priority: string;
    description: string;
    geography_relevance: string;
    geography_relevance_rating: 'High' | 'Medium' | 'Low';
    source: string;
}
export interface BriefExecutive {
    name: string;
    title: string;
    tenure?: string;
    source: string;
}
export interface BriefRegionalLeader {
    name: string;
    title: string;
    source: string;
}
export interface Section3Output {
    confidence: Confidence;
    business_description: {
        overview: string;
        segments: BusinessSegment[];
        geography_positioning: string;
    };
    geographic_footprint: {
        summary: string;
        facilities: Array<{
            name: string;
            location: string;
            type: 'Manufacturing' | 'R&D' | 'Distribution' | 'Office' | 'Headquarters';
            employees?: number;
            capabilities?: string;
        }>;
        regional_stats: string;
    };
    strategic_priorities: {
        summary: string;
        priorities: StrategicPriority[];
        geography_specific_initiatives: string;
    };
    key_leadership: {
        summary: string;
        executives: BriefExecutive[];
        regional_leader?: BriefRegionalLeader | null;
    };
    sources_used: string[];
}
export interface Section3Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
}
export interface BoardMember {
    name: string;
    role: string;
    committees: string[];
    background: string;
    tenure: string;
    other_boards: string[];
    source: string;
}
export interface CSuiteExecutive {
    name: string;
    title: string;
    role_description: string;
    background: string;
    tenure: string;
    performance_actions: string[];
    geography_relevance?: 'High' | 'Medium' | 'Low';
    source: string;
}
export interface BusinessUnitLeader {
    name: string;
    title: string;
    business_unit: string;
    role_description: string;
    background: string;
    performance_actions: string[];
    geography_relevance?: 'High' | 'Medium' | 'Low';
    source: string;
}
export interface LeadershipChange {
    date: string;
    change_type: 'New Hire' | 'Departure' | 'Promotion' | 'Reorganization';
    description: string;
    implications: string;
    source: string;
}
export interface KeyExecsAndBoardOutput {
    confidence: Confidence;
    board_of_directors: {
        summary: string;
        members: BoardMember[];
    };
    c_suite: {
        summary: string;
        executives: CSuiteExecutive[];
    };
    business_unit_leaders: {
        summary: string;
        leaders: BusinessUnitLeader[];
    };
    recent_leadership_changes: LeadershipChange[];
    sources_used: string[];
}
export interface KeyExecsAndBoardInput {
    foundation: FoundationOutput;
    companyName: string;
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
    confidence: Confidence;
    overview: string;
    segments: SegmentAnalysis[];
    sources_used: string[];
}
export interface Section4Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section2?: Section2Output;
}
export interface MacroTrend extends Trend {
}
export interface MicroTrend extends Trend {
    segment_relevance?: string;
}
export interface CompanyTrend extends Trend {
    management_commentary?: string;
    analyst_quote?: AnalystQuote;
}
export interface Section5Output {
    confidence: Confidence;
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
export interface Section5Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section3?: Section3Output;
    section4?: Section4Output;
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
    magnitude: Magnitude;
}
export interface Section6Output {
    confidence: Confidence;
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
export interface Section6Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section2: Section2Output;
}
export interface Section7Output {
    confidence: Confidence;
    opportunities: Opportunity[];
    sources_used: string[];
}
export interface Section7Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section5?: Section5Output;
    section6?: Section6Output;
}
export interface Section8Output {
    confidence: Confidence;
    news_items: NewsItem[];
    sources_used: string[];
}
export interface Section8Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
}
export interface ConversationStarter {
    title: string;
    question: string;
    supporting_data: string;
    business_value: string;
    ssa_capability?: string;
    supporting_sections: string[];
    sources: string[];
    geography_relevance: string;
}
export interface Section9Output {
    confidence: Confidence;
    conversation_starters: ConversationStarter[];
    sources_used: string[];
}
export interface Section9Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section5?: Section5Output;
    section6?: Section6Output;
    section7?: Section7Output;
    section2?: Section2Output;
    section4?: Section4Output;
}
export interface SourceReferenceDetailed extends SourceReference {
    sections_used_in: string[];
}
export interface Section10Output {
    confidence: Confidence;
    source_references: SourceReferenceDetailed[];
    fx_rates_and_industry: {
        fx_rates: FxRateDetailed[];
        industry_averages: IndustryAveragesDetailed;
    };
    derived_metrics: Array<DerivedMetric & {
        section: string;
    }>;
    renumbering_notes?: string;
}
export interface Section10Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    sections: {
        section1?: Section1Output;
        section2?: Section2Output;
        section3?: Section3Output;
        section4?: Section4Output;
        section5?: Section5Output;
        section6?: Section6Output;
        section7?: Section7Output;
        section8?: Section8Output;
        section9?: Section9Output;
    };
}
export interface CompleteResearchOutput {
    foundation: FoundationOutput;
    section1: Section1Output;
    section2: Section2Output;
    section3: Section3Output;
    section4: Section4Output;
    section5: Section5Output;
    section6: Section6Output;
    section7: Section7Output;
    section8: Section8Output;
    section9: Section9Output;
    section10: Section10Output;
    metadata: {
        company_name: string;
        geography: string;
        generated_date: string;
        all_sections_complete: boolean;
    };
}
