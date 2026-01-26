import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, Clock, CheckCircle, TrendingUp, BarChart3, Users } from 'lucide-react';

interface AdminMetricsProps {
  isAdmin?: boolean;
}

interface KPIs {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  successRate: number;
  avgDurationMinutes: number;
  avgCostUsd: number;
  totalCostUsd: number;
  totalCostYtd: number;
}

interface MonthlyTrend {
  month: string;
  jobs: number;
  cost: number;
  avgDuration: number;
  successRate: number;
}

interface GroupBreakdown {
  groupId: string;
  name: string;
  memberCount: number;
  jobs: number;
  cost: number;
}

interface ReportTypeBreakdown {
  type: string;
  jobs: number;
  cost: number;
}

interface StageBreakdown {
  stage: string;
  totalCost: number;
  avgCost: number;
  callCount: number;
}

interface FilterOptions {
  years: number[];
  groups: Array<{ id: string; name: string }>;
  reportTypes: string[];
  industries: string[];
  geographies: string[];
  users: Array<{ id: string; email: string }>;
}

interface MetricsResponse {
  kpis: KPIs;
  monthlyTrends: MonthlyTrend[];
  breakdowns: {
    byGroup: GroupBreakdown[];
    byReportType: ReportTypeBreakdown[];
    byStage: StageBreakdown[];
  };
  filterOptions: FilterOptions;
}

const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const AdminMetrics: React.FC<AdminMetricsProps> = ({ isAdmin }) => {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'groups' | 'reportTypes' | 'stages'>('groups');

  useEffect(() => {
    fetchMetrics();
  }, [selectedYear, selectedMonth, selectedGroup, selectedReportType]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedYear) params.set('year', selectedYear.toString());
      if (selectedMonth) params.set('month', selectedMonth.toString());
      if (selectedGroup) params.set('groupIds', selectedGroup);
      if (selectedReportType) params.set('reportType', selectedReportType);

      const url = `${apiBase}/admin/metrics${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    if (minutes < 60) return `${minutes.toFixed(1)} min`;
    return `${(minutes / 60).toFixed(1)} hr`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const monthNames = useMemo(() =>
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    []
  );

  const chartData = useMemo(() => {
    if (!metrics?.monthlyTrends) return [];
    return metrics.monthlyTrends.map((trend) => {
      const [yearStr, monthStr] = trend.month.split('-');
      const monthIndex = parseInt(monthStr, 10) - 1;
      // If "All Years" is selected, show "Jan 25" format, otherwise just "Jan"
      const label = selectedYear
        ? monthNames[monthIndex]
        : `${monthNames[monthIndex]} '${yearStr.slice(2)}`;
      return {
        ...trend,
        monthLabel: label || trend.month,
        successRatePct: trend.successRate * 100,
      };
    });
  }, [metrics?.monthlyTrends, monthNames, selectedYear]);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  if (loading && !metrics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value, 10) : '')}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Years</option>
              {metrics.filterOptions.years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value, 10) : '')}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Months</option>
              {monthNames.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Groups</option>
              {metrics.filterOptions.groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Report Type</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Types</option>
              {metrics.filterOptions.reportTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total Jobs"
          value={metrics.kpis.totalJobs.toLocaleString()}
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
        />
        <KPICard
          title="Success Rate"
          value={formatPercent(metrics.kpis.successRate)}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          title="Avg Duration"
          value={formatDuration(metrics.kpis.avgDurationMinutes)}
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
        <KPICard
          title="Avg Cost"
          value={formatCurrency(metrics.kpis.avgCostUsd)}
          icon={<DollarSign className="w-5 h-5" />}
          color="amber"
        />
        <KPICard
          title="Total Cost"
          value={formatCurrency(metrics.kpis.totalCostUsd)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="rose"
        />
        <KPICard
          title="YTD Cost"
          value={formatCurrency(metrics.kpis.totalCostYtd)}
          icon={<DollarSign className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={12} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="jobs" name="Jobs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="cost" name="Cost ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Success Rate Trend */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Success Rate Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Success Rate']}
              />
              <Line
                type="monotone"
                dataKey="successRatePct"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Tables */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex gap-4 border-b border-slate-200 mb-4">
          <TabButton
            active={activeTab === 'groups'}
            onClick={() => setActiveTab('groups')}
          >
            <Users className="w-4 h-4" /> By Group
          </TabButton>
          <TabButton
            active={activeTab === 'reportTypes'}
            onClick={() => setActiveTab('reportTypes')}
          >
            <BarChart3 className="w-4 h-4" /> By Report Type
          </TabButton>
          <TabButton
            active={activeTab === 'stages'}
            onClick={() => setActiveTab('stages')}
          >
            <Clock className="w-4 h-4" /> By Stage
          </TabButton>
        </div>

        {activeTab === 'groups' && (
          <BreakdownTable
            columns={['Group', 'Members', 'Jobs', 'Cost']}
            data={metrics.breakdowns.byGroup.map((row) => [
              row.name,
              row.memberCount.toString(),
              row.jobs.toString(),
              formatCurrency(row.cost),
            ])}
            emptyMessage="No group data available"
          />
        )}

        {activeTab === 'reportTypes' && (
          <BreakdownTable
            columns={['Report Type', 'Jobs', 'Cost']}
            data={metrics.breakdowns.byReportType.map((row) => [
              row.type,
              row.jobs.toString(),
              formatCurrency(row.cost),
            ])}
            emptyMessage="No report type data available"
          />
        )}

        {activeTab === 'stages' && (
          <BreakdownTable
            columns={['Stage', 'API Calls', 'Total Cost', 'Avg Cost']}
            data={metrics.breakdowns.byStage.map((row) => [
              row.stage,
              row.callCount.toString(),
              formatCurrency(row.totalCost),
              formatCurrency(row.avgCost),
            ])}
            emptyMessage="No stage data available"
          />
        )}
      </div>
    </div>
  );
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'rose' | 'indigo';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  indigo: 'bg-indigo-50 text-indigo-600',
};

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-lg font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  </div>
);

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'text-brand-600 border-b-2 border-brand-600 -mb-px'
        : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {children}
  </button>
);

// Breakdown Table Component
interface BreakdownTableProps {
  columns: string[];
  data: string[][];
  emptyMessage: string;
}

const BreakdownTable: React.FC<BreakdownTableProps> = ({ columns, data, emptyMessage }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
