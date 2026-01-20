import type { BlueprintInput, BlueprintSection, ReportBlueprint, ReportTypeId } from '../types/report-blueprints.js';

const BLUEPRINT_VERSION = '2026-01-15-draft-1';

const baseDependencies: Record<string, string[]> = {
  exec_summary: ['financial_snapshot', 'company_overview'],
  peer_benchmarking: ['financial_snapshot']
};

const withDependencies = (section: BlueprintSection): BlueprintSection => {
  const deps = baseDependencies[section.id];
  return deps && deps.length ? { ...section, dependencies: deps } : section;
};

const textInput = (input: Omit<BlueprintInput, 'type'>): BlueprintInput => ({
  ...input,
  type: 'text'
});

const textareaInput = (input: Omit<BlueprintInput, 'type'>): BlueprintInput => ({
  ...input,
  type: 'textarea'
});

const baseInputs = (nameLabel: string): BlueprintInput[] => [
  textInput({ id: 'companyName', label: nameLabel, required: true }),
  textInput({ id: 'timeHorizon', label: 'Time horizon', required: false, helperText: 'For example: last 12 months.' }),
  textareaInput({ id: 'meetingContext', label: 'Meeting context', required: false })
];

const appendixFocus = 'Sources used across sections.';

const industrialsSections: BlueprintSection[] = [
  { id: 'exec_summary', title: 'Executive Summary', defaultSelected: true, focus: 'Operating pressure points and call-ready takeaways.' },
  { id: 'financial_snapshot', title: 'Financial Snapshot', defaultSelected: true, focus: 'Performance drivers and margin dynamics with interpretation.' },
  { id: 'company_overview', title: 'Company Overview', defaultSelected: true, focus: 'Business model, segments, and end markets.' },
  { id: 'segment_analysis', title: 'Segment Analysis', defaultSelected: true, focus: 'Segment-level performance and competitor context.' },
  { id: 'trends', title: 'Market Trends', defaultSelected: true, focus: 'Macro, supply chain, and end-market trends.' },
  { id: 'peer_benchmarking', title: 'Peer Benchmarking', defaultSelected: true, focus: 'Peer performance and positioning signals.' },
  { id: 'sku_opportunities', title: 'SKU Opportunities', defaultSelected: true, focus: 'Map operating issues to SSA problem areas.' },
  { id: 'recent_news', title: 'Recent News', defaultSelected: true, focus: 'Material developments tied to operations or strategy.' },
  { id: 'conversation_starters', title: 'Conversation Starters', defaultSelected: true, focus: 'Hypothesis-driven executive questions.' },
  { id: 'appendix', title: 'Appendix and Sources', defaultSelected: true, focus: appendixFocus }
].map(withDependencies);

const genericSections: BlueprintSection[] = [
  { id: 'exec_summary', title: 'Executive Summary', defaultSelected: true, focus: '4-6 high-signal points tied to the meeting context.' },
  { id: 'financial_snapshot', title: 'Financial Snapshot', defaultSelected: true, focus: 'Only material metrics tied to the stated topic.' },
  { id: 'company_overview', title: 'Company Overview', defaultSelected: true, focus: 'Business model and the most relevant segments.' },
  { id: 'trends', title: 'Market Trends', defaultSelected: true, focus: '2-4 trends that directly affect the context.' },
  { id: 'sku_opportunities', title: 'SKU Opportunities', defaultSelected: true, focus: '1-3 SSA problem areas tied to the context.' },
  { id: 'conversation_starters', title: 'Conversation Starters', defaultSelected: true, focus: 'Short, call-ready questions for the meeting.' },
  { id: 'appendix', title: 'Appendix and Sources', defaultSelected: true, focus: appendixFocus },
  { id: 'segment_analysis', title: 'Segment Analysis', defaultSelected: false, focus: 'Optional deep dive if the context demands it.' },
  { id: 'peer_benchmarking', title: 'Peer Benchmarking', defaultSelected: false, focus: 'Optional when peer comparisons are meaningful.' },
  { id: 'recent_news', title: 'Recent News', defaultSelected: false, focus: 'Optional when recent developments matter.' }
].map(withDependencies);

const peSections: BlueprintSection[] = [
  { id: 'exec_summary', title: 'Executive Summary', defaultSelected: true, focus: 'Portfolio direction, value-creation themes, and operating signals.' },
  { id: 'company_overview', title: 'Firm Overview', defaultSelected: true, focus: 'Firm positioning, sector focus, and portfolio composition.' },
  { id: 'investment_strategy', title: 'Investment Strategy and Focus', defaultSelected: true, focus: 'Fund strategy, sector focus, and platform vs add-on approach.', reportSpecific: true },
  { id: 'portfolio_snapshot', title: 'Portfolio Snapshot', defaultSelected: true, focus: 'Current portfolio overview grouped by sector or platform.', reportSpecific: true },
  { id: 'deal_activity', title: 'Recent Investments and Add-ons', defaultSelected: true, focus: 'Most recent acquisitions, add-ons, and exits.', reportSpecific: true },
  { id: 'financial_snapshot', title: 'Portfolio Performance Snapshot', defaultSelected: true, focus: 'Fund size, scale signals, and reported performance indicators.' },
  { id: 'segment_analysis', title: 'Portfolio Segments and Platforms', defaultSelected: false, focus: 'Optional clustering by sector or platform vs add-on patterns.' },
  { id: 'trends', title: 'Deal and Sector Trends', defaultSelected: true, focus: 'Deal environment, sector shifts, and value-creation context.' },
  { id: 'sku_opportunities', title: 'Value-Creation Themes and SSA Alignment', defaultSelected: true, focus: 'Map operating themes to SSA problem areas.' },
  { id: 'recent_news', title: 'Firm and Portfolio News', defaultSelected: true, focus: 'Deal announcements, leadership moves, portfolio updates.' },
  { id: 'conversation_starters', title: 'Call-Ready Talking Points', defaultSelected: true, focus: 'Hypothesis-driven questions for PE conversations.' },
  { id: 'peer_benchmarking', title: 'Peer Firms and Strategy Comparison', defaultSelected: false, focus: 'Optional peer comparison when data is available.' },
  { id: 'deal_team', title: 'Deal Team and Key Stakeholders', defaultSelected: false, focus: 'Partners, deal leads, and operating partners tied to the portfolio.', reportSpecific: true },
  { id: 'portfolio_maturity', title: 'Portfolio Maturity and Exit Watchlist', defaultSelected: false, focus: 'Older holdings and potential exit signals.', reportSpecific: true },
  { id: 'appendix', title: 'Appendix and Sources', defaultSelected: true, focus: appendixFocus }
].map(withDependencies);

const fsSections: BlueprintSection[] = [
  { id: 'exec_summary', title: 'Executive Summary', defaultSelected: true, focus: 'Performance drivers, operating pressure, and leadership focus.' },
  { id: 'financial_snapshot', title: 'Performance and Capital Snapshot', defaultSelected: true, focus: 'Revenue mix, margins, efficiency, and capital metrics.' },
  { id: 'company_overview', title: 'Institution Overview and Business Lines', defaultSelected: true, focus: 'Business mix, revenue drivers, and footprint.' },
  { id: 'leadership_and_governance', title: 'Leadership and Governance', defaultSelected: true, focus: 'Leadership profiles, accountability signals, governance notes.', reportSpecific: true },
  { id: 'strategic_priorities', title: 'Strategic Priorities and Transformation', defaultSelected: true, focus: 'Strategic focus areas, transformation agenda, and trade-offs.', reportSpecific: true },
  { id: 'trends', title: 'Market, Regulatory, and Competitive Trends', defaultSelected: true, focus: 'External forces shaping operating priorities.' },
  { id: 'segment_analysis', title: 'Business Line Deep Dive', defaultSelected: false, focus: 'Optional when business-line detail is needed.' },
  { id: 'peer_benchmarking', title: 'Peer Benchmarking', defaultSelected: false, focus: 'Optional peer comparison when data is available.' },
  { id: 'operating_capabilities', title: 'Operating Capabilities', defaultSelected: false, focus: 'Digital capabilities, talent pools, shared services, or hub assessments.', reportSpecific: true },
  { id: 'sku_opportunities', title: 'Operating Priorities and SSA Alignment', defaultSelected: true, focus: 'Map operating tensions to SSA problem areas.' },
  { id: 'recent_news', title: 'Earnings and News Highlights', defaultSelected: true, focus: 'Earnings commentary, regulatory updates, leadership changes.' },
  { id: 'conversation_starters', title: 'Call-Ready Talking Points', defaultSelected: true, focus: 'Hypothesis-driven questions for exec discussions.' },
  { id: 'appendix', title: 'Appendix and Sources', defaultSelected: true, focus: appendixFocus }
].map(withDependencies);

const reportBlueprints: ReportBlueprint[] = [
  {
    version: BLUEPRINT_VERSION,
    reportType: 'INDUSTRIALS',
    title: 'Industrials',
    purpose: 'Distill end-market exposure, cost structure, and operational levers into actionable context for exec-level conversations.',
    inputs: [
      ...baseInputs('Company name'),
      textInput({ id: 'segmentFocus', label: 'Segment or end market focus', required: false }),
      textInput({ id: 'stakeholders', label: 'Stakeholders', required: false })
    ],
    sections: industrialsSections
  },
  {
    version: BLUEPRINT_VERSION,
    reportType: 'GENERIC',
    title: 'Company Brief (Generic)',
    purpose: 'Distill company-specific strategy, performance, and recent developments into tailored context for exec-level conversations.',
    inputs: [
      ...baseInputs('Company name'),
      textInput({ id: 'topicOfInterest', label: 'Topic of interest', required: false, helperText: 'Strategy, performance, growth, or risk.' }),
      textInput({ id: 'stakeholders', label: 'Stakeholders', required: false })
    ],
    sections: genericSections
  },
  {
    version: BLUEPRINT_VERSION,
    reportType: 'PE',
    title: 'Private Equity',
    purpose: 'Distill portfolio activity, value-creation themes, and investment strategy into actionable context for exec-level conversations.',
    inputs: [
      ...baseInputs('PE firm name'),
      textInput({ id: 'fundStrategy', label: 'Fund or strategy focus', required: false }),
      textInput({ id: 'stakeholders', label: 'Stakeholders', required: false })
    ],
    sections: peSections
  },
  {
    version: BLUEPRINT_VERSION,
    reportType: 'FS',
    title: 'Financial Services',
    purpose: 'Distill operational challenges, performance drivers, and strategic priorities into actionable context for exec-level conversations.',
    inputs: [
      ...baseInputs('Institution name'),
      textInput({ id: 'businessFocus', label: 'Business focus', required: false, helperText: 'Banking, wealth, insurance, payments, etc.' }),
      textInput({ id: 'stakeholders', label: 'Stakeholders', required: false })
    ],
    sections: fsSections
  }
];

export const listReportBlueprints = () => reportBlueprints;

export const getReportBlueprint = (reportType: ReportTypeId) =>
  reportBlueprints.find((blueprint) => blueprint.reportType === reportType) || null;

export const getBlueprintVersion = () => BLUEPRINT_VERSION;
