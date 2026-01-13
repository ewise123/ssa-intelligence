import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const group = await prisma.group.findFirst({
  where: { slug: 'industrials' },
  select: { id: true, name: true }
});

if (!group) {
  console.error('Industrials group not found. Create it first.');
  await prisma.$disconnect();
  process.exit(1);
}

const jobs = await prisma.researchJob.findMany({
  orderBy: { createdAt: 'desc' },
  take: 3,
  select: { id: true, companyName: true }
});

if (!jobs.length) {
  console.log('No research jobs found.');
  await prisma.$disconnect();
  process.exit(0);
}

const jobIds = jobs.map((job) => job.id);

await prisma.researchJob.updateMany({
  where: { id: { in: jobIds } },
  data: { visibilityScope: 'GROUP' }
});

await prisma.researchJobGroup.createMany({
  data: jobIds.map((jobId) => ({ jobId, groupId: group.id })),
  skipDuplicates: true
});

console.log(`Updated ${jobIds.length} jobs to GROUP visibility for ${group.name}.`);
console.log('Job IDs:', jobIds);

await prisma.$disconnect();
