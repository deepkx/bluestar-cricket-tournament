#!/usr/bin/env bash
# Opens Vercel import for Supabase-hosted frontend (see DEPLOY.md).
set -euo pipefail
REPO="https://github.com/deepkx/bluestar-cricket-tournament"
echo "Vercel (Root Directory: frontend, Supabase env vars — see DEPLOY.md):"
echo "  https://vercel.com/new/import?s=${REPO}"
echo ""
if command -v open >/dev/null; then
  open "https://vercel.com/new/import?s=${REPO}"
fi
