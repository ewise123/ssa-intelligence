/**
 * Seed script for pricing rates and other default data
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Current Anthropic pricing for Claude models (as of 2025)
// https://www.anthropic.com/pricing
const pricingRates = [
  {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250514',
    inputRate: 3.0,        // $3.00 per 1M input tokens
    outputRate: 15.0,      // $15.00 per 1M output tokens
    cacheReadRate: 0.3,    // $0.30 per 1M tokens (10% of input)
    cacheWriteRate: 3.75,  // $3.75 per 1M tokens (125% of input)
  },
  {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    inputRate: 3.0,
    outputRate: 15.0,
    cacheReadRate: 0.3,
    cacheWriteRate: 3.75,
  },
  {
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    inputRate: 0.8,
    outputRate: 4.0,
    cacheReadRate: 0.08,
    cacheWriteRate: 1.0,
  },
  {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    inputRate: 15.0,
    outputRate: 75.0,
    cacheReadRate: 1.5,
    cacheWriteRate: 18.75,
  },
];

async function seedPricingRates() {
  console.log('Seeding pricing rates...');

  for (const rate of pricingRates) {
    // Check if an active rate already exists for this provider/model
    const existing = await prisma.pricingRate.findFirst({
      where: {
        provider: rate.provider,
        model: rate.model,
        effectiveTo: null, // Currently active
      },
    });

    if (!existing) {
      await prisma.pricingRate.create({
        data: {
          ...rate,
          effectiveFrom: new Date(),
          effectiveTo: null,
        },
      });
      console.log(`  Created pricing rate: ${rate.provider}/${rate.model}`);
    } else {
      console.log(`  Pricing rate already exists: ${rate.provider}/${rate.model}`);
    }
  }

  console.log('Done seeding pricing rates.');
}

async function main() {
  await seedPricingRates();
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
