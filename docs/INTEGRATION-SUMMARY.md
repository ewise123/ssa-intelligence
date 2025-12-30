# Integration Summary: Research Prompts → SSA Intelligence App

Complete guide showing how the modular research prompt system integrates with your SSA Intelligence UI/UX app.

---

## 🎯 What We Built

A **complete backend API** that connects your React frontend to the Claude-powered research generation system, with:

✅ **11-stage execution** (Foundation + 10 sections)  
✅ **Dependency-aware orchestration** (parallel where possible)  
✅ **Real-time progress tracking** (matches your UI)  
✅ **Source resolution** (S# → clickable URLs)  
✅ **PostgreSQL + Prisma** persistence  
✅ **Redis** caching (optional)  
✅ **Docker** containerization  
✅ **TypeScript** end-to-end type safety  

---

## 📁 File Summary

### Created Files (20 total)

**Backend Core (7 files):**
- `prisma/schema.prisma` - Database schema with new stage naming
- `docker-compose.yml` - PostgreSQL + Redis services
- `Dockerfile` - Container image for backend
- `.env.example` - Environment variables template
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore patterns

**Services (3 files):**
- `src/services/claude-client.ts` - Anthropic API wrapper
- `src/services/orchestrator.ts` - Job orchestration engine
- `src/services/source-resolver.ts` - S# → URL conversion

**API Routes (5 files):**
- `src/api/research/generate.ts` - POST /api/research/generate
- `src/api/research/status.ts` - GET /api/research/jobs/:id
- `src/api/research/detail.ts` - GET /api/research/:id
- `src/api/research/list.ts` - GET /api/research
- `src/index.ts` - Express server setup

**Types (1 file):**
- `src/types/prompts.ts` - Shared TypeScript types

**Documentation (4 files):**
- `SETUP.md` - Complete setup guide
- `README.md` - (your existing app README)
- Integration summary (this file)
- Changes summary (v1.1 updates)

---

## 🔧 Key Architectural Decisions

### 1. Section Renaming (CRITICAL!)

**Decision:** Rename all section files to match app's naming convention

**Why:** Eliminates mapping layer, makes code consistent across frontend/backend/prompts

**What to do:**
```bash
# In backend/prompts/ folder
section-01.ts → exec-summary.ts
section-02.ts → financial-snapshot.ts
section-03.ts → company-overview.ts
section-04.ts → segment-analysis.ts
section-05.ts → trends.ts
section-06.ts → peer-benchmarking.ts
section-07.ts → sku-opportunities.ts
section-08.ts → recent-news.ts
section-09.ts → conversation-starters.ts
section-10.ts → appendix.ts
```

**AND update function names in each file:**
```typescript
// exec-summary.ts
export function buildExecSummaryPrompt() { ... }

// financial-snapshot.ts
export function buildFinancialSnapshotPrompt() { ... }

// etc.
```

### 2. Foundation is Invisible to Users

**Decision:** Foundation runs first but is NOT shown in UI sidebar

**Why:** 
- Foundation establishes source catalog (S1, S2, S3...)
- Provides context for all other sections
- Not user-facing content - just research infrastructure

**In Practice:**
- Users see 10 sections in sidebar (not 11)
- Progress bar shows 11 stages internally (foundation + 10)
- Foundation data used by all sections but not displayed

### 3. Source Resolution Strategy

**Decision:** Backend resolves S# references to full URLs before sending to frontend

**How it works:**
```
Claude generates:
  "Revenue grew 15% (S1, S3)"

Backend resolves:
  S1 → { title: "10-K Annual Report", url: "https://..." }
  S3 → { title: "Q3 Earnings Transcript", url: "https://..." }

Frontend displays:
  "Revenue grew 15%"
  
  Sources:
  • 10-K Annual Report [link]
  • Q3 Earnings Transcript [link]
```

**Implementation:**
- `SourceCatalogManager` class handles resolution
- Each section output includes resolved sources
- Appendix shows complete catalog

### 4. All Sections Always Generate

**Decision:** v1.1 removed section selection - all 10 generate every time

**Why:**
- Consistent user experience
- Complete reports always
- Simpler code (no conditional logic)
- Predictable progress (always 11 stages)

**Impact:**
- Users can't pick sections
- Database doesn't store `selectedSections`
- Job creation always spawns 11 sub-jobs

---

## 🔄 Data Flow

### Request Flow

```
1. User submits form in React app
   ↓
2. researchManager.createJob() calls backend API
   POST /api/research/generate
   {
     "companyName": "Parker Hannifin",
     "geography": "Germany"
   }
   ↓
3. Backend creates ResearchJob + 11 ResearchSubJobs
   ↓
4. Orchestrator starts execution
   ↓
5. Frontend polls for updates every 2 seconds
   GET /api/research/jobs/:id
```

### Execution Flow

```
Foundation (Stage 1/11)
  ↓ Establishes:
  • Company basics
  • Geography metrics
  • Source catalog (S1-S25)
  • FX rates
  • Industry averages
  ↓
Parallel Execution (Stages 2-4/11)
  ├─> Financial Snapshot
  ├─> Company Overview
  └─> Recent News
  ↓
Segment Analysis (Stage 5/11)
  ↓
Dependent Sections (Stages 6-8/11)
  ├─> Trends
  ├─> Peer Benchmarking (requires Financial Snapshot)
  └─> SKU Opportunities
  ↓
Synthesis (Stages 9-10/11)
  ├─> Executive Summary (requires Financial + Overview)
  └─> Conversation Starters
  ↓
Appendix (Stage 11/11 - auto-generated)
  ↓
Complete! Redirect to /research/:id
```

### Response Flow

```
GET /api/research/:id
  ↓
Backend queries database
  ↓
Resolves S# references to URLs using SourceCatalog
  ↓
Returns JSON:
{
  id, status, metadata,
  sections: {
    exec_summary: { ...content, sources: [{id, title, url}] },
    financial_snapshot: { ...content, sources: [...] },
    ...
  },
  sourceCatalog: [all sources]
}
  ↓
Frontend renders in ResearchDetail component
```

---

## 🎨 UI/UX Integration Points

### 1. Live Progress (NewResearch.tsx)

**Left Panel:** Shows 10 sections with status icons
```typescript
SECTIONS_CONFIG.map(section => {
  const status = job.sections[section.id]?.status;
  // Show: pending (circle), running (spinner), completed (checkmark)
})
```

**Right Panel:** Terminal-style activity log
```typescript
{job.currentAction && (
  <div className="animate-pulse">
    &gt; {job.currentAction}
  </div>
)}
```

### 2. Section Navigation (ResearchDetail.tsx)

**Sidebar:** Click to switch between sections
```typescript
<button onClick={() => setActiveSection('financial_snapshot')}>
  Financial Snapshot
</button>
```

**Content Area:** Shows section content with sources at bottom
```typescript
<MarkdownText content={currentSectionData?.content} />

// Footer
{currentSectionData?.sources.map(source => (
  <a href={source.url}>{source.title}</a>
))}
```

### 3. Status Tracking (Home.tsx)

**Active Jobs:** Show progress bar
```typescript
<div className="bg-blue-500 h-full" style={{ width: `${job.progress}%` }} />
```

**Completed Jobs:** Table with view button
```typescript
<button onClick={() => navigate(`/research/${job.id}`)}>
  View Report
</button>
```

---

## 🔐 Environment Variables

### Backend (.env)

```bash
# Required
ANTHROPIC_API_KEY="sk-ant-api03-..."
DATABASE_URL="postgresql://..."

# Server
PORT="3000"
CORS_ORIGIN="http://localhost:5174"
NODE_ENV="development"

# Optional
REDIS_URL="redis://..."
MAX_TOKENS="16000"
CLAUDE_MODEL="claude-sonnet-4-5"
```

### Frontend (.env or vite.config.ts)

```bash
VITE_API_BASE_URL="http://localhost:3000/api"
```

---

## 🚀 Deployment Checklist

### Before Deploying

- [ ] Rename all section files (section-01.ts → exec-summary.ts)
- [ ] Update function names in each section file
- [ ] Copy prompts package to backend/prompts/
- [ ] Set ANTHROPIC_API_KEY in production
- [ ] Update DATABASE_URL for production database
- [ ] Update CORS_ORIGIN for production frontend
- [ ] Set NODE_ENV="production"
- [ ] Run database migrations: `npm run db:push`
- [ ] Build backend: `npm run build`
- [ ] Test API endpoints with curl
- [ ] Update frontend VITE_API_BASE_URL

### Testing Checklist

- [ ] Health check: `GET /health`
- [ ] Create job: `POST /api/research/generate`
- [ ] Get status: `GET /api/research/jobs/:id`
- [ ] Get detail: `GET /api/research/:id`
- [ ] List research: `GET /api/research`
- [ ] Frontend connects to backend
- [ ] Progress updates in real-time
- [ ] Sources display with URLs
- [ ] All 10 sections generate
- [ ] Markdown renders correctly

---

## 🎓 Key Concepts

### Foundation vs Sections

**Foundation:**
- Runs first (Phase 0)
- NOT shown in UI
- Establishes source catalog
- Provides context for all sections
- Single comprehensive research phase

**Sections:**
- 10 user-facing sections
- Shown in UI sidebar
- Each has own prompt
- Can run in parallel where dependencies allow
- Reference foundation data

### Source Catalog (S# System)

**How it works:**
1. Foundation establishes S1, S2, S3... (10 source categories)
2. Each source has: ID, citation, URL, type, date
3. Sections reference sources by ID in content: "(S1, S3)"
4. Backend resolves IDs to full source details
5. Frontend displays clickable links

**Example:**
```
Foundation finds:
  S1 = { citation: "10-K Annual Report 2023", url: "https://..." }
  S2 = { citation: "Q3 Earnings Call", url: "https://..." }

Section 2 content:
  "Revenue grew 15% YoY (S1) driven by strong Q3 performance (S2)"

Frontend displays:
  "Revenue grew 15% YoY driven by strong Q3 performance"
  
  Sources:
  • 10-K Annual Report 2023 [↗]
  • Q3 Earnings Call [↗]
```

### Dependency Resolution

**Automatic phase progression:**
```typescript
getNextRunnableStages() {
  // Returns stages where all dependencies are completed
  // and not already running
}

executeNextPhase() {
  // Run all runnable stages in parallel
  // Then check for next phase
}
```

**Example:**
- Foundation completes
- System sees: Financial, Overview, News have dependencies met
- Runs all 3 in parallel
- When all 3 complete, checks next phase
- Segment Analysis now runnable
- Continues until all 11 stages done

---

## 📊 Progress Tracking

### Progress Calculation

```typescript
const totalStages = 11; // Foundation + 10 sections
const completed = completedSubJobs.length;
const progress = completed / totalStages; // 0.0 to 1.0
```

### Status States

**Job Status:**
- `pending` - Created, not started
- `running` - Actively generating
- `completed` - All sections done
- `failed` - Unrecoverable error

**Section Status:**
- `pending` - Waiting for dependencies
- `running` - Claude is generating
- `completed` - Successfully generated
- `failed` - Max retries exceeded

---

## 🆘 Common Issues & Solutions

### Issue: "Module not found: prompts/exec-summary"

**Cause:** Section files not renamed

**Solution:** Rename all section files as specified in section 1

### Issue: "Function buildExecSummaryPrompt is not exported"

**Cause:** Function names not updated in renamed files

**Solution:** Update function names in each file

### Issue: Sources show as "#" links

**Cause:** Foundation didn't include URLs in source catalog

**Solution:** Verify foundation prompt is gathering full source details with URLs

### Issue: Frontend can't connect to backend

**Cause:** CORS or API URL misconfiguration

**Solution:**
```bash
# Backend
CORS_ORIGIN="http://localhost:5174"

# Frontend
VITE_API_BASE_URL="http://localhost:3000/api"
```

---

## 🎯 Next Steps

1. **Setup Backend**
   - Follow SETUP.md
   - Rename section files
   - Update function names
   - Set environment variables

2. **Test Locally**
   - Start Docker services
   - Start backend: `npm run dev`
   - Start frontend: `npm run dev`
   - Create test research job

3. **Verify Integration**
   - Check progress updates
   - Verify sources display
   - Test section navigation
   - Confirm all 10 sections generate

4. **Deploy to Production**
   - Follow deployment checklist
   - Use managed PostgreSQL
   - Set production env vars
   - Deploy frontend + backend

---

## 📚 Additional Resources

- **Research Prompts Package:** Complete prompt system with all sections
- **SETUP.md:** Step-by-step setup instructions
- **CHANGES-v1.1.md:** Details on all sections generating
- **implementation-guide.md:** Original system architecture

---

## ✅ Success Criteria

You know everything is working when:

1. ✅ Backend starts without errors
2. ✅ Frontend connects to backend
3. ✅ Create research job succeeds
4. ✅ Progress updates in real-time (UI shows stages completing)
5. ✅ All 10 sections generate successfully
6. ✅ Sources display with clickable URLs
7. ✅ Markdown renders correctly
8. ✅ Navigation between sections works
9. ✅ Completed research shows in library table
10. ✅ Can view full report with all sections

---

**Congratulations!** You now have a complete, production-ready research generation system integrated with your SSA Intelligence UI. 🎉
