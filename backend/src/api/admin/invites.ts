import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { parseAllowedDomains, isAllowedDomain } from '../../lib/domain-validation.js';

/** POST /api/admin/invites — Create a new invite (admin only) */
export async function createInvite(req: Request, res: Response) {
  if (!req.auth?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const allowedDomains = parseAllowedDomains();
  if (!isAllowedDomain(email, allowedDomains)) {
    return res.status(400).json({ error: 'Email domain not allowed' });
  }

  try {
    // Check if user is already active
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true }
    });

    if (existingUser?.status === 'ACTIVE') {
      return res.status(400).json({ error: 'User is already active' });
    }

    // Check for an unexpired, unused invite for the same email
    const existingInvite = await prisma.invite.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (existingInvite) {
      return res.status(409).json({
        error: 'An active invite already exists for this email',
        inviteId: existingInvite.id
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

    const token = crypto.randomBytes(32).toString('base64url');

    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        createdById: req.auth.userId,
        expiresAt
      }
    });

    const appUrl = process.env.APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5174';
    const inviteUrl = `${appUrl.replace(/\/$/, '')}/#/invite/${invite.token}`;

    return res.status(201).json({
      id: invite.id,
      email: invite.email,
      token: invite.token,
      inviteUrl,
      expiresAt: invite.expiresAt
    });
  } catch (error) {
    console.error('Failed to create invite:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/** POST /api/invites/accept — Accept an invite (auth required, active-user NOT required) */
export async function acceptInvite(req: Request, res: Response) {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const invite = await prisma.invite.findUnique({ where: { token } });

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (invite.used) {
      return res.status(400).json({ error: 'This invite has already been used' });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ error: 'This invite has expired' });
    }

    if (invite.email.toLowerCase() !== req.auth.email.toLowerCase()) {
      return res.status(403).json({
        error: 'This invite was sent to a different email address'
      });
    }

    // Accept the invite and activate the user in a transaction.
    // Use interactive transaction with conditional update to prevent race conditions:
    // if a concurrent request already flipped used=true, the updateMany returns count=0.
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.invite.updateMany({
        where: { id: invite.id, used: false },
        data: {
          used: true,
          usedAt: new Date(),
          usedById: req.auth!.userId
        }
      });

      if (updated.count === 0) {
        return null; // Already accepted by a concurrent request
      }

      return tx.user.update({
        where: { id: req.auth!.userId },
        data: { status: 'ACTIVE' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          memberships: {
            select: {
              group: {
                select: { id: true, name: true, slug: true }
              }
            }
          }
        }
      });
    });

    if (!result) {
      return res.status(400).json({ error: 'This invite has already been used' });
    }

    const updatedUser = result;

    return res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      isAdmin: updatedUser.role === 'ADMIN',
      isSuperAdmin: req.auth.isSuperAdmin,
      status: updatedUser.status,
      groups: updatedUser.memberships.map((m) => m.group)
    });
  } catch (error) {
    console.error('Failed to accept invite:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/** GET /api/admin/invites — List all invites (admin only) */
export async function listInvites(req: Request, res: Response) {
  if (!req.auth?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const invites = await prisma.invite.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { email: true, name: true } },
        usedBy: { select: { email: true, name: true } }
      }
    });

    const now = new Date();
    const results = invites.map((invite) => {
      let status: 'active' | 'used' | 'expired';
      if (invite.used) {
        status = 'used';
      } else if (invite.expiresAt < now) {
        status = 'expired';
      } else {
        status = 'active';
      }

      // Only expose token/URL for active invites (unused + non-expired)
      let inviteUrl: string | null = null;
      if (status === 'active') {
        const appUrl = process.env.APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5174';
        inviteUrl = `${appUrl.replace(/\/$/, '')}/#/invite/${invite.token}`;
      }

      return {
        id: invite.id,
        email: invite.email,
        inviteUrl,
        status,
        used: invite.used,
        usedAt: invite.usedAt,
        usedBy: invite.usedBy,
        createdBy: invite.createdBy,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt
      };
    });

    return res.json({ results });
  } catch (error) {
    console.error('Failed to list invites:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/** DELETE /api/admin/invites/:id — Revoke an unused invite (admin only) */
export async function revokeInvite(req: Request, res: Response) {
  if (!req.auth?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Invite ID required' });
  }

  try {
    const invite = await prisma.invite.findUnique({ where: { id } });

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (invite.used) {
      return res.status(400).json({ error: 'Cannot revoke an already used invite' });
    }

    // Use deleteMany with condition to prevent deleting a concurrently-accepted invite
    const deleted = await prisma.invite.deleteMany({ where: { id, used: false } });
    if (deleted.count === 0) {
      return res.status(400).json({ error: 'Cannot revoke an already used invite' });
    }

    return res.json({ success: true, id });
  } catch (error) {
    console.error('Failed to revoke invite:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
