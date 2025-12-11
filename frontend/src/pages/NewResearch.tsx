import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle2, Circle, ArrowRight, BrainCircuit } from 'lucide-react';
import { SECTIONS_CONFIG } from '../types';

interface NewResearchProps {
  createJob: (name: string, geo: string, industry: string) => Promise<string>;
  runJob: (id: string, companyName?: string) => Promise<void>;
  jobs: any[]; // Using any for simplicity in props mapping, but strongly typed inside
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

export const NewResearch: React.FC<NewResearchProps> = ({ createJob, runJob, jobs, onNavigate }) => {
  const [step, setStep] = useState<'input' | 'processing'>('input');
  const [formData, setFormData] = useState({ company: '', geo: '', industry: '' });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeJob = jobs.find(j => j.id === currentJobId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const id = await createJob(normalized.company, normalized.geo, normalized.industry);
    setCurrentJobId(id);
    setStep('processing');
    
    // Start the process, passing the company name explicitly to avoid stale state issues
    runJob(id, normalized.company).catch(console.error);
    onNavigate(`/research/${id}`);
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

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
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

            <button 
              type="submit" 
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 mt-4"
            >
              Start Analysis <ArrowRight size={20} />
            </button>
          </div>
        </form>
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
