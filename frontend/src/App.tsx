import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { NewResearch } from './pages/NewResearch';
import { ResearchDetail } from './pages/ResearchDetail';
import { AdminUsers } from './pages/AdminUsers';
import { AdminMetrics } from './pages/AdminMetrics';
import { AdminPricing } from './pages/AdminPricing';
import { AdminPrompts } from './pages/AdminPrompts';
import { NewsDashboard } from './pages/NewsDashboard';
import { AdminNewsActivity } from './pages/AdminNewsActivity';
import { AdminBugReports } from './pages/AdminBugReports';
import { InviteAccept } from './pages/InviteAccept';
import { PendingActivation } from './pages/PendingActivation';
import { useReportBlueprints, useResearchManager, useUserContext } from './services/researchManager';
import { useActivityTracker } from './services/activityTracker';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');
  const [navResetKey, setNavResetKey] = useState(0);
  const { jobs, loading: jobsLoading, createJob, runJob, rerunJob, cancelJob, deleteJob, refreshJobDetail } = useResearchManager();
  const userContext = useUserContext();
  const reportBlueprints = useReportBlueprints();
  const [logoToken, setLogoToken] = useState<string | null>(null);

  // Fetch logo token once at app level (not on every Home mount)
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
    const fallback = import.meta.env.VITE_LOGO_DEV_TOKEN as string | undefined;
    if (fallback) {
      setLogoToken(fallback);
    }
    fetch(`${apiBase}/config`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const token = data?.logoToken;
        if (typeof token === 'string' && token.trim()) {
          setLogoToken(token.trim());
        }
      })
      .catch(() => {});
  }, []);

  // Activity tracking (page views, unload events)
  useActivityTracker();

  // Simple Hash Router Implementation
  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.slice(1) || '/';
      setCurrentPath(path);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    if (path === '/new') {
      setNavResetKey((k) => k + 1);
    }
    window.location.hash = path;
    // hashchange listener will call setCurrentPath
  };

  // Render invite acceptance, loading, and pending states outside Layout
  // so these users don't see the full navigation sidebar.
  if (currentPath.startsWith('/invite/')) {
    const token = currentPath.split('/invite/')[1];
    if (!token) {
      window.location.hash = '/';
      return null;
    }
    return (
      <ErrorBoundary key={currentPath}>
        <InviteAccept token={token} onAccepted={async () => { await userContext.refresh(); window.location.hash = '/'; }} />
      </ErrorBoundary>
    );
  }

  if (userContext.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userContext.user?.status === 'PENDING') {
    return (
      <ErrorBoundary key="pending">
        <PendingActivation email={userContext.user.email} />
      </ErrorBoundary>
    );
  }

  const isAdmin = !!userContext.user?.isAdmin;
  const memberNewsDashboard = <NewsDashboard onNavigate={navigate} isAdmin={false} currentUserId={userContext.user?.id || ''} />;

  const renderContent = () => {
    // Non-admin users: redirect research and admin routes to news dashboard
    if (!isAdmin && (currentPath === '/' || currentPath === '/new' || currentPath.startsWith('/research/') || currentPath.startsWith('/admin'))) {
      return memberNewsDashboard;
    }

    if (currentPath === '/') {
      return (
        <Home
          jobs={jobs}
          loading={jobsLoading}
          reportBlueprints={reportBlueprints.blueprints}
          onNavigate={navigate}
          onCancel={cancelJob}
          onDelete={deleteJob}
          logoToken={logoToken}
        />
      );
    }
    if (currentPath === '/new') {
      return (
        <NewResearch
          key={navResetKey}
          createJob={createJob}
          runJob={runJob}
          jobs={jobs}
          userContext={userContext}
          reportBlueprints={reportBlueprints.blueprints}
          reportBlueprintVersion={reportBlueprints.version}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath === '/admin') {
      return <AdminUsers isAdmin={userContext.user?.isAdmin} isSuperAdmin={userContext.user?.isSuperAdmin} currentUserId={userContext.user?.id} />;
    }
    if (currentPath === '/admin/metrics') {
      return <AdminMetrics isAdmin={userContext.user?.isAdmin} />;
    }
    if (currentPath === '/admin/pricing') {
      return <AdminPricing isAdmin={userContext.user?.isAdmin} />;
    }
    if (currentPath === '/admin/prompts') {
      return <AdminPrompts isAdmin={userContext.user?.isAdmin} />;
    }
    if (currentPath === '/news') {
      return <NewsDashboard onNavigate={navigate} isAdmin={isAdmin} currentUserId={userContext.user?.id || ''} />;
    }
    if (currentPath === '/admin/news-activity') {
      return <AdminNewsActivity isAdmin={userContext.user?.isAdmin} />;
    }
    if (currentPath === '/admin/bugs') {
      return <AdminBugReports isAdmin={userContext.user?.isAdmin} />;
    }
    if (currentPath.startsWith('/research/')) {
      return (
        <ResearchDetail
          jobs={jobs}
          jobId={currentPath.split('/research/')[1]}
          reportBlueprints={reportBlueprints.blueprints}
          onNavigate={navigate}
          onRerun={rerunJob}
          onRefreshDetail={refreshJobDetail}
        />
      );
    }
    return <Home jobs={jobs} loading={jobsLoading} reportBlueprints={reportBlueprints.blueprints} onNavigate={navigate} onCancel={cancelJob} onDelete={deleteJob} logoToken={logoToken} />;
  };

  return (
    <Layout onNavigate={navigate} activePath={currentPath} isAdmin={userContext.user?.isAdmin} isSuperAdmin={userContext.user?.isSuperAdmin}>
      <ErrorBoundary key={currentPath}>
        {renderContent()}
      </ErrorBoundary>
    </Layout>
  );
}
