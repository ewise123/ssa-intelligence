/**
 * Express Application
 * App creation, middleware, and route registration.
 * Server startup lives in index.ts.
 */

import express from 'express';
import type { RequestHandler } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import API routes
import { generateResearch } from './api/research/generate.js';
import { getJobStatus } from './api/research/status.js';
import { getResearchDetail } from './api/research/detail.js';
import { listResearch } from './api/research/list.js';
import { cancelResearchJob } from './api/research/cancel.js';
import { deleteResearchJob } from './api/research/delete.js';
import { rerunResearchSections } from './api/research/rerun.js';
import { submitFeedback, listFeedback, updateFeedback, deleteFeedback } from './api/feedback.js';
import { exportResearchPdf } from './api/research/export-pdf.js';
import { exportResearchMarkdown } from './api/research/export-markdown.js';
import { exportResearchDocx } from './api/research/export-docx.js';
import { authMiddleware, requireAdmin, requireActiveUser } from './middleware/auth.js';
import { getMe } from './api/me.js';
import { listGroups } from './api/groups/list.js';
import { listUsers, getUser, updateUser, deleteUser, createUser } from './api/admin/users.js';
import { addGroupMember, createGroup, listAdminGroups, removeGroupMember, deleteGroup } from './api/admin/groups.js';
import { getMetrics } from './api/admin/metrics.js';
import { listPricingRates, createPricingRate, updatePricingRate, deletePricingRate } from './api/admin/pricing.js';
import * as promptsApi from './api/admin/prompts.js';
import { createInvite, acceptInvite, listInvites, revokeInvite } from './api/admin/invites.js';
import { agentQueryBugReports, listBugReports, getBugReport, updateBugReport, deleteBugReport } from './api/admin/bug-reports.js';
import { getReportBlueprints } from './api/report-blueprints.js';
import { resolveCompany } from './api/company/resolve.js';

// News Intelligence routes
import newsTagsRouter from './api/news/tags.js';
import newsCompaniesRouter from './api/news/companies.js';
import newsPeopleRouter from './api/news/people.js';
import newsUserCallDietRouter from './api/news/user-call-diet.js';
import newsArticlesRouter from './api/news/articles.js';
import newsRefreshRouter from './api/news/refresh.js';
import newsSearchRouter from './api/news/search.js';
import newsExportRouter from './api/news/export.js';
import newsPinsRouter from './api/news/pins.js';
import newsActivityRouter from './api/news/activity.js';
import adminNewsActivityRouter from './api/admin/news-activity.js';

// ============================================================================
// APP SETUP
// ============================================================================

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Trust Render/hosted proxy so req.ip reflects the client IP (required for rate limiting)
app.set('trust proxy', 1);

// CORS
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin?.includes(',')
    ? corsOrigin.split(',').map(s => s.trim())
    : corsOrigin || 'http://localhost:5174',
  credentials: true
}));

// JSON body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (production only, route-specific)
const rateLimitMessage = 'Too many requests from this IP, please try again later.';
const parseEnvInt = (name: string, fallback: number) => {
  const raw = process.env[name];
  const value = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(value) ? value : fallback;
};
const isProd = !['development', 'test'].includes(process.env.NODE_ENV ?? '');

const getLimiter: RequestHandler | undefined = isProd
  ? rateLimit({
      windowMs: parseEnvInt('RATE_LIMIT_GET_WINDOW_MS', 300000), // 5 minutes
      max: parseEnvInt('RATE_LIMIT_GET_MAX', 2000),
      message: rateLimitMessage
    })
  : undefined;

const generateLimiter: RequestHandler | undefined = isProd
  ? rateLimit({
      windowMs: parseEnvInt('RATE_LIMIT_GENERATE_WINDOW_MS', 900000), // 15 minutes
      max: parseEnvInt('RATE_LIMIT_GENERATE_MAX', 10),
      message: rateLimitMessage
    })
  : undefined;

const exportLimiter: RequestHandler | undefined = isProd
  ? rateLimit({
      windowMs: parseEnvInt('RATE_LIMIT_EXPORT_WINDOW_MS', 3600000), // 60 minutes
      max: parseEnvInt('RATE_LIMIT_EXPORT_MAX', 20),
      message: rateLimitMessage
    })
  : undefined;

const writeLimiter: RequestHandler | undefined = isProd
  ? rateLimit({
      windowMs: parseEnvInt('RATE_LIMIT_WRITE_WINDOW_MS', 900000), // 15 minutes
      max: parseEnvInt('RATE_LIMIT_WRITE_MAX', 60),
      message: rateLimitMessage
    })
  : undefined;

// Stricter rate limit for anonymous feedback endpoint
const feedbackLimiter: RequestHandler | undefined = isProd
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: rateLimitMessage
    })
  : undefined;

const applyLimiter = (limiter?: RequestHandler) => (limiter ? [limiter] : []);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  (async () => {
    let dbHealthy = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      dbHealthy = false;
      console.error('Health check DB error:', err);
    }

    const status = dbHealthy ? 'ok' : 'degraded';

    res.json({
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      model: process.env.CLAUDE_MODEL || 'unknown',
      db: dbHealthy
    });
  })().catch((err) => {
    console.error('Health check error:', err);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      model: process.env.CLAUDE_MODEL || 'unknown',
      db: false
    });
  });
});

// Public runtime config (non-sensitive client config)
app.get('/api/config', (req, res) => {
  res.json({
    logoToken: process.env.LOGO_DEV_TOKEN || null
  });
});

// ============================================================================
// AUTH ROUTES (no active-user check)
// ============================================================================

// /api/me returns user status so frontend can show appropriate UI
app.get('/api/me', ...applyLimiter(getLimiter), authMiddleware, getMe);

// Invite acceptance — this is how pending users become active
app.post('/api/invites/accept', ...applyLimiter(writeLimiter), authMiddleware, acceptInvite);

// ============================================================================
// PROTECTED ROUTES (require active user)
// ============================================================================

// Research API routes
app.post('/api/research/generate', ...applyLimiter(generateLimiter), authMiddleware, requireActiveUser, generateResearch);
app.get('/api/research/jobs/:id', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, getJobStatus);
app.get('/api/research/:id', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, getResearchDetail);
app.get('/api/research', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, listResearch);
app.post('/api/research/:id/cancel', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, cancelResearchJob);
app.delete('/api/research/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, deleteResearchJob);
app.get('/api/research/:id/export/pdf', ...applyLimiter(exportLimiter), authMiddleware, requireActiveUser, exportResearchPdf);
app.get('/api/research/:id/export/markdown', ...applyLimiter(exportLimiter), authMiddleware, requireActiveUser, exportResearchMarkdown);
app.get('/api/research/:id/export/docx', ...applyLimiter(exportLimiter), authMiddleware, requireActiveUser, exportResearchDocx);
app.post('/api/research/:id/rerun', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, rerunResearchSections);

// Bug Tracker / Feedback routes
app.post('/api/feedback', ...applyLimiter(feedbackLimiter), submitFeedback);
app.get('/api/feedback', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, listFeedback);
app.patch('/api/feedback/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, updateFeedback);
app.delete('/api/feedback/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, deleteFeedback);

app.get('/api/groups', authMiddleware, requireActiveUser, listGroups);

// ============================================================================
// ADMIN: USER & GROUP MANAGEMENT (admin only)
// ============================================================================

app.get('/api/admin/users', authMiddleware, requireActiveUser, requireAdmin, listUsers);
app.post('/api/admin/users', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, createUser);
app.get('/api/admin/users/:id', authMiddleware, requireActiveUser, requireAdmin, getUser);
app.patch('/api/admin/users/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, updateUser);
app.delete('/api/admin/users/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, deleteUser);
app.get('/api/admin/groups', authMiddleware, requireActiveUser, requireAdmin, listAdminGroups);
app.post('/api/admin/groups', authMiddleware, requireActiveUser, requireAdmin, createGroup);
app.delete('/api/admin/groups/:groupId', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, deleteGroup);
app.post('/api/admin/groups/:groupId/members', authMiddleware, requireActiveUser, requireAdmin, addGroupMember);
app.delete('/api/admin/groups/:groupId/members/:userId', authMiddleware, requireActiveUser, requireAdmin, removeGroupMember);

// ============================================================================
// ADMIN: INVITE MANAGEMENT (admin only)
// ============================================================================

app.get('/api/admin/invites', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, requireAdmin, listInvites);
app.post('/api/admin/invites', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, createInvite);
app.delete('/api/admin/invites/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, revokeInvite);

// ============================================================================
// ADMIN: METRICS, PRICING, PROMPTS (admin only, not super-admin restricted)
// ============================================================================

app.get('/api/admin/metrics', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, requireAdmin, getMetrics);
app.get('/api/admin/pricing', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, requireAdmin, listPricingRates);
app.post('/api/admin/pricing', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, createPricingRate);
app.patch('/api/admin/pricing/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, updatePricingRate);
app.delete('/api/admin/pricing/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, deletePricingRate);

// Admin prompt library routes
app.get('/api/admin/prompts', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, requireAdmin, promptsApi.listPrompts);
app.get('/api/admin/prompts/test/:id', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, requireAdmin, promptsApi.getTestRun);
app.get('/api/admin/prompts/:sectionId/versions', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, requireAdmin, promptsApi.listVersions);
app.get('/api/admin/prompts/:sectionId', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, requireAdmin, promptsApi.getPrompt);
app.post('/api/admin/prompts', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, promptsApi.createPrompt);
app.patch('/api/admin/prompts/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, promptsApi.updatePrompt);
app.delete('/api/admin/prompts/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, promptsApi.deletePrompt);
app.post('/api/admin/prompts/:id/publish', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, promptsApi.publishPrompt);
app.post('/api/admin/prompts/:id/revert/:version', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, promptsApi.revertPrompt);
app.post('/api/admin/prompts/test', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, promptsApi.testPrompt);

// ADMIN: BUG REPORTS (admin only)
app.get('/api/admin/bug-reports/agent-query', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, requireAdmin, agentQueryBugReports);
app.get('/api/admin/bug-reports', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, requireAdmin, listBugReports);
app.get('/api/admin/bug-reports/:id', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, requireAdmin, getBugReport);
app.patch('/api/admin/bug-reports/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, updateBugReport);
app.delete('/api/admin/bug-reports/:id', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, requireAdmin, deleteBugReport);

app.get('/api/report-blueprints', ...applyLimiter(getLimiter), authMiddleware, requireActiveUser, getReportBlueprints);
app.post('/api/company/resolve', ...applyLimiter(writeLimiter), authMiddleware, requireActiveUser, resolveCompany);

// ============================================================================
// NEWS INTELLIGENCE API (require active user)
// ============================================================================
app.use('/api/news/articles', authMiddleware, requireActiveUser, newsArticlesRouter);
app.use('/api/news/search', authMiddleware, requireActiveUser, newsSearchRouter);
app.use('/api/news/export', authMiddleware, requireActiveUser, newsExportRouter);
app.use('/api/news/refresh', authMiddleware, requireActiveUser, requireAdmin, newsRefreshRouter);
app.use('/api/news/tags', authMiddleware, requireActiveUser, requireAdmin, newsTagsRouter);
app.use('/api/news/companies', authMiddleware, requireActiveUser, requireAdmin, newsCompaniesRouter);
app.use('/api/news/people', authMiddleware, requireActiveUser, requireAdmin, newsPeopleRouter);
app.use('/api/news/users', authMiddleware, requireActiveUser, newsUserCallDietRouter);
app.use('/api/news', authMiddleware, requireActiveUser, newsPinsRouter);
app.use('/api/news/activity', authMiddleware, requireActiveUser, newsActivityRouter);
app.use('/api/admin/news/activity', authMiddleware, requireActiveUser, requireAdmin, adminNewsActivityRouter);

// Dev-only auth echo to inspect forwarded headers
app.get('/api/debug/auth', authMiddleware, (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  const headerAllowlist = [
    'x-auth-request-email',
    'x-auth-request-user',
    'x-auth-request-groups',
    'x-email',
    'x-user',
    'x-user-id',
    'x-groups'
  ];
  const forwardedHeaders = Object.fromEntries(
    headerAllowlist
      .map((key) => [key, req.headers[key]])
      .filter(([, value]) => value !== undefined)
  );
  return res.json({
    auth: req.auth || null,
    headers: forwardedHeaders
  });
});

// Serve built frontend if present (non-impacting dev API)
// Try multiple candidate paths to avoid stale build path issues.
const candidateFrontendPaths = [
  path.resolve(__dirname, '../../../frontend/dist'), // Docker: __dirname=/app/backend/dist/src → /app/frontend/dist
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),  // Docker: cwd=/app/backend → /app/frontend/dist
  path.resolve(process.cwd(), 'frontend/dist')
];

const frontendDistPath = candidateFrontendPaths.find((p) => fs.existsSync(path.join(p, 'index.html')))
  ?? (fs.existsSync('/app/frontend/dist/index.html') ? '/app/frontend/dist' : undefined);

if (frontendDistPath) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  // If frontend build is missing, let non-API routes fall through to 404.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.status(404).json({ error: 'Frontend build not found' });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

export default app;
