/**
 * News Dashboard Page
 * Grid-based layout with collapsible per-revenue-owner sections
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronUp,
  X,
  Loader2,
  Newspaper,
  CheckCircle2,
  Circle,
  Send,
  Link2,
  Check,
  Mail,
  Archive,
  Sparkles,
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
  archiveArticle,
  toggleArticleSent,
  bulkArchiveArticles,
  bulkSendArticles,
} from '../services/newsManager';
import { resolveCompanyApi, CompanySuggestion } from '../services/researchManager';

interface NewsDashboardProps {
  onNavigate: (path: string) => void;
}

export const NewsDashboard: React.FC<NewsDashboardProps> = ({ onNavigate }) => {
  // Filters state - default to showing new (non-archived) articles
  const [filters, setFilters] = useState<ArticleFilters>({ isArchived: false });
  const [showFilters, setShowFilters] = useState(false);

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

  // Progress popup state
  const [showProgressPopup, setShowProgressPopup] = useState(false);

  // Data hooks
  const { articles, total, loading: articlesLoading, fetchArticles } = useNewsArticles(filters);
  const { owners } = useRevenueOwners();
  const { tags } = useNewsTags();
  const { companies } = useTrackedCompanies();
  const { status, refreshing, refresh, fetchStatus } = useNewsRefresh();
  const { results: searchResults, searching, search, clearResults } = useNewsSearch();

  // Show progress popup when refresh starts (local or detected from backend)
  useEffect(() => {
    if (refreshing || status.isRefreshing) {
      setShowProgressPopup(true);
    }
  }, [refreshing, status.isRefreshing]);

  // Poll status while refreshing - use BOTH local state AND backend state
  // This handles cases where the initial POST request times out but backend keeps running
  useEffect(() => {
    if (!refreshing && !status.isRefreshing) return;
    const interval = setInterval(() => {
      fetchStatus();
    }, 1000);
    return () => clearInterval(interval);
  }, [refreshing, status.isRefreshing, fetchStatus]);

  const handleRefresh = async () => {
    try {
      setShowProgressPopup(true);
      const result = await refresh(refreshDays);
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
    setFilters({ isArchived: false });
  };

  // Check if any filters are active beyond the default
  // Status filter is active when: sent=true or archived=true (not when "all" or "new")
  const hasActiveFilters = !!(
    filters.revenueOwnerId ||
    filters.companyId ||
    filters.personId ||
    filters.tagId ||
    filters.isSent === true ||
    filters.isArchived === true
  );

  // Handle sending email and marking as sent + archived
  const handleSendEmail = async (article: NewsArticle, selectedOwners?: { id: string; name: string; email: string | null }[]) => {
    // Get email recipients - use selectedOwners if provided (Deep Dive), otherwise from article's revenue owners
    let recipients: { id: string; name: string; email: string | null }[];
    if (selectedOwners && selectedOwners.length > 0) {
      recipients = selectedOwners.filter(o => o.email);
    } else {
      recipients = article.revenueOwners.filter(ro => ro.email);
    }
    if (recipients.length === 0) return;

    const toEmail = recipients[0]?.email || '';
    const ccEmails = recipients.slice(1).map(ro => ro.email).join(',');

    // Build email content
    const summary = article.longSummary || article.shortSummary || article.summary || '';
    const whyItMatters = article.whyItMatters || '';
    const tagText = article.tag ? article.tag.name : '';

    // Build email body
    const bodyParts = [];
    if (summary) bodyParts.push(`Summary:\n${summary}`);
    if (whyItMatters) bodyParts.push(`Why it Matters:\n${whyItMatters}`);
    if (tagText) bodyParts.push(`Tags:\n${tagText}`);
    bodyParts.push(`Link: ${article.sourceUrl}`);
    const body = bodyParts.join('\n\n');

    // Build mailto URL using encodeURIComponent (not URLSearchParams which uses + for spaces)
    let mailtoUrl = `mailto:${encodeURIComponent(toEmail)}`;
    const params = [];
    if (ccEmails) params.push(`cc=${encodeURIComponent(ccEmails)}`);
    params.push(`subject=${encodeURIComponent(article.headline)}`);
    params.push(`body=${encodeURIComponent(body)}`);
    mailtoUrl += '?' + params.join('&');

    // Open email client
    window.location.href = mailtoUrl;

    // Mark as sent (but don't archive - they are mutually exclusive)
    try {
      await toggleArticleSent(article.id, true);
      await fetchArticles();
      // Update selected article
      if (selectedArticle && selectedArticle.id === article.id) {
        setSelectedArticle({ ...selectedArticle, isSent: true });
      }
    } catch (err) {
      console.error('Failed to update article:', err);
    }
  };

  // Handle archiving without sending
  const handleArchive = async (articleId: string) => {
    try {
      await archiveArticle(articleId, true);
      await fetchArticles();
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle({ ...selectedArticle, isArchived: true });
      }
    } catch (err) {
      console.error('Failed to archive article:', err);
    }
  };

  // Toggle selection of an article
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

  // Handle bulk archive
  const handleBulkArchive = async () => {
    if (selectedArticleIds.size === 0) return;
    try {
      await bulkArchiveArticles(Array.from(selectedArticleIds));
      setSelectedArticleIds(new Set());
      await fetchArticles();
    } catch (err) {
      console.error('Failed to bulk archive articles:', err);
    }
  };

  // Handle bulk archive by specific IDs (for section-level actions)
  const handleBulkArchiveByIds = async (articleIds: string[]) => {
    if (articleIds.length === 0) return;
    try {
      await bulkArchiveArticles(articleIds);
      // Remove these IDs from selection
      setSelectedArticleIds(prev => {
        const newSet = new Set(prev);
        articleIds.forEach(id => newSet.delete(id));
        return newSet;
      });
      await fetchArticles();
    } catch (err) {
      console.error('Failed to bulk archive articles:', err);
    }
  };

  // Handle bulk send - creates a digest email with all selected articles
  const handleBulkSend = async () => {
    if (selectedArticleIds.size === 0) return;

    // Get the selected articles
    const selectedArticles = articles.filter(a => selectedArticleIds.has(a.id));
    if (selectedArticles.length === 0) return;

    // Collect all revenue owners from selected articles
    const allOwners = new Map<string, { id: string; name: string; email: string | null }>();
    selectedArticles.forEach(article => {
      article.revenueOwners.forEach(owner => {
        if (owner.email && !allOwners.has(owner.id)) {
          allOwners.set(owner.id, owner);
        }
      });
    });

    const ownersWithEmail = Array.from(allOwners.values());
    if (ownersWithEmail.length === 0) {
      alert('No email addresses configured for revenue owners. Add emails in News Setup.');
      return;
    }

    // Build subject line
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const subject = `SSAMI News Digest - ${today}`;

    // Build email body with all selected stories
    const bodyParts: string[] = [];
    bodyParts.push(`News Digest - ${today}`);
    bodyParts.push('');
    bodyParts.push('='.repeat(50));

    selectedArticles.forEach((article, index) => {
      bodyParts.push('');
      bodyParts.push(`${index + 1}. ${article.headline}`);
      bodyParts.push('-'.repeat(40));

      const summary = article.longSummary || article.shortSummary || article.summary || '';
      if (summary) {
        bodyParts.push('');
        bodyParts.push(`Summary: ${summary}`);
      }

      if (article.whyItMatters) {
        bodyParts.push('');
        bodyParts.push(`Why it Matters: ${article.whyItMatters}`);
      }

      if (article.company) {
        bodyParts.push(`Company: ${article.company.name}`);
      }
      if (article.person) {
        bodyParts.push(`Person: ${article.person.name}`);
      }
      if (article.tag) {
        bodyParts.push(`Topic: ${article.tag.name}`);
      }

      bodyParts.push('');
      bodyParts.push(`Link: ${article.sourceUrl}`);
      bodyParts.push('');
      bodyParts.push('='.repeat(50));
    });

    const body = bodyParts.join('\n');

    // Build mailto URL
    const toEmail = ownersWithEmail[0]?.email || '';
    const ccEmails = ownersWithEmail.slice(1).map(ro => ro.email).join(',');

    let mailtoUrl = `mailto:${encodeURIComponent(toEmail)}`;
    const params = [];
    if (ccEmails) params.push(`cc=${encodeURIComponent(ccEmails)}`);
    params.push(`subject=${encodeURIComponent(subject)}`);
    params.push(`body=${encodeURIComponent(body)}`);
    mailtoUrl += '?' + params.join('&');

    // Open email client
    window.location.href = mailtoUrl;

    // Mark all selected as sent and archive them
    try {
      await bulkSendArticles(Array.from(selectedArticleIds));
      setSelectedArticleIds(new Set());
      await fetchArticles();
    } catch (err) {
      console.error('Failed to bulk send articles:', err);
    }
  };

  // Handle bulk send by specific IDs (for section-level actions)
  const handleBulkSendByIds = async (articleIds: string[]) => {
    if (articleIds.length === 0) return;

    // Get the selected articles
    const selectedArticles = articles.filter(a => articleIds.includes(a.id));
    if (selectedArticles.length === 0) return;

    // Collect all revenue owners from selected articles
    const allOwners = new Map<string, { id: string; name: string; email: string | null }>();
    selectedArticles.forEach(article => {
      article.revenueOwners.forEach(owner => {
        if (owner.email && !allOwners.has(owner.id)) {
          allOwners.set(owner.id, owner);
        }
      });
    });

    const ownersWithEmail = Array.from(allOwners.values());
    if (ownersWithEmail.length === 0) {
      alert('No email addresses configured for revenue owners. Add emails in News Setup.');
      return;
    }

    // Build subject line
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const subject = `SSAMI News Digest - ${today}`;

    // Build email body with all selected stories
    const bodyParts: string[] = [];
    bodyParts.push(`News Digest - ${today}`);
    bodyParts.push('');
    bodyParts.push('='.repeat(50));

    selectedArticles.forEach((article, index) => {
      bodyParts.push('');
      bodyParts.push(`${index + 1}. ${article.headline}`);
      bodyParts.push('-'.repeat(40));

      const summary = article.longSummary || article.shortSummary || article.summary || '';
      if (summary) {
        bodyParts.push('');
        bodyParts.push(`Summary: ${summary}`);
      }

      if (article.whyItMatters) {
        bodyParts.push('');
        bodyParts.push(`Why it Matters: ${article.whyItMatters}`);
      }

      if (article.company) {
        bodyParts.push(`Company: ${article.company.name}`);
      }
      if (article.person) {
        bodyParts.push(`Person: ${article.person.name}`);
      }
      if (article.tag) {
        bodyParts.push(`Topic: ${article.tag.name}`);
      }

      bodyParts.push('');
      bodyParts.push(`Link: ${article.sourceUrl}`);
      bodyParts.push('');
      bodyParts.push('='.repeat(50));
    });

    const body = bodyParts.join('\n');

    // Build mailto URL
    const toEmail = ownersWithEmail[0]?.email || '';
    const ccEmails = ownersWithEmail.slice(1).map(ro => ro.email).join(',');

    let mailtoUrl = `mailto:${encodeURIComponent(toEmail)}`;
    const params = [];
    if (ccEmails) params.push(`cc=${encodeURIComponent(ccEmails)}`);
    params.push(`subject=${encodeURIComponent(subject)}`);
    params.push(`body=${encodeURIComponent(body)}`);
    mailtoUrl += '?' + params.join('&');

    // Open email client
    window.location.href = mailtoUrl;

    // Mark all selected as sent and archive them
    try {
      await bulkSendArticles(articleIds);
      // Remove these IDs from selection
      setSelectedArticleIds(prev => {
        const newSet = new Set(prev);
        articleIds.forEach(id => newSet.delete(id));
        return newSet;
      });
      await fetchArticles();
    } catch (err) {
      console.error('Failed to bulk send articles:', err);
    }
  };

  // Group articles by revenue owner
  const carouselData = useMemo(() => {
    // Sort by published date (newest first)
    const sortByDate = (a: NewsArticle, b: NewsArticle) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    };

    // Group by revenue owner
    const ownerArticles: Record<string, NewsArticle[]> = {};

    // Sort owners alphabetically
    const sortedOwners = [...owners].sort((a, b) => a.name.localeCompare(b.name));

    for (const owner of sortedOwners) {
      const ownerArts = articles
        .filter(a => a.revenueOwners.some(ro => ro.id === owner.id))
        .sort(sortByDate);

      if (ownerArts.length > 0) {
        ownerArticles[owner.id] = ownerArts;
      }
    }

    return { ownerArticles, sortedOwners };
  }, [articles, owners]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            <div className="flex items-center gap-2">
              <select
                value={refreshDays}
                onChange={(e) => setRefreshDays(Number(e.target.value))}
                className="px-3 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl outline-none focus:ring-2 focus:ring-brand-400/50 transition-all backdrop-blur-sm cursor-pointer text-sm font-medium"
              >
                {timePeriodOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="text-slate-800">{opt.label}</option>
                ))}
              </select>
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
      </div>

      {/* Deep Dive Search Panel - Always visible */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-100 rounded-lg">
              <Search size={16} className="text-brand-600" />
            </div>
            <h3 className="font-semibold text-slate-800">Deep Dive</h3>
            <span className="text-xs text-slate-400">Search any company or person</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Status</label>
              <select
                value={
                  filters.isSent === true ? 'sent' :
                  filters.isArchived === true ? 'archived' :
                  filters.isArchived === false ? 'new' :
                  'all'
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all') {
                    setFilters({ ...filters, isSent: undefined, isArchived: undefined });
                  } else if (value === 'new') {
                    setFilters({ ...filters, isSent: undefined, isArchived: false });
                  } else if (value === 'sent') {
                    setFilters({ ...filters, isSent: true, isArchived: undefined });
                  } else if (value === 'archived') {
                    setFilters({ ...filters, isSent: undefined, isArchived: true });
                  }
                }}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all bg-slate-50 hover:bg-white cursor-pointer"
              >
                <option value="all">All</option>
                <option value="new">New</option>
                <option value="sent">Sent</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      )}

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

      {/* News Sections */}
      {!articlesLoading && articles.length > 0 && (
        <div className="space-y-4">
          {/* Revenue Owner Sections */}
          {carouselData.sortedOwners.map((owner) => {
            const ownerArts = carouselData.ownerArticles[owner.id];
            if (!ownerArts || ownerArts.length === 0) return null;

            return (
              <NewsSection
                key={owner.id}
                title={owner.name}
                icon={<User size={20} className="text-brand-600" />}
                articles={ownerArts}
                onArticleClick={setSelectedArticle}
                accentColor="brand"
                selectedIds={selectedArticleIds}
                onToggleSelection={toggleArticleSelection}
                onBulkSend={handleBulkSendByIds}
                onBulkArchive={handleBulkArchiveByIds}
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
          onSendEmail={handleSendEmail}
          onArchive={handleArchive}
          allOwners={owners}
        />
      )}

      {/* Deep Dive Search Progress Popup */}
      {showSearchProgress && (
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
      )}

      {/* Company Resolution Modal */}
      {resolveModalOpen && (
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

// News Section Component (Grid Layout)
const NewsSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  articles: NewsArticle[];
  onArticleClick: (article: NewsArticle) => void;
  accentColor: 'amber' | 'brand';
  showRevenueOwner?: boolean;
  showCount?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (articleId: string, event: React.MouseEvent) => void;
  onBulkSend?: (articleIds: string[]) => void;
  onBulkArchive?: (articleIds: string[]) => void;
}> = ({ title, icon, articles, onArticleClick, accentColor, showRevenueOwner = false, showCount = true, selectedIds, onToggleSelection, onBulkSend, onBulkArchive }) => {
  const [collapsed, setCollapsed] = useState(true);

  // Count how many articles in this section are selected
  const selectedInSection = articles.filter(a => selectedIds?.has(a.id)).length;
  const hasSelection = selectedInSection > 0;

  const accentStyles = accentColor === 'amber'
    ? { bg: 'from-amber-50 to-orange-50', border: 'border-amber-100', text: 'text-amber-700', iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500' }
    : { bg: 'from-brand-50 to-violet-50', border: 'border-brand-100', text: 'text-brand-700', iconBg: 'bg-gradient-to-br from-brand-400 to-violet-500' };

  const handleSectionSend = () => {
    if (!hasSelection || !onBulkSend) return;
    const selectedArticleIds = articles.filter(a => selectedIds?.has(a.id)).map(a => a.id);
    onBulkSend(selectedArticleIds);
  };

  const handleSectionArchive = () => {
    if (!hasSelection || !onBulkArchive) return;
    const selectedArticleIds = articles.filter(a => selectedIds?.has(a.id)).map(a => a.id);
    onBulkArchive(selectedArticleIds);
  };

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

        {/* Send and Archive buttons */}
        <div className="flex items-center gap-2">
          {hasSelection && (
            <span className="text-sm font-medium text-slate-600 mr-2">
              {selectedInSection} selected
            </span>
          )}
          <button
            onClick={handleSectionSend}
            disabled={!hasSelection}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              hasSelection
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600'
                : 'bg-slate-200/80 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={16} />
            <span className="hidden sm:inline">Send</span>
          </button>
          <button
            onClick={handleSectionArchive}
            disabled={!hasSelection}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              hasSelection
                ? 'bg-slate-600 text-white shadow-md hover:bg-slate-700'
                : 'bg-slate-200/80 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Archive size={16} />
            <span className="hidden sm:inline">Archive</span>
          </button>
        </div>
      </div>

      {/* Cards Grid - collapsible */}
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onClick={() => onArticleClick(article)}
              accentColor={accentColor}
              showRevenueOwner={showRevenueOwner}
              isSelected={selectedIds?.has(article.id) || false}
              onToggleSelection={onToggleSelection}
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
  isSelected?: boolean;
  onToggleSelection?: (articleId: string, event: React.MouseEvent) => void;
}> = ({ article, onClick, accentColor, showRevenueOwner = false, isSelected = false, onToggleSelection }) => {
  const accentHover = accentColor === 'amber'
    ? 'hover:border-amber-300 hover:shadow-amber-100'
    : 'hover:border-brand-300 hover:shadow-brand-100';

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all duration-300 group ${accentHover} ${
        isSelected ? 'border-brand-400 ring-2 ring-brand-200 shadow-brand-100' : 'border-slate-200'
      }`}
    >
      {/* Header with checkbox and status badges */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Selection checkbox */}
          {onToggleSelection && (
            <button
              onClick={(e) => onToggleSelection(article.id, e)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-slate-300 hover:border-brand-400 bg-white'
              }`}
            >
              {isSelected && <Check size={12} strokeWidth={3} />}
            </button>
          )}
          {article.isSent && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-emerald-500/25 border border-emerald-400/50">
              <Send size={9} />
              Sent
            </span>
          )}
          {article.isArchived && !article.isSent && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-slate-500/25 border border-slate-400/50">
              <Check size={9} />
              Archived
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
  onSendEmail: (article: NewsArticle, selectedOwners?: { id: string; name: string; email: string | null }[]) => void;
  onArchive: (articleId: string) => void;
  allOwners: { id: string; name: string; email?: string | null }[];
}> = ({ article, onClose, onSendEmail, onArchive, allOwners }) => {
  // State for manually selected revenue owners (for Deep Dive results)
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<Set<string>>(new Set());

  // Get email recipients from revenue owners (assigned or manually selected)
  const assignedRecipients = article.revenueOwners
    .filter(ro => ro.email)
    .map(ro => ({ id: ro.id, name: ro.name, email: ro.email }));

  // Get selected owners for Deep Dive results
  const selectedRecipients = Array.from(selectedOwnerIds)
    .map(id => allOwners.find(o => o.id === id))
    .filter((o): o is { id: string; name: string; email?: string | null } => !!o && !!o.email)
    .map(o => ({ id: o.id, name: o.name, email: o.email! }));

  const recipientEmails = assignedRecipients.length > 0 ? assignedRecipients : selectedRecipients;
  const hasRecipients = recipientEmails.length > 0;
  const hasAssignedOwners = article.revenueOwners && article.revenueOwners.length > 0;

  // Filter owners with email addresses for dropdown
  const ownersWithEmail = allOwners.filter(o => o.email);

  const toggleOwnerSelection = (ownerId: string) => {
    setSelectedOwnerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ownerId)) {
        newSet.delete(ownerId);
      } else {
        newSet.add(ownerId);
      }
      return newSet;
    });
  };

  const handleSendEmail = () => {
    if (assignedRecipients.length > 0) {
      onSendEmail(article);
    } else {
      onSendEmail(article, selectedRecipients);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative p-6 bg-gradient-to-br from-brand-600 to-violet-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
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

        {/* Footer with Recipients and Actions */}
        <div className="p-6 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 space-y-4">
          {/* Status badges */}
          <div className="flex items-center gap-2">
            {article.isSent && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium">
                <Send size={14} />
                Sent
              </span>
            )}
            {article.isArchived && !article.isSent && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-sm font-medium">
                <Check size={14} />
                Archived
              </span>
            )}
          </div>

          {/* Recipients display */}
          {hasAssignedOwners ? (
            // Article has assigned revenue owners
            hasRecipients ? (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Will be sent to
                </label>
                <div className="flex flex-wrap gap-2">
                  {recipientEmails.map((recipient, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm">
                      <Mail size={14} className="text-slate-400" />
                      <span className="font-medium text-slate-700">{recipient.name}</span>
                      <span className="text-slate-400">({recipient.email})</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle size={16} />
                  No email addresses configured for revenue owners. Add emails in News Setup.
                </p>
              </div>
            )
          ) : (
            // Deep Dive result - show owner selection dropdown
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Select Revenue Owner(s) to Send To
              </label>
              {ownersWithEmail.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {ownersWithEmail.map((owner) => (
                      <button
                        key={owner.id}
                        onClick={() => toggleOwnerSelection(owner.id)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedOwnerIds.has(owner.id)
                            ? 'bg-brand-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {selectedOwnerIds.has(owner.id) ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Circle size={14} />
                        )}
                        {owner.name}
                      </button>
                    ))}
                  </div>
                  {selectedRecipients.length > 0 && (
                    <div className="p-2 bg-brand-50 border border-brand-200 rounded-lg">
                      <p className="text-xs text-brand-600">
                        Will send to: {selectedRecipients.map(r => r.email).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <AlertCircle size={16} />
                    No revenue owners with email addresses. Add emails in News Setup.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3">
            {!article.isArchived && (
              <button
                onClick={() => onArchive(article.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all bg-slate-200 text-slate-600 hover:bg-slate-300"
              >
                <Archive size={16} />
                Archive
              </button>
            )}
            <button
              onClick={handleSendEmail}
              disabled={!hasRecipients}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ml-auto ${
                !hasRecipients
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 hover:from-brand-600 hover:to-brand-700 hover:shadow-xl'
              }`}
            >
              <Send size={18} />
              {article.isSent ? 'Send Again' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
