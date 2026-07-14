import { describe, it, expect } from 'vitest';
import { buildFailureEvent, signPayload, type FailureEventSource } from './failure-webhook.js';
import type { BugReport } from '@prisma/client';

const SOURCE: FailureEventSource = {
  app: 'ssa-intelligence',
  env: 'test',
  repo: 'ewise123/ssa-intelligence',
  commit: 'abc123',
};

function fakeBug(overrides: Partial<BugReport> = {}): BugReport {
  return {
    id: 'bug_1',
    severity: 'error',
    status: 'open',
    category: 'parse_error',
    title: '[financials] parse_error failure for Acme',
    description: 'desc',
    errorMessage: 'Zod validation failed',
    errorStack: 'Error: Zod validation failed\n at x',
    errorFingerprint: 'fp123',
    jobId: 'job_1',
    subJobId: 'sub_1',
    stage: 'financials',
    companyName: 'Acme',
    reportType: 'INDUSTRIALS',
    geography: 'US',
    industry: 'Steel',
    attempts: 3,
    maxAttempts: 3,
    errorContext: { dependencies: ['foundation'] },
    resolutionNotes: null,
    resolvedAt: null,
    resolvedBy: null,
    createdAt: new Date('2026-07-14T00:00:00.000Z'),
    updatedAt: new Date('2026-07-14T00:00:00.000Z'),
    ...overrides,
  } as BugReport;
}

describe('failure-webhook', () => {
  describe('buildFailureEvent', () => {
    it('maps code-relevant fields into the event', () => {
      const event = buildFailureEvent(fakeBug(), SOURCE, 'delivery-1');
      expect(event.event).toBe('research.stage.failed');
      expect(event.version).toBe(1);
      expect(event.deliveryId).toBe('delivery-1');
      expect(event.bugReport.id).toBe('bug_1');
      expect(event.bugReport.fingerprint).toBe('fp123');
      expect(event.bugReport.category).toBe('parse_error');
      expect(event.bugReport.stage).toBe('financials');
      expect(event.bugReport.reportType).toBe('INDUSTRIALS');
      expect(event.bugReport.context).toEqual({ dependencies: ['foundation'] });
      expect(event.source).toEqual(SOURCE);
    });

    it('omits client identifiers (companyName, geography, industry)', () => {
      const serialized = JSON.stringify(buildFailureEvent(fakeBug(), SOURCE, 'd'));
      expect(serialized).not.toContain('Acme');
      expect(serialized).not.toContain('Steel');
      expect(serialized.includes('"US"')).toBe(false);
    });
  });

  describe('signPayload', () => {
    it('produces a stable sha256= HMAC over the raw body', () => {
      // Precomputed: HMAC-SHA256 of '{"a":1}' with key 'secret'
      const sig = signPayload('{"a":1}', 'secret');
      expect(sig).toBe('sha256=aa9e2e3575f5d7098b6caccd790888c36d5fdb63342a73bada2d6a51747a8494');
      expect(sig).toHaveLength(71); // 'sha256=' (7) + 64 hex chars
    });

    it('changes when the secret changes', () => {
      expect(signPayload('{"a":1}', 'k1')).not.toBe(signPayload('{"a":1}', 'k2'));
    });
  });
});
