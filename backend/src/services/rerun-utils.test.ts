import assert from 'node:assert/strict';
import { computeRerunStages } from './rerun-utils.js';

const deps = {
  foundation: [],
  financial_snapshot: ['foundation'],
  company_overview: ['foundation'],
  exec_summary: ['foundation', 'financial_snapshot', 'company_overview']
} as const;

const subJobs = [
  { stage: 'financial_snapshot', status: 'failed' },
  { stage: 'company_overview', status: 'completed' },
  { stage: 'exec_summary', status: 'failed' }
];

const stages = computeRerunStages(['exec_summary'], subJobs, deps);
assert.deepEqual(stages.sort(), ['exec_summary', 'financial_snapshot'].sort());
console.log('rerun utils tests passed');
