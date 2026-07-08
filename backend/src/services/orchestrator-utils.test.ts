import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  clampArrayOverages,
  computeFinalStatus,
  computeOverallConfidence,
  computeTerminalProgress
} from '../services/orchestrator-utils.js';
import { companyOverviewOutputSchema } from '../../prompts/validation.js';

describe('orchestrator-utils', () => {
  const subJobs = [
    { status: 'completed' },
    { status: 'failed' },
    { status: 'cancelled' }
  ];

  it('computes terminal progress', () => {
    expect(computeTerminalProgress(subJobs)).toBe(1);
  });

  it('computes final status with mixed results', () => {
    expect(computeFinalStatus('running', subJobs)).toBe('completed_with_errors');
  });

  it('computes overall confidence with failure', () => {
    const result = computeOverallConfidence([
      { status: 'completed', confidence: 'HIGH' },
      { status: 'failed' }
    ]);
    expect(result.score).toBe(0.6);
    expect(result.label).toBe('MEDIUM');
  });

  it('computes overall confidence for failed only', () => {
    const result = computeOverallConfidence([{ status: 'failed' }]);
    expect(result.score).toBe(0.3);
    expect(result.label).toBe('LOW');
  });

  it('computes overall confidence for empty array', () => {
    const result = computeOverallConfidence([]);
    expect(result.score).toBe(null);
    expect(result.label).toBe(null);
  });

  it('returns failed when foundation sub-job fails', () => {
    const jobs = [
      { stage: 'foundation', status: 'failed' },
      { stage: 'exec_summary', status: 'completed' },
    ];
    expect(computeFinalStatus('running', jobs)).toBe('failed');
  });
});

describe('clampArrayOverages', () => {
  const priority = (n: number) => ({
    priority: `Priority ${n}`,
    description: `Description for priority ${n}.`,
    geography_relevance: 'Global relevance.',
    source: 'S1'
  });

  // Minimal object that satisfies companyOverviewOutputSchema, parameterized by
  // how many strategic priorities it carries.
  const companyOverview = (priorityCount: number) => ({
    confidence: { level: 'HIGH', reason: 'Well documented.' },
    business_description: {
      overview: 'A'.repeat(120),
      segments: [],
      geography_positioning: 'B'.repeat(60)
    },
    geographic_footprint: {
      summary: 'C'.repeat(60),
      facilities: [],
      regional_stats: 'Global footprint.'
    },
    strategic_priorities: {
      summary: 'D'.repeat(60),
      priorities: Array.from({ length: priorityCount }, (_, i) => priority(i + 1)),
      geography_specific_initiatives: []
    },
    key_leadership: {
      summary: 'Leadership summary text.',
      executives: [],
      regional_leader: null
    },
    sources_used: ['S1']
  });

  it('reproduces the Ares-style failure when strategic priorities exceed the cap', () => {
    const result = companyOverviewOutputSchema.safeParse(companyOverview(10));
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues[0];
      expect(issue.code).toBe('too_big');
      expect(issue.path).toEqual(['strategic_priorities', 'priorities']);
    }
  });

  it('accepts up to 8 strategic priorities (raised cap)', () => {
    expect(companyOverviewOutputSchema.safeParse(companyOverview(8)).success).toBe(true);
  });

  it('clamps over-long strategic priorities to the cap so the section validates', () => {
    const candidate = companyOverview(10);
    const first = companyOverviewOutputSchema.safeParse(candidate);
    expect(first.success).toBe(false);

    const clamped = clampArrayOverages(candidate, (first as any).error);
    expect(clamped).not.toBeNull();
    expect(clamped!.strategic_priorities.priorities).toHaveLength(8);

    // Re-validation now succeeds.
    const second = companyOverviewOutputSchema.safeParse(clamped);
    expect(second.success).toBe(true);
  });

  it('does not mutate the original candidate', () => {
    const candidate = companyOverview(10);
    const first = companyOverviewOutputSchema.safeParse(candidate);
    clampArrayOverages(candidate, (first as any).error);
    expect(candidate.strategic_priorities.priorities).toHaveLength(10);
  });

  it('clamps a top-level array (empty path)', () => {
    const schema = z.array(z.string()).max(2);
    const candidate = ['a', 'b', 'c', 'd'];
    const result = schema.safeParse(candidate);
    expect(result.success).toBe(false);
    const clamped = clampArrayOverages(candidate, (result as any).error);
    expect(clamped).toEqual(['a', 'b']);
  });

  it('clamps multiple over-long arrays in one pass', () => {
    const schema = z.object({
      a: z.array(z.number()).max(1),
      b: z.array(z.number()).max(2)
    });
    const candidate = { a: [1, 2, 3], b: [1, 2, 3, 4] };
    const result = schema.safeParse(candidate);
    expect(result.success).toBe(false);
    const clamped = clampArrayOverages(candidate, (result as any).error);
    expect(clamped).toEqual({ a: [1], b: [1, 2] });
  });

  it('returns null when the failure is not solely array overages', () => {
    const schema = z.object({
      items: z.array(z.number()).max(1),
      name: z.string()
    });
    const candidate = { items: [1, 2] }; // also missing required `name`
    const result = schema.safeParse(candidate);
    expect(result.success).toBe(false);
    expect(clampArrayOverages(candidate, (result as any).error)).toBeNull();
  });

  it('returns null when there are no issues', () => {
    expect(clampArrayOverages({ x: 1 }, { issues: [] })).toBeNull();
  });

  it('clamps a deeply nested path (a.b.c)', () => {
    const schema = z.object({
      a: z.object({ b: z.object({ c: z.array(z.number()).max(1) }) })
    });
    const candidate = { a: { b: { c: [1, 2, 3] } } };
    const result = schema.safeParse(candidate);
    expect(result.success).toBe(false);
    expect(clampArrayOverages(candidate, (result as any).error)).toEqual({
      a: { b: { c: [1] } }
    });
  });

  it('clamps a path that contains an array index', () => {
    const schema = z.object({
      items: z.array(z.object({ subitems: z.array(z.number()).max(2) }))
    });
    const candidate = { items: [{ subitems: [1, 2, 3, 4] }] };
    const result = schema.safeParse(candidate);
    expect(result.success).toBe(false);
    // Path is ['items', 0, 'subitems'] — exercises numeric-index traversal.
    expect(clampArrayOverages(candidate, (result as any).error)).toEqual({
      items: [{ subitems: [1, 2] }]
    });
  });

  it('returns null when the candidate shape does not match the issue path', () => {
    // Reported path points at a field that is not an array in the candidate.
    const candidate = { foo: 'not-an-array' };
    const error = {
      issues: [{ code: 'too_big', type: 'array', maximum: 2, path: ['foo'] }]
    };
    expect(clampArrayOverages(candidate, error)).toBeNull();
  });
});
