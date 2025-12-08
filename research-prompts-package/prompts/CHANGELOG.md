# Changelog

All notable changes to the Company Intelligence Research Generation System.

## [1.1.0] - December 2, 2024

### Changed - All Sections Now Generate Every Time

**Breaking Change:** Removed section selection feature. The system now generates all 10 sections plus foundation for every research request.

**Rationale:** Ensures complete, consistent intelligence reports. Modular prompts are maintained for code organization and easier execution, but users always get the full report.

**What Changed:**
- ✅ Removed `selectedSections` field from database schema
- ✅ Removed `generatedSections` field from metadata
- ✅ API endpoint no longer accepts `selectedSections` parameter
- ✅ Progress calculation simplified (always 11 stages: foundation + 10 sections)
- ✅ Job creation automatically creates 11 sub-jobs (no section selection logic)
- ✅ Updated all documentation and examples
- ✅ `CompleteResearchOutput` now requires all sections (no optional sections)

**Migration from 1.0.0:**
- Remove `selectedSections` from API calls
- Update database schema (remove fields)
- Expect all sections in output (no longer optional)
- Progress now calculated as: `completed / 11` instead of `completed / (selectedSections.length + 1)`

---

## [1.0.0] - December 2, 2024

### Initial Release - Modular Prompt System

Complete rewrite and expansion of the original company-intelligence skill into a comprehensive, modular research generation system.

---

## Added

### Core Architecture

- ✅ **Modular section structure** - 10 independent sections + foundation phase
- ✅ **TypeScript type system** - Complete interfaces for all inputs/outputs
- ✅ **Runtime validation** - Zod schemas for schema enforcement
- ✅ **Job orchestration** - Parent/child job hierarchy with dependency management
- ✅ **Database schema** - Prisma models for research tracking
- ✅ **API design** - RESTful endpoints with streaming support

### Foundation Research Phase (Phase 0)

- ✅ **foundation-prompt.md/.ts** - Comprehensive research establishing:
  - Company basics (legal name, ticker, revenue, employees)
  - Geography-specific metrics (revenue %, employees, facilities)
  - Source catalog (S1, S2, S3... from 10 source categories)
  - FX rates (A/B/C hierarchy)
  - Industry averages (A/B/C hierarchy)
  - Segment structure

### Core Sections (No Dependencies)

- ✅ **Section 2: Financial Snapshot** - 15 required KPIs with peer/industry comparison
- ✅ **Section 3: Company Overview** - Business description, footprint, priorities, leadership
- ✅ **Section 8: Recent News & Events** - 3-5 geography-relevant news items (last 12 months)

### Complex Section (Optional Dependencies)

- ✅ **Section 4: Segment Analysis** - Per-segment financial snapshot, performance analysis, competitive landscape
  - Includes fallback strategy for per-segment generation if token limit exceeded
  - `buildSection4Prompt()` - Attempts all segments in one call
  - `buildSection4SegmentPrompt()` - Fallback for individual segment generation

### Dependent Sections

- ✅ **Section 5: Trends** - Macro/Micro/Company-specific trends with impact scores (1-10)
- ✅ **Section 6: Peer Benchmarking** - Peer comparison table + strengths/gaps/positioning
  - **REQUIRES** Section 2 for financial baseline
- ✅ **Section 7: SKU-Relevant Opportunity Mapping** - Maps problems to SSA practice areas
  - 2-5 genuine opportunities (empty acceptable if no alignments)

### Synthesis Sections

- ✅ **Section 1: Executive Summary** - 5-7 bullets synthesizing key findings
  - **REQUIRES** minimum: Foundation + Sections 2 & 3
  - Must lead with geography-specific headline
- ✅ **Section 9: Executive Conversation Starters** - 3-5 actionable discussion topics
  - Links analysis to business decisions with SSA capabilities
- ✅ **Section 10: Appendix** - Auto-generated from all sections
  - Source references (S#, consolidation, deduplication)
  - FX rates & industry averages
  - Derived metrics footnotes
  - Includes `generateSection10()` for programmatic generation

### TypeScript Implementation

- ✅ **shared-types.ts** - Common types, enums, type guards
  - `ConfidenceLevel`, `FxSource`, `IndustrySource`, `TrendDirection`
  - `SourceReference`, `AnalystQuote`, `Trend`, `Competitor`
  - Type guards for validation

- ✅ **types.ts** - Complete interface definitions
  - `FoundationOutput` + all section inputs/outputs (Section1-10)
  - `CompleteResearchOutput` with metadata
  - Detailed sub-interfaces for all data structures

- ✅ **validation.ts** - Zod schemas for runtime validation
  - Schema for every section output
  - `validateSectionOutput<T>()` - Generic validation
  - `validateWithFeedback<T>()` - Validation with error messages
  - `validateCompleteResearch()` - Full document validation

### Streaming Support

- ✅ **Anthropic streaming API integration** - Real-time content delivery
- ✅ **Progress updates** - Via job status polling
- ✅ **Token usage tracking** - Monitor consumption per section
- ✅ **Frontend polling pattern** - 2-second intervals

### Error Handling & Retry Logic

- ✅ **Save partial research on section failure** - Preserve completed work
- ✅ **Retry individual failed sections** - Up to 3 attempts per section
- ✅ **Source tracking across retries** - Maintain catalog integrity
- ✅ **Token limit fallback** - Per-segment generation for Section 4
- ✅ **Graceful degradation** - Mark sections as failed if retries exhausted

### Source Catalog Management

- ✅ **Foundation establishes base catalog** - S1, S2, S3... from Phase 0
- ✅ **Sections extend catalog** - Continue numbering (S26, S27...)
- ✅ **SourceCatalog class** - Programmatic source management
- ✅ **Analyst quote tracking** - Enforce 1 quote per source (copyright)
- ✅ **Deduplication logic** - Consolidate identical sources
- ✅ **Source type tracking** - filing, transcript, analyst_report, news, etc.

### Dependency Resolution

- ✅ **SECTION_DEPENDENCIES map** - Explicit dependency declarations
- ✅ **getNextRunnableSections()** - Automatic phase progression
- ✅ **Parallel execution** - Where dependencies allow
- ✅ **Sequential execution** - For dependent sections
- ✅ **Dependency validation** - Prevent execution before requirements met

### Documentation

- ✅ **README.md** - Complete system overview, quick start, troubleshooting
- ✅ **implementation-guide.md** - Job orchestration, database schema, API design
- ✅ **style-guide.md** - Single source of truth for formatting (16 sections)
- ✅ **CHANGELOG.md** - Version history and changes (this file)
- ✅ **package-structure.txt** - Complete file tree

---

## Changed from Original Skill

### Architecture

- **Old:** Single monolithic prompt generating entire .docx document
- **New:** 10+ modular sections with TypeScript orchestration
  - Each section can be generated independently
  - Sections can run in parallel where dependencies allow
  - Failed sections can be retried without regenerating entire document

### Output Format

- **Old:** .docx file (Microsoft Word document)
- **New:** Structured JSON matching TypeScript interfaces
  - Type-safe throughout application
  - Runtime validation with Zod
  - Easy to store in database
  - Can be formatted to any output format (docx, PDF, HTML, markdown)

### Research Depth

- **Old:** Single research pass with limited context
- **New:** Foundation research phase + specialized section research
  - Foundation (Phase 0): Comprehensive 10-source-category research
  - Each section: Targeted research with section-specific queries
  - 100+ specific search queries across all sections

### Geography Focus

- **Old:** Geography mentioned but not systematically enforced
- **New:** 75-80% geography focus requirement in every section
  - Enforced in prompts with correct/wrong examples
  - Validated in output
  - Geography relevance required in every subsection

### Source Management

- **Old:** Ad-hoc source citations
- **New:** Systematic source catalog management
  - Foundation establishes base catalog (S1, S2, S3...)
  - Sequential numbering maintained across sections
  - Source type tracking
  - Deduplication logic
  - Cross-section source tracking

### Copyright Compliance

- **Old:** General guidance on citations
- **New:** Hard-enforced copyright rules
  - 15-word maximum per quote (HARD LIMIT)
  - ONE quote per analyst source (HARD LIMIT)
  - Validation rejects violations
  - AnalystQuote tracking across sections

### Financial Analysis

- **Old:** General financial discussion
- **New:** 15 required KPIs with systematic comparison
  - Company vs Industry Average
  - Derived metrics with formulas
  - FX source hierarchy (A/B/C)
  - Industry source hierarchy (A/B/C)
  - Segment-level financial breakdowns

### Peer Benchmarking

- **Old:** General competitive discussion
- **New:** Structured peer comparison table
  - 3-5 comparable peers required
  - All peers must have geography presence
  - Systematic strengths/gaps analysis
  - Magnitude scoring (Significant/Moderate/Minor)

### Trends Analysis

- **Old:** Qualitative trend discussion
- **New:** Quantified impact scoring (1-10 scale)
  - Macro trends (4-6 trends)
  - Micro trends (3-5 trends)
  - Company-specific trends (3-5 trends)
  - Direction (Positive/Negative/Neutral)
  - Geography relevance for each

### SKU Mapping

- **Old:** Generic recommendations
- **New:** Genuine problem-to-SKU alignment
  - Only explicit problems from sources
  - 2-5 opportunities (empty acceptable)
  - Priority (High/Medium/Low)
  - Severity (1-10 scale)
  - Specific value levers quantified

### Segment Analysis

- **Old:** Brief segment mention
- **New:** Per-segment comprehensive analysis
  - Financial snapshot table per segment
  - 3-5 analytical paragraphs per segment
  - Segment-specific competitors (not company peers)
  - Fallback strategy for token limits

### Executive Summary

- **Old:** Generic overview paragraph
- **New:** Structured 5-7 bullets by category
  - Must lead with geography headline
  - Categories: Geography, Financial, Strategic, Competitive, Risk, Momentum
  - Synthesizes findings from all sections
  - Cites supporting sections and sources

### Conversation Starters

- **New Addition:** 3-5 actionable discussion topics
  - References specific data from report
  - Links to business value
  - Connects to SSA capabilities
  - Geography relevance explained

### Appendix

- **Old:** Simple source list
- **New:** Auto-generated comprehensive appendix
  - 10.1 Source References (with section usage tracking)
  - 10.2 FX Rates & Industry Averages
  - 10.3 Derived Metrics Footnotes (with formulas)
  - Renumbering notes if sources consolidated

---

## Technical Improvements

### Type Safety

- **Added:** Complete TypeScript type system
  - Every input/output typed
  - Type guards for validation
  - Generic validation functions
  - Compile-time checking

### Runtime Validation

- **Added:** Zod schemas for all outputs
  - Validates JSON structure
  - Enforces constraints (e.g., 15-word quotes)
  - Helpful error messages
  - Type inference from schemas

### Database Persistence

- **Added:** Prisma schema for tracking
  - ResearchJob model (parent)
  - ResearchSubJob model (children)
  - Status tracking per section
  - Progress monitoring
  - Metadata storage

### Job Orchestration

- **Added:** Automatic dependency resolution
  - Parent creates child jobs
  - Dependency map prevents early execution
  - Parallel execution where possible
  - Automatic phase progression
  - Status polling

### Streaming

- **Added:** Real-time progress updates
  - Anthropic streaming API
  - Content delta streaming
  - Token usage tracking
  - Frontend polling pattern

### Error Handling

- **Added:** Comprehensive retry and recovery
  - Save partial research
  - Retry failed sections (3 attempts)
  - Fallback strategies (token limits)
  - Source tracking across retries
  - Graceful degradation

---

## Breaking Changes

### For Users

- Output format changed from .docx to JSON
- Must implement job orchestration to use system
- Requires database for tracking (Prisma)
- Requires API integration (Anthropic)

### For Developers

- All prompts now return JSON (not prose)
- Must validate outputs with Zod schemas
- Must manage dependencies between sections
- Must implement source catalog management

---

## Migration Guide

To migrate from the original skill:

1. **Use foundation prompt first** - Establishes research baseline
2. **Execute sections in dependency order** - See dependency map
3. **Validate all outputs** - Use Zod schemas
4. **Track sources systematically** - Use SourceCatalog class
5. **Format output as needed** - JSON can convert to any format

---

## Known Limitations

- Section 4 may require fallback for companies with 5+ segments
- Analyst quote enforcement depends on manual verification
- Geography focus requires prompt adherence (cannot enforce programmatically)
- Private company data limited vs public company filings

---

## Future Enhancements

Potential additions for future versions:

- [ ] Automated Word document generation from JSON
- [ ] PDF generation with custom styling
- [ ] Additional sections (SWOT analysis, risk matrix, etc.)
- [ ] Multi-geography comparison mode
- [ ] Historical trend tracking (year-over-year)
- [ ] Integration with data providers (Bloomberg, FactSet)
- [ ] LLM-agnostic prompt adaptation
- [ ] Automated source verification

---

## Credits

Original skill concept: Company Intelligence Sheet generation  
Modular system design: December 2024 development session  
Implementation: TypeScript + Claude Sonnet 4.5 + Anthropic API

---

## Version History

- **1.0.0** (December 2, 2024) - Initial modular system release
