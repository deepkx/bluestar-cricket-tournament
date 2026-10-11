#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.docker}"
if [[ ! -f "$ENV_FILE" ]]; then
  cp .env.docker.example "$ENV_FILE"
  echo "Created $ENV_FILE — edit secrets (JWT_SECRET, MYSQL_ROOT_PASSWORD, ADMIN_QUICK_PASSWORD), then run this script again."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

docker compose --env-file "$ENV_FILE" up -d --build

PORT="${HTTP_PORT:-8088}"
ORIGIN="${PUBLIC_ORIGIN:-http://localhost:${PORT}}"

echo ""
echo "Site:  http://localhost:${PORT}  (PUBLIC_ORIGIN for CORS: ${PUBLIC_ORIGIN})"
echo "Admin: open the site → Admin → password from ADMIN_QUICK_PASSWORD in $ENV_FILE"
echo ""
echo "Logs:  docker compose --env-file $ENV_FILE logs -f web api"
echo "Stop:  docker compose --env-file $ENV_FILE down"
