# Playwright-ready Dockerfile for SSA Intelligence Backend

# Stage 1: Dependencies (Playwright base image includes Chromium and deps)
# Playwright 1.57.0 validated via `npm run test:playwright` (browser launch smoke check).
FROM mcr.microsoft.com/playwright:v1.57.0-jammy AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Builder
FROM mcr.microsoft.com/playwright:v1.57.0-jammy AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 3: Production
FROM mcr.microsoft.com/playwright:v1.57.0-jammy AS runner
WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Copy necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prompts ./prompts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Generate Prisma Client in production
RUN npx prisma generate

# Use non-root user (already present in Playwright base)
USER pwuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
