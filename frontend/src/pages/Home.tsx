import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ReportBlueprint, ResearchJob, SECTIONS_CONFIG } from '../types';
import { StatusPill } from '../components/StatusPill';
import { ArrowRight, Search, TrendingUp, Building2, MapPin, MoreHorizontal, Loader2 } from 'lucide-react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

interface HomeProps {
  jobs: ResearchJob[];
  reportBlueprints?: ReportBlueprint[];
  onNavigate: (path: string) => void;
  onCancel?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const Home: React.FC<HomeProps> = ({ jobs, reportBlueprints = [], onNavigate, onCancel, onDelete }) => {
  const completedJobs = [...jobs.filter(j =>
    j.status === 'completed' ||
    j.status === 'completed_with_errors' ||
    j.status === 'cancelled'
  )].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [contextJob, setContextJob] = useState<ResearchJob | null>(null);
  const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
  const [runtimeLogoToken, setRuntimeLogoToken] = useState<string | null>(null);
  const fallbackLogoToken = (import.meta as any).env?.VITE_LOGO_DEV_TOKEN as string | undefined;
  const logoToken = runtimeLogoToken || fallbackLogoToken;
  const activeJobs = jobs
    .filter(j => j.status === 'running' || j.status === 'queued' || j.status === 'idle')
    .sort((a, b) => {
      const priority = (status: string) => (status === 'running' ? 0 : 1);
      const pa = priority(a.status);
      const pb = priority(b.status);
      if (pa !== pb) return pa - pb;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE}/config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const token = data?.logoToken;
        if (typeof token === 'string' && token.trim()) {
          setRuntimeLogoToken(token.trim());
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [API_BASE]);

  useEffect(() => {
    if (!openMenuId) return;
    const closeMenu = () => setOpenMenuId(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenuId]);

  const companyGroups = useMemo(() => {
    const map = new Map<string, { key: string; companyName: string; jobs: ResearchJob[]; lastActive: number; hasActive: boolean; domain?: string | null }>();
    jobs.forEach((job) => {
      const key = job.companyName.trim().toLowerCase() || job.id;
      const existing = map.get(key);
      const lastActive = job.createdAt || Date.now();
      const hasActive = job.status === 'running' || job.status === 'queued';
      if (existing) {
        existing.jobs.push(job);
        existing.lastActive = Math.max(existing.lastActive, lastActive);
        existing.hasActive = existing.hasActive || hasActive;
        if (!existing.domain && job.domain) {
          existing.domain = job.domain;
        }
      } else {
        map.set(key, {
          key,
          companyName: job.companyName,
          jobs: [job],
          lastActive,
          hasActive,
          domain: job.domain || null
        });
      }
    });
    return Array.from(map.values())
      .map((group) => ({ ...group, jobs: group.jobs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) }))
      .sort((a, b) => b.lastActive - a.lastActive);
  }, [jobs]);

  const filteredGroups = companyGroups.filter((group) =>
    group.companyName.toLowerCase().includes(search.toLowerCase().trim())
  );

  const reportTypeLabel = (type?: string | null) => {
    if (!type) return 'Generic';
    if (type === 'INDUSTRIALS') return 'Industrials';
    if (type === 'PE') return 'Private Equity';
    if (type === 'FS') return 'Financial Services';
    return 'Generic';
  };

  const getBlueprint = (reportType?: string | null) => {
    if (!reportType) return null;
    return reportBlueprints.find((blueprint) => blueprint.reportType === reportType) || null;
  };

  const getSectionTitle = (sectionId: string, reportType?: string | null) => {
    const blueprint = getBlueprint(reportType);
    const blueprintTitle = blueprint?.sections.find((section) => section.id === sectionId)?.title;
    if (blueprintTitle) return blueprintTitle;
    return SECTIONS_CONFIG.find((section) => section.id === sectionId)?.title || sectionId;
  };

  const visibilityLabel = (scope?: string | null, groups?: Array<{ name: string }>) => {
    if (scope === 'GENERAL') return 'General';
    if (scope === 'GROUP') {
      const names = (groups || []).map((group) => group.name).filter(Boolean);
      return names.length ? names.join(', ') : 'Group';
    }
    return 'Private';
  };

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

  const handleMenuToggle = (jobId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenuId === jobId) {
      setOpenMenuId(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 180;
    const left = Math.min(rect.left, window.innerWidth - menuWidth - 16);
    setMenuPosition({ top: rect.bottom + 8, left: Math.max(16, left) });
    setOpenMenuId(jobId);
  };

  const formatSectionList = (sections?: string[], reportType?: string | null) => {
    if (!sections || sections.length === 0) return 'All sections';
    return sections
      .map((section) => getSectionTitle(section, reportType))
      .join(', ');
  };

  const formatDate = (value?: number | string | null) => {
    if (!value) return '';
    const date = typeof value === 'number' ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero / Action Area */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <ShaderGradientCanvas
          style={{ position: 'absolute', inset: 0 }}
          pixelDensity={3}
          fov={45}
        >
          <ShaderGradient
            animate="on"
            axesHelper="off"
            bgColor1="#000000"
            bgColor2="#000000"
            brightness={1}
            cAzimuthAngle={180}
            cDistance={1.6}
            cPolarAngle={90}
            cameraZoom={1.65}
            color1="#003399"
            color2="#0A7CC1"
            color3="#FFFFFF"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="on"
            lightType="3d"
            positionX={-0.8}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.1}
            rotationX={0}
            rotationY={10}
            rotationZ={50}
            shader="defaults"
            type="waterPlane"
            uAmplitude={1}
            uDensity={1.5}
            uFrequency={5.5}
            uSpeed={0.2}
            uStrength={2}
            uTime={0}
            wireframe={false}
          />
        </ShaderGradientCanvas>

        <div className="relative z-10 bg-gradient-to-br from-brand-600/80 to-brand-800/80 p-8 text-white">
          <div className="max-w-2xl">
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

      {/* Library as Company Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Library</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-64"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
            No research yet. Start a new job above.
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGroups.map((group) => {
              const palette = ['#1d4ed8', '#0ea5e9', '#16a34a', '#f59e0b', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6'];
              const color = palette[Math.abs(group.key.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % palette.length] || '#1d4ed8';
              const domain = group.domain || group.jobs.find((j) => j.domain)?.domain || null;
              const logoUrl = domain && logoToken ? `https://img.logo.dev/${encodeURIComponent(domain)}?token=${logoToken}&size=64&format=png` : null;
              const initials = group.companyName
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join('')
                .toUpperCase();
              return (
                <div
                  key={group.key}
                  className="group relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  onClick={() => setSelectedCompany(group.companyName)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{group.companyName}</h4>
                      <div className="text-xs text-slate-500 mt-1">
                        {group.jobs.length} {group.jobs.length === 1 ? 'report' : 'reports'}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {group.lastActive ? `Updated ${new Date(group.lastActive).toLocaleDateString('en-US')}` : ''}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-semibold overflow-hidden">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={`${group.companyName} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.textContent = initials;
                            }
                          }}
                        />
                      ) : (
                        initials
                      )}
                    </div>
                  </div>
                  <div
                    className="absolute left-0 right-0 bottom-0 h-1 opacity-100"
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal for company reports */}
      {selectedCompany && (() => {
        const group = companyGroups.find(g => g.companyName === selectedCompany);
        if (!group) return null;
        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <div className="text-xs uppercase text-slate-400">Reports</div>
                  <div className="text-xl font-bold text-slate-900">{group.companyName}</div>
                  <div className="text-xs text-slate-500">{group.jobs.length} total</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('/new')}
                    className="text-sm bg-brand-600 text-white px-3 py-2 rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    New research
                  </button>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 tracking-wide w-1/5">
                          Report
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 tracking-wide">
                          Geography
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 tracking-wide">
                          Industry
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 tracking-wide">
                          Visibility
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 tracking-wide">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 tracking-wide">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {group.jobs.map((job) => {
                        const sectionList = formatSectionList(job.selectedSections, job.reportType);
                        return (
                          <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-5 align-top">
                              <div className="space-y-2">
                                <div className="text-sm font-semibold text-slate-900">
                                  {reportTypeLabel(job.reportType)}
                                </div>
                                <details>
                                  <summary className="cursor-pointer text-xs text-slate-500">Sections</summary>
                                  <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{sectionList}</div>
                                </details>
                                {job.userAddedPrompt ? (
                                  <button
                                    onClick={() => setContextJob(job)}
                                    className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
                                  >
                                    Custom Context
                                  </button>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 align-top">
                              {job.geography || 'Global'}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 align-top">
                              {job.industry || 'No industry'}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 align-top">
                              {visibilityLabel(job.visibilityScope, job.groups)}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 align-top">
                              {formatDate(job.createdAt)}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap align-top">
                              <StatusPill status={job.status} size="sm" />
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-left align-top">
                              <div className="flex items-center justify-start gap-3">
                                <button
                                  onClick={() => onNavigate(`/research/${job.id}`)}
                                  className="inline-flex items-center text-xs bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded-lg hover:bg-brand-100 transition-colors"
                                >
                                  View Report
                                </button>
                                <div className="relative">
                                  <button
                                    onClick={(event) => handleMenuToggle(job.id, event)}
                                    className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                                  >
                                    <MoreHorizontal size={14} />
                                  </button>
                                  {openMenuId === job.id && (
                                    createPortal(
                                      <>
                                        <div
                                          className="fixed inset-0 z-40"
                                          onClick={() => setOpenMenuId(null)}
                                        ></div>
                                        <div
                                          className="fixed z-50 w-44 bg-white border border-slate-200 rounded-lg shadow-lg"
                                          style={{ top: menuPosition?.top ?? 0, left: menuPosition?.left ?? 0 }}
                                        >
                                          <button
                                            onClick={() => handleExport(job)}
                                            disabled={exportingId === job.id}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 disabled:opacity-60"
                                          >
                                            {exportingId === job.id ? <Loader2 size={14} className="animate-spin text-slate-500" /> : null}
                                            Export PDF
                                          </button>
                                          <button
                                            disabled
                                            className="w-full text-left px-3 py-2 text-sm text-slate-400 cursor-not-allowed flex items-center"
                                            title="Coming soon"
                                          >
                                            Rerun
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (!onDelete) return;
                                              if (job.status === 'running' || job.status === 'queued') return;
                                              const confirmed = window.confirm('Delete this report? This cannot be undone.');
                                              if (!confirmed) return;
                                              setDeletingId(job.id);
                                              setOpenMenuId(null);
                                              onDelete(job.id)
                                                .catch(() => {})
                                                .finally(() => setDeletingId(null));
                                            }}
                                            disabled={!onDelete || job.status === 'running' || job.status === 'queued' || deletingId === job.id}
                                            className="w-full text-left px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                          >
                                            {deletingId === job.id ? 'Deleting...' : 'Delete'}
                                          </button>
                                        </div>
                                      </>,
                                      document.body
                                    )
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {contextJob && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <div className="text-xs uppercase text-slate-400">Custom Context</div>
                <div className="text-lg font-bold text-slate-900">{contextJob.companyName}</div>
              </div>
              <button
                onClick={() => setContextJob(null)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto whitespace-pre-wrap text-sm text-slate-700">
              {contextJob.userAddedPrompt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



