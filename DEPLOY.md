# 🚀 Deploy no Railway (sem Docker)

Guia passo-a-passo para subir o **SPD Gerência** no Railway usando Nixpacks (detecção automática, sem Docker).

---

## Pré-requisitos

- Conta no [Railway](https://railway.app) (login com GitHub)
- Repositório no GitHub

---

## Passo 1 — Criar o Projeto no Railway

1. Acesse [railway.app](https://railway.app) e clique em **New Project**
2. Selecione **Deploy from GitHub Repo**
3. Conecte sua conta GitHub e selecione o repositório `spd-gerencia`

---

## Passo 2 — Criar o Banco de Dados MySQL

1. No seu projeto Railway, clique em **+ New** → **Database** → **MySQL**
2. O Railway cria automaticamente as variáveis de conexão
3. Clique no serviço MySQL → aba **Variables** → copie o valor de `DATABASE_URL`

---

## Passo 3 — Configurar o Serviço da API

O serviço que foi criado automaticamente no Passo 1 será a API.

### 3.1 Build & Start Commands

Vá em **Settings** e configure:

| Campo             | Valor                       |
| ----------------- | --------------------------- |
| **Build Command** | `npm run build:railway:api` |
| **Start Command** | `npm run start:railway:api` |

### 3.2 Variáveis de Ambiente

Vá em **Variables** e adicione:

| Variável       | Valor                                  | Descrição                                             |
| -------------- | -------------------------------------- | ----------------------------------------------------- |
| `DATABASE_URL` | `${{MySQL.DATABASE_URL}}`              | Referência ao MySQL (Railway resolve automaticamente) |
| `JWT_SECRET`   | _(gere com `openssl rand -hex 32`)_    | Chave secreta para JWT                                |
| `PORT`         | `4000`                                 | Porta da API                                          |
| `NODE_ENV`     | `production`                           | Modo de produção                                      |
| `FRONTEND_URL` | _(URL do frontend, configurar depois)_ | Necessário para CORS                                  |

> 💡 **Dica**: para `DATABASE_URL`, use referência `${{MySQL.DATABASE_URL}}` para que o Railway resolva automaticamente o endereço interno.

---

## Passo 4 — Configurar o Serviço do Frontend

### 4.1 Criar novo serviço

1. Clique em **+ New** → **GitHub Repo** → selecione `spd-gerencia` novamente
2. Isso cria um **segundo serviço** no mesmo projeto

### 4.2 Build & Start Commands

Vá em **Settings** e configure:

| Campo             | Valor                                 |
| ----------------- | ------------------------------------- |
| **Build Command** | `npm run build:web`                   |
| **Start Command** | `npx serve apps/web/dist -s -l $PORT` |

> O `serve` é um servidor HTTP simples que serve arquivos estáticos. O flag `-s` habilita SPA mode (redireciona rotas para index.html).

### 4.3 Variáveis de Ambiente

Vá em **Variables** e adicione:

| Variável       | Valor                  | Descrição                        |
| -------------- | ---------------------- | -------------------------------- |
| `VITE_API_URL` | _(URL pública da API)_ | Endereço da API (**build-time**) |

> ⚠️ **Importante**: `VITE_API_URL` é injetada em **build-time** pelo Vite. Se mudar esse valor, precisa fazer re-deploy do frontend.

### 4.4 Instalar o `serve`

Adicione `serve` como dependência do frontend. Execute localmente:

```bash
npm --workspace apps/web install serve
```

---

## Passo 5 — Gerar Domínios Públicos

1. Clique em cada serviço → **Settings** → **Networking** → **Generate Domain**
2. Anote as URLs geradas (ex: `spd-api-production.up.railway.app`)
3. Atualize as variáveis cruzadas:
   - Na **API**: `FRONTEND_URL` = URL do frontend
   - No **Frontend**: `VITE_API_URL` = URL da API (precisa re-deploy)

---

## Passo 6 — Deploy!

Faça push para o GitHub. O Railway vai:

1. ✅ Detectar o Node.js automaticamente (Nixpacks)
2. ✅ Rodar `npm ci`
3. ✅ Executar o Build Command
4. ✅ Rodar as migrations do Prisma no startup da API
5. ✅ Iniciar os serviços

---

## Resumo das Variáveis

| Serviço | Variável       | Tipo           | Obrigatória |
| ------- | -------------- | -------------- | ----------- |
| API     | `DATABASE_URL` | Runtime        | ✅          |
| API     | `JWT_SECRET`   | Runtime        | ✅          |
| API     | `PORT`         | Runtime        | ✅          |
| API     | `NODE_ENV`     | Runtime        | ✅          |
| API     | `FRONTEND_URL` | Runtime        | ✅ (CORS)   |
| Web     | `VITE_API_URL` | **Build-time** | ✅          |

---

## Troubleshooting

### Build falha com erros de TypeScript

Os erros de tipo (Decimal vs number) são warnings — o build emite os arquivos JS mesmo assim. Se o Railway tratar como falha, verifique se o exit code está correto.

### CORS bloqueando requests

Verifique se `FRONTEND_URL` na API está configurado com a URL exata do frontend (incluindo `https://`).

### Frontend não encontra a API

Verifique se `VITE_API_URL` aponta para a URL pública da API. Lembre-se que precisa re-deploy do frontend se mudar essa variável.
