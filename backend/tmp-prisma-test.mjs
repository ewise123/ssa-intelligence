import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
  const r = await p.$queryRawUnsafe('SELECT 1');
  console.log(r);
} catch (e) {
  console.error(e);
}
await p.$disconnect();
