import assert from 'node:assert/strict';
import { buildExportSections, isExportReady } from './export-utils.js';

type Blueprint = { sections: { id: string; title: string; defaultSelected?: boolean }[] };

type SubJob = { stage: string; status: string; output?: unknown };

const blueprint: Blueprint = {
  sections: [
    { id: 'exec_summary', title: 'Executive Summary', defaultSelected: true },
    { id: 'investment_strategy', title: 'Investment Strategy', defaultSelected: true },
    { id: 'financial_snapshot', title: 'Financial Snapshot', defaultSelected: false },
  ],
};

const job = {
  reportType: 'PE',
  selectedSections: ['exec_summary', 'investment_strategy', 'financial_snapshot'],
  execSummary: { bullet_points: [{ bullet: 'A' }] },
  financialSnapshot: { summary: 'FS job' },
};

const subJobs: SubJob[] = [
  { stage: 'exec_summary', status: 'completed', output: { bullet_points: [{ bullet: 'A' }] } },
  { stage: 'investment_strategy', status: 'failed', output: { strategy_summary: 'skip' } },
  { stage: 'financial_snapshot', status: 'completed', output: { summary: 'FS sub' } },
];

const exportSections = buildExportSections({
  job,
  subJobs,
  blueprint,
  fallbackOrder: [],
});

assert.deepEqual(
  exportSections.map((section) => section.id),
  ['exec_summary', 'financial_snapshot'],
);
assert.deepEqual(exportSections[0]?.data, job.execSummary);
assert.deepEqual(exportSections[1]?.data, job.financialSnapshot);

const jobNoSelection = {
  reportType: 'PE',
  selectedSections: [] as string[],
  execSummary: { bullet_points: [{ bullet: 'B' }] },
};
const subJobsNoSelection: SubJob[] = [
  { stage: 'exec_summary', status: 'completed', output: { bullet_points: [{ bullet: 'B' }] } },
  { stage: 'investment_strategy', status: 'completed', output: { strategy_summary: 'Focus' } },
];

const defaultSections = buildExportSections({
  job: jobNoSelection,
  subJobs: subJobsNoSelection,
  blueprint,
  fallbackOrder: [],
});
assert.deepEqual(
  defaultSections.map((section) => section.id),
  ['exec_summary', 'investment_strategy'],
);
assert.deepEqual(defaultSections[1]?.data, subJobsNoSelection[1]?.output);

assert.equal(isExportReady('completed'), true);
assert.equal(isExportReady('completed_with_errors'), true);
assert.equal(isExportReady('failed'), false);

console.log('export utils tests passed');
