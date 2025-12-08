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
export interface Section3Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
}
export interface Section3Output {
    confidence: {
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
    };
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
    geographic_footprint: {
        summary: string;
        facilities: Array<{
            name: string;
            location: string;
            type: 'Manufacturing' | 'R&D' | 'Distribution' | 'Office' | 'Headquarters';
            description: string;
            employees?: number;
            source: string;
        }>;
        regional_stats: {
            total_facilities: number;
            total_employees: number | null;
            global_facilities_comparison: string;
        };
    };
    strategic_priorities: {
        summary: string;
        priorities: Array<{
            priority: string;
            description: string;
            geography_relevance: 'High' | 'Medium' | 'Low';
            geography_details?: string;
            source: string;
        }>;
        geography_specific_initiatives: string[];
    };
    key_leadership: {
        executives: Array<{
            name: string;
            title: string;
            background: string;
            tenure?: string;
            geography_relevance: 'High' | 'Medium' | 'Low';
            source: string;
        }>;
        regional_leaders: Array<{
            name: string;
            title: string;
            background: string;
            source: string;
        }>;
    };
    sources_used: string[];
}
export declare function buildCompanyOverviewPrompt(input: Section3Input): string;
export declare function validateSection3Output(output: any): output is Section3Output;
export declare function formatSection3ForDocument(output: Section3Output): string;
//# sourceMappingURL=company-overview.d.ts.map