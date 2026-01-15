import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthContext } from '../types/auth.js';

const HEADER_CANDIDATES = {
  email: [
    'x-auth-request-email',
    'x-email',
    'x-user-email',
    'x-auth-email',
    'x-forwarded-email'
  ],
  user: [
    'x-auth-request-user',
    'x-user',
    'x-user-id',
    'x-auth-user'
  ],
  groups: [
    'x-auth-request-groups',
    'x-groups'
  ]
};

const normalizeHeaderValue = (value: string | string[] | undefined) => {
  if (!value) return '';
  return Array.isArray(value) ? value.join(',') : value;
};

const getHeader = (req: Request, names: string[]) => {
  for (const name of names) {
    const raw = req.headers[name];
    const value = normalizeHeaderValue(raw);
    if (value) return value;
  }
  return '';
};

const parseAdminEmails = () => {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
};

const parseAllowedDomains = () => {
  const raw = process.env.AUTH_EMAIL_DOMAIN || process.env.OAUTH2_PROXY_EMAIL_DOMAINS || 'ssaandco.com';
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
};

const isAllowedDomain = (email: string, allowedDomains: string[]) => {
  if (!email.includes('@')) return false;
  if (allowedDomains.includes('*')) return true;
  const domain = email.split('@').pop() || '';
  return allowedDomains.includes(domain.toLowerCase());
};

const parseGroups = (raw: string) =>
  raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const resolveAuthContext = async (req: Request): Promise<AuthContext> => {
  const adminEmails = parseAdminEmails();
  const allowedDomains = parseAllowedDomains();

  const emailHeader = getHeader(req, HEADER_CANDIDATES.email).toLowerCase();
  const userHeader = getHeader(req, HEADER_CANDIDATES.user);
  const groupHeader = getHeader(req, HEADER_CANDIDATES.groups);
  const fallbackEmail = process.env.DEV_ADMIN_EMAIL || adminEmails[0] || 'dev-admin@ssaandco.com';

  let email = emailHeader;
  let isDevFallback = false;

  if (process.env.NODE_ENV !== 'production' && process.env.DEV_IMPERSONATE_EMAIL) {
    email = process.env.DEV_IMPERSONATE_EMAIL.toLowerCase();
  }

  if (!email) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing authenticated email');
    }
    email = fallbackEmail;
    isDevFallback = true;
  }

  const isAdmin = adminEmails.includes(email);
  if (!isAdmin && !isAllowedDomain(email, allowedDomains)) {
    throw new Error('Email domain not allowed');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  let user = existing;

  if (user) {
    if (isAdmin && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: userHeader || null,
        role: isAdmin || isDevFallback ? 'ADMIN' : 'MEMBER'
      }
    });
  }

  const memberships = await prisma.groupMembership.findMany({
    where: { userId: user.id },
    select: { groupId: true, group: { select: { slug: true } } }
  });

  return {
    userId: user.id,
    email,
    role: user.role,
    isAdmin: user.role === 'ADMIN',
    groupIds: memberships.map((m) => m.groupId),
    groupSlugs: memberships.map((m) => m.group.slug)
  };
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = await resolveAuthContext(req);
    req.auth = auth;
    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    const status = message === 'Email domain not allowed' ? 403 : 401;
    return res.status(status).json({ error: message });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.auth.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
};

export const buildVisibilityWhere = (auth: AuthContext) => {
  if (auth.isAdmin) return {};

  const clauses: any[] = [
    { userId: auth.userId },
    { visibilityScope: 'GENERAL' }
  ];

  if (auth.groupIds.length) {
    clauses.push({
      visibilityScope: 'GROUP',
      jobGroups: { some: { groupId: { in: auth.groupIds } } }
    });
  }

  return { OR: clauses };
};
