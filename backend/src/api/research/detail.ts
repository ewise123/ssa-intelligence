/**
 * GET /api/research/:id
 * Get complete research output with all sections
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { createSourceCatalog } from '../../services/source-resolver.js';
import type { FoundationOutput } from '../../types/prompts.js';
import { buildVisibilityWhere } from '../../middleware/auth.js';
import { getReportBlueprint } from '../../services/report-blueprints.js';
import { deriveJobStatus } from './status-utils.js';

// Map database fields to section keys
const SECTION_FIELD_MAP = {
  exec_summary: 'execSummary',
  financial_snapshot: 'financialSnapshot',
  company_overview: 'companyOverview',
  segment_analysis: 'segmentAnalysis',
  trends: 'trends',
  peer_benchmarking: 'peerBenchmarking',
  sku_opportunities: 'skuOpportunities',
  recent_news: 'recentNews',
  conversation_starters: 'conversationStarters',
  appendix: 'appendix'
} as const;

const FALLBACK_SECTION_IDS = Object.keys(SECTION_FIELD_MAP);

export async function getResearchDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const visibilityWhere = buildVisibilityWhere(req.auth);
    const job = await prisma.researchJob.findFirst({
      where: { AND: [{ id }, visibilityWhere] },
      include: {
        subJobs: {
          select: {
            stage: true,
            status: true,
            confidence: true,
            sourcesUsed: true,
            lastError: true,
            completedAt: true,
            promptTokens: true,
            completionTokens: true,
            costUsd: true,
            output: true
          }
        },
        jobGroups: {
          select: {
            groupId: true,
            group: { select: { id: true, name: true, slug: true } }
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        error: 'Research not found',
        jobId: id
      });
    }

    const effectiveStatus = deriveJobStatus({ status: job.status, subJobs: job.subJobs });

    // Build source catalog from foundation
    let sourceCatalog: import("../../services/source-resolver.js").SourceCatalogManager | null = null;
    if (job.foundation) {
      try {
        sourceCatalog = createSourceCatalog(job.foundation as unknown as FoundationOutput);
      } catch (error) {
        console.error('Error creating source catalog:', error);
      }
    }

    const blueprint = getReportBlueprint(job.reportType || 'GENERIC');
    const sectionIds = blueprint?.sections.map((section) => section.id) || FALLBACK_SECTION_IDS;

    // Build sections object with resolved sources (always include sections, even if missing content)
    const sections: any = {};
    
    for (const sectionId of sectionIds) {
      const fieldName = (SECTION_FIELD_MAP as Record<string, string>)[sectionId];
      const sectionDataRaw = fieldName ? job[fieldName as keyof typeof job] : undefined;
      const sectionData =
        sectionDataRaw && typeof sectionDataRaw === 'object'
          ? (sectionDataRaw as Record<string, any>)
          : null;
      const subJob = job.subJobs.find(j => j.stage === sectionId);
      const fallbackOutput =
        !sectionData && subJob?.output && typeof subJob.output === 'object'
          ? (subJob.output as Record<string, any>)
          : null;
      
      sections[sectionId] = {
        ...(sectionData || fallbackOutput || {}),
        status: subJob?.status || 'pending',
        lastError: subJob?.lastError,
        completedAt: subJob?.completedAt,
        rawOutput: subJob?.output,
        // Resolve source IDs to full source details
        sources: sourceCatalog?.resolveSources((sectionData || fallbackOutput)?.sources_used || []) || []
      };
    }

    // Calculate completed sections count
    const completedSections = job.subJobs
      .filter(j => j.status === 'completed' && j.stage !== 'foundation')
      .map(j => {
        // Map stage back to section number for backwards compatibility
        const sectionMap: Record<string, number> = {
          exec_summary: 1,
          financial_snapshot: 2,
          company_overview: 3,
          segment_analysis: 4,
          trends: 5,
          peer_benchmarking: 6,
          sku_opportunities: 7,
          recent_news: 8,
          conversation_starters: 9,
          appendix: 10
        };
        return sectionMap[j.stage] || 0;
      })
      .filter(n => n > 0);

    return res.json({
      id: job.id,
      status: effectiveStatus,
      metadata: {
        companyName: job.companyName,
        geography: job.geography,
        industry: job.industry,
        domain: job.domain || null,
        reportType: job.reportType || null,
        visibilityScope: job.visibilityScope || null,
        selectedSections: job.selectedSections || [],
        userAddedPrompt: job.userAddedPrompt || null,
        overallConfidence: job.overallConfidence,
        overallConfidenceScore: job.overallConfidenceScore,
        promptTokens: job.promptTokens,
        completionTokens: job.completionTokens,
        costUsd: job.costUsd,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        completedAt: job.completedAt
      },
      thumbnailUrl: job.thumbnailUrl || null,
      groups: job.jobGroups.map((entry) => entry.group),
      foundation: job.foundation,
      sections,
      sectionsCompleted: completedSections,
      sectionStatuses: job.subJobs.map(subJob => ({
        stage: subJob.stage,
        status: subJob.status,
        confidence: subJob.confidence,
        sourcesUsed: subJob.sourcesUsed,
        lastError: subJob.lastError,
        completedAt: subJob.completedAt,
        promptTokens: subJob.promptTokens,
        completionTokens: subJob.completionTokens,
        costUsd: subJob.costUsd
      })),
      overallConfidence: job.overallConfidence,
      overallConfidenceScore: job.overallConfidenceScore,
      // Include full source catalog for frontend
      sourceCatalog: sourceCatalog?.getAllSources() || []
    });

  } catch (error) {
    console.error('Error fetching research detail:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch research details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


