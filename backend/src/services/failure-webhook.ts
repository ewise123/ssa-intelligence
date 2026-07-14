/**
 * Failure Webhook Service
 * Emits a signed `research.stage.failed` event when a research stage permanently
 * fails, for consumption by the autofix agent. Env-gated and fire-and-forget safe —
 * must never break the research pipeline.
 */

import { createHmac, randomUUID } from 'crypto';
import type { BugReport } from '@prisma/client';

export interface FailureEventSource {
  app: string;
  env: string;
  repo: string;
  commit: string;
}

export interface FailureEvent {
  event: 'research.stage.failed';
  version: 1;
  deliveryId: string;
  bugReport: {
    id: string;
    fingerprint: string;
    severity: string;
    category: string;
    stage: string;
    reportType: string;
    errorMessage: string;
    errorStack: string | null;
    attempts: number;
    maxAttempts: number;
    context: unknown;
    createdAt: string;
  };
  source: FailureEventSource;
}

/**
 * Build the event payload from a BugReport. Deliberately excludes client
 * identifiers (companyName, geography, industry) so no client identity leaks.
 */
export function buildFailureEvent(
  bug: BugReport,
  source: FailureEventSource,
  deliveryId: string
): FailureEvent {
  return {
    event: 'research.stage.failed',
    version: 1,
    deliveryId,
    bugReport: {
      id: bug.id,
      fingerprint: bug.errorFingerprint,
      severity: bug.severity,
      category: bug.category,
      stage: bug.stage,
      reportType: bug.reportType,
      errorMessage: bug.errorMessage,
      errorStack: bug.errorStack,
      attempts: bug.attempts,
      maxAttempts: bug.maxAttempts,
      context: bug.errorContext,
      createdAt: bug.createdAt.toISOString(),
    },
    source,
  };
}

/** HMAC-SHA256 over the raw request body, formatted `sha256=<hex>`. */
export function signPayload(rawBody: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
}
