# Company Intelligence Research Generation System

A comprehensive, modular prompt system for generating geography-focused Company Intelligence Sheets using Claude AI.

## Overview

This system generates complete, geography-focused Company Intelligence Sheets using Claude AI. Every research request produces all 10 sections plus a comprehensive foundation research phase, ensuring consistent and thorough intelligence reports.

**Key Features:**
- ✅ Complete research generation (foundation + 10 sections, every time)
- ✅ Modular prompt architecture for maintainability
- ✅ Complete TypeScript type system with Zod validation
- ✅ Job orchestration with parallel execution
- ✅ Streaming progress updates
- ✅ Automatic source catalog management
- ✅ Copyright compliance enforcement (15-word quote limit)
- ✅ 75-80% geography focus throughout
- ✅ Fallback strategies for token limits
- ✅ Partial research saves on failure

---

## Quick Start Guide

### 1. Install Dependencies

```bash
npm install zod @anthropic-ai/sdk @prisma/client
npm install -D prisma typescript
```

### 2. Set Up Database

```bash
npx prisma init
# Copy schema from implementation-guide.md to prisma/schema.prisma
npx prisma generate
npx prisma db push
```

### 3. Set Environment Variables

```bash
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=your_database_url_here
```

### 4. Basic Usage

```typescript
import { buildFoundationPrompt } from './prompts/foundation-prompt';
import { foundationOutputSchema } from './prompts/validation';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Create research job - generates ALL sections
const response = await fetch('/api/research/generate', {
  method: 'POST',
  body: JSON.stringify({
    companyName: "Parker Hannifin",
    geography: "Germany",
    focusAreas: ["Manufacturing", "Aerospace"]
  })
});

const { jobId } = await response.json();

// Poll for completion
const checkStatus = setInterval(async () => {
  const status = await fetch(`/api/research/jobs/${jobId}`);
  const data = await status.json();
  
  console.log(`Progress: ${data.progress * 100}%`);
  
  if (data.status === 'completed') {
    clearInterval(checkStatus);
    // All 10 sections are now complete
    const research = await fetch(`/api/research/${jobId}`);
    console.log(await research.json());
  }
}, 2000);
```

---

## File Structure

```
prompts/
├── README.md                          # This file
├── CHANGELOG.md                       # Version history
├── implementation-guide.md            # Complete implementation guide
├── package-structure.txt              # Complete file tree
│
├── style-guide.md                     # Single source of truth for formatting
│
├── foundation-prompt.md               # Phase 0: Comprehensive research
├── foundation-prompt.ts               # TypeScript implementation
│
├── sections/
│   ├── section-01.md                  # Executive Summary
│   ├── section-01.ts
│   ├── section-02.md                  # Financial Snapshot
│   ├── section-02.ts
│   ├── section-03.md                  # Company Overview
│   ├── section-03.ts
│   ├── section-04.md                  # Segment Analysis (with fallback)
│   ├── section-04.ts
│   ├── section-05.md                  # Trends
│   ├── section-05.ts
│   ├── section-06.md                  # Peer Benchmarking
│   ├── section-06.ts
│   ├── section-07.md                  # SKU Opportunity Mapping
│   ├── section-07.ts
│   ├── section-08.md                  # Recent News & Events
│   ├── section-08.ts
│   ├── section-09.md                  # Executive Conversation Starters
│   ├── section-09.ts
│   ├── section-10.md                  # Appendix (auto-generated)
│   └── section-10.ts
│
├── shared-types.ts                    # Common types and enums
├── types.ts                           # All interface definitions
└── validation.ts                      # Zod schemas for runtime validation
```

---

## How to Use Each Prompt

### Foundation (Phase 0)

**Purpose:** Comprehensive research establishing company basics, geography specifics, source catalog, and industry context.

**Input:**
- Company name
- Geography focus
- Optional: Focus areas, user-provided files

**Output:** `FoundationOutput` with company basics, geography specifics, source catalog (S1, S2, S3...), FX rates, industry averages

**Usage:**
```typescript
import { buildFoundationPrompt } from './foundation-prompt';
const prompt = buildFoundationPrompt({
  companyName: "Siemens",
  geography: "China",
  focusAreas: ["Energy", "Automation"],
  userFiles: []
});
```

### Section 1: Executive Summary

**Purpose:** Synthesizes key findings from all completed sections into 5-7 bullet points.

**Dependencies:** REQUIRED - Foundation + Sections 2 & 3 (minimum)

**Input:** Foundation + at least Sections 2 & 3

**Output:** 5-7 bullets (Geography headline, Financial, Strategic, Competitive, Risk, Momentum)

### Section 2: Financial Snapshot

**Purpose:** Current financial performance with 15 required KPIs and peer/industry comparison.

**Dependencies:** Foundation only

**Output:** KPI table, summary, FX source, industry source, derived metrics

### Section 3: Company Overview

**Purpose:** Business description, geographic footprint, strategic priorities, leadership.

**Dependencies:** Foundation only

**Output:** 4 subsections (3.1-3.4)

### Section 4: Segment Analysis

**Purpose:** Per-segment financial snapshot, performance analysis, competitive landscape.

**Dependencies:** Foundation + optional Section 2

**Special:** Includes fallback strategy for per-segment generation if token limit exceeded

**Output:** Overview + array of segment analyses (one per company segment)

### Section 5: Trends

**Purpose:** Macro, micro, and company-specific trends with impact scores (1-10).

**Dependencies:** Foundation + optional Sections 3 & 4

**Output:** Aggregate summary + 3 trend categories

### Section 6: Peer Benchmarking

**Purpose:** Peer comparison table + strengths/gaps/positioning analysis.

**Dependencies:** REQUIRED - Foundation + Section 2

**Output:** Peer table + benchmark summary

### Section 7: SKU-Relevant Opportunity Mapping

**Purpose:** Maps operational problems to SSA practice areas (2-5 genuine opportunities).

**Dependencies:** Foundation + recommended Sections 5 & 6

**Output:** 0-5 opportunities (empty acceptable if no genuine alignments)

### Section 8: Recent News & Events

**Purpose:** 3-5 geography-relevant news items from last 12 months.

**Dependencies:** Foundation only

**Output:** News items with implications and geography relevance

### Section 9: Executive Conversation Starters

**Purpose:** 3-5 actionable discussion topics linking analysis to business decisions.

**Dependencies:** Foundation + recommended Sections 5, 6, 7

**Output:** Conversation starters with supporting data and business value

### Section 10: Appendix

**Purpose:** Auto-generated from all sections - consolidates sources, FX rates, derived metrics.

**Dependencies:** All other sections

**Special:** Can be programmatically generated using `generateSection10()` function

**Output:** Source references + FX rates/industry averages + derived metrics

---

## Integration with Existing App

### Step 1: Import Types and Validators

```typescript
import { 
  FoundationOutput,
  Section2Output,
  // ... other section outputs
  CompleteResearchOutput 
} from './prompts/types';

import {
  foundationOutputSchema,
  section2OutputSchema,
  validateWithFeedback
} from './prompts/validation';
```

### Step 2: Build Prompts

```typescript
import { buildFoundationPrompt } from './prompts/foundation-prompt';
import { buildSection2Prompt } from './prompts/sections/section-02';

const foundationPrompt = buildFoundationPrompt({
  companyName,
  geography,
  focusAreas,
  userFiles
});

// After foundation completes...
const section2Prompt = buildSection2Prompt({
  foundation: foundationOutput,
  companyName,
  geography
});
```

### Step 3: Execute with Claude

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 16000,
  messages: [{ role: 'user', content: prompt }]
});

const rawOutput = JSON.parse(response.content[0].text);
```

### Step 4: Validate Output

```typescript
const validated = validateWithFeedback(
  section2OutputSchema,
  rawOutput,
  'Section 2'
);
```

### Step 5: Store in Database

```typescript
await prisma.researchJob.update({
  where: { id: jobId },
  data: {
    financialSnapshot: validated
  }
});
```

---

## Dependency Map Visualization

```
Foundation (Phase 0)
    ↓
    ├─────────────────┬─────────────────┐
    ↓                 ↓                 ↓
Section 2         Section 3         Section 8
(Financial)       (Overview)        (News)
    ↓                 ↓
    │                 └────────┐
    ↓                          ↓
Section 4*                 Section 5*
(Segments)                 (Trends)
                              ↓
    ┌─────────────────────────┴─────────┐
    ↓                                   ↓
Section 6                           Section 7*
(Peer Benchmarking)                 (SKU Mapping)
REQUIRES Section 2
    ↓                                   ↓
    └─────────────────┬─────────────────┘
                      ↓
    ┌─────────────────┴─────────────────┐
    ↓                                   ↓
Section 1                           Section 9
(Executive Summary)                 (Conversation Starters)
REQUIRES Sections 2 & 3            
    ↓                                   ↓
    └─────────────────┬─────────────────┘
                      ↓
                  Section 10
                  (Appendix)
                  Uses ALL sections

* = Optional dependencies (benefits from but doesn't require)
```

---

## Example Usage for Each Section

### Example 1: Generate Complete Research (All Sections)

```typescript
async function generateCompleteResearch(
  companyName: string,
  geography: string
): Promise<CompleteResearchOutput> {
  // Create job - all sections will be generated
  const response = await fetch('/api/research/generate', {
    method: 'POST',
    body: JSON.stringify({ companyName, geography })
  });
  
  const { jobId } = await response.json();
  
  // Wait for completion
  return await pollUntilComplete(jobId);
}

async function pollUntilComplete(jobId: string): Promise<CompleteResearchOutput> {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const status = await fetch(`/api/research/jobs/${jobId}`);
      const data = await status.json();
      
      if (data.status === 'completed') {
        clearInterval(interval);
        const research = await fetch(`/api/research/${jobId}`);
        resolve(await research.json());
      }
    }, 2000);
  });
}
```

### Example 2: Regenerate Specific Sections

```typescript
async function regenerateSection(
  researchId: string,
  sectionName: string
): Promise<void> {
  // Regenerate just one section while keeping others
  const response = await fetch(`/api/research/${researchId}/regenerate`, {
    method: 'POST',
    body: JSON.stringify({
      sections: [sectionName],
      reason: 'improve_quality'
    })
  });
  
  const { jobId } = await response.json();
  
  // Wait for regeneration to complete
  await pollUntilComplete(jobId);
}
```

### Example 3: Monitor Progress

```typescript
async function monitorResearchProgress(jobId: string): Promise<void> {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/research/jobs/${jobId}`);
    const status = await response.json();
    
    console.log(`Stage: ${status.currentStage}`);
    console.log(`Progress: ${(status.progress * 100).toFixed(1)}%`);
    console.log(`Status: ${status.status}`);
    
    if (status.status === 'completed') {
      clearInterval(interval);
      console.log('Research complete! All 10 sections generated.');
    } else if (status.status === 'failed') {
      clearInterval(interval);
      console.error('Research failed:', status.error);
    }
  }, 2000);
}
```

---

## Troubleshooting Guide

### Issue: "Validation failed for Section X"

**Cause:** Claude output doesn't match expected schema

**Solutions:**
1. Check the validation error details in console
2. Verify prompt includes all required instructions
3. Ensure `style-guide.md` instructions are clear
4. Check if JSON is properly formatted (no markdown backticks)

### Issue: "Token limit exceeded"

**Cause:** Section content too large for single call

**Solutions:**
1. For Section 4: Use fallback strategy (per-segment generation)
2. Reduce `max_tokens` if getting truncated responses
3. Split large sections into multiple sub-calls

### Issue: "Dependency not met"

**Cause:** Trying to execute section before dependencies complete

**Solutions:**
1. Check `SECTION_DEPENDENCIES` map in implementation guide
2. Use `getNextRunnableSections()` to identify what can run
3. Ensure foundation completes first

### Issue: "Analyst quote validation failed - too long"

**Cause:** Quote exceeds 15-word limit

**Solutions:**
1. Prompt explicitly states 15-word maximum
2. Validation will reject longer quotes
3. Instruct Claude to extract key phrase only

### Issue: "Multiple quotes from same source"

**Cause:** Copyright compliance - only ONE quote per analyst source

**Solutions:**
1. Track quotes per source using `AnalystQuoteTracker`
2. Validation enforces one quote per source
3. Section prompts explicitly state this limit

### Issue: "Geography focus too low"

**Cause:** Output doesn't emphasize geography enough

**Solutions:**
1. Every prompt requires 75-80% geography focus
2. Check examples in prompt show correct patterns
3. Geography relevance required in every subsection

### Issue: "Sources not in catalog"

**Cause:** Section references source ID not in foundation

**Solutions:**
1. Foundation establishes base catalog (S1, S2, S3...)
2. Sections can add sources continuing numbering
3. Use `SourceCatalog` class to manage additions

---

## Key Files for Codex to Read First

When implementing this system, start with these files in order:

1. **README.md** (this file) - System overview and quick start
2. **style-guide.md** - Formatting standards (referenced by all prompts)
3. **shared-types.ts** - Common types and enums
4. **types.ts** - Complete interface definitions
5. **validation.ts** - Runtime validation schemas
6. **implementation-guide.md** - Job orchestration and API design
7. **foundation-prompt.md** - Phase 0 research (always runs first)
8. **section-02.md** - Example of core section structure
9. **section-04.md** - Example of complex section with fallback

---

## Recommended Implementation Order

1. **Set up database schema** (from implementation-guide.md)
2. **Implement foundation execution** (Phase 0)
3. **Implement core sections** (2, 3, 8) with validation
4. **Add job orchestration** (parent/child jobs)
5. **Implement dependency resolution** (automatic progression)
6. **Add streaming progress** (real-time updates)
7. **Implement complex section** (4 - with fallback)
8. **Add dependent sections** (5, 6, 7)
9. **Implement synthesis** (1, 9, 10)
10. **Add error handling** (retry logic, partial saves)

---

## System Statistics

- **Total Files:** 28
- **Prompt Files:** 22 (.md + .ts pairs)
- **Type System Files:** 3
- **Documentation Files:** 3
- **Total Lines:** ~15,000+ lines of code and documentation

---

## License

MIT License - See LICENSE file for details

---

## Support

For questions or issues:
- Review the implementation-guide.md for detailed orchestration logic
- Check troubleshooting guide above
- Examine example usage patterns
- Review TypeScript interfaces in types.ts

---

## Version

Current Version: 1.0.0 (December 2024)

See CHANGELOG.md for version history and changes.
