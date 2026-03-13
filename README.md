# SPD Gerência

Sistema interno da Secretaria de Planejamento e Desenvolvimento de Votorantim para gestão de convênios, agenda institucional, comunicados, execução contratual e trilha de auditoria.

Este repositório é um monorepo `npm workspaces` com três responsabilidades bem separadas:

- `apps/api`: API REST em Express + TypeScript, organizada por módulos de negócio.
- `apps/web`: SPA em React + Vite, também organizada por módulos de negócio.
- `packages/db`: schema Prisma, client compartilhado, conexão com banco, tipos de domínio e seeds.

O objetivo deste README é acelerar manutenção. Ele foca em como o sistema foi montado, onde cada regra costuma morar e quais efeitos colaterais precisam ser considerados antes de alterar código.

## Visão do sistema

O domínio central é `Convênio`. Quase todo o restante orbita esse agregado:

- `pendencias`: itens pendentes que influenciam status operacional.
- `contratos` e `medicoes`: execução contratual vinculada ao convênio.
- `aditivos`: alterações de prazo e valor.
- `fichasOrcamentarias`, `notasEmpenho` e `financeiro`: execução financeira.
- `emendas`: vínculo com origem parlamentar.
- `agenda`: eventos ligados ou não a convênios.
- `comunicados`: controle administrativo interno.
- `auditoria` e `snapshots`: rastreabilidade de alterações.

Em termos práticos:

1. O frontend consome a API em `/api`.
2. A API autentica com JWT e aplica autorização por perfil.
3. A API usa repositórios Prisma para ler/escrever MySQL.
4. O pacote `@spd/db` centraliza conexão, schema e tipos compartilhados.

## Monorepo e responsabilidades

```text
.
├── apps
│   ├── api         # Backend Express
│   └── web         # Frontend React
├── packages
│   └── db          # Prisma + client + tipos + seeds
├── .env.example
└── README.md
```

### `apps/api`

A API segue uma estrutura inspirada em Clean Architecture por módulo:

```text
apps/api/src/modules/<modulo>/
├── dto             # contratos de entrada/saída
├── http            # controller + rotas
├── repositories    # interface + implementação Prisma
├── services        # regras transversais ou derivadas
└── useCases        # casos de uso
```

Exemplo real: `convenios`

- `http/convenio.routes.ts`: define endpoints e autorização por perfil.
- `http/convenio.controller.ts`: valida entrada com `zod`, orquestra use cases, auditoria e snapshots.
- `useCases/*`: regra de aplicação isolada.
- `repositories/implementations/PrismaConvenioRepository.ts`: acesso ao banco e mapeamento Prisma -> domínio.
- `services/ConvenioStatusService.ts`: regra derivada de status.

Essa organização facilita manutenção porque a decisão de negócio costuma estar em `useCases` ou `services`, enquanto efeitos de IO ficam em `http` e `repositories`.

### `apps/web`

O frontend espelha o backend por domínio funcional:

```text
apps/web/src/modules/
├── auth
├── dashboard
├── convenios
├── agenda
├── comunicados
├── configuracoes
└── shared
```

Padrão esperado no frontend:

- `pages`: telas.
- `services`: chamadas HTTP.
- `components`: componentes específicos do módulo.
- `hooks` / `lib`: comportamento reutilizável dentro do módulo.
- `shared`: layout, utilitários, UI base, cliente HTTP e tipos compartilhados do frontend.

O fluxo principal de bootstrap é:

1. `src/main.tsx` cria o app.
2. `BrowserRouter` controla navegação.
3. `QueryClientProvider` habilita cache e sincronização de dados.
4. `AuthProvider` restaura sessão do `localStorage` e injeta token no Axios.
5. `AppRoutes` protege rotas privadas via `ProtectedRoute`.

### `packages/db`

Esse pacote é o ponto único de verdade para persistência:

- `prisma/schema.prisma`: modelos, enums e relações.
- `prisma/migrations/*`: histórico de evolução do banco.
- `src/connection.ts`: conexão Prisma.
- `src/types/*`: interfaces e enums exportados para API.
- `scripts/*`: seeds e utilitários de banco.

Na prática, a API depende de `@spd/db` para:

- abrir conexão com `connectDB()`;
- acessar `prisma`;
- reutilizar enums e interfaces de domínio;
- manter o contrato entre banco e backend consistente.

## Fluxo de requisição

### Login

1. O frontend envia matrícula e senha para `/api/auth/login`.
2. A API gera JWT.
3. `AuthProvider` salva usuário e token no storage.
4. `setAuthToken()` configura o header `Authorization` no Axios.
5. Requisições futuras passam pelo middleware `ensureAuthenticated`.

### Requisição autenticada

1. A rota entra por `apps/api/src/server.ts`.
2. Middlewares globais aplicam `cors`, `helmet`, `express.json` e `morgan`.
3. O roteador raiz está em `apps/api/src/modules/routes.ts`.
4. Tudo que não é `/auth` passa por `ensureAuthenticated`.
5. Algumas rotas também passam por `ensureRole(...)`.
6. O controller valida entrada, aciona use case e devolve resposta.
7. O repositório Prisma converte `Decimal` para `number` onde necessário.

## Mapa arquitetural da API

### Entrada da aplicação

- `apps/api/src/main.ts`: carrega env, conecta no banco e sobe o servidor.
- `apps/api/src/server.ts`: define middlewares globais e monta `/api`.
- `apps/api/src/modules/routes.ts`: agrega módulos e rotas aninhadas.

### Segurança

- Autenticação: JWT.
- Autorização: middleware `ensureRole`.
- Hardening HTTP: `helmet`.
- CORS restrito por `FRONTEND_URL` e localhost.
- Tratamento central de erros: `errorHandler`.

### Rotas principais

- `/api/auth`
- `/api/convenios`
- `/api/dashboard`
- `/api/comunicados`
- `/api/agenda`
- `/api/configuracoes`
- `/api/auditoria`

Rotas aninhadas importantes:

- `/api/convenios/:convenioId/emendas`
- `/api/convenios/:convenioId/financeiro`
- `/api/convenios/:convenioId/contratos`
- `/api/convenios/:convenioId/pendencias`
- `/api/convenios/:convenioId/aditivos`
- `/api/convenios/:convenioId/fichas-orcamentarias`
- `/api/convenios/:convenioId/notas-empenho`
- `/api/convenios/:convenioId/snapshots`
- `/api/contratos/:contratoId/medicoes`

## Regras de negócio que merecem atenção

### 1. Status de convênio não é apenas um campo manual

`ConvenioStatusService` deriva o status a partir do contexto:

- pendências abertas/em andamento empurram o convênio para análise;
- existência de contrato move o convênio para execução;
- estados terminais (`CONCLUIDO`, `CANCELADO`) não devem ser recalculados automaticamente.

Se alterar regras de pendência, contrato ou conclusão, revise essa derivação.

### 2. Atualização de convênio gera histórico

O módulo de convênios não apenas salva dados:

- antes de `update`, `concluir` e `cancelar`, ele gera snapshot;
- depois da alteração, registra auditoria;
- `create` e `delete` também geram auditoria.

Se você mexer em payload, serialização ou fluxo de alteração, preserve essa rastreabilidade.

### 3. Exclusão de convênio tem limpeza em cascata manual

`PrismaConvenioRepository.delete()` remove dependências explicitamente:

- medições,
- aditivos,
- contratos,
- pendências,
- fichas orçamentárias,
- notas de empenho,
- emendas,
- financeiro,
- anexos,
- snapshots,
- vínculo opcional em agenda.

Isso existe para evitar quebra por FK em ambientes com `RESTRICT`. Se criar uma nova entidade filha de convênio, a exclusão precisa ser revisada.

### 4. Valores monetários saem do Prisma como `Decimal`

A implementação Prisma converte vários campos para `number` antes de devolver para a aplicação. Ao incluir novas relações financeiras:

- adicione conversão no repositório;
- não exponha `Decimal` cru para controller/frontend;
- cubra o comportamento com teste.

### 5. Listagem e detalhe têm custos diferentes

No módulo de convênios já existe distinção intencional:

- `listLite()`: para telas de listagem, com payload enxuto;
- `findById()`: para detalhe completo com relacionamentos.

Se uma listagem ficar lenta, provavelmente a correção não é cache primeiro, e sim reduzir `include/select`.

## Mapa arquitetural do frontend

### Rotas

As rotas atuais ficam protegidas por layout autenticado:

- `/login`
- `/dashboard`
- `/convenios`
- `/convenios/cadastrar`
- `/convenios/:id`
- `/convenios/:id/editar`
- `/calendario`
- `/comunicados`
- `/configuracoes`

### Estado e comunicação

- Cliente HTTP: Axios em `modules/shared/lib/api.ts`.
- Cache e sincronização: React Query.
- Sessão: `AuthContext`.
- Redirecionamento por sessão expirada: interceptor Axios em caso de `401`.

Comportamento relevante:

- a URL base da API vem de `VITE_API_URL`;
- o frontend adiciona `/api` automaticamente;
- qualquer `401` fora do login limpa sessão e redireciona para `/login`.

## Modelo de dados em alto nível

Algumas entidades centrais do schema Prisma:

- `Usuario`
- `Convenio`
- `Secretaria`
- `OrgaoConcedente`
- `Programa`
- `ModalidadeRepasseCatalogo`
- `TipoTermoFormalizacaoCatalogo`
- `Pendencia`
- `ContratoExecucao`
- `Medicao`
- `Aditivo`
- `FichaOrcamentaria`
- `NotaEmpenho`
- `FinanceiroContas`
- `EventoAgenda`
- `Comunicado`
- `Auditoria`
- `ConvenioSnapshot`

Enums relevantes para manutenção:

- `UsuarioRole`
- `ConvenioStatus`
- `StatusPendencia`
- `TipoAditivo`
- `TipoFichaOrcamentaria`
- `TipoEmpenho`

Quando adicionar campo ou enum:

1. altere `schema.prisma`;
2. gere migration;
3. revise mapeamento do repositório Prisma;
4. revise DTOs e validações `zod`;
5. revise formulários e tabelas do frontend;
6. atualize seed se necessário.

## Como subir o ambiente

### Pré-requisitos

- Node.js 18+
- MySQL 8 ou `docker compose`

### Variáveis de ambiente

Use `.env.example` como base:

```bash
cp .env.example .env
```

Valores esperados:

```env
NODE_ENV=development
PORT=4000
JWT_SECRET=sua_chave_secreta_aqui
DATABASE_URL="mysql://spd_user:spd_pass@localhost:3306/spd_gerencia"
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=spd_gerencia
MYSQL_USER=spd_user
MYSQL_PASSWORD=spd_pass
VITE_API_URL=http://localhost:4000
FRONTEND_URL=http://localhost
```

### Bootstrap

```bash
npm install
docker compose up -d
npm run prisma:setup
npm run seed
npm run dev
```

Serviços esperados:

- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- Healthcheck: `http://localhost:4000/api/health`

## Scripts úteis

| Comando | Uso |
| --- | --- |
| `npm run dev` | Sobe DB watcher, API e Web em paralelo |
| `npm run dev:api` | Sobe apenas a API |
| `npm run dev:web` | Sobe apenas o frontend |
| `npm run prisma:setup` | Aplica migrations e gera Prisma Client |
| `npm run seed` | Popula usuário admin e dados base de convênios |
| `npm run build` | Build completo do monorepo |
| `npm run lint` | Lint em todos os workspaces |
| `npm run test` | Testes API + Web |
| `npm run prisma:studio` | Inspeção visual do banco via Prisma Studio |

## Como evoluir o sistema sem gerar dívida

### Nova feature de backend

Siga este fluxo:

1. crie ou escolha um módulo em `apps/api/src/modules`;
2. modele DTOs;
3. crie interface de repositório;
4. implemente use case;
5. implemente controller e rotas;
6. proteja com `ensureAuthenticated` e, se necessário, `ensureRole`;
7. adicione testes do módulo.

Pergunta obrigatória antes de abrir PR: essa alteração deveria gerar auditoria ou snapshot?

### Nova feature de frontend

Siga este fluxo:

1. crie a tela dentro do módulo correspondente em `apps/web/src/modules`;
2. concentre chamadas HTTP em `services`;
3. use React Query para leitura/mutação assíncrona;
4. deixe autenticação e redirecionamento com a infraestrutura já existente;
5. adicione teste se a regra de tela tiver comportamento relevante.

### Mudança de banco

Siga este fluxo:

1. altere `packages/db/prisma/schema.prisma`;
2. gere migration em `packages/db/prisma/migrations`;
3. rode `npm run prisma:generate` se necessário;
4. ajuste tipos compartilhados em `packages/db/src/types` se a mudança afetar o domínio exportado;
5. revise repositórios Prisma;
6. valide seeds.

## Convenções que já existem no projeto

- Módulos por contexto de negócio, não por tipo técnico global.
- Controllers validam entrada e orquestram casos de uso.
- Regras de negócio preferencialmente fora de controllers.
- Prisma concentrado em repositórios.
- Testes próximos aos módulos.
- Tipos compartilhados de domínio saem de `@spd/db`.

Se você mantiver esse padrão, a manutenção continua previsível. Se quebrar esse padrão em uma feature nova, documente a exceção no PR.

## Testes e validação

Comandos principais:

```bash
npm run lint
npm run test
npm run build
```

Execução focada:

```bash
npm --workspace apps/api run test -- --runInBand
npm --workspace apps/web run test -- --run
```

Priorize testes quando alterar:

- regras de status;
- filtros de listagem;
- mapeamentos de repositório;
- autenticação/autorização;
- serialização de valores monetários;
- auditoria e snapshots.

## Checklist de manutenção

Antes de considerar uma alteração pronta, verifique:

- a regra está no lugar certo (`useCase`, `service`, `repository` ou `page/service` no frontend)?
- a alteração afeta autorização por perfil?
- a alteração deveria gerar auditoria?
- a alteração deveria gerar snapshot?
- houve nova dependência relacional que impacta exclusão em cascata?
- algum `Decimal` novo precisa de conversão?
- migrations, seeds e testes continuam coerentes?

Se essa lista for seguida, a maior parte dos problemas de manutenção nesse sistema tende a aparecer cedo, e não em produção.
