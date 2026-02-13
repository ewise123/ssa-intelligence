import {
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx';

// SSA brand colors
const BRAND_BLUE = '003399';
const BRAND_DK2 = '336179';
const WHITE = 'FFFFFF';
const BODY_COLOR = '111827';
const ALT_ROW = 'F0F4FA';
const BORDER_COLOR = 'D1D5DB';

const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 2,
  color: BORDER_COLOR,
};

const cellBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};

/**
 * Parse markdown-style **bold** markers in text and return an array of TextRuns
 * with appropriate bold formatting applied.
 */
export function parseMarkdownBold(
  text: string,
  baseProps: { font?: string; size?: number; color?: string; bold?: boolean } = {},
): TextRun[] {
  const runs: TextRun[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Text before the bold marker
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: text.slice(lastIndex, match.index),
          font: baseProps.font ?? 'Avenir Next LT Pro',
          size: baseProps.size ?? 22,
          color: baseProps.color ?? BODY_COLOR,
          bold: baseProps.bold,
        }),
      );
    }
    // Bold text
    runs.push(
      new TextRun({
        text: match[1],
        font: baseProps.font ?? 'Avenir Next LT Pro',
        size: baseProps.size ?? 22,
        color: baseProps.color ?? BODY_COLOR,
        bold: true,
      }),
    );
    lastIndex = pattern.lastIndex;
  }

  // Remaining text after last bold marker
  if (lastIndex < text.length) {
    runs.push(
      new TextRun({
        text: text.slice(lastIndex),
        font: baseProps.font ?? 'Avenir Next LT Pro',
        size: baseProps.size ?? 22,
        color: baseProps.color ?? BODY_COLOR,
        bold: baseProps.bold,
      }),
    );
  }

  // If no bold markers were found, return a single run
  if (runs.length === 0) {
    runs.push(
      new TextRun({
        text,
        font: baseProps.font ?? 'Avenir Next LT Pro',
        size: baseProps.size ?? 22,
        color: baseProps.color ?? BODY_COLOR,
        bold: baseProps.bold,
      }),
    );
  }

  return runs;
}

export function styledHeading(text: string, level: 1 | 2 | 3): Paragraph {
  const headingLevel =
    level === 1
      ? HeadingLevel.HEADING_1
      : level === 2
        ? HeadingLevel.HEADING_2
        : HeadingLevel.HEADING_3;

  return new Paragraph({
    heading: headingLevel,
    children: [new TextRun({ text })],
    spacing: { before: level === 1 ? 360 : 240, after: 120 },
  });
}

export function styledParagraph(text: string): Paragraph {
  return new Paragraph({
    children: parseMarkdownBold(text, {
      font: 'Avenir Next LT Pro',
      size: 22, // 11pt
      color: BODY_COLOR,
    }),
    spacing: { after: 120 },
  });
}

export function boldParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: 'Avenir Next LT Pro',
        size: 28, // 14pt — subsection label
        bold: true,
        color: BRAND_DK2,
      }),
    ],
    spacing: { before: 200, after: 80 },
  });
}

export function bulletItem(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    children: parseMarkdownBold(text, {
      font: 'Avenir Next LT Pro',
      size: 22,
      color: BODY_COLOR,
    }),
    spacing: { after: 60 },
  });
}

export function brandedTable(
  headers: string[],
  rows: (string | number | null | undefined)[][],
): Table {
  if (!rows.length) {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('No data')],
            }),
          ],
        }),
      ],
    });
  }

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: BRAND_BLUE, fill: BRAND_BLUE },
          borders: cellBorders,
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: h,
                  bold: true,
                  font: 'Avenir Next LT Pro',
                  size: 20,
                  color: WHITE,
                }),
              ],
            }),
          ],
        }),
    ),
  });

  const colCount = headers.length;

  const dataRows = rows.map((row, rowIdx) => {
    const isAlt = rowIdx % 2 === 1;
    // Normalise row length to match header column count
    const normalised = Array.from({ length: colCount }, (_, i) => row[i] ?? null);
    return new TableRow({
      children: normalised.map((cell) => {
        const value = cell === null || cell === undefined ? '' : String(cell);
        return new TableCell({
          shading: isAlt
            ? { type: ShadingType.SOLID, color: ALT_ROW, fill: ALT_ROW }
            : undefined,
          borders: cellBorders,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: value,
                  font: 'Avenir Next LT Pro',
                  size: 20,
                  color: BODY_COLOR,
                }),
              ],
            }),
          ],
        });
      }),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

type DocxElement = Paragraph | Table;

// ── Individual section renderers ──

export function renderExecSummary(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (Array.isArray(data.bullet_points)) {
    elements.push(boldParagraph('Key Takeaways'));
    for (const b of data.bullet_points) {
      const text = `${b.bullet || ''}${b.sources ? ` (${(b.sources || []).join(', ')})` : ''}`;
      elements.push(bulletItem(text));
    }
  }
  return elements;
}

export function renderFinancialSnapshot(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (data.summary) elements.push(styledParagraph(String(data.summary)));
  if (data.kpi_table?.metrics?.length) {
    elements.push(boldParagraph('KPI Table'));
    elements.push(
      brandedTable(
        ['Metric', 'Company', 'Industry Avg', 'Source'],
        data.kpi_table.metrics.map((m: any) => {
          const metricName = m.unit ? `${m.metric} (${m.unit})` : m.metric;
          return [metricName, formatValue(m.company), formatValue(m.industry_avg), m.source || ''];
        }),
      ),
    );
  }
  if (data.derived_metrics?.length) {
    elements.push(boldParagraph('Derived Metrics'));
    elements.push(
      brandedTable(
        ['Metric', 'Formula', 'Calculation', 'Source'],
        data.derived_metrics.map((m: any) => [m.metric, m.formula, m.calculation, m.source]),
      ),
    );
  }
  return elements;
}

export function renderCompanyOverview(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (data.business_description?.overview) {
    elements.push(boldParagraph('Overview'));
    elements.push(styledParagraph(data.business_description.overview));
  }
  if (Array.isArray(data.business_description?.segments)) {
    elements.push(boldParagraph('Segments'));
    elements.push(
      brandedTable(
        ['Name', 'Description', 'Revenue %', 'Geography Relevance'],
        data.business_description.segments.map((s: any) => [
          s.name,
          s.description,
          s.revenue_pct,
          s.geography_relevance,
        ]),
      ),
    );
  }
  if (Array.isArray(data.geographic_footprint?.facilities)) {
    elements.push(boldParagraph('Facilities'));
    elements.push(
      brandedTable(
        ['Name', 'Location', 'Type', 'Employees', 'Capabilities'],
        data.geographic_footprint.facilities.map((f: any) => [
          f.name,
          f.location,
          f.type,
          f.employees,
          f.capabilities,
        ]),
      ),
    );
  }
  if (data.strategic_priorities?.priorities?.length) {
    elements.push(boldParagraph('Strategic Priorities'));
    for (const p of data.strategic_priorities.priorities) {
      elements.push(
        bulletItem(
          `${p.priority} (${p.geography_relevance || ''})${p.source ? ` [${p.source}]` : ''} — ${p.description}`,
        ),
      );
    }
  }
  if (data.key_leadership) {
    const execs = data.key_leadership.executives || [];
    const regionals = data.key_leadership.regional_leaders || [];
    if (execs.length) {
      elements.push(boldParagraph('Executives'));
      for (const e of execs) {
        elements.push(
          bulletItem(
            `${e.name}, ${e.title}${e.tenure ? ` (${e.tenure})` : ''}${e.source ? ` [${e.source}]` : ''}`,
          ),
        );
      }
    }
    if (regionals.length) {
      elements.push(boldParagraph('Regional Leaders'));
      for (const e of regionals) {
        elements.push(
          bulletItem(`${e.name}, ${e.title}${e.source ? ` [${e.source}]` : ''}`),
        );
      }
    }
  }
  return elements;
}

export function renderInvestmentStrategy(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (data.strategy_summary) elements.push(styledParagraph(data.strategy_summary));
  if (Array.isArray(data.focus_areas) && data.focus_areas.length) {
    elements.push(boldParagraph('Focus Areas'));
    for (const item of data.focus_areas) elements.push(bulletItem(String(item)));
  }
  if (Array.isArray(data.sector_focus) && data.sector_focus.length) {
    elements.push(boldParagraph('Sector Focus'));
    for (const item of data.sector_focus) elements.push(bulletItem(String(item)));
  }
  if (Array.isArray(data.platform_vs_addon_patterns) && data.platform_vs_addon_patterns.length) {
    elements.push(boldParagraph('Platform vs Add-on Patterns'));
    for (const item of data.platform_vs_addon_patterns) elements.push(bulletItem(String(item)));
  }
  return elements;
}

export function renderPortfolioSnapshot(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (data.summary) elements.push(styledParagraph(data.summary));
  if (Array.isArray(data.portfolio_companies) && data.portfolio_companies.length) {
    elements.push(boldParagraph('Portfolio Companies'));
    elements.push(
      brandedTable(
        ['Name', 'Sector', 'Type', 'Geography', 'Notes', 'Source'],
        data.portfolio_companies.map((c: any) => [
          c.name,
          c.sector,
          c.platform_or_addon,
          c.geography || '',
          c.notes || '',
          c.source || '',
        ]),
      ),
    );
  }
  return elements;
}

export function renderDealActivity(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (data.summary) elements.push(styledParagraph(data.summary));
  if (Array.isArray(data.deals) && data.deals.length) {
    elements.push(boldParagraph('Deal Activity'));
    elements.push(
      brandedTable(
        ['Company', 'Date', 'Type', 'Rationale', 'Source'],
        data.deals.map((d: any) => [d.company, d.date, d.deal_type, d.rationale, d.source || '']),
      ),
    );
  }
  return elements;
}

export function renderDealTeam(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (Array.isArray(data.stakeholders) && data.stakeholders.length) {
    elements.push(boldParagraph('Stakeholders'));
    elements.push(
      brandedTable(
        ['Name', 'Title', 'Role', 'Focus Area', 'Source'],
        data.stakeholders.map((s: any) => [
          s.name,
          s.title,
          s.role,
          s.focus_area || '',
          s.source || '',
        ]),
      ),
    );
  }
  if (data.notes) {
    elements.push(boldParagraph('Notes'));
    elements.push(styledParagraph(data.notes));
  }
  return elements;
}

export function renderPortfolioMaturity(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (data.summary) elements.push(styledParagraph(data.summary));
  if (Array.isArray(data.holdings) && data.holdings.length) {
    elements.push(boldParagraph('Holdings'));
    elements.push(
      brandedTable(
        ['Company', 'Acquired', 'Holding Years', 'Exit Signal', 'Source'],
        data.holdings.map((h: any) => [
          h.company,
          h.acquisition_period || '',
          h.holding_period_years ?? '',
          h.exit_signal,
          h.source || '',
        ]),
      ),
    );
  }
  return elements;
}

export function renderLeadershipAndGovernance(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (Array.isArray(data.leadership) && data.leadership.length) {
    elements.push(boldParagraph('Leadership'));
    elements.push(
      brandedTable(
        ['Name', 'Title', 'Focus Area', 'Source'],
        data.leadership.map((l: any) => [l.name, l.title, l.focus_area || '', l.source || '']),
      ),
    );
  }
  if (data.governance_notes) {
    elements.push(boldParagraph('Governance Notes'));
    elements.push(styledParagraph(data.governance_notes));
  }
  return elements;
}

export function renderStrategicPriorities(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (Array.isArray(data.priorities) && data.priorities.length) {
    elements.push(boldParagraph('Priorities'));
    for (const p of data.priorities) {
      elements.push(
        bulletItem(
          `${p.priority}${p.source ? ` [${p.source}]` : ''} — ${p.description}`,
        ),
      );
    }
  }
  if (Array.isArray(data.transformation_themes) && data.transformation_themes.length) {
    elements.push(boldParagraph('Transformation Themes'));
    for (const t of data.transformation_themes) elements.push(bulletItem(String(t)));
  }
  return elements;
}

export function renderOperatingCapabilities(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (Array.isArray(data.capabilities) && data.capabilities.length) {
    elements.push(boldParagraph('Capabilities'));
    elements.push(
      brandedTable(
        ['Capability', 'Description', 'Maturity', 'Source'],
        data.capabilities.map((c: any) => [
          c.capability,
          c.description,
          c.maturity || '',
          c.source || '',
        ]),
      ),
    );
  }
  if (Array.isArray(data.gaps) && data.gaps.length) {
    elements.push(boldParagraph('Gaps'));
    for (const g of data.gaps) elements.push(bulletItem(String(g)));
  }
  return elements;
}

export function renderDistributionAnalysis(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (data.summary) elements.push(styledParagraph(String(data.summary)));
  if (Array.isArray(data.channels) && data.channels.length) {
    elements.push(boldParagraph('Distribution Channels'));
    elements.push(
      brandedTable(
        ['Channel Type', 'Description', 'Premium Share %', 'Trend', 'Key Partners', 'Source'],
        data.channels.map((c: any) => [
          c.channel_type || '',
          c.description || '',
          c.premium_share_pct ?? '',
          c.trend || '',
          Array.isArray(c.key_partners) ? c.key_partners.join(', ') : c.key_partners || '',
          c.source || '',
        ]),
      ),
    );
  }
  if (data.distribution_costs) {
    elements.push(boldParagraph('Distribution Costs'));
    const costParts: string[] = [];
    if (data.distribution_costs.acquisition_cost_ratio) {
      costParts.push(`Acquisition Cost Ratio: ${data.distribution_costs.acquisition_cost_ratio}%`);
    }
    if (data.distribution_costs.commission_rates) {
      const rates = data.distribution_costs.commission_rates;
      const rateEntries = Object.entries(rates)
        .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${val}%`)
        .join(', ');
      if (rateEntries) costParts.push(`Commission Rates: ${rateEntries}`);
    }
    for (const part of costParts) elements.push(bulletItem(part));
    if (data.distribution_costs.notes) elements.push(styledParagraph(data.distribution_costs.notes));
  }
  if (data.digital_capabilities) {
    elements.push(boldParagraph('Digital Capabilities'));
    const caps = data.digital_capabilities;
    const capsList: string[] = [];
    if (caps.online_quoting) capsList.push('Online Quoting');
    if (caps.self_service_portal) capsList.push('Self-Service Portal');
    if (caps.mobile_app) capsList.push('Mobile App');
    if (capsList.length) elements.push(bulletItem(`Features: ${capsList.join(', ')}`));
    if (caps.notes) elements.push(styledParagraph(caps.notes));
  }
  if (data.competitive_positioning) {
    elements.push(boldParagraph('Competitive Positioning'));
    elements.push(styledParagraph(String(data.competitive_positioning)));
  }
  return elements;
}

export function renderSegmentAnalysis(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (data.overview) elements.push(styledParagraph(String(data.overview)));
  if (Array.isArray(data.segments)) {
    for (const seg of data.segments) {
      elements.push(styledHeading(seg.name, 3));
      if (seg.financial_snapshot?.table?.length) {
        elements.push(
          brandedTable(
            ['Metric', 'Segment', 'Company Avg', 'Industry Avg', 'Source'],
            seg.financial_snapshot.table.map((m: any) => {
              const metricName = m.unit ? `${m.metric} (${m.unit})` : m.metric;
              return [
                metricName,
                formatValue(m.segment),
                formatValue(m.company_avg),
                formatValue(m.industry_avg),
                m.source || '',
              ];
            }),
          ),
        );
      }
      if (seg.performance_analysis?.paragraphs?.length) {
        for (const p of seg.performance_analysis.paragraphs) elements.push(bulletItem(String(p)));
      }
      if (seg.competitive_landscape?.competitors?.length) {
        elements.push(
          brandedTable(
            ['Competitor', 'Geography', 'Market Share'],
            seg.competitive_landscape.competitors.map((c: any) => [
              c.name,
              c.geography,
              c.market_share || '',
            ]),
          ),
        );
      }
    }
  }
  return elements;
}

export function renderTrends(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];

  const renderTrendBlock = (title: string, block: any) => {
    if (!block?.trends?.length) return;
    elements.push(boldParagraph(title));
    elements.push(
      brandedTable(
        ['Trend', 'Description', 'Direction', 'Impact', 'Geography', 'Source'],
        block.trends.map((t: any) => [
          t.trend,
          t.description,
          t.direction,
          t.impact_score ?? t.impact ?? '',
          t.geography_relevance ?? '',
          t.source || '',
        ]),
      ),
    );
  };

  renderTrendBlock('Macro Trends', data.macro_trends);
  renderTrendBlock('Micro Trends', data.micro_trends);
  renderTrendBlock('Company Trends', data.company_trends);
  return elements;
}

export function renderPeerBenchmarking(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (data.peer_comparison_table?.peers?.length) {
    elements.push(boldParagraph('Peers'));
    elements.push(
      brandedTable(
        ['Name', 'Ticker', 'Geography'],
        data.peer_comparison_table.peers.map((p: any) => [
          p.name,
          p.ticker || '',
          p.geography_presence,
        ]),
      ),
    );
  }
  if (data.peer_comparison_table?.metrics?.length) {
    elements.push(boldParagraph('Metrics'));
    elements.push(
      brandedTable(
        ['Metric', 'Company', 'Peer1', 'Peer2', 'Peer3', 'Peer4', 'Industry Avg', 'Source'],
        data.peer_comparison_table.metrics.map((m: any) => [
          m.metric,
          m.company,
          m.peer1,
          m.peer2,
          m.peer3,
          m.peer4 || '',
          m.industry_avg,
          m.source,
        ]),
      ),
    );
  }
  if (data.benchmark_summary?.key_strengths?.length) {
    elements.push(boldParagraph('Key Strengths'));
    for (const s of data.benchmark_summary.key_strengths) {
      elements.push(bulletItem(`${s.strength}: ${s.description}`));
    }
  }
  if (data.benchmark_summary?.key_gaps?.length) {
    elements.push(boldParagraph('Key Gaps'));
    for (const g of data.benchmark_summary.key_gaps) {
      elements.push(bulletItem(`${g.gap} (${g.magnitude}): ${g.description}`));
    }
  }
  return elements;
}

export function renderSkuOpportunities(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (data.opportunities?.length) {
    elements.push(
      brandedTable(
        ['Issue Area', 'Problem', 'Source', 'Aligned SKU', 'Priority', 'Severity', 'Geography', 'Value Levers'],
        data.opportunities.map((o: any) => [
          o.issue_area,
          o.public_problem,
          o.source,
          o.aligned_sku,
          o.priority,
          o.severity,
          o.geography_relevance,
          Array.isArray(o.potential_value_levers) ? o.potential_value_levers.join('; ') : '',
        ]),
      ),
    );
  }
  return elements;
}

export function renderRecentNews(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  if (data.news_items?.length) {
    return [
      brandedTable(
        ['Date', 'Headline', 'Source', 'Implication', 'Geography', 'Category'],
        data.news_items.map((n: any) => [
          n.date,
          n.headline,
          n.source,
          n.implication,
          n.geography_relevance,
          n.category,
        ]),
      ),
    ];
  }
  return [];
}

export function renderConversationStarters(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  if (data.conversation_starters?.length) {
    return [
      brandedTable(
        ['Title', 'Question', 'Business Value', 'SSA Capability', 'Sources'],
        data.conversation_starters.map((c: any) => [
          c.title,
          c.question,
          c.business_value,
          c.ssa_capability,
          Array.isArray(c.sources) ? c.sources.join(', ') : '',
        ]),
      ),
    ];
  }
  return [];
}

export function renderAppendix(data: any): DocxElement[] {
  if (!data || typeof data !== 'object') return [];
  const elements: DocxElement[] = [];
  if (Array.isArray(data.source_references)) {
    elements.push(boldParagraph('Source References'));
    elements.push(
      brandedTable(
        ['ID', 'Citation', 'Type', 'Date', 'URL'],
        data.source_references.map((s: any) => [s.id, s.citation, s.type, s.date, s.url || '']),
      ),
    );
  }
  if (data.fx_rates_and_industry?.fx_rates?.length) {
    elements.push(boldParagraph('FX Rates'));
    elements.push(
      brandedTable(
        ['Pair', 'Rate', 'Source', 'Description'],
        data.fx_rates_and_industry.fx_rates.map((r: any) => [
          r.currency_pair,
          r.rate,
          r.source,
          r.source_description,
        ]),
      ),
    );
  }
  if (data.fx_rates_and_industry?.industry_averages) {
    const ia = data.fx_rates_and_industry.industry_averages;
    elements.push(boldParagraph('Industry Averages'));
    elements.push(bulletItem(`Source: ${ia.source}`));
    elements.push(bulletItem(`Dataset: ${ia.dataset}`));
    if (ia.description) elements.push(bulletItem(`Description: ${ia.description}`));
  }
  return elements;
}

// ── Dispatch ──

const renderers: Record<string, (data: any) => DocxElement[]> = {
  exec_summary: renderExecSummary,
  financial_snapshot: renderFinancialSnapshot,
  company_overview: renderCompanyOverview,
  investment_strategy: renderInvestmentStrategy,
  portfolio_snapshot: renderPortfolioSnapshot,
  deal_activity: renderDealActivity,
  deal_team: renderDealTeam,
  portfolio_maturity: renderPortfolioMaturity,
  leadership_and_governance: renderLeadershipAndGovernance,
  strategic_priorities: renderStrategicPriorities,
  operating_capabilities: renderOperatingCapabilities,
  distribution_analysis: renderDistributionAnalysis,
  segment_analysis: renderSegmentAnalysis,
  trends: renderTrends,
  peer_benchmarking: renderPeerBenchmarking,
  sku_opportunities: renderSkuOpportunities,
  recent_news: renderRecentNews,
  conversation_starters: renderConversationStarters,
  appendix: renderAppendix,
};

export function renderSection(sectionId: string, data: unknown): DocxElement[] {
  const renderer = renderers[sectionId];
  if (!renderer) return [];
  try {
    return renderer(data);
  } catch {
    return [styledParagraph(`Error rendering section: ${sectionId}`)];
  }
}

// ── Helpers ──

function formatValue(raw: any): string {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'number') return raw.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return String(raw);
}
