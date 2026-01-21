/**
 * Seed script for News Intelligence default tags
 * Run with: npx tsx prisma/seed-news.ts
 */

import { PrismaClient, TagCategory } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTags = [
  // Universal tags
  { name: 'M&A / Deal Activity', category: TagCategory.universal },
  { name: 'Leadership Changes', category: TagCategory.universal },
  { name: 'Earnings & Operational Performance', category: TagCategory.universal },
  { name: 'Strategy', category: TagCategory.universal },
  { name: 'Value Creation / Cost Initiatives', category: TagCategory.universal },
  { name: 'Digital & Technology Modernization', category: TagCategory.universal },

  // PE-specific tags
  { name: 'Fundraising / New Funds', category: TagCategory.pe },
  { name: 'Operating Partner Activity', category: TagCategory.pe },

  // Industrials tags
  { name: 'Supply Chain & Logistics', category: TagCategory.industrials },
  { name: 'Plant & Footprint Changes', category: TagCategory.industrials },
];

async function main() {
  console.log('Seeding default news tags...');

  for (const tag of defaultTags) {
    const existing = await prisma.newsTag.findUnique({
      where: { name: tag.name },
    });

    if (!existing) {
      await prisma.newsTag.create({
        data: tag,
      });
      console.log(`  Created tag: ${tag.name} (${tag.category})`);
    } else {
      console.log(`  Tag already exists: ${tag.name}`);
    }
  }

  console.log('Done seeding tags.');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
