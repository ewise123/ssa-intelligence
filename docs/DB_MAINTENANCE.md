# Database maintenance checklist (Render)

Use this as a runbook for schema updates with Prisma on Render. It is written for a Codex agent but works for humans too.

## Prereqs
- In `backend/.env`, set `DATABASE_URL` to the Render Postgres connection string (include `sslmode=require`).
- Work from repo root unless noted.

## Commands

### 1) Check for duplicate normalized combos (for unique constraint)
```powershell
cd backend
npx prisma db execute --file prisma/find_duplicates.sql --schema prisma/schema.prisma
```
- If rows return, make one in each duplicate group unique (e.g., tweak `industry` to `'Historical duplicate'`) with an `UPDATE` via another `prisma db execute` call, then rerun the checker until it returns no rows.

### 2) Apply migrations
```powershell
cd backend
npx prisma migrate deploy --schema prisma/schema.prisma
```
- Only runs migrations against the DB in `DATABASE_URL`. Local data is untouched.

### 3) Optional: generate client (for local dev)
```powershell
cd backend
npx prisma generate --schema prisma/schema.prisma
```

## Notes
- Always take a Render DB backup before migrations.
- If `prisma migrate deploy` fails, resolve the reported issue (usually duplicates), then rerun.
- The Dockerfile uses the Playwright image; no extra steps are needed on Render for Chromium/PDF.***
