# Implementation Guide: Modular Company Intelligence Research System

## Overview

This guide provides complete instructions for implementing the modular Company Intelligence Sheet generation system, including job orchestration, dependency resolution, parallel execution, database schema, API endpoints, streaming implementation, error handling, and source management.

---

## Table of Contents

1. [Job Orchestration Architecture](#job-orchestration-architecture)
2. [Database Schema (Prisma)](#database-schema-prisma)
3. [API Endpoints](#api-endpoints)
4. [Streaming Implementation](#streaming-implementation)
5. [Error Handling & Retry Logic](#error-handling--retry-logic)
6. [Source Catalog Management](#source-catalog-management)
7. [Dependency Resolution](#dependency-resolution)
8. [Implementation Examples](#implementation-examples)

---

## Job Orchestration Architecture

### All Sections Generate Every Time

**Important:** This system generates all 10 sections plus foundation for every research request. Users cannot select which sections to generate - this ensures complete, consistent intelligence reports every time.

### Parent Job Creates Child Jobs

The system uses a hierarchical job structure where a parent `ResearchJob` spawns child jobs for each section.

```typescript
interface JobOrchestration {
  parent: ResearchJob;
  children: Map<string, SectionJob>;
  dependencies: Map<string, string[]>;
}
```

### Execution Flow

```
1. User creates ResearchJob (POST /api/research/generate)
   └─> Parent job created with status: 'pending'

2. System spawns Foundation job (Phase 0)
   └─> Job: 'foundation', dependencies: []

3. Foundation completes
   └─> System identifies next runnable jobs
   
4. Parallel execution (Phase 1)
   ├─> Job: 'section_2', dependencies: ['foundation']
   ├─> Job: 'section_3', dependencies: ['foundation']
   └─> Job: 'section_8', dependencies: ['foundation']

5. Sequential dependent jobs (Phase 2-4)
   └─> When dependencies met, spawn next jobs

6. Synthesis phase (Phase 5)
   ├─> Job: 'section_1', dependencies: ['foundation', 'section_2', 'section_3']
   ├─> Job: 'section_9', dependencies: ['section_5', 'section_6', 'section_7']
   └─> Job: 'section_10', dependencies: [all previous sections]

7. Parent job completes when all children complete
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

model ResearchJob {
  id                String    @id @default(cuid())
  status            String    // 'pending' | 'running' | 'completed' | 'failed'
  currentStage      String?   // 'foundation' | 'section_1' | etc.
  progress          Float     @default(0)
  metadata          Json      // Store foundation + sourceTracking
  
  // Research inputs
  companyName       String
  geography         String
  focusAreas        String[]
  userFiles         String[]  // File IDs or paths
  
  // Research outputs (stored as JSON)
  foundation        Json?     // FoundationOutput
  executiveSummary  Json?     // Section1Output
  financialSnapshot Json?     // Section2Output
  companyOverview   Json?     // Section3Output
  segmentAnalysis   Json?     // Section4Output
  trends            Json?     // Section5Output
  peerBenchmarking  Json?     // Section6Output
  skuOpportunities  Json?     // Section7Output
  recentNews        Json?     // Section8Output
  conversationStarters Json?  // Section9Output
  appendix          Json?     // Section10Output
  
  // Metadata
  overallConfidence String
  tags              String[]
  
  // Relations
  jobs              ResearchSubJob[]
  user              User      @relation(fields: [userId], references: [id])
  userId            String
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model ResearchSubJob {
  id                String    @id @default(cuid())
  researchId        String
  research          Research  @relation(fields: [researchId], references: [id])
  
  stage             String    // 'foundation' | 'section_1' | 'section_2' | etc.
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
  research          Research[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

---

## API Endpoints

### 1. Create Research Job

```typescript
POST /api/research/generate

Request Body:
{
  companyName: string;
  geography: string;
  focusAreas?: string[];
  userFiles?: string[];            // File IDs from uploads
}

Response:
{
  jobId: string;
  status: 'pending';
  message: 'Research job created. Generating all 10 sections.';
}
```

### 2. Get Job Status (with streaming progress)

```typescript
GET /api/research/jobs/:jobId

Response:
{
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;                // 0-1
  currentStage: string;            // 'foundation' | 'section_2' | etc.
  completedSections: string[];
  estimatedTimeRemaining?: number; // Seconds
  error?: string;
}
```

### 3. Get Complete Research

```typescript
GET /api/research/:id

Response: CompleteResearchOutput
{
  foundation: FoundationOutput;
  section1: Section1Output;
  section2: Section2Output;
  // ... all completed sections
  metadata: {
    companyName: string;
    geography: string;
    generatedDate: string;
    sectionsCompleted: string[];
  };
}
```

### 4. Regenerate Specific Sections

```typescript
POST /api/research/:id/regenerate

Request Body:
{
  sections: string[];  // ['section_2', 'section_5'] - which sections to regenerate
  reason?: string;     // 'update_data' | 'improve_quality'
}

Response:
{
  jobId: string;
  status: 'pending';
  sectionsToRegenerate: string[];
  message: 'Regenerating specified sections. Other sections remain unchanged.';
}
```

---

## Streaming Implementation

### Anthropic Streaming API

```typescript
import Anthropic from '@anthropic-ai/sdk';

async function executeSection(
  sectionName: string,
  prompt: string,
  onProgress: (update: ProgressUpdate) => void
): Promise<SectionOutput> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  let fullResponse = '';
  
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 16000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  // Stream content
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      const delta = chunk.delta.text;
      fullResponse += delta;
      
      // Send progress update
      onProgress({
        stage: sectionName,
        type: 'content_delta',
        content: delta,
        tokensUsed: fullResponse.length / 4 // Rough estimate
      });
    }
  }

  // Parse JSON response
  const output = JSON.parse(fullResponse);
  
  // Validate
  const schema = getSectionSchema(sectionName);
  const validated = validateWithFeedback(schema, output, sectionName);
  
  return validated;
}
```

### Progress Updates via Job

```typescript
interface ProgressUpdate {
  stage: string;
  type: 'started' | 'content_delta' | 'completed' | 'failed';
  content?: string;
  tokensUsed?: number;
  error?: string;
}

async function updateProgress(
  jobId: string,
  update: ProgressUpdate
): Promise<void> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId },
    include: { jobs: true }
  });
  
  if (!job) return;
  
  // Calculate overall progress
  // Total: 1 foundation + 10 sections = 11 total stages
  const totalStages = 11;
  const completed = job.jobs.filter(j => j.status === 'completed').length;
  const progress = completed / totalStages;
  
  // Update parent job
  await prisma.researchJob.update({
    where: { id: jobId },
    data: {
      progress,
      currentStage: update.stage,
      updatedAt: new Date()
    }
  });
  
  // Update sub-job
  await prisma.researchSubJob.updateMany({
    where: {
      researchId: jobId,
      stage: update.stage
    },
    data: {
      status: update.type === 'completed' ? 'completed' : 'running',
      updatedAt: new Date()
    }
  });
}
```

### Frontend Polling Pattern

```typescript
// Frontend: Poll for updates
async function pollJobStatus(jobId: string): Promise<void> {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/research/jobs/${jobId}`);
    const status = await response.json();
    
    // Update UI
    updateProgressBar(status.progress);
    updateCurrentStage(status.currentStage);
    
    // Check completion
    if (status.status === 'completed') {
      clearInterval(interval);
      loadCompleteResearch(jobId);
    } else if (status.status === 'failed') {
      clearInterval(interval);
      showError(status.error);
    }
  }, 2000); // Poll every 2 seconds
}
```

---

## Error Handling & Retry Logic

### Save Partial Research on Section Failure

```typescript
async function handleSectionFailure(
  jobId: string,
  sectionName: string,
  error: Error
): Promise<void> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId },
    include: { jobs: true }
  });
  
  if (!job) return;
  
  // Save what we have so far
  const completedSections = job.jobs.filter(j => j.status === 'completed');
  
  // Update sub-job with failure
  await prisma.researchSubJob.updateMany({
    where: {
      researchId: jobId,
      stage: sectionName
    },
    data: {
      status: 'failed',
      lastError: error.message,
      attempts: { increment: 1 },
      updatedAt: new Date()
    }
  });
  
  // Check if we should retry
  const subJob = job.jobs.find(j => j.stage === sectionName);
  if (subJob && subJob.attempts < subJob.maxAttempts) {
    // Retry after delay
    setTimeout(() => retrySection(jobId, sectionName), 5000);
  } else {
    // Mark section as permanently failed
    await notifyUserOfFailure(jobId, sectionName);
  }
}
```

### Retry Individual Failed Sections

```typescript
async function retrySection(
  jobId: string,
  sectionName: string
): Promise<void> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId },
    include: { jobs: true }
  });
  
  if (!job) return;
  
  // Check dependencies are met
  const dependencies = SECTION_DEPENDENCIES[sectionName] || [];
  const depsCompleted = dependencies.every(dep => {
    const depJob = job.jobs.find(j => j.stage === dep);
    return depJob?.status === 'completed';
  });
  
  if (!depsCompleted) {
    throw new Error(`Dependencies not met for ${sectionName}`);
  }
  
  // Build prompt with existing context
  const input = await buildSectionInput(job, sectionName);
  const prompt = getSectionPromptBuilder(sectionName)(input);
  
  // Execute section with retry
  try {
    const output = await executeSection(
      sectionName,
      prompt,
      (update) => updateProgress(jobId, update)
    );
    
    // Save output
    await saveSectionOutput(jobId, sectionName, output);
    
    // Mark as completed
    await prisma.researchSubJob.updateMany({
      where: { researchId: jobId, stage: sectionName },
      data: { status: 'completed', completedAt: new Date() }
    });
    
    // Trigger dependent sections
    await checkAndTriggerDependentSections(jobId, sectionName);
    
  } catch (error) {
    await handleSectionFailure(jobId, sectionName, error);
  }
}
```

### Source Tracking Across Retries

```typescript
interface SourceTracking {
  baseSourceCount: number;        // From foundation
  sectionSources: Map<string, string[]>; // Section -> sources added
  quoteSources: Map<string, number>;     // Source -> quote count (enforce 1 max)
}

async function trackSources(
  jobId: string,
  sectionName: string,
  sourcesUsed: string[]
): Promise<void> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId }
  });
  
  if (!job?.metadata) return;
  
  const tracking = job.metadata.sourceTracking as SourceTracking;
  
  // Update section sources
  if (!tracking.sectionSources) {
    tracking.sectionSources = new Map();
  }
  tracking.sectionSources.set(sectionName, sourcesUsed);
  
  // Save updated tracking
  await prisma.researchJob.update({
    where: { id: jobId },
    data: {
      metadata: {
        ...job.metadata,
        sourceTracking: tracking
      }
    }
  });
}
```

### Handling Token Limit Errors (Fallback to Sub-calls)

```typescript
async function executeWithFallback(
  jobId: string,
  sectionName: string,
  prompt: string
): Promise<SectionOutput> {
  try {
    // Attempt full section generation
    return await executeSection(sectionName, prompt, 
      (update) => updateProgress(jobId, update)
    );
  } catch (error) {
    if (isTokenLimitError(error)) {
      // Fallback: Section 4 requires per-segment generation
      if (sectionName === 'section_4') {
        return await executeSection4WithFallback(jobId);
      }
    }
    throw error;
  }
}

async function executeSection4WithFallback(
  jobId: string
): Promise<Section4Output> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId }
  });
  
  if (!job?.foundation) throw new Error('Foundation not available');
  
  const foundation = job.foundation as FoundationOutput;
  const segments = foundation.segment_structure;
  
  // Generate overview
  const overviewPrompt = buildSection4OverviewPrompt({
    foundation,
    companyName: job.companyName,
    geography: job.geography
  });
  
  const overview = await executeSection(
    'section_4_overview',
    overviewPrompt,
    (update) => updateProgress(jobId, update)
  );
  
  // Generate each segment individually
  const segmentOutputs: SegmentAnalysis[] = [];
  
  for (const segment of segments) {
    const segmentPrompt = buildSection4SegmentPrompt(
      {
        foundation,
        companyName: job.companyName,
        geography: job.geography,
        section2Context: job.financialSnapshot as Section2Output | undefined
      },
      segment.name
    );
    
    const segmentOutput = await executeSection(
      `section_4_${segment.name}`,
      segmentPrompt,
      (update) => updateProgress(jobId, update)
    );
    
    segmentOutputs.push(segmentOutput as SegmentAnalysis);
  }
  
  // Combine into full Section 4 output
  return combineSegmentOutputs(
    overview,
    segmentOutputs,
    { level: 'HIGH', reason: 'All segments generated successfully' }
  );
}
```

---

## Source Catalog Management

### Foundation Establishes Base Catalog

```typescript
interface SourceCatalogManager {
  foundation: SourceReference[];
  nextId: number;
  
  addSource(citation: string, type: SourceType, date: string, url?: string): string;
  getSource(id: string): SourceReference | undefined;
  getAllSources(): SourceReference[];
}

class SourceCatalog implements SourceCatalogManager {
  private sources: Map<string, SourceReference>;
  private nextId: number;
  
  constructor(foundationSources: SourceReference[]) {
    this.sources = new Map();
    
    // Load foundation sources
    for (const source of foundationSources) {
      this.sources.set(source.id, source);
    }
    
    // Set next ID based on highest foundation ID
    const maxId = Math.max(
      ...foundationSources.map(s => parseInt(s.id.substring(1)))
    );
    this.nextId = maxId + 1;
  }
  
  addSource(
    citation: string,
    type: SourceType,
    date: string,
    url?: string
  ): string {
    const id = `S${this.nextId}`;
    this.nextId++;
    
    this.sources.set(id, {
      id,
      citation,
      type,
      date,
      url
    });
    
    return id;
  }
  
  getSource(id: string): SourceReference | undefined {
    return this.sources.get(id);
  }
  
  getAllSources(): SourceReference[] {
    return Array.from(this.sources.values());
  }
}
```

### Sections Extend Catalog (S26, S27...)

```typescript
async function executeSectionWithSourceTracking(
  jobId: string,
  sectionName: string,
  prompt: string
): Promise<SectionOutput> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId }
  });
  
  if (!job?.foundation) {
    throw new Error('Foundation not available');
  }
  
  const foundation = job.foundation as FoundationOutput;
  const catalog = new SourceCatalog(foundation.source_catalog);
  
  // Execute section
  const output = await executeSection(sectionName, prompt,
    (update) => updateProgress(jobId, update)
  );
  
  // Check if section added new sources
  if (output.sources_used) {
    for (const sourceId of output.sources_used) {
      if (!catalog.getSource(sourceId)) {
        // New source - would need citation from output
        // This is a validation point
        console.warn(`Section ${sectionName} referenced new source ${sourceId} not in catalog`);
      }
    }
  }
  
  return output;
}
```

### Analyst Quote Tracking (Enforce 1 per source)

```typescript
interface AnalystQuoteTracker {
  sourceQuotes: Map<string, number>; // Source ID -> count
  
  canAddQuote(sourceId: string): boolean;
  recordQuote(sourceId: string): void;
  getViolations(): string[];
}

function validateAnalystQuotes(
  research: CompleteResearchOutput
): string[] {
  const violations: string[] = [];
  const tracker = new Map<string, number>();
  
  // Check Section 4 segments
  if (research.section4) {
    for (const segment of research.section4.segments) {
      for (const quote of segment.performance_analysis.analyst_quotes) {
        const count = tracker.get(quote.source) || 0;
        if (count >= 1) {
          violations.push(
            `Section 4 (${segment.name}): Multiple quotes from source ${quote.source}`
          );
        }
        tracker.set(quote.source, count + 1);
      }
    }
  }
  
  // Check Section 5 company trends
  if (research.section5) {
    for (const trend of research.section5.company_trends.trends) {
      if (trend.analyst_quote) {
        const count = tracker.get(trend.analyst_quote.source) || 0;
        if (count >= 1) {
          violations.push(
            `Section 5: Multiple quotes from source ${trend.analyst_quote.source}`
          );
        }
        tracker.set(trend.analyst_quote.source, count + 1);
      }
    }
  }
  
  return violations;
}
```

### Deduplication Logic

```typescript
function deduplicateSources(
  sources: SourceReference[]
): SourceReference[] {
  const seen = new Map<string, SourceReference>();
  
  for (const source of sources) {
    // Normalize citation for comparison
    const normalized = source.citation
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!seen.has(normalized)) {
      seen.set(normalized, source);
    } else {
      // Duplicate found - prefer lower ID number
      const existing = seen.get(normalized)!;
      const existingNum = parseInt(existing.id.substring(1));
      const newNum = parseInt(source.id.substring(1));
      
      if (newNum < existingNum) {
        seen.set(normalized, source);
      }
    }
  }
  
  return Array.from(seen.values());
}
```

---

## Dependency Resolution

### Section Dependencies Map

```typescript
const SECTION_DEPENDENCIES: Record<string, string[]> = {
  // Phase 0
  'foundation': [],
  
  // Phase 1 - Core sections (no dependencies)
  'section_2': ['foundation'],
  'section_3': ['foundation'],
  'section_8': ['foundation'],
  
  // Phase 2 - Complex section (optional context)
  'section_4': ['foundation'], // Section 2 optional
  
  // Phase 3 - Dependent sections
  'section_5': ['foundation'], // Sections 3, 4 optional
  'section_6': ['foundation', 'section_2'], // REQUIRED
  'section_7': ['foundation'], // Sections 5, 6 recommended
  
  // Phase 4 - Synthesis sections
  'section_1': ['foundation', 'section_2', 'section_3'], // MINIMUM
  'section_9': ['foundation'], // Sections 5, 6, 7 recommended
  
  // Phase 5 - Appendix (runs last)
  'section_10': [], // All sections
};
```

### Dependency Resolution Logic

```typescript
async function getNextRunnableSections(
  jobId: string
): Promise<string[]> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId },
    include: { jobs: true }
  });
  
  if (!job) return [];
  
  const completed = new Set(
    job.jobs
      .filter(j => j.status === 'completed')
      .map(j => j.stage)
  );
  
  const running = new Set(
    job.jobs
      .filter(j => j.status === 'running')
      .map(j => j.stage)
  );
  
  const pending = new Set(
    job.jobs
      .filter(j => j.status === 'pending')
      .map(j => j.stage)
  );
  
  const runnable: string[] = [];
  
  for (const stage of pending) {
    const deps = SECTION_DEPENDENCIES[stage] || [];
    
    // Check if all dependencies are completed
    const depsCompleted = deps.every(dep => completed.has(dep));
    
    // Check if not already running
    const notRunning = !running.has(stage);
    
    if (depsCompleted && notRunning) {
      runnable.push(stage);
    }
  }
  
  return runnable;
}
```

### Parallel Execution Where Possible

```typescript
async function executeNextPhase(jobId: string): Promise<void> {
  const runnable = await getNextRunnableSections(jobId);
  
  if (runnable.length === 0) {
    // Check if job is complete
    await checkJobCompletion(jobId);
    return;
  }
  
  // Execute all runnable sections in parallel
  await Promise.all(
    runnable.map(async (section) => {
      try {
        await executeSection(jobId, section);
      } catch (error) {
        console.error(`Section ${section} failed:`, error);
        await handleSectionFailure(jobId, section, error);
      }
    })
  );
  
  // After this phase completes, check for next phase
  await executeNextPhase(jobId);
}
```

### Sequential for Dependent Sections

```typescript
async function executeSequentialSections(
  jobId: string,
  sections: string[]
): Promise<void> {
  for (const section of sections) {
    // Wait for dependencies
    await waitForDependencies(jobId, section);
    
    // Execute section
    await executeSection(jobId, section);
  }
}

async function waitForDependencies(
  jobId: string,
  section: string
): Promise<void> {
  const deps = SECTION_DEPENDENCIES[section] || [];
  
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const job = await prisma.researchJob.findUnique({
        where: { id: jobId },
        include: { jobs: true }
      });
      
      if (!job) {
        clearInterval(interval);
        resolve();
        return;
      }
      
      const completed = new Set(
        job.jobs
          .filter(j => j.status === 'completed')
          .map(j => j.stage)
      );
      
      const depsCompleted = deps.every(dep => completed.has(dep));
      
      if (depsCompleted) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}
```

---

## Implementation Examples

### Example 1: Create Research Job

```typescript
// POST /api/research/generate
export async function POST(req: Request) {
  const body = await req.json();
  const { companyName, geography, focusAreas, userFiles } = body;
  
  // Create parent job
  const research = await prisma.researchJob.create({
    data: {
      companyName,
      geography,
      status: 'pending',
      progress: 0,
      metadata: {
        focusAreas: focusAreas || [],
        userFiles: userFiles || [],
        sourceTracking: {
          baseSourceCount: 0,
          sectionSources: {},
          quoteSources: {}
        }
      },
      userId: req.user.id
    }
  });
  
  // Create sub-jobs for ALL sections (foundation + sections 1-10)
  const allStages = [
    'foundation',
    'section_1',
    'section_2',
    'section_3',
    'section_4',
    'section_5',
    'section_6',
    'section_7',
    'section_8',
    'section_9',
    'section_10'
  ];
  
  await Promise.all(
    allStages.map(stage => 
      prisma.researchSubJob.create({
        data: {
          researchId: research.id,
          stage,
          status: 'pending',
          dependencies: SECTION_DEPENDENCIES[stage] || []
        }
      })
    )
  );
  
  // Start execution
  executeNextPhase(research.id);
  
  return Response.json({
    jobId: research.id,
    status: 'pending',
    message: 'Research job created. Generating all 10 sections.'
  });
}
```

### Example 2: Execute Foundation

```typescript
async function executeFoundation(jobId: string): Promise<void> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId }
  });
  
  if (!job) throw new Error('Job not found');
  
  // Build foundation prompt
  const prompt = buildFoundationPrompt({
    companyName: job.companyName,
    geography: job.geography,
    focusAreas: job.metadata.focusAreas || [],
    userFiles: job.metadata.userFiles || []
  });
  
  // Execute with streaming
  const output = await executeSection(
    'foundation',
    prompt,
    (update) => updateProgress(jobId, update)
  ) as FoundationOutput;
  
  // Validate
  const validated = validateWithFeedback(
    foundationOutputSchema,
    output,
    'Foundation'
  );
  
  // Save output
  await prisma.researchJob.update({
    where: { id: jobId },
    data: {
      foundation: validated as any,
      metadata: {
        ...job.metadata,
        sourceTracking: {
          baseSourceCount: validated.source_catalog.length,
          sectionSources: {},
          quoteSources: {}
        }
      }
    }
  });
  
  // Mark foundation job as completed
  await prisma.researchSubJob.updateMany({
    where: {
      researchId: jobId,
      stage: 'foundation'
    },
    data: {
      status: 'completed',
      output: validated as any,
      confidence: validated.confidence.level,
      sourcesUsed: validated.source_catalog.map(s => s.id),
      completedAt: new Date()
    }
  });
  
  // Trigger next phase
  await executeNextPhase(jobId);
}
```

### Example 3: Section 10 Auto-Generation

```typescript
async function executeSection10(jobId: string): Promise<void> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId }
  });
  
  if (!job) throw new Error('Job not found');
  
  // Collect all completed sections
  const sections = {
    section1: job.executiveSummary as Section1Output | undefined,
    section2: job.financialSnapshot as Section2Output | undefined,
    section3: job.companyOverview as Section3Output | undefined,
    section4: job.segmentAnalysis as Section4Output | undefined,
    section5: job.trends as Section5Output | undefined,
    section6: job.peerBenchmarking as Section6Output | undefined,
    section7: job.skuOpportunities as Section7Output | undefined,
    section8: job.recentNews as Section8Output | undefined,
    section9: job.conversationStarters as Section9Output | undefined
  };
  
  // Auto-generate Section 10
  const output = generateSection10({
    foundation: job.foundation as FoundationOutput,
    companyName: job.companyName,
    geography: job.geography,
    sections
  });
  
  // Save
  await prisma.researchJob.update({
    where: { id: jobId },
    data: {
      appendix: output as any
    }
  });
  
  // Mark as completed
  await prisma.researchSubJob.updateMany({
    where: {
      researchId: jobId,
      stage: 'section_10'
    },
    data: {
      status: 'completed',
      output: output as any,
      completedAt: new Date()
    }
  });
  
  // Check if job is complete
  await checkJobCompletion(jobId);
}
```

---

## Summary

This implementation guide provides:

✅ **Job orchestration** - Parent/child job hierarchy  
✅ **Database schema** - Prisma models for tracking  
✅ **API endpoints** - RESTful interface  
✅ **Streaming** - Real-time progress updates  
✅ **Error handling** - Retry logic and partial saves  
✅ **Source management** - Catalog tracking and deduplication  
✅ **Dependency resolution** - Automatic phase progression  
✅ **Parallel execution** - Where dependencies allow  

The system is designed to be robust, scalable, and provides full visibility into research generation progress.
