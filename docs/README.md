# docs/

Drop the real test-case source files here when ready:

- `API_TEST_CASES.md` — human-readable, one row per test case.
- `test-cases.json` — the same data, machine-readable.

Once both exist, a Generate pass (per `CLAUDE.md`) turns each row into a real
Playwright test under `tests/api/<module>.spec.ts`. Until then, only the 4
example tests from the setup guide exist (`tests/api/sample.spec.ts`).
