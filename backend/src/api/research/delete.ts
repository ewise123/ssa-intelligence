import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function deleteResearchJob(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.headers['x-user-id'] as string) || 'demo-user';

    const job = await prisma.researchJob.findFirst({
      where: { id, userId },
      select: { status: true }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found', jobId: id });
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
