#!/usr/bin/env bash
set -u
cd "$(git rev-parse --show-toplevel)"
wf=".github/workflows/e2e.yml"
if [ ! -f "$wf" ]; then
  echo "FAIL: $wf missing"
  exit 1
fi
fail=0
if grep -Eq '1\.61|mcr\.microsoft\.com/playwright' "$wf"; then
  echo "FAIL: workflow hard-codes Playwright version or image"
  fail=1
fi
if grep -Eq 'pnpm@[0-9]' "$wf"; then
  echo "FAIL: workflow hard-codes pnpm version"
  fail=1
fi
version="$(pnpm exec playwright --version 2>/dev/null)"
if [ "$version" != "Version 1.61.1" ]; then
  echo "FAIL: playwright --version is '$version'"
  fail=1
fi
[ "$fail" -eq 0 ] && echo "PASS: T-06 browser version single-sourced"
exit "$fail"
