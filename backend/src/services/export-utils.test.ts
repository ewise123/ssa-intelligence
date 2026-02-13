import { describe, it, expect } from 'vitest';
import { buildExportSections, buildResearchMarkdown, isExportReady } from './export-utils.js';

type Blueprint = { sections: { id: string; title: string; defaultSelected?: boolean }[] };

type SubJob = { stage: string; status: string; output?: unknown };

describe('export-utils', () => {
  const blueprint: Blueprint = {
    sections: [
      { id: 'exec_summary', title: 'Executive Summary', defaultSelected: true },
      { id: 'investment_strategy', title: 'Investment Strategy', defaultSelected: true },
      { id: 'financial_snapshot', title: 'Financial Snapshot', defaultSelected: false },
    ],
  };

  it('builds export sections from selected sections and completed sub-jobs', () => {
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

    expect(exportSections.map((section) => section.id)).toEqual(['exec_summary', 'financial_snapshot']);
    expect(exportSections[0]?.data).toEqual(job.execSummary);
    expect(exportSections[1]?.data).toEqual(job.financialSnapshot);
  });

  it('uses defaultSelected sections when no selection provided', () => {
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
    expect(defaultSections.map((section) => section.id)).toEqual(['exec_summary', 'investment_strategy']);
    expect(defaultSections[1]?.data).toEqual(subJobsNoSelection[1]?.output);
  });

  it('checks export readiness by status', () => {
    expect(isExportReady('completed')).toBe(true);
    expect(isExportReady('completed_with_errors')).toBe(true);
    expect(isExportReady('failed')).toBe(false);
  });

  describe('buildResearchMarkdown', () => {
    it('produces markdown with company name heading and section headers', () => {
      const md = buildResearchMarkdown({
        companyName: 'TestCo',
        exportSections: [
          {
            id: 'exec_summary',
            title: 'Executive Summary',
            status: 'completed',
            data: { bullet_points: [{ bullet: 'Key insight', sources: ['S1'] }] },
          },
          {
            id: 'financial_snapshot',
            title: 'Financial Snapshot',
            status: 'completed',
            data: { summary: 'Good financials' },
          },
        ],
      });

      expect(md).toContain('# TestCo');
      expect(md).toContain('## Executive Summary');
      expect(md).toContain('## Financial Snapshot');
      expect(md).toContain('Key insight');
      expect(md).toContain('Good financials');
      expect(md).not.toContain('Status:');
    });

    it('handles empty sections', () => {
      const md = buildResearchMarkdown({
        companyName: 'EmptyCo',
        exportSections: [],
      });

      expect(md).toContain('# EmptyCo');
    });

    it('shows placeholder for sections with no content', () => {
      const md = buildResearchMarkdown({
        companyName: 'NullCo',
        exportSections: [
          { id: 'exec_summary', title: 'Executive Summary', status: 'completed', data: null },
        ],
      });

      expect(md).toContain('_No content generated for this section._');
    });

    it('skips title block when skipTitleBlock is true', () => {
      const md = buildResearchMarkdown({
        companyName: 'SkipCo',
        geography: 'US',
        date: '2025-01-01',
        exportSections: [
          { id: 'exec_summary', title: 'Executive Summary', status: 'completed', data: { bullet_points: [{ bullet: 'A' }] } },
        ],
        skipTitleBlock: true,
      });

      expect(md).not.toContain('# SkipCo');
      expect(md).not.toContain('Geography');
      expect(md).not.toContain('---');
      expect(md).toContain('## Executive Summary');
    });
  });
});
