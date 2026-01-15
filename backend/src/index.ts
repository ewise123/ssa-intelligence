/**
 * Express Server
 * Main entry point for SSA Intelligence Research API
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
import { submitFeedback } from './api/feedback.js';
import { exportResearchPdf } from './api/research/export-pdf.js';
import { getResearchOrchestrator } from './services/orchestrator.js';
import { authMiddleware, requireAdmin } from './middleware/auth.js';
import { getMe } from './api/me.js';
import { listGroups } from './api/groups/list.js';
import { listUsers } from './api/admin/users.js';
import { addGroupMember, createGroup, listAdminGroups, removeGroupMember } from './api/admin/groups.js';

// ============================================================================
// SERVER SETUP
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Trust Render/hosted proxy so req.ip reflects the client IP (required for rate limiting)
app.set('trust proxy', 1);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
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
const isProd = process.env.NODE_ENV !== 'development';

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

// Research API routes
app.post('/api/research/generate', ...applyLimiter(generateLimiter), authMiddleware, generateResearch);
app.get('/api/research/jobs/:id', ...applyLimiter(getLimiter), authMiddleware, getJobStatus);
app.get('/api/research/:id', ...applyLimiter(getLimiter), authMiddleware, getResearchDetail);
app.get('/api/research', ...applyLimiter(getLimiter), authMiddleware, listResearch);
app.post('/api/research/:id/cancel', ...applyLimiter(writeLimiter), authMiddleware, cancelResearchJob);
app.delete('/api/research/:id', ...applyLimiter(writeLimiter), authMiddleware, deleteResearchJob);
app.get('/api/research/:id/export/pdf', ...applyLimiter(exportLimiter), authMiddleware, exportResearchPdf);
app.post('/api/feedback', ...applyLimiter(writeLimiter), submitFeedback);
app.get('/api/me', authMiddleware, getMe);
app.get('/api/groups', authMiddleware, listGroups);
app.get('/api/admin/users', authMiddleware, requireAdmin, listUsers);
app.get('/api/admin/groups', authMiddleware, requireAdmin, listAdminGroups);
app.post('/api/admin/groups', authMiddleware, requireAdmin, createGroup);
app.post('/api/admin/groups/:groupId/members', authMiddleware, requireAdmin, addGroupMember);
app.delete('/api/admin/groups/:groupId/members/:userId', authMiddleware, requireAdmin, removeGroupMember);

// Regenerate specific sections (optional - for future implementation)
app.post('/api/research/:id/regenerate', async (req, res) => {
  res.status(501).json({
    error: 'Not implemented',
    message: 'Section regeneration feature coming soon'
  });
});

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
  path.resolve(__dirname, '../../frontend/dist'), // expected in Docker image
  path.resolve(__dirname, '../frontend/dist'),   // fallback if layout differs
  path.resolve(process.cwd(), 'frontend/dist')
];
const frontendDistPath = candidateFrontendPaths.find((p) => fs.existsSync(path.join(p, 'index.html')));

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
    path: req.path
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

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   SSA Intelligence Research API                                     ║
║                                                                ║
║   Status:      Running                                         ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                    ║
║   Port:        ${PORT}                                            ║
║   URL:         http://localhost:${PORT}                          ║
║                                                                ║
║   API Endpoints:                                               ║
║   - POST   /api/research/generate                              ║
║   - GET    /api/research                                       ║
║   - GET    /api/research/jobs/:id                              ║
║   - GET    /api/research/:id                                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Resume queue processing for any queued jobs on startup
const orchestrator = getResearchOrchestrator(prisma);
orchestrator.processQueue().catch((err) => {
  console.error('Failed to start queue processor:', err);
});

export default app;


