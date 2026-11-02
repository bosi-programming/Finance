#!/usr/bin/env bash
set -u
cd "$(git rev-parse --show-toplevel)"
wf=".github/workflows/e2e.yml"
if [ ! -f "$wf" ]; then
  echo "FAIL: $wf missing"
  exit 1
fi
if command -v actionlint >/dev/null 2>&1; then
  out="$(actionlint "$wf")"
else
  out="$(go run github.com/rhysd/actionlint/cmd/actionlint@latest "$wf" 2>/dev/null)"
fi
code=$?
if [ "$code" -ne 0 ] || [ -n "$out" ]; then
  echo "FAIL: actionlint exit $code"
  echo "$out"
  exit 1
fi
echo "PASS: T-02 workflow lints"
