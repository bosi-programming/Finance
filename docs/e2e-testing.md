# End-to-end tests

`e2e/user-flow.spec.ts` drives one user journey in real Chromium against the production build.

- Vitest tests use jsdom and split by screen.
- This test catches breakage between screens, with a real file download and file chooser.

## Coverage

One test, `user flow from salary to JSON round trip`, starting from empty IndexedDB:

| Step                    | Checks                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `enter salary`          | `5000` and `Continue` land on `/budgets`                                                  |
| `add fixed budget`      | Rent, category Housing, `Fixed · $2,000 / month`                                          |
| `add percentage budget` | Travel, category Hobbies, `Percentage · 60%`                                              |
| `view result`           | Salary `$5,000`, Rent `$2,000`, Travel `$1,800`, Remaining `$1,200`                       |
| `export JSON`           | Downloads `finance-fe-v0.json` with version `v0`, salary and both budgets                 |
| `import JSON`           | New browser context imports that file through `Import JSON`; `/result` shows same numbers |

`e2e/route-guards.spec.ts` holds one test, `redirects a fresh /result and keeps /result on reload`, starting from empty IndexedDB:

- a fresh `/result` lands on `/salary`;
- after saving salary `5000` and adding budget Rent, `/result` stays on `/result` across a real browser reload.

Not covered here:

- Error and warning states, validation, edit and delete: see `src/pages/Budgets.test.tsx` and `src/pages/Result.test.tsx`.
- Other redirect rules, nav link redirects and history: see `src/router.test.tsx` and `src/domain/routing/routeRedirect.test.ts`.
- Other browsers and mobile viewports: Chromium with Desktop Chrome viewport only.

## Run

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

- Install the browser once per machine.
- `pnpm test:run` does not run this test: Vitest includes `src/**` only.
- Without `CI` set, a server already on port 4173 is reused, so stop old previews to test a fresh build.
- Failure traces land in `test-results/`, which git ignores.

## How it works

- `playwright.config.ts` runs `pnpm build`, then `vite preview` on port 4173.
- `baseURL` must stay on `localhost`: `crypto.randomUUID` in `Budgets.tsx` needs a secure context.
- The spec uses user-visible roles and labels only, with no store, IndexedDB or `src` import.
- `retries` is `0`, so flakes show instead of hiding.
- One long test means a failure hides later steps; step titles name the failure.
- If a failure exposes an app bug, fix it test-first in a unit or page test. Do not loosen this test.

## CI

GitHub Actions runs this test in `.github/workflows/e2e.yml`, workflow `E2E`.

- Triggers: push to `main` and manual `workflow_dispatch`.
- Runs on Ubuntu with Node 22 and pnpm from `packageManager` in `package.json`.
- Installs Chromium with the Playwright version the lockfile pins, then runs `pnpm test:e2e`.
- On failure, uploads `test-results/` as artifact `playwright-test-results`, kept 7 days.
- First green run: [41487130102](https://github.com/bosi-programming/Finance/actions/runs/41487130102), commit `491122b`.
