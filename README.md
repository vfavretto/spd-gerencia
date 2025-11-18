# Sistema de Gerenciamento Interno – Secretaria de Planejamento e Desenvolvimento (Votorantim)

Monorepo contendo o backend (Node.js + Express + Prisma), frontend (React + Vite + Tailwind) e pacote compartilhado de banco de dados para apoiar o acompanhamento de convênios, comunicados e agenda institucional da Prefeitura Municipal de Votorantim.

## Estrutura

```
.
├── apps
│   ├── api   # API REST (Express + Clean Architecture)
│   └── web   # Frontend React (Vite, Tailwind, React Query)
├── packages
│   └── db    # Schema Prisma e seed compartilhado
├── tsconfig.base.json
└── README.md
```

## Pré-requisitos

- Node.js 18+
- MySQL (local ou remoto)

## Configuração inicial

1. Copie o arquivo `.env.example` para `.env` na raiz e ajuste:

```bash
cp .env.example .env
```

2. Configure a string `DATABASE_URL` com as credenciais do MySQL.

3. Instale as dependências do monorepo:

```bash
npm install
```

4. Gere o cliente do Prisma e execute as migrations:

```bash
# Gera o client
npm --workspace packages/db run generate

# Executa migrations (ambiente dev)
npm --workspace packages/db run migrate:dev

# Popula dados base (usuário admin, catálogos e convênio exemplo)
npm --workspace packages/db run seed
```

> Usuário inicial (seed): `admin@votorantim.sp.gov.br` / `prefeitura2024`

## Scripts principais

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe banco (watch), API (porta 4000) e web (porta 5173) em paralelo |
| `npm run dev:api` / `npm run dev:web` | Executa apenas um dos aplicativos |
| `npm run build` | Compila pacote Prisma, API e frontend |
| `npm --workspace packages/db run migrate:dev` | Executa migrations no banco de desenvolvimento |
| `npm --workspace packages/db run seed` | Reinsere dados básicos |

## Funcionalidades

- **Autenticação** JWT com perfis de usuário
- **Dashboard** com indicadores de convênios, comunicados pendentes e próximos vencimentos
- **Registro e consulta de convênios** com filtros por status e secretaria
- **Calendário/Agenda** para reuniões, prestações de contas e eventos ligados aos convênios
- **Controle de comunicados internos** (entrada/saída) com vínculo aos convênios
- **Configurações** para secretarias, órgãos concedentes, programas e fontes de recurso

## Próximos passos sugeridos

- Implementar testes automatizados (unitários e e2e)
- Adicionar controle de permissões por perfil
- Integração com armazenamento de documentos (S3/MinIO)
- Deploy (Docker + CI/CD)

---

Secretaria de Planejamento e Desenvolvimento – Prefeitura de Votorantim.