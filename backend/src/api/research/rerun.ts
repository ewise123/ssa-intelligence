/**
 * POST /api/research/:id/rerun
 * Rerun specific research sections
 */

import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { buildVisibilityWhere } from '../../middleware/auth.js';
import {
  STAGE_DEPENDENCIES,
  STAGE_OUTPUT_FIELDS,
  type StageId,
  getResearchOrchestrator
} from '../../services/orchestrator.js';
import { computeTerminalProgress } from '../../services/orchestrator-utils.js';
import { computeRerunStages } from '../../services/rerun-utils.js';

interface RerunRequestBody {
  sections?: string[];
}

const normalizeSections = (sections: unknown): string[] => {
  if (!Array.isArray(sections)) {
    return [];
  }

  return Array.from(
    new Set(
      sections
        .map((section) => (typeof section === 'string' ? section.trim() : ''))
        .filter(Boolean)
    )
  );
};

export async function rerunResearchSections(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = req.body as RerunRequestBody;
    const requestedSections = normalizeSections(body.sections);

    if (!requestedSections.length) {
      return res.status(400).json({ error: 'sections must be a non-empty array' });
    }

    const allowedStages = new Set(Object.keys(STAGE_DEPENDENCIES));
    const invalidSections = requestedSections.filter((section) => !allowedStages.has(section));
    if (invalidSections.length) {
      return res.status(400).json({
        error: `Invalid sections: ${invalidSections.join(', ')}`
      });
    }

    const visibilityWhere = buildVisibilityWhere(req.auth);
    const job = await prisma.researchJob.findFirst({
      where: { AND: [{ id }, visibilityWhere] },
      select: {
        status: true,
        userId: true,
        subJobs: { select: { stage: true, status: true } }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found', jobId: id });
    }

    if (!req.auth.isAdmin && job.userId !== req.auth.userId) {
      return res.status(403).json({ error: 'Not authorized to rerun this job' });
    }

    if (job.status === 'running' || job.status === 'queued') {
      return res.status(400).json({ error: 'Job is already running or queued' });
    }

    const jobStages = new Set(job.subJobs.map((subJob) => subJob.stage));
    const unavailableSections = requestedSections.filter((section) => !jobStages.has(section));
    if (unavailableSections.length) {
      return res.status(400).json({
        error: `Sections not present on this job: ${unavailableSections.join(', ')}`
      });
    }

    const rerunStages = computeRerunStages(
      requestedSections,
      job.subJobs,
      STAGE_DEPENDENCIES
    );

    if (!rerunStages.length) {
      return res.status(400).json({ error: 'No rerunnable sections found' });
    }

    const rerunStageSet = new Set(rerunStages);
    const adjustedSubJobs = job.subJobs.map((subJob) =>
      rerunStageSet.has(subJob.stage)
        ? { ...subJob, status: 'pending' }
        : subJob
    );
    const progress = computeTerminalProgress(adjustedSubJobs);

    const jobOutputResets: Record<string, Prisma.NullTypes.DbNull> = {};
    for (const stage of rerunStages) {
      const field = STAGE_OUTPUT_FIELDS[stage as StageId];
      if (field) {
        jobOutputResets[field] = Prisma.DbNull;
      }
    }

    const queuedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.researchSubJob.updateMany({
        where: { researchId: id, stage: { in: rerunStages } },
        data: {
          status: 'pending',
          attempts: 0,
          lastError: null,
          output: Prisma.DbNull,
          startedAt: null,
          completedAt: null,
          duration: null
        }
      });

      await tx.researchJob.update({
        where: { id },
        data: {
          status: 'queued',
          currentStage: null,
          queuedAt,
          startedAt: null,
          completedAt: null,
          progress,
          ...jobOutputResets
        }
      });
    });

    const orchestrator = getResearchOrchestrator(prisma);
    orchestrator.processQueue(true).catch(console.error);

    return res.json({
      success: true,
      jobId: id,
      status: 'queued',
      rerunStages
    });
  } catch (error) {
    console.error('Error rerunning research sections:', error);
    return res.status(500).json({
      error: 'Failed to rerun research sections',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
