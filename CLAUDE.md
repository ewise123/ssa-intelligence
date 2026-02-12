# Claude Code Instructions

## Project Overview

SSA Intelligence is an AI-powered research brief and news intelligence platform.
It generates structured company research reports using Claude and delivers curated
news digests via email. Multi-tenant with group-based visibility.

## Architecture

**Monorepo:** `backend/` (API + orchestrator) and `frontend/` (SPA).

**Backend** — Express 5 · TypeScript · Prisma ORM · PostgreSQL · Redis (optional) · Claude API
- Auth: proxy-header based (`x-forwarded-user`, `x-forwarded-groups`) via oauth2-proxy
- LLM orchestration: multi-stage pipeline that runs foundation → parallel sections → PDF export
- Background jobs: in-process queue with graceful shutdown (SIGTERM waits for running jobs)

**Frontend** — React 19 · Vite · Tailwind CSS · TypeScript
- Hash-based routing (`#/research`, `#/news`, `#/admin/*`)
- PDF export via server-side Playwright render
- No state management library; hooks + lifted state

**Database** — PostgreSQL 15+ with Prisma migrations (`backend/prisma/`)

## Key Patterns

- **Report blueprints** define section composition per report type (INDUSTRIALS, GENERIC, PE, FS, INSURANCE). See `backend/src/services/report-blueprints.ts`.
- **Orchestrator pipeline** (`backend/src/services/orchestrator.ts`): foundation fetch → dependency-ordered section generation → PDF export. Each stage writes output to the DB.
- **Prompt resolver** (`backend/src/services/prompt-resolver.ts`): loads code-default prompts with optional DB overrides (admin-published). Composes base + report-type addendums.
- **Multi-tenancy**: users belong to groups; research jobs and news entities have `visibility` (group-scoped or all). Auth middleware injects user/group context.
- **Cost tracking** (`backend/src/services/cost-tracking.ts`): logs token usage and cost per stage; supports configurable pricing rates.
- **Automatic bug reports** (`backend/src/services/bug-report.ts`): when a research stage permanently fails (retries exhausted), a structured `BugReport` record is auto-created with error classification, severity, fingerprint for dedup, and sanitized context. Query recent failures via `GET /api/admin/bug-reports/agent-query` (returns patterns, occurrence counts, and suggested actions). Use this endpoint to diagnose recurring research failures before investigating code.

## Dev Environment

```bash
cd backend  && npm run docker:up   # PostgreSQL on :5432
cd backend  && npm run dev          # API on :3000
cd frontend && npm run dev          # Vite on :5176
```

Copy `backend/.env.example` to `backend/.env` and fill in required values (DATABASE_URL, ANTHROPIC_API_KEY).

## Testing

```bash
cd backend && npm test              # unit tests only
cd backend && DATABASE_URL="postgresql://intellectra:intellectra_dev_password@localhost:5434/ssa_intelligence_test" \
  npm run test:integration          # integration tests (requires test DB)
```

Integration tests use a separate database (`ssa_intelligence_test`). The global setup (`src/test-utils/global-setup.ts`) enforces that `DATABASE_URL` contains `_test` as a safety guard. The test DB is auto-reset via `prisma db push --force-reset` before each run.

## Directory Guide

| Path | Purpose |
|------|---------|
| `backend/src/api/` | Express route handlers (research, news, admin, company, groups, feedback, bug-reports) |
| `backend/src/services/` | Core business logic — orchestrator, Claude client, cost tracking, PDF/markdown export, news fetcher |
| `backend/src/middleware/` | Auth middleware (proxy-header extraction + group resolution) |
| `backend/src/lib/` | Shared utilities — Prisma client, constants, error helpers, retry |
| `backend/src/types/` | TypeScript type definitions and Zod schemas |
| `backend/prompts/` | LLM prompt templates per section (foundation, exec-summary, financials, etc.) |
| `backend/prisma/` | Prisma schema, migrations, and seed scripts |
| `frontend/src/pages/` | Top-level page components (Home, NewResearch, ResearchDetail, NewsDashboard, NewsSetup, Admin*) |
| `frontend/src/components/` | Shared UI components (Layout, StatusPill, ConfirmDialog, Toast, ErrorBoundary, modals) |
| `frontend/src/services/` | API client hooks (researchManager, newsManager) |
| `docs/` | Architecture docs, prompt guides, report-blueprint specs, plans |

## Pull Requests
- Always read `.github/PULL_REQUEST_TEMPLATE.md` before creating a PR.
- PR title must follow: `type(scope): short summary`
- Use the template verbatim and do not remove sections.
- Always update CHANGELOG.md before creating a PR.

## Dependabot PR Review

Dependabot opens automated PRs for dependency updates every Monday. **Do not merge Dependabot PRs without an LLM agent review.** When asked to review a Dependabot PR:

1. Check that all CI checks pass.
2. Read the PR diff — confirm only `package.json` and `package-lock.json` changed.
3. For **grouped PRs** (title contains "the \<group\> group with N updates"):
   - Skim the list of bumped packages. Flag any that look risky (new major features, large changelogs).
   - If all are minor/patch with passing CI, approve.
4. For **individual carve-out PRs** (single package name in title):
   - These are high/medium-risk deps excluded from grouping. Read the package's release notes.
   - **Prisma**: Check for migration format changes or breaking generated types. After merge, `npx prisma generate` must be run.
   - **Playwright**: Browser binaries must match. After merge, `npx playwright install` is required.
   - **Anthropic SDK**: Check for response shape or method deprecation changes. Test the orchestrator pipeline.
   - Flag any concerns and do not approve if breaking changes are detected.
5. Security update PRs (from Dependabot security alerts) should be prioritized — review and approve promptly.
