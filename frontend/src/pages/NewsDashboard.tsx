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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">News Intelligence</h2>
          <p className="text-slate-500 mt-1">
            {total} articles from tracked companies and people
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showSearch ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Search size={18} />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh News'}</span>
          </button>
        </div>
      </div>

      {/* Ad-Hoc Search Panel */}
      {showSearch && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Ad-Hoc Search</h3>
            <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              placeholder="Company name..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              type="text"
              value={searchPerson}
              onChange={(e) => setSearchPerson(e.target.value)}
              placeholder="Person name..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              onClick={handleSearch}
              disabled={searching || (!searchCompany.trim() && !searchPerson.trim())}
              className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {searching ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">{searchResults.length} results</span>
                <button onClick={clearResults} className="text-sm text-slate-400 hover:text-slate-600">
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((article, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="font-medium text-slate-800 text-sm">{article.headline}</div>
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
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-brand-600 hover:text-brand-700">
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Revenue Owner</label>
              <select
                value={filters.revenueOwnerId || ''}
                onChange={(e) => setFilters({ ...filters, revenueOwnerId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All owners</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Company</label>
              <select
                value={filters.companyId || ''}
                onChange={(e) => setFilters({ ...filters, companyId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Topic</label>
              <select
                value={filters.tagId || ''}
                onChange={(e) => setFilters({ ...filters, tagId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All topics</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: (e.target.value as 'high' | 'medium') || undefined })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Sent Status</label>
              <select
                value={filters.isSent === undefined ? '' : filters.isSent ? 'true' : 'false'}
                onChange={(e) => setFilters({ ...filters, isSent: e.target.value === '' ? undefined : e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
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
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock size={14} />
          <span>Last refreshed: {formatDate(status.lastRefreshedAt)}</span>
          {status.articlesFound > 0 && (
            <span className="text-slate-400">({status.articlesFound} articles found)</span>
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
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Newspaper className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No News Yet</h3>
          <p className="text-slate-500 mb-4">
            {owners.length === 0
              ? 'Set up Revenue Owners with companies to track, then refresh to fetch news.'
              : 'Click "Refresh News" to fetch the latest articles for your tracked entities.'}
          </p>
          {owners.length === 0 ? (
            <button
              onClick={() => onNavigate('/news/setup')}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Go to Setup
            </button>
          ) : (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {refreshing ? 'Refreshing...' : 'Refresh News'}
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {articlesLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-slate-400" size={32} />
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {refreshing ? (
              <Loader2 className="animate-spin text-brand-600" size={24} />
            ) : status.lastError ? (
              <AlertCircle className="text-rose-500" size={24} />
            ) : (
              <CheckCircle2 className="text-emerald-500" size={24} />
            )}
            <div>
              <h3 className="font-semibold text-slate-800">
                {refreshing ? 'Refreshing News' : status.lastError ? 'Refresh Failed' : 'Refresh Complete'}
              </h3>
              <p className="text-sm text-slate-500">{status.progressMessage}</p>
            </div>
          </div>
          {!refreshing && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              status.lastError ? 'bg-rose-500' : 'bg-brand-600'
            }`}
            style={{ width: `${status.progress}%` }}
          />
        </div>

        {/* Steps */}
        {status.steps && status.steps.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {status.steps.map((step: any, index: number) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-2 rounded-lg ${
                  step.status === 'in_progress' ? 'bg-brand-50' : ''
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                ) : step.status === 'in_progress' ? (
                  <Loader2 size={18} className="text-brand-600 animate-spin mt-0.5 flex-shrink-0" />
                ) : step.status === 'error' ? (
                  <AlertCircle size={18} className="text-rose-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle size={18} className="text-slate-300 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${
                    step.status === 'in_progress' ? 'font-medium text-brand-700' :
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
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-brand-600">{status.stats.layer1Articles}</div>
                <div className="text-xs text-slate-500">Layer 1 (RSS/API)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-violet-600">{status.stats.layer2Articles}</div>
                <div className="text-xs text-slate-500">Layer 2 (AI)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{status.stats.afterProcessing}</div>
                <div className="text-xs text-slate-500">Final Articles</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {status.lastError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg">
            <p className="text-sm text-rose-700">{status.lastError}</p>
          </div>
        )}
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

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          {showCount && <span className="text-sm text-slate-400">({articles.length})</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
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
  const priorityColors: Record<string, string> = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-slate-400',
  };

  const accentBorder = accentColor === 'amber' ? 'hover:border-amber-300' : 'hover:border-brand-300';

  return (
    <div
      onClick={onClick}
      className={`flex-shrink-0 w-72 bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all ${accentBorder}`}
    >
      {/* Header with priority indicator and sent status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {article.priority && (
            <span className={`w-2 h-2 rounded-full ${priorityColors[article.priority]}`} />
          )}
          {article.isSent && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <Send size={10} />
              Sent
            </span>
          )}
        </div>
        {article.sources && article.sources.length > 1 && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Link2 size={10} />
            {article.sources.length} sources
          </span>
        )}
      </div>

      {/* Headline */}
      <h4 className="font-semibold text-slate-800 line-clamp-2 mb-2">{article.headline}</h4>

      {/* Short Summary */}
      {(article.shortSummary || article.summary) && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {article.shortSummary || article.summary}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {showRevenueOwner && article.revenueOwners && article.revenueOwners.length > 0 && (
          article.revenueOwners.map((owner) => (
            <span key={owner.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium">
              <User size={10} />
              {owner.name}
            </span>
          ))
        )}
        {article.company && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
            <Building2 size={10} />
            {article.company.name}
          </span>
        )}
        {article.person && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
            <User size={10} />
            {article.person.name}
          </span>
        )}
        {article.tag && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs">
            <Tag size={10} />
            {article.tag.name}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="truncate max-w-[120px]">{article.sourceName || 'Unknown'}</span>
        <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
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

  const handleCopyToClipboard = () => {
    const summary = article.longSummary || article.shortSummary || article.summary || '';
    const text = `${article.headline}\n\n${summary}\n\n${article.sourceUrl}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-slate-900">{article.headline}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
              <span>{article.sourceName}</span>
              {article.publishedAt && (
                <>
                  <span>-</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Tags Row */}
          <div className="flex flex-wrap gap-2">
            {article.priority && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                article.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                article.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {article.priority.charAt(0).toUpperCase() + article.priority.slice(1)} Priority
              </span>
            )}
            {article.company && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1">
                <Building2 size={14} />
                {article.company.name}
              </span>
            )}
            {article.person && (
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm flex items-center gap-1">
                <User size={14} />
                {article.person.name}
              </span>
            )}
            {article.tag && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm flex items-center gap-1">
                <Tag size={14} />
                {article.tag.name}
              </span>
            )}
          </div>

          {/* Long Summary (or fall back to short summary or legacy summary) */}
          {(article.longSummary || article.shortSummary || article.summary) && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Summary</h3>
              <p className="text-slate-600">
                {article.longSummary || article.shortSummary || article.summary}
              </p>
            </div>
          )}

          {/* Why It Matters */}
          {article.whyItMatters && (
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-4">
              <h3 className="font-semibold text-brand-800 mb-2">Why It Matters</h3>
              <p className="text-brand-700">{article.whyItMatters}</p>
            </div>
          )}

          {/* Revenue Owners */}
          {article.revenueOwners && article.revenueOwners.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Relevant To</h3>
              <div className="flex flex-wrap gap-2">
                {article.revenueOwners.map((owner) => (
                  <span key={owner.id} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                    {owner.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Multiple Sources */}
          {article.sources && article.sources.length > 0 ? (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Sources ({article.sources.length})</h3>
              <div className="space-y-2">
                {article.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Link2 size={16} className="text-slate-400" />
                      <span className="text-slate-700">{source.sourceName}</span>
                    </div>
                    <ExternalLink size={14} className="text-slate-400" />
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
                className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
              >
                Read Full Article
                <ExternalLink size={16} />
              </a>
            )
          )}
        </div>

        {/* Footer with Copy and Sent Status */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={handleCopyToClipboard}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              copied
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy for Email'}
          </button>
          <button
            onClick={() => onToggleSent(article.id, article.isSent)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              article.isSent
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            <Send size={16} />
            {article.isSent ? 'Sent' : 'Not Sent'}
          </button>
        </div>
      </div>
    </div>
  );
};
