# Repo Instructions for Coding Agents

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

## Dev Environment

```bash
cd backend  && npm run docker:up   # PostgreSQL on :5432
cd backend  && npm run dev          # API on :3000
cd frontend && npm run dev          # Vite on :5176
```

Copy `backend/.env.example` to `backend/.env` and fill in required values (DATABASE_URL, ANTHROPIC_API_KEY).

## Coding Standards

### TypeScript
- Strict mode enabled; never use `any`
- ESM imports (`import … from '…'`); use `.js` extensions in backend imports
- Prefer immutability — never mutate objects or arrays
- No `console.log` in production code; use the `logger` utility in frontend

### Backend (Express + Prisma)
- Validate all request inputs with Zod schemas
- Every route must use auth middleware (`backend/src/middleware/auth.ts`)
- Use parameterized queries only — never interpolate user input into SQL
- Wrap multi-table writes in `prisma.$transaction`
- Prevent N+1: use `include` to eager-load relations; select only needed fields
- Rate-limit sensitive endpoints
- Sanitize error messages — don't leak internals to clients

### Frontend (React + Tailwind)
- Components under 200 lines; extract sub-components when larger
- Always handle loading and error states
- Use semantic HTML and ARIA labels for accessibility
- Explicit prop types; no `any`

### Testing
- Arrange-Act-Assert pattern
- Test behavior, not implementation — tests should survive refactors
- Mock external dependencies (APIs, DB, file system)
- Target 80%+ code coverage

### Database
- Descriptive migration names; test rollback
- Add indexes for columns used in WHERE, ORDER BY, JOIN
- Select only the fields you need

## Git Conventions
- Conventional commits: `feat:`, `fix:`, `refactor:`, `perf:`, `chore:`, `docs:`, `test:`, `ci:`, `build:`
- Small, focused commits — one logical change per commit
- Never commit secrets or `.env` files

## Pull Requests
- Always read `.github/PULL_REQUEST_TEMPLATE.md` before creating a PR.
- PR title must follow: `type(scope): short summary`
  - Types: `feat` | `fix` | `refactor` | `perf` | `chore` | `docs` | `test` | `ci` | `build`
- Use the template verbatim and do not remove sections.
- Always update CHANGELOG.md before creating a PR.

## Dependabot PR Review

Dependabot opens automated dependency update PRs every Monday. **Humans should not merge these directly.** An LLM agent must review and approve every Dependabot PR before it is merged.

### Review checklist

1. **CI must pass.** Do not approve if any check is failing.
2. **Verify the diff is dependency-only** — only `package.json` and `package-lock.json` should change. Flag any unexpected source code changes.
3. **Grouped PRs** (title: "bump the \<group\> group in /\<dir\> with N updates"):
   - These batch minor/patch bumps for low-risk dependencies.
   - Skim the package list. If CI passes and nothing looks unusual, approve.
4. **Individual carve-out PRs** (title: "bump \<package\> from X to Y"):
   - These are high/medium-risk deps excluded from grouping. Extra scrutiny required.
   - Read the package's changelog/release notes for the version range being bumped.
   - **Prisma** (`@prisma/client`, `prisma`): Check for breaking generated types or migration format changes. Post-merge requires `npx prisma generate`.
   - **Playwright**: Browser binaries must match the library version. Post-merge requires `npx playwright install`. Test PDF export.
   - **Anthropic SDK** (`@anthropic-ai/sdk`): Check for response shape changes or deprecated methods. Test the orchestrator pipeline end-to-end.
   - **three.js ecosystem** (`three`, `@react-three/fiber`, `three-stdlib`, `camera-controls`, `@types/three`): These must be bumped in lockstep. If only one is bumped, do not approve — coordinate a combined upgrade.
   - Do not approve if breaking changes are detected. Leave a comment explaining the risk.
5. **Security PRs** (from Dependabot security alerts): Prioritize these. Review and approve promptly.

### What is excluded

- **Major version bumps** are ignored by Dependabot config. These require intentional migration work and should be handled as dedicated feature branches, not via Dependabot.
