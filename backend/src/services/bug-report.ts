/**
 * Automatic Bug Report Service
 * Creates structured bug reports when research job stages permanently fail.
 * Fire-and-forget safe — errors here must never break the pipeline.
 */

import { createHash } from 'crypto';
import type { PrismaClient, BugReport, BugReportSeverity, BugReportCategory, Prisma } from '@prisma/client';

interface CreateBugReportParams {
  jobId: string;
  subJobId?: string;
  stage: string;
  error: unknown;
  rawContent?: string;
  subJob: {
    attempts: number;
    maxAttempts: number;
    dependencies: string[];
  };
  job: {
    companyName: string;
    reportType: string;
    geography?: string | null;
    industry?: string | null;
    selectedSections?: string[];
    focusAreas?: string[];
  };
}

/**
 * Classify error category from the error message.
 */
export function classifyErrorCategory(message: string): BugReportCategory {
  const lower = message.toLowerCase();

  if (lower.includes('429') || lower.includes('rate limit') || lower.includes('rate_limit')) {
    return 'rate_limit';
  }
  if (lower.includes('500') || lower.includes('internal server error') || lower.includes('502') || lower.includes('503')) {
    return 'server_error';
  }
  if (lower.includes('json') || lower.includes('parse') || lower.includes('zod') || lower.includes('validation')) {
    return 'parse_error';
  }
  if (lower.includes('empty') || lower.includes('no content') || lower.includes('missing required')) {
    return 'content_error';
  }
  if (lower.includes('timeout') || lower.includes('etimedout') || lower.includes('econnreset') || lower.includes('socket hang up')) {
    return 'timeout';
  }

  return 'unknown';
}

/**
 * Classify severity based on the stage that failed.
 * Foundation failures are critical (block all downstream); others are errors.
 */
export function classifySeverity(stage: string): BugReportSeverity {
  return stage === 'foundation' ? 'critical' : 'error';
}

/**
 * Compute a deterministic fingerprint for deduplication.
 * Normalizes the error message by stripping UUIDs, timestamps, and numbers.
 */
export function computeFingerprint(stage: string, category: string, errorMessage: string): string {
  const normalized = errorMessage
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\s]*/g, '<TIMESTAMP>')
    .replace(/\d+/g, '<N>')
    .trim()
    .toLowerCase();

  return createHash('sha256')
    .update(`${stage}:${category}:${normalized}`)
    .digest('hex')
    .slice(0, 16);
}

/**
 * Sanitize error context to exclude sensitive data (prompts, API keys, user PII).
 * Truncates raw content snippet.
 */
export function sanitizeErrorContext(
  rawContent: string | undefined,
  subJob: { dependencies: string[] },
  job: { selectedSections?: string[]; focusAreas?: string[] }
): Record<string, unknown> {
  const ctx: Record<string, unknown> = {};

  if (rawContent) {
    ctx.rawContentSnippet = rawContent.slice(0, 1000);
  }
  if (subJob.dependencies?.length) {
    ctx.dependencies = subJob.dependencies;
  }
  if (job.selectedSections?.length) {
    ctx.selectedSections = job.selectedSections;
  }
  if (job.focusAreas?.length) {
    ctx.focusAreas = job.focusAreas;
  }

  return ctx;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

function extractErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}

/**
 * Create an automatic bug report for a permanent stage failure.
 * Safe to call fire-and-forget — catches and logs its own errors.
 */
export async function createBugReport(
  prisma: PrismaClient,
  params: CreateBugReportParams
): Promise<BugReport> {
  const errorMessage = extractErrorMessage(params.error);
  const errorStack = extractErrorStack(params.error);
  const category = classifyErrorCategory(errorMessage);
  const severity = classifySeverity(params.stage);
  const fingerprint = computeFingerprint(params.stage, category, errorMessage);
  const context = sanitizeErrorContext(params.rawContent, params.subJob, params.job);

  const title = `[${params.stage}] ${category} failure for ${params.job.companyName}`;
  const description = [
    `Stage "${params.stage}" permanently failed after ${params.subJob.attempts}/${params.subJob.maxAttempts} attempts.`,
    `Category: ${category}`,
    `Error: ${errorMessage.slice(0, 500)}`,
  ].join('\n');

  return await prisma.bugReport.create({
    data: {
      severity,
      category,
      title,
      description,
      errorMessage: errorMessage.slice(0, 5000),
      errorStack: errorStack?.slice(0, 10000),
      errorFingerprint: fingerprint,
      jobId: params.jobId,
      subJobId: params.subJobId,
      stage: params.stage,
      companyName: params.job.companyName,
      reportType: params.job.reportType,
      geography: params.job.geography ?? undefined,
      industry: params.job.industry ?? undefined,
      attempts: params.subJob.attempts,
      maxAttempts: params.subJob.maxAttempts,
      errorContext: context as Prisma.InputJsonValue,
    },
  });
}
