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

// ============================================================================
// SCHEMA VALIDATION RECOVERY
// ============================================================================

/** Minimal shape of a Zod validation error we care about (avoids a zod import here). */
type ZodIssueLike = {
  code?: string;
  type?: string;
  maximum?: number;
  path?: Array<string | number>;
};
type ZodErrorLike = { issues?: ZodIssueLike[] };

/**
 * When Zod validation fails *only* because one or more LLM-generated arrays
 * exceeded their `.max()` caps (`too_big`), return a copy of the candidate with
 * those arrays truncated to their allowed maximum. Returns `null` when the
 * failure involves anything other than array-length overages, so genuine schema
 * problems still surface as errors.
 *
 * Rationale: without this, a trivial overage (e.g. the model returns 6 strategic
 * priorities when the schema caps at 5) hard-fails an entire section across all
 * retries — and cascades to any section that depends on it. Clamping enforces
 * the schema's own intended limit gracefully instead of catastrophically.
 */
export const clampArrayOverages = <T>(candidate: T, error: ZodErrorLike): T | null => {
  const issues = error?.issues ?? [];
  if (issues.length === 0) {
    return null;
  }

  const allArrayOverages = issues.every(
    (issue) =>
      issue.code === 'too_big' &&
      issue.type === 'array' &&
      typeof issue.maximum === 'number' &&
      Array.isArray(issue.path)
  );
  if (!allArrayOverages) {
    return null;
  }

  // Deep clone to preserve immutability of the caller's object.
  const repaired = JSON.parse(JSON.stringify(candidate));

  for (const issue of issues) {
    const path = issue.path as Array<string | number>;
    const max = issue.maximum as number;

    // Top-level array (empty path): the candidate itself is the over-long array.
    if (path.length === 0) {
      if (Array.isArray(repaired)) {
        return repaired.slice(0, max) as T;
      }
      return null;
    }

    const parent = path
      .slice(0, -1)
      .reduce<any>((acc, key) => (acc == null ? acc : acc[key]), repaired);
    const lastKey = path[path.length - 1];

    if (parent && Array.isArray(parent[lastKey])) {
      parent[lastKey] = parent[lastKey].slice(0, max);
    } else {
      // Shape did not match the reported path — bail out rather than guess.
      return null;
    }
  }

  return repaired as T;
};
