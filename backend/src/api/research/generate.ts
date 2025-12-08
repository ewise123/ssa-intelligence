/**
 * POST /api/research/generate
 * Create a new research job
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ResearchOrchestrator } from '../../services/orchestrator';

const prisma = new PrismaClient();

interface GenerateRequestBody {
  companyName: string;
  geography: string;
  focusAreas?: string[];
  industry?: string;
  requestedBy?: string;
}

export async function generateResearch(req: Request, res: Response) {
  try {
    const body = req.body as GenerateRequestBody;

    // Validate required fields
    if (!body.companyName) {
      return res.status(400).json({
        error: 'Missing required field: companyName'
      });
    }

    // Default geography to 'Global' if not provided
    const geography = body.geography || 'Global';

    // For demo purposes, use a default user
    // In production, get this from auth middleware
    const userId = req.headers['x-user-id'] as string || 'demo-user';

    // Create orchestrator
    const orchestrator = new ResearchOrchestrator(prisma);

    // Create and start job
    const job = await orchestrator.createJob({
      companyName: body.companyName,
      geography,
      industry: body.industry,
      focusAreas: body.focusAreas,
      userId
    });

    return res.status(201).json({
      jobId: job.id,
      status: 'pending',
      message: 'Research job created. Generating all 10 sections.',
      companyName: job.companyName,
      geography: job.geography
    });

  } catch (error) {
    console.error('Error creating research job:', error);
    
    return res.status(500).json({
      error: 'Failed to create research job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
