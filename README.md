# Sistema de Gerenciamento Interno – Secretaria de Planejamento e Desenvolvimento (Votorantim)

Monorepo contendo o backend (Node.js + Express + Mongoose), frontend (React + Vite + Tailwind) e pacote compartilhado de banco de dados para apoiar o acompanhamento de convênios, comunicados e agenda institucional da Prefeitura Municipal de Votorantim.

## Estrutura

```
.
├── apps
│   ├── api   # API REST (Express + Clean Architecture)
│   └── web   # Frontend React (Vite, Tailwind, React Query)
├── packages
│   └── db    # Models Mongoose e seed compartilhado
├── tsconfig.base.json
└── README.md
```

## Pré-requisitos

- Node.js 18+
- MongoDB (local ou remoto)

## Configuração inicial

1. Copie o arquivo `.env.example` para `.env` na raiz e ajuste:

```bash
cp .env.example .env
```

2. Configure a string `MONGODB_URI` com as credenciais do MongoDB:

```
MONGODB_URI="mongodb://localhost:27017/spd_gerencia"
```

3. Instale as dependências do monorepo:

```bash
npm install
```

4. Compile o pacote de banco de dados e execute a seed inicial:

```bash
# Compila os models do Mongoose
npm --workspace packages/db run build

# Popula dados base (usuários, secretarias, convênios exemplo, etc.)
npm --workspace packages/db run seed
```

> Usuário inicial (seed): `admin@spd.gov.br` / `admin123`

## Scripts principais

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe banco (watch), API (porta 4000) e web (porta 5173) em paralelo |
| `npm run dev:api` / `npm run dev:web` | Executa apenas um dos aplicativos |
| `npm run build` | Compila pacote DB, API e frontend |
| `npm --workspace packages/db run seed` | Reinsere dados básicos |

## Funcionalidades

- **Autenticação** JWT com perfis de usuário (Administrador, Analista, Visualizador)
- **Dashboard** com indicadores de convênios, comunicados pendentes e próximos vencimentos
- **Registro e consulta de convênios** com filtros por status e secretaria
- **Calendário/Agenda** para reuniões, prestações de contas e eventos ligados aos convênios
- **Controle de comunicados internos** (entrada/saída) com vínculo aos convênios
- **Gestão financeira** com controle de contratos, medições e aditivos
- **Configurações** para secretarias, órgãos concedentes, programas e fontes de recurso

## Stack Tecnológica

### Backend
- **Node.js** + **Express** - API REST
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **TypeScript** - Tipagem estática

### Frontend
- **React** + **Vite** - SPA moderna
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado e cache
- **React Router** - Navegação

### Banco de Dados
- **MongoDB** - Banco NoSQL orientado a documentos

## Próximos passos sugeridos

- Implementar testes automatizados (unitários e e2e)
- Adicionar controle de permissões por perfil
- Integração com armazenamento de documentos (S3/MinIO)
- Deploy (Docker + CI/CD)

---

Secretaria de Planejamento e Desenvolvimento – Prefeitura de Votorantim.
