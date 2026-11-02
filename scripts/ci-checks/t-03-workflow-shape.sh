#!/usr/bin/env bash
set -u
cd "$(git rev-parse --show-toplevel)"
wf=".github/workflows/e2e.yml"
if [ ! -f "$wf" ]; then
  echo "FAIL: $wf missing"
  exit 1
fi
fail=0
check() {
  if ! grep -Eq "$2" "$wf"; then
    echo "FAIL: $1"
    fail=1
  fi
}
check "push trigger" '^[[:space:]]*push:'
check "branches main" '^[[:space:]]*branches:[[:space:]]*\[[[:space:]]*main[[:space:]]*\]'
check "workflow_dispatch" '^[[:space:]]*workflow_dispatch:'
check "SKIP_INSTALL_SIMPLE_GIT_HOOKS env" "^[[:space:]]*SKIP_INSTALL_SIMPLE_GIT_HOOKS:[[:space:]]*['\"]1['\"]"
if grep -Eq '^[[:space:]]*pull_request' "$wf"; then
  echo "FAIL: pull_request trigger present"
  fail=1
fi
install_line="$(grep -nE 'run:[[:space:]]*pnpm exec playwright install --with-deps chromium' "$wf" | head -1 | cut -d: -f1)"
e2e_line="$(grep -nE 'run:[[:space:]]*pnpm test:e2e' "$wf" | head -1 | cut -d: -f1)"
if [ -z "$install_line" ]; then
  echo "FAIL: no playwright install step"
  fail=1
fi
if [ -z "$e2e_line" ]; then
  echo "FAIL: no pnpm test:e2e step"
  fail=1
fi
if [ -n "$install_line" ] && [ -n "$e2e_line" ] && [ "$install_line" -ge "$e2e_line" ]; then
  echo "FAIL: playwright install must come before pnpm test:e2e"
  fail=1
fi
[ "$fail" -eq 0 ] && echo "PASS: T-03 workflow shape"
exit "$fail"
