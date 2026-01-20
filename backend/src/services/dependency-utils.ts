type SubJobLike = {
  stage: string;
  status: string;
};

type DependencyMap = Record<string, readonly string[]>;

const BLOCKED_STATUSES = new Set(['pending', 'running']);

export const collectBlockedStages = (
  failedStages: string[],
  subJobs: SubJobLike[],
  dependencies: DependencyMap
): string[] => {
  const failed = new Set(failedStages);
  const blocked = new Set<string>();
  let updated = true;

  while (updated) {
    updated = false;

    for (const subJob of subJobs) {
      if (!BLOCKED_STATUSES.has(subJob.status)) {
        continue;
      }

      if (blocked.has(subJob.stage)) {
        continue;
      }

      const deps = dependencies[subJob.stage] ?? [];
      const isBlocked = deps.some((dep) => failed.has(dep) || blocked.has(dep));

      if (isBlocked) {
        blocked.add(subJob.stage);
        updated = true;
      }
    }
  }

  return Array.from(blocked);
};
