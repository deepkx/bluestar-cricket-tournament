#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
if [[ ! -f .env ]]; then
  echo "Copy backend/.env.example to backend/.env and configure it first."
  exit 1
fi
set -a
# shellcheck disable=SC1091
source .env
set +a
exec mvn spring-boot:run
