import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Sparkles, CheckCircle2, Circle, ArrowRight, BrainCircuit } from 'lucide-react';
import { BlueprintInput, BlueprintSection, ReportBlueprint, ReportType, SectionId, SECTIONS_CONFIG, VisibilityScope } from '../types';
import { enforceLockedSections, isSectionLocked } from '../utils/sections';
import { resolveCompanyApi, CompanyResolveResponse } from '../services/researchManager';
import { CompanyResolveModal } from '../components/CompanyResolveModal';

// Generate a simple UUID for draft tracking
const generateDraftId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface NewResearchProps {
  createJob: (
    name: string,
    geo: string,
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
  ) => Promise<string>;
  runJob: (id: string, companyName?: string) => Promise<void>;
  jobs: any[]; // Using any for simplicity in props mapping, but strongly typed inside
  userContext?: {
    user: { id: string; email: string; role: string; isAdmin: boolean } | null;
    groups: Array<{ id: string; name: string; slug: string }>;
    loading: boolean;
  };
  reportBlueprints?: ReportBlueprint[];
  reportBlueprintVersion?: string | null;
  onNavigate: (path: string) => void;
}

const normalizeInput = (value: string) => value.trim().replace(/\s+/g, ' ').replace(/^"+|"+$/g, '');
const toTitleLike = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
const hasMeaningfulChars = (value: string) => /[A-Za-z0-9]/.test(value);

const DEFAULT_SECTIONS_BY_REPORT: Record<ReportType, SectionId[]> = {
  GENERIC: [
    'exec_summary',
    'financial_snapshot',
    'company_overview',
    'trends',
    'sku_opportunities',
    'conversation_starters',
    'appendix'
  ],
  INDUSTRIALS: SECTIONS_CONFIG.map((section) => section.id),
  PE: [
    'exec_summary',
    'financial_snapshot',
    'company_overview',
    'trends',
    'sku_opportunities',
    'conversation_starters',
    'appendix'
  ],
  FS: [
    'exec_summary',
    'financial_snapshot',
    'company_overview',
    'trends',
    'sku_opportunities',
    'conversation_starters',
    'appendix'
  ]
};

const SECTION_DEPENDENCIES: Record<SectionId, SectionId[]> = {
  exec_summary: ['financial_snapshot', 'company_overview'],
  financial_snapshot: [],
  company_overview: [],
  investment_strategy: [],
  portfolio_snapshot: [],
  deal_activity: [],
  deal_team: [],
  portfolio_maturity: [],
  leadership_and_governance: [],
  strategic_priorities: [],
  operating_capabilities: [],
  segment_analysis: [],
  trends: [],
  peer_benchmarking: ['financial_snapshot'],
  sku_opportunities: [],
  recent_news: [],
  conversation_starters: [],
  appendix: []
};

const buildDependencyMap = (sections?: BlueprintSection[]) => {
  const map: Record<SectionId, SectionId[]> = { ...SECTION_DEPENDENCIES };
  if (sections) {
    sections.forEach((section) => {
      map[section.id] = section.dependencies?.length ? section.dependencies : map[section.id] || [];
    });
  }
  return map;
};

const ensureDependencies = (sections: SectionId[], dependencies: Record<SectionId, SectionId[]>) => {
  const set = new Set<SectionId>(sections);
  let updated = true;
  while (updated) {
    updated = false;
    for (const section of Array.from(set)) {
      const deps = dependencies[section] || [];
      deps.forEach((dep) => {
        if (!set.has(dep)) {
          set.add(dep);
          updated = true;
        }
      });
    }
  }
  return enforceLockedSections(Array.from(set));
};

export const NewResearch: React.FC<NewResearchProps> = ({
  createJob,
  runJob,
  jobs,
  userContext,
  reportBlueprints = [],
  reportBlueprintVersion = null,
  onNavigate
}) => {
  const [step, setStep] = useState<'input' | 'processing'>('input');
  const [formData, setFormData] = useState({ company: '', geo: '', industry: '' });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{ jobId?: string; status?: string; message?: string } | null>(null);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [selectedSections, setSelectedSections] = useState<SectionId[]>([]);
  const [reportInputs, setReportInputs] = useState<Record<string, string>>({});
  const [wizardStep, setWizardStep] = useState<'reportType' | 'details' | 'context' | 'review'>('reportType');
  const [showIncluded, setShowIncluded] = useState(false);
  const [visibilityScope, setVisibilityScope] = useState<VisibilityScope>('PRIVATE');
  const [visibilitySelection, setVisibilitySelection] = useState<string>('PRIVATE');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolveResult, setResolveResult] = useState<CompanyResolveResponse | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [draftId] = useState(() => generateDraftId()); // Generate once per form session

  const activeJob = jobs.find(j => j.id === currentJobId);
  const availableGroups = userContext?.groups || [];
  const canShareToGroups = availableGroups.length > 0;
  const reportBlueprint = useMemo(
    () => (reportType ? reportBlueprints.find((bp) => bp.reportType === reportType) : undefined),
    [reportBlueprints, reportType]
  );
  const companyLabel = reportBlueprint?.inputs.find((input) => input.id === 'companyName')?.label || 'Company Name';
  const reportInputFields = useMemo(
    () => (reportBlueprint?.inputs || []).filter((input) => input.id !== 'companyName'),
    [reportBlueprint]
  );
  const dependencyMap = useMemo(
    () => buildDependencyMap(reportBlueprint?.sections),
    [reportBlueprint]
  );

  const availableSections: BlueprintSection[] = useMemo(() => {
    if (reportBlueprint?.sections) return reportBlueprint.sections;
    return SECTIONS_CONFIG.map((section) => ({
      ...section,
      defaultSelected: true,
      focus: '',
      reportSpecific: false
    }));
  }, [reportBlueprint]);

  const reportTypeOptions = [
    {
      id: 'INDUSTRIALS' as ReportType,
      title: 'Industrials',
      description: 'Baseline operating model and segment-led analysis.'
    },
    {
      id: 'PE' as ReportType,
      title: 'Private Equity',
      description: 'Portfolio, deal activity, and value-creation themes.'
    },
    {
      id: 'FS' as ReportType,
      title: 'Financial Services',
      description: 'Business mix, operating pressure, and leadership focus.'
    },
    {
      id: 'GENERIC' as ReportType,
      title: 'Company Brief (Generic)',
      description: 'Short, context-specific overview for exec conversations.'
    }
  ];

  const getSectionTitle = (sectionId: SectionId) => {
    return availableSections.find((section) => section.id === sectionId)?.title || sectionId;
  };

  const reportTypeLabel = (type: ReportType | null) => {
    if (!type) return 'Select a report type';
    if (type === 'INDUSTRIALS') return 'Industrials';
    if (type === 'PE') return 'Private Equity';
    if (type === 'FS') return 'Financial Services';
    return 'Company Brief (Generic)';
  };

  const dependencyBlocks = useMemo(() => {
    const blocks = new Map<SectionId, SectionId[]>();
    selectedSections.forEach((sectionId) => {
      const deps = dependencyMap[sectionId] || [];
      deps.forEach((dep) => {
        const current = blocks.get(dep) || [];
        blocks.set(dep, Array.from(new Set([...current, sectionId])));
      });
    });
    return blocks;
  }, [dependencyMap, selectedSections]);

  const renderReportInput = (input: BlueprintInput) => {
    const value = reportInputs[input.id] || '';
    const helper = input.helperText ? <p className="text-xs text-slate-400 mt-1">{input.helperText}</p> : null;

    if (input.type === 'textarea') {
      return (
        <div key={input.id}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {input.label} {input.required ? '' : <span className="text-slate-400 font-normal">(Optional)</span>}
          </label>
          <textarea
            rows={3}
            value={value}
            onChange={(e) => updateReportInput(input.id, e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
          />
          {helper}
        </div>
      );
    }

    if (input.type === 'select') {
      return (
        <div key={input.id}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {input.label} {input.required ? '' : <span className="text-slate-400 font-normal">(Optional)</span>}
          </label>
          <select
            value={value}
            onChange={(e) => updateReportInput(input.id, e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
          >
            <option value="">Select...</option>
            {(input.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {helper}
        </div>
      );
    }

    return (
      <div key={input.id}>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {input.label} {input.required ? '' : <span className="text-slate-400 font-normal">(Optional)</span>}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => updateReportInput(input.id, e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
        />
        {helper}
      </div>
    );
  };

  useEffect(() => {
    if (!reportType) {
      setSelectedSections([]);
      return;
    }

    const defaults = reportBlueprint?.sections
      ? reportBlueprint.sections.filter((section) => section.defaultSelected).map((section) => section.id)
      : DEFAULT_SECTIONS_BY_REPORT[reportType];
    setSelectedSections(ensureDependencies(defaults, dependencyMap));
  }, [dependencyMap, reportBlueprint, reportType]);

  useEffect(() => {
    if (visibilityScope !== 'GROUP' && selectedGroupIds.length) {
      setSelectedGroupIds([]);
    }
  }, [visibilityScope, selectedGroupIds.length]);

  useEffect(() => {
    setReportInputs({});
  }, [reportType]);

  const updateReportInput = (id: string, value: string) => {
    setReportInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleCompanyResolve = async (): Promise<boolean> => {
    const company = normalizeInput(formData.company);
    if (!company || company.length < 2) return true;

    setResolving(true);
    try {
      const result = await resolveCompanyApi(company, {
        geography: formData.geo || undefined,
        industry: formData.industry || undefined,
        reportType: reportType ?? undefined
      }, draftId);

      if (result.status === 'exact' || result.status === 'unknown') {
        // Proceed normally - no modal needed
        return true;
      }

      // Show modal for corrected or ambiguous
      setResolveResult(result);
      setShowResolveModal(true);
      return false; // Wait for user to confirm via modal
    } catch (err) {
      console.warn('Company resolution failed:', err);
      return true; // Fail gracefully, continue without resolution
    } finally {
      setResolving(false);
    }
  };

  const handleResolveConfirm = (selectedName: string) => {
    // Update company name with selected value
    const updatedFormData = { ...formData, company: selectedName };
    setFormData(updatedFormData);
    setShowResolveModal(false);
    setResolveResult(null);

    // Re-validate in case user edited other fields while modal was open
    // We need to validate with the new company name directly since setState is async
    const company = normalizeInput(selectedName);
    if (!company || company.length < 2 || !hasMeaningfulChars(company)) {
      setError('Please enter a valid company name (letters or numbers required).');
      return;
    }

    const missingRequired = reportInputFields.filter((input) => input.required).find((input) => {
      const value = reportInputs[input.id];
      return !value || !value.trim();
    });
    if (missingRequired) {
      setError(`Please provide ${missingRequired.label}.`);
      return;
    }

    if (!selectedSections.length) {
      setError('Select at least one section to generate.');
      return;
    }

    if (visibilityScope === 'GROUP' && selectedGroupIds.length === 0) {
      setError('Select at least one group for shared access.');
      return;
    }

    setError(null);
    setWizardStep('context');
  };

  const handleResolveCancel = () => {
    setShowResolveModal(false);
    setResolveResult(null);
  };

  const handleDetailsNext = async () => {
    const stepError = validateDetailsStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    setError(null);

    // Resolve company name before proceeding
    const canProceed = await handleCompanyResolve();
    if (canProceed) {
      setWizardStep('context');
    }
    // If not, the modal will be shown and user will confirm
  };

  const handleContextNext = () => {
    setError(null);
    setWizardStep('review');
  };

  const toggleSection = (sectionId: SectionId) => {
    if (isSectionLocked(sectionId)) return;
    const blockers = dependencyBlocks.get(sectionId);
    if (blockers && blockers.length) return;
    const next = new Set(selectedSections);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    setSelectedSections(ensureDependencies(Array.from(next), dependencyMap));
  };

  const handleVisibilityChange = (value: string) => {
    setVisibilitySelection(value);
    if (value.startsWith('GROUP:')) {
      const groupId = value.slice('GROUP:'.length);
      setVisibilityScope('GROUP');
      setSelectedGroupIds(groupId ? [groupId] : []);
      return;
    }
    setVisibilityScope(value as VisibilityScope);
    setSelectedGroupIds([]);
  };

  const validateDetailsStep = () => {
    if (!reportType) {
      return 'Select a report type to continue.';
    }

    const company = normalizeInput(formData.company);
    if (!company || company.length < 2 || !hasMeaningfulChars(company)) {
      return 'Please enter a valid company name (letters or numbers required).';
    }

    const missingRequired = reportInputFields.filter((input) => input.required).find((input) => {
      const value = reportInputs[input.id];
      return !value || !value.trim();
    });
    if (missingRequired) {
      return `Please provide ${missingRequired.label}.`;
    }

    if (!selectedSections.length) {
      return 'Select at least one section to generate.';
    }

    if (visibilityScope === 'GROUP' && selectedGroupIds.length === 0) {
      return 'Select at least one group for shared access.';
    }

    return null;
  };

  const handleSubmit = async (e?: React.FormEvent, force = false) => {
    if (e) e.preventDefault();

    const company = normalizeInput(formData.company);
    const geo = normalizeInput(formData.geo);
    const industry = normalizeInput(formData.industry);

    const stepError = validateDetailsStep();
    if (stepError) {
      setError(stepError);
      return;
    }

    const normalized = {
      company: toTitleLike(company),
      geo: geo ? toTitleLike(geo) : '',
      industry: industry ? toTitleLike(industry) : ''
    };

    setFormData(normalized);
    setError(null);
    setDuplicateInfo(null);

    try {
      const id = await createJob(normalized.company, normalized.geo, normalized.industry, {
        force,
        reportType: reportType ?? undefined,
        selectedSections,
        visibilityScope,
        groupIds: visibilityScope === 'GROUP' ? selectedGroupIds : [],
        userAddedPrompt: userPrompt.trim() || undefined,
        blueprintVersion: reportBlueprintVersion || undefined,
        reportInputs,
        draftId
      });
      setCurrentJobId(id);
      setStep('processing');
      
      // Start the process, passing the company name explicitly to avoid stale state issues
      runJob(id, normalized.company).catch(console.error);
      onNavigate(`/research/${id}`);
    } catch (err: any) {
      if (err?.duplicate) {
        setDuplicateInfo({ jobId: err.jobId, status: err.status, message: err.message });
        return;
      }
      const msg = (err && err.message) || 'Failed to start analysis.';
      setError(msg);
    }
  };

  // Redirect when done
  useEffect(() => {
    if (activeJob && (activeJob.status === 'completed' || activeJob.status === 'completed_with_errors')) {
      const timer = setTimeout(() => {
        onNavigate(`/research/${activeJob.id}`);
      }, 1500); // Small delay to show "Complete" state
      return () => clearTimeout(timer);
    }
  }, [activeJob?.status, activeJob?.id, onNavigate]);

  if (step === 'input') {
    return (
      <div className="max-w-3xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        {wizardStep === 'reportType' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600">
                <Sparkles size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Choose a report type</h2>
              <p className="text-slate-500 text-lg">Select the blueprint that matches your meeting context.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypeOptions.map((option) => {
                const active = reportType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setReportType(option.id)}
                    className={`text-left border rounded-xl p-4 transition-all ${active ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'}`}
                  >
                    <div className="text-sm font-semibold text-slate-900">{option.title}</div>
                    <div className="text-xs text-slate-500 mt-2">{option.description}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={() => setWizardStep('details')}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!reportType}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {wizardStep === 'details' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDetailsNext();
            }}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Report details</h2>
                <p className="text-sm text-slate-500">Report type: {reportTypeLabel(reportType)}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{companyLabel}</label>
                <input
                  type="text"
                  autoFocus
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-lg"
                  placeholder="e.g. Acme Corp, Nvidia, Stripe"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
                {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Geography <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    placeholder="e.g. Global, North America"
                    value={formData.geo}
                    onChange={e => setFormData({...formData, geo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Industry <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    placeholder="e.g. SaaS, Retail"
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                  />
                </div>
              </div>

              {reportInputFields.length > 0 && (
                <div className="space-y-6">
                  {reportInputFields.map((input) => renderReportInput(input))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Visibility</label>
                  <select
                    value={visibilitySelection}
                    onChange={(e) => handleVisibilityChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  >
                    <option value="PRIVATE">Private (Only Me)</option>
                    {availableGroups.map((group) => (
                      <option key={group.id} value={`GROUP:${group.id}`}>
                        Group: {group.name}
                      </option>
                    ))}
                    <option value="GENERAL">General Use</option>
                  </select>
                  {!canShareToGroups && (
                    <p className="text-xs text-slate-400 mt-2">You are not assigned to any groups yet.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sections to Generate</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableSections.map((section) => {
                    const checked = selectedSections.includes(section.id);
                    const blockers = dependencyBlocks.get(section.id) || [];
                    const locked = isSectionLocked(section.id);
                    const disabled = locked || blockers.length > 0;
                    const tooltip = locked
                      ? 'Required for every report.'
                      : blockers.length > 0
                        ? `Required because ${blockers.map(getSectionTitle).join(', ')} depends on it.`
                        : undefined;
                    return (
                      <label key={section.id} className="flex items-center gap-2 text-sm text-slate-600" title={tooltip}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleSection(section.id)}
                        />
                        {section.title}
                        {disabled ? (
                          <span className="text-xs text-slate-400">
                            {locked ? '(always included)' : '(required)'}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-400">Dependencies are added automatically.</p>
                  <button
                    type="button"
                    onClick={() => setShowIncluded(true)}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    What's included?
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep('reportType')}
                  className="text-sm text-slate-500 hover:text-slate-700"
                  disabled={resolving}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {resolving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {wizardStep === 'context' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Additional context</h2>
              <p className="text-sm text-slate-500">Add any extra guidance or constraints for this report.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Custom Prompt (Optional)</label>
              <textarea
                rows={4}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Add specific context or constraints for this report..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setWizardStep('details')}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleContextNext}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {wizardStep === 'review' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Review and confirm</h2>
              <p className="text-sm text-slate-500">Confirm your inputs before starting the analysis.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
              <div>
                <div className="text-xs uppercase text-slate-400">Report type</div>
                <div className="font-semibold text-slate-900 mt-1">{reportTypeLabel(reportType)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400">Company</div>
                <div className="font-semibold text-slate-900 mt-1">{formData.company || '—'}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400">Geography</div>
                <div className="mt-1">{formData.geo || 'Global'}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400">Industry</div>
                <div className="mt-1">{formData.industry || '—'}</div>
              </div>
              {reportInputFields.map((input) => (
                <div key={input.id}>
                  <div className="text-xs uppercase text-slate-400">{input.label}</div>
                  <div className="mt-1">{reportInputs[input.id] || '—'}</div>
                </div>
              ))}
              <div>
                <div className="text-xs uppercase text-slate-400">Visibility</div>
                <div className="mt-1">{visibilitySelection}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs uppercase text-slate-400">Selected sections</div>
                <div className="mt-1">{selectedSections.map(getSectionTitle).join(', ')}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs uppercase text-slate-400">Additional context</div>
                <div className="mt-1 whitespace-pre-wrap">{userPrompt.trim() || '—'}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setWizardStep('context')}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(undefined, false)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                Start Analysis <ArrowRight size={18} />
              </button>
            </div>
            {duplicateInfo && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <div className="font-semibold mb-1">Research already exists.</div>
                <div className="mb-2">
                  {duplicateInfo.message || 'This company/geography/industry has already been analyzed.'}
                  {duplicateInfo.status ? ` Status: ${duplicateInfo.status}.` : ''}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleSubmit(undefined, true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Run anyway
                  </button>
                  {duplicateInfo.jobId && (
                    <button
                      type="button"
                      onClick={() => onNavigate(`/research/${duplicateInfo.jobId}`)}
                      className="text-brand-700 font-semibold hover:underline"
                    >
                      View existing research
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showIncluded && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <div className="text-xs uppercase text-slate-400">What's included</div>
                  <div className="text-lg font-bold text-slate-900">Section focus</div>
                </div>
                <button
                  onClick={() => setShowIncluded(false)}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                {availableSections.map((section) => (
                  <div key={section.id} className="border border-slate-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-900">{section.title}</div>
                      {section.reportSpecific ? (
                        <span className="text-[10px] uppercase tracking-wide text-brand-600 bg-brand-50 border border-brand-100 px-2 py-1 rounded-full">
                          Report-specific
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      {section.focus?.trim() || 'Focus description not set yet.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showResolveModal && resolveResult && (
          <CompanyResolveModal
            isOpen={showResolveModal}
            input={formData.company}
            suggestions={resolveResult.suggestions}
            status={resolveResult.status as 'corrected' | 'ambiguous'}
            onConfirm={handleResolveConfirm}
            onCancel={handleResolveCancel}
          />
        )}
      </div>
    );
  }

  // PROCESSING STATE (Claude-like)
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-8 mt-6">
      
      {/* Left: Progress Steps */}
      <div className="w-full md:w-1/3 space-y-6">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Loader2
                className={`animate-spin text-brand-500 ${
                  activeJob?.status === 'completed' || activeJob?.status === 'completed_with_errors'
                    ? 'hidden'
                    : 'block'
                }`}
                size={18}
              />
              {activeJob?.status === 'completed'
                ? 'Analysis Complete'
                : activeJob?.status === 'completed_with_errors'
                  ? 'Completed with errors'
                  : activeJob?.status === 'queued'
                    ? 'Queued for processing'
                    : 'Researching...'}
            </h3>
            {activeJob?.status === 'queued' && (
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                Another job is currently running. Your analysis will start automatically.
              </div>
            )}
            <div className="space-y-4">
               {availableSections.map((section) => {
                 const secData = activeJob?.sections[section.id];
                 const status = secData?.status || 'pending';
                 
                 let icon = <Circle size={16} className="text-slate-300" />;
                 let textColor = "text-slate-400";
                 let bgColor = "bg-transparent";

                 if (status === 'running') {
                   icon = <Loader2 size={16} className="text-blue-500 animate-spin" />;
                   textColor = "text-blue-600 font-medium";
                   bgColor = "bg-blue-50";
                 } else if (status === 'completed') {
                   icon = <CheckCircle2 size={16} className="text-emerald-500" />;
                   textColor = "text-slate-700";
                 } else if (status === 'failed') {
                   icon = <Circle size={16} className="text-rose-500" />;
                 }

                 return (
                   <div key={section.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${bgColor}`}>
                     {icon}
                     <span className={`text-sm ${textColor}`}>{section.title}</span>
                   </div>
                 );
               })}
            </div>
         </div>
      </div>

      {/* Right: Live Output Stream */}
      <div className="w-full md:w-2/3 flex flex-col">
        <div className="flex-1 bg-slate-900 rounded-2xl p-6 font-mono text-sm text-slate-300 overflow-hidden relative shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
           
           <div className="flex items-center gap-2 mb-6 text-slate-400 border-b border-slate-800 pb-4">
              <BrainCircuit size={18} />
              <span>Agent Activity Log</span>
           </div>

           <div className="space-y-4 overflow-y-auto h-full pb-20">
              {/* Simulation of a log stream */}
              <div className="text-emerald-400">
                &gt; Initializing session for: <span className="text-white font-bold">{activeJob?.companyName}</span>
              </div>
              
              {activeJob?.progress && activeJob.progress > 5 && (
                <div>
                   &gt; Searching global databases for annual reports...
                   <br/>
                   <span className="text-slate-500 ml-4">Found: 10-K (2023), Q3 Earnings Call Transcript</span>
                </div>
              )}

              {activeJob?.currentAction &&
                activeJob.status !== 'completed' &&
                activeJob.status !== 'completed_with_errors' && (
                <div className="flex items-start gap-2 text-blue-300 animate-pulse">
                   <span>&gt;</span>
                   <span>{activeJob.currentAction}</span>
                </div>
              )}

              {/* Show snippets of completed sections as they finish */}
              {Object.values(activeJob?.sections || {}).map((sec: any) => {
                 if (sec.status !== 'completed') return null;
                 return (
                   <div key={sec.id} className="opacity-70 border-l-2 border-slate-700 pl-4 py-1">
                      <span className="text-xs uppercase tracking-wider text-slate-500">Completed: {sec.title}</span>
                      <div className="text-slate-400 truncate">Generated {sec.content?.length} characters of analysis.</div>
                   </div>
                 );
              })}

              {activeJob?.status === 'completed' && (
                <div className="text-emerald-400 font-bold mt-4">
                   &gt; ALL TASKS COMPLETED. FINALIZING REPORT...
                </div>
              )}
              {activeJob?.status === 'completed_with_errors' && (
                <div className="text-amber-400 font-bold mt-4">
                   &gt; COMPLETED WITH ERRORS. FINALIZING REPORT...
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
