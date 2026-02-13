import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { sectionOrder } from '../../services/section-formatter.js';
import { buildExportSections, isExportReady } from '../../services/export-utils.js';
import { getReportBlueprint } from '../../services/report-blueprints.js';
import { generateResearchDocx } from '../../services/docx-export.js';
import { buildVisibilityWhere } from '../../middleware/auth.js';
import { safeErrorMessage } from '../../lib/error-utils.js';

export async function exportResearchDocx(req: Request, res: Response) {
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
          select: { stage: true, status: true, lastError: true, output: true }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Research job not found' });
    }

    if (!isExportReady(job.status)) {
      return res.status(400).json({ error: 'Report is not ready to export yet' });
    }

    const dateStr = new Date(job.createdAt).toISOString().slice(0, 10);
    const sanitize = (name: string) =>
      name.replace(/[^a-zA-Z0-9_\-. ]/g, '').replace(/\s+/g, '_');
    const sanitized = sanitize(job.companyName) || 'report';
    const filename = `${sanitized}-${dateStr}.docx`;

    const blueprint = getReportBlueprint(job.reportType || 'GENERIC');
    const exportSections = buildExportSections({
      job,
      subJobs: job.subJobs,
      blueprint,
      fallbackOrder: sectionOrder
    });

    const buffer = await generateResearchDocx({
      job: {
        companyName: job.companyName,
        geography: job.geography,
        industry: job.industry,
        status: job.status,
        createdAt: job.createdAt,
      },
      exportSections,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error) {
    console.error('Error exporting DOCX:', error);
    return res.status(500).json({
      error: 'Failed to export DOCX',
      message: safeErrorMessage(error)
    });
  }
}
