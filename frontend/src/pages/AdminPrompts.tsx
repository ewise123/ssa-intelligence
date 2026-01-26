import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Edit2, ChevronDown, ChevronRight, X, Save, Play, History, RotateCcw, Check, AlertCircle, Clock, Loader2, Info, Maximize2, Minimize2 } from 'lucide-react';

interface AdminPromptsProps {
  isAdmin?: boolean;
}

interface PromptWithStatus {
  sectionId: string;
  reportType: string | null;
  name: string;
  description: string | null;
  codeContent: string;
  dbOverride: {
    id: string;
    content: string;
    status: 'draft' | 'published' | 'archived';
    version: number;
    updatedAt: string;
    publishedAt: string | null;
  } | null;
}

interface SectionGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  hasAddendums: boolean;
  basePrompt: PromptWithStatus | null;
  addendums: PromptWithStatus[];
}

interface PromptVersion {
  id: string;
  sectionId: string;
  reportType: string | null;
  version: number;
  content: string;
  createdBy: string | null;
  createdAt: string;
}

interface TestRun {
  id: string;
  sectionId: string;
  reportType: string | null;
  status: 'running' | 'completed' | 'failed';
  output: any;
  error: string | null;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  durationMs: number | null;
  completedAt: string | null;
}

const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

// Core sections that are used across all report types (have addendums)
const CORE_SECTIONS = new Set([
  'exec_summary',
  'financial_snapshot',
  'company_overview',
  'segment_analysis',
  'trends',
  'peer_benchmarking',
  'sku_opportunities',
  'recent_news',
  'conversation_starters',
  'appendix'
]);

const REPORT_TYPE_LABELS: Record<string, string> = {
  GENERIC: 'Generic',
  INDUSTRIALS: 'Industrials',
  PE: 'Private Equity',
  FS: 'Financial Services'
};

// PE-specific sections that should be called out
const PE_SPECIFIC_SECTIONS = new Set([
  'investment_strategy',
  'portfolio_snapshot',
  'deal_activity',
  'deal_team',
  'portfolio_maturity'
]);

// FS-specific sections that should be called out
const FS_SPECIFIC_SECTIONS = new Set([
  'leadership_and_governance',
  'strategic_priorities',
  'operating_capabilities'
]);

export const AdminPrompts: React.FC<AdminPromptsProps> = ({ isAdmin }) => {
  const [sections, setSections] = useState<SectionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Modal state
  const [editingPrompt, setEditingPrompt] = useState<PromptWithStatus | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showCodeDefault, setShowCodeDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Version history state
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Test runner state
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [testCompany, setTestCompany] = useState('');
  const [testGeography, setTestGeography] = useState('');
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [runningTest, setRunningTest] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/admin/prompts`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const data = await res.json();
      setSections(data.sections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const openEditModal = (prompt: PromptWithStatus) => {
    setEditingPrompt(prompt);
    setEditContent(prompt.dbOverride?.content || prompt.codeContent);
    setShowCodeDefault(false);
    setShowVersions(false);
    setShowTestRunner(false);
    setVersions([]);
    setTestRun(null);
    setModalError(null);
    setIsFullscreen(false);
  };

  const closeModal = () => {
    setEditingPrompt(null);
    setEditContent('');
    setModalError(null);
    setIsFullscreen(false);
    setTestCompany('');
    setTestGeography('');
    setTestRun(null);
  };

  const fetchVersions = async () => {
    if (!editingPrompt) return;

    setLoadingVersions(true);
    try {
      const params = new URLSearchParams();
      if (editingPrompt.reportType) {
        params.set('reportType', editingPrompt.reportType);
      }

      const res = await fetch(
        `${apiBase}/admin/prompts/${editingPrompt.sectionId}/versions?${params}`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!res.ok) throw new Error('Failed to fetch versions');

      const data = await res.json();
      setVersions(data.versions || []);
    } catch (err) {
      console.error('Error fetching versions:', err);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleSave = async () => {
    if (!editingPrompt) return;

    setSaving(true);
    setModalError(null);

    try {
      const payload = {
        sectionId: editingPrompt.sectionId,
        reportType: editingPrompt.reportType,
        content: editContent,
        name: editingPrompt.name
      };

      let res: Response;
      if (editingPrompt.dbOverride) {
        res = await fetch(`${apiBase}/admin/prompts/${editingPrompt.dbOverride.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${apiBase}/admin/prompts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save prompt');
      }

      fetchPrompts();
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!editingPrompt?.dbOverride) return;

    setPublishing(true);
    setModalError(null);

    try {
      const res = await fetch(
        `${apiBase}/admin/prompts/${editingPrompt.dbOverride.id}/publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to publish prompt');
      }

      fetchPrompts();
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setPublishing(false);
    }
  };

  const handleRevert = async (version: number) => {
    if (!editingPrompt?.dbOverride) return;

    if (!confirm(`Revert to version ${version}? This will create a new draft.`)) {
      return;
    }

    setModalError(null);

    try {
      const res = await fetch(
        `${apiBase}/admin/prompts/${editingPrompt.dbOverride.id}/revert/${version}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to revert prompt');
      }

      fetchPrompts();
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = async () => {
    if (!editingPrompt?.dbOverride) return;

    if (!confirm('Delete this override? This will revert to using the code default.')) {
      return;
    }

    try {
      const res = await fetch(
        `${apiBase}/admin/prompts/${editingPrompt.dbOverride.id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete prompt');
      }

      fetchPrompts();
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleRunTest = async () => {
    if (!editingPrompt || !testCompany || !testGeography) return;

    setRunningTest(true);
    setTestRun(null);

    try {
      const res = await fetch(`${apiBase}/admin/prompts/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: editingPrompt.sectionId,
          reportType: editingPrompt.reportType,
          promptContent: editContent,
          companyName: testCompany,
          geography: testGeography
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to start test');
      }

      const data = await res.json();
      pollTestRun(data.testRun.id);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unknown error');
      setRunningTest(false);
    }
  };

  const pollTestRun = useCallback(async (testRunId: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`${apiBase}/admin/prompts/test/${testRunId}`, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error('Failed to fetch test result');

        const data = await res.json();
        setTestRun(data.testRun);

        if (data.testRun.status === 'running') {
          setTimeout(poll, 2000);
        } else {
          setRunningTest(false);
        }
      } catch (err) {
        console.error('Error polling test run:', err);
        setRunningTest(false);
      }
    };

    poll();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (prompt: PromptWithStatus) => {
    if (!prompt.dbOverride) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
          Using Code Default
        </span>
      );
    }

    switch (prompt.dbOverride.status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
            <Check className="w-3 h-3 mr-1" />
            Override Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
            <Edit2 className="w-3 h-3 mr-1" />
            Draft Override
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
            Archived
          </span>
        );
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  // Group sections into new categories
  const foundationSection = sections.find(s => s.id === 'foundation');
  const coreSections = sections.filter(s => CORE_SECTIONS.has(s.id));
  const peSections = sections.filter(s => PE_SPECIFIC_SECTIONS.has(s.id));
  const fsSections = sections.filter(s => FS_SPECIFIC_SECTIONS.has(s.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Prompt Library</h2>
          <p className="text-sm text-slate-500 mt-1">
            View and override prompts used for research generation
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How Prompt Overrides Work</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>Code Default</strong> = The prompt defined in the codebase (always available as fallback)</li>
              <li><strong>Database Override</strong> = Your custom version that takes priority when published</li>
              <li>Save as <strong>Draft</strong> to test changes, then <strong>Publish</strong> to make them live</li>
              <li>Delete an override to revert back to using the code default</li>
            </ul>
          </div>
        </div>
      </div>


      {loading && (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Foundation Section */}
          {foundationSection && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-700">Foundation</h3>
                <p className="text-xs text-slate-500 mt-0.5">Phase 0 research that establishes the foundational data layer</p>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{foundationSection.name}</span>
                      {foundationSection.basePrompt && getStatusBadge(foundationSection.basePrompt)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{foundationSection.description}</p>
                  </div>
                  <button
                    onClick={() => foundationSection.basePrompt && openEditModal(foundationSection.basePrompt)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Core Sections */}
          {coreSections.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-700">Core Sections</h3>
                <p className="text-xs text-slate-500 mt-0.5">Used across all report types. Expand to view report-type addendums.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {coreSections.map(section => {
                  const isExpanded = expandedSections.has(section.id);
                  const hasAddendums = section.addendums && section.addendums.length > 0;

                  return (
                    <div key={section.id}>
                      <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{section.name}</span>
                            {section.basePrompt && getStatusBadge(section.basePrompt)}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasAddendums && (
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title={isExpanded ? 'Collapse addendums' : 'Expand addendums'}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => section.basePrompt && openEditModal(section.basePrompt)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit base prompt"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {hasAddendums && isExpanded && (
                        <div className="bg-slate-50 border-t border-slate-100">
                          <div className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Report Type Addendums
                          </div>
                          <div className="divide-y divide-slate-100">
                            {section.addendums.map(addendum => (
                              <div
                                key={`${addendum.sectionId}-${addendum.reportType}`}
                                className="px-4 py-2 pl-8 flex items-center justify-between hover:bg-slate-100"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-700">
                                      {addendum.reportType && REPORT_TYPE_LABELS[addendum.reportType]}
                                    </span>
                                    {getStatusBadge(addendum)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => openEditModal(addendum)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                                  title="Edit addendum"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Private Equity Sections */}
          {peSections.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-purple-50 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-purple-800">Private Equity Sections</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                    PE Only
                  </span>
                </div>
                <p className="text-xs text-purple-600 mt-0.5">Used only for Private Equity reports</p>
              </div>
              <div className="divide-y divide-slate-100">
                {peSections.map(section => (
                  <div key={section.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{section.name}</span>
                        {section.basePrompt && getStatusBadge(section.basePrompt)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                    </div>
                    <button
                      onClick={() => section.basePrompt && openEditModal(section.basePrompt)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Services Sections */}
          {fsSections.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-emerald-800">Financial Services Sections</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                    FS Only
                  </span>
                </div>
                <p className="text-xs text-emerald-600 mt-0.5">Used only for Financial Services reports</p>
              </div>
              <div className="divide-y divide-slate-100">
                {fsSections.map(section => (
                  <div key={section.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{section.name}</span>
                        {section.basePrompt && getStatusBadge(section.basePrompt)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                    </div>
                    <button
                      onClick={() => section.basePrompt && openEditModal(section.basePrompt)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`bg-white rounded-lg shadow-xl flex flex-col transition-all duration-200 ${
            isFullscreen
              ? 'w-full h-full max-w-none max-h-none rounded-none'
              : 'w-full max-w-6xl max-h-[95vh]'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {editingPrompt.name}
                  </h3>
                  {editingPrompt.reportType && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                      {REPORT_TYPE_LABELS[editingPrompt.reportType]} Addendum
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  {editingPrompt.reportType
                    ? `This addendum is appended to the base prompt for ${REPORT_TYPE_LABELS[editingPrompt.reportType]} reports`
                    : 'Base prompt template'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 flex-shrink-0">
              <button
                onClick={() => { setShowVersions(false); setShowTestRunner(false); }}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  !showVersions && !showTestRunner
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Edit2 className="w-4 h-4 inline mr-1.5" />
                Edit
              </button>
              <button
                onClick={() => { setShowVersions(true); setShowTestRunner(false); fetchVersions(); }}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  showVersions
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <History className="w-4 h-4 inline mr-1.5" />
                History
              </button>
              <button
                disabled
                title="Coming soon - Test functionality is under development"
                className="px-4 py-2 text-sm font-medium border-b-2 -mb-px border-transparent text-slate-300 cursor-not-allowed"
              >
                <Play className="w-4 h-4 inline mr-1.5" />
                Test
                <span className="ml-1.5 text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Soon</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 p-6">
              {modalError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4 flex-shrink-0">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  {modalError}
                </div>
              )}

              {/* Edit Tab */}
              {!showVersions && !showTestRunner && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        {editingPrompt.dbOverride ? 'Your Override' : 'Prompt Content'}
                      </label>
                      <p className="text-xs text-slate-500">
                        {editingPrompt.dbOverride
                          ? 'This override will be used instead of the code default when published'
                          : 'Currently using code default. Edit to create an override.'
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCodeDefault(!showCodeDefault)}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      {showCodeDefault ? 'Hide' : 'Show'} Code Default
                    </button>
                  </div>

                  <div className={`flex-1 flex gap-4 min-h-0 ${showCodeDefault ? '' : ''}`}>
                    <div className={`flex flex-col min-h-0 ${showCodeDefault ? 'w-1/2' : 'flex-1'}`}>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1 w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm resize-none min-h-[400px]"
                        placeholder="Enter prompt content..."
                        style={{ minHeight: isFullscreen ? '70vh' : '400px' }}
                      />
                    </div>

                    {showCodeDefault && (
                      <div className="w-1/2 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-medium text-slate-700">Code Default</span>
                            <p className="text-xs text-slate-500">The prompt defined in the codebase (read-only)</p>
                          </div>
                          <button
                            onClick={() => setEditContent(editingPrompt.codeContent)}
                            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                          >
                            Reset to Code Default
                          </button>
                        </div>
                        <div
                          className="flex-1 w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 font-mono text-sm overflow-auto"
                          style={{ minHeight: isFullscreen ? '70vh' : '400px' }}
                        >
                          <pre className="whitespace-pre-wrap text-slate-600">{editingPrompt.codeContent}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* History Tab */}
              {showVersions && (
                <div className="flex-1 overflow-auto">
                  {loadingVersions ? (
                    <div className="text-center py-8 text-slate-500">Loading versions...</div>
                  ) : versions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p>No version history yet</p>
                      <p className="text-xs mt-1">Save changes to create version history</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {versions.map(version => (
                        <div
                          key={version.id}
                          className="border border-slate-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">Version {version.version}</span>
                              <span className="text-xs text-slate-500">
                                {formatDate(version.createdAt)}
                              </span>
                              {version.createdBy && (
                                <span className="text-xs text-slate-400">
                                  by {version.createdBy}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditContent(version.content)}
                                className="text-xs text-slate-600 hover:text-slate-800"
                              >
                                View
                              </button>
                              {editingPrompt.dbOverride && (
                                <button
                                  onClick={() => handleRevert(version.version)}
                                  className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Revert
                                </button>
                              )}
                            </div>
                          </div>
                          <pre className="text-xs text-slate-600 bg-slate-50 rounded p-3 max-h-32 overflow-auto whitespace-pre-wrap">
                            {version.content.slice(0, 500)}
                            {version.content.length > 500 && '...'}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Test Tab */}
              {showTestRunner && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex-shrink-0">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Testing will execute the prompt with Claude and incur API costs. The prompt will use the content currently in the editor.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 flex-shrink-0">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={testCompany}
                        onChange={(e) => setTestCompany(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="e.g., Microsoft"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Geography
                      </label>
                      <input
                        type="text"
                        value={testGeography}
                        onChange={(e) => setTestGeography(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="e.g., United States"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRunTest}
                    disabled={runningTest || !testCompany || !testGeography}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex-shrink-0 w-fit"
                  >
                    {runningTest ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running Test...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Test
                      </>
                    )}
                  </button>

                  {testRun && (
                    <div className="flex-1 overflow-auto border border-slate-200 rounded-lg">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {testRun.status === 'running' && (
                            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                          )}
                          {testRun.status === 'completed' && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                          {testRun.status === 'failed' && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-medium text-slate-700 capitalize">
                            {testRun.status}
                          </span>
                        </div>
                        {testRun.status !== 'running' && (
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {testRun.durationMs && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {(testRun.durationMs / 1000).toFixed(1)}s
                              </span>
                            )}
                            <span>
                              {testRun.inputTokens.toLocaleString()} in / {testRun.outputTokens.toLocaleString()} out
                            </span>
                            <span className="font-medium">${testRun.costUsd.toFixed(4)}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        {testRun.status === 'failed' && testRun.error && (
                          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                            {testRun.error}
                          </div>
                        )}
                        {testRun.status === 'completed' && testRun.output && (
                          <pre className="text-xs text-slate-700 bg-slate-50 rounded p-3 overflow-auto whitespace-pre-wrap max-h-96">
                            {JSON.stringify(testRun.output, null, 2)}
                          </pre>
                        )}
                        {testRun.status === 'running' && (
                          <div className="text-center py-8 text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Executing prompt with Claude...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {!showVersions && !showTestRunner && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 flex-shrink-0 bg-slate-50 rounded-b-lg">
                <div>
                  {editingPrompt.dbOverride && (
                    <button
                      onClick={handleDelete}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete Override (Revert to Code Default)
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  {editingPrompt.dbOverride?.status === 'draft' && (
                    <button
                      onClick={handlePublish}
                      disabled={publishing}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {publishing ? 'Publishing...' : 'Publish Override'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
