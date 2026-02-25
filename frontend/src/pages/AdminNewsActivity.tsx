/**
 * Admin News Activity Dashboard
 * Two-section layout: Companies & Articles | Users
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  Users,
  Clock,
  Download,
  ExternalLink,
  UserX,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Loader2,
  BookOpen,
  Building2,
  Newspaper,
  X,
  Search,
  Check,
  MousePointerClick,
  FileText,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import Threads from '../components/Threads';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// ============================================================================
// Types
// ============================================================================

interface Summary {
  readThroughRate: number;
  totalReadTimeSec: number;
  totalArticleReads: number;
  totalLinkClicks: number;
  totalExports: number;
  uniqueActiveUsers: number;
  totalUsersWithCallDiet: number;
}

interface WeeklyEngagement {
  weekStart: string;
  uniqueUsers: number;
  articleReads: number;
  meaningfulReads: number;
  exports: number;
}

interface UserRow {
  userId: string;
  name: string | null;
  email: string;
  tier: string;
  articleReads: number;
  meaningfulReads: number;
  totalReadTimeSec: number;
  linkClicks: number;
  exports: number;
  pins: number;
  callDietCompanyCount: number;
  lastActiveAt: string | null;
}

interface TopCompany {
  companyId: string;
  companyName: string;
  ticker: string | null;
  totalReads: number;
  uniqueReaders: number;
  totalReadTimeSec: number;
  linkClicks: number;
  exports: number;
  callDietUserCount: number;
  readersOnDiet: number;
}

interface TopArticle {
  articleId: string;
  headline: string;
  companyName: string | null;
  ticker: string | null;
  reads: number;
  uniqueReaders: number;
  avgReadTimeSec: number;
  linkClicks: number;
  exports: number;
}

interface OverviewData {
  summary: Summary;
  weeklyEngagement: WeeklyEngagement[];
  users: UserRow[];
  topCompanies: TopCompany[];
  topArticles: TopArticle[];
}

interface CompanyDetailUser {
  userId: string;
  name: string | null;
  email: string;
  reads: number;
  lastReadAt?: string | null;
}

interface CompanyDetail {
  companyId: string;
  companyName: string;
  ticker: string | null;
  totalReads: number;
  uniqueReaders: number;
  totalReadTimeSec: number;
  avgReadTimeSec: number;
  exports: number;
  callDietUsers: CompanyDetailUser[];
  otherReaders: CompanyDetailUser[];
}

interface UserDetailMetrics {
  tier: string;
  articleReads: number;
  meaningfulReads: number;
  readThroughRate: number;
  avgReadTimeSec: number;
  exports: number;
  pins: number;
  callDietCoverage: number;
  totalReadTimeSec: number;
  linkClicks: number;
  uniqueArticlesRead: number;
  searchCount: number;
}

interface UserCompanyBreakdown {
  companyId: string;
  companyName: string;
  ticker: string | null;
  reads: number;
  isInCallDiet: boolean;
}

interface UserWeeklyTrend {
  weekStart: string;
  reads: number;
  meaningfulReads: number;
  exports: number;
}

interface UserArticle {
  articleId: string;
  headline: string;
  sourceName: string | null;
  readCount: number;
  totalReadTimeSec: number;
  lastReadAt: string;
  linkClicks: number;
}

interface UserArticlesByCompany {
  companyId: string;
  companyName: string;
  ticker: string | null;
  isInCallDiet: boolean;
  articles: UserArticle[];
}

interface UserDetailData {
  user: { id: string; name: string | null; email: string; role: string };
  metrics: UserDetailMetrics;
  companyBreakdown: UserCompanyBreakdown[];
  articlesByCompany: UserArticlesByCompany[];
  weeklyTrend: UserWeeklyTrend[];
  callDiet: {
    companies: Array<{ companyId: string; companyName: string; ticker: string | null }>;
    totalCompanies: number;
    companiesWithReads: number;
  };
}

// ============================================================================
// Helpers
// ============================================================================

const TIER_COLORS: Record<string, string> = {
  Power: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/25',
  Regular: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-500/25',
  Occasional: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm shadow-amber-400/25',
  Inactive: 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-sm shadow-rose-400/25',
};

function formatTime(seconds: number): string {
  const s = Number(seconds) || 0;
  if (s <= 0) return '0s';
  if (s < 60) return `${s}s`;
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  }
  return `${mins}m ${rem}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function qualityIndicator(rate: number): { label: string; color: string } {
  if (rate >= 75) return { label: 'Excellent', color: 'text-emerald-600' };
  if (rate >= 50) return { label: 'Good', color: 'text-blue-600' };
  if (rate >= 25) return { label: 'Fair', color: 'text-amber-600' };
  return { label: 'Low', color: 'text-rose-600' };
}

type SortDir = 'asc' | 'desc';

function useSortable<T>(data: T[], defaultKey: keyof T, defaultDir: SortDir = 'desc') {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const toggle = useCallback((key: keyof T) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }, [sortKey]);

  return { sorted, sortKey, sortDir, toggle };
}

// ============================================================================
// Main Component
// ============================================================================

interface AdminNewsActivityProps {
  isAdmin?: boolean;
}

export const AdminNewsActivity: React.FC<AdminNewsActivityProps> = ({ isAdmin }) => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OverviewData | null>(null);
  const [activeTab, setActiveTab] = useState<'companies' | 'users'>('companies');

  // Drill-down states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetailData | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetail[] | null>(null);
  const [companyDetailsLoading, setCompanyDetailsLoading] = useState(false);

  // Filter states
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  // Keep full user list for dropdown (doesn't shrink when user filter is applied to backend)
  const [allUsers, setAllUsers] = useState<UserRow[]>([]);

  // Serialize selectedUserIds for use in deps / URL
  const userIdsParam = useMemo(() => [...selectedUserIds].join(','), [selectedUserIds]);

  // Fetch overview (re-fetches when days or user filter changes)
  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ days: String(days) });
        if (userIdsParam) params.set('userIds', userIdsParam);
        const res = await fetch(`${API_BASE.replace(/\/$/, '')}/admin/news/activity?${params}`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        setData(json);
        // Store full user list only on unfiltered fetches
        if (!userIdsParam && json.users) setAllUsers(json.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Reset drill-downs on change
    setSelectedUserId(null);
    setUserDetail(null);
    setExpandedCompanyId(null);
    setCompanyDetails(null);
  }, [isAdmin, days, userIdsParam]);

  // Fetch user detail
  useEffect(() => {
    if (!selectedUserId) { setUserDetail(null); return; }
    const fetchUser = async () => {
      setUserDetailLoading(true);
      try {
        const res = await fetch(`${API_BASE.replace(/\/$/, '')}/admin/news/activity/${selectedUserId}?days=${days}`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        setUserDetail(await res.json());
      } catch { setUserDetail(null); }
      finally { setUserDetailLoading(false); }
    };
    fetchUser();
  }, [selectedUserId, days]);

  // Fetch company details (lazy-loaded once when expanding a company)
  const loadCompanyDetails = useCallback(async () => {
    if (companyDetails || companyDetailsLoading) return;
    setCompanyDetailsLoading(true);
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/admin/news/activity/companies?days=${days}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setCompanyDetails(json.companies);
    } catch { setCompanyDetails(null); }
    finally { setCompanyDetailsLoading(false); }
  }, [companyDetails, companyDetailsLoading, days]);

  const handleExpandCompany = useCallback((companyId: string) => {
    if (expandedCompanyId === companyId) {
      setExpandedCompanyId(null);
      return;
    }
    setExpandedCompanyId(companyId);
    loadCompanyDetails();
  }, [expandedCompanyId, loadCompanyDetails]);

  // All useMemo hooks must be called before any early returns (Rules of Hooks)
  const companyOptions = useMemo(() => {
    if (!data) return [];
    const seen = new Map<string, { id: string; name: string; ticker: string | null }>();
    data.topCompanies.forEach(c => { if (!seen.has(c.companyId)) seen.set(c.companyId, { id: c.companyId, name: c.companyName, ticker: c.ticker }); });
    data.topArticles.forEach(a => {
      if (a.companyName) {
        const existing = [...seen.values()].find(s => s.name === a.companyName);
        if (!existing) seen.set(a.companyName, { id: a.companyName, name: a.companyName, ticker: a.ticker });
      }
    });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const userOptions = useMemo(() => {
    return [...allUsers].sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
  }, [allUsers]);

  const filteredCompanies = useMemo(() => {
    if (!data) return [];
    if (selectedCompanyIds.size === 0) return data.topCompanies;
    return data.topCompanies.filter(c => selectedCompanyIds.has(c.companyId));
  }, [data, selectedCompanyIds]);

  const filteredArticles = useMemo(() => {
    if (!data) return [];
    if (selectedCompanyIds.size === 0) return data.topArticles;
    const selectedNames = new Set(companyOptions.filter(c => selectedCompanyIds.has(c.id)).map(c => c.name));
    return data.topArticles.filter(a => a.companyName && selectedNames.has(a.companyName));
  }, [data, selectedCompanyIds, companyOptions]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    if (selectedUserIds.size === 0) return data.users;
    return data.users.filter(u => selectedUserIds.has(u.userId));
  }, [data, selectedUserIds]);

  const hasActiveFilters = selectedCompanyIds.size > 0 || selectedUserIds.size > 0;
  const activeFilterCount = selectedCompanyIds.size + selectedUserIds.size;

  const clearFilters = useCallback(() => {
    setSelectedCompanyIds(new Set());
    setSelectedUserIds(new Set());
  }, []);

  // Early returns (after all hooks)
  if (!isAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-500">
        Admin access required.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-brand-400" size={32} />
        <p className="text-sm text-slate-400 font-medium">Loading engagement data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-600 text-sm font-medium">
        {error || 'Failed to load data'}
      </div>
    );
  }

  // User detail view
  if (selectedUserId) {
    return (
      <UserDrillDown
        detail={userDetail}
        loading={userDetailLoading}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  const { summary } = data;
  const disengagedCount = (selectedUserIds.size > 0 ? filteredUsers : data.users)
    .filter(u => u.tier === 'Inactive' && u.callDietCompanyCount > 0).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Bar — Header + Summary Stats */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-slate-900 via-brand-800 to-brand-700">
        <div className="absolute inset-0">
          <Threads
            color={[1, 1, 1]}
            amplitude={1.5}
            distance={0.8}
            lineWidth={18}
            enableMouseInteraction
          />
        </div>
        <div className="relative z-10 p-10 text-white pointer-events-none flex gap-6 min-h-[15rem]">
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-3">Understand how your team engages with news.</h2>
              <p className="text-brand-100 text-lg">Track how your team engages with news content across reads, exports, and link clicks</p>
            </div>
            <div className="flex justify-start">
              <select
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="pointer-events-auto px-6 py-3 rounded-lg font-semibold bg-white text-brand-700 shadow-lg hover:bg-brand-50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-300 [&>option]:text-slate-700 [&>option]:bg-white"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
          <div className="hidden lg:flex flex-1 items-center justify-center pointer-events-none">
            <img
              src="/SAMI_Activity.png"
              alt="SAMI"
              className="h-44 xl:h-56 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={<Clock size={18} />} label="Read Time" value={formatTime(summary.totalReadTimeSec)} iconColor="purple" />
        <StatCard icon={<Users size={18} />} label="Active Users" value={`${summary.uniqueActiveUsers} / ${summary.totalUsersWithCallDiet}`} iconColor="blue" />
        <StatCard icon={<ExternalLink size={18} />} label="Link Clicks" value={String(summary.totalLinkClicks)} iconColor="indigo" />
        <StatCard icon={<Download size={18} />} label="Exports" value={String(summary.totalExports)} iconColor="amber" />
        <StatCard icon={<UserX size={18} />} label="Disengaged" value={String(disengagedCount)} iconColor="rose" />
      </div>

      {/* Filters box */}
      <div className="bg-gradient-to-br from-brand-50 via-white to-brand-50/50 border-2 border-brand-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all ring-1 ring-brand-100/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-sm">
              <Search size={18} className="text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Filters</h3>
            <span className="text-xs text-brand-600 font-medium bg-brand-100 px-2 py-0.5 rounded-full">
              Narrow down by company or user
            </span>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-rose-500 font-medium transition-colors">
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchDropdown
            icon={<Building2 size={16} />}
            placeholder="Filter by company..."
            options={companyOptions.map(c => ({ id: c.id, label: c.name, sub: c.ticker }))}
            selectedIds={selectedCompanyIds}
            onToggle={(id) => setSelectedCompanyIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; })}
          />
          <SearchDropdown
            icon={<Users size={16} />}
            placeholder="Filter by user..."
            options={userOptions.map(u => ({ id: u.userId, label: u.name || u.email, sub: u.name ? u.email : null }))}
            selectedIds={selectedUserIds}
            onToggle={(id) => setSelectedUserIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; })}
          />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit">
        <TabButton active={activeTab === 'companies'} onClick={() => setActiveTab('companies')}>
          <Building2 size={16} /> Companies & Articles
        </TabButton>
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <Users size={16} /> Users
        </TabButton>
      </div>

      {activeTab === 'companies' ? (
        <CompaniesTab
          weeklyEngagement={data.weeklyEngagement}
          topCompanies={filteredCompanies}
          topArticles={filteredArticles}
          expandedCompanyId={expandedCompanyId}
          companyDetails={companyDetails}
          companyDetailsLoading={companyDetailsLoading}
          onExpandCompany={handleExpandCompany}
          onSelectUser={setSelectedUserId}
        />
      ) : (
        <UsersTab
          users={filteredUsers}
          onSelectUser={setSelectedUserId}
        />
      )}
    </div>
  );
};

// ============================================================================
// Stat Card (inside gradient top bar)
// ============================================================================

const STAT_ICON_COLORS: Record<string, string> = {
  purple: 'text-purple-600',
  blue:   'text-cyan-600',
  indigo: 'text-indigo-600',
  amber:  'text-amber-600',
  rose:   'text-rose-600',
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  iconColor?: string;
}> = ({ icon, label, value, iconColor = 'blue' }) => (
  <div className="rounded-xl p-4 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg bg-slate-100 ${STAT_ICON_COLORS[iconColor] || 'text-slate-500'}`}>{icon}</div>
      <div>
        <p className="text-xl font-extrabold text-slate-800 tracking-tight">{value}</p>
        <p className="text-[11px] font-medium mt-0.5 text-slate-400">{label}</p>
      </div>
    </div>
  </div>
);

// ============================================================================
// Tab Button
// ============================================================================

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25'
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

// ============================================================================
// Search Dropdown (inline filter control)
// ============================================================================

interface DropdownOption {
  id: string;
  label: string;
  sub?: string | null;
}

const SearchDropdown: React.FC<{
  icon: React.ReactNode;
  placeholder: string;
  options: DropdownOption[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}> = ({ icon, placeholder, options, selectedIds, onToggle }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(q) || (o.sub && o.sub.toLowerCase().includes(q)));
  }, [options, query]);

  const count = selectedIds.size;

  return (
    <div ref={ref} className="relative flex-1">
      {/* Input-style trigger */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <button
          onClick={() => { setOpen(o => !o); setQuery(''); }}
          className="w-full text-left pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all bg-white hover:bg-slate-50 text-sm"
        >
          {count > 0 ? (
            <span className="text-brand-700 font-medium">{count} selected</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </button>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {count > 0 && (
            <span
              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              onClick={(e) => { e.stopPropagation(); selectedIds.forEach(id => onToggle(id)); }}
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto p-1.5">
            {filtered.length > 0 ? filtered.map(o => {
              const isSelected = selectedIds.has(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => onToggle(o.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-brand-500 border-brand-500' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="font-medium truncate">{o.label}</span>
                  {o.sub && <span className="text-[10px] text-slate-400 ml-auto flex-shrink-0">{o.sub}</span>}
                </button>
              );
            }) : (
              <p className="text-xs text-slate-400 text-center py-4">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Sortable Column Header
// ============================================================================

const SortHeader: React.FC<{
  label: string;
  sortKey: string;
  currentKey: string;
  currentDir: SortDir;
  onSort: () => void;
  className?: string;
}> = ({ label, sortKey, currentKey, currentDir, onSort, className = '' }) => (
  <th
    className={`py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 select-none transition-colors ${className}`}
    onClick={onSort}
  >
    <span className="inline-flex items-center gap-1">
      {label}
      {currentKey === sortKey ? (
        <span className="text-brand-500 font-bold">{currentDir === 'asc' ? '↑' : '↓'}</span>
      ) : (
        <ArrowUpDown size={11} className="text-slate-300" />
      )}
    </span>
  </th>
);

// ============================================================================
// Companies & Articles Tab
// ============================================================================

const CompaniesTab: React.FC<{
  weeklyEngagement: WeeklyEngagement[];
  topCompanies: TopCompany[];
  topArticles: TopArticle[];
  expandedCompanyId: string | null;
  companyDetails: CompanyDetail[] | null;
  companyDetailsLoading: boolean;
  onExpandCompany: (id: string) => void;
  onSelectUser: (id: string) => void;
}> = ({
  weeklyEngagement,
  topCompanies,
  topArticles,
  expandedCompanyId,
  companyDetails,
  companyDetailsLoading,
  onExpandCompany,
  onSelectUser,
}) => {
  const companySorter = useSortable(topCompanies, 'totalReads');
  const articleSorter = useSortable(topArticles, 'reads');

  return (
    <div className="space-y-6">
      {/* Weekly Engagement Chart */}
      {weeklyEngagement.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full" />
            Weekly Engagement
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="weekStart"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={formatDate}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#3b82f6' }}
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={(v: string) => `Week of ${formatDate(v)}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="articleReads"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.15}
                strokeWidth={2}
                name="Article Reads"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="uniqueUsers"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
                name="Unique Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Companies Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <Building2 size={14} className="text-blue-500" />
          </div>
          Top Companies
          <span className="ml-auto text-xs text-slate-400 font-normal">{topCompanies.length} companies</span>
        </h3>
        {topCompanies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <SortHeader label="Company" sortKey="companyName" currentKey={String(companySorter.sortKey)} currentDir={companySorter.sortDir} onSort={() => companySorter.toggle('companyName')} />
                  <SortHeader label="Reads" sortKey="totalReads" currentKey={String(companySorter.sortKey)} currentDir={companySorter.sortDir} onSort={() => companySorter.toggle('totalReads')} className="text-right" />
                  <SortHeader label="Readers" sortKey="uniqueReaders" currentKey={String(companySorter.sortKey)} currentDir={companySorter.sortDir} onSort={() => companySorter.toggle('uniqueReaders')} className="text-right" />
                  <SortHeader label="Read Time" sortKey="totalReadTimeSec" currentKey={String(companySorter.sortKey)} currentDir={companySorter.sortDir} onSort={() => companySorter.toggle('totalReadTimeSec')} className="text-right" />
                  <SortHeader label="Link Clicks" sortKey="linkClicks" currentKey={String(companySorter.sortKey)} currentDir={companySorter.sortDir} onSort={() => companySorter.toggle('linkClicks')} className="text-right" />
                  <SortHeader label="Exports" sortKey="exports" currentKey={String(companySorter.sortKey)} currentDir={companySorter.sortDir} onSort={() => companySorter.toggle('exports')} className="text-right" />
                  <th className="py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">On Diet</th>
                  <th className="py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {companySorter.sorted.map(c => {
                  const isExpanded = expandedCompanyId === c.companyId;
                  const detail = companyDetails?.find(d => d.companyId === c.companyId);
                  const coveragePct = c.callDietUserCount > 0
                    ? Math.round((c.readersOnDiet / c.callDietUserCount) * 100)
                    : null;

                  return (
                    <React.Fragment key={c.companyId}>
                      <tr
                        className="hover:bg-brand-50/40 cursor-pointer transition-colors border-b border-slate-50 last:border-b-0"
                        onClick={() => onExpandCompany(c.companyId)}
                      >
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-0.5 rounded transition-transform ${isExpanded ? 'rotate-0' : ''}`}>
                              {isExpanded ? <ChevronDown size={14} className="text-brand-500" /> : <ChevronRight size={14} className="text-slate-400" />}
                            </div>
                            <span className="font-semibold text-slate-700">{c.companyName}</span>
                            {c.ticker && <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{c.ticker}</span>}
                          </div>
                        </td>
                        <td className="py-3 text-right font-bold text-slate-700">{c.totalReads}</td>
                        <td className="py-3 text-right text-slate-600">{c.uniqueReaders}</td>
                        <td className="py-3 text-right text-slate-500">{formatTime(c.totalReadTimeSec)}</td>
                        <td className="py-3 text-right text-slate-600">{c.linkClicks}</td>
                        <td className="py-3 text-right text-slate-600">{c.exports}</td>
                        <td className="py-3 text-right text-slate-600">{c.callDietUserCount}</td>
                        <td className="py-3 text-right">
                          {coveragePct != null ? (
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                              coveragePct >= 75 ? 'bg-emerald-100 text-emerald-700' :
                              coveragePct >= 40 ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {coveragePct}%
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="py-0">
                            <CompanyExpansion
                              detail={detail}
                              loading={companyDetailsLoading}
                              onSelectUser={onSelectUser}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">No company reads yet.</p>
        )}
      </div>

      {/* Top Articles Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <div className="p-1.5 bg-purple-50 rounded-lg">
            <Newspaper size={14} className="text-purple-500" />
          </div>
          Top Articles
          <span className="ml-auto text-xs text-slate-400 font-normal">{topArticles.length} articles</span>
        </h3>
        {topArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <SortHeader label="Headline" sortKey="headline" currentKey={String(articleSorter.sortKey)} currentDir={articleSorter.sortDir} onSort={() => articleSorter.toggle('headline')} />
                  <SortHeader label="Company" sortKey="companyName" currentKey={String(articleSorter.sortKey)} currentDir={articleSorter.sortDir} onSort={() => articleSorter.toggle('companyName')} />
                  <SortHeader label="Reads" sortKey="reads" currentKey={String(articleSorter.sortKey)} currentDir={articleSorter.sortDir} onSort={() => articleSorter.toggle('reads')} className="text-right" />
                  <SortHeader label="Readers" sortKey="uniqueReaders" currentKey={String(articleSorter.sortKey)} currentDir={articleSorter.sortDir} onSort={() => articleSorter.toggle('uniqueReaders')} className="text-right" />
                  <SortHeader label="Avg Read Time" sortKey="avgReadTimeSec" currentKey={String(articleSorter.sortKey)} currentDir={articleSorter.sortDir} onSort={() => articleSorter.toggle('avgReadTimeSec')} className="text-right" />
                  <SortHeader label="Link Clicks" sortKey="linkClicks" currentKey={String(articleSorter.sortKey)} currentDir={articleSorter.sortDir} onSort={() => articleSorter.toggle('linkClicks')} className="text-right" />
                  <SortHeader label="Exports" sortKey="exports" currentKey={String(articleSorter.sortKey)} currentDir={articleSorter.sortDir} onSort={() => articleSorter.toggle('exports')} className="text-right" />
                </tr>
              </thead>
              <tbody>
                {articleSorter.sorted.map(a => (
                  <tr key={a.articleId} className="hover:bg-brand-50/30 transition-colors border-b border-slate-50 last:border-b-0">
                    <td className="py-3 pr-3 max-w-[300px]">
                      <span className="font-semibold text-slate-700 line-clamp-1" title={a.headline}>{a.headline}</span>
                    </td>
                    <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">
                      {a.companyName || '—'}
                      {a.ticker && <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono ml-1.5">{a.ticker}</span>}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-700">{a.reads}</td>
                    <td className="py-3 text-right text-slate-600">{a.uniqueReaders}</td>
                    <td className="py-3 text-right text-slate-500">{formatTime(a.avgReadTimeSec)}</td>
                    <td className="py-3 text-right text-slate-600">{a.linkClicks}</td>
                    <td className="py-3 text-right text-slate-600">{a.exports}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">No articles read yet.</p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Company Expansion (inline drill-down)
// ============================================================================

const CompanyExpansion: React.FC<{
  detail: CompanyDetail | undefined;
  loading: boolean;
  onSelectUser: (id: string) => void;
}> = ({ detail, loading, onSelectUser }) => {
  if (loading) {
    return (
      <div className="py-4 flex justify-center">
        <Loader2 size={18} className="animate-spin text-slate-400" />
      </div>
    );
  }
  if (!detail) {
    return <div className="py-3 text-sm text-slate-400 text-center">No detail available.</div>;
  }

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl p-5 my-2 space-y-5 border border-slate-100">
      {/* Diet Users */}
      {detail.callDietUsers.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-1 h-3 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
            Diet Users
            <span className="text-slate-400 font-normal">({detail.callDietUsers.length})</span>
          </h4>
          <div className="space-y-1.5">
            {detail.callDietUsers.map(u => (
              <div
                key={u.userId}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  u.reads === 0 ? 'bg-rose-50/80 border border-rose-100' : 'bg-white border border-slate-100 hover:border-slate-200'
                }`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectUser(u.userId); }}
                  className="text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                >
                  {u.name || u.email}
                </button>
                <span className={`font-bold text-xs px-2 py-1 rounded-lg ${u.reads === 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-700'}`}>
                  {u.reads} reads
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Readers */}
      {detail.otherReaders.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full" />
            Other Readers
            <span className="text-slate-400 font-normal">({detail.otherReaders.length})</span>
          </h4>
          <div className="space-y-1.5">
            {detail.otherReaders.map(u => (
              <div key={u.userId} className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm hover:border-slate-200 transition-colors">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectUser(u.userId); }}
                  className="text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                >
                  {u.name || u.email}
                </button>
                <span className="font-bold text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-700">{u.reads} reads</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {detail.callDietUsers.length === 0 && detail.otherReaders.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-2">No readers in this period.</p>
      )}
    </div>
  );
};

// ============================================================================
// Users Tab
// ============================================================================

const TIER_FILTERS = ['All', 'Power', 'Regular', 'Occasional', 'Inactive'] as const;
const TIER_BAR_COLORS: Record<string, string> = {
  Power: '#10b981',
  Regular: '#3b82f6',
  Occasional: '#f59e0b',
  Inactive: '#f43f5e',
};

const UsersTab: React.FC<{
  users: UserRow[];
  onSelectUser: (id: string) => void;
}> = ({ users, onSelectUser }) => {
  const [tierFilter, setTierFilter] = useState<string>('All');

  const filtered = useMemo(
    () => tierFilter === 'All' ? users : users.filter(u => u.tier === tierFilter),
    [users, tierFilter]
  );

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { Power: 0, Regular: 0, Occasional: 0, Inactive: 0 };
    users.forEach(u => { if (counts[u.tier] !== undefined) counts[u.tier]++; });
    return Object.entries(counts).map(([tier, count]) => ({ tier, count }));
  }, [users]);

  const sorter = useSortable(filtered, 'articleReads');

  return (
    <div className="space-y-4">
      {/* Tier Distribution Chart */}
      {users.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full" />
            User Tier Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tierCounts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="tier" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                formatter={(value: number) => [value, 'Users']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Users">
                {tierCounts.map(entry => (
                  <Cell key={entry.tier} fill={TIER_BAR_COLORS[entry.tier] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tier filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {TIER_FILTERS.map(t => (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              tierFilter === t
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
            }`}
          >
            {t}
            {t !== 'All' && (
              <span className={`ml-1.5 ${tierFilter === t ? 'opacity-80' : 'opacity-60'}`}>
                ({users.filter(u => u.tier === t).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <SortHeader label="User" sortKey="name" currentKey={String(sorter.sortKey)} currentDir={sorter.sortDir} onSort={() => sorter.toggle('name')} />
                  <th className="py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tier</th>
                  <SortHeader label="Articles Read" sortKey="articleReads" currentKey={String(sorter.sortKey)} currentDir={sorter.sortDir} onSort={() => sorter.toggle('articleReads')} className="text-right" />
                  <SortHeader label="Read Time" sortKey="totalReadTimeSec" currentKey={String(sorter.sortKey)} currentDir={sorter.sortDir} onSort={() => sorter.toggle('totalReadTimeSec')} className="text-right" />
                  <SortHeader label="Link Clicks" sortKey="linkClicks" currentKey={String(sorter.sortKey)} currentDir={sorter.sortDir} onSort={() => sorter.toggle('linkClicks')} className="text-right" />
                  <SortHeader label="Exports" sortKey="exports" currentKey={String(sorter.sortKey)} currentDir={sorter.sortDir} onSort={() => sorter.toggle('exports')} className="text-right" />
                  <SortHeader label="Last Active" sortKey="lastActiveAt" currentKey={String(sorter.sortKey)} currentDir={sorter.sortDir} onSort={() => sorter.toggle('lastActiveAt')} className="text-right" />
                </tr>
              </thead>
              <tbody>
                {sorter.sorted.map(u => (
                    <tr
                      key={u.userId}
                      className="hover:bg-brand-50/30 cursor-pointer transition-colors border-b border-slate-50 last:border-b-0"
                      onClick={() => onSelectUser(u.userId)}
                    >
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-slate-700">{u.name || u.email}</div>
                        {u.name && <div className="text-xs text-slate-400 mt-0.5">{u.email}</div>}
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold ${TIER_COLORS[u.tier] || ''}`}>
                          {u.tier}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-700">{u.articleReads}</td>
                      <td className="py-3 text-right text-slate-500">{formatTime(u.totalReadTimeSec)}</td>
                      <td className="py-3 text-right text-slate-600">{u.linkClicks}</td>
                      <td className="py-3 text-right text-slate-600">{u.exports}</td>
                      <td className="py-3 text-right text-slate-400 whitespace-nowrap">
                        {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">No users match this filter.</p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Metric card for user drill-down
// ============================================================================

const METRIC_CARD_STYLES: Record<string, { bg: string; iconBg: string; iconColor: string; valueColor: string }> = {
  purple: { bg: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100/60', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', valueColor: 'text-purple-700' },
  blue: { bg: 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100/60', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-700' },
  emerald: { bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100/60', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700' },
  cyan: { bg: 'bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-100/60', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', valueColor: 'text-cyan-700' },
  amber: { bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100/60', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', valueColor: 'text-amber-700' },
  indigo: { bg: 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100/60', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', valueColor: 'text-indigo-700' },
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel?: string;
  sublabelColor?: string;
  color: string;
  progress?: number;
}> = ({ icon, value, label, sublabel, sublabelColor, color, progress }) => {
  const style = METRIC_CARD_STYLES[color] || METRIC_CARD_STYLES.blue;
  return (
    <div className={`rounded-xl p-4 border ${style.bg} flex flex-col gap-2`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${style.iconBg}`}>
          <span className={style.iconColor}>{icon}</span>
        </div>
        <div className="min-w-0">
          <div className={`text-xl font-extrabold tracking-tight ${style.valueColor}`}>{value}</div>
          <div className="text-xs font-medium text-slate-500">{label}</div>
        </div>
      </div>
      {sublabel && (
        <div className={`text-[11px] font-semibold ${sublabelColor || 'text-slate-400'} ml-11`}>{sublabel}</div>
      )}
      {progress !== undefined && (
        <div className="mt-1">
          <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// User Drill-Down
// ============================================================================

const UserDrillDown: React.FC<{
  detail: UserDetailData | null;
  loading: boolean;
  onBack: () => void;
}> = ({ detail, loading, onBack }) => {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  const toggleCompany = useCallback((companyId: string) => {
    setExpandedCompanies(prev => {
      const next = new Set(prev);
      if (next.has(companyId)) next.delete(companyId);
      else next.add(companyId);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
          <ChevronLeft size={16} /> Back to Overview
        </button>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
          <ChevronLeft size={16} /> Back to Overview
        </button>
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-500">
          Could not load user details.
        </div>
      </div>
    );
  }

  const { user, metrics, articlesByCompany, weeklyTrend, callDiet } = detail;
  const rtrQuality = qualityIndicator(metrics.readThroughRate);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-semibold group transition-colors">
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Overview
      </button>

      {/* User header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="relative p-6 bg-gradient-to-br from-brand-500 to-violet-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{user.name || user.email}</h2>
              <p className="text-sm text-white/70 mt-1">{user.email}</p>
            </div>
            <span className={`inline-flex px-3.5 py-1.5 rounded-xl text-sm font-bold ${TIER_COLORS[metrics.tier] || ''}`}>
              {metrics.tier}
            </span>
          </div>
        </div>

        {/* Stats grid — 2×3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5">
          <MetricCard
            icon={<Timer size={16} />}
            value={formatTime(metrics.totalReadTimeSec)}
            label="Total Read Time"
            sublabel={`Avg ${formatTime(metrics.avgReadTimeSec)} per article`}
            color="purple"
          />
          <MetricCard
            icon={<BookOpen size={16} />}
            value={String(metrics.uniqueArticlesRead)}
            label="Articles Read"
            sublabel={`${metrics.articleReads} total opens`}
            color="blue"
          />
          <MetricCard
            icon={<Check size={16} />}
            value={`${metrics.readThroughRate}%`}
            label="Read-Through Rate"
            sublabel={rtrQuality.label}
            sublabelColor={rtrQuality.color}
            color="emerald"
          />
          <MetricCard
            icon={<MousePointerClick size={16} />}
            value={String(metrics.linkClicks)}
            label="Link Clicks"
            color="cyan"
          />
          <MetricCard
            icon={<Download size={16} />}
            value={String(metrics.exports)}
            label="Exports"
            color="amber"
          />
          <MetricCard
            icon={<ShieldCheck size={16} />}
            value={`${metrics.callDietCoverage}%`}
            label="Call Diet Coverage"
            sublabel={`${callDiet.companiesWithReads} of ${callDiet.totalCompanies} companies`}
            color="indigo"
            progress={metrics.callDietCoverage}
          />
        </div>
      </div>

      {/* Weekly activity chart */}
      {weeklyTrend.length > 1 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1 h-3 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full" />
            Weekly Activity
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="userReadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="weekStart" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                labelFormatter={(v: string) => `Week of ${formatDate(v)}`}
                contentStyle={{ fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Area
                type="monotone"
                dataKey="reads"
                name="Reads"
                stroke="#7c3aed"
                fill="url(#userReadsGrad)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="exports"
                name="Exports"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3, fill: '#f59e0b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Company breakdown — collapsible rows */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <Building2 size={14} className="text-blue-500" />
          </div>
          Company Breakdown
        </h3>
        <p className="text-xs text-slate-400 mb-4 ml-9">
          Reading about <span className="font-semibold text-slate-500">{callDiet.companiesWithReads}</span> of <span className="font-semibold text-slate-500">{callDiet.totalCompanies}</span> call diet companies
        </p>
        {articlesByCompany.length > 0 ? (
          <div className="space-y-1">
            {articlesByCompany.map(company => {
              const hasArticles = company.articles.length > 0;
              const isExpanded = expandedCompanies.has(company.companyId);
              const totalReads = company.articles.reduce((sum, a) => sum + a.readCount, 0);
              return (
                <div key={company.companyId}>
                  {/* Company row */}
                  <button
                    onClick={() => hasArticles && toggleCompany(company.companyId)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      company.isInCallDiet && !hasArticles
                        ? 'bg-rose-50/60 hover:bg-rose-50'
                        : isExpanded
                        ? 'bg-brand-50/40'
                        : 'hover:bg-slate-50'
                    } ${hasArticles ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {/* Chevron */}
                    <div className="w-4 flex-shrink-0">
                      {hasArticles && (
                        <ChevronRight size={14} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      )}
                    </div>
                    {/* Company name + ticker */}
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-slate-700">{company.companyName}</span>
                      {company.ticker && (
                        <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono ml-1.5">{company.ticker}</span>
                      )}
                    </div>
                    {/* Reads badge */}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      totalReads === 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {totalReads} {totalReads === 1 ? 'read' : 'reads'}
                    </span>
                    {/* Diet badge */}
                    {company.isInCallDiet && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 flex-shrink-0">
                        Call Diet
                      </span>
                    )}
                  </button>
                  {/* Expanded articles */}
                  {isExpanded && hasArticles && (
                    <div className="ml-7 mr-2 mb-2 border-l-2 border-slate-100 pl-4 space-y-1">
                      {company.articles.map(article => (
                        <div key={article.articleId} className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-slate-50 text-sm">
                          <FileText size={13} className="text-slate-300 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-700 truncate">{article.headline}</div>
                            {article.sourceName && (
                              <span className="text-[11px] text-slate-400">{article.sourceName}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 text-xs text-slate-500">
                            <span title="Times opened">
                              <BookOpen size={11} className="inline mr-0.5 opacity-50" />{article.readCount}
                            </span>
                            <span title="Time spent reading">
                              <Clock size={11} className="inline mr-0.5 opacity-50" />{formatTime(article.totalReadTimeSec)}
                            </span>
                            {article.linkClicks > 0 && (
                              <span title="Link clicks">
                                <ExternalLink size={11} className="inline mr-0.5 opacity-50" />{article.linkClicks}
                              </span>
                            )}
                            <span className="text-slate-400" title="Last read">
                              {formatDate(article.lastReadAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No article reads in this period.</p>
        )}
      </div>
    </div>
  );
};
