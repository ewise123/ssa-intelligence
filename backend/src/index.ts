/**
 * Express Server
 * Server startup, queue processing, graceful shutdown, and news scheduler.
 * App creation and route registration live in app.ts.
 */

import app from './app.js';
import { prisma } from './lib/prisma.js';
import { getResearchOrchestrator } from './services/orchestrator.js';
import { initNewsScheduler } from './services/news-scheduler.js';

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.CORS_ORIGIN || `http://localhost:${PORT}`;
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   SSA Intelligence Research API                                ║
║                                                                ║
║   Status:      Running                                         ║
║   Environment: ${env.padEnd(44)}║
║   Port:        ${String(PORT).padEnd(44)}║
║   URL:         ${baseUrl.padEnd(44)}║
║                                                                ║
║   API Endpoints:                                               ║
║   - POST   /api/research/generate                              ║
║   - GET    /api/research                                       ║
║   - GET    /api/research/jobs/:id                              ║
║   - GET    /api/research/:id                                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);

  // Initialize news scheduler for daily refresh at midnight EST
  initNewsScheduler();
});

// Graceful shutdown
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received, initiating graceful shutdown...`);

  // Stop accepting new connections; enforce a hard 10s timeout so
  // lingering keep-alive connections don't block shutdown indefinitely.
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('server.close timed out after 10s, forcing connections closed');
      if (typeof (server as any).closeAllConnections === 'function') {
        (server as any).closeAllConnections();
      }
      resolve();
    }, 10_000);

    server.close(() => {
      clearTimeout(timeout);
      resolve();
    });
  });

  // Stop the orchestrator from picking up new jobs
  const orch = getResearchOrchestrator(prisma);
  orch.stop();

  // Wait for current job to finish (up to 60s)
  const idled = await orch.waitForIdle(60000);
  if (!idled) {
    console.warn('Graceful shutdown timeout — some jobs may be incomplete');
  }

  // Disconnect database
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM').catch((err) => {
    console.error('Graceful shutdown failed:', err);
    process.exit(1);
  });
});
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT').catch((err) => {
    console.error('Graceful shutdown failed:', err);
    process.exit(1);
  });
});

// Resume queue processing for any queued jobs on startup
const orchestrator = getResearchOrchestrator(prisma);
orchestrator.processQueue().catch((err) => {
  console.error('Failed to start queue processor:', err);
});

export default app;
