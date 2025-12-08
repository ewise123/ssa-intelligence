# Integration Guide: React App + Claude Research System

## Overview

This guide integrates the modular Claude research prompt system with the Intellectra React frontend, using renamed sections for consistency and maintaining the foundation phase for research context.

---

## Architecture Summary

### Flow
```
User submits form → Backend API → Foundation (hidden) → 10 Sections (shown in UI) → Complete
```

### Section Naming (UNIFIED)
```typescript
// Backend stages (in execution order)
'foundation'              // Phase 0 - Hidden from UI, runs first
'exec_summary'            // Shown as "Executive Summary"
'financial_snapshot'      // Shown as "Financial Snapshot"
'company_overview'        // Shown as "Company Overview"
'segment_analysis'        // Shown as "Segment Analysis"
'trends'                  // Shown as "Market Trends"
'peer_benchmarking'       // Shown as "Peer Benchmarking"
'sku_opportunities'       // Shown as "SKU Opportunities"
'recent_news'             // Shown as "Recent News"
'conversation_starters'   // Shown as "Conversation Starters"
'appendix'                // Shown as "Appendix & Sources"
```

### Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** Node.js + Express + Prisma + PostgreSQL + Redis
- **AI:** Anthropic Claude Sonnet 4.5 via streaming API
- **Deployment:** Docker containers

---

## File Changes Required

### 1. Update Prompt System Section Names

All section files need to be renamed to use semantic IDs instead of numbers:

**Rename these files:**
```bash
# In /prompts/sections/
section-01.md → exec-summary.md
section-01.ts → exec-summary.ts

section-02.md → financial-snapshot.md
section-02.ts → financial-snapshot.ts

section-03.md → company-overview.md
section-03.ts → company-overview.ts

section-04.md → segment-analysis.md
section-04.ts → segment-analysis.ts

section-05.md → trends.md
section-05.ts → trends.ts

section-06.md → peer-benchmarking.md
section-06.ts → peer-benchmarking.ts

section-07.md → sku-opportunities.md
section-07.ts → sku-opportunities.ts

section-08.md → recent-news.md
section-08.ts → recent-news.ts

section-09.md → conversation-starters.md
section-09.ts → conversation-starters.ts

section-10.md → appendix.md
section-10.ts → appendix.ts
```

**Update all TypeScript imports** to use new names.

**Update dependency map** in implementation-guide.md:
```typescript
const SECTION_DEPENDENCIES: Record<string, string[]> = {
  'foundation': [],
  
  // Core sections
  'financial_snapshot': ['foundation'],
  'company_overview': ['foundation'],
  'recent_news': ['foundation'],
  
  // Complex section
  'segment_analysis': ['foundation'],
  
  // Dependent sections
  'trends': ['foundation'],
  'peer_benchmarking': ['foundation', 'financial_snapshot'], // REQUIRED
  'sku_opportunities': ['foundation'],
  
  // Synthesis sections
  'exec_summary': ['foundation', 'financial_snapshot', 'company_overview'], // MINIMUM
  'conversation_starters': ['foundation'],
  
  // Appendix
  'appendix': [], // All sections
};
```

---

## Database Schema (Prisma)

### Updated Schema with Semantic Names

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model ResearchJob {
  id                String    @id @default(cuid())
  status            String    // 'pending' | 'running' | 'completed' | 'failed'
  currentStage      String?   // 'foundation' | 'exec_summary' | etc.
  progress          Float     @default(0)
  
  // Research inputs
  companyName       String
  geography         String
  industry          String?
  focusAreas        String[]
  userFiles         String[]
  
  // Research outputs (JSON fields)
  foundation            Json?    // FoundationOutput (HIDDEN FROM UI)
  executiveSummary      Json?    // Section: exec_summary
  financialSnapshot     Json?    // Section: financial_snapshot
  companyOverview       Json?    // Section: company_overview
  segmentAnalysis       Json?    // Section: segment_analysis
  trends                Json?    // Section: trends
  peerBenchmarking      Json?    // Section: peer_benchmarking
  skuOpportunities      Json?    // Section: sku_opportunities
  recentNews            Json?    // Section: recent_news
  conversationStarters  Json?    // Section: conversation_starters
  appendix              Json?    // Section: appendix
  
  // Metadata
  overallConfidence String
  tags              String[]
  
  // Relations
  jobs              ResearchSubJob[]
  user              User      @relation(fields: [userId], references: [id])
  userId            String
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([userId, createdAt])
  @@index([status])
}

model ResearchSubJob {
  id                String    @id @default(cuid())
  researchId        String
  research          ResearchJob  @relation(fields: [researchId], references: [id], onDelete: Cascade)
  
  stage             String    // 'foundation' | 'exec_summary' | 'financial_snapshot' | etc.
  status            String    // 'pending' | 'running' | 'completed' | 'failed'
  dependencies      String[]  // Array of stage names this depends on
  
  // Execution
  attempts          Int       @default(0)
  maxAttempts       Int       @default(3)
  lastError         String?
  
  // Output
  output            Json?     // Section-specific output
  confidence        String?   // 'HIGH' | 'MEDIUM' | 'LOW'
  sourcesUsed       String[]  // ['S1', 'S2', 'S3']
  
  // Timing
  startedAt         DateTime?
  completedAt       DateTime?
  duration          Int?      // Milliseconds
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([researchId, stage])
  @@index([status])
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  apiKey            String?   // Encrypted Anthropic API key
  research          ResearchJob[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

### Migration Commands
```bash
npx prisma generate
npx prisma db push
```

---

## Backend API Structure

### Directory Structure
```
backend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   ├── database.ts           # Prisma client
│   │   └── redis.ts              # Redis client
│   ├── routes/
│   │   └── research.ts           # Research API endpoints
│   ├── services/
│   │   ├── researchOrchestrator.ts  # Job orchestration
│   │   ├── claudeExecutor.ts        # Claude API calls
│   │   ├── sourceCatalog.ts         # Source management
│   │   └── progressTracker.ts       # Progress updates
│   ├── prompts/
│   │   ├── foundation-prompt.ts
│   │   ├── sections/
│   │   │   ├── exec-summary.ts
│   │   │   ├── financial-snapshot.ts
│   │   │   └── ... (all 10 sections)
│   │   ├── shared-types.ts
│   │   ├── types.ts
│   │   └── validation.ts
│   └── utils/
│       ├── sourceResolver.ts     # S# → URL conversion
│       └── errorHandler.ts
├── prisma/
│   └── schema.prisma
├── .env
├── package.json
├── tsconfig.json
└── docker-compose.yml
```

---

## Key Implementation Files

I'll create the essential backend files next. Let me know if you want me to proceed with:

1. Complete backend Express server
2. Research orchestrator (handles foundation + 10 sections)
3. Claude executor with streaming
4. Source resolver (S# to URLs)
5. Updated frontend researchManager to call these APIs
6. Docker compose setup

Should I create all of these now?
