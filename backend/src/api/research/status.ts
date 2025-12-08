/**
 * GET /api/research/jobs/:id
 * Get job status with real-time progress
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getJobStatus(req: Request, res: Response) {
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
            attempts: true,
            startedAt: true,
            completedAt: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        jobId: id
      });
    }

    // Calculate estimated time remaining
    const completedJobs = job.subJobs.filter(j => j.status === 'completed');
    const runningJobs = job.subJobs.filter(j => j.status === 'running');
    const pendingJobs = job.subJobs.filter(j => j.status === 'pending');

    const avgTimePerSection = 45; // seconds (estimate)
    const estimatedTimeRemaining = pendingJobs.length * avgTimePerSection;

    return res.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      currentStage: job.currentStage,
      companyName: job.companyName,
      geography: job.geography,
      overallConfidence: job.overallConfidence,
      overallConfidenceScore: job.overallConfidenceScore,
      error: job.status === 'failed' ? 'Job execution failed' : null,
      jobs: job.subJobs,
      summary: {
        total: job.subJobs.length,
        completed: completedJobs.length,
        running: runningJobs.length,
        pending: pendingJobs.length,
        failed: job.subJobs.filter(j => j.status === 'failed').length
      },
      estimatedTimeRemaining: job.status === 'running' ? estimatedTimeRemaining : 0,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    });

  } catch (error) {
    console.error('Error fetching job status:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch job status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
