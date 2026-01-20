type SubJobLike = {
  stage: string;
  status: string;
};

type DependencyMap = Record<string, readonly string[]>;

export const computeRerunStages = (
  requestedStages: string[],
  subJobs: SubJobLike[],
  dependencies: DependencyMap
): string[] => {
  const requested = Array.from(
    new Set(requestedStages.map((stage) => stage.trim()).filter(Boolean))
  );

  if (!requested.length) {
    return [];
  }

  const statusByStage = new Map(subJobs.map((subJob) => [subJob.stage, subJob.status]));
  const rerun = new Set(requested);
  const queue = [...requested];

  while (queue.length) {
    const stage = queue.shift();
    if (!stage) {
      continue;
    }

    const deps = dependencies[stage] ?? [];
    for (const dep of deps) {
      const depStatus = statusByStage.get(dep);
      if (depStatus !== 'failed') {
        continue;
      }
      if (!rerun.has(dep)) {
        rerun.add(dep);
        queue.push(dep);
      }
    }
  }

  return Array.from(rerun);
};
