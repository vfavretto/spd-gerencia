#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Arquivo .env nao encontrado na raiz do projeto. Copie .env.example para .env antes de continuar." >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root}"
MYSQL_DATABASE="${MYSQL_DATABASE:-spd_gerencia}"
MYSQL_USER="${MYSQL_USER:-spd_user}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-spd_pass}"

if [[ $# -ne 1 ]]; then
  echo "Uso: npm run db:restore -- <caminho-do-dump.sql|.sql.gz>" >&2
  exit 1
fi

DUMP_PATH="$1"

if [[ ! -f "$DUMP_PATH" ]]; then
  echo "Dump nao encontrado: $DUMP_PATH" >&2
  exit 1
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "Nem 'docker compose' nem 'docker-compose' estao disponiveis." >&2
  exit 1
fi

if ! command -v gzip >/dev/null 2>&1; then
  echo "O comando 'gzip' e necessario para suportar dumps .sql.gz." >&2
  exit 1
fi

cd "$ROOT_DIR"

echo "[restore] Subindo o servico mysql local..."
"${COMPOSE_CMD[@]}" up -d mysql >/dev/null

echo "[restore] Aguardando o MySQL aceitar conexoes..."
ATTEMPTS=0
until "${COMPOSE_CMD[@]}" exec -T \
  -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" \
  mysql \
  mysqladmin -uroot ping --silent >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [[ $ATTEMPTS -ge 30 ]]; then
    echo "MySQL local nao ficou pronto a tempo." >&2
    exit 1
  fi
  sleep 2
done

echo "[restore] Recriando o banco local '$MYSQL_DATABASE'..."
"${COMPOSE_CMD[@]}" exec -T \
  -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" \
  mysql \
  mysql -uroot -e "
    DROP DATABASE IF EXISTS \`$MYSQL_DATABASE\`;
    CREATE DATABASE \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';
    GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO '$MYSQL_USER'@'%';
    FLUSH PRIVILEGES;
  "

echo "[restore] Importando dump em '$MYSQL_DATABASE'..."
if [[ "$DUMP_PATH" == *.sql.gz ]]; then
  gzip -dc "$DUMP_PATH" | "${COMPOSE_CMD[@]}" exec -T \
    -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" \
    mysql \
    mysql -uroot "$MYSQL_DATABASE"
elif [[ "$DUMP_PATH" == *.sql ]]; then
  "${COMPOSE_CMD[@]}" exec -T \
    -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" \
    mysql \
    mysql -uroot "$MYSQL_DATABASE" < "$DUMP_PATH"
else
  echo "Formato invalido. Use um arquivo .sql ou .sql.gz." >&2
  exit 1
fi

echo "[restore] Dump restaurado com sucesso no MySQL local."
echo "[restore] Agora voce pode subir API e Web com '${COMPOSE_CMD[*]} up -d api web'."
