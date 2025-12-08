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
    fx_rates: Record<string, {
        rate: number;
        source: 'A' | 'B' | 'C';
    }>;
    industry_averages: {
        source: 'A' | 'B' | 'C';
        dataset: string;
    };
}
export interface Section2Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
}
export interface Section2Output {
    confidence: {
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
    };
    summary: string;
    kpi_table: {
        metrics: Array<{
            metric: string;
            company: number | string;
            industry_avg: number | string;
            source: string;
        }>;
    };
    fx_source: 'A' | 'B' | 'C';
    industry_source: 'A' | 'B' | 'C';
    derived_metrics: Array<{
        metric: string;
        formula: string;
        calculation: string;
        source: string;
    }>;
    sources_used: string[];
}
export declare function buildFinancialSnapshotPrompt(input: Section2Input): string;
export declare function validateSection2Output(output: any): output is Section2Output;
export declare function formatSection2ForDocument(output: Section2Output): string;
//# sourceMappingURL=financial-snapshot.d.ts.map