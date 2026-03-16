FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/

RUN npm install

ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"

COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/dist ./packages/db/dist
COPY apps/api/dist ./apps/api/dist

RUN npx prisma generate --schema packages/db/prisma/schema.prisma

ENV NODE_ENV=production
EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --schema packages/db/prisma/schema.prisma && node apps/api/dist/main.js"]
