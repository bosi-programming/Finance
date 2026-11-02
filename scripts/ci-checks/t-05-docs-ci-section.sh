#!/usr/bin/env bash
set -u
cd "$(git rev-parse --show-toplevel)"
doc="docs/e2e-testing.md"
if [ ! -f "$doc" ]; then
  echo "FAIL: $doc missing"
  exit 1
fi
section="$(awk '/^## /{in_ci = ($0 == "## CI")} in_ci' "$doc")"
fail=0
if [ -z "$section" ]; then
  echo "FAIL: no ## CI section"
  exit 1
fi
for needle in ".github/workflows/e2e.yml" "push" "test-results"; do
  if ! printf '%s' "$section" | grep -qF "$needle"; then
    echo "FAIL: ## CI missing '$needle'"
    fail=1
  fi
done
if grep -qF "No CI runs this test yet" "$doc"; then
  echo "FAIL: stale 'No CI runs this test yet' present"
  fail=1
fi
if ! pnpm exec prettier --check "$doc" >/dev/null 2>&1; then
  echo "FAIL: prettier --check $doc"
  fail=1
fi
[ "$fail" -eq 0 ] && echo "PASS: T-05 docs CI section current"
exit "$fail"
