# Battleplan: Exposição Externa + Hardening de Segurança

**ID:** BP-005
**Data:** 2026-06-09
**Status:** aprovado

---

## Contexto e Objetivo

O SPD-Gerência está fora do ar desde a saída do Railway. Precisamos:
1. **Reconstruir a infraestrutura** em VPS própria (Nginx, SSL, PM2).
2. **Escalar o acesso** para servidores de outras secretarias (Saúde, Educação, Cidadania) que não estão no prédio da prefeitura.
3. **Garantir segurança** para acesso externo, incluindo hardening do auth, rate limiting, headers de segurança e isolamento de dados.

**Regras de negócio:**
- Usuários externos terão os mesmos 4 papéis (`ADMIN`, `ANALISTA`, `ESTAGIARIO`, `OBSERVADOR`).
- Todos podem **ver** todos os convênios, mas só podem **editar** os da sua secretaria.
- Recuperação de senha é feita via **pedido ao setor de TI** (não automática).
- Infraestrutura VPS ainda **não está definida** — será pendência do setor de TI.

---

## Impacto Arquitetural

**Novo ADR proposto:** `ADR-005 — Multi-tenancy por secretaria com acesso global read-only`
**ADRs relacionados:** `ADR-004` (VPS própria) — precisa de evolução para incluir Nginx + SSL.

---

## Fase 1 — Hardening Mínimo para Exposição Externa (Must-have para ficar online)

| # | Tarefa | Descrição | Agent |
|---|--------|-----------|-------|
| 1.1 | **Multi-tenancy — modelo de dados** | Adicionar `orgao` (string) em `Usuario` e `Convenio` no Prisma schema. Adicionar `orgao` no DTO de criação/edição. | backend |
| 1.2 | **Multi-tenancy — filtros automáticos** | Em `listLite()` e `findById()`, incluir `orgao` nos filtros. Em mutations (create/update/delete), validar que `usuario.orgao === convenio.orgao` (exceto para `ADMIN` geral). | backend |
| 1.3 | **JWT → httpOnly cookies** | Mudar auth do Bearer token (sessionStorage) para `httpOnly`, `Secure`, `SameSite=Strict` cookies. Implementar refresh token rotation. | backend |
| 1.4 | **Token revocation** | Criar deny-list simples (Redis ou DB) para invalidar tokens no logout/desativação de usuário. | backend |
| 1.5 | **Rate limiting global** | Adicionar `express-rate-limit` em todas as rotas (não só login). Usar store Redis para escalabilidade. | backend |
| 1.6 | **CORS hardening** | Remover `null` origin do CORS. Configurar `origin` dinâmico via env vars (whitelist de domínios). | backend |
| 1.7 | **Helmet + CSP + HSTS** | Configurar `helmet()` com CSP explícito, HSTS, `crossOriginResourcePolicy`. | backend |
| 1.8 | **HTTPS enforcement** | Configurar `NODE_ENV=production` para redirecionar HTTP→HTTPS e setar HSTS headers. | backend |
| 1.9 | **DB TLS connection** | Adicionar `sslaccept=strict` na connection string do Prisma. | backend |
| 1.10 | **Security audit logging** | Estender `AuditService` para logar eventos de segurança: login sucesso/falha, token inválido, mudança de senha, alteração de role. | backend |
| 1.11 | **Frontend — cookies + logout** | Adaptar `api.ts` para enviar/receber cookies (`withCredentials: true`). Adaptar `authStorage.ts` para não usar sessionStorage. | frontend |
| 1.12 | **Frontend — filtros de orgão** | Adaptar telas de listagem e detalhe para mostrar badge de orgão. Garantir que campos de orgão apareçam em formulários de usuário. | frontend |

---

## Fase 2 — UX, Admin e Compliance

| # | Tarefa | Descrição | Agent |
|---|--------|-----------|-------|
| 2.1 | **Password reset via admin/TI** | Criar endpoint `POST /auth/reset-password` que só `ADMIN` pode chamar, passando `matricula` e nova senha. Logar no audit. | backend |
| 2.2 | **Admin dashboard — gestão de usuários externos** | Tela para listar usuários por orgão, ativar/desativar, redefinir senha. | frontend |
| 2.3 | **Política de senha reforçada** | Alterar Zod para exigir min 8 chars, maiúscula, número, especial. | backend |
| 2.4 | **Testes de segurança** | Testes de integração para: rate limit, cookie httpOnly, CORS, multi-tenancy, token revocation. | qa |

---

## Fase 3 — Infraestrutura (pendente definição do setor de TI)

| # | Tarefa | Descrição | Agent |
|---|--------|-----------|-------|
| 3.1 | **VPS setup** | Ubuntu, Nginx reverse proxy, SSL (Let's Encrypt), PM2. | arquiteto |
| 3.2 | **Firewall / WAF** | UFW/iptables, rate limit no Nginx, possível Cloudflare. | arquiteto |
| 3.3 | **Dependabot / npm audit** | CI/CD para rodar `npm audit` e bloquear builds com vulnerabilidades críticas. | qa |

---

## [agent: arquiteto] Decisões de Arquitetura

1. **ADR-005: Multi-tenancy por secretaria** — `orgao` como string simples (não tabela separada). Todos veem tudo, edição restringida por `orgao`.
2. **ADR-006: Autenticação stateless com cookies** — `httpOnly` + `Secure` + `SameSite=Strict`. Refresh token rotation via Redis.
3. **ADR-007: Rate limiting distribuído** — Redis store para `express-rate-limit`.
4. **ADR-008: Segurança por ambiente** — `NODE_ENV` controla CORS, headers, HTTPS.

---

## [agent: backend] Especificação Backend

**Módulos afetados:** `auth`, `convenios`, `usuarios`, `auditoria`, `configuracoes`.

**Endpoints novos:**
- `POST /auth/logout` — revoga refresh token.
- `POST /auth/refresh` — gera novo access token.
- `POST /auth/reset-password` — admin redefine senha de qualquer usuário.

**Middlewares novos:**
- `ensureOrgMatch` — verifica se usuário pode editar recurso daquele orgão.
- `securityAudit` — loga eventos de segurança.

**Schema Prisma:**
- `Usuario`: `+ orgao String`
- `Convenio`: `+ orgao String`

---

## [agent: frontend] Especificação Frontend

**Módulos afetados:** `auth`, `convenios`, `shared`, `configuracoes`.

**Alterações:**
- `authStorage.ts`: remove sessionStorage, passa a confiar em cookies.
- `api.ts`: `withCredentials: true`, remove header `Authorization` manual.
- `usePermissions.ts`: adicionar `canEditByOrg(convenioOrg: string)` — retorna true se `user.org === convenioOrg` ou `user.role === ADMIN`.
- `PermissionGate.tsx`: novo prop `orgMatch`.
- Páginas de listagem: coluna `orgao` visível.
- Páginas de formulário: campo `orgao` preenchido automaticamente (para não-ADMIN).

---

## [agent: qa] Casos de Teste e Critérios de Aceite

**Backend (Jest):**
- [ ] Usuário de `orgao: SAUDE` não consegue `PUT /convenios/:id` de `orgao: EDUCACAO`.
- [ ] Usuário `OBSERVADOR` não consegue `POST /convenios`.
- [ ] Rate limit bloqueia após 100 req/min por IP.
- [ ] Token expirado retorna 401, refresh token renova.
- [ ] Logout invalida refresh token.
- [ ] Admin pode resetar senha de outro usuário.
- [ ] Helmet envia CSP, HSTS, X-Frame-Options.

**Frontend (Vitest):**
- [ ] `usePermissions` retorna `false` para edição de convênio de outro orgão.
- [ ] `authStorage` não tenta ler sessionStorage.
- [ ] Cookie de auth é enviado automaticamente nas requisições.

---

## Grafo de Dependências e Paralelismo

| ID | Tarefa | Fase | Depende de | Agent | Pode paralelizar com |
|----|--------|------|------------|-------|----------------------|
| T-01 | Prisma schema + orgão | 1 | — | backend | T-02 |
| T-02 | Frontend auth cookies | 1 | — | frontend | T-01 |
| T-03 | Rate limiting + Helmet | 1 | — | backend | T-01 |
| T-04 | CORS + HTTPS config | 1 | — | backend | T-03 |
| T-05 | DB TLS | 1 | — | backend | T-03 |
| T-06 | Security audit logging | 1 | — | backend | T-04 |
| T-07 | JWT → cookies + refresh | 1 | T-02 | backend | T-06 |
| T-08 | Token revocation | 1 | T-07 | backend | — |
| T-09 | Multi-tenancy filters | 1 | T-01 | backend | T-08 |
| T-10 | Frontend org badge | 1 | T-01 | frontend | T-09 |
| T-11 | Admin reset password | 2 | T-07 | backend | T-12 |
| T-12 | Admin dashboard | 2 | T-10 | frontend | T-11 |
| T-13 | Strong password policy | 2 | T-11 | backend | T-12 |
| T-14 | Security tests | 2 | T-08 | qa | T-13 |
| T-15 | VPS setup | 3 | — | arquiteto | T-14 |

---

## 📋 Resumo do Escopo

| Item | Status |
|------|--------|
| Escopo (Fase 1 + 2 + 3) | ✅ Definido |
| Multi-tenancy por orgão | ✅ Definido |
| Auth com cookies + refresh | ✅ Definido |
| Infraestrutura VPS | ⏳ Pendente TI (Fase 3) |
| 2FA/MFA | ❌ Não incluso |
| Password reset automático | ❌ Não incluso (será via TI) |
