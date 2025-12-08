import { z } from 'zod';
export declare const confidenceLevelSchema: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
export declare const confidenceSchema: z.ZodObject<{
    level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    level: "HIGH" | "MEDIUM" | "LOW";
    reason: string;
}, {
    level: "HIGH" | "MEDIUM" | "LOW";
    reason: string;
}>;
export declare const fxSourceSchema: z.ZodEnum<["A", "B", "C"]>;
export declare const industrySourceSchema: z.ZodEnum<["A", "B", "C"]>;
export declare const trendDirectionSchema: z.ZodEnum<["Positive", "Negative", "Neutral"]>;
export declare const prioritySchema: z.ZodEnum<["High", "Medium", "Low"]>;
export declare const magnitudeSchema: z.ZodEnum<["Significant", "Moderate", "Minor"]>;
export declare const newsCategory: z.ZodEnum<["Investment", "M&A", "Operations", "Product", "Partnership", "Regulatory", "People", "Sustainability"]>;
export declare const bulletCategorySchema: z.ZodEnum<["Geography", "Financial", "Strategic", "Competitive", "Risk", "Momentum"]>;
export declare const sourceTypeSchema: z.ZodEnum<["filing", "transcript", "analyst_report", "news", "user_provided", "government", "investor_presentation", "industry_report"]>;
export declare const sourceReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    citation: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["filing", "transcript", "analyst_report", "news", "user_provided", "government", "investor_presentation", "industry_report"]>;
    date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    citation: string;
    type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
    date: string;
    url?: string | undefined;
}, {
    id: string;
    citation: string;
    type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
    date: string;
    url?: string | undefined;
}>;
export declare const analystQuoteSchema: z.ZodObject<{
    quote: z.ZodEffects<z.ZodString, string, string>;
    analyst: z.ZodString;
    firm: z.ZodString;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    quote: string;
    analyst: string;
    firm: string;
    source: string;
}, {
    quote: string;
    analyst: string;
    firm: string;
    source: string;
}>;
export declare const facilityInfoSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodString;
    type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    name: string;
    location: string;
}, {
    type: string;
    name: string;
    location: string;
}>;
export declare const competitorSchema: z.ZodObject<{
    name: z.ZodString;
    market_share: z.ZodOptional<z.ZodString>;
    geography: z.ZodString;
}, "strip", z.ZodTypeAny, {
    geography: string;
    name: string;
    market_share?: string | undefined;
}, {
    geography: string;
    name: string;
    market_share?: string | undefined;
}>;
export declare const companyBasicsSchema: z.ZodObject<{
    legal_name: z.ZodString;
    ticker: z.ZodOptional<z.ZodString>;
    ownership: z.ZodEnum<["Public", "Private", "Subsidiary"]>;
    headquarters: z.ZodString;
    global_revenue_usd: z.ZodNumber;
    global_employees: z.ZodNumber;
    fiscal_year_end: z.ZodString;
}, "strip", z.ZodTypeAny, {
    legal_name: string;
    ownership: "Public" | "Private" | "Subsidiary";
    headquarters: string;
    global_revenue_usd: number;
    global_employees: number;
    fiscal_year_end: string;
    ticker?: string | undefined;
}, {
    legal_name: string;
    ownership: "Public" | "Private" | "Subsidiary";
    headquarters: string;
    global_revenue_usd: number;
    global_employees: number;
    fiscal_year_end: string;
    ticker?: string | undefined;
}>;
export declare const geographySpecificsSchema: z.ZodObject<{
    regional_revenue_usd: z.ZodNumber;
    regional_revenue_pct: z.ZodNumber;
    regional_employees: z.ZodNumber;
    facilities: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        location: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        name: string;
        location: string;
    }, {
        type: string;
        name: string;
        location: string;
    }>, "many">;
    key_facts: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    regional_revenue_usd: number;
    regional_revenue_pct: number;
    regional_employees: number;
    facilities: {
        type: string;
        name: string;
        location: string;
    }[];
    key_facts: string[];
}, {
    regional_revenue_usd: number;
    regional_revenue_pct: number;
    regional_employees: number;
    facilities: {
        type: string;
        name: string;
        location: string;
    }[];
    key_facts: string[];
}>;
export declare const segmentStructureSchema: z.ZodObject<{
    name: z.ZodString;
    revenue_pct: z.ZodNumber;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    revenue_pct: number;
    description: string;
}, {
    name: string;
    revenue_pct: number;
    description: string;
}>;
export declare const foundationOutputSchema: z.ZodObject<{
    company_basics: z.ZodObject<{
        legal_name: z.ZodString;
        ticker: z.ZodOptional<z.ZodString>;
        ownership: z.ZodEnum<["Public", "Private", "Subsidiary"]>;
        headquarters: z.ZodString;
        global_revenue_usd: z.ZodNumber;
        global_employees: z.ZodNumber;
        fiscal_year_end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        legal_name: string;
        ownership: "Public" | "Private" | "Subsidiary";
        headquarters: string;
        global_revenue_usd: number;
        global_employees: number;
        fiscal_year_end: string;
        ticker?: string | undefined;
    }, {
        legal_name: string;
        ownership: "Public" | "Private" | "Subsidiary";
        headquarters: string;
        global_revenue_usd: number;
        global_employees: number;
        fiscal_year_end: string;
        ticker?: string | undefined;
    }>;
    geography_specifics: z.ZodObject<{
        regional_revenue_usd: z.ZodNumber;
        regional_revenue_pct: z.ZodNumber;
        regional_employees: z.ZodNumber;
        facilities: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            location: z.ZodString;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            name: string;
            location: string;
        }, {
            type: string;
            name: string;
            location: string;
        }>, "many">;
        key_facts: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        regional_revenue_usd: number;
        regional_revenue_pct: number;
        regional_employees: number;
        facilities: {
            type: string;
            name: string;
            location: string;
        }[];
        key_facts: string[];
    }, {
        regional_revenue_usd: number;
        regional_revenue_pct: number;
        regional_employees: number;
        facilities: {
            type: string;
            name: string;
            location: string;
        }[];
        key_facts: string[];
    }>;
    source_catalog: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        citation: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["filing", "transcript", "analyst_report", "news", "user_provided", "government", "investor_presentation", "industry_report"]>;
        date: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        citation: string;
        type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
        date: string;
        url?: string | undefined;
    }, {
        id: string;
        citation: string;
        type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
        date: string;
        url?: string | undefined;
    }>, "many">;
    segment_structure: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        revenue_pct: z.ZodNumber;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        revenue_pct: number;
        description: string;
    }, {
        name: string;
        revenue_pct: number;
        description: string;
    }>, "many">;
    fx_rates: z.ZodRecord<z.ZodString, z.ZodObject<{
        rate: z.ZodNumber;
        source: z.ZodEnum<["A", "B", "C"]>;
    }, "strip", z.ZodTypeAny, {
        source: "A" | "B" | "C";
        rate: number;
    }, {
        source: "A" | "B" | "C";
        rate: number;
    }>>;
    industry_averages: z.ZodObject<{
        source: z.ZodEnum<["A", "B", "C"]>;
        dataset: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        source: "A" | "B" | "C";
        dataset: string;
    }, {
        source: "A" | "B" | "C";
        dataset: string;
    }>;
}, "strip", z.ZodTypeAny, {
    company_basics: {
        legal_name: string;
        ownership: "Public" | "Private" | "Subsidiary";
        headquarters: string;
        global_revenue_usd: number;
        global_employees: number;
        fiscal_year_end: string;
        ticker?: string | undefined;
    };
    geography_specifics: {
        regional_revenue_usd: number;
        regional_revenue_pct: number;
        regional_employees: number;
        facilities: {
            type: string;
            name: string;
            location: string;
        }[];
        key_facts: string[];
    };
    source_catalog: {
        id: string;
        citation: string;
        type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
        date: string;
        url?: string | undefined;
    }[];
    segment_structure: {
        name: string;
        revenue_pct: number;
        description: string;
    }[];
    fx_rates: Record<string, {
        source: "A" | "B" | "C";
        rate: number;
    }>;
    industry_averages: {
        source: "A" | "B" | "C";
        dataset: string;
    };
}, {
    company_basics: {
        legal_name: string;
        ownership: "Public" | "Private" | "Subsidiary";
        headquarters: string;
        global_revenue_usd: number;
        global_employees: number;
        fiscal_year_end: string;
        ticker?: string | undefined;
    };
    geography_specifics: {
        regional_revenue_usd: number;
        regional_revenue_pct: number;
        regional_employees: number;
        facilities: {
            type: string;
            name: string;
            location: string;
        }[];
        key_facts: string[];
    };
    source_catalog: {
        id: string;
        citation: string;
        type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
        date: string;
        url?: string | undefined;
    }[];
    segment_structure: {
        name: string;
        revenue_pct: number;
        description: string;
    }[];
    fx_rates: Record<string, {
        source: "A" | "B" | "C";
        rate: number;
    }>;
    industry_averages: {
        source: "A" | "B" | "C";
        dataset: string;
    };
}>;
export declare const executiveBulletSchema: z.ZodObject<{
    bullet: z.ZodString;
    category: z.ZodEnum<["Geography", "Financial", "Strategic", "Competitive", "Risk", "Momentum"]>;
    supporting_sections: z.ZodArray<z.ZodString, "many">;
    sources: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    bullet: string;
    category: "Geography" | "Financial" | "Strategic" | "Competitive" | "Risk" | "Momentum";
    supporting_sections: string[];
    sources: string[];
}, {
    bullet: string;
    category: "Geography" | "Financial" | "Strategic" | "Competitive" | "Risk" | "Momentum";
    supporting_sections: string[];
    sources: string[];
}>;
export declare const execSummaryOutputSchema: z.ZodObject<{
    confidence: z.ZodObject<{
        level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>;
    bullet_points: z.ZodArray<z.ZodObject<{
        bullet: z.ZodString;
        category: z.ZodEnum<["Geography", "Financial", "Strategic", "Competitive", "Risk", "Momentum"]>;
        supporting_sections: z.ZodArray<z.ZodString, "many">;
        sources: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        bullet: string;
        category: "Geography" | "Financial" | "Strategic" | "Competitive" | "Risk" | "Momentum";
        supporting_sections: string[];
        sources: string[];
    }, {
        bullet: string;
        category: "Geography" | "Financial" | "Strategic" | "Competitive" | "Risk" | "Momentum";
        supporting_sections: string[];
        sources: string[];
    }>, "many">;
    sources_used: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    bullet_points: {
        bullet: string;
        category: "Geography" | "Financial" | "Strategic" | "Competitive" | "Risk" | "Momentum";
        supporting_sections: string[];
        sources: string[];
    }[];
    sources_used: string[];
}, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    bullet_points: {
        bullet: string;
        category: "Geography" | "Financial" | "Strategic" | "Competitive" | "Risk" | "Momentum";
        supporting_sections: string[];
        sources: string[];
    }[];
    sources_used: string[];
}>;
export declare const financialMetricSchema: z.ZodObject<{
    metric: z.ZodString;
    company: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    industry_avg: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    company: string | number;
    source: string;
    metric: string;
    industry_avg: string | number;
}, {
    company: string | number;
    source: string;
    metric: string;
    industry_avg: string | number;
}>;
export declare const derivedMetricSchema: z.ZodObject<{
    metric: z.ZodString;
    formula: z.ZodString;
    calculation: z.ZodString;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source: string;
    metric: string;
    formula: string;
    calculation: string;
}, {
    source: string;
    metric: string;
    formula: string;
    calculation: string;
}>;
export declare const financialSnapshotOutputSchema: z.ZodObject<{
    confidence: z.ZodObject<{
        level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>;
    summary: z.ZodString;
    kpi_table: z.ZodObject<{
        metrics: z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            company: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            industry_avg: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }, {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        metrics: {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }[];
    }, {
        metrics: {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }[];
    }>;
    fx_source: z.ZodEnum<["A", "B", "C"]>;
    industry_source: z.ZodEnum<["A", "B", "C"]>;
    derived_metrics: z.ZodArray<z.ZodObject<{
        metric: z.ZodString;
        formula: z.ZodString;
        calculation: z.ZodString;
        source: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        source: string;
        metric: string;
        formula: string;
        calculation: string;
    }, {
        source: string;
        metric: string;
        formula: string;
        calculation: string;
    }>, "many">;
    sources_used: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    derived_metrics: {
        source: string;
        metric: string;
        formula: string;
        calculation: string;
    }[];
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    summary: string;
    kpi_table: {
        metrics: {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }[];
    };
    fx_source: "A" | "B" | "C";
    industry_source: "A" | "B" | "C";
}, {
    derived_metrics: {
        source: string;
        metric: string;
        formula: string;
        calculation: string;
    }[];
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    summary: string;
    kpi_table: {
        metrics: {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }[];
    };
    fx_source: "A" | "B" | "C";
    industry_source: "A" | "B" | "C";
}>;
export declare const businessSegmentSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    revenue_pct: z.ZodNullable<z.ZodNumber>;
    geography_relevance: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    revenue_pct: number | null;
    description: string;
    geography_relevance: string;
}, {
    name: string;
    revenue_pct: number | null;
    description: string;
    geography_relevance: string;
}>;
export declare const strategicPrioritySchema: z.ZodObject<{
    priority: z.ZodString;
    description: z.ZodString;
    geography_relevance: z.ZodString;
    geography_relevance_rating: z.ZodEnum<["High", "Medium", "Low"]>;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source: string;
    description: string;
    geography_relevance: string;
    priority: string;
    geography_relevance_rating: "High" | "Medium" | "Low";
}, {
    source: string;
    description: string;
    geography_relevance: string;
    priority: string;
    geography_relevance_rating: "High" | "Medium" | "Low";
}>;
export declare const executiveLeaderSchema: z.ZodObject<{
    name: z.ZodString;
    title: z.ZodString;
    background: z.ZodString;
    tenure: z.ZodString;
    geography_relevance: z.ZodOptional<z.ZodString>;
    geography_relevance_rating: z.ZodOptional<z.ZodEnum<["High", "Medium", "Low"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    title: string;
    background: string;
    tenure: string;
    geography_relevance?: string | undefined;
    geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
}, {
    name: string;
    title: string;
    background: string;
    tenure: string;
    geography_relevance?: string | undefined;
    geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
}>;
export declare const companyOverviewOutputSchema: z.ZodObject<{
    confidence: z.ZodObject<{
        level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>;
    business_description: z.ZodObject<{
        overview: z.ZodString;
        segments: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            revenue_pct: z.ZodNullable<z.ZodNumber>;
            geography_relevance: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            revenue_pct: number | null;
            description: string;
            geography_relevance: string;
        }, {
            name: string;
            revenue_pct: number | null;
            description: string;
            geography_relevance: string;
        }>, "many">;
        geography_positioning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        overview: string;
        segments: {
            name: string;
            revenue_pct: number | null;
            description: string;
            geography_relevance: string;
        }[];
        geography_positioning: string;
    }, {
        overview: string;
        segments: {
            name: string;
            revenue_pct: number | null;
            description: string;
            geography_relevance: string;
        }[];
        geography_positioning: string;
    }>;
    geographic_footprint: z.ZodObject<{
        summary: z.ZodString;
        facilities: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            location: z.ZodString;
            type: z.ZodEnum<["Manufacturing", "R&D", "Distribution", "Office", "Headquarters"]>;
            employees: z.ZodOptional<z.ZodNumber>;
            capabilities: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "Manufacturing" | "R&D" | "Distribution" | "Office" | "Headquarters";
            name: string;
            location: string;
            employees?: number | undefined;
            capabilities?: string | undefined;
        }, {
            type: "Manufacturing" | "R&D" | "Distribution" | "Office" | "Headquarters";
            name: string;
            location: string;
            employees?: number | undefined;
            capabilities?: string | undefined;
        }>, "many">;
        regional_stats: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        facilities: {
            type: "Manufacturing" | "R&D" | "Distribution" | "Office" | "Headquarters";
            name: string;
            location: string;
            employees?: number | undefined;
            capabilities?: string | undefined;
        }[];
        summary: string;
        regional_stats: string;
    }, {
        facilities: {
            type: "Manufacturing" | "R&D" | "Distribution" | "Office" | "Headquarters";
            name: string;
            location: string;
            employees?: number | undefined;
            capabilities?: string | undefined;
        }[];
        summary: string;
        regional_stats: string;
    }>;
    strategic_priorities: z.ZodObject<{
        summary: z.ZodString;
        priorities: z.ZodArray<z.ZodObject<{
            priority: z.ZodString;
            description: z.ZodString;
            geography_relevance: z.ZodString;
            geography_relevance_rating: z.ZodEnum<["High", "Medium", "Low"]>;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            source: string;
            description: string;
            geography_relevance: string;
            priority: string;
            geography_relevance_rating: "High" | "Medium" | "Low";
        }, {
            source: string;
            description: string;
            geography_relevance: string;
            priority: string;
            geography_relevance_rating: "High" | "Medium" | "Low";
        }>, "many">;
        geography_specific_initiatives: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        priorities: {
            source: string;
            description: string;
            geography_relevance: string;
            priority: string;
            geography_relevance_rating: "High" | "Medium" | "Low";
        }[];
        geography_specific_initiatives: string;
    }, {
        summary: string;
        priorities: {
            source: string;
            description: string;
            geography_relevance: string;
            priority: string;
            geography_relevance_rating: "High" | "Medium" | "Low";
        }[];
        geography_specific_initiatives: string;
    }>;
    key_leadership: z.ZodObject<{
        executives: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            title: z.ZodString;
            background: z.ZodString;
            tenure: z.ZodString;
            geography_relevance: z.ZodOptional<z.ZodString>;
            geography_relevance_rating: z.ZodOptional<z.ZodEnum<["High", "Medium", "Low"]>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }, {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }>, "many">;
        regional_leaders: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            title: z.ZodString;
            background: z.ZodString;
            tenure: z.ZodString;
            geography_relevance: z.ZodOptional<z.ZodString>;
            geography_relevance_rating: z.ZodOptional<z.ZodEnum<["High", "Medium", "Low"]>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }, {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        executives: {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }[];
        regional_leaders: {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }[];
    }, {
        executives: {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }[];
        regional_leaders: {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }[];
    }>;
    sources_used: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    business_description: {
        overview: string;
        segments: {
            name: string;
            revenue_pct: number | null;
            description: string;
            geography_relevance: string;
        }[];
        geography_positioning: string;
    };
    geographic_footprint: {
        facilities: {
            type: "Manufacturing" | "R&D" | "Distribution" | "Office" | "Headquarters";
            name: string;
            location: string;
            employees?: number | undefined;
            capabilities?: string | undefined;
        }[];
        summary: string;
        regional_stats: string;
    };
    strategic_priorities: {
        summary: string;
        priorities: {
            source: string;
            description: string;
            geography_relevance: string;
            priority: string;
            geography_relevance_rating: "High" | "Medium" | "Low";
        }[];
        geography_specific_initiatives: string;
    };
    key_leadership: {
        executives: {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }[];
        regional_leaders: {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }[];
    };
}, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    business_description: {
        overview: string;
        segments: {
            name: string;
            revenue_pct: number | null;
            description: string;
            geography_relevance: string;
        }[];
        geography_positioning: string;
    };
    geographic_footprint: {
        facilities: {
            type: "Manufacturing" | "R&D" | "Distribution" | "Office" | "Headquarters";
            name: string;
            location: string;
            employees?: number | undefined;
            capabilities?: string | undefined;
        }[];
        summary: string;
        regional_stats: string;
    };
    strategic_priorities: {
        summary: string;
        priorities: {
            source: string;
            description: string;
            geography_relevance: string;
            priority: string;
            geography_relevance_rating: "High" | "Medium" | "Low";
        }[];
        geography_specific_initiatives: string;
    };
    key_leadership: {
        executives: {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }[];
        regional_leaders: {
            name: string;
            title: string;
            background: string;
            tenure: string;
            geography_relevance?: string | undefined;
            geography_relevance_rating?: "High" | "Medium" | "Low" | undefined;
        }[];
    };
}>;
export declare const segmentFinancialMetricSchema: z.ZodObject<{
    metric: z.ZodString;
    segment: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    company_avg: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    industry_avg: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    segment: string | number;
    company_avg: string | number;
    source: string;
    metric: string;
    industry_avg: string | number;
}, {
    segment: string | number;
    company_avg: string | number;
    source: string;
    metric: string;
    industry_avg: string | number;
}>;
export declare const segmentAnalysisSchema: z.ZodObject<{
    name: z.ZodString;
    financial_snapshot: z.ZodObject<{
        table: z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            segment: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            company_avg: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            industry_avg: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            segment: string | number;
            company_avg: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }, {
            segment: string | number;
            company_avg: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }>, "many">;
        fx_source: z.ZodString;
        geography_notes: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fx_source: string;
        table: {
            segment: string | number;
            company_avg: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }[];
        geography_notes: string;
    }, {
        fx_source: string;
        table: {
            segment: string | number;
            company_avg: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }[];
        geography_notes: string;
    }>;
    performance_analysis: z.ZodObject<{
        paragraphs: z.ZodArray<z.ZodString, "many">;
        analyst_quotes: z.ZodArray<z.ZodObject<{
            quote: z.ZodEffects<z.ZodString, string, string>;
            analyst: z.ZodString;
            firm: z.ZodString;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            quote: string;
            analyst: string;
            firm: string;
            source: string;
        }, {
            quote: string;
            analyst: string;
            firm: string;
            source: string;
        }>, "many">;
        key_drivers: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        paragraphs: string[];
        analyst_quotes: {
            quote: string;
            analyst: string;
            firm: string;
            source: string;
        }[];
        key_drivers: string[];
    }, {
        paragraphs: string[];
        analyst_quotes: {
            quote: string;
            analyst: string;
            firm: string;
            source: string;
        }[];
        key_drivers: string[];
    }>;
    competitive_landscape: z.ZodObject<{
        competitors: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            market_share: z.ZodOptional<z.ZodString>;
            geography: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            geography: string;
            name: string;
            market_share?: string | undefined;
        }, {
            geography: string;
            name: string;
            market_share?: string | undefined;
        }>, "many">;
        positioning: z.ZodString;
        recent_dynamics: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        competitors: {
            geography: string;
            name: string;
            market_share?: string | undefined;
        }[];
        positioning: string;
        recent_dynamics: string;
    }, {
        competitors: {
            geography: string;
            name: string;
            market_share?: string | undefined;
        }[];
        positioning: string;
        recent_dynamics: string;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    financial_snapshot: {
        fx_source: string;
        table: {
            segment: string | number;
            company_avg: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }[];
        geography_notes: string;
    };
    performance_analysis: {
        paragraphs: string[];
        analyst_quotes: {
            quote: string;
            analyst: string;
            firm: string;
            source: string;
        }[];
        key_drivers: string[];
    };
    competitive_landscape: {
        competitors: {
            geography: string;
            name: string;
            market_share?: string | undefined;
        }[];
        positioning: string;
        recent_dynamics: string;
    };
}, {
    name: string;
    financial_snapshot: {
        fx_source: string;
        table: {
            segment: string | number;
            company_avg: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
        }[];
        geography_notes: string;
    };
    performance_analysis: {
        paragraphs: string[];
        analyst_quotes: {
            quote: string;
            analyst: string;
            firm: string;
            source: string;
        }[];
        key_drivers: string[];
    };
    competitive_landscape: {
        competitors: {
            geography: string;
            name: string;
            market_share?: string | undefined;
        }[];
        positioning: string;
        recent_dynamics: string;
    };
}>;
export declare const segmentAnalysisOutputSchema: z.ZodObject<{
    confidence: z.ZodObject<{
        level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>;
    overview: z.ZodString;
    segments: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        financial_snapshot: z.ZodObject<{
            table: z.ZodArray<z.ZodObject<{
                metric: z.ZodString;
                segment: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                company_avg: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                industry_avg: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                segment: string | number;
                company_avg: string | number;
                source: string;
                metric: string;
                industry_avg: string | number;
            }, {
                segment: string | number;
                company_avg: string | number;
                source: string;
                metric: string;
                industry_avg: string | number;
            }>, "many">;
            fx_source: z.ZodString;
            geography_notes: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            fx_source: string;
            table: {
                segment: string | number;
                company_avg: string | number;
                source: string;
                metric: string;
                industry_avg: string | number;
            }[];
            geography_notes: string;
        }, {
            fx_source: string;
            table: {
                segment: string | number;
                company_avg: string | number;
                source: string;
                metric: string;
                industry_avg: string | number;
            }[];
            geography_notes: string;
        }>;
        performance_analysis: z.ZodObject<{
            paragraphs: z.ZodArray<z.ZodString, "many">;
            analyst_quotes: z.ZodArray<z.ZodObject<{
                quote: z.ZodEffects<z.ZodString, string, string>;
                analyst: z.ZodString;
                firm: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            }, {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            }>, "many">;
            key_drivers: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            paragraphs: string[];
            analyst_quotes: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            }[];
            key_drivers: string[];
        }, {
            paragraphs: string[];
            analyst_quotes: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            }[];
            key_drivers: string[];
        }>;
        competitive_landscape: z.ZodObject<{
            competitors: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                market_share: z.ZodOptional<z.ZodString>;
                geography: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                geography: string;
                name: string;
                market_share?: string | undefined;
            }, {
                geography: string;
                name: string;
                market_share?: string | undefined;
            }>, "many">;
            positioning: z.ZodString;
            recent_dynamics: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            competitors: {
                geography: string;
                name: string;
                market_share?: string | undefined;
            }[];
            positioning: string;
            recent_dynamics: string;
        }, {
            competitors: {
                geography: string;
                name: string;
                market_share?: string | undefined;
            }[];
            positioning: string;
            recent_dynamics: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        financial_snapshot: {
            fx_source: string;
            table: {
                segment: string | number;
                company_avg: string | number;
                source: string;
                metric: string;
                industry_avg: string | number;
            }[];
            geography_notes: string;
        };
        performance_analysis: {
            paragraphs: string[];
            analyst_quotes: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            }[];
            key_drivers: string[];
        };
        competitive_landscape: {
            competitors: {
                geography: string;
                name: string;
                market_share?: string | undefined;
            }[];
            positioning: string;
            recent_dynamics: string;
        };
    }, {
        name: string;
        financial_snapshot: {
            fx_source: string;
            table: {
                segment: string | number;
                company_avg: string | number;
                source: string;
                metric: string;
                industry_avg: string | number;
            }[];
            geography_notes: string;
        };
        performance_analysis: {
            paragraphs: string[];
            analyst_quotes: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            }[];
            key_drivers: string[];
        };
        competitive_landscape: {
            competitors: {
                geography: string;
                name: string;
                market_share?: string | undefined;
            }[];
            positioning: string;
            recent_dynamics: string;
        };
    }>, "many">;
    sources_used: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    overview: string;
    segments: {
        name: string;
        financial_snapshot: {
            fx_source: string;
            table: {
                segment: string | number;
                company_avg: string | number;
                source: string;
                metric: string;
                industry_avg: string | number;
            }[];
            geography_notes: string;
        };
        performance_analysis: {
            paragraphs: string[];
            analyst_quotes: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            }[];
            key_drivers: string[];
        };
        competitive_landscape: {
            competitors: {
                geography: string;
                name: string;
                market_share?: string | undefined;
            }[];
            positioning: string;
            recent_dynamics: string;
        };
    }[];
}, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    overview: string;
    segments: {
        name: string;
        financial_snapshot: {
            fx_source: string;
            table: {
                segment: string | number;
                company_avg: string | number;
                source: string;
                metric: string;
                industry_avg: string | number;
            }[];
            geography_notes: string;
        };
        performance_analysis: {
            paragraphs: string[];
            analyst_quotes: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            }[];
            key_drivers: string[];
        };
        competitive_landscape: {
            competitors: {
                geography: string;
                name: string;
                market_share?: string | undefined;
            }[];
            positioning: string;
            recent_dynamics: string;
        };
    }[];
}>;
export declare const trendBaseSchema: z.ZodObject<{
    trend: z.ZodString;
    description: z.ZodString;
    direction: z.ZodEnum<["Positive", "Negative", "Neutral"]>;
    impact_score: z.ZodNumber;
    geography_relevance: z.ZodString;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source: string;
    description: string;
    geography_relevance: string;
    trend: string;
    direction: "Positive" | "Negative" | "Neutral";
    impact_score: number;
}, {
    source: string;
    description: string;
    geography_relevance: string;
    trend: string;
    direction: "Positive" | "Negative" | "Neutral";
    impact_score: number;
}>;
export declare const macroTrendSchema: z.ZodObject<{
    trend: z.ZodString;
    description: z.ZodString;
    direction: z.ZodEnum<["Positive", "Negative", "Neutral"]>;
    impact_score: z.ZodNumber;
    geography_relevance: z.ZodString;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source: string;
    description: string;
    geography_relevance: string;
    trend: string;
    direction: "Positive" | "Negative" | "Neutral";
    impact_score: number;
}, {
    source: string;
    description: string;
    geography_relevance: string;
    trend: string;
    direction: "Positive" | "Negative" | "Neutral";
    impact_score: number;
}>;
export declare const microTrendSchema: z.ZodObject<{
    trend: z.ZodString;
    description: z.ZodString;
    direction: z.ZodEnum<["Positive", "Negative", "Neutral"]>;
    impact_score: z.ZodNumber;
    geography_relevance: z.ZodString;
    source: z.ZodString;
} & {
    segment_relevance: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: string;
    description: string;
    geography_relevance: string;
    trend: string;
    direction: "Positive" | "Negative" | "Neutral";
    impact_score: number;
    segment_relevance?: string | undefined;
}, {
    source: string;
    description: string;
    geography_relevance: string;
    trend: string;
    direction: "Positive" | "Negative" | "Neutral";
    impact_score: number;
    segment_relevance?: string | undefined;
}>;
export declare const companyTrendSchema: z.ZodObject<{
    trend: z.ZodString;
    description: z.ZodString;
    direction: z.ZodEnum<["Positive", "Negative", "Neutral"]>;
    impact_score: z.ZodNumber;
    geography_relevance: z.ZodString;
    source: z.ZodString;
} & {
    management_commentary: z.ZodOptional<z.ZodString>;
    analyst_quote: z.ZodOptional<z.ZodObject<{
        quote: z.ZodEffects<z.ZodString, string, string>;
        analyst: z.ZodString;
        firm: z.ZodString;
        source: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        quote: string;
        analyst: string;
        firm: string;
        source: string;
    }, {
        quote: string;
        analyst: string;
        firm: string;
        source: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    source: string;
    description: string;
    geography_relevance: string;
    trend: string;
    direction: "Positive" | "Negative" | "Neutral";
    impact_score: number;
    management_commentary?: string | undefined;
    analyst_quote?: {
        quote: string;
        analyst: string;
        firm: string;
        source: string;
    } | undefined;
}, {
    source: string;
    description: string;
    geography_relevance: string;
    trend: string;
    direction: "Positive" | "Negative" | "Neutral";
    impact_score: number;
    management_commentary?: string | undefined;
    analyst_quote?: {
        quote: string;
        analyst: string;
        firm: string;
        source: string;
    } | undefined;
}>;
export declare const trendsOutputSchema: z.ZodObject<{
    confidence: z.ZodObject<{
        level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>;
    aggregate_summary: z.ZodString;
    macro_trends: z.ZodObject<{
        summary: z.ZodString;
        trends: z.ZodArray<z.ZodObject<{
            trend: z.ZodString;
            description: z.ZodString;
            direction: z.ZodEnum<["Positive", "Negative", "Neutral"]>;
            impact_score: z.ZodNumber;
            geography_relevance: z.ZodString;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
        }, {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
        }[];
    }, {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
        }[];
    }>;
    micro_trends: z.ZodObject<{
        summary: z.ZodString;
        trends: z.ZodArray<z.ZodObject<{
            trend: z.ZodString;
            description: z.ZodString;
            direction: z.ZodEnum<["Positive", "Negative", "Neutral"]>;
            impact_score: z.ZodNumber;
            geography_relevance: z.ZodString;
            source: z.ZodString;
        } & {
            segment_relevance: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            segment_relevance?: string | undefined;
        }, {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            segment_relevance?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            segment_relevance?: string | undefined;
        }[];
    }, {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            segment_relevance?: string | undefined;
        }[];
    }>;
    company_trends: z.ZodObject<{
        summary: z.ZodString;
        trends: z.ZodArray<z.ZodObject<{
            trend: z.ZodString;
            description: z.ZodString;
            direction: z.ZodEnum<["Positive", "Negative", "Neutral"]>;
            impact_score: z.ZodNumber;
            geography_relevance: z.ZodString;
            source: z.ZodString;
        } & {
            management_commentary: z.ZodOptional<z.ZodString>;
            analyst_quote: z.ZodOptional<z.ZodObject<{
                quote: z.ZodEffects<z.ZodString, string, string>;
                analyst: z.ZodString;
                firm: z.ZodString;
                source: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            }, {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            management_commentary?: string | undefined;
            analyst_quote?: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            } | undefined;
        }, {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            management_commentary?: string | undefined;
            analyst_quote?: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            } | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            management_commentary?: string | undefined;
            analyst_quote?: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            } | undefined;
        }[];
    }, {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            management_commentary?: string | undefined;
            analyst_quote?: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            } | undefined;
        }[];
    }>;
    sources_used: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    aggregate_summary: string;
    macro_trends: {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
        }[];
    };
    micro_trends: {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            segment_relevance?: string | undefined;
        }[];
    };
    company_trends: {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            management_commentary?: string | undefined;
            analyst_quote?: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            } | undefined;
        }[];
    };
}, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    aggregate_summary: string;
    macro_trends: {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
        }[];
    };
    micro_trends: {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            segment_relevance?: string | undefined;
        }[];
    };
    company_trends: {
        summary: string;
        trends: {
            source: string;
            description: string;
            geography_relevance: string;
            trend: string;
            direction: "Positive" | "Negative" | "Neutral";
            impact_score: number;
            management_commentary?: string | undefined;
            analyst_quote?: {
                quote: string;
                analyst: string;
                firm: string;
                source: string;
            } | undefined;
        }[];
    };
}>;
export declare const peerInfoSchema: z.ZodObject<{
    name: z.ZodString;
    ticker: z.ZodOptional<z.ZodString>;
    geography_presence: z.ZodString;
    geography_revenue_pct: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    geography_presence: string;
    ticker?: string | undefined;
    geography_revenue_pct?: number | undefined;
}, {
    name: string;
    geography_presence: string;
    ticker?: string | undefined;
    geography_revenue_pct?: number | undefined;
}>;
export declare const peerMetricSchema: z.ZodObject<{
    metric: z.ZodString;
    company: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    peer1: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    peer2: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    peer3: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    peer4: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
    industry_avg: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
    source: z.ZodString;
}, "strip", z.ZodTypeAny, {
    company: string | number;
    source: string;
    metric: string;
    industry_avg: string | number;
    peer1: string | number;
    peer2: string | number;
    peer3: string | number;
    peer4?: string | number | undefined;
}, {
    company: string | number;
    source: string;
    metric: string;
    industry_avg: string | number;
    peer1: string | number;
    peer2: string | number;
    peer3: string | number;
    peer4?: string | number | undefined;
}>;
export declare const keyStrengthSchema: z.ZodObject<{
    strength: z.ZodString;
    description: z.ZodString;
    geography_context: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    strength: string;
    geography_context: string;
}, {
    description: string;
    strength: string;
    geography_context: string;
}>;
export declare const keyGapSchema: z.ZodObject<{
    gap: z.ZodString;
    description: z.ZodString;
    geography_context: z.ZodString;
    magnitude: z.ZodEnum<["Significant", "Moderate", "Minor"]>;
}, "strip", z.ZodTypeAny, {
    description: string;
    geography_context: string;
    gap: string;
    magnitude: "Significant" | "Moderate" | "Minor";
}, {
    description: string;
    geography_context: string;
    gap: string;
    magnitude: "Significant" | "Moderate" | "Minor";
}>;
export declare const peerBenchmarkingOutputSchema: z.ZodObject<{
    confidence: z.ZodObject<{
        level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>;
    peer_comparison_table: z.ZodObject<{
        company_name: z.ZodString;
        peers: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            ticker: z.ZodOptional<z.ZodString>;
            geography_presence: z.ZodString;
            geography_revenue_pct: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            geography_presence: string;
            ticker?: string | undefined;
            geography_revenue_pct?: number | undefined;
        }, {
            name: string;
            geography_presence: string;
            ticker?: string | undefined;
            geography_revenue_pct?: number | undefined;
        }>, "many">;
        metrics: z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            company: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            peer1: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            peer2: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            peer3: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            peer4: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
            industry_avg: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            source: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
            peer1: string | number;
            peer2: string | number;
            peer3: string | number;
            peer4?: string | number | undefined;
        }, {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
            peer1: string | number;
            peer2: string | number;
            peer3: string | number;
            peer4?: string | number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        metrics: {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
            peer1: string | number;
            peer2: string | number;
            peer3: string | number;
            peer4?: string | number | undefined;
        }[];
        company_name: string;
        peers: {
            name: string;
            geography_presence: string;
            ticker?: string | undefined;
            geography_revenue_pct?: number | undefined;
        }[];
    }, {
        metrics: {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
            peer1: string | number;
            peer2: string | number;
            peer3: string | number;
            peer4?: string | number | undefined;
        }[];
        company_name: string;
        peers: {
            name: string;
            geography_presence: string;
            ticker?: string | undefined;
            geography_revenue_pct?: number | undefined;
        }[];
    }>;
    benchmark_summary: z.ZodObject<{
        overall_assessment: z.ZodString;
        key_strengths: z.ZodArray<z.ZodObject<{
            strength: z.ZodString;
            description: z.ZodString;
            geography_context: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            strength: string;
            geography_context: string;
        }, {
            description: string;
            strength: string;
            geography_context: string;
        }>, "many">;
        key_gaps: z.ZodArray<z.ZodObject<{
            gap: z.ZodString;
            description: z.ZodString;
            geography_context: z.ZodString;
            magnitude: z.ZodEnum<["Significant", "Moderate", "Minor"]>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            geography_context: string;
            gap: string;
            magnitude: "Significant" | "Moderate" | "Minor";
        }, {
            description: string;
            geography_context: string;
            gap: string;
            magnitude: "Significant" | "Moderate" | "Minor";
        }>, "many">;
        competitive_positioning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        overall_assessment: string;
        key_strengths: {
            description: string;
            strength: string;
            geography_context: string;
        }[];
        key_gaps: {
            description: string;
            geography_context: string;
            gap: string;
            magnitude: "Significant" | "Moderate" | "Minor";
        }[];
        competitive_positioning: string;
    }, {
        overall_assessment: string;
        key_strengths: {
            description: string;
            strength: string;
            geography_context: string;
        }[];
        key_gaps: {
            description: string;
            geography_context: string;
            gap: string;
            magnitude: "Significant" | "Moderate" | "Minor";
        }[];
        competitive_positioning: string;
    }>;
    sources_used: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    peer_comparison_table: {
        metrics: {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
            peer1: string | number;
            peer2: string | number;
            peer3: string | number;
            peer4?: string | number | undefined;
        }[];
        company_name: string;
        peers: {
            name: string;
            geography_presence: string;
            ticker?: string | undefined;
            geography_revenue_pct?: number | undefined;
        }[];
    };
    benchmark_summary: {
        overall_assessment: string;
        key_strengths: {
            description: string;
            strength: string;
            geography_context: string;
        }[];
        key_gaps: {
            description: string;
            geography_context: string;
            gap: string;
            magnitude: "Significant" | "Moderate" | "Minor";
        }[];
        competitive_positioning: string;
    };
}, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    peer_comparison_table: {
        metrics: {
            company: string | number;
            source: string;
            metric: string;
            industry_avg: string | number;
            peer1: string | number;
            peer2: string | number;
            peer3: string | number;
            peer4?: string | number | undefined;
        }[];
        company_name: string;
        peers: {
            name: string;
            geography_presence: string;
            ticker?: string | undefined;
            geography_revenue_pct?: number | undefined;
        }[];
    };
    benchmark_summary: {
        overall_assessment: string;
        key_strengths: {
            description: string;
            strength: string;
            geography_context: string;
        }[];
        key_gaps: {
            description: string;
            geography_context: string;
            gap: string;
            magnitude: "Significant" | "Moderate" | "Minor";
        }[];
        competitive_positioning: string;
    };
}>;
export declare const opportunitySchema: z.ZodObject<{
    issue_area: z.ZodString;
    public_problem: z.ZodString;
    source: z.ZodString;
    aligned_sku: z.ZodString;
    priority: z.ZodEnum<["High", "Medium", "Low"]>;
    severity: z.ZodNumber;
    severity_rationale: z.ZodString;
    geography_relevance: z.ZodString;
    potential_value_levers: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    source: string;
    geography_relevance: string;
    priority: "High" | "Medium" | "Low";
    issue_area: string;
    public_problem: string;
    aligned_sku: string;
    severity: number;
    severity_rationale: string;
    potential_value_levers: string[];
}, {
    source: string;
    geography_relevance: string;
    priority: "High" | "Medium" | "Low";
    issue_area: string;
    public_problem: string;
    aligned_sku: string;
    severity: number;
    severity_rationale: string;
    potential_value_levers: string[];
}>;
export declare const skuOpportunitiesOutputSchema: z.ZodObject<{
    confidence: z.ZodObject<{
        level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>;
    opportunities: z.ZodArray<z.ZodObject<{
        issue_area: z.ZodString;
        public_problem: z.ZodString;
        source: z.ZodString;
        aligned_sku: z.ZodString;
        priority: z.ZodEnum<["High", "Medium", "Low"]>;
        severity: z.ZodNumber;
        severity_rationale: z.ZodString;
        geography_relevance: z.ZodString;
        potential_value_levers: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        source: string;
        geography_relevance: string;
        priority: "High" | "Medium" | "Low";
        issue_area: string;
        public_problem: string;
        aligned_sku: string;
        severity: number;
        severity_rationale: string;
        potential_value_levers: string[];
    }, {
        source: string;
        geography_relevance: string;
        priority: "High" | "Medium" | "Low";
        issue_area: string;
        public_problem: string;
        aligned_sku: string;
        severity: number;
        severity_rationale: string;
        potential_value_levers: string[];
    }>, "many">;
    sources_used: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    opportunities: {
        source: string;
        geography_relevance: string;
        priority: "High" | "Medium" | "Low";
        issue_area: string;
        public_problem: string;
        aligned_sku: string;
        severity: number;
        severity_rationale: string;
        potential_value_levers: string[];
    }[];
}, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    opportunities: {
        source: string;
        geography_relevance: string;
        priority: "High" | "Medium" | "Low";
        issue_area: string;
        public_problem: string;
        aligned_sku: string;
        severity: number;
        severity_rationale: string;
        potential_value_levers: string[];
    }[];
}>;
export declare const newsItemSchema: z.ZodObject<{
    date: z.ZodString;
    headline: z.ZodString;
    original_language: z.ZodOptional<z.ZodString>;
    source: z.ZodString;
    source_name: z.ZodString;
    implication: z.ZodString;
    geography_relevance: z.ZodString;
    category: z.ZodEnum<["Investment", "M&A", "Operations", "Product", "Partnership", "Regulatory", "People", "Sustainability"]>;
}, "strip", z.ZodTypeAny, {
    date: string;
    source: string;
    category: "Investment" | "M&A" | "Operations" | "Product" | "Partnership" | "Regulatory" | "People" | "Sustainability";
    geography_relevance: string;
    headline: string;
    source_name: string;
    implication: string;
    original_language?: string | undefined;
}, {
    date: string;
    source: string;
    category: "Investment" | "M&A" | "Operations" | "Product" | "Partnership" | "Regulatory" | "People" | "Sustainability";
    geography_relevance: string;
    headline: string;
    source_name: string;
    implication: string;
    original_language?: string | undefined;
}>;
export declare const recentNewsOutputSchema: z.ZodObject<{
    confidence: z.ZodObject<{
        level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>;
    news_items: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        headline: z.ZodString;
        original_language: z.ZodOptional<z.ZodString>;
        source: z.ZodString;
        source_name: z.ZodString;
        implication: z.ZodString;
        geography_relevance: z.ZodString;
        category: z.ZodEnum<["Investment", "M&A", "Operations", "Product", "Partnership", "Regulatory", "People", "Sustainability"]>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        source: string;
        category: "Investment" | "M&A" | "Operations" | "Product" | "Partnership" | "Regulatory" | "People" | "Sustainability";
        geography_relevance: string;
        headline: string;
        source_name: string;
        implication: string;
        original_language?: string | undefined;
    }, {
        date: string;
        source: string;
        category: "Investment" | "M&A" | "Operations" | "Product" | "Partnership" | "Regulatory" | "People" | "Sustainability";
        geography_relevance: string;
        headline: string;
        source_name: string;
        implication: string;
        original_language?: string | undefined;
    }>, "many">;
    sources_used: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    news_items: {
        date: string;
        source: string;
        category: "Investment" | "M&A" | "Operations" | "Product" | "Partnership" | "Regulatory" | "People" | "Sustainability";
        geography_relevance: string;
        headline: string;
        source_name: string;
        implication: string;
        original_language?: string | undefined;
    }[];
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
}, {
    news_items: {
        date: string;
        source: string;
        category: "Investment" | "M&A" | "Operations" | "Product" | "Partnership" | "Regulatory" | "People" | "Sustainability";
        geography_relevance: string;
        headline: string;
        source_name: string;
        implication: string;
        original_language?: string | undefined;
    }[];
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
}>;
export declare const conversationStarterSchema: z.ZodObject<{
    title: z.ZodString;
    question: z.ZodString;
    supporting_data: z.ZodString;
    business_value: z.ZodString;
    ssa_capability: z.ZodOptional<z.ZodString>;
    supporting_sections: z.ZodArray<z.ZodString, "many">;
    sources: z.ZodArray<z.ZodString, "many">;
    geography_relevance: z.ZodString;
}, "strip", z.ZodTypeAny, {
    supporting_sections: string[];
    sources: string[];
    geography_relevance: string;
    title: string;
    question: string;
    supporting_data: string;
    business_value: string;
    ssa_capability?: string | undefined;
}, {
    supporting_sections: string[];
    sources: string[];
    geography_relevance: string;
    title: string;
    question: string;
    supporting_data: string;
    business_value: string;
    ssa_capability?: string | undefined;
}>;
export declare const conversationStartersOutputSchema: z.ZodObject<{
    confidence: z.ZodObject<{
        level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>;
    conversation_starters: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        question: z.ZodString;
        supporting_data: z.ZodString;
        business_value: z.ZodString;
        ssa_capability: z.ZodOptional<z.ZodString>;
        supporting_sections: z.ZodArray<z.ZodString, "many">;
        sources: z.ZodArray<z.ZodString, "many">;
        geography_relevance: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        supporting_sections: string[];
        sources: string[];
        geography_relevance: string;
        title: string;
        question: string;
        supporting_data: string;
        business_value: string;
        ssa_capability?: string | undefined;
    }, {
        supporting_sections: string[];
        sources: string[];
        geography_relevance: string;
        title: string;
        question: string;
        supporting_data: string;
        business_value: string;
        ssa_capability?: string | undefined;
    }>, "many">;
    sources_used: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    conversation_starters: {
        supporting_sections: string[];
        sources: string[];
        geography_relevance: string;
        title: string;
        question: string;
        supporting_data: string;
        business_value: string;
        ssa_capability?: string | undefined;
    }[];
}, {
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    sources_used: string[];
    conversation_starters: {
        supporting_sections: string[];
        sources: string[];
        geography_relevance: string;
        title: string;
        question: string;
        supporting_data: string;
        business_value: string;
        ssa_capability?: string | undefined;
    }[];
}>;
export declare const sourceReferenceDetailedSchema: z.ZodObject<{
    id: z.ZodString;
    citation: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["filing", "transcript", "analyst_report", "news", "user_provided", "government", "investor_presentation", "industry_report"]>;
    date: z.ZodString;
} & {
    sections_used_in: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    citation: string;
    type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
    date: string;
    sections_used_in: string[];
    url?: string | undefined;
}, {
    id: string;
    citation: string;
    type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
    date: string;
    sections_used_in: string[];
    url?: string | undefined;
}>;
export declare const fxRateDetailedSchema: z.ZodObject<{
    currency_pair: z.ZodString;
    rate: z.ZodNumber;
    source: z.ZodEnum<["A", "B", "C"]>;
    source_description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    source: "A" | "B" | "C";
    rate: number;
    currency_pair: string;
    source_description: string;
}, {
    source: "A" | "B" | "C";
    rate: number;
    currency_pair: string;
    source_description: string;
}>;
export declare const derivedMetricDetailedSchema: z.ZodObject<{
    metric: z.ZodString;
    formula: z.ZodString;
    calculation: z.ZodString;
    source: z.ZodString;
} & {
    section: z.ZodString;
}, "strip", z.ZodTypeAny, {
    section: string;
    source: string;
    metric: string;
    formula: string;
    calculation: string;
}, {
    section: string;
    source: string;
    metric: string;
    formula: string;
    calculation: string;
}>;
export declare const appendixOutputSchema: z.ZodObject<{
    confidence: z.ZodObject<{
        level: z.ZodEnum<["HIGH", "MEDIUM", "LOW"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }, {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    }>;
    source_references: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        citation: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["filing", "transcript", "analyst_report", "news", "user_provided", "government", "investor_presentation", "industry_report"]>;
        date: z.ZodString;
    } & {
        sections_used_in: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        citation: string;
        type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
        date: string;
        sections_used_in: string[];
        url?: string | undefined;
    }, {
        id: string;
        citation: string;
        type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
        date: string;
        sections_used_in: string[];
        url?: string | undefined;
    }>, "many">;
    fx_rates_and_industry: z.ZodObject<{
        fx_rates: z.ZodArray<z.ZodObject<{
            currency_pair: z.ZodString;
            rate: z.ZodNumber;
            source: z.ZodEnum<["A", "B", "C"]>;
            source_description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            source: "A" | "B" | "C";
            rate: number;
            currency_pair: string;
            source_description: string;
        }, {
            source: "A" | "B" | "C";
            rate: number;
            currency_pair: string;
            source_description: string;
        }>, "many">;
        industry_averages: z.ZodObject<{
            source: z.ZodEnum<["A", "B", "C"]>;
            dataset: z.ZodString;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            source: "A" | "B" | "C";
            description: string;
            dataset: string;
        }, {
            source: "A" | "B" | "C";
            description: string;
            dataset: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        fx_rates: {
            source: "A" | "B" | "C";
            rate: number;
            currency_pair: string;
            source_description: string;
        }[];
        industry_averages: {
            source: "A" | "B" | "C";
            description: string;
            dataset: string;
        };
    }, {
        fx_rates: {
            source: "A" | "B" | "C";
            rate: number;
            currency_pair: string;
            source_description: string;
        }[];
        industry_averages: {
            source: "A" | "B" | "C";
            description: string;
            dataset: string;
        };
    }>;
    derived_metrics: z.ZodArray<z.ZodObject<{
        metric: z.ZodString;
        formula: z.ZodString;
        calculation: z.ZodString;
        source: z.ZodString;
    } & {
        section: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        section: string;
        source: string;
        metric: string;
        formula: string;
        calculation: string;
    }, {
        section: string;
        source: string;
        metric: string;
        formula: string;
        calculation: string;
    }>, "many">;
    renumbering_notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    derived_metrics: {
        section: string;
        source: string;
        metric: string;
        formula: string;
        calculation: string;
    }[];
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    source_references: {
        id: string;
        citation: string;
        type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
        date: string;
        sections_used_in: string[];
        url?: string | undefined;
    }[];
    fx_rates_and_industry: {
        fx_rates: {
            source: "A" | "B" | "C";
            rate: number;
            currency_pair: string;
            source_description: string;
        }[];
        industry_averages: {
            source: "A" | "B" | "C";
            description: string;
            dataset: string;
        };
    };
    renumbering_notes?: string | undefined;
}, {
    derived_metrics: {
        section: string;
        source: string;
        metric: string;
        formula: string;
        calculation: string;
    }[];
    confidence: {
        level: "HIGH" | "MEDIUM" | "LOW";
        reason: string;
    };
    source_references: {
        id: string;
        citation: string;
        type: "filing" | "transcript" | "analyst_report" | "news" | "user_provided" | "government" | "investor_presentation" | "industry_report";
        date: string;
        sections_used_in: string[];
        url?: string | undefined;
    }[];
    fx_rates_and_industry: {
        fx_rates: {
            source: "A" | "B" | "C";
            rate: number;
            currency_pair: string;
            source_description: string;
        }[];
        industry_averages: {
            source: "A" | "B" | "C";
            description: string;
            dataset: string;
        };
    };
    renumbering_notes?: string | undefined;
}>;
export declare function validateSectionOutput<T>(schema: z.ZodSchema<T>, output: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    error: z.ZodError;
};
export declare function validateWithFeedback<T>(schema: z.ZodSchema<T>, output: unknown, sectionName: string): T;
export declare function validateCompleteResearch(output: unknown): boolean;
//# sourceMappingURL=validation.d.ts.map