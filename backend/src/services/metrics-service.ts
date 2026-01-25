/**
 * Metrics Service
 * Aggregates research job metrics for the admin dashboard
 */

import { PrismaClient, Prisma } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface MetricsFilters {
  year?: number;
  month?: number; // 1-12
  groupIds?: string[];
  reportType?: string;
  industry?: string;
  geography?: string;
  status?: string;
  visibility?: string;
  userId?: string;
}

export interface KPIs {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  successRate: number; // completed / (completed + failed), excludes cancelled
  avgDurationMinutes: number;
  avgCostUsd: number;
  totalCostUsd: number;
  totalCostYtd: number;
}

export interface MonthlyTrend {
  month: string; // "2026-01"
  jobs: number;
  cost: number;
  avgDuration: number;
  successRate: number;
}

export interface GroupBreakdown {
  groupId: string;
  name: string;
  memberCount: number;
  jobs: number;
  cost: number;
}

export interface ReportTypeBreakdown {
  type: string;
  jobs: number;
  cost: number;
}

export interface StageBreakdown {
  stage: string;
  totalCost: number;
  avgCost: number;
  callCount: number;
}

export interface FilterOptions {
  years: number[];
  groups: Array<{ id: string; name: string }>;
  reportTypes: string[];
  industries: string[];
  geographies: string[];
  users: Array<{ id: string; email: string }>;
}

export interface MetricsResponse {
  kpis: KPIs;
  monthlyTrends: MonthlyTrend[];
  breakdowns: {
    byGroup: GroupBreakdown[];
    byReportType: ReportTypeBreakdown[];
    byStage: StageBreakdown[];
  };
  filterOptions: FilterOptions;
}

// ============================================================================
// SERVICE
// ============================================================================

export class MetricsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get aggregated metrics based on filters
   */
  async getMetrics(filters: MetricsFilters): Promise<MetricsResponse> {
    const [kpis, monthlyTrends, breakdowns, filterOptions] = await Promise.all([
      this.getKPIs(filters),
      this.getMonthlyTrends(filters),
      this.getBreakdowns(filters),
      this.getFilterOptions(),
    ]);

    return {
      kpis,
      monthlyTrends,
      breakdowns,
      filterOptions,
    };
  }

  /**
   * Get KPIs based on filters
   */
  private async getKPIs(filters: MetricsFilters): Promise<KPIs> {
    const whereClause = this.buildWhereClause(filters);

    // Get job counts and aggregations
    const [totalResult, statusCounts, aggregations, ytdCost] = await Promise.all([
      this.prisma.researchJob.count({ where: whereClause }),
      this.prisma.researchJob.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
      }),
      this.prisma.researchJob.aggregate({
        where: {
          ...whereClause,
          status: { in: ['completed', 'completed_with_errors'] },
        },
        _avg: {
          costUsd: true,
        },
        _sum: {
          costUsd: true,
        },
      }),
      this.getYtdCost(filters),
    ]);

    // Calculate status-based metrics
    const statusMap = new Map(statusCounts.map((s) => [s.status, s._count]));
    const completedJobs = (statusMap.get('completed') || 0) + (statusMap.get('completed_with_errors') || 0);
    const failedJobs = statusMap.get('failed') || 0;
    const totalForSuccessRate = completedJobs + failedJobs;
    const successRate = totalForSuccessRate > 0 ? completedJobs / totalForSuccessRate : 0;

    // Get average duration from completed jobs
    const avgDuration = await this.getAverageDuration(filters);

    return {
      totalJobs: totalResult,
      completedJobs,
      failedJobs,
      successRate,
      avgDurationMinutes: avgDuration / 60000, // Convert ms to minutes
      avgCostUsd: aggregations._avg.costUsd || 0,
      totalCostUsd: aggregations._sum.costUsd || 0,
      totalCostYtd: ytdCost,
    };
  }

  /**
   * Get YTD cost (from Jan 1 of current or specified year)
   */
  private async getYtdCost(filters: MetricsFilters): Promise<number> {
    const year = filters.year || new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);

    const result = await this.prisma.researchJob.aggregate({
      where: {
        createdAt: {
          gte: yearStart,
          lt: yearEnd,
        },
        status: { in: ['completed', 'completed_with_errors'] },
      },
      _sum: {
        costUsd: true,
      },
    });

    return result._sum.costUsd || 0;
  }

  /**
   * Get average duration for completed jobs
   */
  private async getAverageDuration(filters: MetricsFilters): Promise<number> {
    const whereClause = this.buildWhereClause(filters);

    // Get completed jobs with start and completion times
    const jobs = await this.prisma.researchJob.findMany({
      where: {
        ...whereClause,
        status: { in: ['completed', 'completed_with_errors'] },
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    if (jobs.length === 0) return 0;

    const totalDuration = jobs.reduce((sum, job) => {
      if (job.startedAt && job.completedAt) {
        return sum + (job.completedAt.getTime() - job.startedAt.getTime());
      }
      return sum;
    }, 0);

    return Math.round(totalDuration / jobs.length);
  }

  /**
   * Get monthly trends
   */
  private async getMonthlyTrends(filters: MetricsFilters): Promise<MonthlyTrend[]> {
    // Build date filter based on whether year is specified
    let dateFilter: { gte?: Date; lt?: Date } | undefined;

    if (filters.year) {
      const startDate = new Date(filters.year, 0, 1);
      const endDate = new Date(filters.year + 1, 0, 1);
      dateFilter = { gte: startDate, lt: endDate };
    }

    // Get all jobs (using createdAt as time dimension)
    const jobs = await this.prisma.researchJob.findMany({
      where: {
        ...(dateFilter ? { createdAt: dateFilter } : {}),
        ...this.buildGroupAndTypeFilters(filters),
      },
      select: {
        status: true,
        createdAt: true,
        completedAt: true,
        costUsd: true,
        startedAt: true,
      },
    });

    // Group by month (using createdAt)
    const monthlyMap = new Map<string, {
      total: number;
      completed: number;
      failed: number;
      cost: number;
      durations: number[];
    }>();

    // If a specific year is selected, initialize all 12 months
    if (filters.year) {
      for (let m = 0; m < 12; m++) {
        const monthKey = `${filters.year}-${String(m + 1).padStart(2, '0')}`;
        monthlyMap.set(monthKey, {
          total: 0,
          completed: 0,
          failed: 0,
          cost: 0,
          durations: [],
        });
      }
    }

    // Populate with actual data
    for (const job of jobs) {
      const jobDate = job.createdAt;
      if (!jobDate) continue;
      const monthKey = `${jobDate.getFullYear()}-${String(jobDate.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          total: 0,
          completed: 0,
          failed: 0,
          cost: 0,
          durations: [],
        });
      }

      const monthData = monthlyMap.get(monthKey)!;

      monthData.total++;
      if (job.status === 'completed' || job.status === 'completed_with_errors') {
        monthData.completed++;
        monthData.cost += job.costUsd || 0;
        if (job.startedAt && job.completedAt) {
          monthData.durations.push(job.completedAt.getTime() - job.startedAt.getTime());
        }
      } else if (job.status === 'failed') {
        monthData.failed++;
      }
    }

    // Convert to array
    const trends: MonthlyTrend[] = [];
    for (const [month, data] of monthlyMap) {
      const totalForRate = data.completed + data.failed;
      trends.push({
        month,
        jobs: data.total,
        cost: data.cost,
        avgDuration: data.durations.length > 0
          ? Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length)
          : 0,
        successRate: totalForRate > 0 ? data.completed / totalForRate : 0,
      });
    }

    return trends.sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Get breakdowns by group, report type, and stage
   */
  private async getBreakdowns(filters: MetricsFilters): Promise<{
    byGroup: GroupBreakdown[];
    byReportType: ReportTypeBreakdown[];
    byStage: StageBreakdown[];
  }> {
    const [byGroup, byReportType, byStage] = await Promise.all([
      this.getGroupBreakdown(filters),
      this.getReportTypeBreakdown(filters),
      this.getStageBreakdown(filters),
    ]);

    return { byGroup, byReportType, byStage };
  }

  /**
   * Get breakdown by group
   */
  private async getGroupBreakdown(filters: MetricsFilters): Promise<GroupBreakdown[]> {
    const whereClause = this.buildWhereClause(filters);

    // Get all groups with member counts
    const groups = await this.prisma.group.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { memberships: true },
        },
      },
    });

    // Get job counts and costs per group
    const groupStats = await this.prisma.researchJobGroup.groupBy({
      by: ['groupId'],
      where: {
        job: whereClause,
      },
      _count: true,
    });

    // Get costs per group (need to aggregate from jobs)
    const groupCosts = new Map<string, number>();
    for (const stat of groupStats) {
      const jobs = await this.prisma.researchJob.findMany({
        where: {
          ...whereClause,
          jobGroups: {
            some: { groupId: stat.groupId },
          },
        },
        select: { costUsd: true },
      });
      groupCosts.set(stat.groupId, jobs.reduce((sum, j) => sum + (j.costUsd || 0), 0));
    }

    const statMap = new Map(groupStats.map((s) => [s.groupId, s._count]));

    return groups.map((group) => ({
      groupId: group.id,
      name: group.name,
      memberCount: group._count.memberships,
      jobs: statMap.get(group.id) || 0,
      cost: groupCosts.get(group.id) || 0,
    })).filter((g) => g.jobs > 0);
  }

  /**
   * Get breakdown by report type
   */
  private async getReportTypeBreakdown(filters: MetricsFilters): Promise<ReportTypeBreakdown[]> {
    const whereClause = this.buildWhereClause(filters);

    const stats = await this.prisma.researchJob.groupBy({
      by: ['reportType'],
      where: whereClause,
      _count: true,
      _sum: {
        costUsd: true,
      },
    });

    return stats.map((stat) => ({
      type: stat.reportType,
      jobs: stat._count,
      cost: stat._sum.costUsd || 0,
    }));
  }

  /**
   * Get breakdown by stage from CostEvents
   */
  private async getStageBreakdown(filters: MetricsFilters): Promise<StageBreakdown[]> {
    const whereClause = this.buildWhereClause(filters);

    // Get job IDs that match the filter
    const jobs = await this.prisma.researchJob.findMany({
      where: whereClause,
      select: { id: true },
    });
    const jobIds = jobs.map((j) => j.id);

    if (jobIds.length === 0) {
      return [];
    }

    // Aggregate cost events by stage
    const stats = await this.prisma.costEvent.groupBy({
      by: ['stage'],
      where: {
        jobId: { in: jobIds },
      },
      _count: true,
      _sum: {
        costUsd: true,
      },
      _avg: {
        costUsd: true,
      },
    });

    return stats.map((stat) => ({
      stage: stat.stage,
      totalCost: stat._sum.costUsd || 0,
      avgCost: stat._avg.costUsd || 0,
      callCount: stat._count,
    }));
  }

  /**
   * Get available filter options
   */
  private async getFilterOptions(): Promise<FilterOptions> {
    const [years, groups, reportTypes, industries, geographies, users] = await Promise.all([
      this.getAvailableYears(),
      this.prisma.group.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.getDistinctReportTypes(),
      this.getDistinctIndustries(),
      this.getDistinctGeographies(),
      this.prisma.user.findMany({
        select: { id: true, email: true },
        orderBy: { email: 'asc' },
      }),
    ]);

    return {
      years,
      groups,
      reportTypes,
      industries,
      geographies,
      users,
    };
  }

  /**
   * Get available years from jobs (using createdAt as fallback)
   */
  private async getAvailableYears(): Promise<number[]> {
    // Get all jobs with either completedAt or createdAt
    const result = await this.prisma.researchJob.findMany({
      select: {
        completedAt: true,
        createdAt: true,
      },
    });

    const years = new Set<number>();
    for (const job of result) {
      // Prefer completedAt, fall back to createdAt
      const date = job.completedAt || job.createdAt;
      if (date) {
        years.add(date.getFullYear());
      }
    }

    // If no years found, add current year as default
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }

    return Array.from(years).sort((a, b) => b - a);
  }

  /**
   * Get distinct report types
   */
  private async getDistinctReportTypes(): Promise<string[]> {
    const result = await this.prisma.researchJob.findMany({
      select: { reportType: true },
      distinct: ['reportType'],
    });
    return result.map((r) => r.reportType);
  }

  /**
   * Get distinct industries
   */
  private async getDistinctIndustries(): Promise<string[]> {
    const result = await this.prisma.researchJob.findMany({
      where: { industry: { not: null } },
      select: { industry: true },
      distinct: ['industry'],
    });
    return result.map((r) => r.industry).filter((i): i is string => i !== null);
  }

  /**
   * Get distinct geographies
   */
  private async getDistinctGeographies(): Promise<string[]> {
    const result = await this.prisma.researchJob.findMany({
      select: { geography: true },
      distinct: ['geography'],
    });
    return result.map((r) => r.geography);
  }

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(filters: MetricsFilters): Prisma.ResearchJobWhereInput {
    const where: Prisma.ResearchJobWhereInput = {};

    // Year/month filter - use createdAt as the time dimension (always available)
    if (filters.year) {
      const startDate = filters.month
        ? new Date(filters.year, filters.month - 1, 1)
        : new Date(filters.year, 0, 1);
      const endDate = filters.month
        ? new Date(filters.year, filters.month, 1)
        : new Date(filters.year + 1, 0, 1);

      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Group filter
    if (filters.groupIds && filters.groupIds.length > 0) {
      where.jobGroups = {
        some: {
          groupId: { in: filters.groupIds },
        },
      };
    }

    // Report type filter
    if (filters.reportType) {
      where.reportType = filters.reportType as any;
    }

    // Industry filter
    if (filters.industry) {
      where.industry = filters.industry;
    }

    // Geography filter
    if (filters.geography) {
      where.geography = filters.geography;
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Visibility filter
    if (filters.visibility) {
      where.visibilityScope = filters.visibility as any;
    }

    // User filter
    if (filters.userId) {
      where.userId = filters.userId;
    }

    return where;
  }

  /**
   * Build partial where clause for group and type filters only
   */
  private buildGroupAndTypeFilters(filters: MetricsFilters): Prisma.ResearchJobWhereInput {
    const where: Prisma.ResearchJobWhereInput = {};

    if (filters.groupIds && filters.groupIds.length > 0) {
      where.jobGroups = {
        some: {
          groupId: { in: filters.groupIds },
        },
      };
    }

    if (filters.reportType) {
      where.reportType = filters.reportType as any;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    return where;
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let metricsServiceSingleton: MetricsService | null = null;

export function getMetricsService(prisma: PrismaClient): MetricsService {
  if (!metricsServiceSingleton) {
    metricsServiceSingleton = new MetricsService(prisma);
  }
  return metricsServiceSingleton;
}
