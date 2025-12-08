import { useCallback, useEffect, useRef, useState } from 'react';
import { JobStatus, ResearchJob, ResearchSection, ResearchSource, SectionId, SectionStatus, SECTIONS_CONFIG } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

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
  error?: string | null;
  progress?: number | null;
  currentStage?: string | null;
  overallConfidence?: string | null;
  overallConfidenceScore?: number | null;
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
  sections?: Record<string, unknown>;
  sectionsCompleted?: number[];
  sectionStatuses?: ApiSectionStatus[];
};

type ApiListItem = {
  id: string;
  status: string;
  metadata?: Record<string, unknown>;
  companyName?: string;
  geography?: string;
  overallConfidence?: string | null;
  overallConfidenceScore?: number | null;
  generatedSections?: number[];
};

const STAGE_TO_SECTION_ID: Record<string, SectionId> = {
  section_1: 'exec_summary',
  section_2: 'financial_snapshot',
  section_3: 'company_overview',
  section_4: 'segment_analysis',
  section_5: 'trends',
  section_6: 'peer_benchmarking',
  section_7: 'sku_opportunities',
  section_8: 'recent_news',
  section_9: 'conversation_starters',
  section_10: 'appendix',
};

const SECTION_ID_TO_KEY: Record<SectionId, string> = {
  exec_summary: 'exec_summary',
  financial_snapshot: 'financial_snapshot',
  company_overview: 'company_overview',
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

// Numeric formatting helpers
const formatNumber = (value: number): string => {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const formatCurrency = (value: number, currency: string = 'USD'): string => {
  // Default: USD with grouping, allow other currency codes if provided
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: Math.abs(value) >= 1000 ? 0 : 2,
  });
};

const formatPercent = (value: number): string => {
  // Accept raw percent (e.g., 12.3) or ratio (e.g., 0.123); pick sensible format
  const asRatio = Math.abs(value) <= 1 ? value * 100 : value;
  return `${asRatio.toFixed(1)}%`;
};

const formatValue = (raw: any): string => {
  if (raw === null || raw === undefined) return '';
  // Already a string, try to detect currency/percent patterns; otherwise return as-is
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    // Handle suffixes like M/B for millions/billions with optional leading $
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

// Simple Markdown table builder
const mdTable = (headers: string[], rows: (string | number | null | undefined)[][]): string => {
  if (!rows.length) return '';
  const headerRow = `| ${headers.join(' | ')} |`;
  const sepRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows
    .map((r) => `| ${r.map((cell) => (cell === null || cell === undefined ? '' : String(cell))).join(' | ')} |`)
    .join('\n');
  return `${headerRow}\n${sepRow}\n${body}`;
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
            .map((b: any) => `- ${b.bullet || ''}${b.sources ? ` (${(b.sources || []).join(', ')})` : ''}`)
            .join('\n')
        );
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'financial_snapshot': {
      const parts: string[] = [];
      if (data.summary) parts.push(data.summary);
      if (data.kpi_table?.metrics?.length) {
        parts.push('\n**KPI Table**');
        parts.push(
          mdTable(
            ['Metric', 'Company', 'Industry Avg', 'Source'],
            data.kpi_table.metrics.map((m: any) => {
              const metricName = m.unit ? `${m.metric} (${m.unit})` : m.metric;
              return [
                metricName,
                formatValue(m.company),
                formatValue(m.industry_avg),
                m.source || '',
              ];
            })
          )
        );
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
      return parts.filter(Boolean).join('\n\n');
    }
    case 'company_overview': {
      const parts: string[] = [];
      if (data.business_description?.overview) parts.push(`**Overview**\n${data.business_description.overview}`);
      if (Array.isArray(data.business_description?.segments)) {
        parts.push('\n**Segments**');
        parts.push(
          mdTable(
            ['Name', 'Description', 'Revenue %', 'Geography Relevance'],
            data.business_description.segments.map((s: any) => [s.name, s.description, s.revenue_pct, s.geography_relevance])
          )
        );
      }
      if (Array.isArray(data.geographic_footprint?.facilities)) {
        parts.push('\n**Facilities**');
        parts.push(
          mdTable(
            ['Name', 'Location', 'Type', 'Employees', 'Capabilities'],
            data.geographic_footprint.facilities.map((f: any) => [f.name, f.location, f.type, f.employees, f.capabilities])
          )
        );
      }
      if (data.strategic_priorities?.priorities?.length) {
        parts.push('\n**Strategic Priorities**');
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
          parts.push('\n**Executives**');
          parts.push(
            execs.map((e: any) => `- ${e.name}, ${e.title}${e.tenure ? ` (${e.tenure})` : ''}${e.source ? ` [${e.source}]` : ''}`).join('\n')
          );
        }
        if (regionals.length) {
          parts.push('\n**Regional Leaders**');
          parts.push(regionals.map((e: any) => `- ${e.name}, ${e.title}${e.source ? ` [${e.source}]` : ''}`).join('\n'));
        }
      }
      return parts.filter(Boolean).join('\n\n');
    }
    case 'segment_analysis': {
      const parts: string[] = [];
      if (data.overview) parts.push(data.overview);
      if (Array.isArray(data.segments)) {
        data.segments.forEach((seg: any) => {
          parts.push(`\n### ${seg.name}`);
          if (seg.financial_snapshot?.table?.length) {
            parts.push(
              mdTable(
                ['Metric', 'Segment', 'Company Avg', 'Industry Avg', 'Source'],
                seg.financial_snapshot.table.map((m: any) => {
                  const metricName = m.unit ? `${m.metric} (${m.unit})` : m.metric;
                  return [
                    metricName,
                    m.segment,
                    formatValue(m.company_avg),
                    formatValue(m.industry_avg),
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
        parts.push('\n**Metrics**');
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
        parts.push('\n**Key Strengths**');
        parts.push(data.benchmark_summary.key_strengths.map((s: any) => `- ${s.strength}: ${s.description}`).join('\n'));
      }
      if (data.benchmark_summary?.key_gaps?.length) {
        parts.push('\n**Key Gaps**');
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
        parts.push('\n**FX Rates**');
        parts.push(
          mdTable(
            ['Pair', 'Rate', 'Source', 'Description'],
            data.fx_rates_and_industry.fx_rates.map((r: any) => [r.currency_pair, r.rate, r.source, r.source_description])
          )
        );
      }
      if (data.fx_rates_and_industry?.industry_averages) {
        const ia = data.fx_rates_and_industry.industry_averages;
        parts.push('\n**Industry Averages**');
        parts.push(`- Source: ${ia.source}\n- Dataset: ${ia.dataset}\n- Description: ${ia.description || ''}`);
      }
      return parts.filter(Boolean).join('\n\n');
    }
    default:
      return '';
  }
};

const extractSources = (sectionData: unknown, statusSources?: string[]): ResearchSource[] => {
  const sources: ResearchSource[] = [];
  const appendId = (id: string) => sources.push({ title: id, url: '#' });

  if (statusSources && statusSources.length) {
    statusSources.forEach((s) => appendId(s));
  }

  if (sectionData && typeof sectionData === 'object') {
    const data = sectionData as Record<string, unknown>;
    const used = (data.sources_used as string[]) || [];
    used.forEach((s) => appendId(s));

    const catalog = data.source_catalog as Array<{ id?: string; citation?: string; url?: string }>;
    if (Array.isArray(catalog)) {
      catalog.forEach((item) => {
        if (item?.id) {
          sources.push({ title: item.id, url: item.url || '#' });
        }
      });
    }
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
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
};

const createJobApi = async (companyName: string, geography: string, industry?: string) => {
  return fetchJson('/research/generate', {
    method: 'POST',
    body: JSON.stringify({
      companyName,
      geography,
      focusAreas: industry ? [industry] : undefined,
      requestedBy: 'web-user',
    }),
  }) as Promise<{ jobId: string; status: string }>;
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

const mapSections = (
  statuses?: ApiSectionStatus[],
  sectionData?: Record<string, unknown>,
  existing?: Record<SectionId, ResearchSection>,
): Record<SectionId, ResearchSection> => {
  const statusMap = new Map<string, ApiSectionStatus>();
  (statuses || []).forEach((s) => statusMap.set(s.stage, s));

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
      status: toSectionStatus(rawStatus?.status || existingSection?.status),
      content: formattedContent !== undefined ? formattedContent : existingSection?.content || '',
      confidence: confidenceToNumber(
        rawStatus?.confidence ??
          (rawSection as { confidence?: unknown })?.confidence ??
          (rawSection as { confidence?: { level?: unknown } })?.confidence?.level ??
          existingSection?.confidence,
      ),
      sources: extractSources(rawSection, rawStatus?.sourcesUsed) || existingSection?.sources || [],
      lastError: rawStatus?.lastError || existingSection?.lastError,
      updatedAt: rawSection ? Date.now() : existingSection?.updatedAt,
    };

    return acc;
  }, {} as Record<SectionId, ResearchSection>);
};

const mapListItem = (item: ApiListItem): ResearchJob => {
  const metadata = (item.metadata as Record<string, unknown>) || {};
  const generated = item.generatedSections || [];
  const progress = generated.length ? Math.round((generated.length / 10) * 100) : 0;

  return {
    id: item.id,
    companyName: (metadata.companyName as string) || item.companyName || 'Unknown Company',
    geography: (metadata.geography as string) || item.geography || 'Unknown',
    industry: (metadata.industry as string) || undefined,
    overallConfidence: (metadata.overallConfidence as string) || item.overallConfidence || null,
    overallConfidenceScore:
      (metadata.overallConfidenceScore as number) ?? item.overallConfidenceScore ?? null,
    createdAt: Date.now(),
    status: (item.status as JobStatus) || 'idle',
    progress,
    currentAction: '',
    sections: buildEmptySections(),
  };
};

const mapJobFromStatus = (
  status: ApiJobStatus,
  existing?: ResearchJob,
  overrides?: Partial<ResearchJob>,
): ResearchJob => {
  const sections = mapSections(status.jobs, undefined, existing?.sections);
  return {
    id: status.id,
    companyName: overrides?.companyName || existing?.companyName || 'Unknown Company',
    geography: overrides?.geography || existing?.geography || 'Unknown',
    industry: overrides?.industry ?? existing?.industry,
    overallConfidence: status.overallConfidence ?? existing?.overallConfidence ?? null,
    overallConfidenceScore: status.overallConfidenceScore ?? existing?.overallConfidenceScore ?? null,
    createdAt: existing?.createdAt || Date.now(),
    status: (status.status as JobStatus) || existing?.status || 'running',
    progress: status.progress !== undefined && status.progress !== null ? Math.round(status.progress * 100) : existing?.progress || 0,
    currentAction: status.currentStage ? `Running ${status.currentStage}` : existing?.currentAction || '',
    sections,
  };
};

const mergeDetail = (job: ResearchJob, detail: ApiResearchDetail): ResearchJob => {
  const metadata = (detail.metadata as Record<string, unknown>) || {};
  const sections = mapSections(detail.sectionStatuses, detail.sections, job.sections);

  return {
    ...job,
    status: (detail.status as JobStatus) || job.status,
    companyName: (metadata.companyName as string) || job.companyName,
    geography: (metadata.geography as string) || job.geography,
    industry: (metadata.industry as string) || job.industry,
    overallConfidence:
      (metadata.overallConfidence as string) || detail.overallConfidence || job.overallConfidence || null,
    overallConfidenceScore:
      (metadata.overallConfidenceScore as number) ??
      detail.overallConfidenceScore ??
      job.overallConfidenceScore ??
      null,
    sections,
  };
};

export const useResearchManager = () => {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const activeJobsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    listJobsApi()
      .then(async (items) => {
        setJobs(items.map(mapListItem));
        const completed = items.filter((i) => i.status === 'completed');
        for (const item of completed) {
          try {
            const detail = await getJobDetailApi(item.id);
            setJobs((prev) => {
              const existing = prev.find((j) => j.id === item.id) || mapListItem(item);
              const merged = mergeDetail(existing, detail);
              return [merged, ...prev.filter((j) => j.id !== item.id)];
            });
          } catch (err) {
            console.error(err);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const createJob = useCallback(async (companyName: string, geography: string, industry: string) => {
    const res = await createJobApi(companyName, geography || 'Global', industry);
    const job: ResearchJob = {
      id: res.jobId,
      companyName,
      geography: geography || 'Global',
      industry,
      createdAt: Date.now(),
      status: 'idle',
      progress: 0,
      currentAction: 'Queued... ',
      sections: buildEmptySections(),
    };

    setJobs((prev) => [job, ...prev.filter((j) => j.id !== job.id)]);
    return job.id;
  }, []);

  const runJob = useCallback(
    async (jobId: string, companyNameOverride?: string) => {
      if (activeJobsRef.current.has(jobId)) return;
      activeJobsRef.current.add(jobId);
      let lastStatus: ApiJobStatus | null = null;

      try {
        while (true) {
          const status = await getJobStatusApi(jobId);
          lastStatus = status;

          setJobs((prev) => {
            const existing = prev.find((j) => j.id === jobId);
            const next = mapJobFromStatus(status, existing, companyNameOverride ? { companyName: companyNameOverride } : undefined);
            return [next, ...prev.filter((j) => j.id !== jobId)];
          });

          if (status.status === 'completed' || status.status === 'failed') {
            break;
          }

          await delay(2000);
        }

        const detail = await getJobDetailApi(jobId);
        setJobs((prev) => {
          const existing = prev.find((j) => j.id === jobId) || (lastStatus ? mapJobFromStatus(lastStatus, undefined, companyNameOverride ? { companyName: companyNameOverride } : undefined) : undefined);
          if (!existing) return prev;
          const merged = mergeDetail(existing, detail);
          return [merged, ...prev.filter((j) => j.id !== jobId)];
        });
      } catch (error) {
        console.error(error);
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
      }
    },
    [],
  );

  return { jobs, createJob, runJob };
};
