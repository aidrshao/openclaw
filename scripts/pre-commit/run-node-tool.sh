#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ $# -lt 1 ]]; then
  echo "usage: run-node-tool.sh <tool> [args...]" >&2
  exit 2
fi

tool="$1"
shift

# Check if tool is actually present in node_modules
if [[ ! -f "$ROOT_DIR/node_modules/.bin/$tool" ]]; then
  echo "Warning: tool '$tool' not found in node_modules. Skipping local check (running in Docker?)" >&2
  exit 0
fi

if [[ -f "$ROOT_DIR/pnpm-lock.yaml" ]] && command -v pnpm >/dev/null 2>&1; then
  exec pnpm exec "$tool" "$@"
fi

if { [[ -f "$ROOT_DIR/bun.lockb" ]] || [[ -f "$ROOT_DIR/bun.lock" ]]; } && command -v bun >/dev/null 2>&1; then
  exec bunx --bun "$tool" "$@"
fi

if command -v npm >/dev/null 2>&1; then
  exec npm exec -- "$tool" "$@"
fi

if command -v npx >/dev/null 2>&1; then
  exec npx "$tool" "$@"
fi

echo "Warning: No package manager found. Skipping '$tool' check." >&2
exit 0
