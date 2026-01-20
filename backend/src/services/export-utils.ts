import { STAGE_OUTPUT_FIELDS, type StageId } from './orchestrator.js';

type ExportJob = {
  reportType?: string | null;
  selectedSections?: string[] | null;
} & Record<string, unknown>;

type ExportSubJob = {
  stage: string;
  status: string;
  output?: unknown;
};

type BlueprintSection = {
  id: string;
  title: string;
  defaultSelected?: boolean;
};

type ExportBlueprint = {
  sections: BlueprintSection[];
};

type FallbackSection = {
  id: string;
  title: string;
  field?: string;
};

export type ExportSection = {
  id: string;
  title: string;
  status: string;
  data: unknown;
};

export const isExportReady = (status: string): boolean => {
  return status === 'completed' || status === 'completed_with_errors';
};

const resolveSelectedSections = (
  job: ExportJob,
  blueprint: ExportBlueprint | null,
): string[] => {
  const selected = Array.isArray(job.selectedSections)
    ? job.selectedSections.map((section) => section.trim()).filter(Boolean)
    : [];

  if (selected.length) {
    return selected;
  }

  if (blueprint?.sections?.length) {
    const defaults = blueprint.sections
      .filter((section) => section.defaultSelected)
      .map((section) => section.id);

    return defaults.length ? defaults : blueprint.sections.map((section) => section.id);
  }

  return [];
};

export const buildExportSections = (params: {
  job: ExportJob;
  subJobs: ExportSubJob[];
  blueprint: ExportBlueprint | null;
  fallbackOrder: FallbackSection[];
}): ExportSection[] => {
  const { job, subJobs, blueprint, fallbackOrder } = params;
  const selectedSections = resolveSelectedSections(job, blueprint);
  const selectedSet = selectedSections.length ? new Set(selectedSections) : null;

  const ordered = blueprint?.sections?.length
    ? blueprint.sections.map((section) => ({ id: section.id, title: section.title }))
    : fallbackOrder.map((section) => ({
        id: section.id,
        title: section.title,
        field: section.field,
      }));

  const subJobByStage = new Map(subJobs.map((subJob) => [subJob.stage, subJob]));
  const results: ExportSection[] = [];

  for (const section of ordered) {
    if (selectedSet && !selectedSet.has(section.id)) {
      continue;
    }

    const subJob = subJobByStage.get(section.id);
    if (!subJob || subJob.status !== 'completed') {
      continue;
    }

    const field =
      'field' in section && section.field
        ? section.field
        : STAGE_OUTPUT_FIELDS[section.id as StageId];

    const jobData = typeof field === 'string' ? (job as Record<string, unknown>)[field] : undefined;
    const data = jobData ?? subJob.output ?? null;

    results.push({
      id: section.id,
      title: section.title,
      status: subJob.status,
      data,
    });
  }

  return results;
};
