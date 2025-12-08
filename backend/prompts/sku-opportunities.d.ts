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
export interface Section5Context {
    company_trends: {
        trends: Array<{
            trend: string;
            description: string;
            direction: 'Positive' | 'Negative' | 'Neutral';
            impact_score: number;
            geography_relevance: string;
            source: string;
        }>;
    };
}
export interface Section6Context {
    benchmark_summary: {
        key_gaps: Array<{
            gap: string;
            description: string;
            geography_context: string;
            magnitude: 'Significant' | 'Moderate' | 'Minor';
        }>;
    };
}
export interface Section7Input {
    foundation: FoundationOutput;
    companyName: string;
    geography: string;
    section5Context?: Section5Context;
    section6Context?: Section6Context;
}
export type Priority = 'High' | 'Medium' | 'Low';
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
export interface Section7Output {
    confidence: {
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        reason: string;
    };
    opportunities: Opportunity[];
    sources_used: string[];
}
export declare const SKU_PRACTICE_AREAS: {
    readonly CAPACITY_THROUGHPUT: "1. Capacity & Throughput Enhancement";
    readonly DIGITAL_LEAN: "2. Cost Optimization Through Digital Lean";
    readonly CASH_FLOW_ROIC: "3. Operational Excellence to Drive Cash Flow Velocity & ROIC";
    readonly OPERATING_MODEL: "4. Improving the Operating Model";
    readonly REAL_TIME_ENTERPRISE: "5. Lead the Journey to Your Real-Time Enterprise";
};
export declare const SKU_SUB_OFFERINGS: {
    readonly OEE_UPLIFT: "OEE Uplift & Bottleneck Removal";
    readonly ASSET_RELIABILITY: "Asset Reliability & Maintenance";
    readonly QUALITY_SYSTEMS: "Quality Systems";
    readonly LEAN_OPERATIONS: "Lean Operations";
    readonly DISTRIBUTION_LOGISTICS: "Distribution & Logistics Optimization";
    readonly ORG_EFFECTIVENESS: "Organizational Effectiveness";
    readonly VALUE_ENGINEERING: "Value Engineering";
    readonly INVENTORY_OPT: "Inventory Optimization";
    readonly ORDER_TO_CASH: "Order-to-Cash Acceleration";
    readonly ASSET_UTILIZATION: "Asset & Network Utilization";
    readonly OPERATING_COST: "Operating Cost Efficiency";
    readonly NETWORK_DESIGN: "Network & Supply Chain Design";
    readonly MA_SUPPORT: "Transaction Support (M&A)";
    readonly INTERIM_LEADERSHIP: "Interim Leadership";
    readonly CAPITAL_PROJECTS: "Capital Project Management";
    readonly CONTROL_TOWER: "Control Tower & Performance Management";
    readonly DIGITAL_OPS: "Digital Operations";
    readonly ENTERPRISE_ENABLE: "Enterprise Enablement";
};
export declare function buildSkuOpportunitiesPrompt(input: Section7Input): string;
export declare function validateSection7Output(output: any): output is Section7Output;
export declare function formatSection7ForDocument(output: Section7Output): string;
export declare function filterByPriority(output: Section7Output, priority: Priority): Opportunity[];
export declare function getHighSeverityOpportunities(output: Section7Output, minSeverity?: number): Opportunity[];
export declare function groupBySKU(output: Section7Output): Record<string, Opportunity[]>;
export declare function calculateAverageSeverity(output: Section7Output): number;
//# sourceMappingURL=sku-opportunities.d.ts.map