#!/usr/bin/env bash
# Opens one-click deploy pages (you must sign in to Render / Vercel in the browser).
set -euo pipefail
REPO="https://github.com/deepkx/bluestar-cricket-tournament"
echo "Render (API + MySQL blueprint):"
echo "  https://render.com/deploy?repo=${REPO}"
echo ""
echo "Vercel (frontend — set Root Directory to frontend, env VITE_API_BASE_URL = Render API URL):"
echo "  https://vercel.com/new/import?s=${REPO}"
echo ""
if command -v open >/dev/null; then
  open "https://render.com/deploy?repo=${REPO}"
  sleep 1
  open "https://vercel.com/new/import?s=${REPO}"
fi
