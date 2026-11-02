#!/usr/bin/env bash
set -u
cd "$(git rev-parse --show-toplevel)"
fail=0
url="$(git remote get-url origin)"
if [ "$url" != "git@github.com:bosi-programming/Finance.git" ]; then
  echo "FAIL: origin url is '$url'"
  fail=1
fi
expected="${EXPECTED_MAIN_SHA:-239a218}"
remote_sha="$(GIT_SSH_COMMAND="ssh -o BatchMode=yes -o ConnectTimeout=10" timeout 60 git ls-remote origin refs/heads/main | cut -f1)"
case "$remote_sha" in
  "$expected"*) ;;
  *)
    echo "FAIL: origin/main is '$remote_sha', expected '$expected'"
    fail=1
    ;;
esac
[ "$fail" -eq 0 ] && echo "PASS: T-01 origin is GitHub"
exit "$fail"
