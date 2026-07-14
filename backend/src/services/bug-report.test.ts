import { describe, it, expect, vi } from 'vitest';
import {
  classifyErrorCategory,
  classifySeverity,
  computeFingerprint,
  sanitizeErrorContext,
  createBugReport,
} from './bug-report.js';

describe('bug-report service', () => {
  describe('classifyErrorCategory', () => {
    it('classifies rate limit errors', () => {
      expect(classifyErrorCategory('429 Too Many Requests')).toBe('rate_limit');
      expect(classifyErrorCategory('Rate limit exceeded')).toBe('rate_limit');
      expect(classifyErrorCategory('rate_limit_error')).toBe('rate_limit');
    });

    it('classifies server errors', () => {
      expect(classifyErrorCategory('500 Internal Server Error')).toBe('server_error');
      expect(classifyErrorCategory('503 Service Unavailable')).toBe('server_error');
      expect(classifyErrorCategory('502 Bad Gateway')).toBe('server_error');
    });

    it('classifies parse errors', () => {
      expect(classifyErrorCategory('JSON parse error')).toBe('parse_error');
      expect(classifyErrorCategory('Zod validation failed')).toBe('parse_error');
      expect(classifyErrorCategory('Validation error: missing field')).toBe('parse_error');
    });

    it('classifies content errors', () => {
      expect(classifyErrorCategory('Empty response')).toBe('content_error');
      expect(classifyErrorCategory('No content returned')).toBe('content_error');
      expect(classifyErrorCategory('Missing required field')).toBe('content_error');
    });

    it('classifies timeout errors', () => {
      expect(classifyErrorCategory('Request timeout')).toBe('timeout');
      expect(classifyErrorCategory('ETIMEDOUT')).toBe('timeout');
      expect(classifyErrorCategory('ECONNRESET')).toBe('timeout');
      expect(classifyErrorCategory('socket hang up')).toBe('timeout');
    });

    it('classifies unknown errors', () => {
      expect(classifyErrorCategory('Something went wrong')).toBe('unknown');
      expect(classifyErrorCategory('')).toBe('unknown');
    });
  });

  describe('classifySeverity', () => {
    it('returns critical for foundation stage', () => {
      expect(classifySeverity('foundation')).toBe('critical');
    });

    it('returns error for all other stages', () => {
      expect(classifySeverity('exec_summary')).toBe('error');
      expect(classifySeverity('financial_snapshot')).toBe('error');
      expect(classifySeverity('company_overview')).toBe('error');
      expect(classifySeverity('recent_news')).toBe('error');
    });
  });

  describe('computeFingerprint', () => {
    it('returns deterministic hash', () => {
      const fp1 = computeFingerprint('foundation', 'rate_limit', '429 Too Many Requests');
      const fp2 = computeFingerprint('foundation', 'rate_limit', '429 Too Many Requests');
      expect(fp1).toBe(fp2);
      expect(fp1).toHaveLength(16);
    });

    it('normalizes UUIDs in error messages', () => {
      const fp1 = computeFingerprint('foundation', 'unknown', 'Error for job abc12345-1234-1234-1234-123456789abc');
      const fp2 = computeFingerprint('foundation', 'unknown', 'Error for job def99999-9999-9999-9999-999999999def');
      expect(fp1).toBe(fp2);
    });

    it('normalizes timestamps in error messages', () => {
      const fp1 = computeFingerprint('foundation', 'timeout', 'Timeout at 2024-01-15T10:30:00Z');
      const fp2 = computeFingerprint('foundation', 'timeout', 'Timeout at 2025-06-20T23:59:59.123Z');
      expect(fp1).toBe(fp2);
    });

    it('normalizes numbers in error messages', () => {
      const fp1 = computeFingerprint('exec_summary', 'server_error', 'Request failed after 3000ms');
      const fp2 = computeFingerprint('exec_summary', 'server_error', 'Request failed after 5000ms');
      expect(fp1).toBe(fp2);
    });

    it('produces different fingerprints for different stages', () => {
      const fp1 = computeFingerprint('foundation', 'rate_limit', '429');
      const fp2 = computeFingerprint('exec_summary', 'rate_limit', '429');
      expect(fp1).not.toBe(fp2);
    });

    it('produces different fingerprints for different categories', () => {
      const fp1 = computeFingerprint('foundation', 'rate_limit', 'error');
      const fp2 = computeFingerprint('foundation', 'server_error', 'error');
      expect(fp1).not.toBe(fp2);
    });
  });

  describe('sanitizeErrorContext', () => {
    it('truncates raw content to 1000 chars', () => {
      const longContent = 'x'.repeat(2000);
      const ctx = sanitizeErrorContext(longContent, { dependencies: [] }, {});
      expect((ctx.rawContentSnippet as string).length).toBe(1000);
    });

    it('includes dependencies when present', () => {
      const ctx = sanitizeErrorContext(undefined, { dependencies: ['foundation'] }, {});
      expect(ctx.dependencies).toEqual(['foundation']);
    });

    it('includes selectedSections and focusAreas', () => {
      const ctx = sanitizeErrorContext(
        undefined,
        { dependencies: [] },
        { selectedSections: ['exec_summary'], focusAreas: ['AI strategy'] }
      );
      expect(ctx.selectedSections).toEqual(['exec_summary']);
      expect(ctx.focusAreas).toEqual(['AI strategy']);
    });

    it('excludes empty arrays', () => {
      const ctx = sanitizeErrorContext(undefined, { dependencies: [] }, { selectedSections: [], focusAreas: [] });
      expect(ctx).not.toHaveProperty('dependencies');
      expect(ctx).not.toHaveProperty('selectedSections');
      expect(ctx).not.toHaveProperty('focusAreas');
    });

    it('returns empty object when nothing to include', () => {
      const ctx = sanitizeErrorContext(undefined, { dependencies: [] }, {});
      expect(ctx).toEqual({});
    });
  });

  describe('createBugReport', () => {
    it('returns the created bug report record', async () => {
      const created = { id: 'bug_created', errorFingerprint: 'fp' };
      const prisma = { bugReport: { create: vi.fn().mockResolvedValue(created) } };
      const result = await createBugReport(prisma as any, {
        jobId: 'job_1',
        subJobId: 'sub_1',
        stage: 'financials',
        error: new Error('Zod validation failed'),
        subJob: { attempts: 3, maxAttempts: 3, dependencies: ['foundation'] },
        job: { companyName: 'Acme', reportType: 'INDUSTRIALS' },
      });
      expect(result).toBe(created);
      expect(prisma.bugReport.create).toHaveBeenCalledTimes(1);
    });
  });
});
