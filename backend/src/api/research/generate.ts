/**
 * POST /api/research/generate
 * Create a new research job
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getResearchOrchestrator } from '../../services/orchestrator.js';
import { ensureDomainForJob } from '../../services/domain-infer.js';

const prisma = new PrismaClient();

interface GenerateRequestBody {
  companyName: string;
  geography: string;
  focusAreas?: string[];
  industry?: string;
  requestedBy?: string;
  force?: boolean;
  domain?: string;
}

// Normalize and validate user-provided text inputs to avoid empty/garbage jobs
const normalizeInput = (value: string | undefined | null) => {
  if (!value) return '';
  // Trim, collapse whitespace, strip surrounding quotes
  const collapsed = value.trim().replace(/\s+/g, ' ');
  return collapsed.replace(/^"+|"+$/g, '');
};

const toTitleLike = (value: string) => {
  if (!value) return value;
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const hasMeaningfulChars = (value: string) => /[A-Za-z0-9]/.test(value);

const normalizeForKey = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
const normalizeDomain = (value: string | undefined | null) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
};

export async function generateResearch(req: Request, res: Response) {
  try {
    const body = req.body as GenerateRequestBody;

    // Validate required fields
    const normalizedCompany = normalizeInput(body.companyName);
    const normalizedGeo = normalizeInput(body.geography || 'Global');
    const normalizedIndustry = normalizeInput(body.industry || '');
    const normalizedDomain = normalizeDomain(body.domain);

    if (!normalizedCompany || normalizedCompany.length < 2 || !hasMeaningfulChars(normalizedCompany)) {
      return res.status(400).json({
        error: 'Missing or invalid companyName. Please provide a valid company name.'
      });
    }

    // Default geography to 'Global' if not provided
    const geography = normalizedGeo && hasMeaningfulChars(normalizedGeo) ? toTitleLike(normalizedGeo) : 'Global';
    const industry = normalizedIndustry && hasMeaningfulChars(normalizedIndustry) ? toTitleLike(normalizedIndustry) : undefined;
    const domain = normalizedDomain || undefined;
    const companyName = toTitleLike(normalizedCompany);
    const normalizedCompanyKey = normalizeForKey(normalizedCompany);
    const normalizedGeoKey = normalizeForKey(geography);
    const normalizedIndustryKey = industry ? normalizeForKey(industry) : null;
    const normalizedDomainKey = domain ? normalizeDomain(domain) : null;

    if (!req.auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.auth.userId;

    // Check for existing job with same normalized company+geo+industry and running/queued/completed
    const existing = await prisma.researchJob.findFirst({
      where: {
        userId,
        // normalize safeguard: fall back to raw match if columns not present yet
        OR: [
          {
            normalizedCompany: normalizedCompanyKey,
            normalizedGeography: normalizedGeoKey,
            normalizedIndustry: normalizedIndustryKey
          },
          {
            companyName: companyName,
            geography: geography,
            industry: industry || null
          }
        ],
        status: { in: ['queued', 'running', 'completed'] }
      },
      select: { id: true, status: true }
    });

    const force = Boolean(body.force);
    if (existing) {
      // Only allow force when existing is completed; block queued/running
      if (!force && existing.status !== 'completed') {
        return res.status(409).json({
          error: 'Research already exists for this company/geography/industry.',
          status: existing.status,
          jobId: existing.id
        });
      }
      if (force && existing.status !== 'completed') {
        return res.status(409).json({
          error: 'An active job exists for this company/geography/industry.',
          status: existing.status,
          jobId: existing.id
        });
      }
      if (!force && existing.status === 'completed') {
        return res.status(409).json({
          error: 'Research already exists for this company/geography/industry.',
          status: existing.status,
          jobId: existing.id
        });
      }
      // force + completed: allow
      console.log('[duplicate] Forcing new research for existing completed job', existing.id);
    }

    // Create orchestrator
    const orchestrator = getResearchOrchestrator(prisma);

    // Create and start job
    const job = await orchestrator.createJob({
      companyName,
      geography,
      industry,
      focusAreas: body.focusAreas,
      userId,
      normalizedCompany: normalizedCompanyKey,
      normalizedGeography: normalizedGeoKey,
      normalizedIndustry: normalizedIndustryKey,
      domain,
      normalizedDomain: normalizedDomainKey || null
    });

    const queuePosition = await orchestrator.getQueuePosition(job.id);

    if (!domain) {
      // Best-effort domain inference in the background
      ensureDomainForJob(prisma, job.id, companyName).catch((err) => console.error('Domain inference error:', err));
    }

    return res.status(201).json({
      jobId: job.id,
      status: 'queued',
      queuePosition,
      message: queuePosition > 1
        ? 'Another job is running; your analysis has been added to the queue.'
        : 'Research job created and will start shortly.',
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
