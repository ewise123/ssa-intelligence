import { deriveJobStatus } from './status-utils.js';

type JobLike = {
  status: string;
  subJobs: Array<{ status: string }>;
};

export const filterJobsByDerivedStatus = <T extends JobLike>(
  jobs: T[],
  status?: string | null
): T[] => {
  if (!status) {
    return jobs;
  }

  return jobs.filter(
    (job) => deriveJobStatus({ status: job.status, subJobs: job.subJobs }) === status
  );
};
