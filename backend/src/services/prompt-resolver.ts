/**
 * Prompt Resolver Service
 * Resolves prompts with database overlay support
 * Priority: Published DB override > Code-based prompt (fallback)
 */

import { PrismaClient, ReportType, PromptStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

// Import all prompt builders
import { buildFoundationPrompt } from '../../prompts/foundation-prompt.js';
import { buildExecSummaryPrompt } from '../../prompts/exec-summary.js';
import { buildFinancialSnapshotPrompt } from '../../prompts/financial-snapshot.js';
import { buildCompanyOverviewPrompt } from '../../prompts/company-overview.js';
import { buildSegmentAnalysisPrompt } from '../../prompts/segment-analysis.js';
import { buildTrendsPrompt } from '../../prompts/trends.js';
import { buildPeerBenchmarkingPrompt } from '../../prompts/peer-benchmarking.js';
import { buildSkuOpportunitiesPrompt } from '../../prompts/sku-opportunities.js';
import { buildRecentNewsPrompt } from '../../prompts/recent-news.js';
import { buildConversationStartersPrompt } from '../../prompts/conversation-starters.js';
import { buildInvestmentStrategyPrompt } from '../../prompts/investment-strategy.js';
import { buildPortfolioSnapshotPrompt } from '../../prompts/portfolio-snapshot.js';
import { buildDealActivityPrompt } from '../../prompts/deal-activity.js';
import { buildDealTeamPrompt } from '../../prompts/deal-team.js';
import { buildPortfolioMaturityPrompt } from '../../prompts/portfolio-maturity.js';
import { buildLeadershipAndGovernancePrompt } from '../../prompts/leadership-and-governance.js';
import { buildStrategicPrioritiesPrompt } from '../../prompts/strategic-priorities.js';
import { buildOperatingCapabilitiesPrompt } from '../../prompts/operating-capabilities.js';
import { REPORT_TYPE_ADDENDUMS, type SectionId, type ReportTypeId } from '../../prompts/report-type-addendums.js';

// Re-export types for consumers
export type { SectionId, ReportTypeId } from '../../prompts/report-type-addendums.js';

// ============================================================================
// TYPES
// ============================================================================

export interface SectionInfo {
  id: SectionId;
  name: string;
  description: string;
  category: 'foundation' | 'core' | 'analysis' | 'synthesis';
  hasAddendums: boolean;
}

export interface ResolvedPrompt {
  content: string;
  source: 'code' | 'database';
  version?: number;
  publishedAt?: Date;
}

export interface PromptWithStatus {
  sectionId: string;
  reportType: ReportTypeId | null;
  name: string;
  description: string | null;
  codeContent: string;
  dbOverride: {
    id: string;
    content: string;
    status: PromptStatus;
    version: number;
    updatedAt: Date;
    publishedAt: Date | null;
  } | null;
}

// ============================================================================
// SECTION METADATA
// ============================================================================

export const SECTION_METADATA: Record<SectionId, { name: string; description: string; category: SectionInfo['category'] }> = {
  foundation: {
    name: 'Foundation Research',
    description: 'Phase 0 comprehensive research that establishes the foundational data layer',
    category: 'foundation'
  },
  exec_summary: {
    name: 'Executive Summary',
    description: 'High-level synthesis with key bullet points and conversation questions',
    category: 'synthesis'
  },
  financial_snapshot: {
    name: 'Financial Snapshot',
    description: 'KPI table with company metrics vs industry averages',
    category: 'core'
  },
  company_overview: {
    name: 'Company Overview',
    description: 'Business description, segments, and geographic footprint',
    category: 'core'
  },
  investment_strategy: {
    name: 'Investment Strategy',
    description: 'Investment focus, fund strategy, and value creation themes (PE)',
    category: 'core'
  },
  portfolio_snapshot: {
    name: 'Portfolio Snapshot',
    description: 'Portfolio company listing and clustering (PE)',
    category: 'core'
  },
  deal_activity: {
    name: 'Deal Activity',
    description: 'Recent investments, add-ons, and exits (PE)',
    category: 'core'
  },
  deal_team: {
    name: 'Deal Team',
    description: 'Key stakeholders and operating partners (PE)',
    category: 'core'
  },
  portfolio_maturity: {
    name: 'Portfolio Maturity',
    description: 'Exit watchlist and holding period analysis (PE)',
    category: 'analysis'
  },
  leadership_and_governance: {
    name: 'Leadership & Governance',
    description: 'Executive team and board composition',
    category: 'core'
  },
  strategic_priorities: {
    name: 'Strategic Priorities',
    description: 'Key transformation and strategic initiatives',
    category: 'core'
  },
  operating_capabilities: {
    name: 'Operating Capabilities',
    description: 'Operational strengths and capabilities',
    category: 'core'
  },
  segment_analysis: {
    name: 'Segment Analysis',
    description: 'Deep-dive into business segments with competitive landscape',
    category: 'analysis'
  },
  trends: {
    name: 'Market Trends',
    description: 'Macro and micro trends impacting the company',
    category: 'analysis'
  },
  peer_benchmarking: {
    name: 'Peer Benchmarking',
    description: 'Competitive comparison table and positioning',
    category: 'analysis'
  },
  sku_opportunities: {
    name: 'SKU Opportunities',
    description: 'Operating tensions mapped to SSA problem areas',
    category: 'analysis'
  },
  recent_news: {
    name: 'Recent News',
    description: 'Latest news and developments',
    category: 'core'
  },
  conversation_starters: {
    name: 'Conversation Starters',
    description: 'Hypothesis-driven questions for client meetings',
    category: 'synthesis'
  },
  appendix: {
    name: 'Appendix & Sources',
    description: 'Auto-generated source citations',
    category: 'synthesis'
  }
};

// Map section IDs to their prompt builders
const PROMPT_BUILDERS: Record<SectionId, (input: any) => string> = {
  foundation: buildFoundationPrompt,
  exec_summary: buildExecSummaryPrompt,
  financial_snapshot: buildFinancialSnapshotPrompt,
  company_overview: buildCompanyOverviewPrompt,
  investment_strategy: buildInvestmentStrategyPrompt,
  portfolio_snapshot: buildPortfolioSnapshotPrompt,
  deal_activity: buildDealActivityPrompt,
  deal_team: buildDealTeamPrompt,
  portfolio_maturity: buildPortfolioMaturityPrompt,
  leadership_and_governance: buildLeadershipAndGovernancePrompt,
  strategic_priorities: buildStrategicPrioritiesPrompt,
  operating_capabilities: buildOperatingCapabilitiesPrompt,
  segment_analysis: buildSegmentAnalysisPrompt,
  trends: buildTrendsPrompt,
  peer_benchmarking: buildPeerBenchmarkingPrompt,
  sku_opportunities: buildSkuOpportunitiesPrompt,
  recent_news: buildRecentNewsPrompt,
  conversation_starters: buildConversationStartersPrompt,
  appendix: () => '' // Auto-generated, no prompt
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * List all available sections with their metadata
 */
export function listAllSections(): SectionInfo[] {
  return (Object.keys(SECTION_METADATA) as SectionId[]).map(id => ({
    id,
    ...SECTION_METADATA[id],
    hasAddendums: id in REPORT_TYPE_ADDENDUMS
  }));
}

// Mock foundation data for generating prompt templates
const MOCK_FOUNDATION = {
  company_basics: {
    legal_name: '{{companyName}}',
    ticker: 'TICKER',
    ownership: 'Public' as const,
    headquarters: '{{geography}}',
    global_revenue_usd: 10000,
    global_employees: 5000,
    fiscal_year_end: 'December'
  },
  geography_specifics: {
    regional_revenue_usd: 2000,
    regional_revenue_pct: 20,
    regional_employees: 1000,
    facilities: [{ name: 'HQ', location: '{{geography}}', type: 'Headquarters' }],
    key_facts: ['Key fact 1', 'Key fact 2']
  },
  source_catalog: [
    { id: 'S1', citation: 'Source 1', url: 'https://example.com', type: 'filing', date: '2024-01-01' }
  ],
  segment_structure: [
    { name: 'Segment A', revenue_pct: 60, description: 'Primary segment' },
    { name: 'Segment B', revenue_pct: 40, description: 'Secondary segment' }
  ],
  data_availability: {
    has_10k: true,
    has_earnings_transcripts: true,
    has_analyst_reports: true,
    geography_specific_data: 'medium' as const,
    overall_confidence: 'MEDIUM' as const,
    confidence_reason: 'Sample data'
  },
  fx_rates: {},
  industry_averages: { source: 'A' as const, dataset: 'Sample' }
};

/**
 * Get the code-based prompt content for a section (without addendum)
 */
export function getCodePromptContent(sectionId: SectionId): string {
  const builder = PROMPT_BUILDERS[sectionId];
  if (!builder) {
    return '';
  }

  // Build with placeholder inputs to get the template
  const placeholderInput = {
    companyName: '{{companyName}}',
    geography: '{{geography}}',
    foundation: MOCK_FOUNDATION,
    section2: null,
    section3: null,
    section4: null,
    section5: null,
    section6: null,
    section7: null,
    section8: null,
    reportType: undefined // No report type to avoid addendum
  };

  try {
    return builder(placeholderInput);
  } catch (error) {
    console.warn(`Failed to build prompt for ${sectionId}:`, error);
    return `[Prompt template for ${sectionId} - requires foundation data to render]`;
  }
}

/**
 * Get the code-based addendum content for a section and report type
 */
export function getCodeAddendumContent(sectionId: SectionId, reportType: ReportTypeId): string {
  const addendum = REPORT_TYPE_ADDENDUMS[sectionId]?.[reportType];
  return addendum || '';
}

/**
 * Resolve a prompt with database overlay support
 * Composition: Base prompt (DB or code) + Addendum (DB or code) when reportType specified
 *
 * Priority for base:
 *   1. Published base DB override (reportType = null)
 *   2. Code-based prompt (fallback)
 *
 * Priority for addendum (when reportType specified):
 *   1. Published report-type-specific DB override
 *   2. Code-based addendum (fallback)
 */
export async function resolvePrompt(
  sectionId: SectionId,
  reportType?: ReportTypeId,
  client: PrismaClient = prisma
): Promise<ResolvedPrompt> {
  // Fetch report-type addendum override if reportType specified
  const reportTypePrompt = reportType
    ? await client.prompt.findFirst({
        where: { sectionId, reportType, status: 'published' },
        orderBy: { version: 'desc' }
      })
    : null;

  // Fetch base override (reportType = null)
  const basePrompt = await client.prompt.findFirst({
    where: {
      sectionId,
      reportType: null,
      status: 'published'
    },
    orderBy: { version: 'desc' }
  });

  // Determine base content (DB override or code fallback)
  const baseContent = basePrompt ? basePrompt.content : getCodePromptContent(sectionId);
  let source: ResolvedPrompt['source'] = basePrompt ? 'database' : 'code';
  let version = basePrompt?.version;
  let publishedAt = basePrompt?.publishedAt || undefined;

  // If reportType specified, compose base + addendum
  if (reportType && sectionId !== 'appendix') {
    // Use DB addendum if available, otherwise code addendum
    const addendum = reportTypePrompt?.content ?? getCodeAddendumContent(sectionId, reportType);
    if (addendum) {
      // If we have a report-type DB override, use its metadata
      if (reportTypePrompt) {
        source = 'database';
        version = reportTypePrompt.version;
        publishedAt = reportTypePrompt.publishedAt || publishedAt;
      }
      return {
        content: `${baseContent}\n\n---\n\n${addendum}`,
        source,
        version,
        publishedAt
      };
    }
  }

  return {
    content: baseContent,
    source,
    version,
    publishedAt
  };
}

/**
 * Get all prompts with their status (code default + any DB overrides)
 */
export async function listAllPrompts(client: PrismaClient = prisma): Promise<PromptWithStatus[]> {
  const sections = listAllSections();
  const reportTypes: (ReportTypeId | null)[] = [null, 'GENERIC', 'INDUSTRIALS', 'PE', 'FS'];

  const results: PromptWithStatus[] = [];

  // Get all DB overrides at once
  const dbOverrides = await client.prompt.findMany({
    orderBy: { version: 'desc' }
  });

  // Create lookup map
  const overrideMap = new Map<string, typeof dbOverrides[0]>();
  for (const override of dbOverrides) {
    const key = `${override.sectionId}:${override.reportType || 'null'}`;
    // Only keep the highest version
    if (!overrideMap.has(key)) {
      overrideMap.set(key, override);
    }
  }

  for (const section of sections) {
    // Add base prompt (no report type)
    const baseKey = `${section.id}:null`;
    const baseOverride = overrideMap.get(baseKey);

    results.push({
      sectionId: section.id,
      reportType: null,
      name: section.name,
      description: section.description,
      codeContent: getCodePromptContent(section.id),
      dbOverride: baseOverride ? {
        id: baseOverride.id,
        content: baseOverride.content,
        status: baseOverride.status,
        version: baseOverride.version,
        updatedAt: baseOverride.updatedAt,
        publishedAt: baseOverride.publishedAt
      } : null
    });

    // Add addendums for sections that have them
    if (section.hasAddendums) {
      for (const rt of reportTypes) {
        if (rt === null) continue; // Already added base

        const key = `${section.id}:${rt}`;
        const override = overrideMap.get(key);

        results.push({
          sectionId: section.id,
          reportType: rt,
          name: `${section.name} (${rt})`,
          description: `${rt} report type addendum`,
          codeContent: getCodeAddendumContent(section.id, rt),
          dbOverride: override ? {
            id: override.id,
            content: override.content,
            status: override.status,
            version: override.version,
            updatedAt: override.updatedAt,
            publishedAt: override.publishedAt
          } : null
        });
      }
    }
  }

  return results;
}

/**
 * Get a single prompt with its status
 */
export async function getPromptWithStatus(
  sectionId: SectionId,
  reportType: ReportTypeId | null = null,
  client: PrismaClient = prisma
): Promise<PromptWithStatus | null> {
  const section = SECTION_METADATA[sectionId];
  if (!section) return null;

  const dbOverride = await client.prompt.findFirst({
    where: {
      sectionId,
      reportType: reportType
    },
    orderBy: { version: 'desc' }
  });

  const codeContent = reportType
    ? getCodeAddendumContent(sectionId, reportType)
    : getCodePromptContent(sectionId);

  return {
    sectionId,
    reportType,
    name: reportType ? `${section.name} (${reportType})` : section.name,
    description: reportType ? `${reportType} report type addendum` : section.description,
    codeContent,
    dbOverride: dbOverride ? {
      id: dbOverride.id,
      content: dbOverride.content,
      status: dbOverride.status,
      version: dbOverride.version,
      updatedAt: dbOverride.updatedAt,
      publishedAt: dbOverride.publishedAt
    } : null
  };
}

/**
 * Get version history for a prompt
 */
export async function getPromptVersionHistory(
  sectionId: SectionId,
  reportType: ReportTypeId | null = null,
  client: PrismaClient = prisma
) {
  return client.promptVersion.findMany({
    where: {
      sectionId,
      reportType: reportType
    },
    orderBy: { version: 'desc' }
  });
}
