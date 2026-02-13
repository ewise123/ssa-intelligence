import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function listAdminGroups(req: Request, res: Response) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const groups = await prisma.group.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        memberships: { select: { userId: true } }
      }
    });

    return res.json({
      results: groups.map((group) => ({
        id: group.id,
        name: group.name,
        slug: group.slug,
        memberCount: group.memberships.length
      }))
    });
  } catch (error) {
    console.error('Failed to list admin groups:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createGroup(req: Request, res: Response) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const providedSlug = typeof req.body?.slug === 'string' ? req.body.slug.trim() : '';
  const slug = providedSlug ? slugify(providedSlug) : slugify(name);

  if (!name || !slug) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  try {
    const group = await prisma.group.create({
      data: { name, slug },
      select: { id: true, name: true, slug: true }
    });
    return res.status(201).json(group);
  } catch (error) {
    return res.status(400).json({ error: 'Group already exists or invalid slug' });
  }
}

export async function addGroupMember(req: Request, res: Response) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { groupId } = req.params;
  const userId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  if (!groupId || (!userId && !email)) {
    return res.status(400).json({ error: 'groupId and userId/email required' });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true }
  });

  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    await prisma.groupMembership.upsert({
      where: { userId_groupId: { userId: user.id, groupId } },
      update: {},
      create: { userId: user.id, groupId }
    });

    return res.json({ success: true, userId: user.id, groupId });
  } catch (error) {
    console.error('Failed to add group member:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeGroupMember(req: Request, res: Response) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { groupId, userId } = req.params;
  if (!groupId || !userId) {
    return res.status(400).json({ error: 'groupId and userId required' });
  }

  try {
    await prisma.groupMembership.deleteMany({
      where: { groupId, userId }
    });

    return res.json({ success: true, userId, groupId });
  } catch (error) {
    console.error('Failed to remove group member:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteGroup(req: Request, res: Response) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { groupId } = req.params;
  if (!groupId) {
    return res.status(400).json({ error: 'Group ID required' });
  }

  try {
    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true }
    });

    if (!existingGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Delete group (cascade deletes memberships handled by Prisma schema)
    await prisma.group.delete({
      where: { id: groupId }
    });

    return res.json({ success: true, id: groupId, name: existingGroup.name });
  } catch (error: unknown) {
    // Handle concurrent deletion (P2025 = record not found during delete)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({ error: 'Group not found' });
    }
    console.error('Failed to delete group:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
