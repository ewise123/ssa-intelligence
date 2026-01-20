import assert from 'node:assert/strict';
import {
  computeFinalStatus,
  computeOverallConfidence,
  computeTerminalProgress
} from '../services/orchestrator-utils.js';

const subJobs = [
  { status: 'completed' },
  { status: 'failed' },
  { status: 'cancelled' }
];

assert.equal(computeTerminalProgress(subJobs), 1);
assert.equal(computeFinalStatus('running', subJobs), 'completed_with_errors');

const confidenceWithFailure = computeOverallConfidence([
  { status: 'completed', confidence: 'HIGH' },
  { status: 'failed' }
]);
assert.equal(confidenceWithFailure.score, 0.6);
assert.equal(confidenceWithFailure.label, 'MEDIUM');

const confidenceFailedOnly = computeOverallConfidence([{ status: 'failed' }]);
assert.equal(confidenceFailedOnly.score, 0.3);
assert.equal(confidenceFailedOnly.label, 'LOW');

const confidenceEmpty = computeOverallConfidence([]);
assert.equal(confidenceEmpty.score, null);
assert.equal(confidenceEmpty.label, null);

console.log('orchestrator utils tests passed');
