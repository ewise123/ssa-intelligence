# SSA Intelligence

SSA Intelligence is a full-stack system for generating executive research briefs with report-type aware prompting and a frontend workspace.

## Repository layout
- `backend/`: Express API, orchestration, prompts, Prisma schema
- `frontend/`: Vite + React UI
- `docs/`: product and system documentation (see `docs/prompting/README.md`)
- `research-guides/`: section-level research guides (docx/js)
- `artifacts/`: historical logs and run outputs

## Quick start (development)
### Backend
```
cd backend
npm install
cp .env.example .env
# Set ANTHROPIC_API_KEY, DATABASE_URL, and CORS_ORIGIN
npm run docker:up
npm run db:generate
npm run db:push
npm run dev
```

### Frontend
```
cd frontend
npm install
npm run dev
```

Defaults:
- Backend: http://localhost:3000
- Frontend: http://localhost:5176

## Docs
Start here:
- `docs/prompting/README.md`
- `docs/authentication.md`
- `docs/RESEARCH-BRIEF-GUARDRAILS.md`
- `docs/storage-overview.md`
- `TODO.md`

## Changelog
- `CHANGELOG.md`
