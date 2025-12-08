/**
 * Express Server
 * Main entry point for Intellectra Research API
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import API routes
import { generateResearch } from './api/research/generate';
import { getJobStatus } from './api/research/status';
import { getResearchDetail } from './api/research/detail';
import { listResearch } from './api/research/list';

// ============================================================================
// SERVER SETUP
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true
}));

// JSON body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);
}

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
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Research API routes
app.post('/api/research/generate', generateResearch);
app.get('/api/research/jobs/:id', getJobStatus);
app.get('/api/research/:id', getResearchDetail);
app.get('/api/research', listResearch);

// Regenerate specific sections (optional - for future implementation)
app.post('/api/research/:id/regenerate', async (req, res) => {
  res.status(501).json({
    error: 'Not implemented',
    message: 'Section regeneration feature coming soon'
  });
});

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
║   Intellectra Research API                                     ║
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

export default app;
