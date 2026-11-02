# CI & git hooks

## GitHub Actions

Both workflows run on push to `main` and on manual `workflow_dispatch`, on Ubuntu with Node 22 and pnpm from `packageManager` in `package.json`.

| Workflow | File                          | Runs                                      |
| -------- | ----------------------------- | ----------------------------------------- |
| `Tests`  | `.github/workflows/tests.yml` | `pnpm test:run`: Vitest unit & page tests |
| `E2E`    | `.github/workflows/e2e.yml`   | `pnpm test:e2e`: Playwright user flow     |

- `SKIP_INSTALL_SIMPLE_GIT_HOOKS=1` keeps `prepare` from installing git hooks in CI.
- E2E details: `e2e-testing.md`.

## Pre-commit hook

`simple-git-hooks` in `package.json` runs, in order:

1. `pnpm lint-staged`: ESLint fix, `tsc -b --noEmit` & `vitest related --run` on staged files.
2. `pnpm test:run`: full Vitest suite.
3. `pnpm metrics:architecture`: dependency-cruiser coupling & cohesion report.

After changing the hook in `package.json`, run `pnpm exec simple-git-hooks` to update `.git/hooks/pre-commit`.
