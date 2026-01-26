/**
 * Cost Tracking Service
 * Manages pricing rate lookups and cost event recording
 */

import { PrismaClient, PricingRate } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}

export interface CostEventParams {
  jobId?: string | null;
  subJobId?: string | null;
  draftId?: string | null;
  stage: string;
  provider: string;
  model: string;
  usage: TokenUsage;
  metadata?: Record<string, unknown>;
}

export interface PricingRateInfo {
  inputRate: number;   // USD per 1M tokens
  outputRate: number;  // USD per 1M tokens
  cacheReadRate: number;
  cacheWriteRate: number;
}

// ============================================================================
// CACHE
// ============================================================================

interface CachedPricing {
  pricing: PricingRateInfo;
  cachedAt: number;
}

const pricingCache = new Map<string, CachedPricing>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Default pricing for fallback (Claude Sonnet 4.5)
const DEFAULT_PRICING: PricingRateInfo = {
  inputRate: 3.0,
  outputRate: 15.0,
  cacheReadRate: 0.3,
  cacheWriteRate: 3.75,
};

// ============================================================================
// SERVICE
// ============================================================================

export class CostTrackingService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get pricing rate for a provider/model combination
   * Uses in-memory cache with 5-minute TTL
   */
  async getPricing(provider: string, model: string): Promise<PricingRateInfo> {
    const cacheKey = `${provider}:${model}`;
    const cached = pricingCache.get(cacheKey);

    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.pricing;
    }

    // Normalize model name for lookup (handle versioned names)
    const normalizedModel = this.normalizeModelName(model);

    try {
      const now = new Date();

      // Find active pricing rate (effectiveFrom <= now, effectiveTo is null or in future)
      const rate = await this.prisma.pricingRate.findFirst({
        where: {
          provider,
          model: normalizedModel,
          effectiveFrom: { lte: now },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gt: now } }
          ]
        },
        orderBy: { effectiveFrom: 'desc' }
      });

      if (rate) {
        const pricing: PricingRateInfo = {
          inputRate: rate.inputRate,
          outputRate: rate.outputRate,
          cacheReadRate: rate.cacheReadRate,
          cacheWriteRate: rate.cacheWriteRate,
        };

        pricingCache.set(cacheKey, { pricing, cachedAt: Date.now() });
        return pricing;
      }

      // Try fallback with base model name
      const baseModel = this.getBaseModelName(normalizedModel);
      if (baseModel !== normalizedModel) {
        const fallbackRate = await this.prisma.pricingRate.findFirst({
          where: {
            provider,
            model: baseModel,
            effectiveFrom: { lte: now },
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gt: now } }
            ]
          },
          orderBy: { effectiveFrom: 'desc' }
        });

        if (fallbackRate) {
          const pricing: PricingRateInfo = {
            inputRate: fallbackRate.inputRate,
            outputRate: fallbackRate.outputRate,
            cacheReadRate: fallbackRate.cacheReadRate,
            cacheWriteRate: fallbackRate.cacheWriteRate,
          };

          pricingCache.set(cacheKey, { pricing, cachedAt: Date.now() });
          return pricing;
        }
      }

      // Log warning and use defaults
      console.warn(`No pricing found for ${provider}/${model}, using defaults`);
      pricingCache.set(cacheKey, { pricing: DEFAULT_PRICING, cachedAt: Date.now() });
      return DEFAULT_PRICING;

    } catch (error) {
      console.error('Failed to fetch pricing:', error);
      return DEFAULT_PRICING;
    }
  }

  /**
   * Calculate cost from token usage and pricing
   */
  calculateCost(usage: TokenUsage, pricing: PricingRateInfo): number {
    const inputCost = (usage.inputTokens * pricing.inputRate) / 1_000_000;
    const outputCost = (usage.outputTokens * pricing.outputRate) / 1_000_000;
    const cacheReadCost = ((usage.cacheReadTokens || 0) * pricing.cacheReadRate) / 1_000_000;
    const cacheWriteCost = ((usage.cacheWriteTokens || 0) * pricing.cacheWriteRate) / 1_000_000;

    return inputCost + outputCost + cacheReadCost + cacheWriteCost;
  }

  /**
   * Record a cost event in the database
   */
  async recordCostEvent(params: CostEventParams): Promise<string> {
    const pricing = await this.getPricing(params.provider, params.model);
    const costUsd = this.calculateCost(params.usage, pricing);

    const event = await this.prisma.costEvent.create({
      data: {
        jobId: params.jobId || null,
        subJobId: params.subJobId || null,
        draftId: params.draftId || null,
        stage: params.stage,
        provider: params.provider,
        model: params.model,
        inputTokens: params.usage.inputTokens,
        outputTokens: params.usage.outputTokens,
        cacheReadTokens: params.usage.cacheReadTokens || 0,
        cacheWriteTokens: params.usage.cacheWriteTokens || 0,
        costUsd,
        metadata: (params.metadata || {}) as any,
      }
    });

    return event.id;
  }

  /**
   * Link pre-job cost events (identified by draftId) to a job
   */
  async linkDraftCosts(draftId: string, jobId: string): Promise<number> {
    if (!draftId || !jobId) return 0;

    const result = await this.prisma.costEvent.updateMany({
      where: {
        draftId,
        jobId: null,
      },
      data: {
        jobId,
      }
    });

    return result.count;
  }

  /**
   * Get total cost for a job (sum of all linked cost events)
   */
  async getJobTotalCost(jobId: string): Promise<number> {
    const result = await this.prisma.costEvent.aggregate({
      where: { jobId },
      _sum: { costUsd: true }
    });

    return result._sum.costUsd || 0;
  }

  /**
   * Normalize model names to match database entries
   * E.g., "claude-sonnet-4-5" -> "claude-sonnet-4-5-20250514"
   */
  private normalizeModelName(model: string): string {
    // If already has date suffix, return as-is
    if (/\d{8}$/.test(model)) {
      return model;
    }

    // Map short names to full names
    const modelMappings: Record<string, string> = {
      'claude-sonnet-4-5': 'claude-sonnet-4-5-20250514',
      'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku': 'claude-3-5-haiku-20241022',
      'claude-3-opus': 'claude-3-opus-20240229',
    };

    return modelMappings[model] || model;
  }

  /**
   * Get base model name without date suffix
   */
  private getBaseModelName(model: string): string {
    return model.replace(/-\d{8}$/, '');
  }

  /**
   * Clear pricing cache (useful for testing or after pricing updates)
   */
  clearCache(): void {
    pricingCache.clear();
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let costTrackingServiceSingleton: CostTrackingService | null = null;

export function getCostTrackingService(prisma: PrismaClient): CostTrackingService {
  if (!costTrackingServiceSingleton) {
    costTrackingServiceSingleton = new CostTrackingService(prisma);
  }
  return costTrackingServiceSingleton;
}
