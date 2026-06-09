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

- **Status atual:** O sistema saiu do Railway e está **sem infraestrutura de produção**.
- **Próxima direção:** VPS própria (ver ADR-004 no second-brain).
- **Scripts antigos (Railway — obsoletos):** `npm run build:railway:api` e `npm run start:railway:api`.
- **TODO:** Criar novos scripts de deploy para VPS (PM2 + Nginx + SSL).
- Database: MySQL (provisoriamente local; será migrado para VPS).

## Development Philosophy & AI Agents

This project follows a structured development philosophy built on three pillars: a **second-brain** knowledge base, **SDD + TDD battleplanning**, and a **specialized agent team**.

### Second-Brain (Obsidian)

The project knowledge base lives in `/Documentos/SPD/SPD-Second-Brain` as an Obsidian vault.
- `SUMMARY.md` — condensed index (max 400 words) with current state, key decisions, and links
- `ADRs/` — Architecture Decision Records (ADR-001, ADR-002, ADR-003...)
- `architecture/`, `debt/`, `backlog/`, `decisions/`, `patterns/` — detailed notes
- Always updated via diff/append; never rewrite entire files without need

### Battleplan Workflow

1. **Planning** (`/planner` skill): spec-first planning with SDD + TDD. Produces a battleplan in `docs/battleplan/YYYY-MM-DD_<slug>.md`
2. **Execution** (`/dev-team` skill): specialized agents (arquiteto, tech-lead, dev-frontend, dev-backend, qa) execute the approved battleplan
3. **Retrospective** (`/retro` skill): closes the learning cycle, updates `SUMMARY.md`, and records patterns in `patterns/`

### Agent Team

| Agent | Role | Scope |
|-------|------|-------|
| `arquiteto` | Architectural guardian | ADRs, contracts, diagrams — no code |
| `tech-lead` | Senior dev orchestrator | Task distribution, handoff review, SUMMARY updates |
| `dev-frontend` | Frontend specialist | React/Vite/TS/UI — only `[agent: frontend]` sections |
| `dev-backend` | Backend specialist | Express/Prisma/TS — only `[agent: backend]` sections |
| `qa` | Quality & testing | Jest/Vitest/TDD — only `[agent: qa]` sections |

### Context Efficiency Protocol

- Lazy load second-brain: always start with `SUMMARY.md`, load full notes only on demand
- Battleplan sections are tagged with `[agent: X]` — each agent loads only their tagged sections
- Reference specs/ADRs by ID (`ADR-003`, `SPEC-012`) — never repeat content
- Handoffs between agents use compact YAML schema
- Agents output without preamble; updates use diffs

### Commands

- `opencode spd` — quick project overview
- `opencode plan` — start a new battleplan
- `opencode execute` — execute an approved battleplan
- `opencode retro` — run a retrospective

## Security & Configuration

- Never commit `.env` or secrets.
- Use `.env.example` as the baseline for required variables.
- Validate database-impacting changes with Prisma migrations.
