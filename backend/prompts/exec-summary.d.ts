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
}
export interface Section2Output {
    confidence: {
        level: string;
        reason: string;
    };
    summary: string;
    kpi_table: {
        metrics: Array<any>;
    };
}
export interface Section3Output {
    business_description: {
        overview: string;
        segments: Array<any>;
        geography_positioning: string;
    };
    strategic_priorities: {
        summary: string;
        priorities: Array<any>;
    };
}
export interface Section4Output {
    overview: string;
    segments: Array<{
        name: string;
        performance_analysis: {
            paragraphs: string[];
            key_drivers: string[];
        };
    }>;
}
export interface Section5Output {
    aggregate_summary: string;
    company_trends: {
        summary: string;
        trends: Array<{
            trend: string;
            direction: string;
            impact_score: number;
            geography_relevance: string;
        }>;
    };
}
export interface Section6Output {
    benchmark_summary: {
        overall_assessment: string;
        key_strengths: Array<{
            strength: string;
            geography_context: string;
        }>;
        key_gaps: Array<{
            gap: string;
            magnitude: string;
            geography_context: string;
        }>;
        competitive_positioning: string;
    };
}
export interface Section7Output {
    opportunities: Array<{
        issue_area: string;
        priority: string;
        severity: number;
        geography_relevance: string;
    }>;
}
export interface Section8Output {
    news_items: Array<{
        date: string;
        headline: string;
        category: string;
        geography_relevance: string;
    }>;
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
export type BulletCategory = 'Geography' | 'Financial' | 'Strategic' | 'Competitive' | 'Risk' | 'Momentum';
export interface ExecutiveBullet {
    bullet: string;
    category: BulletCategory;
    supporting_sections: string[];
    sources: string[];
}
export interface Section1Output {
    confidence: {
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
    };
    bullet_points: ExecutiveBullet[];
    sources_used: string[];
}
export declare function buildExecSummaryPrompt(input: Section1Input): string;
export declare function validateSection1Output(output: any): output is Section1Output;
export declare function formatSection1ForDocument(output: Section1Output): string;
export declare function getBulletsByCategory(output: Section1Output, category: BulletCategory): ExecutiveBullet[];
export declare function getReferencedSections(output: Section1Output): string[];
export declare function getGeographyBullets(output: Section1Output): ExecutiveBullet[];
//# sourceMappingURL=exec-summary.d.ts.map