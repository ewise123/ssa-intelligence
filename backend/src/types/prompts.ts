/**
 * Backend Types
 * Mirrors the prompt system types for type safety
 */

// Re-export types from prompt system
// These should match the types in the prompts package

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Confidence {
  level: ConfidenceLevel;
  reason: string;
}

export interface SourceReference {
  id: string;              // "S1", "S2", "S3", etc.
  citation: string;
  url?: string;
  type: 'filing' | 'transcript' | 'analyst_report' | 'news' | 'user_provided' | 'government';
  date: string;
}

// ============================================================================
// FOUNDATION OUTPUT
// ============================================================================

export interface CompanyBasics {
  legal_name: string;
  ticker?: string;
  ownership: 'Public' | 'Private' | 'Subsidiary';
  headquarters: string;
  global_revenue_usd: number;
  global_employees: number;
  fiscal_year_end: string;
}

export interface GeographySpecifics {
  regional_revenue_usd: number;
  regional_revenue_pct: number;
  regional_employees: number;
  facilities: Array<{
    name: string;
    location: string;
    type: string;
  }>;
  key_facts: string[];
}

export interface SegmentStructure {
  name: string;
  revenue_pct: number;
  description: string;
}

export interface FxRate {
  rate: number;
  source: 'A' | 'B' | 'C';
}

export interface IndustryAverages {
  source: 'A' | 'B' | 'C';
  dataset: string;
}

export interface FoundationOutput {
  confidence: Confidence;
  company_basics: CompanyBasics;
  geography_specifics: GeographySpecifics;
  source_catalog: SourceReference[];
  segment_structure: SegmentStructure[];
  fx_rates: Record<string, FxRate>;
  industry_averages: IndustryAverages;
}

// ============================================================================
// SECTION OUTPUTS (matching prompt system)
// ============================================================================

// Note: Import these from the actual prompt validation schemas
// For now, using 'any' as placeholder - replace with actual types

export type Section1Output = any; // ExecutiveSummaryOutput
export type Section2Output = any; // FinancialSnapshotOutput
export type Section3Output = any; // CompanyOverviewOutput
export type Section4Output = any; // SegmentAnalysisOutput
export type Section5Output = any; // TrendsOutput
export type Section6Output = any; // PeerBenchmarkingOutput
export type Section7Output = any; // SkuOpportunitiesOutput
export type Section8Output = any; // RecentNewsOutput
export type Section9Output = any; // ConversationStartersOutput
export type Section10Output = any; // AppendixOutput

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateJobRequest {
  companyName: string;
  geography: string;
  industry?: string;
  focusAreas?: string[];
  requestedBy?: string;
}

export interface CreateJobResponse {
  jobId: string;
  status: 'pending';
  message: string;
  companyName: string;
  geography: string;
}

export interface JobStatusResponse {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStage?: string;
  companyName: string;
  geography: string;
  error?: string | null;
  jobs: Array<{
    stage: string;
    status: string;
    confidence?: string | null;
    sourcesUsed?: string[];
    lastError?: string | null;
  }>;
  summary: {
    total: number;
    completed: number;
    running: number;
    pending: number;
    failed: number;
  };
  estimatedTimeRemaining: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchDetailResponse {
  id: string;
  status: string;
  metadata: {
    companyName: string;
    geography: string;
    industry?: string;
    overallConfidence?: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
  };
  foundation: FoundationOutput;
  sections: Record<string, any>;
  sectionsCompleted: number[];
  sectionStatuses: Array<{
    stage: string;
    status: string;
    confidence?: string;
    sourcesUsed?: string[];
    lastError?: string;
    completedAt?: Date;
  }>;
  sourceCatalog: Array<{
    id: string;
    title: string;
    url: string;
    citation: string;
    type: string;
    date: string;
  }>;
}

export interface ListResearchResponse {
  results: Array<{
    id: string;
    status: string;
    companyName: string;
    geography: string;
    industry?: string;
    progress: number;
    currentStage?: string;
    overallConfidence?: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    metadata: {
      companyName: string;
      geography: string;
      industry?: string;
    };
    generatedSections: number[];
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
