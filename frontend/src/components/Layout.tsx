import React, { useState } from 'react';
import { Search, Home, FileText, Plus, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (path: string) => void;
  activePath: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, activePath }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-full md:w-64'} bg-white border-r border-slate-200 flex-shrink-0 md:h-screen sticky top-0 z-20 transition-all duration-300 ease-in-out flex flex-col`}>
        <div className={`p-6 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => onNavigate('/')}>
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold">I</div>
              <span className="font-bold text-lg tracking-tight text-slate-800 whitespace-nowrap">Intellectra</span>
            </div>
          )}
          {isCollapsed && (
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold cursor-pointer" onClick={() => onNavigate('/')}>I</div>
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
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          {isCollapsed ? (
             <div className="flex justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Operational"></div>
             </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-3">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-slate-600">System Operational</span>
               </div>
               <p className="text-xs text-slate-400">Gemini 2.5 Flash Enabled</p>
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
    </div>
  );
};