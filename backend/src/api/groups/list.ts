import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

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

  try {
    const groups = await prisma.group.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true }
    });

    return res.json({ results: groups });
  } catch (error) {
    console.error('Failed to list groups:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
