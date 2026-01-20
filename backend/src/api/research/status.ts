/**
 * GET /api/research/jobs/:id
 * Get job status with real-time progress
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { getResearchOrchestrator } from '../../services/orchestrator.js';
import { buildVisibilityWhere } from '../../middleware/auth.js';
import { deriveJobStatus } from './status-utils.js';

export async function getJobStatus(req: Request, res: Response) {
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
            attempts: true,
            startedAt: true,
            completedAt: true,
            promptTokens: true,
            completionTokens: true,
            costUsd: true
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
    const effectiveStatus = deriveJobStatus({ status: job.status, subJobs: job.subJobs });

    const avgTimePerSection = 45; // seconds (estimate)
    const estimatedTimeRemaining = pendingJobs.length * avgTimePerSection;

    const orchestrator = getResearchOrchestrator(prisma);
    const queuePosition = effectiveStatus === 'queued'
      ? await orchestrator.getQueuePosition(job.id)
      : 0;
    const blockedByRunning = effectiveStatus === 'queued' && queuePosition > 1;
    if (effectiveStatus === 'queued') {
      // Nudge queue in case it stalled
      orchestrator.processQueue(true).catch(console.error);
    }

    return res.json({
      id: job.id,
      status: effectiveStatus,
      queuePosition,
      blockedByRunning,
      progress: job.progress,
      currentStage: job.currentStage,
      companyName: job.companyName,
      geography: job.geography,
      domain: job.domain || null,
      thumbnailUrl: job.thumbnailUrl || null,
      reportType: job.reportType,
      visibilityScope: job.visibilityScope,
      selectedSections: job.selectedSections,
      userAddedPrompt: job.userAddedPrompt,
      overallConfidence: job.overallConfidence,
      overallConfidenceScore: job.overallConfidenceScore,
      promptTokens: job.promptTokens,
      completionTokens: job.completionTokens,
      costUsd: job.costUsd,
      error:
        effectiveStatus === 'failed'
          ? 'Job execution failed'
          : effectiveStatus === 'completed_with_errors'
            ? 'Job completed with errors'
            : null,
      jobs: job.subJobs,
      summary: {
        total: job.subJobs.length,
        completed: completedJobs.length,
        running: runningJobs.length,
        pending: pendingJobs.length,
        failed: job.subJobs.filter(j => j.status === 'failed').length
      },
      estimatedTimeRemaining: effectiveStatus === 'running' ? estimatedTimeRemaining : 0,
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
