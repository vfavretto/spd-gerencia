FROM node:20-slim AS build

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/

RUN npm ci

COPY apps/api/ ./apps/api/
COPY packages/db/ ./packages/db/

ENV DATABASE_URL=mysql://root:root@localhost:3306/spd_gerencia
RUN npx prisma generate --schema packages/db/prisma/schema.prisma

RUN npm run build:db

RUN cd apps/api && npx tsc --project tsconfig.json; exit 0

RUN npx tsc-alias@1 -p apps/api/tsconfig.json

FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/ /app/

ENV NODE_ENV=production
EXPOSE 4000

WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
