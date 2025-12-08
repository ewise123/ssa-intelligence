# Intellectra Storage & Persistence Overview

This summarizes how research data is stored, updated, and inspected.

## Stack
- Postgres: source of truth for jobs, sub-jobs, users, API keys.
- Prisma: schema and client; schema at `backend/prisma/schema.prisma`.
- Redis: cache/state aid (not the source of truth for research outputs).

## Database schema (Postgres)
- `ResearchJob`: one row per research run. Fields:
  - Status/progress/currentStage; timestamps.
  - Inputs: `companyName`, `geography`, `industry`, `focusAreas`.
  - Outputs (JSON): `foundation`, `execSummary`, `financialSnapshot`, `companyOverview`, `segmentAnalysis`, `trends`, `peerBenchmarking`, `skuOpportunities`, `recentNews`, `conversationStarters`, `appendix`.
  - `overallConfidence`, `metadata`, FK to `User`.
- `ResearchSubJob`: one row per stage (foundation + 10 sections). Tracks `stage`, `status`, `attempts/maxAttempts`, `lastError`, `output` JSON, `confidence`, `sourcesUsed`, timing fields, FK to `ResearchJob`.
- `User`: minimal user profile; current flows upsert a `demo-user`.
- `ApiKey`: optional API key management per user.

## Orchestration flow (Prisma-powered)
1) `ResearchOrchestrator.createJob`:
   - Inserts `ResearchJob` (status `pending`, progress 0).
   - Inserts 11 `ResearchSubJob` rows (foundation + sections) with dependencies (see `STAGE_DEPENDENCIES` in `backend/src/services/orchestrator.ts`).
2) `executeJob` runs stages respecting dependencies:
   - Foundation first; then sections in phases; appendix last (auto-generated).
3) On stage completion:
   - Writes section output JSON to `ResearchJob` and `ResearchSubJob`, sets `confidence`, `sourcesUsed`, updates progress.
4) Completion:
   - If all sub-jobs are done, sets `ResearchJob.status` to `completed` (or `failed` if any failed).

## API and data consumption
- Backend API (Express) exposes:
  - `POST /api/research/generate` -> creates a job.
  - `GET /api/research` -> list jobs.
  - `GET /api/research/:id` or `/api/research/jobs/:id` -> job detail.
- Frontend maps backend sections to UI sections; missing/empty data renders “No content available.”

## Redis usage
- Configured via `REDIS_URL` in `backend/.env`.
- Used for job state/caching; not relied on for persistent research outputs (those are in Postgres).

## Local connection details (from `backend/.env`)
- `DATABASE_URL="postgresql://intellectra:intellectra_dev_password@localhost:5434/intellectra_research"`
- Redis: `redis://:intellectra_redis_password@localhost:6379`
- CORS: `http://localhost:5176`
- Port: backend 3000 (default).

## Inspecting data
- Prisma Studio (UI):
  ```
  cd backend
  npx prisma studio --schema prisma/schema.prisma
  ```
  Opens http://localhost:5555 (default); tables: ResearchJob, ResearchSubJob, User, ApiKey.
- SQL (psql):
  ```
  psql "postgresql://intellectra:intellectra_dev_password@localhost:5434/intellectra_research"
  SELECT id, status, companyName, progress FROM "ResearchJob" ORDER BY "createdAt" DESC LIMIT 10;
  ```

## Resetting data (local/dev)
- Truncate tables (be careful; destructive):
  ```
  cd backend
  $script='TRUNCATE TABLE "ResearchSubJob", "ResearchJob", "User", "ApiKey" CASCADE;';
  $script | npx prisma db execute --stdin --schema prisma/schema.prisma
  ```
- Recreate demo user if needed:
  ```
  node -e "import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); (async()=>{await p.user.upsert({where:{id:'demo-user'},update:{},create:{id:'demo-user',email:'demo@example.com',name:'Demo User'}}); await p.$disconnect();})();"
  ```

## Operational notes
- Backend depends on Postgres being reachable at the configured `DATABASE_URL`.
- If Redis is down, core persistence still works; some job-state caching may degrade.
- Ensure ports 3000 (API) and 5176 (frontend) are free before starting services.
