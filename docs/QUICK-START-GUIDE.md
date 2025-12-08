# Quick Start: Implementation Checklist

## 🎯 Implementation Steps

### Step 1: Rename Prompt Section Files (15 minutes)

```bash
cd /path/to/research-prompts-package/prompts/sections/

# Rename all section files
mv section-01.md exec-summary.md
mv section-01.ts exec-summary.ts

mv section-02.md financial-snapshot.md
mv section-02.ts financial-snapshot.ts

mv section-03.md company-overview.md
mv section-03.ts company-overview.ts

mv section-04.md segment-analysis.md
mv section-04.ts segment-analysis.ts

mv section-05.md trends.md
mv section-05.ts trends.ts

mv section-06.md peer-benchmarking.md
mv section-06.ts peer-benchmarking.ts

mv section-07.md sku-opportunities.md
mv section-07.ts sku-opportunities.ts

mv section-08.md recent-news.md
mv section-08.ts recent-news.ts

mv section-09.md conversation-starters.md
mv section-09.ts conversation-starters.ts

mv section-10.md appendix.md
mv section-10.ts appendix.ts
```

**Update imports in all TypeScript files:**
```typescript
// OLD
import { buildSection1Prompt } from './sections/section-01';

// NEW
import { buildExecSummaryPrompt } from './sections/exec-summary';
```

---

### Step 2: Update Dependency Map (5 minutes)

In `implementation-guide.md`, replace `SECTION_DEPENDENCIES` with:

```typescript
const SECTION_DEPENDENCIES: Record<string, string[]> = {
  'foundation': [],
  'financial_snapshot': ['foundation'],
  'company_overview': ['foundation'],
  'recent_news': ['foundation'],
  'segment_analysis': ['foundation'],
  'trends': ['foundation'],
  'peer_benchmarking': ['foundation', 'financial_snapshot'],
  'sku_opportunities': ['foundation'],
  'exec_summary': ['foundation', 'financial_snapshot', 'company_overview'],
  'conversation_starters': ['foundation'],
  'appendix': [],
};
```

---

### Step 3: Set Up Backend Structure (10 minutes)

```bash
mkdir -p backend/src/{routes,services,prompts,config,utils}
cd backend

# Copy files from outputs
cp /mnt/user-data/outputs/backend/researchOrchestrator.ts src/services/
cp /mnt/user-data/outputs/backend/claudeExecutor.ts src/services/
cp /mnt/user-data/outputs/backend/sourceResolver.ts src/utils/

# Copy entire prompts directory
cp -r /path/to/research-prompts-package/prompts/* src/prompts/
```

---

### Step 4: Install Dependencies (5 minutes)

```bash
# Backend
cd backend
npm init -y
npm install express @prisma/client @anthropic-ai/sdk zod cors dotenv
npm install -D typescript @types/express @types/node ts-node prisma

# Initialize TypeScript
npx tsc --init
```

**Update `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

### Step 5: Set Up Database (10 minutes)

```bash
cd backend
npx prisma init

# Copy schema from FINAL-IMPLEMENTATION-SUMMARY.md
# Paste into prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Push to database
npx prisma db push
```

**Create `.env`:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/intellectra"
ANTHROPIC_API_KEY="your-api-key-here"
PORT=3000
```

---

### Step 6: Create API Routes (15 minutes)

Create `backend/src/routes/research.ts`:

```typescript
import express from 'express';
import { ResearchOrchestrator } from '../services/researchOrchestrator';

const router = express.Router();

// Initialize orchestrator (use user's API key from auth)
const getOrchestrator = (req: any) => {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  return new ResearchOrchestrator(apiKey);
};

// POST /api/research/generate
router.post('/generate', async (req, res) => {
  try {
    const { companyName, geography, focusAreas } = req.body;
    
    const orchestrator = getOrchestrator(req);
    const jobId = await orchestrator.createJob({
      companyName,
      geography: geography || 'Global',
      focusAreas: focusAreas || [],
      userFiles: [],
      userId: 'default-user', // TODO: Get from auth
    });
    
    res.json({
      jobId,
      status: 'pending',
      message: 'Research job created. Generating all 10 sections.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// GET /api/research/jobs/:id
router.get('/jobs/:id', async (req, res) => {
  try {
    const orchestrator = getOrchestrator(req);
    const status = await orchestrator.getJobStatus(req.params.id);
    
    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// GET /api/research/:id
router.get('/:id', async (req, res) => {
  try {
    const orchestrator = getOrchestrator(req);
    const output = await orchestrator.getResearchOutput(req.params.id);
    
    res.json(output);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get research output' });
  }
});

// GET /api/research (list all)
router.get('/', async (req, res) => {
  try {
    // TODO: Implement list functionality
    res.json({ results: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list jobs' });
  }
});

export default router;
```

---

### Step 7: Create Express Server (10 minutes)

Create `backend/src/app.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import researchRoutes from './routes/research';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/research', researchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
```

Create `backend/src/server.ts`:

```typescript
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/research`);
});
```

**Update `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

---

### Step 8: Update Frontend Environment (2 minutes)

In React app, create `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

Your existing `researchManager.ts` already uses this!

---

### Step 9: Test the System (10 minutes)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

**Test Flow:**
1. Open http://localhost:5174
2. Click "Start New Research"
3. Enter: Company="Parker Hannifin", Geography="Germany"
4. Click "Start Analysis"
5. Watch progress bars update
6. View completed report with sources

---

## 📊 Expected Behavior

### Progress Updates
```
0%   - Job created
9%   - Foundation complete (hidden)
18%  - Financial Snapshot complete
27%  - Company Overview complete
36%  - Recent News complete
45%  - Segment Analysis complete
55%  - Trends complete
64%  - Peer Benchmarking complete
73%  - SKU Opportunities complete
82%  - Executive Summary complete
91%  - Conversation Starters complete
100% - Appendix complete
```

### UI Sections (10 visible)
- ✅ Executive Summary
- ✅ Financial Snapshot
- ✅ Company Overview
- ✅ Segment Analysis
- ✅ Market Trends
- ✅ Peer Benchmarking
- ✅ SKU Opportunities
- ✅ Recent News
- ✅ Conversation Starters
- ✅ Appendix & Sources

### Sources Display
Each section shows:
- Content with (S#) references
- Clickable source links at bottom
- Appendix consolidates all sources

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '../prompts/...'"
**Fix:** Ensure prompts are copied to `backend/src/prompts/` and imports use correct relative paths.

### Issue: "Database connection failed"
**Fix:** Check PostgreSQL is running and DATABASE_URL is correct in `.env`.

### Issue: "Anthropic API error"
**Fix:** Verify ANTHROPIC_API_KEY is set in `.env` and has sufficient credits.

### Issue: "Progress stuck at 0%"
**Fix:** Check backend logs for errors. Foundation might have failed.

### Issue: "Sources showing as '#'"
**Fix:** Foundation didn't establish source catalog. Check Foundation execution logs.

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Backend starts without errors
2. ✅ Frontend connects to API
3. ✅ Job creation returns jobId
4. ✅ Progress updates every 2 seconds
5. ✅ Foundation completes (~30-60 seconds)
6. ✅ Sections generate sequentially
7. ✅ Sources show as clickable links
8. ✅ Report displays with all 10 sections

---

## 🚀 Next Steps

Once basic system works:
1. Add authentication (user-specific API keys)
2. Implement Redis caching
3. Add Docker deployment
4. Set up error monitoring
5. Add retry mechanisms
6. Implement section regeneration
7. Add export to PDF/DOCX

---

## 📚 Key Files Reference

**Backend:**
- `src/services/researchOrchestrator.ts` - Job management
- `src/services/claudeExecutor.ts` - Claude API calls
- `src/utils/sourceResolver.ts` - Source resolution
- `src/routes/research.ts` - API endpoints
- `prisma/schema.prisma` - Database schema

**Frontend:**
- `src/services/researchManager.ts` - API client
- `src/pages/NewResearch.tsx` - Job creation UI
- `src/pages/ResearchDetail.tsx` - Report display
- `src/types.ts` - TypeScript types

**Prompts:**
- `prompts/foundation-prompt.ts` - Phase 0
- `prompts/sections/exec-summary.ts` - Section 1
- `prompts/sections/financial-snapshot.ts` - Section 2
- ... (all 10 sections)

---

Total Setup Time: **~90 minutes**

You're ready to generate institutional-grade company intelligence! 🎉
