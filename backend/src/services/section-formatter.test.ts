import { describe, it, expect } from 'vitest';
import { formatSectionContent, insufficientDataNotice } from './section-formatter.js';

describe('section-formatter', () => {
  it('formats investment strategy section', () => {
    const investment = formatSectionContent('investment_strategy', {
      strategy_summary: 'Strategy summary',
      focus_areas: ['Focus A'],
    });
    expect(investment).toContain('Strategy summary');
    expect(investment).toContain('**Focus Areas**');
  });

  it('formats portfolio snapshot section with table', () => {
    const portfolio = formatSectionContent('portfolio_snapshot', {
      summary: 'Portfolio summary',
      portfolio_companies: [
        {
          name: 'Alpha',
          sector: 'Tech',
          platform_or_addon: 'Platform',
          geography: 'NA',
          notes: 'Note',
          source: 'S1',
        },
      ],
    });
    expect(portfolio).toContain('**Portfolio Companies**');
    expect(portfolio).toContain('| Name | Sector | Type | Geography | Notes | Source |');
  });
});

describe('insufficientDataNotice', () => {
  it('renders notice without reason', () => {
    const result = insufficientDataNotice();
    expect(result).toContain('> **Limited public information available**');
    // Only one line when no reason
    expect(result.split('\n').length).toBe(1);
  });

  it('renders notice with reason', () => {
    const result = insufficientDataNotice('Private company with no public data');
    expect(result).toContain('> **Limited public information available**');
    expect(result).toContain('> Private company with no public data');
  });
});

describe('insufficient-data placeholder rendering', () => {
  const lowConfidence = { level: 'LOW', reason: 'Private company with limited public information' };

  it('company_overview with empty executives renders notice', () => {
    const result = formatSectionContent('company_overview', {
      confidence: lowConfidence,
      business_description: {
        overview: 'A private dental company.',
        segments: [{ name: 'Core', description: 'Core', revenue_pct: null, geography_relevance: 'US' }],
        geography_positioning: 'US-focused operations'
      },
      key_leadership: {
        summary: 'No public leadership data',
        executives: [],
        regional_leader: null
      }
    });
    expect(result).toContain('**Key Leadership**');
    expect(result).toContain('> **Limited public information available**');
    expect(result).toContain('No public leadership data');
  });

  it('key_execs_and_board with all-empty arrays renders notice ONLY', () => {
    const result = formatSectionContent('key_execs_and_board', {
      confidence: lowConfidence,
      board_of_directors: { summary: 'Not publicly disclosed', members: [] },
      c_suite: { summary: 'Not publicly disclosed', executives: [] },
      business_unit_leaders: { summary: 'None identified', leaders: [] },
      recent_leadership_changes: [],
      sources_used: ['S1']
    });
    expect(result).toContain('> **Limited public information available**');
    expect(result).toContain('Private company with limited public information');
    // Should NOT render summaries — notice is exclusive
    expect(result).not.toContain('Not publicly disclosed');
  });

  it('key_execs_and_board with some data renders normally (no notice)', () => {
    const result = formatSectionContent('key_execs_and_board', {
      confidence: { level: 'HIGH', reason: 'Good data' },
      board_of_directors: { summary: 'Strong board', members: [] },
      c_suite: {
        summary: 'Experienced leadership',
        executives: [{
          name: 'Jane Smith',
          title: 'CEO',
          role_description: 'Chief Executive Officer',
          background: 'Over 20 years of experience in the industry',
          tenure: '5 years',
          performance_actions: ['Revenue growth'],
          source: 'S1'
        }]
      },
      business_unit_leaders: { summary: 'None', leaders: [] },
      recent_leadership_changes: []
    });
    expect(result).not.toContain('> **Limited public information available**');
    expect(result).toContain('Jane Smith');
  });

  it('key_execs_and_board with placeholder names renders notice (not table)', () => {
    const result = formatSectionContent('key_execs_and_board', {
      confidence: lowConfidence,
      board_of_directors: { summary: 'Not publicly disclosed', members: [] },
      c_suite: {
        summary: 'Not publicly disclosed',
        executives: [
          { name: 'Information Not Available', title: 'CEO', role_description: '–', background: 'Not publicly disclosed.', tenure: 'Not disclosed', performance_actions: [], source: 'S1' },
          { name: 'Information Not Available', title: 'CFO', role_description: '–', background: 'Not publicly disclosed.', tenure: 'Not disclosed', performance_actions: [], source: 'S1' },
        ]
      },
      business_unit_leaders: { summary: 'None identified', leaders: [] },
      recent_leadership_changes: [],
      sources_used: ['S1']
    });
    // Placeholder names should be filtered out, triggering the notice
    expect(result).toContain('> **Limited public information available**');
    expect(result).not.toContain('Information Not Available');
  });

  it('recent_news with empty news_items renders notice', () => {
    const result = formatSectionContent('recent_news', {
      confidence: lowConfidence,
      news_items: [],
      sources_used: ['S1']
    });
    expect(result).toContain('> **Limited public information available**');
    expect(result).toContain('Private company with limited public information');
  });

  it('leadership_and_governance with empty leadership renders notice', () => {
    const result = formatSectionContent('leadership_and_governance', {
      confidence: lowConfidence,
      leadership: [],
      governance_notes: 'Governance not disclosed.'
    });
    expect(result).toContain('> **Limited public information available**');
    expect(result).toContain('Governance not disclosed.');
  });

  it('deal_team with empty stakeholders renders notice', () => {
    const result = formatSectionContent('deal_team', {
      confidence: lowConfidence,
      stakeholders: [],
      notes: 'No stakeholders identified.'
    });
    expect(result).toContain('> **Limited public information available**');
    expect(result).toContain('No stakeholders identified.');
  });

  it('sku_opportunities with empty opportunities renders notice', () => {
    const result = formatSectionContent('sku_opportunities', {
      confidence: lowConfidence,
      opportunities: [],
      sources_used: ['S1']
    });
    expect(result).toContain('> **Limited public information available**');
    expect(result).toContain('Private company with limited public information');
  });
});

describe('peer_benchmarking metric filtering', () => {
  it('filters out metric rows where all values are null', () => {
    const result = formatSectionContent('peer_benchmarking', {
      confidence: { level: 'MEDIUM', reason: 'Limited data' },
      peer_comparison_table: {
        company_name: 'Acme Corp',
        peers: [
          { name: 'Peer A', ticker: 'PA', geography_presence: 'US operations across 20 states' },
          { name: 'Peer B', ticker: 'PB', geography_presence: 'Global operations in 15 countries' },
        ],
        metrics: [
          { metric: 'Revenue', company: '$100M', peer1: '$200M', peer2: '$150M', peer3: null, industry_avg: '$175M', source: 'S1' },
          { metric: 'EBITDA', company: null, peer1: null, peer2: null, peer3: null, industry_avg: null, source: 'S2' },
          { metric: 'Employees', company: '500', peer1: '1000', peer2: null, peer3: null, industry_avg: '750', source: 'S3' },
        ]
      },
      benchmark_summary: { key_strengths: [], key_gaps: [], overall_assessment: 'Limited', competitive_positioning: 'Unknown' },
      sources_used: ['S1', 'S2', 'S3']
    });
    expect(result).toContain('Revenue');
    expect(result).toContain('Employees');
    // EBITDA row should be filtered out — all values null
    expect(result).not.toContain('EBITDA');
  });

  it('filters out metric rows where all values are dashes', () => {
    const result = formatSectionContent('peer_benchmarking', {
      confidence: { level: 'MEDIUM', reason: 'Some data' },
      peer_comparison_table: {
        company_name: 'Acme Corp',
        peers: [
          { name: 'Peer A', ticker: 'PA', geography_presence: 'US operations' },
        ],
        metrics: [
          { metric: 'Revenue', company: '$100M', peer1: '–', peer2: null, peer3: null, industry_avg: null, source: 'S1' },
          { metric: 'EBITDA', company: '–', peer1: '-', peer2: '–', peer3: null, industry_avg: '–', source: 'S2' },
        ]
      },
      benchmark_summary: { key_strengths: [{ strength: 'Good', description: 'desc' }], key_gaps: [], overall_assessment: 'OK' },
      sources_used: ['S1', 'S2']
    });
    expect(result).toContain('Revenue');
    expect(result).not.toContain('EBITDA');
  });

  it('renders notice when all metrics are dashes and confidence is LOW', () => {
    const result = formatSectionContent('peer_benchmarking', {
      confidence: { level: 'LOW', reason: 'No financial data available' },
      peer_comparison_table: {
        company_name: 'Apex Corp',
        peers: [{ name: 'Peer A', ticker: null, geography_presence: 'US' }],
        metrics: [
          { metric: 'Revenue', company: '–', peer1: '–', peer2: null, peer3: null, industry_avg: '–', source: 'S1' },
          { metric: 'EBITDA', company: '–', peer1: '–', peer2: null, peer3: null, industry_avg: '–', source: 'S1' },
        ]
      },
      benchmark_summary: { key_strengths: [{ strength: 'X', description: 'Y' }], key_gaps: [], overall_assessment: 'Cannot benchmark' },
      sources_used: ['S1']
    });
    // LOW confidence + no real metrics → notice only
    expect(result).toContain('> **Limited public information available**');
    expect(result).not.toContain('**Peers**');
    expect(result).not.toContain('**Key Strengths**');
  });

  it('renders notice when all peers, metrics, strengths, and gaps are empty', () => {
    const result = formatSectionContent('peer_benchmarking', {
      confidence: { level: 'LOW', reason: 'No comparable public peers found' },
      peer_comparison_table: {
        company_name: 'Apex Service Partners',
        peers: [],
        metrics: []
      },
      benchmark_summary: {
        overall_assessment: 'Unable to benchmark due to private company status.',
        key_strengths: [],
        key_gaps: [],
        competitive_positioning: 'Operates in fragmented HVAC market.'
      },
      sources_used: ['S1']
    });
    expect(result).toContain('> **Limited public information available**');
    expect(result).toContain('No comparable public peers found');
    // Notice is exclusive — no assessment text
    expect(result).not.toContain('Unable to benchmark');
  });
});

describe('segment_analysis empty segments', () => {
  it('renders notice when segments empty and confidence is LOW', () => {
    const result = formatSectionContent('segment_analysis', {
      confidence: { level: 'LOW', reason: 'Private company with no segment data' },
      segments: [],
      sources_used: ['S1']
    });
    expect(result).toContain('> **Limited public information available**');
    expect(result).toContain('Private company with no segment data');
  });

  it('renders notice even with overview when confidence is LOW and no segments', () => {
    const result = formatSectionContent('segment_analysis', {
      confidence: { level: 'LOW', reason: 'Limited data' },
      overview: 'Apex Service Partners operates in the HVAC services market with no public segment data available.',
      segments: [],
      sources_used: ['S1']
    });
    // LOW confidence + no segments = notice, NOT the overview text
    expect(result).toContain('> **Limited public information available**');
    expect(result).not.toContain('Apex Service Partners');
  });

  it('renders overview when segments empty but confidence is not LOW', () => {
    const result = formatSectionContent('segment_analysis', {
      confidence: { level: 'MEDIUM', reason: 'Some data available' },
      overview: 'The company operates in two main segments covering North American markets.',
      segments: [],
      sources_used: ['S1']
    });
    expect(result).not.toContain('> **Limited public information available**');
    expect(result).toContain('The company operates in two main segments');
  });
});

describe('trends empty detection', () => {
  it('renders notice when all trend arrays are empty', () => {
    const result = formatSectionContent('trends', {
      confidence: { level: 'LOW', reason: 'Private company with no trend data' },
      aggregate_summary: 'No trends could be identified.',
      macro_trends: { summary: 'None', trends: [] },
      micro_trends: { summary: 'None', trends: [] },
      company_trends: { summary: 'None', trends: [] },
      sources_used: ['S1']
    });
    expect(result).toContain('> **Limited public information available**');
    expect(result).toContain('Private company with no trend data');
  });

  it('renders normally when some trends exist', () => {
    const result = formatSectionContent('trends', {
      confidence: { level: 'MEDIUM', reason: 'Some data' },
      aggregate_summary: 'Summary.',
      macro_trends: { summary: 'Macro', trends: [
        { trend: 'Digital shift', description: 'Desc', direction: 'Up', impact_score: 4, geography_relevance: 'High', source: 'S1' }
      ]},
      micro_trends: { summary: 'None', trends: [] },
      company_trends: { summary: 'None', trends: [] },
      sources_used: ['S1']
    });
    expect(result).not.toContain('> **Limited public information available**');
    expect(result).toContain('Digital shift');
  });
});

describe('financial_snapshot empty detection', () => {
  it('renders notice when all KPI metrics are dashes and confidence is LOW', () => {
    const result = formatSectionContent('financial_snapshot', {
      confidence: { level: 'LOW', reason: 'No public financial data' },
      summary: 'No financial data is available for this private company.',
      kpi_table: {
        metrics: [
          { metric: 'Revenue ($M)', company: '–', industry_avg: '–', source: 'S1' },
          { metric: 'EBITDA Margin (%)', company: '–', industry_avg: '–', source: 'S1' },
        ]
      }
    });
    expect(result).toContain('> **Limited public information available**');
    expect(result).not.toContain('**KPI Table**');
    // Should NOT show the summary either — notice is the output
    expect(result).not.toContain('No financial data is available');
  });

  it('renders table when some metrics have real data', () => {
    const result = formatSectionContent('financial_snapshot', {
      confidence: { level: 'MEDIUM', reason: 'Partial data' },
      summary: 'Company has limited financials.',
      kpi_table: {
        metrics: [
          { metric: 'Revenue ($M)', company: '–', industry_avg: 945, source: 'S1' },
          { metric: 'EBITDA', company: '–', industry_avg: '–', source: 'S2' },
        ]
      }
    });
    expect(result).toContain('**KPI Table**');
    expect(result).toContain('Revenue');
    // EBITDA row (all dashes) should be filtered out
    expect(result).not.toContain('EBITDA');
  });

  it('strips inline source references from KPI cell values', () => {
    const result = formatSectionContent('financial_snapshot', {
      summary: 'Summary text.',
      kpi_table: {
        metrics: [
          { metric: 'Market Size', company: '$945M (S10)', industry_avg: '$1B', source: 'S10' },
        ]
      }
    });
    expect(result).toContain('$945');
    expect(result).not.toContain('(S10)');
    // Source should only appear in the Source column
    expect(result).toContain('| S10 |');
  });
});

describe('strategic_priorities formatting', () => {
  it('renders priorities as bold headings with description (not bullets)', () => {
    const result = formatSectionContent('strategic_priorities', {
      priorities: [
        { priority: 'Warehouse Automation', description: 'Investing in automation across facilities (S9).', source: 'S9' },
        { priority: 'Digital Transformation', description: 'Cloud migration and analytics (S3).', source: 'S3' }
      ],
      transformation_themes: []
    });
    // Should be bold headings, not bullet points
    expect(result).toContain('**Warehouse Automation**');
    expect(result).toContain('**Digital Transformation**');
    // Source should NOT be in the title — it's in the body text already
    expect(result).not.toContain('[S9]');
    expect(result).not.toContain('[S3]');
    // Description should be present
    expect(result).toContain('Investing in automation');
  });
});

describe('normalizeCell blank handling', () => {
  it('renders dash values as blank in tables', () => {
    const result = formatSectionContent('portfolio_snapshot', {
      summary: 'Overview',
      portfolio_companies: [
        { name: 'Alpha Co', sector: 'Tech', platform_or_addon: 'Platform', geography: '–', notes: 'N/A', source: 'S1' }
      ]
    });
    // Dashes and N/A should become blank cells, not display as "–" or "N/A"
    expect(result).not.toMatch(/\| –/);
    expect(result).not.toMatch(/\| N\/A/);
    // Real values should still be there
    expect(result).toContain('Alpha Co');
    expect(result).toContain('Tech');
  });
});

describe('financial_snapshot source labels', () => {
  it('renders FX and industry source labels after KPI table', () => {
    const result = formatSectionContent('financial_snapshot', {
      summary: 'Strong performance.',
      fx_source: 'A',
      industry_source: 'B',
      kpi_table: {
        metrics: [
          { metric: 'Revenue', company: 1000, industry_avg: 900, source: 'S1', unit: 'USD millions', value_type: 'currency' }
        ]
      }
    });
    expect(result).toContain('**FX Rate Source:** Company-disclosed rate');
    expect(result).toContain('**Industry Average Source:** Peer set average (comparable firms)');
  });
});

describe('FX/industry source label translation', () => {
  it('strips source metadata from financial_snapshot summary', () => {
    const result = formatSectionContent('financial_snapshot', {
      summary: 'Company financials are limited. FX rate source: A. Industry average source: B.',
      kpi_table: { metrics: [] }
    });
    expect(result).toContain('Company financials are limited.');
    expect(result).not.toContain('FX rate source');
    expect(result).not.toContain('Industry average source');
  });

  it('translates FX source codes in appendix', () => {
    const result = formatSectionContent('appendix', {
      source_references: [],
      fx_rates_and_industry: {
        fx_rates: [{ currency_pair: 'USD/EUR', rate: 0.92, source: 'B', source_description: 'Bloomberg avg' }],
        industry_averages: { source: 'A', dataset: 'S&P Capital IQ', description: 'Industry data' }
      }
    });
    expect(result).toContain('Historical average (Bloomberg/Reuters)');
    expect(result).not.toContain('| B |');
    expect(result).toContain('True industry average (S&P Capital IQ, Damodaran)');
  });

  it('passes through unknown source codes unchanged', () => {
    const result = formatSectionContent('appendix', {
      source_references: [],
      fx_rates_and_industry: {
        fx_rates: [{ currency_pair: 'USD/GBP', rate: 0.79, source: 'X', source_description: 'Custom' }],
        industry_averages: { source: 'Z', dataset: 'Custom', description: '' }
      }
    });
    expect(result).toContain('X');
    expect(result).toContain('Z');
  });

  it('strips verbose FX source metadata with descriptions', () => {
    const result = formatSectionContent('financial_snapshot', {
      summary: 'Company financials show growth. FX rate source: N/A (no multi-currency data disclosed). Industry average source: B (peer set).',
      kpi_table: { metrics: [] }
    });
    expect(result).toContain('Company financials show growth.');
    expect(result).not.toContain('FX rate source');
    expect(result).not.toContain('Industry average source');
    expect(result).not.toContain('N/A');
  });

  it('strips FX source metadata with just code letters and periods', () => {
    const result = formatSectionContent('financial_snapshot', {
      summary: 'Strong margins across the board. FX rate source: C. Industry average source: A.',
      fx_source: 'C',
      industry_source: 'A',
      kpi_table: { metrics: [{ metric: 'Revenue ($M)', company: 100, industry_avg: 90, source: 'S1' }] }
    });
    expect(result).toContain('Strong margins across the board.');
    expect(result).not.toContain('FX rate source: C');
    // But the dedicated labels should still render
    expect(result).toContain('**FX Rate Source:**');
    expect(result).toContain('**Industry Average Source:**');
  });
});

describe('exec_summary source deduplication', () => {
  it('does not double source references when bullet text contains inline sources', () => {
    const result = formatSectionContent('exec_summary', {
      bullet_points: [{
        bullet: 'Revenue grew 15% driven by strong North American demand (S1, S2)',
        category: 'Financial',
        supporting_sections: ['financial_snapshot'],
        sources: ['S1', 'S2']
      }]
    });
    // Should have exactly one occurrence of (S1, S2), not two
    const matches = result.match(/\(S1, S2\)/g);
    expect(matches).toHaveLength(1);
  });

  it('renders sources when bullet text has no inline sources', () => {
    const result = formatSectionContent('exec_summary', {
      bullet_points: [{
        bullet: 'Revenue grew 15% driven by strong North American demand',
        category: 'Financial',
        supporting_sections: ['financial_snapshot'],
        sources: ['S3']
      }]
    });
    expect(result).toContain('(S3)');
    expect(result).toContain('Revenue grew 15%');
  });
});
