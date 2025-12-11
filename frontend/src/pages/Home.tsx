import React, { useEffect, useRef, useState } from 'react';
import { ResearchJob } from '../types';
import { StatusPill } from '../components/StatusPill';
import { ArrowRight, Search, TrendingUp, Building2, MapPin, MoreHorizontal, Loader2 } from 'lucide-react';

interface HomeProps {
  jobs: ResearchJob[];
  onNavigate: (path: string) => void;
  onCancel?: (id: string) => Promise<void>;
}

export const Home: React.FC<HomeProps> = ({ jobs, onNavigate, onCancel }) => {
  const completedJobs = [...jobs.filter(j => j.status === 'completed')].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
  const activeJobs = jobs
    .filter(j => j.status === 'running' || j.status === 'queued' || j.status === 'idle')
    .sort((a, b) => {
      const priority = (status: string) => (status === 'running' ? 0 : 1);
      const pa = priority(a.status);
      const pb = priority(b.status);
      if (pa !== pb) return pa - pb;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
  // Hero shine temporarily disabled

  const handleExport = async (job: ResearchJob) => {
    try {
      setExportingId(job.id);
      const res = await fetch(`${API_BASE}/research/${job.id}/export/pdf`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to export PDF');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date(job.createdAt).toISOString().slice(0, 10);
      a.href = url;
      a.download = `${job.companyName.replace(/\s+/g, '_')}-${dateStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExportingId(null);
      setOpenMenuId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero / Action Area */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-3">Institutional-grade research in minutes.</h2>
          <p className="text-brand-100 mb-8 text-lg">
            Deploy autonomous agents to gather, analyze, and synthesize company intelligence.
          </p>
          <button 
            onClick={() => onNavigate('/new')}
            className="bg-white text-brand-700 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-brand-50 transition-all flex items-center gap-2"
          >
            <Search size={20} />
            Start New Research
          </button>
        </div>
      </div>

      {/* Active Jobs Section */}
      {activeJobs.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-500" />
            Active Processes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeJobs.map(job => (
              <div 
                key={job.id} 
                onClick={() => onNavigate(`/research/${job.id}`)}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <StatusPill status={job.status} size="sm" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">{job.companyName}</h4>
                <p className="text-sm text-slate-500 mb-4">{job.currentAction}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${job.progress}%` }}></div>
                </div>
                {(job.status === 'running' || job.status === 'queued') && onCancel && (
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancel(job.id).catch(() => {});
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Research List */}
      <section>
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-semibold text-slate-800">Library</h3>
           <div className="relative">
             <input 
               type="text" 
               placeholder="Filter research..." 
               className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-64"
             />
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Company</th>
                <th className="px-6 py-4 font-semibold">Geography</th>
                <th className="px-6 py-4 font-semibold">Industry</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No completed research yet. Start a new job above.
                  </td>
                </tr>
              ) : (
                completedJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                         {job.companyName.charAt(0)}
                      </div>
                      {job.companyName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        {job.geography}
                      </div>
                    </td>
                    <td className="px-6 py-4">{job.industry || 'N/A'}</td>
                    <td className="px-6 py-4">{new Date(job.createdAt).toLocaleDateString('en-US')}</td>
                    <td className="px-6 py-4">
                      <StatusPill status={job.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="inline-block relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === job.id ? null : job.id);
                          }}
                          className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
                          aria-label="Actions"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {openMenuId === job.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onNavigate(`/research/${job.id}`);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                            >
                              View Report <ArrowRight size={14} />
                            </button>
                            <button
                              onClick={() => handleExport(job)}
                              disabled={exportingId === job.id}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 disabled:opacity-60"
                            >
                              {exportingId === job.id ? <Loader2 size={14} className="animate-spin text-slate-400" /> : null}
                              Export to PDF
                            </button>
                            <button
                              disabled
                              className="w-full text-left px-3 py-2 text-sm text-slate-400 cursor-not-allowed flex items-center justify-between"
                              title="Coming soon"
                            >
                              Rerun Job
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
