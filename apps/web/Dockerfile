# ==================================================
# Estagio 1: Instalar dependencias e compilar
# ==================================================
FROM node:20-slim AS build

WORKDIR /app

# Copiar arquivos de dependencia do monorepo
COPY package.json package-lock.json ./
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Instalar dependencias
RUN npm ci

# Copiar codigo-fonte do frontend
COPY apps/web/ ./apps/web/

# VITE_API_URL e injetado em build time pelo Vite
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=${VITE_API_URL}

# Criar .env na raiz (Vite envDir aponta para ../../)
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# Compilar o frontend (apenas vite build, sem tsc type-check)
RUN cd apps/web && npx vite build

# ==================================================
# Estagio 2: Servir com Nginx
# ==================================================
FROM nginx:alpine

# Remover configuracao padrao do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuracao customizada
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos estaticos do build
COPY --from=build /app/apps/web/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
