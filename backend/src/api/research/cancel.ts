/**
 * POST /api/research/:id/cancel
 * Cancel a queued or running research job
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { getResearchOrchestrator } from '../../services/orchestrator.js';
import { buildVisibilityWhere } from '../../middleware/auth.js';

export async function cancelResearchJob(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const visibilityWhere = buildVisibilityWhere(req.auth);
    const job = await prisma.researchJob.findFirst({
      where: { AND: [{ id }, visibilityWhere] },
      select: { status: true, userId: true }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found', jobId: id });
    }

    if (!req.auth.isAdmin && job.userId !== req.auth.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this job' });
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return res.status(400).json({ error: 'Job already completed', status: job.status });
    }

    await prisma.$transaction([
      prisma.researchJob.update({
        where: { id },
        data: {
          status: 'cancelled',
          currentStage: null
        }
      }),
      prisma.researchSubJob.updateMany({
        where: { researchId: id, status: { in: ['pending', 'running'] } },
        data: {
          status: 'cancelled',
          completedAt: new Date()
        }
      })
    ]);

    // Nudge the queue to pick the next job if this one was running/queued
    const orchestrator = getResearchOrchestrator(prisma);
    orchestrator.processQueue(true).catch(console.error);

    return res.json({ success: true, jobId: id, status: 'cancelled' });
  } catch (error) {
    console.error('Error cancelling research job:', error);
    return res.status(500).json({
      error: 'Failed to cancel research job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
