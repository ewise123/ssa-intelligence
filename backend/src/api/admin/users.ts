import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listUsers(req: Request, res: Response) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const users = await prisma.user.findMany({
    orderBy: { email: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      memberships: {
        select: {
          group: {
            select: { id: true, name: true, slug: true }
          }
        }
      }
    }
  });

  return res.json({
    results: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      groups: user.memberships.map((m) => m.group)
    }))
  });
}
