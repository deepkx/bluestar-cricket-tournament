#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${TUNNEL_PORT:-8088}"
URL="http://127.0.0.1:${PORT}"

if ! curl -s -o /dev/null -w "%{http_code}" "$URL/" | grep -q 200; then
  echo "Nothing listening on $URL — start Docker first: ./scripts/host-docker.sh"
  exit 1
fi

BIN="${ROOT}/.tools/cloudflared"
mkdir -p "${ROOT}/.tools"
if [[ ! -x "$BIN" ]]; then
  echo "Downloading cloudflared…"
  ARCH="$(uname -m)"
  case "$ARCH" in
    arm64 | aarch64) CF=cloudflared-darwin-arm64.tgz ;;
    x86_64) CF=cloudflared-darwin-amd64.tgz ;;
    *) echo "Unsupported arch: $ARCH"; exit 1 ;;
  esac
  curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/${CF}" | tar xz -C "${ROOT}/.tools"
  mv "${ROOT}/.tools/cloudflared" "$BIN" 2>/dev/null || true
  chmod +x "$BIN"
fi

echo "Starting public HTTPS tunnel to $URL …"
echo "Press Ctrl+C to stop."
echo ""
exec "$BIN" tunnel --url "$URL"
