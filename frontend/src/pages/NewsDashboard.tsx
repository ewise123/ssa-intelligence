/**
 * News Dashboard Page
 * Carousel-based layout with Top Stories + per-revenue-owner carousels
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  Newspaper,
  CheckCircle2,
  Circle,
  Send,
  Sparkles,
  Link2,
  Copy,
  Check,
} from 'lucide-react';
import {
  useNewsArticles,
  useRevenueOwners,
  useNewsTags,
  useTrackedCompanies,
  useNewsRefresh,
  useNewsSearch,
  NewsArticle,
  ArticleFilters,
  toggleArticleSent,
} from '../services/newsManager';

interface NewsDashboardProps {
  onNavigate: (path: string) => void;
}

export const NewsDashboard: React.FC<NewsDashboardProps> = ({ onNavigate }) => {
  // Filters state
  const [filters, setFilters] = useState<ArticleFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Ad-hoc search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchCompany, setSearchCompany] = useState('');
  const [searchPerson, setSearchPerson] = useState('');

  // Selected article for detail modal
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);


  // Progress popup state
  const [showProgressPopup, setShowProgressPopup] = useState(false);

  // Data hooks
  const { articles, total, loading: articlesLoading, fetchArticles } = useNewsArticles(filters);
  const { owners } = useRevenueOwners();
  const { tags } = useNewsTags();
  const { companies } = useTrackedCompanies();
  const { status, refreshing, refresh, fetchStatus } = useNewsRefresh();
  const { results: searchResults, searching, search, clearResults } = useNewsSearch();

  // Show progress popup when refresh starts
  useEffect(() => {
    if (refreshing) {
      setShowProgressPopup(true);
    }
  }, [refreshing]);

  // Poll status while refreshing
  useEffect(() => {
    if (!refreshing) return;
    const interval = setInterval(() => {
      fetchStatus();
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshing, fetchStatus]);

  const handleRefresh = async () => {
    try {
      setShowProgressPopup(true);
      const result = await refresh();
      await fetchArticles();
      // Keep popup open for a moment to show completion
      setTimeout(() => setShowProgressPopup(false), 2000);
    } catch (err) {
      // Keep popup open to show error
    }
  };

  const handleSearch = async () => {
    if (!searchCompany.trim() && !searchPerson.trim()) return;
    try {
      await search({
        company: searchCompany.trim() || undefined,
        person: searchPerson.trim() || undefined,
      });
    } catch (err) {
      // Error already shown in hook
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  // Handle article sent status toggle
  const handleToggleSent = async (articleId: string, currentStatus: boolean) => {
    try {
      await toggleArticleSent(articleId, !currentStatus);
      // Refresh articles to get updated status
      await fetchArticles();
      // Update selected article if it's the one being toggled
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle({ ...selectedArticle, isSent: !currentStatus });
      }
    } catch (err) {
      console.error('Failed to toggle sent status:', err);
    }
  };

  // Group articles for carousels (exclude low priority)
  const carouselData = useMemo(() => {
    // Filter out low priority articles - only show high and medium
    const visibleArticles = articles.filter(a => a.priority === 'high' || a.priority === 'medium');

    // Sort by priority (high first) then by priorityScore
    const sortByPriority = (a: NewsArticle, b: NewsArticle) => {
      const priorityOrder = { high: 0, medium: 1 };
      const aPriority = priorityOrder[a.priority as 'high' | 'medium'] ?? 2;
      const bPriority = priorityOrder[b.priority as 'high' | 'medium'] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    };

    // Top Stories: High priority articles sorted by priorityScore, max 10
    const topStories = visibleArticles
      .filter(a => a.priority === 'high')
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      .slice(0, 10);

    // Group by revenue owner for individual carousels
    const ownerArticles: Record<string, NewsArticle[]> = {};

    // Sort owners alphabetically
    const sortedOwners = [...owners].sort((a, b) => a.name.localeCompare(b.name));

    for (const owner of sortedOwners) {
      const ownerArts = visibleArticles
        .filter(a => a.revenueOwners.some(ro => ro.id === owner.id))
        .sort(sortByPriority);

      if (ownerArts.length > 0) {
        ownerArticles[owner.id] = ownerArts;
      }
    }

    return { topStories, ownerArticles, sortedOwners };
  }, [articles, owners]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl shadow-lg">
                <Newspaper className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">News Intelligence</h2>
            </div>
            <p className="text-slate-300 ml-12">
              <span className="text-brand-300 font-semibold">{total}</span> articles from tracked companies and people
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                showSearch
                  ? 'bg-brand-500/20 border-brand-400/50 text-brand-300 shadow-lg shadow-brand-500/20'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              <Search size={18} />
              <span className="hidden sm:inline font-medium">Search</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? 'bg-brand-500/20 border-brand-400/50 text-brand-300 shadow-lg shadow-brand-500/20'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-400"></span>
                </span>
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 font-medium"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh News'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ad-Hoc Search Panel */}
      {showSearch && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-100 rounded-lg">
                <Search size={16} className="text-brand-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Ad-Hoc Search</h3>
            </div>
            <button onClick={() => setShowSearch(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
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
            <button
              onClick={handleSearch}
              disabled={searching || (!searchCompany.trim() && !searchPerson.trim())}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 transition-all font-medium shadow-sm hover:shadow-md"
            >
              {searching ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">
                  <span className="text-brand-600 font-semibold">{searchResults.length}</span> results found
                </span>
                <button onClick={clearResults} className="text-sm text-slate-400 hover:text-rose-500 transition-colors">
                  Clear all
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {searchResults.map((article, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl cursor-pointer hover:from-brand-50 hover:to-white border border-transparent hover:border-brand-100 transition-all group"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="font-medium text-slate-800 text-sm group-hover:text-brand-700 transition-colors">{article.headline}</div>
                    <div className="text-xs text-slate-500 mt-1">{article.sourceName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Revenue Owner</label>
              <select
                value={filters.revenueOwnerId || ''}
                onChange={(e) => setFilters({ ...filters, revenueOwnerId: e.target.value || undefined })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all bg-slate-50 hover:bg-white cursor-pointer"
              >
                <option value="">All owners</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>
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
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: (e.target.value as 'high' | 'medium') || undefined })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all bg-slate-50 hover:bg-white cursor-pointer"
              >
                <option value="">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Sent Status</label>
              <select
                value={filters.isSent === undefined ? '' : filters.isSent ? 'true' : 'false'}
                onChange={(e) => setFilters({ ...filters, isSent: e.target.value === '' ? undefined : e.target.value === 'true' })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all bg-slate-50 hover:bg-white cursor-pointer"
              >
                <option value="">All</option>
                <option value="true">Sent</option>
                <option value="false">Not Sent</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated Info */}
      {status.lastRefreshedAt && !refreshing && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl w-fit border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={14} className="text-slate-400" />
            <span>Last refreshed: <span className="font-medium">{formatDate(status.lastRefreshedAt)}</span></span>
          </div>
          {status.articlesFound > 0 && (
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
              {owners.length === 0
                ? 'Set up Revenue Owners with companies to track, then refresh to fetch the latest news.'
                : 'Click "Refresh News" to fetch the latest articles for your tracked entities.'}
            </p>
            {owners.length === 0 ? (
              <button
                onClick={() => onNavigate('/news/setup')}
                className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all font-medium shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40"
              >
                Go to Setup
              </button>
            ) : (
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

      {/* Carousels */}
      {!articlesLoading && articles.length > 0 && (
        <div className="space-y-8">
          {/* Top Stories Carousel */}
          {carouselData.topStories.length > 0 && (
            <NewsCarousel
              title="Top Stories"
              icon={<Sparkles size={20} className="text-amber-500" />}
              articles={carouselData.topStories}
              onArticleClick={setSelectedArticle}
              accentColor="amber"
              showRevenueOwner={true}
              showCount={false}
            />
          )}

          {/* Revenue Owner Carousels */}
          {carouselData.sortedOwners.map((owner) => {
            const ownerArts = carouselData.ownerArticles[owner.id];
            if (!ownerArts || ownerArts.length === 0) return null;

            return (
              <NewsCarousel
                key={owner.id}
                title={owner.name}
                icon={<User size={20} className="text-brand-600" />}
                articles={ownerArts}
                onArticleClick={setSelectedArticle}
                accentColor="brand"
              />
            );
          })}
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onToggleSent={handleToggleSent}
        />
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
        </div>
      </div>
    </div>
  );
};

// News Carousel Component
const NewsCarousel: React.FC<{
  title: string;
  icon: React.ReactNode;
  articles: NewsArticle[];
  onArticleClick: (article: NewsArticle) => void;
  accentColor: 'amber' | 'brand';
  showRevenueOwner?: boolean;
  showCount?: boolean;
}> = ({ title, icon, articles, onArticleClick, accentColor, showRevenueOwner = false, showCount = true }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [articles]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 320; // Card width + gap
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const accentStyles = accentColor === 'amber'
    ? { bg: 'from-amber-50 to-orange-50', border: 'border-amber-100', text: 'text-amber-700', iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500' }
    : { bg: 'from-brand-50 to-violet-50', border: 'border-brand-100', text: 'text-brand-700', iconBg: 'bg-gradient-to-br from-brand-400 to-violet-500' };

  return (
    <div className="relative">
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 p-4 rounded-xl bg-gradient-to-r ${accentStyles.bg} border ${accentStyles.border}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className={`p-1.5 rounded-lg transition-transform ${collapsed ? 'rotate-0' : 'rotate-90'}`}>
            <ChevronRight size={18} className="text-slate-500" />
          </div>
          <div className={`p-2 rounded-xl shadow-md ${accentStyles.iconBg}`}>
            {React.cloneElement(icon as React.ReactElement, { className: 'text-white', size: 18 })}
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            {showCount && (
              <span className={`
                inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold min-w-[28px]
                shadow-md border backdrop-blur-sm
                ${accentColor === 'amber'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white border-amber-300/50 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-brand-500 to-violet-500 text-white border-brand-400/50 shadow-brand-500/30'
                }
              `}>
                {articles.length}
              </span>
            )}
          </div>
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-2.5 rounded-xl bg-white/80 border border-white shadow-sm text-slate-600 hover:bg-white hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-2.5 rounded-xl bg-white/80 border border-white shadow-sm text-slate-600 hover:bg-white hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Cards Container - collapsible */}
      {!collapsed && (
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onClick={() => onArticleClick(article)}
              accentColor={accentColor}
              showRevenueOwner={showRevenueOwner}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// News Card Component
const NewsCard: React.FC<{
  article: NewsArticle;
  onClick: () => void;
  accentColor: 'amber' | 'brand';
  showRevenueOwner?: boolean;
}> = ({ article, onClick, accentColor, showRevenueOwner = false }) => {
  const accentHover = accentColor === 'amber'
    ? 'hover:border-amber-300 hover:shadow-amber-100'
    : 'hover:border-brand-300 hover:shadow-brand-100';

  return (
    <div
      onClick={onClick}
      className={`flex-shrink-0 w-[300px] bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all duration-300 group ${accentHover}`}
    >
      {/* Header with priority indicator and sent status */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {article.priority && (
            <span className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
              shadow-sm backdrop-blur-sm border
              ${article.priority === 'high'
                ? 'bg-gradient-to-r from-rose-500 via-rose-500 to-pink-500 text-white border-rose-400/50 shadow-rose-500/25'
                : article.priority === 'medium'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-400 to-orange-400 text-white border-amber-400/50 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-600 border-slate-300/50'
              }
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${article.priority === 'high' ? 'bg-white animate-pulse' : article.priority === 'medium' ? 'bg-white/80' : 'bg-slate-400'}`}></span>
              {article.priority === 'high' ? 'High' : article.priority === 'medium' ? 'Medium' : 'Low'}
            </span>
          )}
          {article.isSent && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-emerald-500/25 border border-emerald-400/50">
              <Send size={9} />
              Sent
            </span>
          )}
        </div>
        {article.sources && article.sources.length > 1 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 rounded-full text-[10px] font-semibold border border-slate-200/80 shadow-sm">
            <Link2 size={10} className="text-slate-400" />
            {article.sources.length}
          </span>
        )}
      </div>

      {/* Headline */}
      <h4 className="font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-brand-700 transition-colors">{article.headline}</h4>

      {/* Short Summary */}
      {(article.shortSummary || article.summary) && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {article.shortSummary || article.summary}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {showRevenueOwner && article.revenueOwners && article.revenueOwners.length > 0 && (
          article.revenueOwners.map((owner) => (
            <span key={owner.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-[11px] font-semibold shadow-md shadow-violet-500/20 border border-violet-400/30">
              <User size={11} />
              {owner.name}
            </span>
          ))
        )}
        {article.company && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 via-blue-50 to-cyan-50 text-blue-700 rounded-full text-[11px] font-semibold border border-blue-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
            <Building2 size={11} className="text-blue-500" />
            {article.company.name}
          </span>
        )}
        {article.person && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 via-purple-50 to-pink-50 text-purple-700 rounded-full text-[11px] font-semibold border border-purple-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
            <User size={11} className="text-purple-500" />
            {article.person.name}
          </span>
        )}
        {article.tag && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 via-emerald-50 to-teal-50 text-emerald-700 rounded-full text-[11px] font-semibold border border-emerald-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
            <Tag size={11} className="text-emerald-500" />
            {article.tag.name}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500 font-medium truncate max-w-[140px]">{article.sourceName || 'Unknown'}</span>
        <span className="text-xs text-slate-400">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
      </div>
    </div>
  );
};

// Article Detail Modal
const ArticleDetailModal: React.FC<{
  article: NewsArticle;
  onClose: () => void;
  onToggleSent: (articleId: string, currentStatus: boolean) => void;
}> = ({ article, onClose, onToggleSent }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    const summary = article.longSummary || article.shortSummary || article.summary || '';

    // HTML version with hyperlinked text for email clients
    const html = `<p><strong>${article.headline}</strong></p><p>${summary}</p><p><a href="${article.sourceUrl}">Link to Article</a></p>`;

    // Plain text fallback
    const plainText = `${article.headline}\n\n${summary}\n\nLink to Article: ${article.sourceUrl}`;

    try {
      // Try to copy as rich text (HTML) for email clients
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback to plain text if ClipboardItem not supported
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const priorityConfig: Record<string, { bg: string; text: string; border: string }> = {
    high: { bg: 'bg-gradient-to-r from-rose-500 to-rose-600', text: 'text-white', border: 'border-rose-400' },
    medium: { bg: 'bg-gradient-to-r from-amber-400 to-amber-500', text: 'text-white', border: 'border-amber-400' },
    low: { bg: 'bg-slate-200', text: 'text-slate-600', border: 'border-slate-300' },
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Header with gradient based on priority */}
        <div className={`relative p-6 ${
          article.priority === 'high'
            ? 'bg-gradient-to-br from-rose-500 to-rose-600'
            : article.priority === 'medium'
              ? 'bg-gradient-to-br from-amber-400 to-amber-500'
              : 'bg-gradient-to-br from-slate-700 to-slate-800'
        }`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {article.priority && (
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wide rounded-full mb-3">
                    {article.priority} Priority
                  </span>
                )}
                <h2 className="text-xl font-bold text-white leading-tight">{article.headline}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white/90 rounded-lg text-sm font-medium">
                    {article.sourceName}
                  </span>
                  {article.publishedAt && (
                    <span className="text-white/70 text-sm">
                      {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Tags Row */}
          <div className="flex flex-wrap gap-2.5">
            {article.company && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-blue-500/25 border border-blue-400/30 hover:shadow-xl hover:scale-105 transition-all cursor-default">
                <Building2 size={14} />
                {article.company.name}
              </span>
            )}
            {article.person && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-purple-500/25 border border-purple-400/30 hover:shadow-xl hover:scale-105 transition-all cursor-default">
                <User size={14} />
                {article.person.name}
              </span>
            )}
            {article.tag && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/25 border border-emerald-400/30 hover:shadow-xl hover:scale-105 transition-all cursor-default">
                <Tag size={14} />
                {article.tag.name}
              </span>
            )}
          </div>

          {/* Long Summary (or fall back to short summary or legacy summary) */}
          {(article.longSummary || article.shortSummary || article.summary) && (
            <div className="bg-slate-50 rounded-2xl p-5">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Newspaper size={16} className="text-slate-500" />
                Summary
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {article.longSummary || article.shortSummary || article.summary}
              </p>
            </div>
          )}

          {/* Why It Matters */}
          {article.whyItMatters && (
            <div className="bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100 rounded-2xl p-5">
              <h3 className="font-bold text-brand-800 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-brand-500" />
                Why It Matters
              </h3>
              <p className="text-brand-700 leading-relaxed">{article.whyItMatters}</p>
            </div>
          )}

          {/* Revenue Owners */}
          {article.revenueOwners && article.revenueOwners.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <User size={16} className="text-slate-500" />
                Relevant To
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {article.revenueOwners.map((owner) => (
                  <span key={owner.id} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-violet-500/25 border border-violet-400/30 hover:shadow-xl hover:scale-105 transition-all cursor-default">
                    <User size={14} />
                    {owner.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Multiple Sources */}
          {article.sources && article.sources.length > 0 ? (
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Link2 size={16} className="text-slate-500" />
                Sources
                <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-full text-xs font-bold shadow-sm min-w-[24px]">{article.sources.length}</span>
              </h3>
              <div className="space-y-2">
                {article.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl hover:from-brand-50 hover:to-white border border-slate-100 hover:border-brand-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 group-hover:bg-brand-100 rounded-lg transition-colors">
                        <Link2 size={14} className="text-slate-500 group-hover:text-brand-600" />
                      </div>
                      <span className="text-slate-700 font-medium group-hover:text-brand-700 transition-colors">{source.sourceName}</span>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-brand-500" />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all font-medium shadow-lg shadow-brand-500/30 hover:shadow-xl"
              >
                Read Full Article
                <ExternalLink size={16} />
              </a>
            )
          )}
        </div>

        {/* Footer with Copy and Sent Status */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
          <button
            onClick={handleCopyToClipboard}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              copied
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
            }`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy for Email'}
          </button>
          <button
            onClick={() => onToggleSent(article.id, article.isSent)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              article.isSent
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            <Send size={18} />
            {article.isSent ? 'Sent to Revenue Owner' : 'Mark as Sent'}
          </button>
        </div>
      </div>
    </div>
  );
};
