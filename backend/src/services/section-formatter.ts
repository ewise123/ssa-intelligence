// Utilities to format section content into Markdown (ported from frontend)

export type SectionId =
  | 'exec_summary'
  | 'financial_snapshot'
  | 'company_overview'
  | 'investment_strategy'
  | 'portfolio_snapshot'
  | 'deal_activity'
  | 'deal_team'
  | 'portfolio_maturity'
  | 'leadership_and_governance'
  | 'strategic_priorities'
  | 'operating_capabilities'
  | 'distribution_analysis'
  | 'segment_analysis'
  | 'trends'
  | 'peer_benchmarking'
  | 'sku_opportunities'
  | 'recent_news'
  | 'conversation_starters'
  | 'appendix';

const formatNumber = (value: number): string => {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: Math.abs(value) >= 1000 ? 0 : 2,
  });
};

const formatPercent = (value: number): string => {
  const asRatio = Math.abs(value) <= 1 ? value * 100 : value;
  return `${asRatio.toFixed(1)}%`;
};

const formatValue = (raw: any): string => {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    const suffixMatch = trimmed.match(/^\$?(-?\d[\d,]*\.?\d*)([MB])$/i);
    if (suffixMatch) {
      const num = Number.parseFloat(suffixMatch[1].replace(/,/g, ''));
      const suffix = suffixMatch[2].toUpperCase();
      if (!Number.isNaN(num)) {
        const val = suffix === 'B' ? num * 1_000_000_000 : num * 1_000_000;
        const formatted = formatNumber(val);
        return trimmed.startsWith('$') ? `$${formatted}${suffix}` : `${formatted}${suffix}`;
      }
    }
    if (/^\$?-?\d[\d,]*\.?\d*$/.test(trimmed.replace(/,/g, ''))) {
      const num = Number.parseFloat(trimmed.replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(num)) return formatCurrency(num);
    }
    if (/^-?\d+(\.\d+)?%$/.test(trimmed)) {
      const num = Number.parseFloat(trimmed.replace('%', ''));
      if (!Number.isNaN(num)) return formatPercent(num);
    }
    const numeric = Number(trimmed.replace(/,/g, ''));
    if (!Number.isNaN(numeric)) return formatNumber(numeric);
    return trimmed;
  }
  if (typeof raw === 'number') {
    return formatNumber(raw);
  }
  return String(raw);
};

type MetricUnit = {
  type: 'currency' | 'percent' | 'ratio' | 'days' | 'years' | 'number' | 'bps';
  suffix?: string;
  prefix?: string;
};

const resolveMetricUnit = (metricName: string, unitHint?: string, valueType?: string): MetricUnit | null => {
  const match = metricName.match(/\(([^)]+)\)\s*$/);
  const token = match?.[1]?.toLowerCase();

  if (token) {
    if (token.includes('bps') || token.includes('bp')) return { type: 'bps', suffix: ' bps' };
    if (token.includes('%') || token.includes('percent')) return { type: 'percent', suffix: '%' };
    if (token.includes('x')) return { type: 'ratio', suffix: 'x' };
    if (token.includes('day')) return { type: 'days', suffix: ' days' };
    if (token.includes('year')) return { type: 'years', suffix: ' years' };
    if (token.includes('count') || token.includes('score')) return { type: 'number' };
    if (token.includes('$b')) return { type: 'currency', prefix: '$', suffix: 'B' };
    if (token.includes('$m')) return { type: 'currency', prefix: '$', suffix: 'M' };
    if (token.includes('$k')) return { type: 'currency', prefix: '$', suffix: 'K' };
    if (token.includes('$')) return { type: 'currency', prefix: '$' };
  }

  const normalizedUnit = unitHint?.toLowerCase();
  if (normalizedUnit) {
    if (normalizedUnit.includes('%') || normalizedUnit.includes('percent')) return { type: 'percent', suffix: '%' };
    if (normalizedUnit.includes('bps') || normalizedUnit.includes('bp')) return { type: 'bps', suffix: ' bps' };
    if (normalizedUnit.includes('day')) return { type: 'days', suffix: ' days' };
    if (normalizedUnit.includes('year')) return { type: 'years', suffix: ' years' };
    if (normalizedUnit.includes('count') || normalizedUnit.includes('score')) return { type: 'number' };
    if (normalizedUnit.includes('usd') && normalizedUnit.includes('b')) return { type: 'currency', prefix: '$', suffix: 'B' };
    if (normalizedUnit.includes('usd') && normalizedUnit.includes('m')) return { type: 'currency', prefix: '$', suffix: 'M' };
    if (normalizedUnit.includes('usd') && normalizedUnit.includes('k')) return { type: 'currency', prefix: '$', suffix: 'K' };
    if (normalizedUnit.includes('usd') || normalizedUnit.includes('$')) return { type: 'currency', prefix: '$' };
  }

  const normalizedType = valueType?.toLowerCase();
  if (normalizedType === 'percent') return { type: 'percent', suffix: '%' };
  if (normalizedType === 'ratio') return { type: 'ratio', suffix: 'x' };
  if (normalizedType === 'number') return { type: 'number' };
  if (normalizedType === 'currency') return { type: 'currency', prefix: '$' };

  return null;
};

const parseNumeric = (raw: string): number | null => {
  const cleaned = raw.replace(/,/g, '');
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const num = Number.parseFloat(match[0]);
  return Number.isNaN(num) ? null : num;
};

const formatMetricValue = (
  metricName: string,
  raw: any,
  unitHint?: string,
  valueType?: string
): string => {
  if (raw === null || raw === undefined) return '';
  const unit = resolveMetricUnit(metricName, unitHint, valueType);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '-') return '-';
    if (trimmed === '') return '';
    const hasLetters = /[a-z]/i.test(trimmed);
    if (hasLetters && !unit) return trimmed;
  }

  const numeric =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string'
        ? parseNumeric(raw)
        : null;

  if (numeric === null) {
    return typeof raw === 'string' ? raw.trim() : String(raw);
  }

  if (!unit) return formatNumber(numeric);

  switch (unit.type) {
    case 'percent':
      return formatPercent(numeric);
    case 'bps':
      return `${formatNumber(numeric)}${unit.suffix ?? ''}`;
    case 'ratio':
      return `${formatNumber(numeric)}${unit.suffix ?? 'x'}`;
    case 'days':
      return `${formatNumber(numeric)}${unit.suffix ?? ' days'}`;
    case 'years':
      return `${formatNumber(numeric)}${unit.suffix ?? ' years'}`;
    case 'currency': {
      const formatted = formatNumber(numeric);
      const prefix = unit.prefix ?? '$';
      const suffix = unit.suffix ?? '';
      return `${prefix}${formatted}${suffix}`;
    }
    case 'number':
    default:
      return formatNumber(numeric);
  }
};

const mdTable = (headers: string[], rows: (string | number | null | undefined)[][]): string => {
  if (!rows.length) return '';
  const headerRow = `| ${headers.join(' | ')} |`;
  const sepRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows
    .map((r) => `| ${r.map((cell) => (cell === null || cell === undefined ? '' : String(cell))).join(' | ')} |`)
    .join('\n');
  return `${headerRow}\n${sepRow}\n${body}`;
};

export const formatSectionContent = (sectionId: SectionId, data: any): string => {
  if (!data || typeof data !== 'object') return '';

  switch (sectionId) {
    case 'exec_summary': {
      const parts: string[] = [];
      if (Array.isArray(data.bullet_points)) {
        parts.push('**Key Takeaways**');
        parts.push(
          data.bullet_points
            .map((b: any) => `- ${b.bullet || ''}${b.sources ? ` (${(b.sources || []).join(', ')})` : ''}`)
            .join('\n')
        );
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'financial_snapshot': {
      const parts: string[] = [];
      if (data.summary) parts.push(String(data.summary));
      if (data.kpi_table?.metrics?.length) {
        parts.push('**KPI Table**');
        parts.push(
          mdTable(
            ['Metric', 'Company', 'Industry Avg', 'Source'],
            data.kpi_table.metrics.map((m: any) => {
              const metricName = m.unit ? `${m.metric} (${m.unit})` : m.metric;
              const companyValue = formatMetricValue(metricName, m.company, m.unit, m.value_type);
              const industryValue = formatMetricValue(metricName, m.industry_avg, m.unit, m.value_type);
              return [
                metricName,
                companyValue,
                industryValue,
                m.source || '',
              ];
            })
          )
        );
      }
      if (data.derived_metrics?.length) {
        parts.push('**Derived Metrics**');
        parts.push(
          mdTable(
            ['Metric', 'Formula', 'Calculation', 'Source'],
            data.derived_metrics.map((m: any) => [m.metric, m.formula, m.calculation, m.source])
          )
        );
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'company_overview': {
      const parts: string[] = [];
      if (data.business_description?.overview) parts.push(`**Overview**\n${data.business_description.overview}`);
      if (Array.isArray(data.business_description?.segments)) {
        parts.push('**Segments**');
        parts.push(
          mdTable(
            ['Name', 'Description', 'Revenue %', 'Geography Relevance'],
            data.business_description.segments.map((s: any) => [s.name, s.description, s.revenue_pct, s.geography_relevance])
          )
        );
      }
      if (Array.isArray(data.geographic_footprint?.facilities)) {
        parts.push('**Facilities**');
        parts.push(
          mdTable(
            ['Name', 'Location', 'Type', 'Employees', 'Capabilities'],
            data.geographic_footprint.facilities.map((f: any) => [f.name, f.location, f.type, f.employees, f.capabilities])
          )
        );
      }
      if (data.strategic_priorities?.priorities?.length) {
        parts.push('**Strategic Priorities**');
        parts.push(
          data.strategic_priorities.priorities
            .map(
              (p: any) =>
                `- ${p.priority} (${p.geography_relevance || ''})${p.source ? ` [${p.source}]` : ''}\n  ${p.description}`
            )
            .join('\n')
        );
      }
      if (data.key_leadership) {
        const execs = data.key_leadership.executives || [];
        const regionals = data.key_leadership.regional_leaders || [];
        if (execs.length) {
          parts.push('**Executives**');
          parts.push(
            execs.map((e: any) => `- ${e.name}, ${e.title}${e.tenure ? ` (${e.tenure})` : ''}${e.source ? ` [${e.source}]` : ''}`).join('\n')
          );
        }
        if (regionals.length) {
          parts.push('**Regional Leaders**');
          parts.push(regionals.map((e: any) => `- ${e.name}, ${e.title}${e.source ? ` [${e.source}]` : ''}`).join('\n'));
        }
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'investment_strategy': {
      const parts: string[] = [];
      if (data.strategy_summary) parts.push(data.strategy_summary);
      if (Array.isArray(data.focus_areas) && data.focus_areas.length) {
        parts.push('\n**Focus Areas**');
        parts.push(data.focus_areas.map((item: any) => `- ${item}`).join('\n'));
      }
      if (Array.isArray(data.sector_focus) && data.sector_focus.length) {
        parts.push('\n**Sector Focus**');
        parts.push(data.sector_focus.map((item: any) => `- ${item}`).join('\n'));
      }
      if (Array.isArray(data.platform_vs_addon_patterns) && data.platform_vs_addon_patterns.length) {
        parts.push('\n**Platform vs Add-on Patterns**');
        parts.push(data.platform_vs_addon_patterns.map((item: any) => `- ${item}`).join('\n'));
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'portfolio_snapshot': {
      const parts: string[] = [];
      if (data.summary) parts.push(data.summary);
      if (Array.isArray(data.portfolio_companies) && data.portfolio_companies.length) {
        parts.push('\n**Portfolio Companies**');
        parts.push(
          mdTable(
            ['Name', 'Sector', 'Type', 'Geography', 'Notes', 'Source'],
            data.portfolio_companies.map((c: any) => [
              c.name,
              c.sector,
              c.platform_or_addon,
              c.geography || '',
              c.notes || '',
              c.source || ''
            ])
          )
        );
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'deal_activity': {
      const parts: string[] = [];
      if (data.summary) parts.push(data.summary);
      if (Array.isArray(data.deals) && data.deals.length) {
        parts.push('\n**Deal Activity**');
        parts.push(
          mdTable(
            ['Company', 'Date', 'Type', 'Rationale', 'Source'],
            data.deals.map((d: any) => [d.company, d.date, d.deal_type, d.rationale, d.source || ''])
          )
        );
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'deal_team': {
      const parts: string[] = [];
      if (Array.isArray(data.stakeholders) && data.stakeholders.length) {
        parts.push('\n**Stakeholders**');
        parts.push(
          mdTable(
            ['Name', 'Title', 'Role', 'Focus Area', 'Source'],
            data.stakeholders.map((s: any) => [s.name, s.title, s.role, s.focus_area || '', s.source || ''])
          )
        );
      }
      if (data.notes) parts.push(`\n**Notes**\n${data.notes}`);
      return parts.filter(Boolean).join('\n\n');
    }
    case 'portfolio_maturity': {
      const parts: string[] = [];
      if (data.summary) parts.push(data.summary);
      if (Array.isArray(data.holdings) && data.holdings.length) {
        parts.push('\n**Holdings**');
        parts.push(
          mdTable(
            ['Company', 'Acquired', 'Holding Years', 'Exit Signal', 'Source'],
            data.holdings.map((h: any) => [
              h.company,
              h.acquisition_period || '',
              h.holding_period_years ?? '',
              h.exit_signal,
              h.source || ''
            ])
          )
        );
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'leadership_and_governance': {
      const parts: string[] = [];
      if (Array.isArray(data.leadership) && data.leadership.length) {
        parts.push('\n**Leadership**');
        parts.push(
          mdTable(
            ['Name', 'Title', 'Focus Area', 'Source'],
            data.leadership.map((l: any) => [l.name, l.title, l.focus_area || '', l.source || ''])
          )
        );
      }
      if (data.governance_notes) parts.push(`\n**Governance Notes**\n${data.governance_notes}`);
      return parts.filter(Boolean).join('\n\n');
    }
    case 'strategic_priorities': {
      const parts: string[] = [];
      if (Array.isArray(data.priorities) && data.priorities.length) {
        parts.push('\n**Priorities**');
        parts.push(
          data.priorities
            .map((p: any) => `- ${p.priority}${p.source ? ` [${p.source}]` : ''}\n  ${p.description}`)
            .join('\n')
        );
      }
      if (Array.isArray(data.transformation_themes) && data.transformation_themes.length) {
        parts.push('\n**Transformation Themes**');
        parts.push(data.transformation_themes.map((t: any) => `- ${t}`).join('\n'));
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'operating_capabilities': {
      const parts: string[] = [];
      if (Array.isArray(data.capabilities) && data.capabilities.length) {
        parts.push('\n**Capabilities**');
        parts.push(
          mdTable(
            ['Capability', 'Description', 'Maturity', 'Source'],
            data.capabilities.map((c: any) => [
              c.capability,
              c.description,
              c.maturity || '',
              c.source || ''
            ])
          )
        );
      }
      if (Array.isArray(data.gaps) && data.gaps.length) {
        parts.push('\n**Gaps**');
        parts.push(data.gaps.map((g: any) => `- ${g}`).join('\n'));
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'distribution_analysis': {
      const parts: string[] = [];
      if (data.summary) parts.push(String(data.summary));
      if (Array.isArray(data.channels) && data.channels.length) {
        parts.push('**Distribution Channels**');
        parts.push(
          mdTable(
            ['Channel Type', 'Description', 'Premium Share %', 'Trend', 'Key Partners', 'Source'],
            data.channels.map((c: any) => [
              c.channel_type || '',
              c.description || '',
              c.premium_share_pct ?? '',
              c.trend || '',
              Array.isArray(c.key_partners) ? c.key_partners.join(', ') : (c.key_partners || ''),
              c.source || ''
            ])
          )
        );
      }
      if (data.distribution_costs) {
        parts.push('**Distribution Costs**');
        if (data.distribution_costs.acquisition_cost_ratio) {
          parts.push(`- Acquisition Cost Ratio: ${data.distribution_costs.acquisition_cost_ratio}%`);
        }
        if (data.distribution_costs.commission_rates) {
          const rates = data.distribution_costs.commission_rates;
          const rateEntries = Object.entries(rates)
            .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${val}%`)
            .join(', ');
          if (rateEntries) parts.push(`- Commission Rates: ${rateEntries}`);
        }
        if (data.distribution_costs.notes) parts.push(`\n${data.distribution_costs.notes}`);
      }
      if (data.digital_capabilities) {
        parts.push('**Digital Capabilities**');
        const caps = data.digital_capabilities;
        const capsList: string[] = [];
        if (caps.online_quoting) capsList.push('Online Quoting');
        if (caps.self_service_portal) capsList.push('Self-Service Portal');
        if (caps.mobile_app) capsList.push('Mobile App');
        if (capsList.length) parts.push(`- Features: ${capsList.join(', ')}`);
        if (caps.notes) parts.push(`\n${caps.notes}`);
      }
      if (data.competitive_positioning) {
        parts.push('**Competitive Positioning**');
        parts.push(String(data.competitive_positioning));
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'segment_analysis': {
      const parts: string[] = [];
      if (data.overview) parts.push(String(data.overview));
      if (Array.isArray(data.segments)) {
        data.segments.forEach((seg: any) => {
          parts.push(`### ${seg.name}`);
          if (seg.financial_snapshot?.table?.length) {
            parts.push(
              mdTable(
                ['Metric', 'Segment', 'Company Avg', 'Industry Avg', 'Source'],
                seg.financial_snapshot.table.map((m: any) => {
                  const metricName = m.unit ? `${m.metric} (${m.unit})` : m.metric;
                  const segmentValue = formatMetricValue(metricName, m.segment, m.unit, m.value_type);
                  const companyValue = formatMetricValue(metricName, m.company_avg, m.unit, m.value_type);
                  const industryValue = formatMetricValue(metricName, m.industry_avg, m.unit, m.value_type);
                  return [
                    metricName,
                    segmentValue,
                    companyValue,
                    industryValue,
                    m.source || '',
                  ];
                })
              )
            );
          }
          if (seg.performance_analysis?.paragraphs?.length) {
            parts.push(seg.performance_analysis.paragraphs.map((p: any) => `- ${p}`).join('\n'));
          }
          if (seg.competitive_landscape?.competitors?.length) {
            parts.push(
              mdTable(
                ['Competitor', 'Geography', 'Market Share'],
                seg.competitive_landscape.competitors.map((c: any) => [c.name, c.geography, c.market_share || ''])
              )
            );
          }
        });
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'trends': {
      const parts: string[] = [];
      const buildTrendBlock = (title: string, block: any) => {
        if (!block?.trends?.length) return [];
        const heading = `**${title}**`;
        const table = mdTable(
          ['Trend', 'Description', 'Direction', 'Impact', 'Geography', 'Source'],
          block.trends.map((t: any) => [
            t.trend,
            t.description,
            t.direction,
            t.impact_score ?? t.impact ?? '',
            t.geography_relevance ?? '',
            t.source || '',
          ])
        );
        return [heading, table];
      };
      if (data.macro_trends) parts.push(...buildTrendBlock('Macro Trends', data.macro_trends));
      if (data.micro_trends) parts.push(...buildTrendBlock('Micro Trends', data.micro_trends));
      if (data.company_trends) parts.push(...buildTrendBlock('Company Trends', data.company_trends));
      return parts.filter(Boolean).join('\n\n');
    }
    case 'peer_benchmarking': {
      const parts: string[] = [];
      if (data.peer_comparison_table?.peers?.length) {
        parts.push('**Peers**');
        parts.push(mdTable(['Name', 'Ticker', 'Geography'], data.peer_comparison_table.peers.map((p: any) => [p.name, p.ticker || '', p.geography_presence])));
      }
      if (data.peer_comparison_table?.metrics?.length) {
        parts.push('**Metrics**');
        parts.push(
          mdTable(
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
            ])
          )
        );
      }
      if (data.benchmark_summary?.key_strengths?.length) {
        parts.push('**Key Strengths**');
        parts.push(data.benchmark_summary.key_strengths.map((s: any) => `- ${s.strength}: ${s.description}`).join('\n'));
      }
      if (data.benchmark_summary?.key_gaps?.length) {
        parts.push('**Key Gaps**');
        parts.push(data.benchmark_summary.key_gaps.map((g: any) => `- ${g.gap} (${g.magnitude}): ${g.description}`).join('\n'));
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'sku_opportunities': {
      const parts: string[] = [];
      if (data.opportunities?.length) {
        parts.push(
          mdTable(
            ['Issue Area', 'Problem', 'Source', 'Aligned SKU', 'Priority', 'Severity', 'Geography', 'Value Levers'],
            data.opportunities.map((o: any) => [
              o.issue_area,
              o.public_problem,
              o.source,
              o.aligned_sku,
              o.priority,
              o.severity,
              o.geography_relevance,
              Array.isArray(o.potential_value_levers) ? o.potential_value_levers.join('; ') : ''
            ])
          )
        );
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'recent_news': {
      if (data.news_items?.length) {
        return mdTable(
          ['Date', 'Headline', 'Source', 'Implication', 'Geography', 'Category'],
          data.news_items.map((n: any) => [n.date, n.headline, n.source, n.implication, n.geography_relevance, n.category])
        );
      }
      return '';
    }
    case 'conversation_starters': {
      if (data.conversation_starters?.length) {
        return mdTable(
          ['Title', 'Question', 'Business Value', 'SSA Capability', 'Sources'],
          data.conversation_starters.map((c: any) => [
            c.title,
            c.question,
            c.business_value,
            c.ssa_capability,
            Array.isArray(c.sources) ? c.sources.join(', ') : ''
          ])
        );
      }
      return '';
    }
    case 'appendix': {
      const parts: string[] = [];
      if (Array.isArray(data.source_references)) {
        parts.push('**Source References**');
        parts.push(mdTable(['ID', 'Citation', 'Type', 'Date', 'URL'], data.source_references.map((s: any) => [s.id, s.citation, s.type, s.date, s.url || ''])));
      }
      if (data.fx_rates_and_industry?.fx_rates?.length) {
        parts.push('**FX Rates**');
        parts.push(
          mdTable(
            ['Pair', 'Rate', 'Source', 'Description'],
            data.fx_rates_and_industry.fx_rates.map((r: any) => [r.currency_pair, r.rate, r.source, r.source_description])
          )
        );
      }
      if (data.fx_rates_and_industry?.industry_averages) {
        const ia = data.fx_rates_and_industry.industry_averages;
        parts.push('**Industry Averages**');
        parts.push(`- Source: ${ia.source}\n- Dataset: ${ia.dataset}\n- Description: ${ia.description || ''}`);
      }
      return parts.filter(Boolean).join('\n\n');
    }
    default:
      return '';
  }
};

export const sectionOrder: { id: SectionId; title: string; field: string }[] = [
  { id: 'exec_summary', title: 'Executive Summary', field: 'execSummary' },
  { id: 'financial_snapshot', title: 'Financial Snapshot', field: 'financialSnapshot' },
  { id: 'company_overview', title: 'Company Overview', field: 'companyOverview' },
  { id: 'segment_analysis', title: 'Segment Analysis', field: 'segmentAnalysis' },
  { id: 'trends', title: 'Market Trends', field: 'trends' },
  { id: 'peer_benchmarking', title: 'Peer Benchmarking', field: 'peerBenchmarking' },
  { id: 'sku_opportunities', title: 'SKU Opportunities', field: 'skuOpportunities' },
  { id: 'distribution_analysis', title: 'Distribution Channels and Partnerships', field: 'distributionAnalysis' },
  { id: 'recent_news', title: 'Recent News', field: 'recentNews' },
  { id: 'conversation_starters', title: 'Conversation Starters', field: 'conversationStarters' },
  { id: 'appendix', title: 'Appendix & Sources', field: 'appendix' }
];
