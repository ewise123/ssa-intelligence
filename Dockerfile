# Multi-stage build for full app (backend + frontend)
# This does not change local dev; existing backend Dockerfile/docker-compose remain untouched.

# Playwright 1.57.0 validated via `npm run test:playwright` (browser launch smoke check).
FROM mcr.microsoft.com/playwright:v1.57.0-jammy AS backend-build
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend ./
# Generate Prisma client before build
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.57.0-jammy AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_PATH=/app/backend/dist/src

# Backend artifacts
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/package*.json ./backend/
COPY --from=backend-build /app/backend/prisma ./backend/prisma
COPY --from=backend-build /app/backend/prompts ./backend/prompts

# Frontend static build
COPY --from=frontend-build /app/frontend/dist ./frontend/dist


EXPOSE 3000

# Note: assumes backend handles serving the API (and optionally static frontend if configured in code)
CMD ["node", "/app/backend/dist/src/index.js"]
