import React, { useEffect, useState } from 'react';
import { Home, FileText, PanelLeftClose, PanelLeftOpen, Newspaper, Settings, BarChart3, DollarSign, Users } from 'lucide-react';
import { BugTrackerModal } from './BugTrackerModal';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (path: string) => void;
  activePath: string;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, activePath, isAdmin }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'ok' | 'degraded' | 'down'>('checking');
  const [healthModel, setHealthModel] = useState<string>('Sonnet 4.5');
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Build health endpoint from API base (strip trailing /api)
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
  const healthBase = apiBase.replace(/\/api\/?$/, '') || '';
  const healthUrl = `${healthBase.replace(/\/$/, '') || ''}/health`;
  const feedbackUrl = `${apiBase.replace(/\/$/, '')}/feedback`;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const checkHealth = async () => {
      try {
        const res = await fetch(healthUrl);
        if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
        const data = await res.json();
        const status = (data.status as string) || 'degraded';
        const model = (data.model as string) || 'Sonnet 4.5';
        if (status === 'ok') setHealthStatus('ok');
        else setHealthStatus('degraded');
        setHealthModel(model);
      } catch (err) {
        console.error('Health check error', err);
        setHealthStatus('down');
      }
    };

    checkHealth();
    timer = setInterval(checkHealth, 60000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [healthUrl]);

  // Bug tracker API functions
  const submitFeedback = async (payload: {
    type: 'bug' | 'issue' | 'feature' | 'other';
    title: string;
    message: string;
    pagePath?: string;
    reportId?: string;
  }) => {
    const res = await fetch(feedbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to submit feedback');
    }
  };

  const listFeedback = async (filters?: {
    status?: 'new_feedback' | 'reviewed' | 'in_progress' | 'resolved' | 'wont_fix';
    type?: 'bug' | 'issue' | 'feature' | 'other';
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.type) params.set('type', filters.type);
    const url = `${feedbackUrl}${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      throw new Error('Failed to fetch feedback');
    }
    return res.json();
  };

  const updateFeedback = async (
    id: string,
    data: {
      status?: 'new_feedback' | 'reviewed' | 'in_progress' | 'resolved' | 'wont_fix';
      resolutionNotes?: string;
    }
  ) => {
    const res = await fetch(`${feedbackUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || 'Failed to update feedback');
    }
  };

  const deleteFeedback = async (id: string) => {
    const res = await fetch(`${feedbackUrl}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || 'Failed to delete feedback');
    }
  };

  const statusColor =
    healthStatus === 'ok' ? 'bg-emerald-500' : healthStatus === 'degraded' ? 'bg-amber-500' : 'bg-rose-500';
  const statusText =
    healthStatus === 'ok' ? 'System Operational' : healthStatus === 'degraded' ? 'Degraded' : healthStatus === 'checking' ? 'Checking...' : 'Offline';

  const currentHash = typeof window !== 'undefined' ? window.location.hash : '';
  const reportMatch = currentHash.match(/\/research\/([^/]+)/);
  const reportId = reportMatch ? reportMatch[1] : undefined;
  const pagePath = typeof window !== 'undefined' ? window.location.href : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-full md:w-80'} bg-white border-r border-slate-200 flex-shrink-0 md:h-screen sticky top-0 z-20 transition-all duration-300 ease-in-out flex flex-col`}>
        <div className={`p-6 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => onNavigate('/')}>
              <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                <img src="/SSA%20Logo%20Square.svg" alt="SSA & Co Marketing Hub" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-800 whitespace-nowrap">SSA & Co Marketing Hub</span>
            </div>
          )}
          {isCollapsed && (
             <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer" onClick={() => onNavigate('/')}>
               <img src="/SSA%20Logo%20Square.svg" alt="SSA & Co Marketing Hub" className="w-7 h-7 object-contain" />
             </div>
          )}
        </div>
        
        {/* Toggle Button */}
         <div className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-end px-4 py-2'}`}>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-md transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
         </div>

        <nav className="p-4 space-y-1 flex-1">
          {!isCollapsed && (
            <div className="pb-2">
              <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Research Reports</span>
            </div>
          )}
          <button 
            onClick={() => onNavigate('/')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePath === '/' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center px-2' : ''}`}
            title={isCollapsed ? "Research Dashboard" : undefined}
          >
            <Home size={18} className="flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Research Dashboard</span>}
          </button>
          
          {/* News Intelligence Section */}
          {!isCollapsed && (
            <div className="pt-4 pb-2">
              <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">News Intelligence</span>
            </div>
          )}
          <button
            onClick={() => onNavigate('/news')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePath === '/news' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center px-2' : ''}`}
            title={isCollapsed ? "News Feed" : undefined}
          >
            <Newspaper size={18} className="flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">News Feed</span>}
          </button>
          <button
            onClick={() => onNavigate('/news/setup')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePath === '/news/setup' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center px-2' : ''}`}
            title={isCollapsed ? "News Setup" : undefined}
          >
            <Settings size={18} className="flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">News Setup</span>}
          </button>

          {isAdmin && (
            <>
              {!isCollapsed && (
                <div className="pt-4 pb-2">
                  <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</span>
                </div>
              )}
              <button
                onClick={() => onNavigate('/admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePath === '/admin' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={isCollapsed ? "Users & Groups" : undefined}
              >
                <Users size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Users & Groups</span>}
              </button>
              <button
                onClick={() => onNavigate('/admin/metrics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePath === '/admin/metrics' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={isCollapsed ? "Metrics" : undefined}
              >
                <BarChart3 size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Metrics</span>}
              </button>
              <button
                onClick={() => onNavigate('/admin/pricing')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePath === '/admin/pricing' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={isCollapsed ? "Pricing" : undefined}
              >
                <DollarSign size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Pricing</span>}
              </button>
              <button
                onClick={() => onNavigate('/admin/prompts')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePath === '/admin/prompts' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={isCollapsed ? "Prompt Library" : undefined}
              >
                <FileText size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Prompt Library</span>}
              </button>
            </>
          )}
        </nav>

        <div className="px-4 pb-4">
          <button
            onClick={() => setFeedbackOpen(true)}
            className={`text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors ${isCollapsed ? 'w-full text-center' : ''}`}
            title="Report Issue"
          >
            {isCollapsed ? '!' : 'Report Issue'}
          </button>
        </div>

        <div className="p-4 border-t border-slate-100 mt-auto">
          {isCollapsed ? (
            <div className="flex justify-center">
                <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} title={statusText}></div>
             </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-3">
               <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`}></div>
                  <span className="text-xs font-semibold text-slate-600">{statusText}</span>
               </div>
               <p className="text-xs text-slate-400">{healthStatus === 'ok' ? `${healthModel} Enabled` : 'API unreachable'}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen relative scroll-smooth">
         <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-6">
            <h1 className="font-semibold text-slate-800">
              {activePath === '/' && 'Research Dashboard'}
              {activePath === '/new' && 'Initiate New Analysis'}
              {activePath.startsWith('/research') && 'Research Report'}
              {activePath === '/admin' && 'User & Group Management'}
              {activePath === '/admin/metrics' && 'Metrics Dashboard'}
              {activePath === '/admin/pricing' && 'Pricing Management'}
              {activePath === '/admin/prompts' && 'Prompt Library'}
              {activePath === '/news' && 'News Intelligence'}
              {activePath === '/news/setup' && 'News Setup'}
            </h1>
         </header>
         <div className="p-6 max-w-7xl mx-auto">
            {children}
         </div>
      </main>

      <BugTrackerModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={submitFeedback}
        onList={listFeedback}
        onUpdate={updateFeedback}
        onDelete={deleteFeedback}
        context={{ pagePath, reportId }}
      />
    </div>
  );
};
