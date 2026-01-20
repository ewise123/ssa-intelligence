type SubJobLike = {
  status: string;
  stage?: string | null;
};

type ConfidenceSubJob = {
  status: string;
  confidence?: string | null;
};

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled']);

export const computeTerminalProgress = (subJobs: SubJobLike[]): number => {
  if (!subJobs.length) {
    return 0;
  }

  const terminalCount = subJobs.filter((subJob) =>
    TERMINAL_STATUSES.has(subJob.status)
  ).length;

  return terminalCount / subJobs.length;
};

export const computeFinalStatus = (jobStatus: string, subJobs: SubJobLike[]): string => {
  if (jobStatus === 'cancelled' || jobStatus === 'failed') {
    return jobStatus;
  }

  if (subJobs.some((subJob) => subJob.stage === 'foundation' && subJob.status === 'failed')) {
    return 'failed';
  }

  const allTerminal = subJobs.every((subJob) =>
    TERMINAL_STATUSES.has(subJob.status)
  );

  if (!allTerminal) {
    return jobStatus;
  }

  if (subJobs.some((subJob) => subJob.status === 'failed')) {
    return 'completed_with_errors';
  }

  if (subJobs.some((subJob) => subJob.status === 'cancelled')) {
    return 'cancelled';
  }

  return 'completed';
};

const confidenceToScore = (confidence?: string | null): number | null => {
  if (!confidence) return null;
  const upper = confidence.toUpperCase();
  if (upper === 'HIGH') return 0.9;
  if (upper === 'MEDIUM') return 0.6;
  if (upper === 'LOW') return 0.3;
  return null;
};

const scoreToLabel = (score: number): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (score >= 0.75) return 'HIGH';
  if (score >= 0.5) return 'MEDIUM';
  return 'LOW';
};

export const computeOverallConfidence = (
  subJobs: ConfidenceSubJob[]
): { score: number | null; label: 'HIGH' | 'MEDIUM' | 'LOW' | null } => {
  if (!subJobs.length) {
    return { score: null, label: null };
  }

  const scores = subJobs
    .map((subJob) => {
      if (subJob.status === 'failed') {
        return 0.3;
      }
      return confidenceToScore(subJob.confidence);
    })
    .filter((score): score is number => score !== null && !Number.isNaN(score));

  if (!scores.length) {
    return { score: null, label: null };
  }

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { score: avg, label: scoreToLabel(avg) };
};
