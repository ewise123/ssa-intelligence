import { describe, it, expect } from 'vitest';
import { Paragraph, Table, TextRun } from 'docx';
import {
  parseMarkdownBold,
  renderExecSummary,
  renderFinancialSnapshot,
  renderCompanyOverview,
  renderInvestmentStrategy,
  renderPortfolioSnapshot,
  renderDealActivity,
  renderDealTeam,
  renderPortfolioMaturity,
  renderLeadershipAndGovernance,
  renderStrategicPriorities,
  renderOperatingCapabilities,
  renderDistributionAnalysis,
  renderSegmentAnalysis,
  renderTrends,
  renderPeerBenchmarking,
  renderSkuOpportunities,
  renderRecentNews,
  renderConversationStarters,
  renderAppendix,
  renderSection,
} from './docx-section-renderers.js';

const isParagraphOrTable = (el: unknown) =>
  el instanceof Paragraph || el instanceof Table;

describe('docx-section-renderers', () => {
  describe('renderExecSummary', () => {
    it('renders bullet points', () => {
      const result = renderExecSummary({
        bullet_points: [
          { bullet: 'Insight A', sources: ['S1', 'S2'] },
          { bullet: 'Insight B' },
        ],
      });
      expect(result.length).toBeGreaterThan(0);
      result.forEach((el) => expect(isParagraphOrTable(el)).toBe(true));
    });

    it('returns empty array for null data', () => {
      expect(renderExecSummary(null)).toEqual([]);
      expect(renderExecSummary(undefined)).toEqual([]);
    });
  });

  describe('renderFinancialSnapshot', () => {
    it('renders KPI table with correct structure', () => {
      const result = renderFinancialSnapshot({
        summary: 'Financial overview',
        kpi_table: {
          metrics: [
            { metric: 'Revenue', company: '$100M', industry_avg: '$80M', source: 'S1' },
            { metric: 'Margin', company: '25%', industry_avg: '20%', source: 'S2' },
          ],
        },
      });
      expect(result.length).toBeGreaterThan(0);
      const tables = result.filter((el) => el instanceof Table);
      expect(tables.length).toBe(1);
    });

    it('renders derived metrics table', () => {
      const result = renderFinancialSnapshot({
        derived_metrics: [
          { metric: 'EV/EBITDA', formula: 'EV/EBITDA', calculation: '10x', source: 'S1' },
        ],
      });
      const tables = result.filter((el) => el instanceof Table);
      expect(tables.length).toBe(1);
    });
  });

  describe('renderCompanyOverview', () => {
    it('renders overview with segments and leadership', () => {
      const result = renderCompanyOverview({
        business_description: {
          overview: 'A large company',
          segments: [{ name: 'Seg1', description: 'Desc', revenue_pct: '40%', geography_relevance: 'US' }],
        },
        key_leadership: {
          executives: [{ name: 'John', title: 'CEO', tenure: '5 years', source: 'S1' }],
          regional_leaders: [{ name: 'Jane', title: 'VP APAC', source: 'S2' }],
        },
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderInvestmentStrategy', () => {
    it('renders strategy with focus areas', () => {
      const result = renderInvestmentStrategy({
        strategy_summary: 'Growth-focused',
        focus_areas: ['Healthcare', 'Technology'],
        sector_focus: ['SaaS'],
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderPortfolioSnapshot', () => {
    it('renders portfolio companies table', () => {
      const result = renderPortfolioSnapshot({
        summary: 'Portfolio overview',
        portfolio_companies: [
          { name: 'Co1', sector: 'Tech', platform_or_addon: 'Platform', geography: 'US' },
        ],
      });
      const tables = result.filter((el) => el instanceof Table);
      expect(tables.length).toBe(1);
    });
  });

  describe('renderDealActivity', () => {
    it('renders deals table', () => {
      const result = renderDealActivity({
        summary: 'Active deal flow',
        deals: [{ company: 'Target Co', date: '2024-01', deal_type: 'Acquisition', rationale: 'Growth' }],
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderDealTeam', () => {
    it('renders stakeholders and notes', () => {
      const result = renderDealTeam({
        stakeholders: [{ name: 'Partner A', title: 'MD', role: 'Lead', focus_area: 'Tech' }],
        notes: 'Additional context',
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderPortfolioMaturity', () => {
    it('renders holdings table', () => {
      const result = renderPortfolioMaturity({
        summary: 'Mature portfolio',
        holdings: [{ company: 'Co1', acquisition_period: '2020', holding_period_years: 4, exit_signal: 'Low' }],
      });
      const tables = result.filter((el) => el instanceof Table);
      expect(tables.length).toBe(1);
    });
  });

  describe('renderLeadershipAndGovernance', () => {
    it('renders leadership table', () => {
      const result = renderLeadershipAndGovernance({
        leadership: [{ name: 'CEO', title: 'Chief Executive', focus_area: 'Strategy' }],
        governance_notes: 'Board structure details',
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderStrategicPriorities', () => {
    it('renders priorities and themes', () => {
      const result = renderStrategicPriorities({
        priorities: [{ priority: 'Digital', description: 'Transform ops', source: 'S1' }],
        transformation_themes: ['AI adoption', 'Cloud migration'],
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderOperatingCapabilities', () => {
    it('renders capabilities and gaps', () => {
      const result = renderOperatingCapabilities({
        capabilities: [{ capability: 'Supply Chain', description: 'Optimized', maturity: 'High' }],
        gaps: ['Automation', 'Analytics'],
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderDistributionAnalysis', () => {
    it('renders channels and costs', () => {
      const result = renderDistributionAnalysis({
        summary: 'Multi-channel',
        channels: [{ channel_type: 'Direct', description: 'Direct sales', premium_share_pct: 60 }],
        distribution_costs: { acquisition_cost_ratio: 15 },
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderSegmentAnalysis', () => {
    it('renders segments with financial tables', () => {
      const result = renderSegmentAnalysis({
        overview: 'Segment overview',
        segments: [
          {
            name: 'Commercial',
            financial_snapshot: {
              table: [{ metric: 'Revenue', segment: '$50M', company_avg: '$40M', industry_avg: '$35M' }],
            },
            performance_analysis: { paragraphs: ['Strong growth'] },
          },
        ],
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderTrends', () => {
    it('renders macro, micro, and company trends', () => {
      const result = renderTrends({
        macro_trends: {
          trends: [{ trend: 'AI', description: 'Growing', direction: 'Up', impact_score: 8 }],
        },
        micro_trends: {
          trends: [{ trend: 'ESG', description: 'Emerging', direction: 'Up', impact_score: 6 }],
        },
      });
      const tables = result.filter((el) => el instanceof Table);
      expect(tables.length).toBe(2);
    });
  });

  describe('renderPeerBenchmarking', () => {
    it('handles multiple peers', () => {
      const result = renderPeerBenchmarking({
        peer_comparison_table: {
          peers: [
            { name: 'Peer1', ticker: 'P1', geography_presence: 'US' },
            { name: 'Peer2', ticker: 'P2', geography_presence: 'EU' },
            { name: 'Peer3', ticker: 'P3', geography_presence: 'APAC' },
            { name: 'Peer4', ticker: 'P4', geography_presence: 'Global' },
          ],
          metrics: [
            { metric: 'Revenue', company: '$100M', peer1: '$90M', peer2: '$80M', peer3: '$70M', peer4: '$60M', industry_avg: '$75M', source: 'S1' },
          ],
        },
        benchmark_summary: {
          key_strengths: [{ strength: 'Growth', description: 'Above average' }],
          key_gaps: [{ gap: 'Margin', magnitude: 'Moderate', description: 'Below peers' }],
        },
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderSkuOpportunities', () => {
    it('renders opportunities table', () => {
      const result = renderSkuOpportunities({
        opportunities: [
          {
            issue_area: 'Operations',
            public_problem: 'Inefficiency',
            source: 'S1',
            aligned_sku: 'OpEx',
            priority: 'High',
            severity: 'Critical',
            geography_relevance: 'US',
            potential_value_levers: ['Cost reduction', 'Speed'],
          },
        ],
      });
      const tables = result.filter((el) => el instanceof Table);
      expect(tables.length).toBe(1);
    });
  });

  describe('renderRecentNews', () => {
    it('renders news table', () => {
      const result = renderRecentNews({
        news_items: [
          { date: '2025-01-10', headline: 'Acquisition', source: 'Reuters', implication: 'Growth', geography_relevance: 'US', category: 'M&A' },
        ],
      });
      expect(result.length).toBe(1);
    });
  });

  describe('renderConversationStarters', () => {
    it('renders starters table', () => {
      const result = renderConversationStarters({
        conversation_starters: [
          { title: 'Growth', question: 'How are you growing?', business_value: 'Revenue', ssa_capability: 'Strategy', sources: ['S1'] },
        ],
      });
      expect(result.length).toBe(1);
    });
  });

  describe('renderAppendix', () => {
    it('renders source references and FX rates', () => {
      const result = renderAppendix({
        source_references: [{ id: '1', citation: 'Cite1', type: 'Annual Report', date: '2024' }],
        fx_rates_and_industry: {
          fx_rates: [{ currency_pair: 'USD/EUR', rate: 0.92, source: 'ECB', source_description: 'Central bank' }],
          industry_averages: { source: 'S&P', dataset: 'Global', description: 'Industry data' },
        },
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('parseMarkdownBold', () => {
    it('parses **bold** markers into separate TextRuns', () => {
      const runs = parseMarkdownBold('Hello **world** today');
      expect(runs.length).toBe(3);
      // Check types
      runs.forEach((r) => expect(r).toBeInstanceOf(TextRun));
    });

    it('handles text with no bold markers', () => {
      const runs = parseMarkdownBold('Plain text only');
      expect(runs.length).toBe(1);
    });

    it('handles multiple bold segments', () => {
      const runs = parseMarkdownBold('**A** and **B** end');
      // **A** = bold, " and " = normal, **B** = bold, " end" = normal → 4 runs
      expect(runs.length).toBe(4);
    });

    it('handles text starting with bold', () => {
      const runs = parseMarkdownBold('**Start** of text');
      expect(runs.length).toBe(2);
    });

    it('handles text ending with bold', () => {
      const runs = parseMarkdownBold('End is **bold**');
      expect(runs.length).toBe(2);
    });
  });

  describe('renderSection (dispatch)', () => {
    it('dispatches to correct renderer', () => {
      const result = renderSection('exec_summary', {
        bullet_points: [{ bullet: 'Test' }],
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown section', () => {
      expect(renderSection('nonexistent', {})).toEqual([]);
    });

    it('returns empty array for null data', () => {
      expect(renderSection('exec_summary', null)).toEqual([]);
    });
  });
});
