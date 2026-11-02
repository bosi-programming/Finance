#!/usr/bin/env bash
set -u
cd "$(git rev-parse --show-toplevel)"
sha="${HEAD_SHA:-$(git rev-parse HEAD)}"
json="$(curl -sf "https://api.github.com/repos/bosi-programming/Finance/actions/runs?branch=main&event=push&head_sha=$sha")"
if [ -z "$json" ]; then
  echo "FAIL: GitHub API request failed"
  exit 1
fi
printf '%s' "$json" | SHA="$sha" node -e '
let s = "";
process.stdin.on("data", (c) => (s += c));
process.stdin.on("end", () => {
  const runs = (JSON.parse(s).workflow_runs || []).filter((r) => r.head_sha === process.env.SHA);
  if (runs.length === 0) {
    console.log(`FAIL: no Actions run for ${process.env.SHA}`);
    process.exit(1);
  }
  const r = runs[0];
  const errors = [];
  if (r.event !== "push") errors.push(`event ${r.event}`);
  if (r.head_branch !== "main") errors.push(`head_branch ${r.head_branch}`);
  if (r.conclusion !== "success") errors.push(`conclusion ${r.conclusion} status ${r.status}`);
  if (errors.length) {
    console.log(`FAIL: ${errors.join(", ")} ${r.html_url}`);
    process.exit(1);
  }
  console.log(`PASS: T-04 first push run green ${r.html_url}`);
});
'
