# Changelog

All notable changes to this repository will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [Unreleased]

### Fixed
- Remove `z-10` from content wrapper in Layout that created a stacking context trapping modals behind the header and sidebar.
- Add `backdrop-blur-sm` to Prompt Library edit modal overlay to match the rest of the app.
- Render all modals and toasts via React portals to `document.body` so backdrop blur covers the full viewport including the sticky header.
- Add missing `backdrop-blur-sm` to UserAddModal, UserEditModal, and CompanyResolveModal overlays.
- Center company reports modal vertically instead of top-aligned.

### Changed
- Replace ShaderGradient hero background with React Bits Threads animation (OGL-based WebGL) — white animated threads on brand-700 with mouse interaction.
- Remove `@shadergradient/react`, `@react-three/fiber`, `three`, `three-stdlib`, `camera-controls`, and `@types/three` dependencies; add `ogl`.
- Add Dependabot with weekly grouped version updates for backend, frontend, and GitHub Actions; high/medium-risk deps (Prisma, Playwright, Anthropic SDK, three.js ecosystem) excluded from groups for individual manual review.
- Skip changelog CI check for Dependabot PRs.
- Ignore major version bumps in Dependabot — only minor/patch PRs are opened automatically.
- Add Dependabot PR review instructions to CLAUDE.md, AGENTS.md, and CONTRIBUTING.md — LLM agents must review every Dependabot PR before merge.
- Skip CodeRabbit automatic reviews on Dependabot PRs (`.coderabbit.yaml`).
- Update Playwright Docker base image from v1.57.0 to v1.58.2 to match the bumped library version.
- Remove unused `backend/Dockerfile` — production uses the root `Dockerfile` via Render.
- Remove stale `backend` service from `docker-compose.yml` (referenced deleted Dockerfile); postgres and redis services remain for local dev.

### Refactored
- Add `vite-env.d.ts` and remove all `(import.meta as any)` casts across 12 frontend files — uses Vite's built-in `ImportMeta` types instead.

## [1.1.1] - 2026-02-12

### Changed
- Rename admin "Bug Reports" page to "Research Failures" to distinguish from user-facing "Report Issue" feature.

## [1.1.0] - 2026-02-12

### Added
- Automatic bug report creation on permanent research stage failures — captures error details, category, severity, and sanitized context (`backend/src/services/bug-report.ts`).
- Admin bug reports dashboard (`#/admin/bugs`) with summary cards, filter bar, paginated table, detail modal with status management and resolution notes.
- AI-agent-queryable endpoint (`GET /api/admin/bug-reports/agent-query`) with fingerprint grouping, pattern detection, and suggested actions per error category.
- Invite-only access system — new users default to PENDING status; super-admin can generate invite links; users accept invites to become ACTIVE; frontend gates pending users with activation page.
- Super-admin role (SUPER_ADMIN_EMAIL env var) with dedicated middleware guard for user/group/invite management.
- News Intelligence module: multi-layer news fetching (RSS/API + AI search), article pinning, bulk archive, PDF/Markdown export, deep dive search with company name resolution.
- Admin activity dashboard with engagement metrics, filters, and analytics.
- User activity tracking (article opens, link clicks, page views, exports).
- User call diet configuration replacing revenue-owner model.

### Fixed
- DotGrid background canvas no longer overlaps interactive page content on non-dashboard tabs.
- Frontend loading-state gate prevents app shell flash for pending users.
- News integration tests use admin auth to match route middleware requirements (requireAdmin, articleUsers scoping).
- Add Invite table to test truncateAll() to prevent FK constraint failures.
- Remove stale `migrate resolve --rolled-back` hack from Dockerfile CMD.
- Add missing migration to replace RevenueOwner-based junction tables with User-based tables (fixes production 500s on all `/api/news/*` endpoints).
- Layout overflow causing content clipping at viewport bottom.
- Security: non-admin users can no longer view other users' articles via `?userId=` query param.
- Security: batch PDF/Markdown export endpoints now verify article access for non-admin users (403 on unauthorized IDs).
- Duplicate pins router mount that shadowed other `/api/news/*` routes.
- Initial unscoped fetch in NewsDashboard for non-admin users.
- PDF export: corrupt logo, empty all-articles export, text overlap issues.
- Integration test `db-helpers.ts` updated for renamed/removed Prisma models.

### Changed
- `clear-news-data.sql` updated with current table references and wrapped in transaction.
- Activity tracker fetch fallback now includes `credentials: 'include'` and logs 401 errors.

### Security
- Replace predictable CUID invite tokens with cryptographically secure `crypto.randomBytes(32)`.
- Fix race condition on invite acceptance with conditional `updateMany` inside interactive transaction.
- Tighten dev-fallback/impersonation guard from `NODE_ENV !== 'production'` to explicit `NODE_ENV === 'development' || DEV_MODE === 'true'`.
- Redact invite tokens from list response for used/expired invites.

### Refactored
- Extract shared domain-validation helpers to `backend/src/lib/domain-validation.ts`.

### UI
- Animated dot grid background with periodic wave animation.
- Conic gradient rotating border on "Start New Research" button.
- Sidebar scrollbar auto-hides when not actively scrolling.
- Improved header transparency, z-index layering, remove bottom border.
- Stacked date display and minimum card height on research dashboard cards.

## [1.0.0] - 2026-02-10
- Fix: reorder GENERIC report blueprint sections to match standard INDUSTRIALS ordering — Appendix and Sources now appears last instead of 4th from last.
- Test: add integration tests for 8 API route handlers (~59 tests) using supertest against a real PostgreSQL test database; extract Express app from server startup for testability; add separate CI job with PostgreSQL service container.
- Test: add Vitest testing framework to backend and frontend, migrate 12 existing test files, add CI workflow for automated test runs on PRs.
- Fix: show "Analysis Cancelled" state on ResearchDetail instead of stuck "Researching..." spinner when a job is cancelled.
- Feat: always show company resolve confirmation modal before starting research — exact matches get a green checkmark "Confirm company" prompt; multi-suggestion and corrected results keep existing disambiguation UI.
- Docs: add project context, architecture, and coding standards to CLAUDE.md and AGENTS.md.
- Fix: (P2-20) expose `loading` state from `useResearchManager` so Home page shows a spinner during initial fetch instead of flashing "No research yet".
- Fix: add Escape key handler to UserEditModal and NewsSetup edit modals for full keyboard accessibility.
- Chore: remove unused `ArrowRight` and `MapPin` imports from Home.tsx.
- Fix: (P3-3) lift logo token config fetch from Home to App level to avoid redundant API call on every mount.
- Fix: (P3-4) add backdrop click-to-close on Edit Company and Edit Person modals in NewsSetup.
- Fix: (P3-5) add backdrop click-to-close on UserEditModal.
- Fix: (P3-6) replace all `console.error` calls with structured `logger` utility across 9 frontend files.
- Fix: (P3-7) add ARIA checkbox roles, `aria-checked`, and `aria-label` to custom checkboxes in NewsSetup for screen reader accessibility.
- Fix: (P3-8) add keyboard accessibility (tabIndex, Space/Enter handler) to topic toggle rows in NewsSetup.
- Fix: (P3-10) add runtime type guard to AdminMetrics Tooltip formatter to handle non-numeric values.
- Fix: (P2-6) add content validation guards for 6 additional stages in `ensureStageHasContent` (financial_snapshot, company_overview, peer_benchmarking, recent_news, conversation_starters, key_execs_and_board).
- Fix: (P2-18) replace all 21 `window.confirm`/`window.alert` calls with `ConfirmDialog` and `Toast` components across 6 pages.
- Fix: (P2-19) add pagination to news articles — `useNewsArticles` hook now supports page/pageSize with limit/offset query params; Previous/Next controls in News Dashboard.
- Fix: (P2-23) fix browser back showing stale data — `ResearchDetail` now calls `refreshJobDetail` on mount to fetch fresh data.
- Fix: (P2-27) fix news refresh TOCTOU race — use PG advisory lock (`pg_try_advisory_xact_lock`) for atomic check-and-set in refresh POST handler.
- Fix: add missing `key_execs_and_board` to `SECTION_DEPENDENCIES` in NewResearch.
- Fix: remove redundant `status !== 'completed'` check in narrowed branch in ResearchDetail.
- Fix: (P1-4) add 9 stage output columns to ResearchJob for PE/FS/Insurance report types so outputs are saved on the parent job and available as context for downstream stages.
- Fix: (P2-25) graceful shutdown — SIGTERM/SIGINT now wait for in-progress jobs to finish (up to 60s), close HTTP server, and disconnect DB before exiting.
- Fix: (P0) XSS escape all interpolated fields in news email HTML template.
- Fix: (P0) cancel button now soft-cancels jobs instead of hard-deleting, preserving audit trail.
- Fix: (P0) cancel no longer removes jobs from UI state immediately.
- Fix: add authMiddleware to all news API routes (previously unauthenticated).
- Fix: wire prompt resolver into orchestrator so published DB overrides take effect.
- Fix: cost tracking failures no longer crash research stages.
- Fix: eliminate double cost calculation in orchestrator.
- Fix: add DATABASE_URL startup guard.
- Fix: add `credentials: 'include'` to all frontend fetch calls for cross-origin auth.
- Fix: add AbortController cleanup for polling loops in researchManager and AdminPrompts.
- Fix: add onCancel prop to fallback route.
- Fix: duplicate detection now includes 'completed_with_errors' status.
- Fix: add onDelete SetNull to NewsArticle company/person/tag FKs.
- Fix: wrap Playwright browser in try/finally with 30s timeouts to prevent leaks.
- Fix: prompt injection boundary framing around user-supplied prompt context.
- Fix: stricter rate limit (5/15min) for anonymous feedback endpoint.
- Fix: support comma-separated CORS_ORIGIN for multi-origin deployments.
- Fix: sanitize PDF export filenames (strip special characters).
- Fix: auto-expand missing section dependencies instead of rejecting.
- Fix: add secondary stale check for running sub-jobs.
- Fix: remove redundant per-stage overallConfidence overwrite.
- Fix: generic single-element array unwrapping before schema validation.
- Fix: cap KPI metrics at 50 to prevent unbounded output.
- Fix: negative pricing rate validation.
- Fix: NaN pagination guards with fallback defaults.
- Fix: Unicode company name support (regex \\p{L}\\p{N}).
- Fix: escape parentheses in markdown export URLs.
- Fix: remove redundant setCurrentPath in navigate function.
- UI: add ErrorBoundary component wrapping main content.
- UI: add default style/icon/label for unknown status values in StatusPill.
- UI: pass jobId prop to ResearchDetail instead of hash parsing.
- UI: wrap fetchMetrics in useCallback with proper dependencies.
- Refactor: extract shared SECTION_NUMBER_MAP constant and safeErrorMessage/isPrismaNotFound utilities.
- Refactor: standardize error handling across all 12 API route handlers.
- Docs: add 5-domain QA audit findings and remediation summary.
- Refactor: remove string character limits from validation schemas (analyst quotes, conversation starters, distribution analysis).
- Feat: add `key_execs_and_board` core section with Board of Directors, C-Suite, and business unit leaders.
- Refactor: slim down `company_overview.key_leadership` to avoid duplication with new key_execs_and_board section.
- Refactor: consolidate FoundationOutput interface from individual prompt files into shared types.js.
- UI: add Insurance sections to Admin Prompt Library with shared FS & Insurance group.
- Feat: News Intelligence improvements - time period selection, Deep Dive enhancements, status filters.
- Feat: Add render.yaml for Render deployment with PostgreSQL.
- Fix: Make sent and archived article states mutually exclusive.
- Fix: Sent filter now correctly shows sent articles.
- Fix: Remove unused priority fields from news articles.
- UI: Add "All" option to news status filter.
- UI: Add revenue owner selection for Deep Dive search results.
- UI: Update email format to use "Link:" consistently.
- Fix: add `distribution_analysis` formatter for INSURANCE report PDF exports.
- Fix: add INSURANCE-specific KPIs to schema-only regeneration fallback path.
- Fix: increase company name resolver timeout from 5s to 15s to prevent premature timeouts.
- UI: disable prompt Test button (work in progress).
- Fix: prevent draft saves from archiving published prompts (caused fallback to code defaults).
- Fix: prevent revert from archiving published prompts (caused fallback to code defaults).
- Fix: resolvePrompt now composes base + addendum for report-type DB overrides.
- Fix: add validation for cacheReadRate/cacheWriteRate in pricing API.
- Fix: wrap pricing rate swap in transaction to prevent race conditions.
- Fix: prevent future-dated pricing rates from being applied.
- Fix: YTD cost now respects all filters (group, reportType, etc.).
- Fix: add NULLS NOT DISTINCT to prompt unique constraints (PostgreSQL 15+).
- Feat: add company name resolution with typo correction and disambiguation modal.
- Feat: add bug tracker modal with status management (submit, list, update, delete feedback).
- Docs: add prompting system guide and align existing documentation with current code.
- Docs: add oauth2-proxy auth summary and remove the legacy oauth2-proxy reference doc.
- Chore: enforce changelog updates via CONTRIBUTING, PR template, and CI check.
- Docs: add TODO tracker and link it from the README.
- Docs: populate TODO with current backlog items.
- UI: update app branding, sidebar labels/sections, and widen the left nav for the new title.
- Feat: Add CRUD functionality to Admin page
- Fix: decrement group member counts when deleting a user in the admin UI.
- Feat: add "Add User" functionality to Admin page with email domain validation.

## Release process
- When shipping a release, move the `[Unreleased]` bullets into a new section `## [X.Y.Z] - YYYY-MM-DD`.
- Keep a fresh, empty `[Unreleased]` section at the top for new changes.
- Use the release date when the version is cut (not per-commit).
