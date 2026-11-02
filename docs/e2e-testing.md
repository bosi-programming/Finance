# End-to-end test

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

Not covered here:

- Error and warning states, validation, edit and delete: see `src/pages/Budgets.test.tsx` and `src/pages/Result.test.tsx`.
- Other browsers and mobile viewports: Chromium with Desktop Chrome viewport only.

## Run

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

- Install the browser once per machine.
- `pnpm test:run` does not run this test: Vitest includes `src/**` only.
- Outside CI, a server already on port 4173 is reused, so stop old previews to test a fresh build.
- Failure traces land in `test-results/`, which git ignores.

## How it works

- `playwright.config.ts` runs `pnpm build`, then `vite preview` on port 4173.
- `baseURL` must stay on `localhost`: `crypto.randomUUID` in `Budgets.tsx` needs a secure context.
- The spec uses user-visible roles and labels only, with no store, IndexedDB or `src` import.
- `retries` is `0`, so flakes show instead of hiding.
- One long test means a failure hides later steps; step titles name the failure.
- If a failure exposes an app bug, fix it test-first in a unit or page test. Do not loosen this test.

## CI

`.woodpecker/e2e.yaml` runs `pnpm test:e2e` on push and manual events on `main`.

- Image tag `v1.61.1-noble` must move with `@playwright/test` `1.61.1`.
- Scope is running the test: no artifact upload, no caching.

Not verified, as of BOS-18 (2026-11-02):

- The pipeline has never run, and no run has been seen. Passing runs so far are local only.
- The commits adding it were not pushed when this was written.
- Woodpecker access for this repo on Codeberg is unknown. It needs an access request and repo enable.
- The Playwright image, `pnpm install` of `bosi-design-system` from GitHub and the test inside the container were not run.

If Woodpecker is not available, the pipeline file stays and the CI criterion stays unverified. Alternatives: Forgejo Actions with an own runner, or a GitHub Actions mirror.
