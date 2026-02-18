# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-slim AS build

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Copy workspace manifests for dependency resolution
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/

# 2) Install ALL dependencies (workspaces need the root install)
RUN npm ci

# 3) Copy source files
COPY apps/api/ ./apps/api/
COPY packages/db/ ./packages/db/

# 4) Generate Prisma client (needs a dummy URL at build time)
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN npx prisma generate --schema packages/db/prisma/schema.prisma

# 5) Build the shared db package, then the API
RUN npm run build:db
RUN cd apps/api && npx tsc --project tsconfig.json
RUN npx tsc-alias@1 -p apps/api/tsconfig.json

# ── Stage 2: Production ────────────────────────────────────────
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Copy workspace manifests
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/

# 2) Install production-only dependencies
RUN npm ci --omit=dev

# 3) Copy Prisma schema and regenerate client for production runtime
COPY packages/db/prisma ./packages/db/prisma
RUN npx prisma generate --schema packages/db/prisma/schema.prisma

# 4) Copy built artifacts only
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/apps/api/dist ./apps/api/dist

ENV NODE_ENV=production
EXPOSE 4000

WORKDIR /app/apps/api

# 5) Run database migrations on startup, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy --schema /app/packages/db/prisma/schema.prisma && node dist/main.js"]
