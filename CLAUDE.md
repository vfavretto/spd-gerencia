# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repository root unless noted.

```bash
# Development
npm run dev              # DB watcher + API + Web in parallel
npm run dev:api          # API only (http://localhost:4000)
npm run dev:web          # Web only (http://localhost:5173)

# Database
docker compose up -d mysql   # Start local MySQL
npm run prisma:setup     # Apply migrations + generate Prisma client
npm run seed             # Seed admin user + convenios base data
npm run prisma:studio    # Visual DB inspector

# Quality
npm run lint
npm run build
npm run test

# Run a single workspace's tests
npm --workspace apps/api run test -- --runInBand
npm --workspace apps/web run test -- --run

# Run a specific test file (API)
npm --workspace apps/api run test -- --testPathPattern="CreateConvenioUseCase"
```

**Local dev stack:** MySQL runs in Docker; API and Web run directly via `ts-node-dev` and Vite. Copy `.env.example` to `.env` before first run.

**Healthcheck:** `http://localhost:4000/api/health`

## Architecture

This is an npm workspaces monorepo:

- `apps/api` — Express + TypeScript backend (Clean Architecture per module)
- `apps/web` — React 19 + Vite SPA
- `packages/db` — Prisma schema, generated client, domain types, seeds; consumed as `@spd/db`

### API module layout

Each module under `apps/api/src/modules/<module>/` follows:

```
dto/          # Zod-validated input/output contracts
repositories/ # interface + implementations/Prisma*.ts
useCases/     # business logic, one class per operation
http/         # controller.ts (orchestrates) + routes.ts (registers + guards)
__tests__/    # unit tests close to the module
```

TypeScript path aliases (declared in `apps/api/tsconfig.json`):
- `@modules/*` → `src/modules/*`
- `@shared/*` → `src/shared/*`
- `@config/*` → `src/config/*`

Shared middleware lives in `apps/api/src/shared/`:
- `ensureAuthenticated` — JWT validation
- `ensureRole(role)` — role-based guard
- `asyncHandler` — wraps async controllers
- `AppError` — throw with HTTP status; `errorHandler` catches it

### Web module layout

Each module under `apps/web/src/modules/<module>/` follows:

```
pages/      # route-level components
services/   # Axios HTTP calls (all API access goes here)
components/ # module-specific UI
hooks/      # local hooks
lib/        # pure utilities for the module
```

Shared infrastructure (`apps/web/src/modules/shared/`):
- `lib/api.ts` — Axios instance; injects JWT header; redirects to `/login` on 401
- `lib/queryClient.ts` — React Query client
- `ui/` — shadcn-style primitives (Button, Dialog, Sheet, etc.)
- `hooks/usePermissions.ts` — role-aware permission checks
- `components/PermissionGate.tsx` — render-gate by role

Bootstrap order: `main.tsx` → `BrowserRouter` → `QueryClientProvider` → `AuthProvider` → `AppRoutes` → `ProtectedRoute`.

### Database package

`packages/db` is the single source of truth for persistence:
- `prisma/schema.prisma` — models, enums, relations
- `src/types/` — interfaces and enums re-exported for API consumption
- `src/connection.ts` — exports `prisma` client and `connectDB()`

Domain types shared between `packages/db` and `apps/api` come exclusively from `@spd/db`. Never duplicate them in the API.

## Critical business rules

**Status derivation** — `ConvenioStatusService` computes status from context (open pendencies → `EM_ANALISE`, linked contract → `EM_EXECUCAO`). Terminal states (`CONCLUIDO`, `CANCELADO`) are not recalculated. Changing pendency or contract logic requires reviewing this service.

**Audit + snapshot on every write** — The convenios controller generates a snapshot *before* update/conclude/cancel and writes an `Auditoria` record *after*. Create/delete also generate audit records. Always preserve this trail when changing the write flow.

**Cascade delete is manual** — `PrismaConvenioRepository.delete()` explicitly removes child entities (medicoes, aditivos, contratos, pendencias, fichas orçamentárias, notas de empenho, emendas, financeiro, anexos, snapshots, agenda link). Adding a new child entity requires updating this method.

**Decimal → number conversion** — Prisma returns monetary fields as `Decimal`. Repositories convert them to `number` before returning to the application layer. Any new financial relation must include this conversion; never expose `Decimal` to controllers or the frontend.

**Listagem vs. detalhe** — `listLite()` returns a lean payload for list views; `findById()` returns full relations for detail views. If a list becomes slow, reduce `include/select` before adding caching.

## Adding features

**New API feature:** create module dir → model DTOs (Zod) → repository interface → use case → controller + routes → guard with `ensureAuthenticated` / `ensureRole` → tests. Ask: should this generate audit or snapshot?

**New web feature:** add page under the domain module → HTTP calls in `services/` → React Query for async state → reuse `shared/ui/` primitives.

**Schema change:** edit `schema.prisma` → generate migration → `npm run prisma:generate` → update `packages/db/src/types/` if domain types change → update Prisma repository mappings → update Zod DTOs → update frontend forms/tables → update seed if needed.

## Commit style

Conventional Commits with module scope: `feat(api): ...`, `fix(web): ...`, `chore(db): ...`.

## Roles

`UsuarioRole`: `ADMIN` | `ANALISTA` | `ESTAGIARIO` | `OBSERVADOR`. Authorization is enforced per route via `ensureRole`.
