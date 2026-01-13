import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMe(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
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

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isAdmin: user.role === 'ADMIN',
    groups: user.memberships.map((m) => m.group)
  });
}
