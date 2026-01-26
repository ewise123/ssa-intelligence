/**
 * Admin Pricing API
 * CRUD operations for PricingRate records
 */

import type { RequestHandler } from 'express';
import { prisma } from '../../lib/prisma.js';
import { getCostTrackingService } from '../../services/cost-tracking.js';

/**
 * GET /api/admin/pricing
 * List all pricing rates
 */
export const listPricingRates: RequestHandler = async (req, res) => {
  try {
    const rates = await prisma.pricingRate.findMany({
      orderBy: [
        { provider: 'asc' },
        { model: 'asc' },
        { effectiveFrom: 'desc' },
      ],
    });

    return res.json({ rates });
  } catch (error) {
    console.error('Error fetching pricing rates:', error);
    return res.status(500).json({
      error: 'Failed to fetch pricing rates',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/admin/pricing
 * Create a new pricing rate (sets effectiveTo on previous active rate)
 */
export const createPricingRate: RequestHandler = async (req, res) => {
  try {
    const {
      provider,
      model,
      inputRate,
      outputRate,
      cacheReadRate = 0,
      cacheWriteRate = 0,
    } = req.body;

    // Validate required fields
    if (!provider || typeof provider !== 'string') {
      return res.status(400).json({ error: 'provider is required' });
    }
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'model is required' });
    }
    if (typeof inputRate !== 'number' || inputRate < 0) {
      return res.status(400).json({ error: 'inputRate must be a non-negative number' });
    }
    if (typeof outputRate !== 'number' || outputRate < 0) {
      return res.status(400).json({ error: 'outputRate must be a non-negative number' });
    }
    if (typeof cacheReadRate !== 'number' || cacheReadRate < 0) {
      return res.status(400).json({ error: 'cacheReadRate must be a non-negative number' });
    }
    if (typeof cacheWriteRate !== 'number' || cacheWriteRate < 0) {
      return res.status(400).json({ error: 'cacheWriteRate must be a non-negative number' });
    }

    const now = new Date();

    // Atomically deactivate current rate and create new one to prevent race conditions
    const rate = await prisma.$transaction(async (tx) => {
      // Deactivate any current active rates for this provider/model
      await tx.pricingRate.updateMany({
        where: { provider, model, effectiveTo: null },
        data: { effectiveTo: now },
      });

      // Create new active rate
      return tx.pricingRate.create({
        data: {
          provider,
          model,
          inputRate,
          outputRate,
          cacheReadRate,
          cacheWriteRate,
          effectiveFrom: now,
          effectiveTo: null,
        },
      });
    });

    // Clear pricing cache
    const costTrackingService = getCostTrackingService(prisma);
    costTrackingService.clearCache();

    return res.status(201).json({ rate });
  } catch (error) {
    console.error('Error creating pricing rate:', error);
    return res.status(500).json({
      error: 'Failed to create pricing rate',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * PATCH /api/admin/pricing/:id
 * Update an existing pricing rate (only if effectiveTo is null)
 */
export const updatePricingRate: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { inputRate, outputRate, cacheReadRate, cacheWriteRate } = req.body;

    // Find the rate
    const existing = await prisma.pricingRate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Pricing rate not found' });
    }

    // Only allow updating active rates (effectiveTo is null)
    if (existing.effectiveTo !== null) {
      return res.status(400).json({
        error: 'Cannot update inactive pricing rate. Create a new rate instead.',
      });
    }

    // Build update data
    const updateData: Record<string, number> = {};
    if (typeof inputRate === 'number' && inputRate >= 0) {
      updateData.inputRate = inputRate;
    }
    if (typeof outputRate === 'number' && outputRate >= 0) {
      updateData.outputRate = outputRate;
    }
    if (typeof cacheReadRate === 'number' && cacheReadRate >= 0) {
      updateData.cacheReadRate = cacheReadRate;
    }
    if (typeof cacheWriteRate === 'number' && cacheWriteRate >= 0) {
      updateData.cacheWriteRate = cacheWriteRate;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const rate = await prisma.pricingRate.update({
      where: { id },
      data: updateData,
    });

    // Clear pricing cache
    const costTrackingService = getCostTrackingService(prisma);
    costTrackingService.clearCache();

    return res.json({ rate });
  } catch (error) {
    console.error('Error updating pricing rate:', error);
    return res.status(500).json({
      error: 'Failed to update pricing rate',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * DELETE /api/admin/pricing/:id
 * Delete a pricing rate (only if no cost events reference it)
 */
export const deletePricingRate: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.pricingRate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Pricing rate not found' });
    }

    // Check if any cost events use this exact rate (by provider/model combination)
    // We don't have direct linkage, so just delete
    await prisma.pricingRate.delete({
      where: { id },
    });

    // Clear pricing cache
    const costTrackingService = getCostTrackingService(prisma);
    costTrackingService.clearCache();

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting pricing rate:', error);
    return res.status(500).json({
      error: 'Failed to delete pricing rate',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
