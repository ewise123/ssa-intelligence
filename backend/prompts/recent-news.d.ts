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
export interface Section8Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
}
export type NewsCategory = 'Investment' | 'M&A' | 'Operations' | 'Product' | 'Partnership' | 'Regulatory' | 'People' | 'Sustainability';
export interface Section8Output {
    confidence: {
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
    };
    news_items: Array<{
        date: string;
        headline: string;
        original_language?: string;
        source: string;
        source_name: string;
        implication: string;
        geography_relevance: string;
        category: NewsCategory;
    }>;
    sources_used: string[];
}
export declare function buildRecentNewsPrompt(input: Section8Input): string;
export declare function validateSection8Output(output: any): output is Section8Output;
export declare function formatSection8ForDocument(output: Section8Output): string;
export declare function filterNewsByCategory(output: Section8Output, category: NewsCategory): Section8Output['news_items'];
export declare function sortNewsByDate(items: Section8Output['news_items']): Section8Output['news_items'];
//# sourceMappingURL=recent-news.d.ts.map