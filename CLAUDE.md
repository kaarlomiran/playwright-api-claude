# playwright-api-claude

Playwright (TypeScript) API test suite for https://dummyjson.com, run by Jenkins on every merge to `main`.

## Source of truth

- `docs/API_TEST_CASES.md` (human) and `docs/test-cases.json` (machine). One row = one `test()`.
- Test title format: `[TC-001] <Description>`. Tags: `@happy @negative @auth @error-code @body-validation @status-code`.

## Conventions

- Specs live in `tests/api/<module>.spec.ts`; shared fixtures in `src/fixtures/auth.ts` (`tokens`, `anon`).
- Use `request` for authenticated/normal calls and `anon` (fresh context) for "no token" tests.
- Status codes use hard `expect`; body-shape checks use `expect.soft`.
- DummyJSON writes (POST/PUT/PATCH/DELETE) are simulated and never persist: do not assert persistence.
- Never hard-code totals (194 products, etc.); assert relationships.
- No `waitForTimeout`/sleeps. No new retries to hide failures.

## Commands

- `npm test` - full suite
- `npm run test:smoke` - only @happy
- `npm run flaky` - analyse reports/results.json and write reports/FLAKY_REPORT.md
- `npx playwright test -g "TC-017" --repeat-each=10 --retries=0` - flake probe

## Skills in this repo

- `playwright-cli` (installed by `playwright-cli install --skills`) - drive a browser from the terminal.
- `flaky-monitor` - detect, classify and report flaky tests.
- `test-plan-generator` - acceptance criteria -> test plan -> registered test cases.
- `test-script-generator` - registered test cases -> Playwright specs.

## Adding new test cases (AC -> plan -> script)

1. Copy `docs/acceptance-criteria/_TEMPLATE.md` to `docs/acceptance-criteria/<feature>.md` and fill it in.
2. `test-plan-generator` skill -> `docs/test-plans/<feature>.md` (review gate), then registers rows in
   `docs/API_TEST_CASES.md` + `docs/test-cases.json` with the next free `TC-NNN`.
3. `test-script-generator` skill -> tests in `tests/api/<module>.spec.ts`, run and flake-probe them.
4. Finished AC files move to `docs/acceptance-criteria/processed/`.

Full detail: `docs/acceptance-criteria/README.md`. The original 114 cases are already generated.
