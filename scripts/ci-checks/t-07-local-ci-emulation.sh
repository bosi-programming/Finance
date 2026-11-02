#!/usr/bin/env bash
set -u
cd "$(git rev-parse --show-toplevel)"
if ! CI=true SKIP_INSTALL_SIMPLE_GIT_HOOKS=1 pnpm install --frozen-lockfile; then
  echo "FAIL: pnpm install --frozen-lockfile"
  exit 1
fi
out="$(CI=true pnpm test:e2e 2>&1)"
code=$?
printf '%s\n' "$out"
if [ "$code" -ne 0 ]; then
  echo "FAIL: pnpm test:e2e exit $code"
  exit 1
fi
if ! printf '%s' "$out" | grep -Eq '(^|[^0-9])1 passed'; then
  echo "FAIL: expected '1 passed'"
  exit 1
fi
echo "PASS: T-07 local CI emulation green"
