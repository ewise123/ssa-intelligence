import assert from 'node:assert/strict';
import { deriveJobStatus } from './status-utils.js';

type SubJob = { status: string };

const base = { status: 'running', subJobs: [] as SubJob[] };

// Completed with errors when all terminal and at least one failed.
assert.equal(
  deriveJobStatus({
    ...base,
    status: 'completed',
    subJobs: [{ status: 'completed' }, { status: 'failed' }]
  }),
  'completed_with_errors'
);

// Completed with errors passthrough when a failed subjob exists.
assert.equal(
  deriveJobStatus({
    ...base,
    status: 'completed',
    subJobs: [{ status: 'failed' }]
  }),
  'completed_with_errors'
);

// Completed when all terminal and none failed.
assert.equal(
  deriveJobStatus({
    ...base,
    status: 'completed',
    subJobs: [{ status: 'completed' }, { status: 'completed' }]
  }),
  'completed'
);

// Failed stays failed.
assert.equal(
  deriveJobStatus({
    ...base,
    status: 'failed',
    subJobs: [{ status: 'failed' }]
  }),
  'failed'
);

console.log('status-utils tests passed');
