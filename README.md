# SSA Intelligence Research System - Complete Integration Package

## Current Repository Layout (monorepo)
- `backend/` — API, orchestration, Prisma, env lives in `backend/.env`.
- `frontend/` — Vite/React client, env lives in `frontend/.env`.
- `research-prompts-package/` — prompt pack reference.
- `research-guides/` — section guide .docx/.js examples.
- `docs/` — additional implementation/integration summaries.
- `artifacts/` — saved run logs/json from earlier debugging.
- Root docs: `START-HERE.md`, `QUICK-REFERENCE.md`, `README.md`.

**A production-ready backend that connects your React frontend to Claude-powered company intelligence research generation.**

---

## 📦 What's Included

This package contains everything you need to run the modular research generation system with your SSA Intelligence UI:

### Backend Implementation
- ✅ Express API server with TypeScript
- ✅ Job orchestration with dependency management
- ✅ Claude Sonnet 4.5 integration
- ✅ PostgreSQL + Prisma database
- ✅ Docker Compose setup
- ✅ Source resolution (S# → URLs)
- ✅ Real-time progress tracking

### Documentation
- ✅ Complete setup guide
- ✅ Integration summary
- ✅ Quick reference cheat sheet
- ✅ API documentation
- ✅ Troubleshooting guide

### Configuration
- ✅ Database schema (Prisma)
- ✅ Docker Compose with Postgres + Redis
- ✅ Environment variables template
- ✅ TypeScript configuration
- ✅ Package.json with dependencies

---

## 🎯 Quick Start (10 Minutes)

### 1. Extract Files

```bash
# Extract backend/ folder to your project
your-project/
├── backend/          # ← New folder from this package
└── frontend/         # ← Your existing React app
```

### 2. Install & Configure

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Start Services

```bash
docker-compose up -d postgres redis
npm run db:generate
npm run db:push
npm run dev
```

### 4. Test It!

```bash
# Health check
curl http://localhost:3000/health

# Create test research
curl -X POST http://localhost:3000/api/research/generate \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Parker Hannifin",
    "geography": "Germany"
  }'
```

**Your frontend already has the code to connect!** The existing `researchManager.ts` will work with these endpoints.

---

## 📚 Documentation Files

**Read these in order:**

1. **SETUP.md** - Complete step-by-step setup instructions
2. **INTEGRATION-SUMMARY.md** - How everything connects
3. **QUICK-REFERENCE.md** - Cheat sheet for daily use
4. **CHANGES-v1.1.md** - What changed from original prompts

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                         │
│  (Your SSA Intelligence UI - Already Built!)                     │
│                                                             │
│  Components:                                                │
│  - Home.tsx (Dashboard)                                     │
│  - NewResearch.tsx (Create job)                             │
│  - ResearchDetail.tsx (View report)                         │
│  - researchManager.ts (API client) ✅                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP/REST API
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Backend API (New!)                       │
│  Express + TypeScript                                       │
│                                                             │
│  Routes:                                                    │
│  - POST /api/research/generate                              │
│  - GET  /api/research/jobs/:id                              │
│  - GET  /api/research/:id                                   │
│  - GET  /api/research                                       │
│                                                             │
│  Services:                                                  │
│  - ResearchOrchestrator (job management)                    │
│  - ClaudeClient (Anthropic API)                             │
│  - SourceResolver (S# → URLs)                               │
│                                                             │
│  Prompts:                                                   │
│  - exec-summary.ts                                          │
│  - financial-snapshot.ts                                    │
│  - ... (10 sections total)                                  │
└─────────────────┬────────────┬──────────────────────────────┘
                  │            │
                  │            │
         ┌────────▼────┐  ┌───▼─────────┐
         │  Claude AI  │  │ PostgreSQL  │
         │  Sonnet 4.5 │  │   + Redis   │
         └─────────────┘  └─────────────┘
```

---

## 🔧 What You Need

### Required

- **Node.js** v20+ and npm v10+
- **Docker** and Docker Compose
- **Anthropic API Key** - Get from https://console.anthropic.com/

### Optional

- **Redis** - For caching (included in Docker Compose)
- **Prisma Studio** - Database GUI (included: `npm run db:studio`)

---

## ⚙️ Key Features

### 1. Automatic Section Orchestration

The system automatically:
- Runs Foundation first (Phase 0)
- Executes sections in parallel where possible
- Manages dependencies (e.g., Peer Benchmarking needs Financial Snapshot)
- Retries failed sections up to 3 times
- Updates progress in real-time

### 2. Source Resolution

```
Claude generates:
  "Revenue grew 15% (S1, S3)"

Backend resolves:
  S1 → { title: "10-K Report", url: "https://..." }
  S3 → { title: "Q3 Transcript", url: "https://..." }

Frontend displays:
  Clickable links: "10-K Report [↗]"
```

### 3. Real-Time Progress

```typescript
// Frontend polls every 2 seconds
GET /api/research/jobs/:id

Response:
{
  progress: 0.45,  // 45% complete
  currentStage: "trends",
  summary: {
    total: 11,
    completed: 5,
    running: 1,
    pending: 5
  }
}
```

### 4. Type-Safe Throughout

```typescript
// Zod validation on Claude outputs
const output = claudeClient.validateAndParse(
  response,
  financialSnapshotOutputSchema
);

// TypeScript interfaces everywhere
const job: ResearchJob = { ... }
```

---

## 🎨 Frontend Integration

Your `researchManager.ts` already has the code! It just works with these endpoints:

```typescript
// Create job
const { jobId } = await fetch('/api/research/generate', {
  method: 'POST',
  body: JSON.stringify({ companyName, geography })
}).then(r => r.json());

// Poll for progress
const status = await fetch(`/api/research/jobs/${jobId}`)
  .then(r => r.json());

// Get complete research
const research = await fetch(`/api/research/${jobId}`)
  .then(r => r.json());
```

**No changes needed to your frontend!** Just set the API URL:

```bash
# In frontend/.env or vite.config.ts
VITE_API_BASE_URL="http://localhost:3000/api"
```

---

## 📊 Research Generation Flow

```
1. User submits form → POST /api/research/generate
   ↓
2. Backend creates ResearchJob + 11 ResearchSubJobs
   ↓
3. Orchestrator starts execution:
   
   Foundation (1/11) - 2-3 minutes
   ↓ Establishes source catalog (S1-S25)
   
   Parallel Phase (2-4/11) - 3-4 minutes
   ├─ Financial Snapshot
   ├─ Company Overview
   └─ Recent News
   ↓
   
   Segment Analysis (5/11) - 2-3 minutes
   ↓
   
   Dependent Sections (6-8/11) - 4-5 minutes
   ├─ Trends
   ├─ Peer Benchmarking
   └─ SKU Opportunities
   ↓
   
   Synthesis (9-10/11) - 2-3 minutes
   ├─ Executive Summary
   └─ Conversation Starters
   ↓
   
   Appendix (11/11) - Auto-generated (instant)
   ↓
4. Complete! Redirect to /research/:id
   
Total time: ~15-20 minutes
```

---

## 🚨 Critical Steps

### ⚠️ MUST DO: Set API Key

```bash
# In backend/.env
ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
```

### ⚠️ MUST DO: Configure CORS

```bash
# Backend
CORS_ORIGIN="http://localhost:5174"

# Frontend
VITE_API_BASE_URL="http://localhost:3000/api"
```

---

## 📂 File Structure

```
backend/
├── src/
│   ├── api/
│   │   └── research/
│   │       ├── generate.ts      # Create job
│   │       ├── status.ts        # Get progress
│   │       ├── detail.ts        # Get complete research
│   │       └── list.ts          # List all research
│   ├── services/
│   │   ├── claude-client.ts     # Anthropic API
│   │   ├── orchestrator.ts      # Job management
│   │   └── source-resolver.ts   # S# → URLs
│   ├── types/
│   │   └── prompts.ts           # TypeScript types
│   └── index.ts                 # Express server
│
├── prompts/                     # Prompt files live here
│   ├── foundation-prompt.ts
│   ├── exec-summary.ts         
│   ├── financial-snapshot.ts   
│   └── ... (all 10 sections)
│
├── prisma/
│   └── schema.prisma            # Database schema
│
├── docker-compose.yml           # Postgres + Redis
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
│
├── SETUP.md                     # Setup instructions
├── INTEGRATION-SUMMARY.md       # Integration guide
├── QUICK-REFERENCE.md           # Cheat sheet
└── README.md                    # This file
```

---

## 🧪 Testing

### Test Backend

```bash
# Health check
curl http://localhost:3000/health

# Create test job
curl -X POST http://localhost:3000/api/research/generate \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Test Corp", "geography": "Global"}'

# Get job status (use jobId from above)
curl http://localhost:3000/api/research/jobs/clx...
```

### Test Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:5174
# Click "New Research"
# Fill form and submit
# Watch progress in real-time!
```

---

## 🎓 Learning Resources

**New to the project?** Read in this order:

1. This README (overview)
2. SETUP.md (detailed setup)
3. INTEGRATION-SUMMARY.md (how it all connects)
4. QUICK-REFERENCE.md (daily use)

**Want to understand the prompts?** See the prompt files in `backend/prompts/`.


---

## 💡 Pro Tips

1. **Use Prisma Studio** to watch jobs in real-time: `npm run db:studio`
2. **Check logs** when debugging: `docker-compose logs -f backend`
3. **Test with curl** before testing in UI
4. **Use dev mode** for hot reload: `npm run dev`

---

## 🆘 Getting Help

### Common Issues

**"ANTHROPIC_API_KEY is required"**
→ Add your API key to `.env` file

**"Cannot connect to database"**
→ Run `docker-compose up -d postgres redis`

**Frontend can't connect**
→ Check CORS_ORIGIN and VITE_API_BASE_URL

**See QUICK-REFERENCE.md for more troubleshooting!**

---

## 🚀 Deployment

### Development

```bash
docker-compose up -d  # Start everything
npm run dev           # Backend with hot reload
# In another terminal
cd frontend && npm run dev
```

### Production

See SETUP.md for production deployment guide including:
- Docker deployment
- Managed database setup
- Environment configuration
- Frontend deployment

---

## ✅ Success Checklist

You know it's working when:

- [ ] Backend starts without errors
- [ ] `curl http://localhost:3000/health` returns OK
- [ ] Can create test job via curl
- [ ] Frontend connects to backend
- [ ] Creating research shows progress
- [ ] All 10 sections generate
- [ ] Sources display as clickable links
- [ ] Can navigate between sections
- [ ] Completed research shows in library

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Ready to Start?

1. Extract the `backend/` folder
2. Follow `SETUP.md`
3. Run `npm run dev`
4. Create your first research report!

**Questions?** Check INTEGRATION-SUMMARY.md or QUICK-REFERENCE.md

---

**Happy researching!** 🚀
