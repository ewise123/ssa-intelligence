/**
 * News Intelligence Manager
 * Hooks and API functions for the News Intelligence feature
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// ============================================================================
// Types
// ============================================================================

export interface NewsTag {
  id: string;
  name: string;
  category: 'universal' | 'pe' | 'industrials';
  createdAt: string;
  _count?: {
    callDiets: number;
    articles: number;
  };
}

export interface TrackedCompany {
  id: string;
  name: string;
  ticker: string | null;
  cik: string | null;
  createdAt: string;
  _count?: {
    callDiets: number;
    articles: number;
  };
}

export interface TrackedPerson {
  id: string;
  name: string;
  title: string | null;
  companyAffiliation: string | null;
  companyId: string | null;
  company?: {
    id: string;
    name: string;
    ticker: string | null;
  } | null;
  createdAt: string;
  _count?: {
    callDiets: number;
    articles: number;
  };
}

export interface ArticleSource {
  id: string;
  sourceUrl: string;
  sourceName: string;
  fetchLayer: 'layer1_rss' | 'layer1_api' | 'layer2_llm' | null;
  fetchedAt: string;
}

export interface NewsArticle {
  id: string;
  headline: string;
  shortSummary: string | null;
  longSummary: string | null;
  summary: string | null;
  whyItMatters: string | null;
  sourceUrl: string;
  sourceName: string | null;
  sources: ArticleSource[];
  publishedAt: string | null;
  fetchedAt: string;
  status: 'new_article' | 'update' | null;
  isSent: boolean;
  isArchived: boolean;
  matchType: 'exact' | 'contextual' | null;
  fetchLayer: 'layer1_rss' | 'layer1_api' | 'layer2_llm' | null;
  company: TrackedCompany | null;
  person: TrackedPerson | null;
  tag: NewsTag | null;
  users: { id: string; name: string | null; email: string }[];
}

export interface RefreshStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  detail?: string;
}

export interface RefreshStatus {
  isRefreshing: boolean;
  lastRefreshedAt: string | null;
  lastError: string | null;
  articlesFound: number;
  coverageGaps: { company: string; note: string }[];
  progress: number;
  progressMessage: string;
  currentStep: string;
  steps: RefreshStep[];
  layerErrors?: {
    layer1Error?: string;
    layer2Error?: string;
  };
}

// ============================================================================
// API Helpers
// ============================================================================

const fetchJson = async (path: string, options?: RequestInit) => {
  const url = `${API_BASE.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
};

// ============================================================================
// Tags Hook
// ============================================================================

export const useNewsTags = () => {
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJson('/news/tags');
      setTags(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (name: string, category: string) => {
    const tag = await fetchJson('/news/tags', {
      method: 'POST',
      body: JSON.stringify({ name, category }),
    });
    setTags(prev => [...prev, tag]);
    return tag;
  };

  const deleteTag = async (id: string) => {
    await fetchJson(`/news/tags/${id}`, { method: 'DELETE' });
    setTags(prev => prev.filter(t => t.id !== id));
  };

  return { tags, loading, error, fetchTags, createTag, deleteTag };
};

// ============================================================================
// Companies Hook
// ============================================================================

export const useTrackedCompanies = () => {
  const [companies, setCompanies] = useState<TrackedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJson('/news/companies');
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const createCompany = async (name: string, ticker?: string) => {
    const company = await fetchJson('/news/companies', {
      method: 'POST',
      body: JSON.stringify({ name, ticker }),
    });
    setCompanies(prev => [...prev, company]);
    return company;
  };

  const updateCompany = async (id: string, data: { name?: string; ticker?: string | null; cik?: string | null }) => {
    const company = await fetchJson(`/news/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, ...company } : c)));
    return company;
  };

  const deleteCompany = async (id: string) => {
    await fetchJson(`/news/companies/${id}`, { method: 'DELETE' });
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  return { companies, loading, error, fetchCompanies, createCompany, updateCompany, deleteCompany };
};

// ============================================================================
// People Hook
// ============================================================================

export const useTrackedPeople = () => {
  const [people, setPeople] = useState<TrackedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeople = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJson('/news/people');
      setPeople(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch people');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const createPerson = async (name: string, title?: string) => {
    const person = await fetchJson('/news/people', {
      method: 'POST',
      body: JSON.stringify({ name, title }),
    });
    setPeople(prev => [...prev, person]);
    return person;
  };

  const updatePerson = async (id: string, data: { name?: string; title?: string | null; companyId?: string | null; companyAffiliation?: string | null }) => {
    const person = await fetchJson(`/news/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setPeople(prev => prev.map(p => (p.id === id ? { ...p, ...person } : p)));
    return person;
  };

  const deletePerson = async (id: string) => {
    await fetchJson(`/news/people/${id}`, { method: 'DELETE' });
    setPeople(prev => prev.filter(p => p.id !== id));
  };

  return { people, loading, error, fetchPeople, createPerson, updatePerson, deletePerson };
};

// ============================================================================
// Revenue Owners Hook
// ============================================================================

// ============================================================================
// Articles Hook
// ============================================================================

export interface ArticleFilters {
  userId?: string;
  companyId?: string;
  personId?: string;
  tagId?: string;
  isSent?: boolean;
  isArchived?: boolean;
}

export const useNewsArticles = (filters?: ArticleFilters) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);

  // Reset page when filters change
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    setPage(0);
  }, [filtersKey]);

  const fetchArticles = useCallback(async (overridePage?: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.userId) params.set('userId', filters.userId);
      if (filters?.companyId) params.set('companyId', filters.companyId);
      if (filters?.personId) params.set('personId', filters.personId);
      if (filters?.tagId) params.set('tagId', filters.tagId);
      if (filters?.isSent !== undefined) params.set('isSent', String(filters.isSent));
      if (filters?.isArchived !== undefined) params.set('isArchived', String(filters.isArchived));

      const currentPage = overridePage ?? page;
      params.set('limit', String(pageSize));
      params.set('offset', String(currentPage * pageSize));

      const queryString = params.toString();
      const data = await fetchJson(`/news/articles${queryString ? `?${queryString}` : ''}`);
      setArticles(data.articles);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [filters?.userId, filters?.companyId, filters?.personId, filters?.tagId, filters?.isSent, filters?.isArchived, page, pageSize]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const totalPages = Math.ceil(total / pageSize);

  return { articles, total, loading, error, fetchArticles, page, pageSize, setPage, totalPages };
};

// ============================================================================
// Refresh Hook
// ============================================================================

export const useNewsRefresh = () => {
  const [status, setStatus] = useState<RefreshStatus>({
    isRefreshing: false,
    lastRefreshedAt: null,
    lastError: null,
    articlesFound: 0,
    coverageGaps: [],
    progress: 0,
    progressMessage: '',
    currentStep: '',
    steps: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await fetchJson('/news/refresh/status');
      setStatus(data);
    } catch (err) {
      // Ignore status fetch errors
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const refresh = async (days: number = 1): Promise<{ articlesFound: number; coverageGaps: any[] }> => {
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchJson('/news/refresh', {
        method: 'POST',
        body: JSON.stringify({ days }),
      });
      await fetchStatus();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Refresh failed';
      setError(errorMsg);
      throw err;
    } finally {
      setRefreshing(false);
    }
  };

  return { status, refreshing, error, refresh, fetchStatus };
};

// ============================================================================
// Ad-Hoc Search Hook
// ============================================================================

export const useNewsSearch = () => {
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (params: { company?: string; person?: string; topics?: string[]; days?: number }) => {
    setSearching(true);
    setError(null);
    try {
      const data = await fetchJson('/news/search', {
        method: 'POST',
        body: JSON.stringify({ ...params, days: params.days || 1 }),
      });
      setResults(data.articles || []);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Search failed';
      setError(errorMsg);
      throw err;
    } finally {
      setSearching(false);
    }
  };

  const clearResults = () => setResults([]);

  return { results, searching, error, search, clearResults };
};

// ============================================================================
// Toggle Article Sent Status
// ============================================================================

export const toggleArticleSent = async (articleId: string, isSent?: boolean): Promise<boolean> => {
  const data = await fetchJson(`/news/articles/${articleId}/sent`, {
    method: 'PATCH',
    body: JSON.stringify({ isSent }),
  });
  return data.isSent;
};

// ============================================================================
// Archive Article
// ============================================================================

export const archiveArticle = async (articleId: string, isArchived?: boolean): Promise<boolean> => {
  const data = await fetchJson(`/news/articles/${articleId}/archive`, {
    method: 'PATCH',
    body: JSON.stringify({ isArchived }),
  });
  return data.isArchived;
};

// ============================================================================
// Bulk Archive Articles
// ============================================================================

export const bulkArchiveArticles = async (articleIds: string[]): Promise<number> => {
  const data = await fetchJson('/news/articles/bulk-archive', {
    method: 'POST',
    body: JSON.stringify({ articleIds }),
  });
  return data.count;
};

// ============================================================================
// Bulk Send Articles (marks as sent and archives)
// ============================================================================

export const bulkSendArticles = async (articleIds: string[]): Promise<number> => {
  const data = await fetchJson('/news/articles/bulk-send', {
    method: 'POST',
    body: JSON.stringify({ articleIds }),
  });
  return data.count;
};

// ============================================================================
// User Call Diet Hook
// ============================================================================

export interface UserCallDiet {
  userId: string;
  name: string | null;
  email: string;
  companies: TrackedCompany[];
  people: TrackedPerson[];
  tags: NewsTag[];
}

export const useUserCallDiet = (userId: string | null) => {
  const [callDiet, setCallDiet] = useState<UserCallDiet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCallDiet = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await fetchJson(`/news/users/${userId}/call-diet`);
      setCallDiet(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch call diet');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCallDiet();
  }, [fetchCallDiet]);

  const addCompany = async (companyName: string, ticker?: string) => {
    if (!userId) return;
    await fetchJson(`/news/users/${userId}/call-diet/companies`, {
      method: 'POST',
      body: JSON.stringify({ name: companyName, ticker }),
    });
    await fetchCallDiet();
  };

  const removeCompany = async (companyId: string) => {
    if (!userId) return;
    await fetchJson(`/news/users/${userId}/call-diet/companies/${companyId}`, {
      method: 'DELETE',
    });
    await fetchCallDiet();
  };

  const bulkRemoveCompanies = async (companyIds: string[]) => {
    if (!userId) return;
    await fetchJson(`/news/users/${userId}/call-diet/companies/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ companyIds }),
    });
    await fetchCallDiet();
  };

  const addPerson = async (personName: string, companyAffiliation?: string) => {
    if (!userId) return;
    await fetchJson(`/news/users/${userId}/call-diet/people`, {
      method: 'POST',
      body: JSON.stringify({ name: personName, companyAffiliation }),
    });
    await fetchCallDiet();
  };

  const removePerson = async (personId: string) => {
    if (!userId) return;
    await fetchJson(`/news/users/${userId}/call-diet/people/${personId}`, {
      method: 'DELETE',
    });
    await fetchCallDiet();
  };

  const bulkRemovePeople = async (personIds: string[]) => {
    if (!userId) return;
    await fetchJson(`/news/users/${userId}/call-diet/people/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ personIds }),
    });
    await fetchCallDiet();
  };

  const addTag = async (tagId: string) => {
    if (!userId) return;
    await fetchJson(`/news/users/${userId}/call-diet/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagId }),
    });
    await fetchCallDiet();
  };

  const removeTag = async (tagId: string) => {
    if (!userId) return;
    await fetchJson(`/news/users/${userId}/call-diet/tags/${tagId}`, {
      method: 'DELETE',
    });
    await fetchCallDiet();
  };

  return {
    callDiet,
    loading,
    error,
    fetchCallDiet,
    addCompany,
    removeCompany,
    bulkRemoveCompanies,
    addPerson,
    removePerson,
    bulkRemovePeople,
    addTag,
    removeTag,
  };
};

// ============================================================================
// User Pinned Articles Hook
// ============================================================================

export const useUserPins = () => {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchPins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJson('/news/pins');
      setPinnedIds(new Set(data.articleIds || []));
    } catch {
      // Ignore pin fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  const pinArticle = async (articleId: string) => {
    await fetchJson(`/news/articles/${articleId}/pin`, { method: 'POST' });
    setPinnedIds(prev => new Set([...prev, articleId]));
  };

  const unpinArticle = async (articleId: string) => {
    await fetchJson(`/news/articles/${articleId}/pin`, { method: 'DELETE' });
    setPinnedIds(prev => {
      const next = new Set(prev);
      next.delete(articleId);
      return next;
    });
  };

  const isPinned = (articleId: string) => pinnedIds.has(articleId);

  return { pinnedIds, loading, fetchPins, pinArticle, unpinArticle, isPinned };
};

// ============================================================================
// Pin Search Result (save to DB and pin)
// ============================================================================

export const pinSearchResult = async (article: NewsArticle): Promise<{ articleId: string }> => {
  const data = await fetchJson('/news/articles/pin-from-data', {
    method: 'POST',
    body: JSON.stringify({
      headline: article.headline,
      sourceUrl: article.sourceUrl,
      sourceName: article.sourceName,
      company: article.company?.name ?? (article as any).company ?? null,
      person: article.person?.name ?? (article as any).person ?? null,
      category: article.tag?.name ?? null,
      shortSummary: article.shortSummary,
      longSummary: article.longSummary,
      summary: article.summary,
      whyItMatters: article.whyItMatters,
      publishedAt: article.publishedAt,
      matchType: article.matchType,
      fetchLayer: article.fetchLayer,
    }),
  });
  return { articleId: data.articleId };
};

// ============================================================================
// Export Articles
// ============================================================================

export const exportSearchResults = async (format: 'pdf' | 'markdown' | 'docx', articles: any[]) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = `${base}/news/export/${format}/from-data`;

  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles }),
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const ext = format === 'pdf' ? 'pdf' : format === 'docx' ? 'docx' : 'md';
  const filename = `sami-deep-dive-${new Date().toISOString().split('T')[0]}.${ext}`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

export const exportArticles = async (format: 'pdf' | 'markdown' | 'docx', articleIds: string[], userId?: string) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
  const base = API_BASE_URL.replace(/\/$/, '');

  let url: string;
  if (articleIds.length > 0) {
    // Export specific selected articles
    url = `${base}/news/export/${format}?articleIds=${articleIds.join(',')}`;
  } else if (userId) {
    // Fallback: export all user articles
    url = `${base}/news/export/${format}/${userId}`;
  } else {
    throw new Error('No articles selected');
  }

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const ext = format === 'pdf' ? 'pdf' : format === 'docx' ? 'docx' : 'md';
  const filename = `sami-news-digest-${new Date().toISOString().split('T')[0]}.${ext}`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};
