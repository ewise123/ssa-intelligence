/**
 * POST /api/research/:id/cancel
 * Cancel a queued or running research job
 */

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { getResearchOrchestrator } from '../../services/orchestrator.js';
import { buildVisibilityWhere } from '../../middleware/auth.js';
import { buildCancelResponse } from './cancel-utils.js';

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

    const deleteResult = await prisma.$transaction(async (tx) => {
      const subJobs = await tx.researchSubJob.deleteMany({
        where: { researchId: id }
      });
      const jobGroups = await tx.researchJobGroup.deleteMany({
        where: { jobId: id }
      });
      const jobs = await tx.researchJob.deleteMany({
        where: { id }
      });
      return { subJobs, jobGroups, jobs };
    });

    if (deleteResult.jobs.count === 0) {
      return res.status(404).json({ error: 'Job not found', jobId: id });
    }

    console.log('[cancel] deleted job', {
      jobId: id,
      subJobs: deleteResult.subJobs.count,
      jobGroups: deleteResult.jobGroups.count
    });

    // Nudge the queue to pick the next job if this one was running/queued
    const orchestrator = getResearchOrchestrator(prisma);
    orchestrator.processQueue(true).catch(console.error);

    return res.json(buildCancelResponse(id));
  } catch (error) {
    console.error('Error cancelling research job:', error);
    return res.status(500).json({
      error: 'Failed to cancel research job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
