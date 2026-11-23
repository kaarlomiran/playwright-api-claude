---
name: test-script-generator
description: Generate Playwright TypeScript API tests from registered test cases in docs/test-cases.json (usually produced by test-plan-generator). Use when asked to write/generate test scripts, automate new test cases, or extend tests/api/*.spec.ts.
---

# Test Script Generator

## Inputs
- `docs/test-plans/<feature>.md` with status `registered` (or explicit TC IDs)
- `docs/test-cases.json` - source of truth for each case
- Existing `tests/api/<module>.spec.ts` and `src/fixtures/auth.ts` for style

## Procedure
1. Select the cases for the feature (IDs in the plan). Skip any ID that already has a `test()`
   (`grep -r "\[TC-NNN\]" tests/`).
2. Add to `tests/api/<module>.spec.ts` (create the file with `test.describe('<Module>')` if new),
   importing `{ test, expect }` from `../../src/fixtures/auth`.
3. Title `[TC-NNN] <Description>`; tags from category: `{ tag: ['@happy'] }`, `@negative`, `@auth`,
   `@error-code`, `@body-validation`, `@status-code`.
4. `request` for normal calls, `anon` for no-token tests, `tokens` fixture for bearer auth.
   Hard `expect` for status codes, `expect.soft` for body shape. Relative URLs only (baseURL is configured).
5. No `waitForTimeout`, no new retries, no hard-coded totals, no persistence assertions.
6. Run only the new tests: `npx playwright test -g "TC-115|TC-116" --retries=0`. If one fails, verify
   against the live API before deciding whether the test or the case row is wrong; fix the source row
   if the row was wrong. Then probe flakiness: `--repeat-each=10 --retries=0`.
7. Set plan status `scripted`, move the AC file to `docs/acceptance-criteria/processed/`
   (status: scripted), and report: cases added, pass/fail, any flaky results.
