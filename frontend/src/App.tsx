import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { NewResearch } from './pages/NewResearch';
import { ResearchDetail } from './pages/ResearchDetail';
import { useResearchManager } from './services/researchManager';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');
  const { jobs, createJob, runJob } = useResearchManager();

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
    window.location.hash = path;
  };

  const renderContent = () => {
    if (currentPath === '/') {
      return <Home jobs={jobs} onNavigate={navigate} />;
    }
    if (currentPath === '/new') {
      return <NewResearch createJob={createJob} runJob={runJob} jobs={jobs} onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/research/')) {
      return <ResearchDetail jobs={jobs} onNavigate={navigate} />;
    }
    return <Home jobs={jobs} onNavigate={navigate} />;
  };

  return (
    <Layout onNavigate={navigate} activePath={currentPath}>
      {renderContent()}
    </Layout>
  );
}