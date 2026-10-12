#!/usr/bin/env bash
# Deploy frontend to Vercel (Supabase backend — no Render/Java).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="https://github.com/deepkx/bluestar-cricket-tournament"

echo "=== Bluestar — Vercel + Supabase ==="
echo ""
echo "1) Import or open project in Vercel (Root Directory MUST be: frontend)"
echo "   ${REPO}"
echo "   https://vercel.com/new/import?s=${REPO}"
echo ""
echo "2) Environment variables (Production + Preview):"
echo "   VITE_SUPABASE_URL=https://oaxmvamgdfwtntanjwof.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=<anon eyJ… from Supabase → Settings → API>"
echo "   VITE_ADMIN_EMAIL=admin@bluestar.local"
echo ""
echo "3) Deploy, then smoke-test: /register → Admin → Approve → /teams"
echo ""
echo "Optional CLI (after: npx vercel login):"
echo "   cd frontend && npx vercel --prod"
echo ""

if command -v open >/dev/null; then
  open "https://vercel.com/new/import?s=${REPO}"
fi
