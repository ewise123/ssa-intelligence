import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { buildVisibilityWhere } from '../../middleware/auth.js';

export async function deleteResearchJob(req: Request, res: Response) {
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
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    if (job.status === 'running' || job.status === 'queued') {
      return res.status(400).json({ error: 'Cannot delete a running or queued job. Cancel it first.' });
    }

    await prisma.researchJob.delete({ where: { id } });

    return res.json({ success: true, jobId: id });
  } catch (error) {
    console.error('Error deleting research job:', error);
    return res.status(500).json({
      error: 'Failed to delete research job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
