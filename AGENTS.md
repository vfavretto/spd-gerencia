# Repository Guidelines

## Project Structure & Module Organization
This repository is an npm workspace monorepo.
- `apps/api`: Express + TypeScript backend (Clean Architecture style by module).
- `apps/web`: React + Vite frontend.
- `packages/db`: shared Prisma schema, generated client, and seed scripts.
- `packages/db/prisma/migrations`: database migrations.
- `apps/*/src/**/__tests__` and `*.test.ts`: unit/integration tests.

Keep feature code grouped by module (for example `apps/api/src/modules/convenios/...`) and keep DTOs, repositories, use cases, and HTTP layers separated.

## Build, Test, and Development Commands
Run commands from repository root unless noted.
- `npm run dev`: starts DB package watcher, API, and Web in parallel.
- `npm run dev:api` / `npm run dev:web`: run only one app.
- `npm run build`: builds DB, API, and Web workspaces.
- `npm run lint`: runs lint in all workspaces.
- `npm run test`: runs API (Jest) and Web (Vitest) tests.
- `npm run prisma:setup`: deploys migrations + generates Prisma client.
- `npm run seed`: seeds admin user and convenios data.

## Coding Style & Naming Conventions
- Language: TypeScript across all packages.
- Indentation: 2 spaces; keep semicolon usage consistent with existing files.
- Follow ESLint rules in each workspace (`apps/api/.eslintrc.cjs`, `apps/web/eslint.config.js`).
- Naming:
  - Use `PascalCase` for classes/use cases/components.
  - Use `camelCase` for variables/functions.
  - Use descriptive suffixes like `*Repository`, `*UseCase`, `*DTO`, `*.controller.ts`.

## Testing Guidelines
- API uses **Jest**; Web uses **Vitest**.
- Test files: `*.test.ts` or `*.test.tsx`, preferably near the module under `__tests__`.
- Run focused tests with workspace scripts, for example:
  - `npm --workspace apps/api run test -- --runInBand`
  - `npm --workspace apps/web run test -- --run`
- Add or update tests when changing business rules, filters, mappings, and auth behavior.

## Commit & Pull Request Guidelines
Git history follows Conventional Commit style (`feat:`, `fix:`, `refactor:`, `chore:`).
- Use imperative, scoped messages when useful (example: `fix(api): normalize convenio filters`).
- Keep commits focused (one logical change per commit).
- PRs should include:
  - clear summary and motivation,
  - impacted modules/workspaces,
  - test evidence (`lint`, `build`, `test`),
  - screenshots for UI changes (`apps/web`).

## Security & Configuration Tips
- Never commit `.env` or secrets.
- Use `.env.example` as the baseline for required variables.
- Validate database-impacting changes with Prisma migrations in `packages/db/prisma/migrations`.
