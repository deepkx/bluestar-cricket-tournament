#!/usr/bin/env bash
# Optional one-time fix so gh can use the default ~/.config/gh path.
# Run in your terminal (will ask for your Mac password):
#   ./scripts/fix-gh-permissions.sh
set -euo pipefail
if [[ "$(stat -f '%Su' "$HOME/.config" 2>/dev/null || echo missing)" == "root" ]]; then
  echo "Fixing ownership of $HOME/.config (currently root)…"
  sudo chown -R "$(whoami):staff" "$HOME/.config"
  echo "Done. You can use plain 'gh auth login' now."
else
  echo "$HOME/.config is not root-owned; no fix needed."
fi
