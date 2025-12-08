import React, { useState, useEffect } from 'react';
import { ResearchJob, SECTIONS_CONFIG, SectionId } from '../types';
import { StatusPill } from '../components/StatusPill';
import { ChevronRight, BarChart3, Globe, ExternalLink, AlertTriangle, Loader2, CheckCircle2, Circle } from 'lucide-react';

// Improved Markdown Renderer
const parseFormattedText = (text: string) => {
  // Split by bold (**text**) syntax
  // Captures the delimiters to help reconstruction
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
};

const MarkdownText = ({ content }: { content: string }) => {
  if (!content) return <span className="text-slate-400 italic">No content available.</span>;

  const blocks = content.split(/\n{2,}/);

  const isTableBlock = (block: string) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return false;
    return lines[0].startsWith('|') && /^\|?\s*-+/.test(lines[1]);
  };

  const renderTable = (block: string, idx: number) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return null;
    const header = lines[0].split('|').map((h) => h.trim()).filter(Boolean);
    const rows = lines.slice(2).map((row) => row.split('|').map((c) => c.trim()).filter(Boolean));
    return (
      <div key={`tbl-${idx}`} className="overflow-x-auto mb-4">
        <table className="min-w-full border border-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-50">
            <tr>
              {header.map((h, i) => (
                <th key={i} className="border border-slate-200 px-3 py-2 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci} className="border border-slate-200 px-3 py-2 align-top">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4 text-slate-700 leading-relaxed">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        if (isTableBlock(trimmed)) {
          return renderTable(trimmed, idx);
        }

        const lines = trimmed.split('\n');
        return (
          <div key={idx} className="space-y-2">
            {lines.map((line, i) => {
              const ln = line.trim();
              if (!ln) return <div key={i} className="h-2" />;

              const headerMatch = ln.match(/^(#{1,6})\s*(.+)$/);
              if (headerMatch) {
                const level = headerMatch[1].length;
                const text = headerMatch[2];
                const className =
                  level === 1
                    ? 'text-2xl font-bold text-slate-900 mt-6 mb-4 border-b border-slate-100 pb-2'
                    : level === 2
                    ? 'text-xl font-bold text-slate-800 mt-6 mb-3'
                    : 'text-lg font-semibold text-slate-800 mt-4 mb-2';
                const Tag: any = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
                return <Tag key={i} className={className}>{parseFormattedText(text)}</Tag>;
              }

              const bulletMatch = ln.match(/^[-*]\s+(.+)$/);
              if (bulletMatch) {
                return (
                  <div key={i} className="flex gap-3 ml-2 mb-1 items-start">
                    <span className="text-brand-400 mt-1.5 text-[10px] transform scale-75">&bull;</span>
                    <div className="flex-1">{parseFormattedText(bulletMatch[1])}</div>
                  </div>
                );
              }

              const numberMatch = ln.match(/^(\d+)\.\s+(.+)$/);
              if (numberMatch) {
                return (
                  <div key={i} className="flex gap-3 ml-2 mb-1 items-start">
                    <span className="text-brand-600 font-semibold min-w-[1.5em] text-sm mt-0.5">{numberMatch[1]}.</span>
                    <div className="flex-1">{parseFormattedText(numberMatch[2])}</div>
                  </div>
                );
              }

              return <p key={i} className="mb-2 text-slate-600 leading-7">{parseFormattedText(ln)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

interface ResearchDetailProps {
  jobs: ResearchJob[];
  onNavigate: (path: string) => void;
}

export const ResearchDetail: React.FC<ResearchDetailProps> = ({ jobs, onNavigate }) => {
  // Extract ID from URL hash manually since we are using a custom hash router
  const hash = window.location.hash;
  const id = hash.split('/research/')[1];
  
  const job = jobs.find(j => j.id === id);
  const [activeSection, setActiveSection] = useState<SectionId>('exec_summary');

  const overallScore = job?.overallConfidenceScore ?? 0;
  const overallPercent = Math.round(overallScore * 100);
  const overallLabel = job?.overallConfidence || 'N/A';
  const ringColor =
    overallScore >= 0.75 ? '#10b981' : overallScore >= 0.5 ? '#f59e0b' : '#ef4444';
  const ringStyle = {
    background: `conic-gradient(${ringColor} 0deg ${Math.min(
      Math.max(overallPercent, 0),
      100
    )}%, #e2e8f0 ${Math.min(Math.max(overallPercent, 0), 100)}% 100%)`
  };

  // Scroll to top when section changes
  useEffect(() => {
    const contentContainer = document.getElementById('research-content-container');
    if (contentContainer) contentContainer.scrollTop = 0;
  }, [activeSection]);

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Research Not Found</h2>
        <button
          onClick={() => onNavigate('/')}
          className="text-brand-600 hover:underline mt-4 block mx-auto"
        >
          Return Home
        </button>
      </div>
    );
  }

  const currentSectionData = job.sections[activeSection];

  // Dummy data for charts
  const chartData = [
    { name: '2020', value: 4000 },
    { name: '2021', value: 3000 },
    { name: '2022', value: 2000 },
    { name: '2023', value: 2780 },
    { name: '2024', value: 1890 },
  ];
  const maxChartValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-medium">
          <button onClick={() => onNavigate('/')} className="hover:text-brand-600 transition-colors">Dashboard</button>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-900">Report</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">{job.companyName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
              <span className="flex items-center gap-1.5"><Globe size={16} className="text-slate-400" /> {job.geography}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="flex items-center gap-1.5"><BarChart3 size={16} className="text-slate-400" /> {job.industry || 'General'}</span>
              <span className="ml-2">
                <StatusPill status={job.status} />
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
             <div className="text-right">
                <div className="text-3xl font-bold text-slate-900 leading-none">
                  {overallPercent}<span className="text-lg text-slate-400 font-normal">%</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                  Confidence Score ({overallLabel})
                </div>
             </div>
             <div
               className="h-12 w-12 rounded-full flex items-center justify-center"
               style={ringStyle}
             >
               <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center border border-slate-100">
                 {job?.status === 'completed' ? (
                   <CheckCircle2 size={18} className="text-emerald-600" />
                 ) : job?.status === 'failed' ? (
                   <AlertTriangle size={18} className="text-rose-500" />
                 ) : (
                   <Loader2 size={18} className="text-brand-500 animate-spin" />
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* Sidebar Navigation */}
        <aside className="flex-shrink-0 sticky top-24 z-10 self-start w-full md:w-60">
          <div className="bg-white rounded-lg">
            <div className="flex items-center justify-between mb-4 px-2 h-8">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider animate-in fade-in duration-200">Sections</h3>
            </div>

            <nav className="space-y-1">
              {SECTIONS_CONFIG.map(config => {
                const status = job.sections[config.id]?.status;
                const isActive = activeSection === config.id;

                let StatusIcon = Circle;
                let iconClass = "text-slate-300";

                if (status === 'completed') {
                  StatusIcon = CheckCircle2;
                  iconClass = "text-emerald-500";
                } else if (status === 'running') {
                  StatusIcon = Loader2;
                  iconClass = "text-blue-500 animate-spin";
                } else if (status === 'failed') {
                  StatusIcon = AlertTriangle;
                  iconClass = "text-rose-500";
                }

                return (
                  <button
                    key={config.id}
                    onClick={() => setActiveSection(config.id)}
                    className={`w-full text-left rounded-r-lg text-sm font-medium transition-all flex items-center relative overflow-hidden group px-4 py-3 gap-3
                      ${isActive
                        ? 'bg-brand-50 text-brand-700 border-l-[4px] border-brand-600'
                        : 'text-slate-600 hover:bg-slate-50 border-l-[4px] border-transparent hover:border-slate-200'
                      }`}
                  >
                    <StatusIcon size={18} className={`flex-shrink-0 ${iconClass}`} />
                    <span className="truncate whitespace-nowrap">{config.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content Card */}
        <div className="flex-1 min-w-0 w-full transition-all duration-300">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[600px] overflow-hidden">

            {/* Content Header */}
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 {SECTIONS_CONFIG.find(s => s.id === activeSection)?.title}
               </h2>
               {currentSectionData?.updatedAt && (
                 <span className="text-xs text-slate-400">Updated just now</span>
               )}
            </div>

            {/* Scrollable Content Area */}
            <div id="research-content-container" className="p-8 flex-1 overflow-y-auto max-h-[800px]">
              {currentSectionData?.status === 'running' ? (
                <div className="h-96 flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-brand-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={24} className="text-brand-500" />
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium animate-pulse">Analyst Agent is writing...</p>
                </div>
              ) : currentSectionData?.status === 'failed' ? (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-8 text-center my-10">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-rose-900 font-bold text-lg mb-2">Analysis Failed</h3>
                  <p className="text-rose-700 mb-6 max-w-md mx-auto">{currentSectionData.lastError || "The research agent encountered an error while processing this section."}</p>
                  <button className="bg-white border border-rose-200 text-rose-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-50 transition-colors shadow-sm">
                    Retry Section
                  </button>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                   <MarkdownText content={currentSectionData?.content || ''} />
                </div>
              )}
            </div>

            {/* Footer Sources */}
            {currentSectionData?.sources && currentSectionData.sources.length > 0 && (
              <div className="bg-slate-50 border-t border-slate-100 px-8 py-6">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <Globe size={12} /> Sources & Citations
                 </h4>
                 <div className="flex flex-wrap gap-3">
                    {currentSectionData.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-brand-700 bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-brand-300 hover:shadow-sm transition-all max-w-[200px]"
                      >
                         <ExternalLink size={10} className="flex-shrink-0" />
                         <span className="truncate">{source.title}</span>
                      </a>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
