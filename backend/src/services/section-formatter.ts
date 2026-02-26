// Utilities to format section content into Markdown (ported from frontend)

import { formatMetricValue, formatNumber } from './metric-formatter.js';
import {
  normalizeCell,
  isEmptyValue,
  stripInlineSource,
  isPlaceholderName,
  insufficientDataNotice,
} from './rendering-helpers.js';
// Re-export for consumers that import from section-formatter
export { stripInlineSource, insufficientDataNotice };

export type SectionId =
  | 'exec_summary'
  | 'financial_snapshot'
  | 'company_overview'
  | 'key_execs_and_board'
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

const mdTable = (headers: string[], rows: (string | number | null | undefined)[][]): string => {
  if (!rows.length) return '';
  const headerRow = `| ${headers.join(' | ')} |`;
  const sepRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows
    .map((r) => `| ${r.map(normalizeCell).join(' | ')} |`)
    .join('\n');
  return `${headerRow}\n${sepRow}\n${body}`;
};

const FX_SOURCE_LABELS: Record<string, string> = {
  A: 'Company-disclosed rate',
  B: 'Historical average (Bloomberg/Reuters)',
  C: 'Current spot rate',
};
const INDUSTRY_SOURCE_LABELS: Record<string, string> = {
  A: 'True industry average (S&P Capital IQ, Damodaran)',
  B: 'Peer set average (comparable firms)',
};
const resolveSourceLabel = (code: string, labels: Record<string, string>): string =>
  labels[code] || code;

const stripSourceMetadata = (summary: string): string =>
  summary.replace(/\s*FX rate source:[\s\S]*$/i, '').trim();

export const formatSectionContent = (sectionId: SectionId, data: any): string => {
  if (!data || typeof data !== 'object') return '';

  switch (sectionId) {
    case 'exec_summary': {
      const parts: string[] = [];
      if (Array.isArray(data.bullet_points) && data.bullet_points.length) {
        parts.push('**Key Takeaways**');
        parts.push(
          data.bullet_points
            .map((b: any) => {
              let text = stripInlineSource(b.bullet || '');
              const endsWithPeriod = text.endsWith('.');
              if (endsWithPeriod) text = text.slice(0, -1);
              const sources = b.sources ? ` (${(b.sources || []).join(', ')})` : '';
              return `- ${text}${sources}${endsWithPeriod ? '.' : ''}`;
            })
            .join('\n')
        );
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'financial_snapshot': {
      const parts: string[] = [];
      if (data.summary) parts.push(stripSourceMetadata(String(data.summary)));
      if (data.kpi_table?.metrics?.length) {
        const populatedMetrics = data.kpi_table.metrics.filter((m: any) =>
          !isEmptyValue(m.company) || !isEmptyValue(m.industry_avg)
        );
        if (populatedMetrics.length) {
          parts.push('**KPI Table**');
          parts.push(
            mdTable(
              ['Metric', 'Company', 'Industry Avg', 'Source'],
              populatedMetrics.map((m: any) => {
                const metricName = m.unit ? `${m.metric} (${m.unit})` : m.metric;
                const rawCompany = typeof m.company === 'string' ? stripInlineSource(m.company) : m.company;
                const rawIndustry = typeof m.industry_avg === 'string' ? stripInlineSource(m.industry_avg) : m.industry_avg;
                const opts = { unitHint: m.unit, valueType: m.value_type, currency: m.currency, tableMode: true };
                const companyValue = formatMetricValue(metricName, rawCompany, opts);
                const industryValue = formatMetricValue(metricName, rawIndustry, opts);
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
      // Add FX and industry source notes if available
      const sourceNotes: string[] = [];
      if (data.fx_source) {
        sourceNotes.push(`**FX Rate Source:** ${resolveSourceLabel(data.fx_source, FX_SOURCE_LABELS)}`);
      }
      if (data.industry_source) {
        sourceNotes.push(`**Industry Average Source:** ${resolveSourceLabel(data.industry_source, INDUSTRY_SOURCE_LABELS)}`);
      }
      if (sourceNotes.length) parts.push(sourceNotes.join(' | '));
      // If no tables rendered and confidence is LOW, show notice instead of just summary text
      const hasTable = parts.some(p => p.startsWith('|') || p.startsWith('**KPI') || p.startsWith('**Derived'));
      if (!hasTable && data.confidence?.level === 'LOW') {
        return insufficientDataNotice(data.confidence?.reason);
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'company_overview': {
      const parts: string[] = [];
      if (data.business_description?.overview) parts.push(`**Overview**\n${data.business_description.overview}`);
      if (data.business_description?.segments?.length) {
        parts.push('**Segments**');
        parts.push(
          mdTable(
            ['Name', 'Description', 'Revenue %', 'Geography Relevance'],
            data.business_description.segments.map((s: any) => [
              s.name,
              s.description,
              s.revenue_pct != null ? formatMetricValue('Revenue (%)', s.revenue_pct) : '',
              s.geography_relevance,
            ])
          )
        );
      }
      if (Array.isArray(data.geographic_footprint?.facilities) && data.geographic_footprint.facilities.length) {
        parts.push('**Facilities**');
        parts.push(
          mdTable(
            ['Name', 'Location', 'Type', 'Employees', 'Capabilities'],
            data.geographic_footprint.facilities.map((f: any) => [
              f.name,
              f.location,
              f.type,
              f.employees != null ? formatNumber(f.employees) : '',
              f.capabilities,
            ])
          )
        );
      }
      if (data.strategic_priorities?.priorities?.length) {
        parts.push('**Strategic Priorities**');
        for (const p of data.strategic_priorities.priorities) {
          parts.push(`**${p.priority}**\n${p.description}`);
        }
      }
      if (data.key_leadership) {
        const execs = data.key_leadership.executives || [];
        const regionals = data.key_leadership.regional_leaders || [];
        if (execs.length) {
          parts.push('**Executives**');
          parts.push(
            execs.map((e: any) => `- ${e.name}, ${e.title}${e.tenure ? ` (${e.tenure})` : ''}${e.source ? ` [${e.source}]` : ''}`).join('\n')
          );
        } else {
          parts.push('**Key Leadership**');
          parts.push(insufficientDataNotice(data.key_leadership?.summary || data.confidence?.reason));
        }
        if (regionals.length) {
          parts.push('**Regional Leaders**');
          parts.push(regionals.map((e: any) => `- ${e.name}, ${e.title}${e.source ? ` [${e.source}]` : ''}`).join('\n'));
        }
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'key_execs_and_board': {
      const parts: string[] = [];
      // Filter out placeholder entries Claude fabricates when people can't be found
      const realExecs = (data.c_suite?.executives || []).filter((e: any) => !isPlaceholderName(e.name));
      const realBoard = (data.board_of_directors?.members || []).filter((m: any) => !isPlaceholderName(m.name));
      const realLeaders = (data.business_unit_leaders?.leaders || []).filter((l: any) => !isPlaceholderName(l.name));
      const hasAnyPeople = realExecs.length + realBoard.length + realLeaders.length > 0;

      if (!hasAnyPeople) {
        return insufficientDataNotice(data.confidence?.reason);
      }

      if (data.board_of_directors?.summary) parts.push(`**Board of Directors**\n${data.board_of_directors.summary}`);
      if (realBoard.length) {
        parts.push(
          mdTable(
            ['Name', 'Role', 'Committees', 'Tenure', 'Background', 'Source'],
            realBoard.map((m: any) => [
              m.name,
              m.role,
              Array.isArray(m.committees) ? m.committees.join(', ') : (m.committees || ''),
              m.tenure || '',
              m.background || '',
              m.source || ''
            ])
          )
        );
      }
      if (data.c_suite?.summary) parts.push(`**C-Suite Leadership**\n${data.c_suite.summary}`);
      if (realExecs.length) {
        parts.push(
          mdTable(
            ['Name', 'Title', 'Tenure', 'Background', 'Performance Actions', 'Source'],
            realExecs.map((e: any) => [
              e.name,
              e.title,
              e.tenure || '',
              e.background || '',
              Array.isArray(e.performance_actions) ? e.performance_actions.join('; ') : (e.performance_actions || ''),
              e.source || ''
            ])
          )
        );
      }
      if (data.business_unit_leaders?.summary) parts.push(`**Business Unit Leaders**\n${data.business_unit_leaders.summary}`);
      if (realLeaders.length) {
        parts.push(
          mdTable(
            ['Name', 'Title', 'Business Unit', 'Background', 'Performance Actions', 'Source'],
            realLeaders.map((l: any) => [
              l.name,
              l.title,
              l.business_unit || '',
              l.background || '',
              Array.isArray(l.performance_actions) ? l.performance_actions.join('; ') : (l.performance_actions || ''),
              l.source || ''
            ])
          )
        );
      }
      if (Array.isArray(data.recent_leadership_changes) && data.recent_leadership_changes.length) {
        parts.push('**Recent Leadership Changes**');
        parts.push(
          mdTable(
            ['Date', 'Type', 'Description', 'Implications', 'Source'],
            data.recent_leadership_changes.map((c: any) => [
              c.date || '',
              c.change_type || '',
              c.description || '',
              c.implications || '',
              c.source || ''
            ])
          )
        );
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
      } else {
        parts.push(insufficientDataNotice(data.confidence?.reason));
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
      } else {
        parts.push(insufficientDataNotice(data.confidence?.reason));
      }
      if (data.governance_notes) parts.push(`\n**Governance Notes**\n${data.governance_notes}`);
      return parts.filter(Boolean).join('\n\n');
    }
    case 'strategic_priorities': {
      const parts: string[] = [];
      if (Array.isArray(data.priorities) && data.priorities.length) {
        for (const p of data.priorities) {
          parts.push(`**${p.priority}**\n${p.description}`);
        }
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
      // If no segments and LOW confidence, show notice regardless of overview
      // (overview is just Claude explaining why there's no data)
      if (!data.segments?.length && data.confidence?.level === 'LOW') {
        return insufficientDataNotice(data.confidence?.reason);
      }
      if (data.overview) parts.push(String(data.overview));
      if (!data.segments?.length && !data.overview) {
        parts.push(insufficientDataNotice(data.confidence?.reason));
      }
      if (Array.isArray(data.segments)) {
        data.segments.forEach((seg: any) => {
          parts.push(`### ${seg.name}`);
          if (seg.financial_snapshot?.table?.length) {
            parts.push(
              mdTable(
                ['Metric', 'Segment', 'Company Avg', 'Industry Avg', 'Source'],
                seg.financial_snapshot.table.map((m: any) => {
                  const metricName = m.unit ? `${m.metric} (${m.unit})` : m.metric;
                  const opts = { unitHint: m.unit, valueType: m.value_type, currency: m.currency, tableMode: true };
                  const segmentValue = formatMetricValue(metricName, m.segment, opts);
                  const companyValue = formatMetricValue(metricName, m.company_avg, opts);
                  const industryValue = formatMetricValue(metricName, m.industry_avg, opts);
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
      if (!parts.length) {
        return insufficientDataNotice(data.confidence?.reason);
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'peer_benchmarking': {
      const parts: string[] = [];

      // Filter metrics to only rows with real values (not dashes/N-A)
      const populatedMetrics = (data.peer_comparison_table?.metrics || []).filter((m: any) =>
        !isEmptyValue(m.company) || !isEmptyValue(m.peer1) || !isEmptyValue(m.peer2) ||
        !isEmptyValue(m.peer3) || !isEmptyValue(m.peer4) || !isEmptyValue(m.industry_avg)
      );

      const hasPeers = data.peer_comparison_table?.peers?.length > 0;
      const hasMetrics = populatedMetrics.length > 0;
      const hasStrengths = data.benchmark_summary?.key_strengths?.length > 0;
      const hasGaps = data.benchmark_summary?.key_gaps?.length > 0;

      // If no real data after filtering, show notice
      if (!hasMetrics && data.confidence?.level === 'LOW') {
        const reason = data.confidence?.reason || data.benchmark_summary?.overall_assessment;
        return insufficientDataNotice(reason);
      }
      if (!hasPeers && !hasMetrics && !hasStrengths && !hasGaps) {
        const reason = data.confidence?.reason || data.benchmark_summary?.overall_assessment;
        return insufficientDataNotice(reason);
      }

      if (hasPeers) {
        parts.push('**Peers**');
        parts.push(mdTable(['Name', 'Ticker', 'Geography'], data.peer_comparison_table.peers.map((p: any) => [p.name, p.ticker || '', p.geography_presence])));
      }
      if (hasMetrics) {
        parts.push('**Metrics**');
        parts.push(
          mdTable(
            ['Metric', 'Company', 'Peer1', 'Peer2', 'Peer3', 'Peer4', 'Industry Avg', 'Source'],
            populatedMetrics.map((m: any) => {
              const opts = { unitHint: m.unit, valueType: m.value_type, currency: m.currency, tableMode: true };
              const fmt = (v: any) => isEmptyValue(v) ? '' : formatMetricValue(m.metric, v, opts);
              return [
                m.metric,
                fmt(m.company),
                fmt(m.peer1),
                fmt(m.peer2),
                fmt(m.peer3),
                fmt(m.peer4),
                fmt(m.industry_avg),
                m.source,
              ];
            })
          )
        );
      }
      if (hasStrengths) {
        parts.push('**Key Strengths**');
        parts.push(data.benchmark_summary.key_strengths.map((s: any) => `- ${s.strength}: ${s.description}`).join('\n'));
      }
      if (hasGaps) {
        parts.push('**Key Gaps**');
        parts.push(data.benchmark_summary.key_gaps.map((g: any) => `- ${g.gap} (${g.magnitude}): ${g.description}`).join('\n'));
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'sku_opportunities': {
      if (data.opportunities?.length) {
        return mdTable(
          ['Issue Area', 'Problem', 'Source', 'Aligned SKU', 'Priority', 'Severity', 'Geography', 'Value Levers'],
          data.opportunities.map((o: any) => [
            o.issue_area,
            o.public_problem,
            o.source,
            o.aligned_sku,
            o.priority,
            o.severity ?? '',
            o.geography_relevance,
            Array.isArray(o.potential_value_levers) ? o.potential_value_levers.join('; ') : ''
          ])
        );
      }
      return insufficientDataNotice(data.confidence?.reason);
    }
    case 'recent_news': {
      if (data.news_items?.length) {
        return mdTable(
          ['Date', 'Headline', 'Source', 'Implication', 'Geography', 'Category'],
          data.news_items.map((n: any) => [n.date, n.headline, n.source, n.implication, n.geography_relevance, n.category])
        );
      }
      return insufficientDataNotice(data.confidence?.reason);
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
      if (Array.isArray(data.source_references) && data.source_references.length) {
        parts.push('**Source References**');
        parts.push(mdTable(['ID', 'Citation', 'Type', 'Date', 'URL'], data.source_references.map((s: any) => [s.id, s.citation, s.type, s.date, s.url || ''])));
      }
      if (data.fx_rates_and_industry?.fx_rates?.length) {
        parts.push('**FX Rates**');
        parts.push(
          mdTable(
            ['Pair', 'Rate', 'Source', 'Description'],
            data.fx_rates_and_industry.fx_rates.map((r: any) => [
              r.currency_pair,
              r.rate != null ? formatNumber(r.rate) : '',
              resolveSourceLabel(r.source, FX_SOURCE_LABELS),
              r.source_description,
            ])
          )
        );
      }
      if (data.fx_rates_and_industry?.industry_averages) {
        const ia = data.fx_rates_and_industry.industry_averages;
        parts.push('**Industry Averages**');
        parts.push(`- Source: ${resolveSourceLabel(ia.source, INDUSTRY_SOURCE_LABELS)}\n- Dataset: ${ia.dataset}\n- Description: ${ia.description || ''}`);
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
