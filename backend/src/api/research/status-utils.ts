type SubJobStatus = { status: string };

type StatusArgs = {
  status: string;
  subJobs: SubJobStatus[];
};

export const deriveJobStatus = ({ status, subJobs }: StatusArgs): string => {
  if (!subJobs.length) {
    return status;
  }

  const hasRunning = subJobs.some((subJob) => subJob.status === 'running');
  const hasPending = subJobs.some((subJob) => subJob.status === 'pending');
  const hasCompleted = subJobs.some((subJob) => subJob.status === 'completed');

  if (status === 'cancelled' || status === 'failed') {
    return status;
  }

  if (hasRunning) {
    return 'running';
  }

  if (hasPending && hasCompleted) {
    return 'running';
  }

  if (!hasPending && hasCompleted) {
    return 'completed';
  }

  if (status === 'queued' && hasPending && !hasCompleted) {
    return 'queued';
  }

  return status;
};
