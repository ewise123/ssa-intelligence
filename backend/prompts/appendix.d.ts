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
interface SectionWithSources {
    sources_used?: string[];
    derived_metrics?: Array<{
        metric: string;
        formula: string;
        calculation: string;
        source: string;
    }>;
    fx_source?: string;
    industry_source?: string;
}
export interface Section10Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    sections: {
        section1?: SectionWithSources;
        section2?: SectionWithSources;
        section3?: SectionWithSources;
        section4?: SectionWithSources & {
            segments?: Array<{
                financial_snapshot?: {
                    fx_source?: string;
                    table?: Array<any>;
                };
            }>;
        };
        section5?: SectionWithSources;
        section6?: SectionWithSources;
        section7?: SectionWithSources;
        section8?: SectionWithSources;
        section9?: SectionWithSources;
    };
}
export interface SourceReference {
    id: string;
    citation: string;
    url?: string;
    type: string;
    date: string;
    sections_used_in: string[];
}
export interface FXRate {
    currency_pair: string;
    rate: number;
    source: 'A' | 'B' | 'C';
    source_description: string;
}
export interface DerivedMetric {
    metric: string;
    formula: string;
    calculation: string;
    source: string;
    section: string;
}
export interface Section10Output {
    confidence: {
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
    };
    source_references: SourceReference[];
    fx_rates_and_industry: {
        fx_rates: FXRate[];
        industry_averages: {
            source: 'A' | 'B' | 'C';
            dataset: string;
            description: string;
        };
    };
    derived_metrics: DerivedMetric[];
    renumbering_notes?: string;
}
export declare function generateAppendix(input: Section10Input): Section10Output;
export declare function buildSection10Prompt(input: Section10Input): string;
export declare function validateSection10Output(output: any): output is Section10Output;
export declare function formatSection10ForDocument(output: Section10Output): string;
export declare function getSourcesByType(output: Section10Output, type: string): SourceReference[];
export declare function getSourcesBySection(output: Section10Output, sectionName: string): SourceReference[];
export {};
//# sourceMappingURL=appendix.d.ts.map