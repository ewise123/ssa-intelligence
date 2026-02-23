/**
 * News Dashboard Page
 * Grid-based layout with articles grouped by company
 * Supports admin view (full controls) and member view (personal feed)
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { logger } from '../utils/logger';
import {
  RefreshCw,
  Filter,
  Search,
  ExternalLink,
  Clock,
  Building2,
  User,
  Tag,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  X,
  Loader2,
  Newspaper,
  CheckCircle2,
  Circle,
  Check,
  Link2,
  Archive,
  Sparkles,
  Pin,
  FileDown,
  FileText,
  Download,
} from 'lucide-react';
import Threads from '../components/Threads';
import {
  useNewsArticles,
  useNewsTags,
  useTrackedCompanies,
  useTrackedPeople,
  useNewsRefresh,
  useNewsSearch,
  useUserPins,
  NewsArticle,
  ArticleFilters,
  archiveArticle,
  bulkArchiveArticles,
  exportArticles,
  exportSearchResults,
  pinSearchResult,
} from '../services/newsManager';
import { resolveCompanyApi, CompanySuggestion } from '../services/researchManager';
import { ArticleCard } from '../components/news/ArticleCard';
import { ArticleDetailModal } from '../components/news/ArticleDetailModal';
import { CompanyArticleGroup } from '../components/news/CompanyArticleGroup';
import { Portal } from '../components/Portal';

interface NewsDashboardProps {
  onNavigate: (path: string) => void;
  isAdmin: boolean;
  currentUserId: string;
}

export const NewsDashboard: React.FC<NewsDashboardProps> = ({ onNavigate, isAdmin, currentUserId }) => {
  // Filters state - default to showing new (not archived) articles
  // Non-admin users are always scoped to their own userId
  const [filters, setFilters] = useState<ArticleFilters>({
    isArchived: false,
    ...(isAdmin ? {} : { userId: currentUserId }),
  });

  // Deep dive search state
  const [searchCompany, setSearchCompany] = useState('');
  const [searchPerson, setSearchPerson] = useState('');
  const [searchDays, setSearchDays] = useState(1);

  // Company resolution state
  const [resolving, setResolving] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveSuggestions, setResolveSuggestions] = useState<CompanySuggestion[]>([]);
  const [resolveStatus, setResolveStatus] = useState<'exact' | 'corrected' | 'ambiguous' | 'unknown'>('unknown');
  const [resolveInput, setResolveInput] = useState('');

  // Deep dive search progress popup
  const [showSearchProgress, setShowSearchProgress] = useState(false);
  const [searchStep, setSearchStep] = useState<'verifying' | 'searching' | 'complete' | 'error'>('verifying');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResultCount, setSearchResultCount] = useState(0);

  // Time period for search/refresh
  const [refreshDays, setRefreshDays] = useState(1);
  const timePeriodOptions = [
    { value: 1, label: '1 Day' },
    { value: 3, label: '3 Days' },
    { value: 7, label: '1 Week' },
    { value: 14, label: '2 Weeks' },
    { value: 30, label: '1 Month' },
  ];

  // Selected article for detail modal
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Bulk selection state
  const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set());

  // Pinned section collapse state
  const [pinnedCollapsed, setPinnedCollapsed] = useState(true);

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Search results export dropdown state
  const [showSearchExportMenu, setShowSearchExportMenu] = useState(false);
  const searchExportMenuRef = useRef<HTMLDivElement>(null);

  // Search result pinned map: sourceUrl → DB articleId
  const [searchPinnedMap, setSearchPinnedMap] = useState<Map<string, string>>(new Map());

  // Progress popup state
  const [showProgressPopup, setShowProgressPopup] = useState(false);

  // Close export menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (searchExportMenuRef.current && !searchExportMenuRef.current.contains(e.target as Node)) {
        setShowSearchExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Data hooks
  const { articles, total, loading: articlesLoading, fetchArticles, page, setPage, totalPages } = useNewsArticles(filters);
  const { tags } = useNewsTags();
  const { companies } = useTrackedCompanies();
  const { people } = useTrackedPeople();
  const { status, refreshing, refresh, fetchStatus } = useNewsRefresh();
  const { results: searchResults, searching, search, clearResults } = useNewsSearch();
  const { pinnedIds, pinArticle, unpinArticle, isPinned } = useUserPins();

  // Show progress popup when refresh starts (local or detected from backend)
  useEffect(() => {
    if (refreshing || status.isRefreshing) {
      setShowProgressPopup(true);
    }
  }, [refreshing, status.isRefreshing]);

  // Poll status while refreshing
  useEffect(() => {
    if (!refreshing && !status.isRefreshing) return;
    const interval = setInterval(() => {
      fetchStatus();
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshing, status.isRefreshing, fetchStatus]);

  // Group articles by company name, sorted alphabetically
  const groupedByCompany = useMemo(() => {
    const groups: Record<string, NewsArticle[]> = {};

    for (const article of articles) {
      const companyName = article.company?.name || 'Uncategorized';
      if (!groups[companyName]) {
        groups[companyName] = [];
      }
      groups[companyName].push(article);
    }

    // Sort articles within each group by publishedAt desc
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    // Sort company names alphabetically, with 'Uncategorized' at the end
    const sortedNames = Object.keys(groups).sort((a, b) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return a.localeCompare(b);
    });

    return { groups, sortedNames };
  }, [articles]);

  // Get pinned articles
  const pinnedArticles = useMemo(() => {
    return articles.filter(a => pinnedIds.has(a.id)).sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [articles, pinnedIds]);

  const handleRefresh = async () => {
    try {
      setShowProgressPopup(true);
      await refresh(refreshDays);
      await fetchArticles();
      // Keep popup open for a moment to show completion
      setTimeout(() => setShowProgressPopup(false), 2000);
    } catch (err) {
      // Keep popup open to show error
    }
  };

  // Execute the actual search
  const executeSearch = async (companyName?: string, personName?: string) => {
    setSearchStep('searching');
    try {
      const result = await search({
        company: companyName || undefined,
        person: personName || undefined,
        days: searchDays,
      });
      const count = result?.articles?.length ?? 0;
      setSearchResultCount(count);
      setSearchStep('complete');
      // Keep popup open to show completion
      setTimeout(() => setShowSearchProgress(false), 2500);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      setSearchStep('error');
    }
  };

  // Handle search with company name resolution
  const handleSearch = async () => {
    if (!searchCompany.trim() && !searchPerson.trim()) return;

    const companyToSearch = searchCompany.trim();
    const personToSearch = searchPerson.trim();

    // Show progress popup
    setShowSearchProgress(true);
    setSearchStep('verifying');
    setSearchError(null);
    setSearchResultCount(0);

    // If there's a company name, resolve it first
    if (companyToSearch) {
      setResolving(true);
      try {
        const result = await resolveCompanyApi(companyToSearch);
        setResolving(false);

        if (result.status === 'exact') {
          // Exact match - use the canonical name
          const resolvedName = result.suggestions[0]?.canonicalName || companyToSearch;
          setSearchCompany(resolvedName);
          await executeSearch(resolvedName, personToSearch);
        } else if (result.status === 'corrected' || result.status === 'ambiguous') {
          // Hide progress popup temporarily for resolution modal
          setShowSearchProgress(false);
          setResolveInput(companyToSearch);
          setResolveSuggestions(result.suggestions);
          setResolveStatus(result.status);
          setResolveModalOpen(true);
        } else {
          // Unknown - use as entered
          await executeSearch(companyToSearch, personToSearch);
        }
      } catch (err) {
        setResolving(false);
        // On error, proceed with original name
        await executeSearch(companyToSearch, personToSearch);
      }
    } else {
      // No company, just search by person
      setSearchStep('searching');
      await executeSearch(undefined, personToSearch);
    }
  };

  // Handle modal selection
  const handleResolveSelect = async (selectedName: string) => {
    setSearchCompany(selectedName);
    setResolveModalOpen(false);
    // Show progress popup again for the search
    setShowSearchProgress(true);
    setSearchStep('searching');
    await executeSearch(selectedName, searchPerson.trim());
  };

  // Handle modal cancel - search with original input
  const handleResolveCancel = async () => {
    setResolveModalOpen(false);
    // Show progress popup again for the search
    setShowSearchProgress(true);
    setSearchStep('searching');
    await executeSearch(searchCompany.trim(), searchPerson.trim());
  };

  const clearFilters = () => {
    setFilters(isAdmin ? { isArchived: false } : { isArchived: false, userId: currentUserId });
  };

  // Check if any filters are active beyond the default
  const hasActiveFilters = !!(
    filters.companyId ||
    filters.personId ||
    filters.tagId ||
    filters.isArchived === true
  );

  // Handle archiving
  const handleArchive = async (articleId: string) => {
    try {
      await archiveArticle(articleId, true);
      await fetchArticles();
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle({ ...selectedArticle, isArchived: true });
      }
    } catch (err) {
      logger.error('Failed to archive article:', err);
    }
  };

  // Toggle selection of an article (admin only)
  const toggleArticleSelection = (articleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedArticleIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  // Handle bulk archive (admin only)
  const handleBulkArchive = async () => {
    if (selectedArticleIds.size === 0) return;
    try {
      await bulkArchiveArticles(Array.from(selectedArticleIds));
      setSelectedArticleIds(new Set());
      await fetchArticles();
    } catch (err) {
      logger.error('Failed to bulk archive articles:', err);
    }
  };

  // Handle pin/unpin toggle
  const handleTogglePin = async (articleId: string) => {
    try {
      if (isPinned(articleId)) {
        await unpinArticle(articleId);
      } else {
        await pinArticle(articleId);
      }
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  // Handle pin/unpin for search results (no DB id yet)
  const handleSearchTogglePin = async (article: NewsArticle) => {
    try {
      const existingId = searchPinnedMap.get(article.sourceUrl);
      if (existingId) {
        // Already pinned — unpin using the stored DB ID
        await unpinArticle(existingId);
        setSearchPinnedMap(prev => {
          const next = new Map(prev);
          next.delete(article.sourceUrl);
          return next;
        });
      } else {
        // Save to DB and pin
        const { articleId } = await pinSearchResult(article);
        setSearchPinnedMap(prev => new Map(prev).set(article.sourceUrl, articleId));
        // Sync local pinnedIds state (backend already pinned, this just updates React state)
        await pinArticle(articleId);
      }
    } catch (err) {
      console.error('Failed to toggle search result pin:', err);
    }
  };

  // Check if a search result is pinned
  const isSearchResultPinned = (article: NewsArticle): boolean => {
    // Has a real DB ID and is in pinnedIds
    if (article.id && isPinned(article.id)) return true;
    // Was pinned via search flow
    return searchPinnedMap.has(article.sourceUrl);
  };

  // Handle export with scope: all, pinned, or selected
  const handleExport = async (format: 'pdf' | 'markdown' | 'docx', scope: 'all' | 'pinned' | 'selected') => {
    try {
      let ids: string[] = [];
      if (scope === 'selected') {
        ids = Array.from(selectedArticleIds);
      } else if (scope === 'pinned') {
        ids = Array.from(pinnedIds);
      } else {
        // 'all' — export all currently visible articles by their IDs
        ids = articles.map(a => a.id);
      }
      await exportArticles(format, ids, currentUserId);
      setShowExportMenu(false);
    } catch (err) {
      console.error('Failed to export articles:', err);
    }
  };

  // Handle single article export from detail modal
  const handleArticleExport = async (articleId: string, format: 'pdf' | 'markdown' | 'docx') => {
    try {
      await exportArticles(format, [articleId], currentUserId);
    } catch (err) {
      console.error('Failed to export article:', err);
    }
  };

  const formatTimestamp = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with animated background */}
      <div className="relative rounded-2xl shadow-xl bg-gradient-to-br from-slate-900 via-brand-800 to-brand-700">
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <Threads
            color={[1, 1, 1]}
            amplitude={1.5}
            distance={0.8}
            lineWidth={18}
            enableMouseInteraction
          />
        </div>
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 30%, rgba(255,255,255,0.18) 0%, transparent 55%)' }} />
        <div className="relative z-10 p-10 text-white pointer-events-none flex flex-col justify-between gap-6 min-h-[15rem]">
          <div className="hidden lg:flex absolute left-[50%] right-0 top-1/2 -translate-y-1/2 items-center justify-center pointer-events-none">
            <img
              src="/SAMI_News.png"
              alt="SAMI"
              className="h-56 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            />
          </div>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Curated news intelligence, delivered daily.</h2>
            <p className="text-brand-100 text-lg">
              <span className="text-white font-semibold">{total}</span> curated articles from your tracked companies and people, refreshed and updated in real time
            </p>
          </div>
          <div className="flex items-center gap-3 justify-start pointer-events-auto">
            {/* Selection count */}
            {selectedArticleIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/70 font-medium">{selectedArticleIds.size} selected</span>
                <button
                  onClick={() => setSelectedArticleIds(new Set())}
                  className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Clear selection"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Export dropdown - always available */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-white text-brand-700 shadow-lg hover:bg-brand-50 transition-all"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export News</span>
                <ChevronDown size={14} />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-80 overflow-y-auto">
                  {/* All Articles */}
                  <div className="px-3 py-1.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">All Articles ({total})</p>
                  </div>
                  <button
                    onClick={() => handleExport('pdf', 'all')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <FileDown size={15} /> PDF
                  </button>
                  <button
                    onClick={() => handleExport('markdown', 'all')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <Download size={15} /> Markdown
                  </button>
                  <button
                    onClick={() => handleExport('docx', 'all')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <FileText size={15} /> Word (DOCX)
                  </button>

                  {/* Pinned Articles */}
                  {pinnedIds.size > 0 && (
                    <>
                      <div className="border-t border-slate-100 my-1" />
                      <div className="px-3 py-1.5">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pinned ({pinnedIds.size})</p>
                      </div>
                      <button
                        onClick={() => handleExport('pdf', 'pinned')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <FileDown size={15} /> PDF
                      </button>
                      <button
                        onClick={() => handleExport('markdown', 'pinned')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <Download size={15} /> Markdown
                      </button>
                      <button
                        onClick={() => handleExport('docx', 'pinned')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <FileText size={15} /> Word (DOCX)
                      </button>
                    </>
                  )}

                  {/* Selected Articles - always shown */}
                  <div className="border-t border-slate-100 my-1" />
                  <div className="px-3 py-1.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Selected ({selectedArticleIds.size})</p>
                  </div>
                  <button
                    onClick={() => handleExport('pdf', 'selected')}
                    disabled={selectedArticleIds.size === 0}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${selectedArticleIds.size === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'}`}
                  >
                    <FileDown size={15} /> PDF
                  </button>
                  <button
                    onClick={() => handleExport('markdown', 'selected')}
                    disabled={selectedArticleIds.size === 0}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${selectedArticleIds.size === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'}`}
                  >
                    <Download size={15} /> Markdown
                  </button>
                  <button
                    onClick={() => handleExport('docx', 'selected')}
                    disabled={selectedArticleIds.size === 0}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${selectedArticleIds.size === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'}`}
                  >
                    <FileText size={15} /> Word (DOCX)
                  </button>
                </div>
              )}
            </div>

            {/* Archive selected */}
            {selectedArticleIds.size > 0 && (
              <button
                onClick={handleBulkArchive}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all font-medium shadow-md"
              >
                <Archive size={18} />
                <span className="hidden sm:inline">Archive</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Deep Dive Search Panel - Always visible */}
      <div className="bg-gradient-to-br from-brand-50 via-white to-brand-50/50 border-2 border-brand-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all ring-1 ring-brand-100/50">
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-sm">
              <Search size={18} className="text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Deep Dive</h3>
            <span className="text-xs text-brand-600 font-medium bg-brand-100 px-2 py-0.5 rounded-full">
              Search any company or person
            </span>
          </div>
        </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                placeholder="Company name..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all"
              />
            </div>
            <div className="relative flex-1">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchPerson}
                onChange={(e) => setSearchPerson(e.target.value)}
                placeholder="Person name..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all"
              />
            </div>
            <select
              value={searchDays}
              onChange={(e) => setSearchDays(Number(e.target.value))}
              className="px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all bg-slate-50 hover:bg-white cursor-pointer text-sm font-medium text-slate-700"
            >
              {timePeriodOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              disabled={searching || resolving || (!searchCompany.trim() && !searchPerson.trim())}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 transition-all font-medium shadow-sm hover:shadow-md"
            >
              {resolving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Verifying...</span>
                </span>
              ) : searching ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Searching...</span>
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">
                  <span className="text-brand-600 font-semibold">{searchResults.length}</span> results found
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative" ref={searchExportMenuRef}>
                    <button
                      onClick={() => setShowSearchExportMenu(!showSearchExportMenu)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                    >
                      <Download size={14} />
                      Export
                      <ChevronDown size={12} />
                    </button>
                    {showSearchExportMenu && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                        <button
                          onClick={async () => { setShowSearchExportMenu(false); await exportSearchResults('pdf', searchResults); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                        >
                          <FileDown size={14} /> PDF
                        </button>
                        <button
                          onClick={async () => { setShowSearchExportMenu(false); await exportSearchResults('markdown', searchResults); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                        >
                          <Download size={14} /> Markdown
                        </button>
                        <button
                          onClick={async () => { setShowSearchExportMenu(false); await exportSearchResults('docx', searchResults); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                        >
                          <FileText size={14} /> Word (DOCX)
                        </button>
                      </div>
                    )}
                  </div>
                  <button onClick={clearResults} className="text-sm text-slate-400 hover:text-rose-500 transition-colors">
                    Clear all
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {searchResults.map((article, idx) => {
                  const pinned = isSearchResultPinned(article);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl cursor-pointer hover:from-brand-50 hover:to-white border border-transparent hover:border-brand-100 transition-all group flex items-center gap-2"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 text-sm group-hover:text-brand-700 transition-colors">{article.headline}</div>
                        <div className="text-xs text-slate-500 mt-1">{article.sourceName}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSearchTogglePin(article);
                        }}
                        className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                          pinned
                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                            : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                        }`}
                        title={pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin size={14} className={pinned ? 'fill-current' : ''} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      {/* Filters Panel - Always visible */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-100 rounded-lg">
              <Filter size={16} className="text-violet-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors">
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Company</label>
            <select
              value={filters.companyId || ''}
              onChange={(e) => setFilters({ ...filters, companyId: e.target.value || undefined })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all bg-slate-50 hover:bg-white cursor-pointer"
            >
              <option value="">All companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">People</label>
            <select
              value={filters.personId || ''}
              onChange={(e) => setFilters({ ...filters, personId: e.target.value || undefined })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all bg-slate-50 hover:bg-white cursor-pointer"
            >
              <option value="">All people</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Topic</label>
            <select
              value={filters.tagId || ''}
              onChange={(e) => setFilters({ ...filters, tagId: e.target.value || undefined })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all bg-slate-50 hover:bg-white cursor-pointer"
            >
              <option value="">All topics</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Status</label>
            <select
              value={
                filters.isArchived === true ? 'archived' :
                filters.isArchived === false ? 'new' :
                'all'
              }
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') {
                  setFilters({ ...filters, isArchived: undefined });
                } else if (value === 'new') {
                  setFilters({ ...filters, isArchived: false });
                } else if (value === 'archived') {
                  setFilters({ ...filters, isArchived: true });
                }
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all bg-slate-50 hover:bg-white cursor-pointer"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Last Updated Info - Always visible */}
      {!refreshing && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl w-fit border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={14} className="text-slate-400" />
            <span>Last refreshed: <span className="font-medium">{formatTimestamp(status.lastRefreshedAt)}</span></span>
          </div>
          {status.lastRefreshedAt && status.articlesFound > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-xs font-bold shadow-md shadow-emerald-500/25 border border-emerald-400/30">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {status.articlesFound} articles
            </span>
          )}
        </div>
      )}

      {/* Progress Popup */}
      {showProgressPopup && (
        <ProgressPopup
          status={status}
          refreshing={refreshing}
          onClose={() => setShowProgressPopup(false)}
        />
      )}

      {/* Empty State */}
      {!articlesLoading && articles.length === 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-brand-50 border border-slate-200 rounded-2xl p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-100/30 to-violet-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <Newspaper className="text-slate-400" size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">No News Yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {isAdmin
                ? 'Click "Refresh News" to fetch the latest articles for your tracked entities.'
                : 'No articles available yet. Your administrator will set up your news feed shortly.'
              }
            </p>
            {isAdmin && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 transition-all font-medium shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40"
              >
                {refreshing ? 'Refreshing...' : 'Refresh News'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {articlesLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-500 font-medium">Loading articles...</p>
        </div>
      )}

      {/* Pinned Articles Section */}
      {!articlesLoading && pinnedArticles.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-between mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
            <button
              onClick={() => setPinnedCollapsed(!pinnedCollapsed)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className={`p-1.5 rounded-lg transition-transform ${pinnedCollapsed ? 'rotate-0' : 'rotate-90'}`}>
                <ChevronRight size={18} className="text-slate-500" />
              </div>
              <div className="p-2 rounded-xl shadow-md bg-gradient-to-br from-amber-400 to-orange-500">
                <Pin className="text-white" size={18} />
              </div>
              <div className="flex items-baseline gap-3">
                <h3 className="text-lg font-bold text-slate-800">Pinned Articles</h3>
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold min-w-[28px] shadow-md border backdrop-blur-sm bg-gradient-to-r from-amber-400 to-orange-400 text-white border-amber-300/50 shadow-amber-500/30">
                  {pinnedArticles.length}
                </span>
              </div>
            </button>
          </div>
          {!pinnedCollapsed && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedArticles.map((article) => (
                <ArticleCard
                  key={`pinned-${article.id}`}
                  article={article}
                  onClick={() => setSelectedArticle(article)}
                  accentColor="amber"
                  isPinned={true}
                  isSelected={selectedArticleIds.has(article.id)}
                  onToggleSelection={toggleArticleSelection}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* News Sections - Grouped by Company */}
      {!articlesLoading && articles.length > 0 && (
        <div className="space-y-4">
          {groupedByCompany.sortedNames.map((companyName) => {
            const companyArticles = groupedByCompany.groups[companyName];
            if (!companyArticles || companyArticles.length === 0) return null;

            return (
              <CompanyArticleGroup
                key={companyName}
                companyName={companyName}
                articles={companyArticles}
                onArticleClick={setSelectedArticle}
                selectedIds={selectedArticleIds}
                onToggleSelection={toggleArticleSelection}
                pinnedIds={pinnedIds}
                onTogglePin={handleTogglePin}
              />
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
              <button
                onClick={() => { setSelectedArticleIds(new Set()); setPage(Math.max(0, page - 1)); }}
                disabled={page === 0}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {page + 1} of {totalPages} ({total} articles)
              </span>
              <button
                onClick={() => { setSelectedArticleIds(new Set()); setPage(Math.min(totalPages - 1, page + 1)); }}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (() => {
        const isFromSearch = searchResults.some(r => r.sourceUrl === selectedArticle.sourceUrl);
        const articlePinned = isFromSearch
          ? isSearchResultPinned(selectedArticle)
          : isPinned(selectedArticle.id);
        const handleModalTogglePin = isFromSearch
          ? async (_id: string) => { await handleSearchTogglePin(selectedArticle); }
          : handleTogglePin;
        return (
          <ArticleDetailModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onArchive={handleArchive}
            onExport={handleArticleExport}
            isPinned={articlePinned}
            onTogglePin={handleModalTogglePin}
          />
        );
      })()}

      {/* Deep Dive Search Progress Popup */}
      {showSearchProgress && (
        <Portal>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-5 ${
              searchStep === 'error'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                : searchStep === 'complete'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-brand-500 to-violet-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {searchStep === 'complete' ? (
                      <CheckCircle2 className="text-white" size={24} />
                    ) : searchStep === 'error' ? (
                      <AlertCircle className="text-white" size={24} />
                    ) : (
                      <Loader2 className="animate-spin text-white" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {searchStep === 'complete' ? 'Search Complete' : searchStep === 'error' ? 'Search Failed' : 'Deep Dive Search'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {searchCompany && searchPerson
                        ? `${searchCompany} & ${searchPerson}`
                        : searchCompany || searchPerson}
                    </p>
                  </div>
                </div>
                {(searchStep === 'complete' || searchStep === 'error') && (
                  <button
                    onClick={() => setShowSearchProgress(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="text-white" size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {searchStep === 'error' ? (
                <div className="text-center">
                  <p className="text-rose-600 font-medium">{searchError || 'An error occurred'}</p>
                  <button
                    onClick={() => setShowSearchProgress(false)}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : searchStep === 'complete' ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                    <CheckCircle2 size={18} />
                    Found {searchResultCount} article{searchResultCount !== 1 ? 's' : ''}
                  </div>
                  <p className="text-slate-500 text-sm mt-3">Results shown below</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Step 1: Verifying */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${
                    searchStep === 'verifying' ? 'bg-brand-50 border border-brand-200' : 'bg-slate-50'
                  }`}>
                    {searchStep === 'verifying' ? (
                      <div className="p-1.5 bg-brand-500 rounded-lg">
                        <Loader2 className="animate-spin text-white" size={16} />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-emerald-500 rounded-lg">
                        <Check className="text-white" size={16} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${searchStep === 'verifying' ? 'text-brand-700' : 'text-slate-600'}`}>
                        Verifying company name
                      </p>
                      {searchStep === 'verifying' && (
                        <p className="text-sm text-slate-500">Checking for matches...</p>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Searching */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${
                    searchStep === 'searching' ? 'bg-brand-50 border border-brand-200' : 'bg-slate-50'
                  }`}>
                    {searchStep === 'searching' ? (
                      <div className="p-1.5 bg-brand-500 rounded-lg">
                        <Loader2 className="animate-spin text-white" size={16} />
                      </div>
                    ) : searchStep === 'verifying' ? (
                      <div className="p-1.5 bg-slate-300 rounded-lg">
                        <Circle className="text-white" size={16} />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-emerald-500 rounded-lg">
                        <Check className="text-white" size={16} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${searchStep === 'searching' ? 'text-brand-700' : 'text-slate-400'}`}>
                        Searching for news
                      </p>
                      {searchStep === 'searching' && (
                        <p className="text-sm text-slate-500">AI is searching and analyzing...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </Portal>
      )}

      {/* Company Resolution Modal */}
      {resolveModalOpen && (
        <Portal>
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500">
              <h3 className="text-lg font-bold text-white">
                {resolveStatus === 'corrected' ? 'Did you mean?' : 'Multiple matches found'}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {resolveStatus === 'corrected'
                  ? `We found a similar company for "${resolveInput}"`
                  : `"${resolveInput}" matches multiple companies`}
              </p>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {resolveSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResolveSelect(suggestion.canonicalName)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-all group"
                >
                  <div className="font-semibold text-slate-800 group-hover:text-brand-700">
                    {suggestion.canonicalName}
                  </div>
                  {suggestion.description && (
                    <div className="text-sm text-slate-500 mt-1">{suggestion.description}</div>
                  )}
                  {suggestion.industry && (
                    <div className="text-xs text-slate-400 mt-1">{suggestion.industry}</div>
                  )}
                </button>
              ))}
            </div>
            <div className="px-4 py-3 bg-slate-50 flex justify-between gap-3">
              <button
                onClick={handleResolveCancel}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Use "{resolveInput}" anyway
              </button>
              <button
                onClick={() => setResolveModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}

    </div>
  );
};

// Progress Popup Component
const ProgressPopup: React.FC<{
  status: any;
  refreshing: boolean;
  onClose: () => void;
}> = ({ status, refreshing, onClose }) => {
  return (
    <Portal>
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header with gradient */}
        <div className={`px-6 py-5 ${
          status.lastError
            ? 'bg-gradient-to-r from-rose-500 to-rose-600'
            : refreshing
              ? 'bg-gradient-to-r from-brand-500 to-violet-500'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                {refreshing ? (
                  <Loader2 className="animate-spin text-white" size={24} />
                ) : status.lastError ? (
                  <AlertCircle className="text-white" size={24} />
                ) : (
                  <CheckCircle2 className="text-white" size={24} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  {refreshing ? 'Refreshing News' : status.lastError ? 'Refresh Failed' : 'Refresh Complete'}
                </h3>
                <p className="text-white/80 text-sm">{status.progressMessage}</p>
              </div>
            </div>
            {!refreshing && (
              <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                status.lastError
                  ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                  : 'bg-gradient-to-r from-brand-400 to-violet-500'
              }`}
              style={{ width: `${status.progress}%` }}
            />
          </div>

          {/* Steps */}
          {status.steps && status.steps.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {status.steps.map((step: any, index: number) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                    step.status === 'in_progress'
                      ? 'bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-100'
                      : step.status === 'completed'
                        ? 'bg-slate-50'
                        : ''
                  }`}
                >
                  <div className={`mt-0.5 p-1 rounded-full flex-shrink-0 ${
                    step.status === 'completed' ? 'bg-emerald-100' :
                    step.status === 'in_progress' ? 'bg-brand-100' :
                    step.status === 'error' ? 'bg-rose-100' :
                    'bg-slate-100'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    ) : step.status === 'in_progress' ? (
                      <Loader2 size={14} className="text-brand-600 animate-spin" />
                    ) : step.status === 'error' ? (
                      <AlertCircle size={14} className="text-rose-600" />
                    ) : (
                      <Circle size={14} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${
                      step.status === 'in_progress' ? 'font-semibold text-brand-700' :
                      step.status === 'completed' ? 'text-slate-700' :
                      'text-slate-400'
                    }`}>
                      {step.step}
                    </div>
                    {step.detail && (
                      <div className="text-xs text-slate-500 mt-0.5">{step.detail}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {!refreshing && status.stats && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-brand-600">{status.stats.layer1Articles}</div>
                  <div className="text-xs font-medium text-brand-600/70 mt-1">Layer 1</div>
                  <div className="text-xs text-slate-500">RSS/API</div>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-violet-600">{status.stats.layer2Articles}</div>
                  <div className="text-xs font-medium text-violet-600/70 mt-1">Layer 2</div>
                  <div className="text-xs text-slate-500">AI Search</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{status.stats.afterProcessing}</div>
                  <div className="text-xs font-medium text-emerald-600/70 mt-1">Final</div>
                  <div className="text-xs text-slate-500">Articles</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {status.lastError && (
            <div className="mt-5 p-4 bg-gradient-to-r from-rose-50 to-rose-100/50 border border-rose-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700">{status.lastError}</p>
              </div>
            </div>
          )}

          {/* Layer Warnings (partial failures) */}
          {!refreshing && status.layerErrors && (
            <div className="mt-5 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-700 mb-1">Completed with warnings</p>
                  {status.layerErrors.layer1Error && (
                    <p className="text-amber-600">RSS/API: {status.layerErrors.layer1Error}</p>
                  )}
                  {status.layerErrors.layer2Error && (
                    <p className="text-amber-600">AI Search: {status.layerErrors.layer2Error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
};
