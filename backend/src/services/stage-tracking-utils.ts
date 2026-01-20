type SubJobLike = {
  stage: string;
  status: string;
};

export const buildCompletedStages = (
  subJobs: SubJobLike[],
  selectedSections?: string[] | null,
): string[] => {
  const completed: string[] = [];
  const seen = new Set<string>();

  for (const subJob of subJobs) {
    if (subJob.status !== 'completed' || subJob.stage === 'foundation') {
      continue;
    }
    if (!seen.has(subJob.stage)) {
      seen.add(subJob.stage);
      completed.push(subJob.stage);
    }
  }

  if (selectedSections && selectedSections.length) {
    return selectedSections.filter((section) => seen.has(section));
  }

  return completed;
};
