export type JobStatus = 'idle' | 'queued' | 'running' | 'completed' | 'completed_with_errors' | 'failed' | 'cancelled';

export type ReportType = 'GENERIC' | 'INDUSTRIALS' | 'PE' | 'FS';

export type VisibilityScope = 'PRIVATE' | 'GROUP' | 'GENERAL';

export type SectionId = 
  | 'exec_summary'
  | 'financial_snapshot'
  | 'company_overview'
  | 'investment_strategy'
  | 'portfolio_snapshot'
  | 'deal_activity'
  | 'deal_team'
  | 'portfolio_maturity'
  | 'leadership_and_governance'
  | 'strategic_priorities'
  | 'operating_capabilities'
  | 'segment_analysis'
  | 'trends'
  | 'peer_benchmarking'
  | 'sku_opportunities'
  | 'recent_news'
  | 'conversation_starters'
  | 'appendix';

export enum SectionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface ResearchSection {
  id: SectionId;
  title: string;
  status: SectionStatus;
  content: string | null; // Markdown or JSON string
  confidence: number; // 0.0 to 1.0
  sources: ResearchSource[];
  lastError?: string;
  updatedAt?: number;
}

export interface ResearchJob {
  id: string;
  companyName: string;
  geography: string;
  industry?: string;
  domain?: string | null;
  reportType?: ReportType;
  visibilityScope?: VisibilityScope;
  selectedSections?: SectionId[];
  groupIds?: string[];
  groups?: Array<{ id: string; name: string; slug: string }>;
  userAddedPrompt?: string | null;
  queuePosition?: number | null;
  overallConfidence?: string | null;
  overallConfidenceScore?: number | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  costUsd?: number | null;
  thumbnailUrl?: string | null;
  createdAt: number;
  status: JobStatus;
  progress: number; // 0-100
  currentAction: string; // "Analyzing annual reports..."
  sections: Record<SectionId, ResearchSection>;
}

export type BlueprintInputType = 'text' | 'textarea' | 'select';

export interface BlueprintInputOption {
  value: string;
  label: string;
}

export interface BlueprintInput {
  id: string;
  label: string;
  type: BlueprintInputType;
  required: boolean;
  options?: BlueprintInputOption[];
  helperText?: string;
}

export interface BlueprintSection {
  id: SectionId;
  title: string;
  defaultSelected: boolean;
  focus: string;
  dependencies?: SectionId[];
  reportSpecific?: boolean;
}

export interface ReportBlueprint {
  version: string;
  reportType: ReportType;
  title: string;
  purpose: string;
  sections: BlueprintSection[];
  inputs: BlueprintInput[];
}

export const SECTIONS_CONFIG: {id: SectionId, title: string}[] = [
  { id: 'exec_summary', title: 'Executive Summary' },
  { id: 'financial_snapshot', title: 'Financial Snapshot' },
  { id: 'company_overview', title: 'Company Overview' },
  { id: 'investment_strategy', title: 'Investment Strategy and Focus' },
  { id: 'portfolio_snapshot', title: 'Portfolio Snapshot' },
  { id: 'deal_activity', title: 'Recent Investments and Add-ons' },
  { id: 'deal_team', title: 'Deal Team and Key Stakeholders' },
  { id: 'portfolio_maturity', title: 'Portfolio Maturity and Exit Watchlist' },
  { id: 'leadership_and_governance', title: 'Leadership and Governance' },
  { id: 'strategic_priorities', title: 'Strategic Priorities and Transformation' },
  { id: 'operating_capabilities', title: 'Operating Capabilities' },
  { id: 'segment_analysis', title: 'Segment Analysis' },
  { id: 'trends', title: 'Market Trends' },
  { id: 'peer_benchmarking', title: 'Peer Benchmarking' },
  { id: 'sku_opportunities', title: 'SKU Opportunities' },
  { id: 'recent_news', title: 'Recent News' },
  { id: 'conversation_starters', title: 'Conversation Starters' },
  { id: 'appendix', title: 'Appendix & Sources' },
];
