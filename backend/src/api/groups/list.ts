import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listGroups(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const where = req.auth.isAdmin
    ? {}
    : {
        memberships: {
          some: { userId: req.auth.userId }
        }
      };

  const groups = await prisma.group.findMany({
    where,
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true }
  });

  return res.json({ results: groups });
}
