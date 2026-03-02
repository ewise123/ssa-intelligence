import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { parseAllowedDomains, isAllowedDomain } from '../lib/domain-validation.js';
import { decodeAzureClientPrincipal } from './azure-auth.js';
import type { AuthContext } from '../types/auth.js';

const HEADER_CANDIDATES = {
  email: [
    'x-ms-client-principal-name',
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

const parseSuperAdminEmail = () =>
  (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();


const parseGroups = (raw: string) =>
  raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const resolveAuthContext = async (req: Request): Promise<AuthContext> => {
  const adminEmails = parseAdminEmails();
  const superAdminEmail = parseSuperAdminEmail();
  const allowedDomains = parseAllowedDomains();

  // Try Azure Easy Auth first — if X-MS-CLIENT-PRINCIPAL is present and valid,
  // use its email/name. Otherwise fall through to the oauth2-proxy header chain.
  const rawPrincipal = req.headers['x-ms-client-principal'];
  const azurePrincipalHeader = Array.isArray(rawPrincipal) ? rawPrincipal[0] : rawPrincipal;
  const azurePrincipal = decodeAzureClientPrincipal(azurePrincipalHeader);

  const emailHeader = azurePrincipal?.email
    || getHeader(req, HEADER_CANDIDATES.email).toLowerCase();
  const userHeader = azurePrincipal?.name
    || getHeader(req, HEADER_CANDIDATES.user);
  const groupHeader = getHeader(req, HEADER_CANDIDATES.groups);
  const fallbackEmail = process.env.DEV_ADMIN_EMAIL || adminEmails[0] || 'dev-admin@ssaandco.com';

  let email = emailHeader;
  let isDevFallback = false;

  const isDevMode = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';

  if (isDevMode && process.env.DEV_IMPERSONATE_EMAIL) {
    email = process.env.DEV_IMPERSONATE_EMAIL.toLowerCase();
  }

  if (!email) {
    if (!isDevMode) {
      throw new Error('Missing authenticated email');
    }
    email = fallbackEmail;
    isDevFallback = true;
    console.warn(`[auth] Dev fallback active: auto-granting ADMIN to ${email}`);
  }

  const isAdmin = adminEmails.includes(email);
  const isSuperAdmin = superAdminEmail ? email === superAdminEmail : false;

  if (!isAdmin && !isAllowedDomain(email, allowedDomains)) {
    throw new Error('Email domain not allowed');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  let user = existing;

  if (user) {
    // Promote to admin if in ADMIN_EMAILS (or dev fallback) and ensure ACTIVE status
    if ((isAdmin || isDevFallback) && (user.role !== 'ADMIN' || user.status !== 'ACTIVE')) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
    }
    // Super-admin always gets ACTIVE status
    if (isSuperAdmin && user.status !== 'ACTIVE') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE' }
      });
    }
  } else {
    // New users: admins/super-admin get ACTIVE, others get PENDING
    const shouldBeActive = isAdmin || isDevFallback || isSuperAdmin;
    user = await prisma.user.create({
      data: {
        email,
        name: userHeader || null,
        role: isAdmin || isDevFallback ? 'ADMIN' : 'MEMBER',
        status: shouldBeActive ? 'ACTIVE' : 'PENDING'
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
    isSuperAdmin,
    status: user.status,
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

export const requireActiveUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.auth.status !== 'ACTIVE') {
    return res.status(403).json({
      error: 'ACCOUNT_PENDING',
      message: 'Your account has not been activated. Contact an administrator for an invite.'
    });
  }
  return next();
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.auth.isSuperAdmin) {
    return res.status(403).json({ error: 'Super-admin access required' });
  }
  return next();
};

export const buildVisibilityWhere = (auth: AuthContext) => {
  if (auth.isAdmin) return {};

  const clauses: Record<string, unknown>[] = [
    { userId: auth.userId }
  ];

  if (auth.groupIds.length) {
    clauses.push({
      visibilityScope: 'GROUP',
      jobGroups: { some: { groupId: { in: auth.groupIds } } }
    });
  }

  return { OR: clauses };
};
