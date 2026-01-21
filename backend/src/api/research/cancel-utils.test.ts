import assert from 'node:assert/strict';
import { buildCancelResponse } from './cancel-utils.js';

assert.deepEqual(buildCancelResponse('job-123'), {
  success: true,
  jobId: 'job-123',
  status: 'cancelled'
});

console.log('cancel utils tests passed');
