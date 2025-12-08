export type JobStatus = 'idle' | 'running' | 'completed' | 'failed';

export type SectionId = 
  | 'exec_summary'
  | 'financial_snapshot'
  | 'company_overview'
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
  overallConfidence?: string | null;
  overallConfidenceScore?: number | null;
  createdAt: number;
  status: JobStatus;
  progress: number; // 0-100
  currentAction: string; // "Analyzing annual reports..."
  sections: Record<SectionId, ResearchSection>;
}

export const SECTIONS_CONFIG: {id: SectionId, title: string}[] = [
  { id: 'exec_summary', title: 'Executive Summary' },
  { id: 'financial_snapshot', title: 'Financial Snapshot' },
  { id: 'company_overview', title: 'Company Overview' },
  { id: 'segment_analysis', title: 'Segment Analysis' },
  { id: 'trends', title: 'Market Trends' },
  { id: 'peer_benchmarking', title: 'Peer Benchmarking' },
  { id: 'sku_opportunities', title: 'SKU Opportunities' },
  { id: 'recent_news', title: 'Recent News' },
  { id: 'conversation_starters', title: 'Conversation Starters' },
  { id: 'appendix', title: 'Appendix & Sources' },
];
