import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, CheckCircle2, Circle, ArrowRight, BrainCircuit } from 'lucide-react';
import { ReportType, SectionId, SECTIONS_CONFIG, VisibilityScope } from '../types';

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
    }
  ) => Promise<string>;
  runJob: (id: string, companyName?: string) => Promise<void>;
  jobs: any[]; // Using any for simplicity in props mapping, but strongly typed inside
  userContext?: {
    user: { id: string; email: string; role: string; isAdmin: boolean } | null;
    groups: Array<{ id: string; name: string; slug: string }>;
    loading: boolean;
  };
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
  segment_analysis: [],
  trends: [],
  peer_benchmarking: ['financial_snapshot'],
  sku_opportunities: [],
  recent_news: [],
  conversation_starters: [],
  appendix: []
};

const ensureDependencies = (sections: SectionId[]) => {
  const set = new Set<SectionId>(sections);
  set.add('appendix');
  let updated = true;
  while (updated) {
    updated = false;
    for (const section of Array.from(set)) {
      const deps = SECTION_DEPENDENCIES[section] || [];
      deps.forEach((dep) => {
        if (!set.has(dep)) {
          set.add(dep);
          updated = true;
        }
      });
    }
  }
  return Array.from(set);
};

export const NewResearch: React.FC<NewResearchProps> = ({ createJob, runJob, jobs, userContext, onNavigate }) => {
  const [step, setStep] = useState<'input' | 'processing'>('input');
  const [formData, setFormData] = useState({ company: '', geo: '', industry: '' });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{ jobId?: string; status?: string; message?: string } | null>(null);
  const [reportType, setReportType] = useState<ReportType>('GENERIC');
  const [selectedSections, setSelectedSections] = useState<SectionId[]>(DEFAULT_SECTIONS_BY_REPORT.GENERIC);
  const [visibilityScope, setVisibilityScope] = useState<VisibilityScope>('PRIVATE');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [userPrompt, setUserPrompt] = useState('');

  const activeJob = jobs.find(j => j.id === currentJobId);
  const availableGroups = userContext?.groups || [];
  const canShareToGroups = availableGroups.length > 0;

  useEffect(() => {
    setSelectedSections(ensureDependencies(DEFAULT_SECTIONS_BY_REPORT[reportType]));
  }, [reportType]);

  useEffect(() => {
    if (visibilityScope !== 'GROUP' && selectedGroupIds.length) {
      setSelectedGroupIds([]);
    }
  }, [visibilityScope, selectedGroupIds.length]);

  const toggleSection = (sectionId: SectionId) => {
    if (sectionId === 'appendix') return;
    const next = new Set(selectedSections);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    setSelectedSections(ensureDependencies(Array.from(next)));
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSubmit = async (e?: React.FormEvent, force = false) => {
    if (e) e.preventDefault();

    const company = normalizeInput(formData.company);
    const geo = normalizeInput(formData.geo);
    const industry = normalizeInput(formData.industry);

    if (!company || company.length < 2 || !hasMeaningfulChars(company)) {
      setError('Please enter a valid company name (letters or numbers required).');
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

    if (visibilityScope === 'GROUP' && selectedGroupIds.length === 0) {
      setError('Select at least one group for shared access.');
      return;
    }

    try {
      const id = await createJob(normalized.company, normalized.geo, normalized.industry, {
        force,
        reportType,
        selectedSections,
        visibilityScope,
        groupIds: visibilityScope === 'GROUP' ? selectedGroupIds : [],
        userAddedPrompt: userPrompt.trim() || undefined
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
    if (activeJob && activeJob.status === 'completed') {
      const timer = setTimeout(() => {
        onNavigate(`/research/${activeJob.id}`);
      }, 1500); // Small delay to show "Complete" state
      return () => clearTimeout(timer);
    }
  }, [activeJob?.status, activeJob?.id, onNavigate]);

  if (step === 'input') {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Who are we analyzing today?</h2>
          <p className="text-slate-500 text-lg">
            Enter a company name to generate a comprehensive 10-point research dossier including financials, competitors, and market opportunities.
          </p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
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
            
            <div className="grid grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                >
                  <option value="GENERIC">Company Brief (Generic)</option>
                  <option value="INDUSTRIALS">Industrials (Full Report)</option>
                  <option value="PE">Private Equity Brief</option>
                  <option value="FS">Financial Services Brief</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Visibility</label>
                <select
                  value={visibilityScope}
                  onChange={(e) => setVisibilityScope(e.target.value as VisibilityScope)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                >
                  <option value="PRIVATE">Private (Only Me)</option>
                  {canShareToGroups ? <option value="GROUP">My Groups</option> : null}
                  <option value="GENERAL">General Use</option>
                </select>
                {!canShareToGroups && (
                  <p className="text-xs text-slate-400 mt-2">You are not assigned to any groups yet.</p>
                )}
              </div>
            </div>

            {visibilityScope === 'GROUP' && canShareToGroups && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Share With Groups</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableGroups.map((group) => {
                    const checked = selectedGroupIds.includes(group.id);
                    return (
                      <label key={group.id} className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleGroup(group.id)}
                        />
                        {group.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sections to Generate</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SECTIONS_CONFIG.map((section) => {
                  const checked = selectedSections.includes(section.id);
                  const disabled = section.id === 'appendix';
                  return (
                    <label key={section.id} className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleSection(section.id)}
                      />
                      {section.title}
                      {disabled ? <span className="text-xs text-slate-400">(required)</span> : null}
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-2">Dependencies are added automatically.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Custom Prompt (Optional)</label>
              <textarea
                rows={3}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Add specific context or constraints for this report..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 mt-4"
            >
              Start Analysis <ArrowRight size={20} />
            </button>
          </div>
        </form>
        {duplicateInfo && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
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
    );
  }

  // PROCESSING STATE (Claude-like)
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-8 mt-6">
      
      {/* Left: Progress Steps */}
      <div className="w-full md:w-1/3 space-y-6">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Loader2 className={`animate-spin text-brand-500 ${activeJob?.status === 'completed' ? 'hidden' : 'block'}`} size={18} />
              {activeJob?.status === 'completed' ? 'Analysis Complete' : activeJob?.status === 'queued' ? 'Queued for processing' : 'Researching...'}
            </h3>
            {activeJob?.status === 'queued' && (
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                Another job is currently running. Your analysis will start automatically.
              </div>
            )}
            <div className="space-y-4">
               {SECTIONS_CONFIG.map((section, idx) => {
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

              {activeJob?.currentAction && activeJob.status !== 'completed' && (
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
           </div>
        </div>
      </div>
    </div>
  );
};
