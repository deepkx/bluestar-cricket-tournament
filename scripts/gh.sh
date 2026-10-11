#!/usr/bin/env bash
# gh cannot write ~/.config/gh because ~/.config is owned by root on this machine.
# Use a config dir in the home folder instead.
export GH_CONFIG_DIR="${GH_CONFIG_DIR:-$HOME/.gh-config}"
mkdir -p "$GH_CONFIG_DIR"
exec /opt/homebrew/bin/gh "$@"
