# Battleplan: Normalizar filtros e paginação de convênios

**ID:** BP-002
**Data:** 2026-06-10
**Status:** concluído

## Contexto e Objetivo

O backlog imediato registra a necessidade de **normalizar os filtros de convênios** (item "em andamento"). A análise do código atual revelou 3 inconsistências críticas que comprometem a manutenibilidade e a UX:

1. **Filtros desiguais entre `list` e `listLite`**: o método `listLite` suporta 8 filtros, enquanto `list` suporta apenas 3. Isso força o frontend a depender exclusivamente de `listLite` para listagens, mas `list` permanece incompleto para possíveis usos futuros.
2. **Sem validação de query params**: o endpoint `GET /convenios` recebe query strings diretamente do `req.query` sem validação Zod, abrindo brechas para tipos inválidos (ex: `valorMin=abc`).
3. **Paginação em memória**: o frontend pagina `slice`ando o array inteiro retornado pelo backend. Com o crescimento da base, isso se torna ineficiente.

### Objetivos
- Unificar os filtros de `list` e `listLite` para que ambos suportem os mesmos campos.
- Adicionar validação Zod para query params do endpoint `GET /convenios`, de forma **permissiva** (não gerar erro 400 para valores inválidos — usar `coerce` e defaults).
- Implementar paginação server-side no endpoint `GET /convenios`, seguindo o padrão já existente no módulo `auditoria`.
- Ajustar o frontend para consumir a resposta paginada e enviar parâmetros de paginação.

## Impacto Arquitetural (ADRs relacionados)

- **ADR-001** (Monorepo npm workspace com Clean Architecture) — alteração toca `dto`, `repositories`, `useCases` e `http` no módulo `convenios`, além do frontend.
- **ADR-002** (Prisma como ORM único) — paginação usa `skip`/`take` do Prisma; filtros usam `Prisma.ConvenioWhereInput`.

## [agent: arquiteto] Decisões de Arquitetura

### 1. Contrato de paginação
Seguir o padrão do módulo `auditoria`:

```typescript
type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};
```

- `page`: número da página atual (1-based).
- `limit`: itens por página (default: 10, max: 100).

### 2. Estratégia de validação permissiva
Criar `ConvenioFiltersQuerySchema` com Zod usando `z.coerce` para tipos numéricos e `z.preprocess` para datas. Valores inválidos devem ser tratados como `undefined` (ignorados no filtro), nunca gerando erro 400 para o usuário. Isso evita regressão na UX.

### 3. Unificação dos filtros
Ambos `list()` e `listLite()` receberão o mesmo `ConvenioFilters` e aplicarão a mesma lógica de `where`. A diferença permanece apenas no `include/select` (relacionamentos pesados vs. leve).

### 4. Normalização de tipos
- `ConvenioFilters` terá `valorMin` e `valorMax` como `number | undefined`.
- O frontend enviará `string` nos inputs, mas o Zod `coerce` converte para `number`.
- `status` usará `z.enum(ConvenioStatus)` para garantir valores válidos.

## [agent: backend] Especificação Backend

### TASK-BE-01: Unificar lógica de filtros no `PrismaConvenioRepository`

**Arquivos:** `apps/api/src/modules/convenios/repositories/implementations/PrismaConvenioRepository.ts`

**Mudanças:**
- Extrair a construção do `where` de `listLite` para um método privado `buildWhere(filters)`.
- Aplicar `buildWhere` tanto em `listLite` quanto em `list`.
- Em `list`, adicionar os filtros faltantes: `esfera`, `modalidadeRepasseId`, `dataInicioVigencia`, `dataFimVigencia`, `valorMin`, `valorMax`.
- Garantir que `dataInicioVigencia` e `dataFimVigencia` usem `gte`/`lte` corretamente (igual ao `listLite`).
- Garantir que `valorMin`/`valorMax` usem `gte`/`lte` em `valorGlobal`.

### TASK-BE-02: Atualizar interface `ConvenioRepository`

**Arquivos:** `apps/api/src/modules/convenios/repositories/ConvenioRepository.ts`

**Mudanças:**
- Alterar `listLite` para retornar `PaginatedResult<ConvenioLite>`.
- Adicionar parâmetros `page?: number` e `limit?: number` ao `listLite`.
- Adicionar `page?: number` e `limit?: number` ao `list` (opcional, para manter compatibilidade).

### TASK-BE-03: Implementar paginação server-side

**Arquivos:** `apps/api/src/modules/convenios/repositories/implementations/PrismaConvenioRepository.ts`

**Mudanças:**
- Em `listLite`, usar `Promise.all` para `findMany` (com `skip`/`take`) e `count`.
- Retornar `PaginatedResult<ConvenioLite>`.
- Em `list`, aplicar a mesma lógica de paginação (opcional, para consistência).

### TASK-BE-04: Adicionar validação Zod para query params

**Arquivos:** `apps/api/src/modules/convenios/http/convenio.controller.ts`

**Mudanças:**
- Criar `ConvenioFiltersQuerySchema` no controller:

```typescript
const ConvenioFiltersQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['RASCUNHO', 'EM_ANALISE', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO']).optional(),
  secretariaId: z.string().optional(),
  esfera: z.enum(['FEDERAL', 'ESTADUAL']).optional(),
  modalidadeRepasseId: z.string().optional(),
  dataInicioVigencia: z.preprocess((arg) => arg === '' || arg === undefined ? undefined : new Date(arg as string), z.date().optional()),
  dataFimVigencia: z.preprocess((arg) => arg === '' || arg === undefined ? undefined : new Date(arg as string), z.date().optional()),
  valorMin: z.coerce.number().min(0).optional(),
  valorMax: z.coerce.number().min(0).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});
```

- Usar `ConvenioFiltersQuerySchema.parse(req.query)` no método `index`.
- Passar `page` e `limit` para `ListConveniosLiteUseCase`.

### TASK-BE-05: Atualizar `ListConveniosLiteUseCase`

**Arquivos:** `apps/api/src/modules/convenios/useCases/ListConveniosLiteUseCase.ts`

**Mudanças:**
- Receber `page` e `limit` nos parâmetros.
- Repassar para `repository.listLite(filters, page, limit)`.
- Retornar `PaginatedResult<ConvenioLite>`.

### TASK-BE-06: Atualizar `ListConveniosUseCase`

**Arquivos:** `apps/api/src/modules/convenios/useCases/ListConveniosUseCase.ts`

**Mudanças:**
- Receber `page` e `limit` opcionalmente.
- Repassar para `repository.list(filters, page, limit)`.
- Retornar `PaginatedResult<IConvenio>`.

### TASK-BE-07: Atualizar testes unitários

**Arquivos:** `apps/api/src/modules/convenios/__tests__/ListConveniosUseCase.test.ts`, `apps/api/src/modules/convenios/__tests__/ConvenioController.test.ts`

**Mudanças:**
- `ListConveniosUseCase.test.ts`: ajustar mocks para retornar `PaginatedResult`.
- `ConvenioController.test.ts`: adicionar teste para validação de query params (ex: `valorMin=abc` deve ser ignorado, não gerar erro).

## [agent: frontend] Especificação Frontend

### TASK-FE-01: Atualizar tipo `ConvenioFilters` no serviço

**Arquivos:** `apps/web/src/modules/convenios/services/convenioService.ts`

**Mudanças:**
- Alterar `valorMin` e `valorMax` para `number | undefined` (remover `string`).
- Adicionar `page?: number` e `limit?: number`.
- Ajustar a construção de `params` para converter `number` para `string` ao enviar para a API.

### TASK-FE-02: Atualizar `convenioService.list()` para resposta paginada

**Arquivos:** `apps/web/src/modules/convenios/services/convenioService.ts`

**Mudanças:**
- Alterar o retorno de `Promise<Convenio[]>` para `Promise<PaginatedResult<Convenio>>`.
- Ajustar o tipo de `Convenio` no `PaginatedResult` para refletir o `ConvenioLite` (que é o que a API retorna).
- Enviar `page` e `limit` como query params.

### TASK-FE-03: Atualizar `ConveniosListFilters` para enviar `number` em valores

**Arquivos:** `apps/web/src/modules/convenios/components/ConveniosListFilters.tsx`

**Mudanças:**
- Converter `event.target.value` para `Number` antes de chamar `onChange` para `valorMin` e `valorMax`.
- Se `value` for vazio, enviar `undefined` em vez de `''`.

### TASK-FE-04: Atualizar `ConveniosListaPage` para paginação server-side

**Arquivos:** `apps/web/src/modules/convenios/pages/ConveniosListaPage.tsx`

**Mudanças:**
- Remover a paginação em memória (`slice`, `totalPages` calculado no frontend).
- Usar `conveniosQuery.data?.data` para a lista e `conveniosQuery.data?.totalPages` para o paginador.
- Passar `page` e `limit` (10) para `convenioService.list()`.
- Manter `currentPage` no estado, mas agora ele reflete a página real do servidor.

### TASK-FE-05: Atualizar `useConveniosExport` (se necessário)

**Arquivos:** `apps/web/src/modules/convenios/hooks/useConveniosExport.ts`

**Mudanças:**
- Verificar se o export usa a lista completa. Se sim, precisamos de um endpoint separado ou carregar todas as páginas. **Decisão:** por ora, o export continuará usando os dados da página atual (ou adicionar um flag `?export=all` no futuro). **Não alterar no escopo deste BP.**

### TASK-FE-06: Atualizar testes do frontend

**Arquivos:** `apps/web/src/modules/convenios/services/__tests__/convenioService.test.ts`

**Mudanças:**
- Ajustar mocks para retornar `PaginatedResult`.
- Testar envio de `page` e `limit`.

## [agent: qa] Casos de Teste e Critérios de Aceite

### Testes de API (Jest)

| ID | Cenário | Entrada | Esperado |
|----|---------|---------|----------|
| QA-01 | Listar convênios com filtros unificados | `GET /convenios?status=EM_EXECUCAO&esfera=FEDERAL&valorMin=10000` | Retorna apenas convênios com status EM_EXECUCAO, esfera FEDERAL e valorGlobal >= 10000. |
| QA-02 | Paginação server-side | `GET /convenios?page=2&limit=5` | Retorna 5 itens, `page=2`, `totalPages` calculado corretamente. |
| QA-03 | Validação permissiva — valor inválido | `GET /convenios?valorMin=abc` | `valorMin` é ignorado (tratado como `undefined`), lista retorna normalmente sem erro 400. |
| QA-04 | Validação permissiva — data inválida | `GET /convenios?dataInicioVigencia=invalid` | `dataInicioVigencia` é ignorada, lista retorna normalmente. |
| QA-05 | Unificação de filtros em `list` | `GET /convenios?modalidadeRepasseId=xxx&dataFimVigencia=2025-12-31` | `listLite` e `list` (se chamado) aplicam os mesmos filtros. |
| QA-06 | Teste de regressão — listagem sem filtros | `GET /convenios` | Retorna primeira página com 10 itens (default). |
| QA-07 | Teste de regressão — exportação CSV/Excel | Paginação server-side ativa | Export ainda funciona com dados da página atual (ou é aceitável exportar apenas página). |

### Testes de Integração (Jest — controller)

| ID | Cenário | Critério |
|----|---------|----------|
| QA-08 | Controller ignora query params inválidos | `req.query` com `valorMin=abc`, `page=0`, `limit=999` | Zod aplica defaults/coerção; `page=1`, `limit=10`, `valorMin=undefined`. |
| QA-09 | Controller retorna estrutura paginada | `GET /convenios` | Resposta contém `data`, `total`, `page`, `totalPages`. |

### Testes de Frontend (Vitest)

| ID | Cenário | Critério |
|----|---------|----------|
| QA-10 | `convenioService.list` envia page/limit | `page=2, limit=10` | Query string contém `page=2&limit=10`. |
| QA-11 | `ConveniosListFilters` converte valores | Input `valorMin="5000"` | `onChange` recebe `valorMin: 5000` (number). |
| QA-12 | `ConveniosListaPage` renderiza paginação correta | `totalPages=5` na resposta | Componente `ConveniosListPagination` recebe `totalPages=5`. |
| QA-13 | Filtros aplicados refletem na query | Usuário seleciona status + secretaria | `useQuery` refetch com novos filtros + page resetado para 1. |

### Critérios de Aceite Gerais
- [x] `npm run test:api` passa sem regressões (100 testes, 26 suites).
- [x] `npm run test:web` passa sem regressões nos módulos afetados (12 testes de convenios). Falhas preexistentes em `date.test.ts` não relacionadas.
- [x] `npm run lint` passa sem erros.
- [x] `npm run build` passa sem erros.
- [x] Endpoint `GET /convenios` retorna `PaginatedResult` em vez de array puro.
- [x] Frontend exibe lista corretamente com paginação server-side.
- [x] Filtros existentes (status, secretaria, esfera, modalidade, datas, valores, search) continuam funcionando.
- [x] Valores inválidos em query params não geram erro 400.

## Execução e Resultados

**Data de conclusão:** 2026-06-10  
**Versão após merge:** v2.6.1

### Resumo
- Todos os 14 tarefas do grafo foram executadas com sucesso.
- Subagents `dev-backend` e `dev-frontend` não conseguiram persistir alterações diretamente; o Tech-lead assumiu a execução manual.
- Breaking change controlada: `GET /convenios` agora retorna `PaginatedResult<ConvenioLite>`. Consumidores atualizados: `ConveniosListaPage`, `CalendarioPage`, `SnapshotsSection`.
- Ajuste de tipo: `ConvenioFilters` agora aceita `Date | string` para campos de data, alinhando com a validação Zod que converte strings para `Date`.
- Compatibilidade com MySQL: removido `mode: 'insensitive'` do `Prisma.ConvenioWhereInput` (não suportado em MySQL); busca case-insensitive tratada via `toLowerCase()`.

### Artefatos alterados (13 arquivos)
- **API:** `ConvenioRepository.ts`, `PrismaConvenioRepository.ts`, `convenio.controller.ts`, `ListConveniosUseCase.ts`, `ListConveniosLiteUseCase.ts`, `ListConveniosUseCase.test.ts`, `ConvenioController.test.ts`
- **Web:** `convenioService.ts`, `ConveniosListFilters.tsx`, `ConveniosListaPage.tsx`, `CalendarioPage.tsx`, `SnapshotsSection.tsx`, `convenioService.test.ts`, `shared/types/index.ts`

## Grafo de Dependências e Paralelismo

| ID | Tarefa | Depende de | Agent | Pode paralelizar com |
|----|--------|-----------|-------|---------------------|
| TASK-01 | Definir `ConvenioFiltersQuerySchema` e `PaginatedResult` types | — | arquiteto | — |
| TASK-02 | Unificar `buildWhere` no `PrismaConvenioRepository` | TASK-01 | backend | — |
| TASK-03 | Alterar interface `ConvenioRepository` | TASK-01 | backend | TASK-02 |
| TASK-04 | Implementar paginação em `listLite` | TASK-02, TASK-03 | backend | — |
| TASK-05 | Implementar paginação em `list` | TASK-02, TASK-03 | backend | TASK-04 |
| TASK-06 | Atualizar `ListConveniosLiteUseCase` | TASK-04 | backend | — |
| TASK-07 | Atualizar `ListConveniosUseCase` | TASK-05 | backend | TASK-06 |
| TASK-08 | Adicionar validação Zod no controller | TASK-01 | backend | TASK-02 |
| TASK-09 | Atualizar testes backend | TASK-06, TASK-07, TASK-08 | qa | — |
| TASK-10 | Atualizar tipos e serviço frontend | TASK-01 | frontend | TASK-02 |
| TASK-11 | Atualizar `ConveniosListFilters` | TASK-10 | frontend | TASK-08 |
| TASK-12 | Atualizar `ConveniosListaPage` | TASK-10, TASK-11 | frontend | TASK-09 |
| TASK-13 | Atualizar testes frontend | TASK-10, TASK-12 | qa | — |
| TASK-14 | Rodar `lint`, `build`, `test` full | TASK-09, TASK-13 | qa | — |

## Notas de Execução

- **Nenhum schema de banco será alterado.** Não é necessário gerar migration.
- **A interface `ConvenioRepository` muda**, então todos os repositórios mockados em testes precisam ser atualizados.
- **A resposta do `GET /convenios` muda de `ConvenioLite[]` para `PaginatedResult<ConvenioLite>`**. Isso é uma breaking change na API, mas apenas o frontend interno consome este endpoint. Ajustar o frontend é obrigatório no mesmo PR.
- **Cuidado especial**: `z.coerce.number()` transforma `''` em `0`, o que é perigoso para `valorMin`. Usar `z.preprocess` para tratar `''` como `undefined` antes do `coerce`.
