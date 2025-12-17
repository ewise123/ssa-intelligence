import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { NewResearch } from './pages/NewResearch';
import { ResearchDetail } from './pages/ResearchDetail';
import { useResearchManager } from './services/researchManager';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');
  const [navResetKey, setNavResetKey] = useState(0);
  const { jobs, createJob, runJob, cancelJob, deleteJob } = useResearchManager();

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
    setCurrentPath(path);
    if (path === '/new') {
      setNavResetKey((k) => k + 1);
    }
    window.location.hash = path;
  };

  const renderContent = () => {
    if (currentPath === '/') {
      return <Home jobs={jobs} onNavigate={navigate} onCancel={cancelJob} onDelete={deleteJob} />;
    }
    if (currentPath === '/new') {
      return (
        <NewResearch
          key={navResetKey}
          createJob={createJob}
          runJob={runJob}
          jobs={jobs}
          onNavigate={navigate}
        />
      );
    }
    if (currentPath.startsWith('/research/')) {
      return <ResearchDetail jobs={jobs} onNavigate={navigate} />;
    }
    return <Home jobs={jobs} onNavigate={navigate} onDelete={deleteJob} />;
  };

  return (
    <Layout onNavigate={navigate} activePath={currentPath}>
      {renderContent()}
    </Layout>
  );
}
