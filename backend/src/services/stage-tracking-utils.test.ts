import assert from 'node:assert/strict';
import { buildCompletedStages } from './stage-tracking-utils.js';

const subJobs = [
  { stage: 'foundation', status: 'completed' },
  { stage: 'exec_summary', status: 'completed' },
  { stage: 'investment_strategy', status: 'completed' },
  { stage: 'financial_snapshot', status: 'failed' },
];

assert.deepEqual(
  buildCompletedStages(subJobs, ['investment_strategy', 'exec_summary']),
  ['investment_strategy', 'exec_summary'],
);

assert.deepEqual(buildCompletedStages(subJobs), ['exec_summary', 'investment_strategy']);

console.log('stage tracking utils tests passed');
