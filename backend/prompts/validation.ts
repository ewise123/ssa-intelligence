/**
 * Runtime Validation Schemas using Zod
 * Validates Claude outputs match expected TypeScript interfaces
 */

import { z } from 'zod';

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

export const confidenceLevelSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export const confidenceSchema = z.object({
  level: confidenceLevelSchema,
  reason: z.string()
});

export const fxSourceSchema = z.enum(['A', 'B', 'C']);

export const industrySourceSchema = z.enum(['A', 'B', 'C']);

export const trendDirectionSchema = z.enum(['Positive', 'Negative', 'Neutral']);

export const prioritySchema = z.enum(['High', 'Medium', 'Low']);

export const magnitudeSchema = z.enum(['Significant', 'Moderate', 'Minor']);

export const newsCategory = z.enum([
  'Investment',
  'M&A',
  'Operations',
  'Product',
  'Partnership',
  'Regulatory',
  'People',
  'Sustainability'
]);

export const bulletCategorySchema = z.enum([
  'Geography',
  'Financial',
  'Strategic',
  'Competitive',
  'Risk',
  'Momentum'
]);

export const sourceTypeSchema = z.enum([
  'filing',
  'transcript',
  'analyst_report',
  'news',
  'user_provided',
  'government',
  'investor_presentation',
  'industry_report'
]);

export const sourceReferenceSchema = z.object({
  id: z.string().regex(/^S\d+$/), // Must be S1, S2, etc.
  citation: z.string().min(1),
  url: z.string().optional(),
  type: sourceTypeSchema,
  date: z.string()
});

export const analystQuoteSchema = z.object({
  quote: z.string().refine(
    (quote) => quote.split(/\s+/).length <= 15,
    { message: 'Analyst quote must be 15 words or fewer' }
  ),
  analyst: z.string().min(1),
  firm: z.string().min(1),
  source: z.string().regex(/^S\d+$/)
});

export const facilityInfoSchema = z.object({
  name: z.string(),
  location: z.string(),
  type: z.string()
});

export const competitorSchema = z.object({
  name: z.string(),
  market_share: z.string().optional(),
  geography: z.string()
});

// ============================================================================
// FOUNDATION SCHEMA
// ============================================================================

export const companyBasicsSchema = z.object({
  legal_name: z.string(),
  ticker: z.string().optional(),
  ownership: z.enum(['Public', 'Private', 'Subsidiary']),
  headquarters: z.string(),
  global_revenue_usd: z.number().positive(),
  global_employees: z.number().int().positive(),
  fiscal_year_end: z.string()
});

export const geographySpecificsSchema = z.object({
  regional_revenue_usd: z.number().positive(),
  regional_revenue_pct: z.number().min(0).max(100),
  regional_employees: z.number().int().nonnegative(),
  facilities: z.array(facilityInfoSchema),
  key_facts: z.array(z.string())
});

export const segmentStructureSchema = z.object({
  name: z.string(),
  revenue_pct: z.number().min(0).max(100),
  description: z.string()
});

export const foundationOutputSchema = z.object({
  company_basics: companyBasicsSchema,
  geography_specifics: geographySpecificsSchema,
  source_catalog: z.array(sourceReferenceSchema),
  segment_structure: z.array(segmentStructureSchema),
  fx_rates: z.record(z.object({
    rate: z.number().positive(),
    source: fxSourceSchema
  })),
  industry_averages: z.object({
    source: industrySourceSchema,
    dataset: z.string()
  })
});

// ============================================================================
// SECTION 1: EXECUTIVE SUMMARY
// ============================================================================

export const executiveBulletSchema = z.object({
  bullet: z.string().min(10),
  category: bulletCategorySchema,
  supporting_sections: z.array(z.string()).min(1),
  sources: z.array(z.string().regex(/^S\d+$/)).min(1)
});

export const execSummaryOutputSchema = z.object({
  confidence: confidenceSchema,
  bullet_points: z.array(executiveBulletSchema).min(5).max(7),
  sources_used: z.array(z.string().regex(/^S\d+$/))
});

// ============================================================================
// SECTION 2: FINANCIAL SNAPSHOT
// ============================================================================

export const financialMetricSchema = z.object({
  metric: z.string(),
  company: z.union([z.number(), z.string()]),
  industry_avg: z.union([z.number(), z.string()]),
  source: z.string()
});

export const derivedMetricSchema = z.object({
  metric: z.string(),
  formula: z.string(),
  calculation: z.string(),
  source: z.string()
});

export const financialSnapshotOutputSchema = z.object({
  confidence: confidenceSchema,
  summary: z.string().min(50),
  kpi_table: z.object({
    metrics: z.array(financialMetricSchema).min(10)
  }),
  fx_source: fxSourceSchema,
  industry_source: industrySourceSchema,
  derived_metrics: z.array(derivedMetricSchema),
  sources_used: z.array(z.string().regex(/^S\d+$/))
});

// ============================================================================
// SECTION 3: COMPANY OVERVIEW
// ============================================================================

export const businessSegmentSchema = z.object({
  name: z.string(),
  description: z.string(),
  revenue_pct: z.number().nullable(),
  geography_relevance: z.string()
});

export const strategicPrioritySchema = z.object({
  priority: z.string(),
  description: z.string(),
  geography_relevance: z.string(),
  geography_relevance_rating: z.enum(['High', 'Medium', 'Low']).optional(),
  source: z.string()
});

export const executiveLeaderSchema = z.object({
  name: z.string(),
  title: z.string(),
  background: z.string(),
  tenure: z.string().optional(),
  geography_relevance: z.string().optional(),
  geography_relevance_rating: z.enum(['High', 'Medium', 'Low']).optional()
});

export const companyOverviewOutputSchema = z.object({
  confidence: confidenceSchema,
  business_description: z.object({
    overview: z.string().min(100),
    segments: z.array(businessSegmentSchema).min(1),
    geography_positioning: z.string().min(50)
  }),
  geographic_footprint: z.object({
    summary: z.string().min(50),
    facilities: z.array(z.object({
      name: z.string(),
      location: z.string(),
      type: z.enum(['Manufacturing', 'R&D', 'Distribution', 'Office', 'Headquarters']),
      employees: z.number().optional(),
      capabilities: z.string().optional()
    })),
    regional_stats: z.union([z.string(), z.record(z.any())])
  }),
  strategic_priorities: z.object({
    summary: z.string().min(50),
    priorities: z.array(strategicPrioritySchema).min(3).max(5),
    geography_specific_initiatives: z.union([z.string(), z.array(z.string())])
  }),
  key_leadership: z.object({
    executives: z.array(executiveLeaderSchema),
    regional_leaders: z.array(executiveLeaderSchema)
  }),
  sources_used: z.array(z.string().regex(/^S\d+$/))
});

// ============================================================================
// SECTION 4: SEGMENT ANALYSIS
// ============================================================================

export const segmentFinancialMetricSchema = z.object({
  metric: z.string(),
  segment: z.union([z.number(), z.string()]),
  company_avg: z.union([z.number(), z.string()]),
  industry_avg: z.union([z.number(), z.string()]),
  source: z.string()
});

export const segmentAnalysisSchema = z.object({
  name: z.string(),
  financial_snapshot: z.object({
    table: z.array(segmentFinancialMetricSchema).min(5),
    fx_source: z.string(),
    geography_notes: z.string().min(50)
  }),
  performance_analysis: z.object({
    paragraphs: z.array(z.string()).min(3).max(5),
    analyst_quotes: z.array(analystQuoteSchema).max(1),
    key_drivers: z.array(z.string()).min(3).max(5)
  }),
  competitive_landscape: z.object({
    competitors: z.array(competitorSchema).min(3).max(5),
    positioning: z.string().min(50),
    recent_dynamics: z.string().min(50)
  })
});

export const segmentAnalysisOutputSchema = z.object({
  confidence: confidenceSchema,
  overview: z.string().min(100),
  segments: z.array(segmentAnalysisSchema).min(1),
  sources_used: z.array(z.string().regex(/^S\d+$/))
});

// ============================================================================
// SECTION 5: TRENDS
// ============================================================================

export const trendBaseSchema = z.object({
  trend: z.string(),
  description: z.string().min(50),
  direction: trendDirectionSchema,
  impact_score: z.number().int().min(1).max(10),
  geography_relevance: z.string().min(30),
  source: z.string()
});

export const macroTrendSchema = trendBaseSchema;

export const microTrendSchema = trendBaseSchema.extend({
  segment_relevance: z.string().optional()
});

export const companyTrendSchema = trendBaseSchema.extend({
  management_commentary: z.string().optional(),
  analyst_quote: analystQuoteSchema.optional()
});

export const trendsOutputSchema = z.object({
  confidence: confidenceSchema,
  aggregate_summary: z.string().min(100),
  macro_trends: z.object({
    summary: z.string().min(50),
    trends: z.array(macroTrendSchema).min(4).max(6)
  }),
  micro_trends: z.object({
    summary: z.string().min(50),
    trends: z.array(microTrendSchema).min(3).max(5)
  }),
  company_trends: z.object({
    summary: z.string().min(50),
    trends: z.array(companyTrendSchema).min(3).max(5)
  }),
  sources_used: z.array(z.string().regex(/^S\d+$/))
});

// ============================================================================
// SECTION 6: PEER BENCHMARKING
// ============================================================================

export const peerInfoSchema = z.object({
  name: z.string(),
  ticker: z.string().optional(),
  geography_presence: z.string().min(30),
  geography_revenue_pct: z.number().min(0).max(100).optional()
});

export const peerMetricSchema = z.object({
  metric: z.string(),
  company: z.union([z.number(), z.string()]),
  peer1: z.union([z.number(), z.string()]),
  peer2: z.union([z.number(), z.string()]),
  peer3: z.union([z.number(), z.string()]),
  peer4: z.union([z.number(), z.string()]).optional(),
  industry_avg: z.union([z.number(), z.string()]),
  source: z.string()
});

export const keyStrengthSchema = z.object({
  strength: z.string(),
  description: z.string().min(50),
  geography_context: z.string().min(30)
});

export const keyGapSchema = z.object({
  gap: z.string(),
  description: z.string().min(50),
  geography_context: z.string().min(30),
  magnitude: magnitudeSchema
});

export const peerBenchmarkingOutputSchema = z.object({
  confidence: confidenceSchema,
  peer_comparison_table: z.object({
    company_name: z.string(),
    peers: z.array(peerInfoSchema).min(3).max(5),
    metrics: z.array(peerMetricSchema).min(10)
  }),
  benchmark_summary: z.object({
    overall_assessment: z.string().min(100),
    key_strengths: z.array(keyStrengthSchema).min(2).max(4),
    key_gaps: z.array(keyGapSchema).min(2).max(4),
    competitive_positioning: z.string().min(100)
  }),
  sources_used: z.array(z.string().regex(/^S\d+$/))
});

// ============================================================================
// SECTION 7: SKU OPPORTUNITY MAPPING
// ============================================================================

export const opportunitySchema = z.object({
  issue_area: z.string(),
  public_problem: z.string().min(50),
  source: z.string().regex(/^S\d+$/),
  aligned_sku: z.string(),
  priority: prioritySchema,
  severity: z.number().int().min(1).max(10),
  severity_rationale: z.string().min(30),
  geography_relevance: z.string().min(30),
  potential_value_levers: z.array(z.string()).min(2).max(4)
});

export const skuOpportunitiesOutputSchema = z.object({
  confidence: confidenceSchema,
  opportunities: z.array(opportunitySchema).min(0).max(5),
  sources_used: z.array(z.string().regex(/^S\d+$/))
});

// ============================================================================
// SECTION 8: RECENT NEWS & EVENTS
// ============================================================================

export const newsItemSchema = z.object({
  date: z.string(),
  headline: z.string(),
  original_language: z.string().optional(),
  source: z.string().regex(/^S\d+$/),
  source_name: z.string(),
  implication: z.string().min(50),
  geography_relevance: z.string().min(30),
  category: newsCategory
});

export const recentNewsOutputSchema = z.object({
  confidence: confidenceSchema,
  news_items: z.array(newsItemSchema).min(3).max(5),
  sources_used: z.array(z.string().regex(/^S\d+$/))
});

// ============================================================================
// SECTION 9: EXECUTIVE CONVERSATION STARTERS
// ============================================================================

export const conversationStarterSchema = z.object({
  title: z.string().min(10).max(100),
  question: z.string().min(100),
  supporting_data: z.string().min(50),
  business_value: z.string().min(50),
  ssa_capability: z.string().optional(),
  supporting_sections: z.array(z.string()).min(1),
  sources: z.array(z.string().regex(/^S\d+$/)).min(1),
  geography_relevance: z.string().min(30)
});

export const conversationStartersOutputSchema = z.object({
  confidence: confidenceSchema,
  conversation_starters: z.array(conversationStarterSchema).min(3).max(5),
  sources_used: z.array(z.string().regex(/^S\d+$/))
});

// ============================================================================
// SECTION 10: APPENDIX
// ============================================================================

export const sourceReferenceDetailedSchema = sourceReferenceSchema.extend({
  sections_used_in: z.array(z.string()).min(1)
});

export const fxRateDetailedSchema = z.object({
  currency_pair: z.string(),
  rate: z.number().positive(),
  source: fxSourceSchema,
  source_description: z.string()
});

export const derivedMetricDetailedSchema = derivedMetricSchema.extend({
  section: z.string()
});

export const appendixOutputSchema = z.object({
  confidence: confidenceSchema,
  source_references: z.array(sourceReferenceDetailedSchema).min(1),
  fx_rates_and_industry: z.object({
    fx_rates: z.array(fxRateDetailedSchema),
    industry_averages: z.object({
      source: industrySourceSchema,
      dataset: z.string(),
      description: z.string()
    })
  }),
  derived_metrics: z.array(derivedMetricDetailedSchema),
  renumbering_notes: z.string().optional()
});

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validates and parses Claude output for any section
 */
export function validateSectionOutput<T>(
  schema: z.ZodSchema<T>,
  output: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(output);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Type-safe validation with helpful error messages
 */
export function validateWithFeedback<T>(
  schema: z.ZodSchema<T>,
  output: unknown,
  sectionName: string
): T {
  try {
    return schema.parse(output);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `  - ${issue.path.join('.')}: ${issue.message}`
      ).join('\n');
      
      throw new Error(
        `Validation failed for ${sectionName}:\n${issues}`
      );
    }
    throw error;
  }
}

/**
 * Validates all sections in complete research output
 */
export function validateCompleteResearch(output: unknown): boolean {
  if (typeof output !== 'object' || output === null) return false;
  
  const research = output as any;
  
  try {
    // Validate each section if present
    if (research.foundation) foundationOutputSchema.parse(research.foundation);
    if (research.section1) execSummaryOutputSchema.parse(research.section1);
    if (research.section2) financialSnapshotOutputSchema.parse(research.section2);
    if (research.section3) companyOverviewOutputSchema.parse(research.section3);
    if (research.section4) segmentAnalysisOutputSchema.parse(research.section4);
    if (research.section5) trendsOutputSchema.parse(research.section5);
    if (research.section6) peerBenchmarkingOutputSchema.parse(research.section6);
    if (research.section7) skuOpportunitiesOutputSchema.parse(research.section7);
    if (research.section8) recentNewsOutputSchema.parse(research.section8);
    if (research.section9) conversationStartersOutputSchema.parse(research.section9);
    if (research.section10) appendixOutputSchema.parse(research.section10);
    
    return true;
  } catch (error) {
    console.error('Research validation failed:', error);
    return false;
  }
}
