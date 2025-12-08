/**
 * GET /api/research/:id
 * Get complete research output with all sections
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createSourceCatalog } from '../../services/source-resolver';
import type { FoundationOutput } from '../../types/prompts';

const prisma = new PrismaClient();

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

export async function getResearchDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const job = await prisma.researchJob.findUnique({
      where: { id },
      include: {
        subJobs: {
          select: {
            stage: true,
            status: true,
            confidence: true,
            sourcesUsed: true,
            lastError: true,
            completedAt: true
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

    // Build source catalog from foundation
    let sourceCatalog = null;
    if (job.foundation) {
      try {
        sourceCatalog = createSourceCatalog(job.foundation as FoundationOutput);
      } catch (error) {
        console.error('Error creating source catalog:', error);
      }
    }

    // Build sections object with resolved sources
    const sections: any = {};
    
    for (const [sectionId, fieldName] of Object.entries(SECTION_FIELD_MAP)) {
      const sectionData = (job as any)[fieldName];
      const subJob = job.subJobs.find(j => j.stage === sectionId);
      
      if (sectionData) {
        sections[sectionId] = {
          ...sectionData,
          status: subJob?.status || 'pending',
          lastError: subJob?.lastError,
          completedAt: subJob?.completedAt,
          // Resolve source IDs to full source details
          sources: sourceCatalog && sectionData.sources_used
            ? sourceCatalog.resolveSources(sectionData.sources_used)
            : []
        };
      }
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
      status: job.status,
      metadata: {
        companyName: job.companyName,
        geography: job.geography,
        industry: job.industry,
        overallConfidence: job.overallConfidence,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        completedAt: job.completedAt
      },
      foundation: job.foundation,
      sections,
      sectionsCompleted: completedSections,
      sectionStatuses: job.subJobs.map(subJob => ({
        stage: subJob.stage,
        status: subJob.status,
        confidence: subJob.confidence,
        sourcesUsed: subJob.sourcesUsed,
        lastError: subJob.lastError,
        completedAt: subJob.completedAt
      })),
      // Include full source catalog for frontend
      sourceCatalog: sourceCatalog ? sourceCatalog.getAllSources() : []
    });

  } catch (error) {
    console.error('Error fetching research detail:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch research details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
