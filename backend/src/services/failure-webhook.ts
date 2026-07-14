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

const WEBHOOK_TIMEOUT_MS = 5000;

/**
 * Deliver a failure event to the autofix agent. No-op unless both
 * AUTOFIX_WEBHOOK_URL and AUTOFIX_WEBHOOK_SECRET are set. Fire-and-forget:
 * catches and logs its own errors, never throws.
 */
export async function notifyFailureWebhook(bug: BugReport): Promise<void> {
  const url = process.env.AUTOFIX_WEBHOOK_URL;
  const secret = process.env.AUTOFIX_WEBHOOK_SECRET;
  if (!url || !secret) return;

  try {
    const source: FailureEventSource = {
      app: 'ssa-intelligence',
      env: process.env.NODE_ENV ?? 'development',
      repo: process.env.AUTOFIX_SOURCE_REPO ?? 'ewise123/ssa-intelligence',
      commit: process.env.GIT_COMMIT_SHA ?? 'unknown',
    };
    const event = buildFailureEvent(bug, source, randomUUID());
    const rawBody = JSON.stringify(event);
    const signature = signPayload(rawBody, secret);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-autofix-signature': signature },
        body: rawBody,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    console.error('[failure-webhook] Failed to deliver failure event:', err);
  }
}
