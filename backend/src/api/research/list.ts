/**
 * GET /api/research
 * List all research jobs for a user
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { buildVisibilityWhere } from '../../middleware/auth.js';
import { buildCompletedStages } from '../../services/stage-tracking-utils.js';
import { deriveJobStatus } from './status-utils.js';

interface ListQueryParams {
  limit?: string;
  offset?: string;
  status?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'companyName';
  sortOrder?: 'asc' | 'desc';
}

export async function listResearch(req: Request, res: Response) {
  try {
    const query = req.query as ListQueryParams;

    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse pagination
    const limit = Math.min(parseInt(query.limit || '50'), 100);
    const offset = parseInt(query.offset || '0');

    // Parse sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    // Build where clause
    const visibilityWhere = buildVisibilityWhere(req.auth);
    const where: any = query.status
      ? { AND: [visibilityWhere, { status: query.status }] }
      : visibilityWhere;

    // Fetch jobs
    const [jobs, total] = await Promise.all([
      prisma.researchJob.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
        select: {
          id: true,
          status: true,
          companyName: true,
          geography: true,
          industry: true,
          domain: true,
          progress: true,
          currentStage: true,
          reportType: true,
          visibilityScope: true,
          selectedSections: true,
          userAddedPrompt: true,
          overallConfidence: true,
          overallConfidenceScore: true,
          promptTokens: true,
          completionTokens: true,
          costUsd: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          queuedAt: true,
          thumbnailUrl: true,
          // include sub-job status for effective status + generated sections
          subJobs: {
            select: { stage: true, status: true }
          },
          jobGroups: {
            select: {
              group: { select: { id: true, name: true, slug: true } }
            }
          }
        }
      }),
      prisma.researchJob.count({ where })
    ]);

    // Map to response format
    const results = jobs.map(job => ({
      id: job.id,
      status: deriveJobStatus({ status: job.status, subJobs: job.subJobs }),
      companyName: job.companyName,
      geography: job.geography,
      industry: job.industry,
      domain: job.domain || null,
      reportType: job.reportType,
      visibilityScope: job.visibilityScope,
      selectedSections: job.selectedSections,
      userAddedPrompt: job.userAddedPrompt,
      progress: job.progress,
      currentStage: job.currentStage,
      overallConfidence: job.overallConfidence,
      overallConfidenceScore: job.overallConfidenceScore,
      promptTokens: job.promptTokens,
      completionTokens: job.completionTokens,
      costUsd: job.costUsd,
      createdAt: job.createdAt,
      queuedAt: job.queuedAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
      thumbnailUrl: job.thumbnailUrl || null,
      metadata: {
        companyName: job.companyName,
        geography: job.geography,
        industry: job.industry
      },
      generatedSections: job.subJobs
        .filter(subJob => subJob.status === 'completed' && subJob.stage !== 'foundation')
        .map(subJob => {
          // Map stage to section number
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
          return sectionMap[subJob.stage] || 0;
        })
        .filter(n => n > 0)
      ,
      generatedStages: buildCompletedStages(job.subJobs, job.selectedSections),
      groups: job.jobGroups.map((entry) => entry.group)
    }));

    return res.json({
      results,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error listing research:', error);
    
    return res.status(500).json({
      error: 'Failed to list research',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
