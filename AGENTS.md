# Repository Guidelines

## Project Structure & Module Organization

This repository is an **npm workspace monorepo** for the SPD internal management system (Secretaria de Planejamento e Desenvolvimento – Votorantim).

### Workspaces

| Workspace       | Stack                      | Purpose                                             |
|-----------------|----------------------------|------------------------------------------------------|
| `apps/api`      | Express + TypeScript       | Backend (Clean Architecture by module)               |
| `apps/web`      | React + Vite + TypeScript  | Frontend SPA                                         |
| `packages/db`   | Prisma (MySQL)             | Shared schema, generated client, seed scripts        |

### API Modules (`apps/api/src/modules/`)

`aditivos` · `agenda` · `auditoria` · `auth` · `comunicados` · `configuracoes` · `contratos` · `convenios` · `dashboard` · `emendas` · `fichasOrcamentarias` · `financeiro` · `medicoes` · `notasEmpenho` · `pendencias` · `snapshots`

Each module follows the pattern: `dto/` → `repositories/` → `useCases/` → `http/` (controller + routes).

### Web Modules (`apps/web/src/modules/`)

`agenda` · `auth` · `comunicados` · `configuracoes` · `convenios` · `dashboard` · `shared`

Shared utilities live under `shared/lib/` (`date.ts`, `format.ts`, `api.ts`) and reusable UI components under `shared/ui/`.

## Build, Test, and Development Commands

Run commands from the repository root unless noted.

| Command                    | Description                                           |
|----------------------------|-------------------------------------------------------|
| `npm run dev`              | Starts DB watcher, API, and Web in parallel           |
| `npm run dev:api`          | Run only the API                                      |
| `npm run dev:web`          | Run only the web app                                  |
| `npm run build`            | Builds DB → API → Web                                 |
| `npm run lint`             | Runs ESLint in all workspaces                         |
| `npm run test`             | Runs API (Jest) and Web (Vitest) tests                |
| `npm run test:api`         | Jest tests for the API only                           |
| `npm run test:web`         | Vitest tests for the web only                         |
| `npm run prisma:setup`     | Deploys migrations + generates Prisma client          |
| `npm run prisma:studio`    | Opens Prisma Studio for data inspection               |
| `npm run seed`             | Seeds admin user and convenios data                   |
| `npm run db:restore`       | Restores a Railway database dump locally              |
| `npm run build:railway:api`| Builds for Railway API deployment                     |
| `npm run start:railway:api`| Starts API in production (runs migrations first)      |

## Coding Style & Naming Conventions

- **Language**: TypeScript across all packages.
- **Indentation**: 2 spaces; consistent semicolon usage per workspace.
- **ESLint**: follow rules in `apps/api/.eslintrc.cjs` and `apps/web/eslint.config.js`.
- **Naming**:
  - `PascalCase` — classes, use cases, React components.
  - `camelCase` — variables, functions.
  - Suffixes: `*Repository`, `*UseCase`, `*DTO`, `*.controller.ts`, `*.routes.ts`.

## Testing Guidelines

- **API**: Jest — `npm --workspace apps/api run test -- --runInBand`
- **Web**: Vitest — `npm --workspace apps/web run test -- --run`
- Test files: `*.test.ts` / `*.test.tsx`, preferably near the module under `__tests__/`.
- Add or update tests when changing business rules, filters, mappings, and auth behavior.

## Commit & Pull Request Guidelines

Git history follows **Conventional Commit** style: `feat:`, `fix:`, `refactor:`, `chore:`.

- Use imperative, scoped messages (e.g., `fix(api): normalize convenio filters`).

- Keep commits focused — one logical change per commit.
- PRs should include:
  - Clear summary and motivation.
  - Impacted modules/workspaces.
  - Test evidence (`lint`, `build`, `test`).
  - Screenshots for UI changes (`apps/web`).

## Deployment

- **Railway**: API is deployed with `npm run build:railway:api` (build) and `npm run start:railway:api` (start, applies migrations).
- Database: MySQL on Railway; managed via Prisma migrations in `packages/db/prisma/migrations`.

## Security & Configuration

- Never commit `.env` or secrets.
- Use `.env.example` as the baseline for required variables.
- Validate database-impacting changes with Prisma migrations.
