# Quick Reference Guide

Fast reference for common tasks and commands.

---

## 🚀 Getting Started (5 minutes)

```bash
# 1. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY

# 2. Start services
docker-compose up -d postgres redis

# 3. Setup database
npm run db:generate
npm run db:push

# 4. Start backend
npm run dev

# 5. Test it
curl http://localhost:3000/health
```

---

## 📝 Section File Renaming (CRITICAL!)

**Copy prompts and rename:**

```bash
# In backend/prompts/
foundation-prompt.ts     → foundation-prompt.ts  (no change)
section-01.ts           → exec-summary.ts
section-02.ts           → financial-snapshot.ts
section-03.ts           → company-overview.ts
section-04.ts           → segment-analysis.ts
section-05.ts           → trends.ts
section-06.ts           → peer-benchmarking.ts
section-07.ts           → sku-opportunities.ts
section-08.ts           → recent-news.ts
section-09.ts           → conversation-starters.ts
section-10.ts           → appendix.ts
```

**Update function names in each file:**

```typescript
// exec-summary.ts
export function buildExecSummaryPrompt() { ... }

// financial-snapshot.ts
export function buildFinancialSnapshotPrompt() { ... }

// Repeat for all sections!
```

---

## 🔧 Common Commands

### Backend

```bash
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm start            # Run production build
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:studio    # Open database GUI (http://localhost:5555)
```

### Docker

```bash
docker-compose up -d              # Start all services
docker-compose up -d postgres redis  # Start only DB services
docker-compose down               # Stop all services
docker-compose ps                 # Check status
docker-compose logs -f            # Follow logs
docker-compose logs -f backend    # Follow backend logs only
docker-compose restart backend    # Restart backend
```

### Frontend

```bash
npm run dev          # Start dev server
npm run build        # Build for production
```

---

## 🔌 API Endpoints

### Create Research

```bash
POST /api/research/generate

curl -X POST http://localhost:3000/api/research/generate \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Parker Hannifin",
    "geography": "Germany",
    "industry": "Industrial Manufacturing"
  }'

Response:
{
  "jobId": "clx...",
  "status": "pending",
  "message": "Research job created. Generating all 10 sections."
}
```

### Get Job Status

```bash
GET /api/research/jobs/:id

curl http://localhost:3000/api/research/jobs/clx...

Response:
{
  "id": "clx...",
  "status": "running",
  "progress": 0.45,
  "currentStage": "trends",
  "jobs": [...],
  "summary": {
    "total": 11,
    "completed": 5,
    "running": 1,
    "pending": 5
  }
}
```

### Get Research Detail

```bash
GET /api/research/:id

curl http://localhost:3000/api/research/clx...

Response:
{
  "id": "clx...",
  "status": "completed",
  "metadata": {...},
  "sections": {
    "exec_summary": {...},
    "financial_snapshot": {...},
    ...
  },
  "sourceCatalog": [...]
}
```

### List All Research

```bash
GET /api/research

curl http://localhost:3000/api/research

Response:
{
  "results": [...],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

## 🗂️ Database Schema Quick Reference

### ResearchJob

Main research tracking:
- `id` - Unique identifier
- `status` - pending | running | completed | failed
- `companyName`, `geography`, `industry`
- `foundation`, `execSummary`, `financialSnapshot`, etc. - JSON outputs
- `progress` - 0.0 to 1.0
- `currentStage` - Current stage being executed

### ResearchSubJob

Individual section tracking:
- `stage` - foundation | exec_summary | financial_snapshot | etc.
- `status` - pending | running | completed | failed
- `dependencies` - Array of required stages
- `output` - Section JSON output
- `sourcesUsed` - Array of S# references

---

## 🎯 Stage Names & Dependencies

```typescript
// No dependencies (can run immediately after foundation)
'foundation'              []
'financial_snapshot'      ['foundation']
'company_overview'        ['foundation']
'recent_news'            ['foundation']

// Simple dependency
'segment_analysis'       ['foundation']
'trends'                 ['foundation']
'sku_opportunities'      ['foundation']

// Complex dependency
'peer_benchmarking'      ['foundation', 'financial_snapshot']

// Synthesis (needs multiple sections)
'exec_summary'           ['foundation', 'financial_snapshot', 'company_overview']
'conversation_starters'  ['foundation']

// Auto-generated
'appendix'               ['foundation']
```

---

## 🌐 Environment Variables Quick Setup

### Minimal .env

```bash
ANTHROPIC_API_KEY="sk-ant-api03-your-key"
DATABASE_URL="postgresql://ssa_intelligence:ssa_intelligence_dev_password@localhost:5432/ssa_intelligence_research"
PORT="3000"
CORS_ORIGIN="http://localhost:5174"
```

### Frontend

```bash
# In vite.config.ts or .env
VITE_API_BASE_URL="http://localhost:3000/api"
```

---

## 🐛 Quick Troubleshooting

### Backend won't start

```bash
# Check .env exists
cat .env

# Check database is running
docker-compose ps

# Check logs
docker-compose logs postgres
```

### Frontend can't connect

```bash
# Check backend is running
curl http://localhost:3000/health

# Check CORS settings
grep CORS_ORIGIN backend/.env

# Check frontend API URL
grep VITE_API_BASE_URL frontend/.env
```

### Database connection failed

```bash
# Restart database
docker-compose restart postgres

# Check connection
docker-compose exec postgres psql -U ssa_intelligence -d ssa_intelligence_research -c "SELECT 1;"
```

### Validation failed

```bash
# Check prompt file names match
ls backend/prompts/

# Should see:
# exec-summary.ts (NOT section-01.ts)
# financial-snapshot.ts (NOT section-02.ts)
# etc.
```

---

## 📊 Progress Calculation

```typescript
// Total stages = 11 (foundation + 10 sections)
const progress = completedStages / 11;

// Example:
// Foundation done (1/11) = 9%
// + Financial, Overview, News (4/11) = 36%
// + Segment Analysis (5/11) = 45%
// + Trends, Benchmarking, SKU (8/11) = 73%
// + Summary, Starters (10/11) = 91%
// + Appendix (11/11) = 100%
```

---

## 🔍 Monitoring

### View database in browser

```bash
npm run db:studio
# Opens http://localhost:5555
```

### Watch logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Postgres only
docker-compose logs -f postgres
```

### Check job status in database

```sql
-- In Prisma Studio or psql
SELECT id, companyName, status, progress, currentStage 
FROM "ResearchJob" 
ORDER BY createdAt DESC 
LIMIT 10;
```

---

## 🎨 Section IDs

| UI Display | API/DB Stage ID | Prompt File |
|-----------|----------------|-------------|
| Executive Summary | exec_summary | exec-summary.ts |
| Financial Snapshot | financial_snapshot | financial-snapshot.ts |
| Company Overview | company_overview | company-overview.ts |
| Segment Analysis | segment_analysis | segment-analysis.ts |
| Market Trends | trends | trends.ts |
| Peer Benchmarking | peer_benchmarking | peer-benchmarking.ts |
| SKU Opportunities | sku_opportunities | sku-opportunities.ts |
| Recent News | recent_news | recent-news.ts |
| Conversation Starters | conversation_starters | conversation-starters.ts |
| Appendix & Sources | appendix | appendix.ts |

---

## ✅ Health Checks

```bash
# Backend
curl http://localhost:3000/health

# Database
docker-compose exec postgres pg_isready

# Redis
docker-compose exec redis redis-cli ping

# All services
docker-compose ps
```

---

## 🚀 Production Deployment

```bash
# 1. Set production env vars
export NODE_ENV=production
export ANTHROPIC_API_KEY="prod-key"
export DATABASE_URL="production-db-url"
export CORS_ORIGIN="https://yourdomain.com"

# 2. Build
npm run build

# 3. Run migrations
npm run db:push

# 4. Start
npm start

# OR use Docker
docker-compose up -d
```

---

## 📦 Project Structure

```
backend/
├── src/
│   ├── api/research/        # API routes
│   ├── services/            # Core services
│   ├── types/              # TypeScript types
│   └── index.ts            # Server entry
├── prompts/                # Renamed section files
├── prisma/                 # Database schema
├── docker-compose.yml      # Docker services
└── package.json           # Dependencies
```

---

## 💡 Tips

1. **Always check logs first** when debugging
2. **Use Prisma Studio** to inspect database state
3. **Test with curl** before testing in frontend
4. **Check function names** match after renaming files
5. **Monitor job progress** in database while testing
6. **Use development mode** for hot reload during dev
7. **Set proper CORS** to avoid frontend connection issues
8. **Keep env vars synced** between frontend and backend

---

**Save this file!** It has everything you need for daily development. 📌
