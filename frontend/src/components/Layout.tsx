import React, { useEffect, useState } from 'react';
import { Search, Home, FileText, Plus, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

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

  const submitFeedback = async (payload: { name?: string; email?: string; message: string; pagePath?: string; reportId?: string }) => {
    const res = await fetch(feedbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to submit feedback');
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
      <aside className={`${isCollapsed ? 'w-20' : 'w-full md:w-64'} bg-white border-r border-slate-200 flex-shrink-0 md:h-screen sticky top-0 z-20 transition-all duration-300 ease-in-out flex flex-col`}>
        <div className={`p-6 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => onNavigate('/')}>
              <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                <img src="/SSA%20Logo%20Square.svg" alt="SSA Intelligence" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-800 whitespace-nowrap">SSA Intelligence</span>
            </div>
          )}
          {isCollapsed && (
             <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer" onClick={() => onNavigate('/')}>
               <img src="/SSA%20Logo%20Square.svg" alt="SSA Intelligence" className="w-7 h-7 object-contain" />
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
          <button 
            onClick={() => onNavigate('/')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePath === '/' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center px-2' : ''}`}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <Home size={18} className="flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
          </button>
          
          <button 
            onClick={() => onNavigate('/new')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePath === '/new' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center px-2' : ''}`}
            title={isCollapsed ? "New Research" : undefined}
          >
            <Plus size={18} className="flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">New Research</span>}
          </button>
          {isAdmin && (
            <button 
              onClick={() => onNavigate('/admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePath === '/admin' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'} ${isCollapsed ? 'justify-center px-2' : ''}`}
              title={isCollapsed ? "Admin" : undefined}
            >
              <FileText size={18} className="flex-shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Admin</span>}
            </button>
          )}
        </nav>

        <div className="px-4 pb-4">
          <button
            onClick={() => setFeedbackOpen(true)}
            className={`text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors ${isCollapsed ? 'w-full text-center' : ''}`}
            title="Share feedback"
          >
            Share feedback
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
            </h1>
            <div className="flex items-center gap-4">
               <button className="text-slate-400 hover:text-slate-600 relative">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
               </button>
               <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                  <img src="https://picsum.photos/100/100" alt="User" />
               </div>
            </div>
         </header>
         <div className="p-6 max-w-7xl mx-auto">
            {children}
         </div>
      </main>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={submitFeedback}
        context={{ pagePath, reportId }}
      />
    </div>
  );
};
