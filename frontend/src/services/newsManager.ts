/**
 * News Intelligence Manager
 * Hooks and API functions for the News Intelligence feature
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

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
  createdAt: string;
  _count?: {
    callDiets: number;
    articles: number;
  };
}

export interface RevenueOwner {
  id: string;
  name: string;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
  companies?: TrackedCompany[];
  people?: TrackedPerson[];
  tags?: NewsTag[];
  _count?: {
    companies: number;
    people: number;
    tags: number;
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
  shortSummary: string | null;  // 1-2 sentences for card preview
  longSummary: string | null;   // 3-5 sentences for expanded view
  summary: string | null;       // Legacy field
  whyItMatters: string | null;
  sourceUrl: string;
  sourceName: string | null;
  sources: ArticleSource[];     // All sources for merged stories
  publishedAt: string | null;
  fetchedAt: string;
  priority: 'high' | 'medium' | 'low' | null;
  priorityScore: number | null; // 1-10 for sorting (hidden from UI)
  status: 'new_article' | 'update' | null;
  isSent: boolean;              // Sent to client status (legacy)
  isArchived: boolean;          // Archived status
  matchType: 'exact' | 'contextual' | null;
  fetchLayer: 'layer1_rss' | 'layer1_api' | 'layer2_llm' | null;
  company: TrackedCompany | null;
  person: TrackedPerson | null;
  tag: NewsTag | null;
  revenueOwners: { id: string; name: string; email: string | null }[];
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
}

// ============================================================================
// API Helpers
// ============================================================================

const fetchJson = async (path: string, options?: RequestInit) => {
  const url = `${API_BASE.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
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

  return { companies, loading, error, fetchCompanies, createCompany };
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

  return { people, loading, error, fetchPeople, createPerson };
};

// ============================================================================
// Revenue Owners Hook
// ============================================================================

export const useRevenueOwners = () => {
  const [owners, setOwners] = useState<RevenueOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOwners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJson('/news/revenue-owners');
      setOwners(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue owners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const getOwnerDetails = useCallback(async (id: string): Promise<RevenueOwner> => {
    return fetchJson(`/news/revenue-owners/${id}`);
  }, []);

  const createOwner = async (name: string) => {
    const owner = await fetchJson('/news/revenue-owners', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    setOwners(prev => [...prev, owner]);
    return owner;
  };

  const updateOwner = async (id: string, data: { name?: string; email?: string | null }) => {
    const owner = await fetchJson(`/news/revenue-owners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setOwners(prev => prev.map(o => (o.id === id ? { ...o, ...owner } : o)));
    return owner;
  };

  const deleteOwner = async (id: string) => {
    await fetchJson(`/news/revenue-owners/${id}`, { method: 'DELETE' });
    setOwners(prev => prev.filter(o => o.id !== id));
  };

  // Call Diet management
  const addCompanyToOwner = async (ownerId: string, companyName: string, ticker?: string, cik?: string) => {
    await fetchJson(`/news/revenue-owners/${ownerId}/companies`, {
      method: 'POST',
      body: JSON.stringify({ name: companyName, ticker, cik }),
    });
  };

  const removeCompanyFromOwner = async (ownerId: string, companyId: string) => {
    await fetchJson(`/news/revenue-owners/${ownerId}/companies/${companyId}`, {
      method: 'DELETE',
    });
  };

  const addPersonToOwner = async (ownerId: string, personName: string, title?: string) => {
    await fetchJson(`/news/revenue-owners/${ownerId}/people`, {
      method: 'POST',
      body: JSON.stringify({ name: personName, title }),
    });
  };

  const removePersonFromOwner = async (ownerId: string, personId: string) => {
    await fetchJson(`/news/revenue-owners/${ownerId}/people/${personId}`, {
      method: 'DELETE',
    });
  };

  const addTagToOwner = async (ownerId: string, tagId: string) => {
    await fetchJson(`/news/revenue-owners/${ownerId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagId }),
    });
  };

  const removeTagFromOwner = async (ownerId: string, tagId: string) => {
    await fetchJson(`/news/revenue-owners/${ownerId}/tags/${tagId}`, {
      method: 'DELETE',
    });
  };

  return {
    owners,
    loading,
    error,
    fetchOwners,
    getOwnerDetails,
    createOwner,
    updateOwner,
    deleteOwner,
    addCompanyToOwner,
    removeCompanyFromOwner,
    addPersonToOwner,
    removePersonFromOwner,
    addTagToOwner,
    removeTagFromOwner,
  };
};

// ============================================================================
// Articles Hook
// ============================================================================

export interface ArticleFilters {
  revenueOwnerId?: string;
  companyId?: string;
  personId?: string;
  tagId?: string;
  priority?: 'high' | 'medium' | 'low';
  isSent?: boolean;
  isArchived?: boolean;
}

export const useNewsArticles = (filters?: ArticleFilters) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.revenueOwnerId) params.set('revenueOwnerId', filters.revenueOwnerId);
      if (filters?.companyId) params.set('companyId', filters.companyId);
      if (filters?.personId) params.set('personId', filters.personId);
      if (filters?.tagId) params.set('tagId', filters.tagId);
      if (filters?.priority) params.set('priority', filters.priority);
      if (filters?.isArchived !== undefined) params.set('isArchived', String(filters.isArchived));

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
  }, [filters?.revenueOwnerId, filters?.companyId, filters?.personId, filters?.tagId, filters?.priority, filters?.isArchived]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, total, loading, error, fetchArticles };
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

  const refresh = async (): Promise<{ articlesFound: number; coverageGaps: any[] }> => {
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchJson('/news/refresh', { method: 'POST' });
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

  const search = async (params: { company?: string; person?: string; topics?: string[] }) => {
    setSearching(true);
    setError(null);
    try {
      const data = await fetchJson('/news/search', {
        method: 'POST',
        body: JSON.stringify(params),
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
