import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildFailureEvent, signPayload, notifyFailureWebhook, type FailureEventSource } from './failure-webhook.js';
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

describe('notifyFailureWebhook', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    vi.restoreAllMocks();
  });
  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('is a no-op when env is not configured', async () => {
    delete process.env.AUTOFIX_WEBHOOK_URL;
    delete process.env.AUTOFIX_WEBHOOK_SECRET;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
    await notifyFailureWebhook(fakeBug());
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('POSTs a signed event when configured', async () => {
    process.env.AUTOFIX_WEBHOOK_URL = 'https://agent.example/hook';
    process.env.AUTOFIX_WEBHOOK_SECRET = 'secret';
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 202 }));
    await notifyFailureWebhook(fakeBug());
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://agent.example/hook');
    expect(init?.method).toBe('POST');
    const headers = init?.headers as Record<string, string>;
    expect(headers['content-type']).toBe('application/json');
    expect(headers['x-autofix-signature']).toMatch(/^sha256=[0-9a-f]{64}$/);
    expect(JSON.parse(init?.body as string).event).toBe('research.stage.failed');
  });

  it('swallows fetch errors (never throws)', async () => {
    process.env.AUTOFIX_WEBHOOK_URL = 'https://agent.example/hook';
    process.env.AUTOFIX_WEBHOOK_SECRET = 'secret';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(notifyFailureWebhook(fakeBug())).resolves.toBeUndefined();
  });
});
