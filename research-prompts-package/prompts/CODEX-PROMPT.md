# Codex Implementation Prompt

Copy this prompt and provide it to Codex along with the research-prompts-package.zip:

---

I need you to implement a Company Intelligence Research Generation System into my application. I'm providing you with a complete package that includes all prompts, TypeScript types, validation schemas, and implementation specifications.

**Important:** This system generates ALL 10 sections plus foundation for every research request. Users do not select which sections to generate - this ensures complete, consistent intelligence reports every time.

# READ THESE FILES FIRST (IN THIS ORDER):

1. **README.md** - System overview and quick start guide
2. **implementation-guide.md** - COMPLETE implementation instructions with:
   - Job orchestration architecture
   - Database schema (Prisma)
   - API endpoints
   - Streaming implementation
   - Error handling & retry logic
   - Source catalog management
   - Dependency resolution
   - Full code examples

3. **style-guide.md** - Formatting standards (needed to understand prompt requirements)
4. **shared-types.ts** - Common types and enums
5. **types.ts** - All TypeScript interfaces
6. **validation.ts** - Zod schemas for runtime validation

# YOUR TASK:

Implement the system following the specifications in `implementation-guide.md`. That file contains:

- ✅ Complete Prisma database schema (copy directly)
- ✅ API endpoint designs with full code examples
- ✅ Job orchestration logic with code samples
- ✅ Streaming implementation using Anthropic API
- ✅ Error handling patterns with retry logic
- ✅ Source catalog management class
- ✅ Dependency resolution logic
- ✅ Example implementations for all major functions

# IMPLEMENTATION ORDER:

Follow the "Recommended Implementation Order" in README.md:

1. Set up database schema (Prisma from implementation-guide.md)
2. Implement foundation execution (Phase 0)
3. Implement core sections (2, 3, 8) with validation
4. Add job orchestration (parent/child jobs)
5. Implement dependency resolution (automatic progression)
6. Add streaming progress (real-time updates)
7. Implement complex section (4 - with fallback)
8. Add dependent sections (5, 6, 7)
9. Implement synthesis (1, 9, 10)
10. Add error handling (retry logic, partial saves)

# KEY ARCHITECTURAL POINTS:

- **All Sections Always Generate:** Every research job produces foundation + all 10 sections
- **Output Format:** JSON (validated with Zod), NOT .docx
- **Orchestration:** Parent `ResearchJob` creates 11 child `ResearchSubJob` records (foundation + sections 1-10)
- **Execution:** Parallel where possible, sequential when dependencies exist
- **Model:** Always use `claude-sonnet-4-5`
- **Progress:** Poll job status every 2 seconds for updates (11 total stages)
- **Error Handling:** Retry failed sections up to 3 times, save partial results

# DEPENDENCY MAP:

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
```

# IMPORTANT:

- All the code examples you need are in `implementation-guide.md`
- Copy the Prisma schema directly from that file
- Follow the API endpoint structures shown in the examples
- Use the job orchestration patterns demonstrated
- Implement the `SourceCatalog` class as specified
- Use the validation helpers from `validation.ts`

# WHAT TO BUILD:

1. Database models (Prisma schema provided)
2. API routes:
   - POST /api/research/generate (create job)
   - GET /api/research/jobs/:jobId (get status)
   - GET /api/research/:id (get complete research)
   - POST /api/research/:id/regenerate (regenerate sections)

3. Core services:
   - Job manager (create jobs, orchestration)
   - Section executor (run prompts with Claude)
   - Dependency resolver (determine next sections)
   - Source catalog manager (track sources)
   - Validation service (Zod validation)

4. Integration:
   - Anthropic Claude API for prompt execution
   - Streaming progress updates
   - Error handling with retries
   - Partial result saving

# ENVIRONMENT VARIABLES NEEDED:

```bash
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=your_database_url
```

# START IMPLEMENTING:

Read `implementation-guide.md` thoroughly - it has everything you need including complete code examples. Then implement the system following the order above.

Ask me questions if anything is unclear, but the implementation guide should answer most questions.
