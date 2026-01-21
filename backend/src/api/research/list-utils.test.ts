import assert from 'node:assert/strict';
import { filterJobsByDerivedStatus } from './list-utils.js';

const jobs = [
  {
    id: 'job-1',
    status: 'completed',
    subJobs: [{ status: 'completed' }]
  },
  {
    id: 'job-2',
    status: 'completed',
    subJobs: [{ status: 'completed' }, { status: 'failed' }]
  },
  {
    id: 'job-3',
    status: 'queued',
    subJobs: [{ status: 'pending' }]
  }
];

assert.deepEqual(
  filterJobsByDerivedStatus(jobs, 'completed_with_errors').map((job) => job.id),
  ['job-2']
);

assert.deepEqual(
  filterJobsByDerivedStatus(jobs, 'queued').map((job) => job.id),
  ['job-3']
);

assert.equal(filterJobsByDerivedStatus(jobs).length, 3);

console.log('list utils tests passed');
