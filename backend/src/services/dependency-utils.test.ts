import assert from 'node:assert/strict';
import { collectBlockedStages } from './dependency-utils.js';

const deps = {
  foundation: [],
  financial_snapshot: ['foundation'],
  company_overview: ['foundation'],
  exec_summary: ['foundation', 'financial_snapshot', 'company_overview']
} as const;

const subJobs = [
  { stage: 'financial_snapshot', status: 'failed' },
  { stage: 'exec_summary', status: 'pending' }
];

const blocked = collectBlockedStages(['financial_snapshot'], subJobs, deps);
assert.deepEqual(blocked, ['exec_summary']);
console.log('dependency utils tests passed');
