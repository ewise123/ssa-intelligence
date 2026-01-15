import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

export async function listUsers(req: Request, res: Response) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const rawPage = typeof req.query?.page === 'string' ? req.query.page : '1';
  const rawLimit = typeof req.query?.limit === 'string' ? req.query.limit : '50';
  const page = Math.max(parseInt(rawPage, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 50, 1), 100);
  const skip = (page - 1) * limit;

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { email: 'asc' },
        skip,
        take: limit,
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
      }),
      prisma.user.count()
    ]);

    return res.json({
      results: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        groups: user.memberships.map((m) => m.group)
      })),
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + users.length < total
      }
    });
  } catch (error) {
    console.error('Failed to list users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
