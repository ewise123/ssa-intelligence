import { useCallback, useEffect, useRef, useState } from 'react';
import { JobStatus, ReportBlueprint, ResearchJob, ResearchSection, ResearchSource, ReportType, SectionId, SectionStatus, SECTIONS_CONFIG, VisibilityScope } from '../types';
import { logger } from '../utils/logger';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

type ApiSectionStatus = {
  stage: string;
  status: string;
  confidence?: string | null;
  sourcesUsed?: string[];
  lastError?: string | null;
};

type ApiJobStatus = {
  id: string;
  status: string;
  queuePosition?: number;
  blockedByRunning?: boolean;
  error?: string | null;
  progress?: number | null;
  currentStage?: string | null;
  overallConfidence?: string | null;
  overallConfidenceScore?: number | null;
   promptTokens?: number | null;
   completionTokens?: number | null;
  costUsd?: number | null;

  createdAt?: string;
  updatedAt?: string;
  domain?: string | null;
  reportType?: ReportType;
  visibilityScope?: VisibilityScope;
  selectedSections?: string[];
  userAddedPrompt?: string | null;
  jobs?: ApiSectionStatus[];
  companyName?: string;
  geography?: string;
  industry?: string;
};

type ApiResearchDetail = {
  id: string;
  status: string;
  metadata?: Record<string, unknown>;
  overallConfidence?: string | null;
  overallConfidenceScore?: number | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  costUsd?: number | null;

  sections?: Record<string, unknown>;
  sectionsCompleted?: number[];
  sectionStatuses?: ApiSectionStatus[];
  domain?: string | null;
  groups?: Array<{ id: string; name: string; slug: string }>;
  userAddedPrompt?: string | null;
};

type ApiListItem = {
  id: string;
  status: string;
  metadata?: Record<string, unknown>;
  queuedAt?: string;
  createdAt?: string;
  companyName?: string;
  geography?: string;
  domain?: string | null;
  reportType?: ReportType;
  visibilityScope?: VisibilityScope;
  selectedSections?: string[];
  userAddedPrompt?: string | null;
  progress?: number | null;
  currentStage?: string | null;
  overallConfidence?: string | null;
  overallConfidenceScore?: number | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  costUsd?: number | null;

  generatedSections?: number[];
  groups?: Array<{ id: string; name: string; slug: string }>;
};

type ApiMe = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'MEMBER';
  isAdmin: boolean;
  isSuperAdmin: boolean;
  status: 'ACTIVE' | 'PENDING';
  groups: Array<{ id: string; name: string; slug: string }>;
};

type ApiGroup = {
  id: string;
  name: string;
  slug: string;
};

type ApiBlueprintResponse = {
  version: string;
  results: ReportBlueprint[];
};

const STAGE_TO_SECTION_ID: Record<string, SectionId> = {
  exec_summary: 'exec_summary',
  financial_snapshot: 'financial_snapshot',
  company_overview: 'company_overview',
  key_execs_and_board: 'key_execs_and_board',
  investment_strategy: 'investment_strategy',
  portfolio_snapshot: 'portfolio_snapshot',
  deal_activity: 'deal_activity',
  deal_team: 'deal_team',
  portfolio_maturity: 'portfolio_maturity',
  leadership_and_governance: 'leadership_and_governance',
  strategic_priorities: 'strategic_priorities',
  operating_capabilities: 'operating_capabilities',
  distribution_analysis: 'distribution_analysis',
  segment_analysis: 'segment_analysis',
  trends: 'trends',
  peer_benchmarking: 'peer_benchmarking',
  sku_opportunities: 'sku_opportunities',
  recent_news: 'recent_news',
  conversation_starters: 'conversation_starters',
  appendix: 'appendix',
};

const SECTION_ID_TO_KEY: Record<SectionId, string> = {
  exec_summary: 'exec_summary',
  financial_snapshot: 'financial_snapshot',
  company_overview: 'company_overview',
  key_execs_and_board: 'key_execs_and_board',
  investment_strategy: 'investment_strategy',
  portfolio_snapshot: 'portfolio_snapshot',
  deal_activity: 'deal_activity',
  deal_team: 'deal_team',
  portfolio_maturity: 'portfolio_maturity',
  leadership_and_governance: 'leadership_and_governance',
  strategic_priorities: 'strategic_priorities',
  operating_capabilities: 'operating_capabilities',
  distribution_analysis: 'distribution_analysis',
  segment_analysis: 'segment_analysis',
  trends: 'trends',
  peer_benchmarking: 'peer_benchmarking',
  sku_opportunities: 'sku_opportunities',
  recent_news: 'recent_news',
  conversation_starters: 'conversation_starters',
  appendix: 'appendix',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toSectionStatus = (status?: string): SectionStatus => {
  if (!status) return SectionStatus.PENDING;
  if (status === 'running') return SectionStatus.RUNNING;
  if (status === 'completed') return SectionStatus.COMPLETED;
  if (status === 'failed') return SectionStatus.FAILED;
  return SectionStatus.PENDING;
};

const confidenceToNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Math.max(0, Math.min(1, value > 1 ? value / 100 : value));
  }
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper === 'HIGH') return 0.9;
    if (upper === 'MEDIUM') return 0.6;
    if (upper === 'LOW') return 0.4;
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return Math.max(0, Math.min(1, parsed > 1 ? parsed / 100 : parsed));
  }
  if (value && typeof value === 'object' && 'level' in (value as Record<string, unknown>)) {
    return confidenceToNumber((value as { level?: unknown }).level);
  }
  return 0.6;
};

const stringifyContent = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return '';
};

// Metric formatting — imported from shared module
import { formatMetricValue, formatNumber } from '../utils/metric-formatter';

// Simple Markdown table builder
const normalizeCell = (cell: string | number | null | undefined): string => {
  if (cell === null || cell === undefined) return '';
  const s = String(cell).trim();
  // Normalize dash placeholders and N/A to blank for consistent empty-cell display
  if (s === '–' || s === '-' || s === '—' || /^n\/?a$/i.test(s)) return '';
  return s;
};

const mdTable = (headers: string[], rows: (string | number | null | undefined)[][]): string => {
  if (!rows.length) return '';
  const headerRow = `| ${headers.join(' | ')} |`;
  const sepRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows
    .map((r) => `| ${r.map(normalizeCell).join(' | ')} |`)
    .join('\n');
  return `${headerRow}\n${sepRow}\n${body}`;
};

/** Treat dashes, N/A, and similar placeholders as empty (no real data). */
const isEmptyValue = (v: any): boolean => {
  if (v == null || v === '') return true;
  if (typeof v === 'string') {
    const t = v.trim();
    if (t === '' || t === '–' || t === '-' || t === '—' || /^n\/?a$/i.test(t)) return true;
  }
  return false;
};

/** Strip inline source references like "(S10)", "(S1, S2)", or "(S1, Section 2)" from display values.
 *  Preserves any trailing period after the source ref. */
const stripInlineSource = (v: string): string =>
  v.replace(/\s*\((?:S\d+|Section\s+\d+)(?:,\s*(?:S\d+|Section\s+\d+))*\)(\.?)\s*$/, '$1').trim();

/** Detect placeholder names Claude fabricates when no real person can be identified. */
const isPlaceholderName = (name: string): boolean => {
  if (!name) return true;
  const t = name.trim().toLowerCase();
  return /not (publicly )?(available|disclosed|known|identified)/i.test(t) ||
    /information not available/i.test(t) ||
    /undisclosed/i.test(t) ||
    /unknown/i.test(t) ||
    t === '–' || t === '-' || t === '—' || /^n\/?a$/i.test(t);
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
  summary.replace(/\s*FX rate source:\s*[A-C]\.?\s*Industry average source:\s*[A-C]\.?\s*$/i, '').trim();

const insufficientDataNotice = (reason?: string): string => {
  const lines = ['> **Limited public information available**'];
  if (reason) lines.push('>', `> ${reason}`);
  return lines.join('\n');
};

// Section-specific content formatter to produce readable Markdown
const formatSectionContent = (sectionId: SectionId, data: any): string => {
  if (!data || typeof data !== 'object') return '';

  switch (sectionId) {
    case 'exec_summary': {
      const parts: string[] = [];
      if (Array.isArray(data.bullet_points)) {
        parts.push('\n**Key Takeaways**');
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
      if (data.summary) parts.push(stripSourceMetadata(data.summary));
      if (data.kpi_table?.metrics?.length) {
        const populatedMetrics = data.kpi_table.metrics.filter((m: any) =>
          !isEmptyValue(m.company) || !isEmptyValue(m.industry_avg)
        );
        if (populatedMetrics.length) {
          parts.push('\n**KPI Table**');
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
        parts.push('\n**Derived Metrics**');
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
        parts.push('\n**Segments**');
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
      if (Array.isArray(data.geographic_footprint?.facilities)) {
        parts.push('\n**Facilities**');
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
        parts.push('\n**Strategic Priorities**');
        for (const p of data.strategic_priorities.priorities) {
          parts.push(`**${p.priority}**\n${p.description}`);
        }
      }
      if (data.key_leadership) {
        const execs = data.key_leadership.executives || [];
        const regionals = data.key_leadership.regional_leaders || [];
        if (execs.length) {
          parts.push('\n**Executives**');
          parts.push(
            execs.map((e: any) => `- ${e.name}, ${e.title}${e.tenure ? ` (${e.tenure})` : ''}${e.source ? ` [${e.source}]` : ''}`).join('\n')
          );
        } else {
          parts.push('**Key Leadership**');
          parts.push(insufficientDataNotice(data.key_leadership?.summary || data.confidence?.reason));
        }
        if (regionals.length) {
          parts.push('\n**Regional Leaders**');
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
      if (data.c_suite?.summary) parts.push(`\n**C-Suite Leadership**\n${data.c_suite.summary}`);
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
      if (data.business_unit_leaders?.summary) parts.push(`\n**Business Unit Leaders**\n${data.business_unit_leaders.summary}`);
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
        parts.push('\n**Recent Leadership Changes**');
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
      if (data.summary) parts.push(data.summary);
      if (Array.isArray(data.channels) && data.channels.length) {
        parts.push('\n**Distribution Channels**');
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
        parts.push('\n**Distribution Costs**');
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
        parts.push('\n**Digital Capabilities**');
        const caps = data.digital_capabilities;
        const capsList: string[] = [];
        if (caps.online_quoting) capsList.push('Online Quoting');
        if (caps.self_service_portal) capsList.push('Self-Service Portal');
        if (caps.mobile_app) capsList.push('Mobile App');
        if (capsList.length) parts.push(`- Features: ${capsList.join(', ')}`);
        if (caps.notes) parts.push(`\n${caps.notes}`);
      }
      if (data.competitive_positioning) {
        parts.push('\n**Competitive Positioning**');
        parts.push(data.competitive_positioning);
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
      if (data.overview) parts.push(data.overview);
      if (!data.segments?.length && !data.overview) {
        parts.push(insufficientDataNotice(data.confidence?.reason));
      }
      if (Array.isArray(data.segments)) {
        data.segments.forEach((seg: any) => {
          parts.push(`\n### ${seg.name}`);
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
        parts.push('\n**Metrics**');
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
        parts.push('\n**Key Strengths**');
        parts.push(data.benchmark_summary.key_strengths.map((s: any) => `- ${s.strength}: ${s.description}`).join('\n'));
      }
      if (hasGaps) {
        parts.push('\n**Key Gaps**');
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
      if (Array.isArray(data.source_references)) {
        parts.push('**Source References**');
        parts.push(mdTable(['ID', 'Citation', 'Type', 'Date', 'URL'], data.source_references.map((s: any) => [s.id, s.citation, s.type, s.date, s.url || ''])));
      }
      if (data.fx_rates_and_industry?.fx_rates?.length) {
        parts.push('\n**FX Rates**');
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
        parts.push('\n**Industry Averages**');
        parts.push(`- Source: ${resolveSourceLabel(ia.source, INDUSTRY_SOURCE_LABELS)}\n- Dataset: ${ia.dataset}\n- Description: ${ia.description || ''}`);
      }
      return parts.filter(Boolean).join('\n\n');
    }
    default:
      return '';
  }
};

const extractSources = (sectionData: unknown, statusSources?: string[]): ResearchSource[] => {
  // First, check if the section data has resolved sources from the API (with proper URLs)
  if (sectionData && typeof sectionData === 'object') {
    const data = sectionData as Record<string, unknown>;

    // Use resolved sources from API if available (these have proper URLs)
    const resolvedSources = data.sources as Array<{
      id?: string;
      title?: string;
      url?: string;
      isGeneratedUrl?: boolean;
    }>;
    if (Array.isArray(resolvedSources) && resolvedSources.length > 0) {
      return resolvedSources.map((s) => ({
        id: s.id,
        title: s.title || s.id || 'Source',
        url: s.url || '#',
        isGeneratedUrl: s.isGeneratedUrl,
      }));
    }

    // Fallback: try source_catalog (for foundation data)
    const catalog = data.source_catalog as Array<{ id?: string; citation?: string; url?: string }>;
    if (Array.isArray(catalog) && catalog.length > 0) {
      return catalog.map((item) => ({
        title: item.citation || item.id || 'Source',
        url: item.url || '#',
      }));
    }
  }

  // Last resort fallback: create placeholder sources from IDs
  const sources: ResearchSource[] = [];
  if (statusSources && statusSources.length) {
    statusSources.forEach((s) => sources.push({ title: s, url: '#' }));
  }
  return sources;
};

const buildEmptySections = (): Record<SectionId, ResearchSection> => {
  return SECTIONS_CONFIG.reduce((acc, config) => {
    acc[config.id] = {
      id: config.id,
      title: config.title,
      status: SectionStatus.PENDING,
      content: '',
      confidence: 0,
      sources: [],
    };
    return acc;
  }, {} as Record<SectionId, ResearchSection>);
};

const fetchJson = async (path: string, options?: RequestInit) => {
  const url = `${API_BASE.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
};

const createJobApi = async (payload: {
  companyName: string;
  geography: string;
  industry?: string;
  force?: boolean;
  reportType?: ReportType;
  selectedSections?: SectionId[];
  userAddedPrompt?: string;
  visibilityScope?: VisibilityScope;
  groupIds?: string[];
  blueprintVersion?: string;
  reportInputs?: Record<string, string>;
  draftId?: string;
}) => {
  const body = {
    companyName: payload.companyName,
    geography: payload.geography,
    focusAreas: payload.industry ? [payload.industry] : undefined,
    requestedBy: 'web-user',
    force: !!payload.force,
    reportType: payload.reportType,
    blueprintVersion: payload.blueprintVersion,
    reportInputs: payload.reportInputs,
    selectedSections: payload.selectedSections,
    userAddedPrompt: payload.userAddedPrompt,
    visibilityScope: payload.visibilityScope,
    groupIds: payload.groupIds,
    draftId: payload.draftId
  };

  const res = await fetch(
    `${API_BASE}/research/generate`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );

  if (res.status === 409) {
    let body: any = {};
    try {
      body = await res.json();
    } catch (_) {}
    throw {
      duplicate: true,
      jobId: body?.jobId,
      status: body?.status,
      message: body?.error || 'Research already exists for this company/geography/industry.'
    };
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as { jobId: string; status: string; queuePosition?: number };
};

const listJobsApi = async () => {
  const data = (await fetchJson('/research')) as { results?: ApiListItem[] };
  return data.results || [];
};

const getJobStatusApi = async (id: string) => {
  return (await fetchJson(`/research/jobs/${id}`)) as ApiJobStatus;
};

const getJobDetailApi = async (id: string) => {
  return (await fetchJson(`/research/${id}`)) as ApiResearchDetail;
};

const rerunJobApi = async (id: string, sections: SectionId[]) => {
  return fetchJson(`/research/${id}/rerun`, {
    method: 'POST',
    body: JSON.stringify({ sections })
  }) as Promise<{ success: boolean; jobId: string; status: string; rerunStages?: string[] }>;
};

const cancelJobApi = async (id: string) => {
  return fetchJson(`/research/${id}/cancel`, {
    method: 'POST'
  }) as Promise<{ success: boolean; status: string }>;
};

const deleteJobApi = async (id: string) => {
  return fetchJson(`/research/${id}`, {
    method: 'DELETE'
  }) as Promise<{ success: boolean; jobId: string }>;
};

const getMeApi = async () => {
  return (await fetchJson('/me')) as ApiMe;
};

const listGroupsApi = async () => {
  const data = (await fetchJson('/groups')) as { results?: ApiGroup[] };
  return data.results || [];
};

const listReportBlueprintsApi = async () => {
  return (await fetchJson('/report-blueprints')) as ApiBlueprintResponse;
};

const mapSections = (
  statuses?: ApiSectionStatus[],
  sectionData?: Record<string, unknown>,
  existing?: Record<SectionId, ResearchSection>,
  selectedSections?: SectionId[],
): Record<SectionId, ResearchSection> => {
  const statusMap = new Map<string, ApiSectionStatus>();
  (statuses || []).forEach((s) => statusMap.set(s.stage, s));

  const sectionSet = new Set<SectionId>(selectedSections || SECTIONS_CONFIG.map((section) => section.id));

  return SECTIONS_CONFIG.reduce((acc, config) => {
    const stage = Object.keys(STAGE_TO_SECTION_ID).find((k) => STAGE_TO_SECTION_ID[k] === config.id);
    const rawStatus = stage ? statusMap.get(stage) : undefined;
    const sectionKey = SECTION_ID_TO_KEY[config.id];
    const rawSection = sectionKey && sectionData ? sectionData[sectionKey] : undefined;
    const existingSection = existing?.[config.id];
    let formattedContent = rawSection !== undefined ? formatSectionContent(config.id, rawSection) : undefined;
    // Fallback: if formatter returned empty string, try raw JSON stringify to avoid blank sections
    if (formattedContent !== undefined && formattedContent.trim() === '' && rawSection !== undefined) {
      try {
        formattedContent = JSON.stringify(rawSection, null, 2);
      } catch {
        formattedContent = '';
      }
    }

    acc[config.id] = {
      id: config.id,
      title: config.title,
      status: sectionSet.has(config.id)
        ? toSectionStatus(rawStatus?.status || existingSection?.status)
        : SectionStatus.PENDING,
      content: formattedContent !== undefined ? formattedContent : existingSection?.content || '',
      confidence: confidenceToNumber(
        rawStatus?.confidence ??
          (rawSection as { confidence?: unknown })?.confidence ??
          (rawSection as { confidence?: { level?: unknown } })?.confidence?.level ??
          existingSection?.confidence,
      ),
      sources: sectionSet.has(config.id)
        ? extractSources(rawSection, rawStatus?.sourcesUsed) || existingSection?.sources || []
        : [],
      lastError: rawStatus?.lastError || existingSection?.lastError,
      updatedAt: rawSection ? Date.now() : existingSection?.updatedAt,
    };

    return acc;
  }, {} as Record<SectionId, ResearchSection>);
};

  const mapListItem = (item: ApiListItem): ResearchJob => {
    const metadata = (item.metadata as Record<string, unknown>) || {};
    const generated = item.generatedSections || [];
    const fallbackTotal = item.selectedSections?.length || 10;
    const progress = item.progress !== null && item.progress !== undefined
      ? Math.round(item.progress * 100)
      : (generated.length ? Math.round((generated.length / fallbackTotal) * 100) : 0);
    const status = (item.status as JobStatus) || 'idle';
  const currentAction = status === 'queued' ? 'Queued...' : '';

  return {
    id: item.id,
    companyName: (metadata.companyName as string) || item.companyName || 'Unknown Company',
    geography: (metadata.geography as string) || item.geography || 'Unknown',
    industry: (metadata.industry as string) || undefined,
    domain: (metadata.domain as string) || item.domain || null,
    reportType: (metadata.reportType as ReportType) || item.reportType || undefined,
    visibilityScope: (metadata.visibilityScope as VisibilityScope) || item.visibilityScope || undefined,
    selectedSections: (metadata.selectedSections as SectionId[]) || (item.selectedSections as SectionId[]) || undefined,
    groups: item.groups || [],
    userAddedPrompt: (metadata.userAddedPrompt as string) || item.userAddedPrompt || null,
    queuePosition: null,
    overallConfidence: (metadata.overallConfidence as string) || item.overallConfidence || null,
    overallConfidenceScore:
      (metadata.overallConfidenceScore as number) ?? item.overallConfidenceScore ?? null,
    promptTokens: item.promptTokens ?? null,
    completionTokens: item.completionTokens ?? null,
    costUsd: item.costUsd ?? null,
    createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
    status,
    progress,
    currentAction,
    sections: buildEmptySections(),
  };
};

const mapJobFromStatus = (
  status: ApiJobStatus,
  existing?: ResearchJob,
  overrides?: Partial<ResearchJob>,
): ResearchJob => {
  const sections = mapSections(status.jobs, undefined, existing?.sections, (status.selectedSections as SectionId[]) ?? existing?.selectedSections);
  const queuePosition = status.queuePosition ?? existing?.queuePosition ?? null;
  const derivedStatus = (status.status as JobStatus) || existing?.status || 'running';
  let currentAction = existing?.currentAction || '';

  // If the job is already cancelled locally, don't overwrite it with non-cancelled updates
  if (existing?.status === 'cancelled' && derivedStatus !== 'cancelled') {
    return existing;
  }

  if (derivedStatus === 'queued') {
    currentAction = queuePosition && queuePosition > 1
      ? 'Queued behind other jobs (active jobs may be private)'
      : 'Queued...';
  } else if (derivedStatus === 'running') {
    currentAction = status.currentStage ? `Running ${status.currentStage}` : existing?.currentAction || '';
  } else if (derivedStatus === 'cancelled') {
    currentAction = 'Cancelled';
  }

  return {
    id: status.id,
    companyName: overrides?.companyName || existing?.companyName || 'Unknown Company',
    geography: overrides?.geography || existing?.geography || 'Unknown',
    industry: overrides?.industry ?? existing?.industry,
    domain: status.domain ?? existing?.domain ?? null,
    reportType: status.reportType ?? existing?.reportType,
    visibilityScope: status.visibilityScope ?? existing?.visibilityScope,
    selectedSections: (status.selectedSections as SectionId[]) ?? existing?.selectedSections,
    userAddedPrompt: status.userAddedPrompt ?? existing?.userAddedPrompt ?? null,
    queuePosition,
    overallConfidence: status.overallConfidence ?? existing?.overallConfidence ?? null,
    overallConfidenceScore: status.overallConfidenceScore ?? existing?.overallConfidenceScore ?? null,
    promptTokens: status.promptTokens ?? existing?.promptTokens ?? null,
    completionTokens: status.completionTokens ?? existing?.completionTokens ?? null,
    costUsd: status.costUsd ?? existing?.costUsd ?? null,
    createdAt: status.createdAt ? new Date(status.createdAt).getTime() : existing?.createdAt || Date.now(),
    status: derivedStatus,
    progress: status.progress !== undefined && status.progress !== null ? Math.round(status.progress * 100) : existing?.progress || 0,
    currentAction: currentAction || existing?.currentAction || '',
    sections,
  };
};

const mergeDetail = (job: ResearchJob, detail: ApiResearchDetail): ResearchJob => {
  const metadata = (detail.metadata as Record<string, unknown>) || {};
  const sections = mapSections(detail.sectionStatuses, detail.sections, job.sections, job.selectedSections);

  return {
    ...job,
    status: (detail.status as JobStatus) || job.status,
    companyName: (metadata.companyName as string) || job.companyName,
    geography: (metadata.geography as string) || job.geography,
    industry: (metadata.industry as string) || job.industry,
    domain: (metadata.domain as string) || job.domain,
    reportType: (metadata.reportType as ReportType) || job.reportType,
    visibilityScope: (metadata.visibilityScope as VisibilityScope) || job.visibilityScope,
    selectedSections: (metadata.selectedSections as SectionId[]) || job.selectedSections,
    groups: detail.groups ?? job.groups ?? [],
    userAddedPrompt: (metadata.userAddedPrompt as string) || detail.userAddedPrompt || job.userAddedPrompt || null,
    overallConfidence:
      (metadata.overallConfidence as string) || detail.overallConfidence || job.overallConfidence || null,
    overallConfidenceScore:
      (metadata.overallConfidenceScore as number) ??
      detail.overallConfidenceScore ??
      job.overallConfidenceScore ??
      null,
    promptTokens: detail.promptTokens ?? job.promptTokens ?? null,
    completionTokens: detail.completionTokens ?? job.completionTokens ?? null,
    costUsd: detail.costUsd ?? job.costUsd ?? null,
    sections,
  };
};

export const useResearchManager = () => {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [loading, setLoading] = useState(true);
  const activeJobsRef = useRef<Set<string>>(new Set());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  useEffect(() => {
    listJobsApi()
      .then(async (items) => {
        setJobs(items.map(mapListItem));
        const completed = items.filter((i) =>
          i.status === 'completed' || i.status === 'completed_with_errors'
        );
        for (const item of completed) {
          try {
            const detail = await getJobDetailApi(item.id);
            setJobs((prev) => {
              const existing = prev.find((j) => j.id === item.id) || mapListItem(item);
              const merged = mergeDetail(existing, detail);
              return [merged, ...prev.filter((j) => j.id !== item.id)];
            });
          } catch (err) {
            logger.error(err);
          }
        }
      })
      .catch((err) => logger.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Abort all polling loops on unmount to prevent orphaned requests
  useEffect(() => {
    return () => {
      for (const controller of abortControllersRef.current.values()) {
        controller.abort();
      }
    };
  }, []);

  const createJob = useCallback(async (
    companyName: string,
    geography: string,
    industry: string,
    options?: {
      force?: boolean;
      reportType?: ReportType;
      selectedSections?: SectionId[];
      visibilityScope?: VisibilityScope;
      groupIds?: string[];
      userAddedPrompt?: string;
      blueprintVersion?: string;
      reportInputs?: Record<string, string>;
      draftId?: string;
    }
  ) => {
    const res = await createJobApi({
      companyName,
      geography: geography || 'Global',
      industry,
      force: options?.force,
      reportType: options?.reportType,
      selectedSections: options?.selectedSections,
      visibilityScope: options?.visibilityScope,
      groupIds: options?.groupIds,
      userAddedPrompt: options?.userAddedPrompt,
      blueprintVersion: options?.blueprintVersion,
      reportInputs: options?.reportInputs,
      draftId: options?.draftId
    });
    const job: ResearchJob = {
      id: res.jobId,
      companyName,
      geography: geography || 'Global',
      industry,
      reportType: options?.reportType,
      visibilityScope: options?.visibilityScope,
      selectedSections: options?.selectedSections,
      groupIds: options?.groupIds,
      userAddedPrompt: options?.userAddedPrompt || null,
      queuePosition: res.queuePosition ?? 1,
      promptTokens: 0,
      completionTokens: 0,
      costUsd: 0,
      domain: undefined,
      createdAt: Date.now(),
      status: 'queued',
      progress: 0,
      currentAction: res.queuePosition && res.queuePosition > 1
        ? 'Queued behind other jobs (active jobs may be private)'
        : 'Queued...',
      sections: buildEmptySections(),
    };

    setJobs((prev) => [job, ...prev.filter((j) => j.id !== job.id)]);
    return job.id;
  }, []);

  const runJob = useCallback(
    async (jobId: string, companyNameOverride?: string) => {
      if (activeJobsRef.current.has(jobId)) return;
      activeJobsRef.current.add(jobId);
      const controller = new AbortController();
      abortControllersRef.current.set(jobId, controller);
      let lastStatus: ApiJobStatus | null = null;

      try {
        while (!controller.signal.aborted) {
          const status = await getJobStatusApi(jobId);
          if (controller.signal.aborted) break;
          lastStatus = status;

          setJobs((prev) => {
            const existing = prev.find((j) => j.id === jobId);
            const next = mapJobFromStatus(status, existing, companyNameOverride ? { companyName: companyNameOverride } : undefined);
            return [next, ...prev.filter((j) => j.id !== jobId)];
          });

          if (
            status.status === 'completed' ||
            status.status === 'completed_with_errors' ||
            status.status === 'failed' ||
            status.status === 'cancelled'
          ) {
            break;
          }

          await delay(2000);
        }

        if (controller.signal.aborted) return;
        const detail = await getJobDetailApi(jobId);
        if (controller.signal.aborted) return;
        setJobs((prev) => {
          const existing = prev.find((j) => j.id === jobId) || (lastStatus ? mapJobFromStatus(lastStatus, undefined, companyNameOverride ? { companyName: companyNameOverride } : undefined) : undefined);
          if (!existing) return prev;
          const merged = mergeDetail(existing, detail);
          return [merged, ...prev.filter((j) => j.id !== jobId)];
        });
      } catch (error) {
        logger.error(error);
        if (error instanceof Error && error.message.includes('Job not found')) {
          setJobs((prev) => prev.filter((j) => j.id !== jobId));
          return;
        }
        setJobs((prev) => {
          const existing = prev.find((j) => j.id === jobId);
          const fallback: ResearchJob =
            existing || {
              id: jobId,
              companyName: companyNameOverride || 'Unknown Company',
              geography: 'Unknown',
              createdAt: Date.now(),
              status: 'failed',
              progress: 0,
              currentAction: 'An error occurred during processing.',
              sections: buildEmptySections(),
            };
          return [
            { ...fallback, status: 'failed', currentAction: 'An error occurred during processing.' },
            ...prev.filter((j) => j.id !== jobId),
          ];
        });
      } finally {
        activeJobsRef.current.delete(jobId);
        abortControllersRef.current.delete(jobId);
      }
    },
    [],
  );

  const rerunJob = useCallback(
    async (jobId: string, sections: SectionId[]) => {
      const response = await rerunJobApi(jobId, sections);
      const rerunStages = response.rerunStages || sections;

      setJobs((prev) =>
        prev.map((job) => {
          if (job.id !== jobId) return job;
          const nextSections = { ...job.sections };

          rerunStages.forEach((stage) => {
            const sectionId = STAGE_TO_SECTION_ID[stage] || (stage as SectionId);
            const existing = nextSections[sectionId];
            if (!existing) return;
            nextSections[sectionId] = {
              ...existing,
              status: SectionStatus.PENDING,
              content: '',
              confidence: 0,
              sources: [],
              lastError: undefined,
            };
          });

          return {
            ...job,
            status: 'queued',
            currentAction: 'Queued...',
            sections: nextSections,
          };
        })
      );

      await runJob(jobId);
    },
    [runJob],
  );

  const cancelJob = useCallback(async (jobId: string) => {
    try {
      await cancelJobApi(jobId);
      // Abort the polling loop only after successful cancel
      const controller = abortControllersRef.current.get(jobId);
      if (controller) controller.abort();
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, status: 'cancelled' as JobStatus, currentAction: 'Cancelled' }
            : j
        )
      );
    } catch (error) {
      logger.error('Failed to cancel job', error);
      throw error;
    }
  }, []);

  const deleteJob = useCallback(async (jobId: string) => {
    await deleteJobApi(jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    activeJobsRef.current.delete(jobId);
  }, []);

  const refreshJobDetail = useCallback(async (jobId: string) => {
    try {
      const detail = await getJobDetailApi(jobId);
      setJobs((prev) => {
        const existing = prev.find((j) => j.id === jobId);
        if (!existing) return prev;
        const merged = mergeDetail(existing, detail);
        return prev.map((j) => (j.id === jobId ? merged : j));
      });
    } catch (err) {
      logger.error('[refreshJobDetail]', err);
    }
  }, []);

  return { jobs, loading, createJob, runJob, rerunJob, cancelJob, deleteJob, refreshJobDetail };
};

export const useUserContext = () => {
  const [user, setUser] = useState<ApiMe | null>(null);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [me, availableGroups] = await Promise.allSettled([
      getMeApi(),
      listGroupsApi()
    ]);
    if (me.status === 'fulfilled') setUser(me.value);
    if (availableGroups.status === 'fulfilled') setGroups(availableGroups.value);
  };

  useEffect(() => {
    let mounted = true;

    // Fetch user and groups independently so a groups 403 (pending user)
    // doesn't prevent user data from loading.
    const mePromise = getMeApi()
      .then((me) => { if (mounted) setUser(me); })
      .catch((err) => logger.error(err));

    listGroupsApi()
      .then((availableGroups) => { if (mounted) setGroups(availableGroups); })
      .catch((err) => logger.error(err));

    mePromise.finally(() => { if (mounted) setLoading(false); });

    return () => {
      mounted = false;
    };
  }, []);

  const refresh = async () => {
    await fetchAll();
  };

  return { user, groups, loading, refresh };
};

export const useReportBlueprints = () => {
  const [blueprints, setBlueprints] = useState<ReportBlueprint[]>([]);
  const [version, setVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listReportBlueprintsApi()
      .then((data) => {
        if (!mounted) return;
        setBlueprints(data.results || []);
        setVersion(data.version || null);
      })
      .catch((err) => logger.error(err))
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { blueprints, version, loading };
};

// ============================================================================
// COMPANY RESOLUTION API
// ============================================================================

export type CompanySuggestion = {
  canonicalName: string;
  displayName: string;
  description: string;
  domain?: string;
  industry?: string;
  matchScore: number;
};

export type CompanyResolveResponse = {
  status: 'exact' | 'corrected' | 'ambiguous' | 'unknown';
  input: string;
  suggestions: CompanySuggestion[];
  confidence: number;
};

export const resolveCompanyApi = async (
  input: string,
  context?: { geography?: string; industry?: string; reportType?: string },
  draftId?: string
): Promise<CompanyResolveResponse> => {
  const res = await fetch(`${API_BASE}/company/resolve`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, context, draftId })
  });
  if (!res.ok) {
    throw new Error('Failed to resolve company');
  }
  return res.json();
};
