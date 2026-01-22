import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

const VALID_ROLES = ['ADMIN', 'MEMBER'] as const;
type UserRole = typeof VALID_ROLES[number];

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

export async function getUser(req: Request, res: Response) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'User ID required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
      groups: user.memberships.map((m) => m.group)
    });
  } catch (error) {
    console.error('Failed to get user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUser(req: Request, res: Response) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : undefined;
  const role = typeof req.body?.role === 'string' ? req.body.role.toUpperCase() : undefined;

  // Validate name length if provided
  if (name !== undefined && name.length > 100) {
    return res.status(400).json({ error: 'Name must be 100 characters or less' });
  }

  // Validate role if provided
  if (role !== undefined && !VALID_ROLES.includes(role as UserRole)) {
    return res.status(400).json({ error: 'Invalid role. Must be ADMIN or MEMBER' });
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true }
  });

  if (!existingUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent self-demotion from admin
  if (req.auth.userId === id && role === 'MEMBER' && existingUser.role === 'ADMIN') {
    return res.status(400).json({ error: 'Cannot demote yourself from admin' });
  }

  // Build update data
  const updateData: { name?: string | null; role?: UserRole } = {};
  if (name !== undefined) updateData.name = name || null;
  if (role !== undefined) updateData.role = role as UserRole;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      groups: user.memberships.map((m) => m.group)
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'User ID required' });
  }

  // Prevent self-deletion
  if (req.auth.userId === id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true }
  });

  if (!existingUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    // Delete user (cascade deletes handled by Prisma schema)
    await prisma.user.delete({
      where: { id }
    });

    return res.json({ success: true, id, email: existingUser.email });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
