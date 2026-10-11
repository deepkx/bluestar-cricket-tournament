#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REPO_NAME="${REPO_NAME:-bluestar-cricket-tournament}"
GH="${GH:-/opt/homebrew/bin/gh}"

echo "Waiting for GitHub CLI login (complete https://github.com/login/device in your browser)…"
for i in $(seq 1 120); do
  if "$GH" auth status >/dev/null 2>&1; then
    echo "GitHub CLI authenticated."
    if "$GH" repo view "deepkx/$REPO_NAME" >/dev/null 2>&1; then
      git remote add origin "git@github.com:deepkx/${REPO_NAME}.git" 2>/dev/null || git remote set-url origin "git@github.com:deepkx/${REPO_NAME}.git"
      git push -u origin main
    else
      "$GH" repo create "$REPO_NAME" --public --source=. --remote=origin --push
    fi
    "$GH" repo view --web
    exit 0
  fi
  sleep 5
done
echo "Timed out waiting for gh auth. Run: gh auth login"
exit 1
