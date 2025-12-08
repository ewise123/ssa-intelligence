/**
 * GET /api/research
 * List all research jobs for a user
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // For demo purposes, use a default user
    // In production, get this from auth middleware
    const userId = req.headers['x-user-id'] as string || 'demo-user';

    // Parse pagination
    const limit = Math.min(parseInt(query.limit || '50'), 100);
    const offset = parseInt(query.offset || '0');

    // Parse sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    // Build where clause
    const where: any = { userId };
    if (query.status) {
      where.status = query.status;
    }

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
          progress: true,
          currentStage: true,
          overallConfidence: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          subJobs: {
            where: { status: 'completed' },
            select: { stage: true }
          }
        }
      }),
      prisma.researchJob.count({ where })
    ]);

    // Map to response format
    const results = jobs.map(job => ({
      id: job.id,
      status: job.status,
      companyName: job.companyName,
      geography: job.geography,
      industry: job.industry,
      progress: job.progress,
      currentStage: job.currentStage,
      overallConfidence: job.overallConfidence,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
      metadata: {
        companyName: job.companyName,
        geography: job.geography,
        industry: job.industry
      },
      generatedSections: job.subJobs
        .filter(subJob => subJob.stage !== 'foundation')
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
