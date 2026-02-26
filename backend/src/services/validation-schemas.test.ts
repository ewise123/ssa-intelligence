import { describe, it, expect } from 'vitest';
import {
  companyBasicsSchema,
  geographySpecificsSchema,
  segmentStructureSchema,
  foundationOutputSchema,
  trendBaseSchema,
  opportunitySchema,
  fxRateDetailedSchema,
  peerBenchmarkingOutputSchema,
  segmentAnalysisOutputSchema,
  execSummaryOutputSchema,
  financialSnapshotOutputSchema,
  financialMetricSchema,
  segmentFinancialMetricSchema,
  peerMetricSchema,
  trendsOutputSchema,
  recentNewsOutputSchema,
  portfolioSnapshotOutputSchema,
  dealActivityOutputSchema,
  leadershipAndGovernanceOutputSchema,
  companyOverviewOutputSchema,
  keyExecsAndBoardOutputSchema,
  dealTeamOutputSchema,
  strategicPrioritiesOutputSchema,
  operatingCapabilitiesOutputSchema,
  portfolioMaturityOutputSchema,
  investmentStrategyOutputSchema,
  conversationStartersOutputSchema,
  distributionAnalysisOutputSchema,
  newsItemSchema
} from '../../prompts/validation.js';

// =============================================================================
// FOUNDATION: Revenue field validation (nullable nonNegativeNumberOrString)
// =============================================================================

describe('foundation revenue validation', () => {
  const validBasics = {
    legal_name: 'Test Corp',
    ownership: 'Public' as const,
    headquarters: 'New York, NY',
    global_employees: 100,
    fiscal_year_end: 'December 31'
  };

  const validGeo = {
    regional_revenue_pct: 50,
    regional_employees: 50,
    facilities: [{ name: 'HQ', location: 'NY', type: 'Office' }],
    key_facts: ['Established 2020']
  };

  it('accepts zero revenue for pre-revenue companies', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: 0
    });
    expect(result.success).toBe(true);
  });

  it('accepts positive revenue', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: 50000
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative revenue', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: -100
    });
    expect(result.success).toBe(false);
  });

  it('coerces string revenue to number', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: '$1,200'
    });
    expect(result.success).toBe(true);
  });

  it('accepts string zero revenue', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: '0'
    });
    expect(result.success).toBe(true);
  });

  it('accepts zero regional revenue', () => {
    const result = geographySpecificsSchema.safeParse({
      ...validGeo,
      regional_revenue_usd: 0
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative regional revenue', () => {
    const result = geographySpecificsSchema.safeParse({
      ...validGeo,
      regional_revenue_usd: -50
    });
    expect(result.success).toBe(false);
  });

  it('accepts zero employees for undisclosed private companies', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: 0,
      global_employees: 0
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative employees', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: 1000,
      global_employees: -1
    });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// FOUNDATION: Nullable numeric fields (Option A — explicit unknown handling)
// =============================================================================

describe('foundation nullable numeric fields', () => {
  const validBasics = {
    legal_name: 'Test Corp',
    ownership: 'Private' as const,
    headquarters: 'London, UK',
    fiscal_year_end: 'March 31'
  };

  const validGeo = {
    facilities: [{ name: 'HQ', location: 'London', type: 'Office' }],
    key_facts: ['UK operations since 2010']
  };

  it('accepts null global_revenue_usd for unknown revenue', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: null,
      global_employees: 500
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.global_revenue_usd).toBeNull();
  });

  it('accepts null global_employees for undisclosed headcount', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: 1000000,
      global_employees: null
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.global_employees).toBeNull();
  });

  it('accepts all-null company basics numerics', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: null,
      global_employees: null
    });
    expect(result.success).toBe(true);
  });

  it('accepts null regional_revenue_usd', () => {
    const result = geographySpecificsSchema.safeParse({
      ...validGeo,
      regional_revenue_usd: null,
      regional_revenue_pct: 25,
      regional_employees: 100
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.regional_revenue_usd).toBeNull();
  });

  it('accepts null regional_revenue_pct', () => {
    const result = geographySpecificsSchema.safeParse({
      ...validGeo,
      regional_revenue_usd: 500000,
      regional_revenue_pct: null,
      regional_employees: 100
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.regional_revenue_pct).toBeNull();
  });

  it('accepts null regional_employees', () => {
    const result = geographySpecificsSchema.safeParse({
      ...validGeo,
      regional_revenue_usd: 500000,
      regional_revenue_pct: 25,
      regional_employees: null
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.regional_employees).toBeNull();
  });

  it('accepts all-null geography numerics', () => {
    const result = geographySpecificsSchema.safeParse({
      ...validGeo,
      regional_revenue_usd: null,
      regional_revenue_pct: null,
      regional_employees: null
    });
    expect(result.success).toBe(true);
  });

  it('accepts null segment revenue_pct', () => {
    const result = segmentStructureSchema.safeParse({
      name: 'Widgets Division',
      revenue_pct: null,
      description: 'Manufactures widgets'
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.revenue_pct).toBeNull();
  });

  it('preserves zero as distinct from null (zero = known zero)', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: 0,
      global_employees: 0
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.global_revenue_usd).toBe(0);
      expect(result.data.global_employees).toBe(0);
    }
  });
});

// =============================================================================
// SECTION NULLABLE FIELDS: trends impact_score, sku severity, fx rates
// =============================================================================

describe('section nullable numeric fields', () => {
  it('accepts null impact_score in trends', () => {
    const result = trendBaseSchema.safeParse({
      trend: 'AI Adoption',
      description: 'Rapid adoption of artificial intelligence across manufacturing processes and supply chain operations',
      direction: 'Positive',
      impact_score: null,
      geography_relevance: 'Significant impact on North American operations and workforce',
      source: 'S1'
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.impact_score).toBeNull();
  });

  it('still validates impact_score range 1-10 when present', () => {
    const base = {
      trend: 'AI Adoption',
      description: 'Rapid adoption of artificial intelligence across manufacturing processes and supply chain operations',
      direction: 'Positive' as const,
      geography_relevance: 'Significant impact on North American operations and workforce',
      source: 'S1'
    };
    expect(trendBaseSchema.safeParse({ ...base, impact_score: 5 }).success).toBe(true);
    expect(trendBaseSchema.safeParse({ ...base, impact_score: 0 }).success).toBe(false);
    expect(trendBaseSchema.safeParse({ ...base, impact_score: 11 }).success).toBe(false);
  });

  it('accepts null severity in sku opportunities', () => {
    const result = opportunitySchema.safeParse({
      issue_area: 'Supply Chain',
      public_problem: 'Company faces significant supply chain disruptions affecting manufacturing output and delivery timelines',
      source: 'S1',
      aligned_sku: 'Supply Chain Analytics',
      priority: 'High',
      severity: null,
      severity_rationale: 'Critical impact on operational efficiency',
      geography_relevance: 'Affects all North American distribution centers',
      potential_value_levers: ['Cost reduction', 'Efficiency gains']
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.severity).toBeNull();
  });

  it('accepts null fx rate in appendix', () => {
    const result = fxRateDetailedSchema.safeParse({
      currency_pair: 'USD/EUR',
      rate: null,
      source: 'A',
      source_description: 'Rate unavailable'
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.rate).toBeNull();
  });
});

// =============================================================================
// SENTINEL VALUE HANDLING: schemas reject sentinels that sanitizer converts
// =============================================================================

describe('sentinel value rejection (pre-sanitization)', () => {
  const validBasics = {
    legal_name: 'Test Corp',
    ownership: 'Private' as const,
    headquarters: 'London, UK',
    fiscal_year_end: 'March 31'
  };

  it('rejects -1 sentinel for global_employees (sanitizer would convert to null)', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: 1000,
      global_employees: -1
    });
    expect(result.success).toBe(false);
  });

  it('rejects -1 sentinel for global_revenue_usd', () => {
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: -1,
      global_employees: 100
    });
    expect(result.success).toBe(false);
  });

  it('accepts "N/A" string in revenue field (coerced as string branch)', () => {
    // nonNegativeNumberOrString allows strings — "N/A" passes as string
    // The sanitizer would convert it to null before validation in practice
    const result = companyBasicsSchema.safeParse({
      ...validBasics,
      global_revenue_usd: 'N/A',
      global_employees: 100
    });
    // "N/A" can't be coerced to a number, so it stays as string — accepted by the string branch
    expect(result.success).toBe(true);
  });

  it('rejects negative percent in regional_revenue_pct', () => {
    const result = geographySpecificsSchema.safeParse({
      regional_revenue_usd: 500000,
      regional_revenue_pct: -1,
      regional_employees: 100,
      facilities: [{ name: 'HQ', location: 'London', type: 'Office' }],
      key_facts: ['Test']
    });
    expect(result.success).toBe(false);
  });

  it('rejects percent > 100', () => {
    const result = segmentStructureSchema.safeParse({
      name: 'Widgets',
      revenue_pct: 150,
      description: 'Too much revenue'
    });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// SOURCES_USED: S# regex validation
// =============================================================================

describe('sources_used S# regex validation', () => {
  const makePeerBenchmarkingOutput = (sourcesUsed: string[]) => ({
    confidence: { level: 'MEDIUM', reason: 'test' },
    peer_comparison_table: {
      company_name: 'Test Corp',
      peers: [
        { name: 'Peer A', ticker: 'PA', geography_presence: 'North American operations with facilities across the eastern seaboard' },
        { name: 'Peer B', ticker: 'PB', geography_presence: 'Canadian integrated company with significant upstream and downstream presence' },
        { name: 'Peer C', ticker: 'PC', geography_presence: 'US-focused industrial company with growing international operations base' }
      ],
      metrics: Array.from({ length: 10 }, (_, i) => ({
        metric: `Metric ${i}`,
        company: 100,
        peer1: 90,
        peer2: 95,
        peer3: 85,
        industry_avg: 92,
        source: 'S1'
      }))
    },
    benchmark_summary: {
      overall_assessment: 'Test Corp performs well relative to peers across key financial metrics in the North American market with strong margin performance.',
      key_strengths: [
        { strength: 'Margins', description: 'Superior EBITDA margins driven by integration benefits and cost discipline across operations', geography_context: 'North American margins benefit from scale advantages' },
        { strength: 'Returns', description: 'Highest ROIC among peers reflecting disciplined capital allocation focused on high-return expansions', geography_context: 'Regional operations generate superior returns due to integration' }
      ],
      key_gaps: [
        { gap: 'Scale', description: 'Smallest revenue base among major peers limiting negotiating power and portfolio diversification', geography_context: 'Concentrated footprint vs more diversified global peers', magnitude: 'Moderate' },
        { gap: 'Growth', description: 'Below-peer revenue growth rate reflecting mature asset base with limited greenfield development pipeline', geography_context: 'Growth constrained by regional regulatory and capacity factors', magnitude: 'Significant' }
      ],
      competitive_positioning: 'Test Corp holds a strong competitive position in its core market, ranking first or second among peers on most profitability metrics while trailing on growth.'
    },
    sources_used: sourcesUsed
  });

  it('accepts valid S# source IDs', () => {
    const result = peerBenchmarkingOutputSchema.safeParse(
      makePeerBenchmarkingOutput(['S1', 'S2', 'S10'])
    );
    expect(result.success).toBe(true);
  });

  it('rejects full citation strings in sources_used', () => {
    const result = peerBenchmarkingOutputSchema.safeParse(
      makePeerBenchmarkingOutput(['Imperial Oil 2024 10-K filing', 'S2'])
    );
    expect(result.success).toBe(false);
  });

  it('rejects URL strings in sources_used', () => {
    const result = peerBenchmarkingOutputSchema.safeParse(
      makePeerBenchmarkingOutput(['https://example.com/report.pdf'])
    );
    expect(result.success).toBe(false);
  });

  it('rejects S# with trailing text', () => {
    const result = peerBenchmarkingOutputSchema.safeParse(
      makePeerBenchmarkingOutput(['S1 - Annual Report'])
    );
    expect(result.success).toBe(false);
  });

  it('accepts empty sources_used array', () => {
    const result = peerBenchmarkingOutputSchema.safeParse(
      makePeerBenchmarkingOutput([])
    );
    expect(result.success).toBe(true);
  });

  it('enforces S# regex on segment analysis sources_used', () => {
    // Test the sources_used field shape directly via schema introspection
    const sourcesSchema = segmentAnalysisOutputSchema.shape.sources_used;
    expect(sourcesSchema.safeParse(['S1', 'S12']).success).toBe(true);
    expect(sourcesSchema.safeParse(['not-a-source-id']).success).toBe(false);
    expect(sourcesSchema.safeParse(['S1 - Annual Report']).success).toBe(false);
  });
});

// =============================================================================
// METRIC TABLE NULL TOLERANCE: financialMetricSchema
// =============================================================================

describe('financialMetricSchema null tolerance', () => {
  const base = { metric: 'Revenue ($M)', source: 'S1' };

  it('accepts null company value', () => {
    const result = financialMetricSchema.safeParse({ ...base, company: null, industry_avg: 100 });
    expect(result.success).toBe(true);
  });

  it('accepts null industry_avg value', () => {
    const result = financialMetricSchema.safeParse({ ...base, company: 50, industry_avg: null });
    expect(result.success).toBe(true);
  });

  it('accepts both null', () => {
    const result = financialMetricSchema.safeParse({ ...base, company: null, industry_avg: null });
    expect(result.success).toBe(true);
  });

  it('still accepts numeric values', () => {
    const result = financialMetricSchema.safeParse({ ...base, company: 123.4, industry_avg: 200 });
    expect(result.success).toBe(true);
  });

  it('still accepts dash strings', () => {
    const result = financialMetricSchema.safeParse({ ...base, company: '-', industry_avg: '–' });
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// METRIC TABLE NULL TOLERANCE: segmentFinancialMetricSchema
// =============================================================================

describe('segmentFinancialMetricSchema null tolerance', () => {
  const base = { metric: 'Revenue ($M)', source: 'S1' };

  it('accepts null segment value', () => {
    const result = segmentFinancialMetricSchema.safeParse({ ...base, segment: null, company_avg: 100, industry_avg: 90 });
    expect(result.success).toBe(true);
  });

  it('accepts null company_avg value', () => {
    const result = segmentFinancialMetricSchema.safeParse({ ...base, segment: 50, company_avg: null, industry_avg: 90 });
    expect(result.success).toBe(true);
  });

  it('accepts null industry_avg value', () => {
    const result = segmentFinancialMetricSchema.safeParse({ ...base, segment: 50, company_avg: 100, industry_avg: null });
    expect(result.success).toBe(true);
  });

  it('accepts all null metric values', () => {
    const result = segmentFinancialMetricSchema.safeParse({ ...base, segment: null, company_avg: null, industry_avg: null });
    expect(result.success).toBe(true);
  });

  it('still accepts numeric values', () => {
    const result = segmentFinancialMetricSchema.safeParse({ ...base, segment: 10, company_avg: 20, industry_avg: 15 });
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// METRIC TABLE NULL TOLERANCE: peerMetricSchema
// =============================================================================

describe('peerMetricSchema null tolerance', () => {
  const base = { metric: 'Revenue ($M)', source: 'S1' };
  const fullRow = { ...base, company: 100, peer1: 90, peer2: 85, peer3: 95, industry_avg: 92 };

  it('accepts null company value', () => {
    const result = peerMetricSchema.safeParse({ ...fullRow, company: null });
    expect(result.success).toBe(true);
  });

  it('accepts null peer values', () => {
    const result = peerMetricSchema.safeParse({ ...fullRow, peer1: null, peer2: null, peer3: null });
    expect(result.success).toBe(true);
  });

  it('accepts null industry_avg', () => {
    const result = peerMetricSchema.safeParse({ ...fullRow, industry_avg: null });
    expect(result.success).toBe(true);
  });

  it('accepts optional peer4 with null', () => {
    const result = peerMetricSchema.safeParse({ ...fullRow, peer4: null });
    expect(result.success).toBe(true);
  });

  it('still accepts numeric values', () => {
    const result = peerMetricSchema.safeParse(fullRow);
    expect(result.success).toBe(true);
  });

  it('still accepts dash strings', () => {
    const result = peerMetricSchema.safeParse({
      ...base, company: '-', peer1: '–', peer2: '-', peer3: '-', industry_avg: '-'
    });
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// RELAXED ARRAY MINIMUMS: accept sparse data from private/niche companies
// =============================================================================

describe('relaxed array minimums accept sparse data', () => {
  // Shared helpers
  const confidence = { level: 'MEDIUM', reason: 'Limited public data' };
  const makeBullet = (i: number) => ({
    bullet: `Key finding number ${i} for this company analysis`,
    category: 'Financial',
    supporting_sections: ['financial_snapshot'],
    sources: ['S1']
  });
  const makeFinancialMetric = (i: number) => ({
    metric: `Metric ${i}`,
    company: 100 + i,
    industry_avg: 90 + i,
    source: 'S1'
  });
  const makeTrend = (i: number) => ({
    trend: `Trend ${i}`,
    description: 'A significant industry trend affecting operations and strategic planning across the sector',
    direction: 'Positive',
    impact_score: 5,
    geography_relevance: 'Relevant across North American operations and markets',
    source: 'S1'
  });

  it('execSummaryOutputSchema accepts 3 bullet points', () => {
    const result = execSummaryOutputSchema.safeParse({
      confidence,
      bullet_points: [makeBullet(1), makeBullet(2), makeBullet(3)],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('financialSnapshotOutputSchema accepts 3 KPI metrics', () => {
    const result = financialSnapshotOutputSchema.safeParse({
      confidence,
      summary: 'Financial performance summary covering key metrics and industry comparisons for this private company with limited disclosures.',
      kpi_table: {
        metrics: [makeFinancialMetric(1), makeFinancialMetric(2), makeFinancialMetric(3)]
      },
      fx_source: 'A',
      industry_source: 'A',
      derived_metrics: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('segmentAnalysisSchema accepts 1 competitor, 1 paragraph, 1 key driver', () => {
    const result = segmentAnalysisOutputSchema.safeParse({
      confidence,
      overview: 'Segment analysis overview for a niche company with limited public segment data and a narrow competitive set in a specialized market.',
      segments: [{
        name: 'Core Segment',
        financial_snapshot: {
          table: [{ metric: 'Revenue', segment: 100, company_avg: 100, industry_avg: 90, source: 'S1' }],
          fx_source: 'USD',
          geography_notes: 'North American operations represent the entirety of this segment with limited international exposure'
        },
        performance_analysis: {
          paragraphs: ['The segment performed steadily.'],
          analyst_quotes: [],
          key_drivers: ['Organic demand growth']
        },
        competitive_landscape: {
          competitors: [{ name: 'Competitor A', geography: 'US' }],
          positioning: 'Strong positioning in niche market with limited direct competition from larger players',
          recent_dynamics: 'Market remains stable with few new entrants and steady demand from existing customer base'
        }
      }],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('trendsOutputSchema accepts 2 macro, 1 micro, 1 company trend', () => {
    const result = trendsOutputSchema.safeParse({
      confidence,
      aggregate_summary: 'Trends analysis for a niche sector with limited macro coverage and few company-specific developments to report on in the current period.',
      macro_trends: {
        summary: 'Limited macro trends identified for this obscure sector with few public data points',
        trends: [makeTrend(1), makeTrend(2)]
      },
      micro_trends: {
        summary: 'Narrow micro-trend landscape for this specialized niche market segment overall',
        trends: [{ ...makeTrend(1), segment_relevance: 'Core segment' }]
      },
      company_trends: {
        summary: 'Stable private company with few publicly observable trend shifts in recent periods',
        trends: [{ ...makeTrend(1), management_commentary: 'Stable operations' }]
      },
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('trendsOutputSchema accepts 0 micro and 0 company trends', () => {
    const result = trendsOutputSchema.safeParse({
      confidence,
      aggregate_summary: 'Limited trend data available for this private company with minimal public disclosure of strategic or operational trends.',
      macro_trends: {
        summary: 'Broad HVAC industry trends identified from public sources and analyst reports',
        trends: [makeTrend(1), makeTrend(2)]
      },
      micro_trends: {
        summary: 'No micro-level trends could be identified from public sources for this company',
        trends: []
      },
      company_trends: {
        summary: 'No company-specific trends could be identified from public sources for this entity',
        trends: []
      },
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('peerBenchmarkingOutputSchema accepts 2 peers, 3 metrics, 1 strength, 1 gap', () => {
    const result = peerBenchmarkingOutputSchema.safeParse({
      confidence,
      peer_comparison_table: {
        company_name: 'Test Corp',
        peers: [
          { name: 'Peer A', geography_presence: 'North American operations with major presence in the eastern US' },
          { name: 'Peer B', geography_presence: 'Canadian operations with growing presence in western provinces' }
        ],
        metrics: [
          { metric: 'Revenue', company: 100, peer1: 90, peer2: 95, peer3: null, industry_avg: 92, source: 'S1' },
          { metric: 'EBITDA', company: 30, peer1: 25, peer2: 28, peer3: null, industry_avg: 27, source: 'S1' },
          { metric: 'Margin', company: 30, peer1: 28, peer2: 29, peer3: null, industry_avg: 29, source: 'S1' }
        ]
      },
      benchmark_summary: {
        overall_assessment: 'Test Corp performs adequately relative to its small peer set across the limited metrics available for comparison in this niche market.',
        key_strengths: [
          { strength: 'Margins', description: 'Superior EBITDA margins driven by operational efficiency and cost discipline across the organization', geography_context: 'North American margins benefit from scale advantages' }
        ],
        key_gaps: [
          { gap: 'Scale', description: 'Smallest revenue base among peers limiting negotiating power and overall market influence in the region', geography_context: 'Concentrated footprint vs more diversified peers', magnitude: 'Moderate' }
        ],
        competitive_positioning: 'Positioned as a niche operator with strong margins but limited scale relative to peers in the broader North American competitive landscape.'
      },
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('recentNewsOutputSchema accepts 1 news item', () => {
    const result = recentNewsOutputSchema.safeParse({
      confidence,
      news_items: [{
        date: '2025-01-15',
        headline: 'Company announces Q4 results',
        source: 'S1',
        source_name: 'Company Press Release',
        implication: 'Quarterly results show steady performance with modest revenue growth and stable margins year-over-year',
        geography_relevance: 'Results reflect North American operations performance',
        category: 'Operations'
      }],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('portfolioSnapshotOutputSchema accepts 1 portfolio company', () => {
    const result = portfolioSnapshotOutputSchema.safeParse({
      confidence,
      summary: 'Early-stage fund with a single portfolio holding acquired recently and still in the value creation phase of ownership.',
      portfolio_companies: [{
        name: 'PortCo Alpha',
        sector: 'Technology',
        platform_or_addon: 'Platform',
        geography: 'US',
        source: 'S1'
      }],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('dealActivityOutputSchema accepts 1 deal', () => {
    const result = dealActivityOutputSchema.safeParse({
      confidence,
      summary: 'New fund with a single completed acquisition to date as the firm builds out its initial portfolio holdings.',
      deals: [{
        company: 'Target Corp',
        date: '2024-06',
        deal_type: 'Platform Acquisition',
        rationale: 'Strategic entry into adjacent market',
        source: 'S1'
      }],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('leadershipAndGovernanceOutputSchema accepts 1 leader', () => {
    const result = leadershipAndGovernanceOutputSchema.safeParse({
      confidence,
      leadership: [{
        name: 'Jane Smith',
        title: 'CEO',
        focus_area: 'Corporate strategy',
        source: 'S1'
      }],
      governance_notes: 'Limited governance disclosure typical of a small private company with concentrated ownership.',
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('recentNewsOutputSchema now accepts empty news_items for private/niche companies', () => {
    const result = recentNewsOutputSchema.safeParse({
      confidence,
      news_items: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// EMPTY ARRAY ACCEPTANCE: private/niche companies with no public data
// =============================================================================

describe('empty array acceptance for private/niche companies', () => {
  const confidence = { level: 'LOW', reason: 'Private company with limited public information' };

  it('companyOverviewOutputSchema accepts 0 executives', () => {
    const result = companyOverviewOutputSchema.safeParse({
      confidence,
      business_description: {
        overview: 'A private technology company providing dental payment solutions with limited public disclosure of operations and financials.',
        segments: [{ name: 'Core', description: 'Core business segment', revenue_pct: null, geography_relevance: 'North America' }],
        geography_positioning: 'Company operates primarily in the North American dental market with limited international presence'
      },
      geographic_footprint: {
        summary: 'Headquartered in the United States with operations focused on the domestic dental market',
        facilities: [],
        regional_stats: 'No public regional data available'
      },
      strategic_priorities: {
        summary: 'Strategic priorities are not publicly disclosed for this private company',
        priorities: [{ priority: 'Growth', description: 'Expand market presence', geography_relevance: 'North America', source: 'S1' }],
        geography_specific_initiatives: 'No public data available'
      },
      key_leadership: {
        summary: 'Leadership information is not publicly disclosed',
        executives: [],
        regional_leader: null
      },
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('keyExecsAndBoardOutputSchema accepts 0 c_suite executives', () => {
    const result = keyExecsAndBoardOutputSchema.safeParse({
      confidence,
      board_of_directors: {
        summary: 'Board composition is not publicly disclosed for this private company',
        members: []
      },
      c_suite: {
        summary: 'C-suite leadership is not publicly disclosed',
        executives: []
      },
      business_unit_leaders: {
        summary: 'No business unit leaders publicly identified',
        leaders: []
      },
      recent_leadership_changes: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('recentNewsOutputSchema accepts 0 news_items', () => {
    const result = recentNewsOutputSchema.safeParse({
      confidence,
      news_items: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('dealTeamOutputSchema accepts 0 stakeholders', () => {
    const result = dealTeamOutputSchema.safeParse({
      confidence,
      stakeholders: [],
      notes: 'No deal team stakeholders publicly identified for this private company.',
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('leadershipAndGovernanceOutputSchema accepts 0 leadership entries', () => {
    const result = leadershipAndGovernanceOutputSchema.safeParse({
      confidence,
      leadership: [],
      governance_notes: 'Governance information is not publicly disclosed for this private company.',
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('companyOverviewOutputSchema accepts 0 business segments', () => {
    const result = companyOverviewOutputSchema.safeParse({
      confidence,
      business_description: {
        overview: 'A private HVAC services company with extremely limited publicly available information about its operations and business structure.',
        segments: [],
        geography_positioning: 'Company operates primarily in the United States with regional HVAC service operations'
      },
      geographic_footprint: {
        summary: 'United States based operations with limited public disclosure of specific locations',
        facilities: [],
        regional_stats: 'No public regional data available'
      },
      strategic_priorities: {
        summary: 'Strategic priorities are not publicly disclosed for this private company',
        priorities: [{ priority: 'Growth', description: 'Expand through HVAC acquisitions in fragmented market', geography_relevance: 'North America', source: 'S1' }],
        geography_specific_initiatives: 'No public data available'
      },
      key_leadership: {
        summary: 'Leadership information is not publicly disclosed',
        executives: [],
        regional_leader: null
      },
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('segmentAnalysisOutputSchema accepts 0 segments', () => {
    const result = segmentAnalysisOutputSchema.safeParse({
      confidence,
      overview: 'Apex Service Partners is a private HVAC services platform company. No public segment breakdown is available due to the company being privately held with limited financial disclosure.',
      segments: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('peerBenchmarkingOutputSchema accepts 0 peers and 0 metrics', () => {
    const result = peerBenchmarkingOutputSchema.safeParse({
      confidence,
      peer_comparison_table: {
        company_name: 'Apex Service Partners',
        peers: [],
        metrics: []
      },
      benchmark_summary: {
        overall_assessment: 'Unable to perform peer benchmarking due to the private nature of this company and the fragmented HVAC services market with few comparable public companies.',
        key_strengths: [],
        key_gaps: [],
        competitive_positioning: 'Apex Service Partners operates in a highly fragmented HVAC services market with no directly comparable public peers available for benchmarking.'
      },
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('companyOverviewOutputSchema accepts 0 strategic priorities', () => {
    const result = companyOverviewOutputSchema.safeParse({
      confidence,
      business_description: {
        overview: 'A private HVAC services company with extremely limited publicly available information about its operations and business structure.',
        segments: [],
        geography_positioning: 'Company operates primarily in the United States with regional HVAC service operations across multiple states'
      },
      geographic_footprint: {
        summary: 'United States based operations with limited public disclosure of specific locations and regional presence',
        facilities: [],
        regional_stats: 'No public regional data available'
      },
      strategic_priorities: {
        summary: 'Strategic priorities are not publicly disclosed for this private company with no public filings',
        priorities: [],
        geography_specific_initiatives: 'No public data available'
      },
      key_leadership: {
        summary: 'Leadership information is not publicly disclosed',
        executives: [],
        regional_leader: null
      },
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('strategicPrioritiesOutputSchema accepts 0 priorities and 0 themes', () => {
    const result = strategicPrioritiesOutputSchema.safeParse({
      confidence,
      priorities: [],
      transformation_themes: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('operatingCapabilitiesOutputSchema accepts 0 capabilities', () => {
    const result = operatingCapabilitiesOutputSchema.safeParse({
      confidence,
      capabilities: [],
      gaps: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('portfolioMaturityOutputSchema accepts 0 holdings', () => {
    const result = portfolioMaturityOutputSchema.safeParse({
      confidence,
      summary: 'No portfolio maturity data could be identified from public sources for this private equity firm with limited disclosure.',
      holdings: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('companyBasicsSchema accepts null ticker for private companies', () => {
    const result = companyBasicsSchema.safeParse({
      legal_name: 'Shore Capital Partners, Ltd.',
      ticker: null,
      ownership: 'Private',
      headquarters: 'Chicago, IL',
      global_revenue_usd: null,
      global_employees: null,
      fiscal_year_end: 'December'
    });
    expect(result.success).toBe(true);
  });

  it('execSummaryOutputSchema accepts 0 bullet points', () => {
    const result = execSummaryOutputSchema.safeParse({
      confidence,
      bullet_points: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('financialSnapshotOutputSchema accepts 0 KPI metrics', () => {
    const result = financialSnapshotOutputSchema.safeParse({
      confidence,
      summary: 'No financial data is publicly available for this private company with no regulatory filing requirements.',
      kpi_table: { metrics: [] },
      fx_source: 'A',
      industry_source: 'A',
      derived_metrics: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('conversationStartersOutputSchema accepts 0 conversation starters', () => {
    const result = conversationStartersOutputSchema.safeParse({
      confidence,
      conversation_starters: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('investmentStrategyOutputSchema accepts 0 focus_areas, sector_focus, patterns', () => {
    const result = investmentStrategyOutputSchema.safeParse({
      confidence,
      strategy_summary: 'No investment strategy data could be identified from public sources for this private equity firm with limited disclosure.',
      focus_areas: [],
      sector_focus: [],
      platform_vs_addon_patterns: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('portfolioSnapshotOutputSchema accepts 0 portfolio companies', () => {
    const result = portfolioSnapshotOutputSchema.safeParse({
      confidence,
      summary: 'No portfolio companies could be identified from public sources for this private equity firm.',
      portfolio_companies: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('dealActivityOutputSchema accepts 0 deals', () => {
    const result = dealActivityOutputSchema.safeParse({
      confidence,
      summary: 'No deal activity could be identified from public sources for this private equity firm.',
      deals: [],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('distributionAnalysisOutputSchema accepts 0 channels', () => {
    const result = distributionAnalysisOutputSchema.safeParse({
      confidence,
      summary: 'No distribution channel data could be identified for this niche insurer.',
      channels: [],
      distribution_costs: {
        acquisition_cost_ratio: null,
        notes: 'No distribution cost data publicly available.',
        source: 'S1'
      },
      digital_capabilities: {
        online_quoting: false,
        self_service_portal: false,
        mobile_app: false,
        notes: 'No digital capability data available.',
        source: 'S1'
      },
      competitive_positioning: 'Unable to assess competitive positioning due to limited public information.',
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// NULLISH FIELD ACCEPTANCE: Claude may return null instead of omitting fields
// =============================================================================

describe('nullish field acceptance (null instead of undefined)', () => {
  it('newsItemSchema accepts null original_language', () => {
    const result = newsItemSchema.safeParse({
      date: '2025-06-15',
      headline: 'Test headline',
      original_language: null,
      source: 'S1',
      source_name: 'Reuters',
      implication: 'This has significant implications for the company operations and strategy going forward',
      geography_relevance: 'Directly impacts North American operations',
      category: 'Operations'
    });
    expect(result.success).toBe(true);
  });

  it('portfolioSnapshotOutputSchema accepts null geography and notes', () => {
    const result = portfolioSnapshotOutputSchema.safeParse({
      confidence: { level: 'MEDIUM', reason: 'Some data' },
      summary: 'Portfolio overview with limited geographic data available for most holdings in the fund.',
      portfolio_companies: [{
        name: 'PortCo Alpha',
        sector: 'Technology',
        platform_or_addon: 'Platform',
        geography: null,
        notes: null,
        source: 'S1'
      }],
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('dealTeamOutputSchema accepts null focus_area and notes', () => {
    const result = dealTeamOutputSchema.safeParse({
      confidence: { level: 'MEDIUM', reason: 'Some data' },
      stakeholders: [{
        name: 'John Doe',
        title: 'Managing Director',
        role: 'Deal Lead',
        focus_area: null,
        source: 'S1'
      }],
      notes: null,
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('leadershipAndGovernanceOutputSchema accepts null focus_area', () => {
    const result = leadershipAndGovernanceOutputSchema.safeParse({
      confidence: { level: 'MEDIUM', reason: 'Some data' },
      leadership: [{
        name: 'Jane Smith',
        title: 'CEO',
        focus_area: null,
        source: 'S1'
      }],
      governance_notes: 'Standard governance structure with board oversight and quarterly reporting.',
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });

  it('operatingCapabilitiesOutputSchema accepts null maturity and null gaps', () => {
    const result = operatingCapabilitiesOutputSchema.safeParse({
      confidence: { level: 'MEDIUM', reason: 'Some data' },
      capabilities: [{
        capability: 'Cloud Infrastructure',
        description: 'Migrating legacy systems to cloud-based platforms',
        maturity: null,
        source: 'S1'
      }],
      gaps: null,
      sources_used: ['S1']
    });
    expect(result.success).toBe(true);
  });
});
