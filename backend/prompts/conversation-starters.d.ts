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
export interface Section5Output {
    company_trends: {
        trends: Array<{
            trend: string;
            direction: 'Positive' | 'Negative' | 'Neutral';
            impact_score: number;
            geography_relevance: string;
            source: string;
        }>;
    };
}
export interface Section6Output {
    benchmark_summary: {
        key_strengths: Array<{
            strength: string;
            description: string;
            geography_context: string;
        }>;
        key_gaps: Array<{
            gap: string;
            description: string;
            geography_context: string;
            magnitude: string;
        }>;
        competitive_positioning: string;
    };
}
export interface Section7Output {
    opportunities: Array<{
        issue_area: string;
        public_problem: string;
        aligned_sku: string;
        priority: 'High' | 'Medium' | 'Low';
        severity: number;
        geography_relevance: string;
        potential_value_levers: string[];
    }>;
}
export interface Section9Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section5?: Section5Output;
    section6?: Section6Output;
    section7?: Section7Output;
    section2?: any;
    section4?: any;
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
    confidence: {
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
    };
    conversation_starters: ConversationStarter[];
    sources_used: string[];
}
export declare function buildConversationStartersPrompt(input: Section9Input): string;
export declare function validateSection9Output(output: any): output is Section9Output;
export declare function formatSection9ForDocument(output: Section9Output): string;
export declare function getStartersWithSSA(output: Section9Output): ConversationStarter[];
export declare function getStartersBySection(output: Section9Output, sectionName: string): ConversationStarter[];
export declare function getSSACapabilities(output: Section9Output): string[];
//# sourceMappingURL=conversation-starters.d.ts.map