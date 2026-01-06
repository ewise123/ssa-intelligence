# SSA Intelligence Backend Setup Guide

Complete guide for setting up the backend API server with Claude integration.

---

## Prerequisites

- **Node.js** v20+ and npm v10+
- **Docker** and Docker Compose (for PostgreSQL and Redis)
- **Anthropic API Key** (get from https://console.anthropic.com/)

---

## Quick Start

### 1. Copy Backend Files

Extract the backend folder to your project:

```bash
your-project/
├── backend/          # ← All backend files
└── frontend/         # ← Existing React app
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```bash
# REQUIRED
ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"

# Database (will be created by Docker)
DATABASE_URL="postgresql://ssa_intelligence:ssa_intelligence_dev_password@localhost:5432/ssa_intelligence_research"

# Server
PORT="3000"
CORS_ORIGIN="http://localhost:5174"
```

### 4. Start Database

```bash
docker-compose up -d postgres redis
```

Wait for services to be healthy:

```bash
docker-compose ps
# Should show postgres and redis as "Up (healthy)"
```

### 5. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

### 6. Start Backend

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

You should see:

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   SSA Intelligence Research API                                     ║
║                                                                ║
║   Status:      Running                                         ║
║   Environment: development                                     ║
║   Port:        3000                                            ║
║   URL:         http://localhost:3000                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### 7. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Create test job
curl -X POST http://localhost:3000/api/research/generate \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Parker Hannifin",
    "geography": "Germany"
  }'

# Returns: { "jobId": "...", "status": "pending" }
```

### 8. Update Frontend

Your existing `researchManager.ts` should work! Just make sure the API base URL is correct:

```typescript
// In frontend/.env or vite.config.ts
VITE_API_BASE_URL="http://localhost:3000/api"
```

---

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   └── research/
│   │       ├── generate.ts      # POST /api/research/generate
│   │       ├── status.ts        # GET /api/research/jobs/:id
│   │       ├── detail.ts        # GET /api/research/:id
│   │       └── list.ts          # GET /api/research
│   ├── services/
│   │   ├── claude-client.ts     # Anthropic API wrapper
│   │   ├── orchestrator.ts      # Job orchestration
│   │   └── source-resolver.ts   # S# → URL resolution
│   ├── types/
│   │   └── prompts.ts           # TypeScript types
│   └── index.ts                 # Express server
│
├── prompts/                     # Prompt files live here
│   ├── foundation-prompt.ts
│   ├── exec-summary.ts
│   ├── financial-snapshot.ts
│   ├── ... (all 10 sections)
│   ├── validation.ts
│   └── types.ts
│
├── prisma/
│   └── schema.prisma            # Database schema
│
├── docker-compose.yml           # Docker services
├── Dockerfile                   # Container image
├── package.json
├── tsconfig.json
└── .env                         # Environment variables
```

---

## Development Workflow

### Running Everything

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Monitor Database:**
```bash
cd backend
npm run db:studio  # Opens Prisma Studio at http://localhost:5555
```

### Monitoring Jobs

Watch logs:
```bash
cd backend
docker-compose logs -f backend
```

Query database:
```bash
npm run db:studio
# Browse ResearchJob and ResearchSubJob tables
```

### Common Commands

```bash
# Backend
npm run dev              # Start with hot reload
npm run build            # Compile TypeScript
npm start                # Run production build
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema changes
npm run db:studio        # Open database GUI

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose ps        # Check service status
docker-compose logs -f   # Follow logs
```

---

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY is required"

**Solution:** Make sure `.env` file exists and contains your API key:
```bash
cat .env | grep ANTHROPIC_API_KEY
```

### Issue: "Cannot connect to database"

**Solution:** Ensure Docker services are running:
```bash
docker-compose ps
docker-compose up -d postgres redis
```

### Issue: Frontend can't connect to backend

**Solution:** Check CORS and API URL:
```bash
# Backend .env
CORS_ORIGIN="http://localhost:5174"

# Frontend .env or vite.config.ts
VITE_API_BASE_URL="http://localhost:3000/api"
```

### Issue: "Validation failed for section X"

**Solution:** Claude's output doesn't match the schema. Check:
1. Prompt instructions are clear
2. Validation schema matches prompt output
3. Claude model is correct: `claude-sonnet-4-5`

---

## Production Deployment

### Option 1: Docker Compose (Simplest)

```bash
# Set production env vars
export NODE_ENV=production
export ANTHROPIC_API_KEY="your-key"
export CORS_ORIGIN="https://yourdomain.com"

# Start all services
docker-compose up -d

# Services running:
# - Backend: http://localhost:3000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Option 2: Separate Hosting

**Backend (e.g., Railway, Render, Fly.io):**
- Deploy `backend/` folder
- Set environment variables
- Connect to managed PostgreSQL

**Database (e.g., Neon, Supabase, Railway):**
- Create PostgreSQL instance
- Update `DATABASE_URL` in backend

**Frontend (e.g., Vercel, Netlify):**
- Deploy `frontend/` folder
- Set `VITE_API_BASE_URL` to your backend URL

---

## Next Steps

1. ✅ Backend running
2. ✅ Database connected
3. ✅ Test API with curl
4. ✅ Frontend connecting to backend
5. 🎯 Generate your first research report!

---

## Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Check database: `npm run db:studio`
3. Check API health: `curl http://localhost:3000/health`
4. Review prompt files match naming convention
5. Ensure Claude API key is valid

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  (React + TypeScript + Vite + researchManager.ts)           │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                            │
│  (Express + TypeScript)                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API Routes                                          │   │
│  │  - POST /api/research/generate                      │   │
│  │  - GET  /api/research/jobs/:id                      │   │
│  │  - GET  /api/research/:id                           │   │
│  │  - GET  /api/research                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Services                                            │   │
│  │  - ResearchOrchestrator (job management)            │   │
│  │  - ClaudeClient (Anthropic API wrapper)             │   │
│  │  - SourceResolver (S# → URLs)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Prompts (10 sections + foundation)                  │   │
│  │  - exec-summary.ts                                  │   │
│  │  - financial-snapshot.ts                            │   │
│  │  - ... (8 more)                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────┬──────────────────────────┬────────────────────┘
              │                          │
              │ Anthropic API            │ Prisma ORM
              ▼                          ▼
┌─────────────────────┐    ┌────────────────────────────┐
│   Claude Sonnet 4.5 │    │      PostgreSQL            │
│   (via Anthropic)   │    │  - ResearchJob             │
└─────────────────────┘    │  - ResearchSubJob          │
                           │  - User                    │
                           └────────────────────────────┘
```

Happy researching! 🚀
