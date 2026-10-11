#!/usr/bin/env bash
# Run after: gh auth login && (optional) vercel login
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPO_NAME="${REPO_NAME:-bluestar-cricket-tournament}"
ADMIN_PW="${ADMIN_QUICK_PASSWORD:-0908}"

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI not signed in. Run: gh auth login"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
else
  git push -u origin main
fi

REPO_URL="$(gh repo view --json url -q .url)"
echo "GitHub: $REPO_URL"

echo ""
echo "=== Render (API + MySQL) ==="
echo "1. Open https://dashboard.render.com/blueprints"
echo "2. New Blueprint Instance → connect repo: $REPO_NAME"
echo "3. Set sync env vars when prompted:"
echo "   ADMIN_QUICK_PASSWORD=$ADMIN_PW"
echo "   CORS_ALLOWED_ORIGINS=(set after Vercel deploy — your https://….vercel.app)"
echo "4. Copy the bluestar-api public URL when live."
echo ""

if command -v vercel >/dev/null 2>&1 || npx vercel --version >/dev/null 2>&1; then
  echo "=== Vercel (frontend) ==="
  read -r -p "Render API URL (https://….onrender.com): " API_URL
  if [[ -n "$API_URL" ]]; then
    cd frontend
    npx vercel deploy --prod --yes \
      -e "VITE_API_BASE_URL=${API_URL%/}"
    cd "$ROOT"
    echo "Update Render CORS_ALLOWED_ORIGINS to your Vercel URL, then redeploy API."
  else
    echo "Skip Vercel CLI — import $REPO_URL in Vercel UI, root: frontend, env VITE_API_BASE_URL=<Render API URL>"
  fi
else
  echo "Install Vercel CLI: npm i -g vercel && vercel login"
fi
