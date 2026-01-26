/**
 * Admin Metrics API
 * GET /api/admin/metrics - Returns aggregated research metrics
 */

import type { RequestHandler } from 'express';
import { prisma } from '../../lib/prisma.js';
import { getMetricsService, MetricsFilters } from '../../services/metrics-service.js';

export const getMetrics: RequestHandler = async (req, res) => {
  try {
    const metricsService = getMetricsService(prisma);

    // Parse query parameters into filters
    const filters: MetricsFilters = {};

    if (req.query.year) {
      const year = parseInt(req.query.year as string, 10);
      if (!isNaN(year)) filters.year = year;
    }

    if (req.query.month) {
      const month = parseInt(req.query.month as string, 10);
      if (!isNaN(month) && month >= 1 && month <= 12) filters.month = month;
    }

    if (req.query.groupIds) {
      const groupIds = Array.isArray(req.query.groupIds)
        ? req.query.groupIds as string[]
        : [req.query.groupIds as string];
      filters.groupIds = groupIds.filter(Boolean);
    }

    if (req.query.reportType) {
      filters.reportType = req.query.reportType as string;
    }

    if (req.query.industry) {
      filters.industry = req.query.industry as string;
    }

    if (req.query.geography) {
      filters.geography = req.query.geography as string;
    }

    if (req.query.status) {
      filters.status = req.query.status as string;
    }

    if (req.query.visibility) {
      filters.visibility = req.query.visibility as string;
    }

    if (req.query.userId) {
      filters.userId = req.query.userId as string;
    }

    const metrics = await metricsService.getMetrics(filters);

    return res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
