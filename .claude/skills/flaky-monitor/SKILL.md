---
name: flaky-monitor
description: Detect, classify and report flaky Playwright API tests. Use after any test run, when a test passed only
  on retry, when CI is intermittently red, or when asked to check test stability or write FLAKY_REPORT.md.
---

# Flaky Monitor

## Inputs

- `reports/results.json` - Playwright JSON reporter output for the latest run
- `reports/history/flaky-history.json` - rolling window of the last 20 runs (created by the script)

## Procedure

1. Run `npx tsx .claude/skills/flaky-monitor/scripts/analyze-flaky.ts`.
2. Read `reports/FLAKY_REPORT.md`. Tests that passed on retry are "flaky"; tests that
   fail in some history runs but not others are "unstable".
3. For every flaky/unstable/failed test, reproduce before diagnosing:
   `npx playwright test -g "TC-0xx" --repeat-each=10 --retries=0 --workers=1`
   Open the trace if present: `npx playwright show-trace test-results/<dir>/trace.zip`
4. Classify the root cause (pick one):
   - timing / slow response (delay param, performance SLA too tight)
   - shared state or test-order dependency (simulated writes do NOT persist on DummyJSON)
   - auth: expired or reused token, cookie leakage into "no token" tests
   - data drift: hard-coded totals/counts instead of relationships
   - network / rate limiting / 5xx from the service under test
   - assertion too strict (exact message text, float equality)
5. Fill in "Suspected cause" and "Suggested fix" under each issue in FLAKY_REPORT.md.
   Keep the report format; do not delete the generated tables.
6. Propose fixes as diffs in the report. Only edit test files if the user asks.

## Rules

- Never "fix" flakiness by adding sleeps or raising retries. Fix the cause, or quarantine
  with `test.fixme()` plus a link to the issue.
- Tests tagged `@known-issue` are excluded from flaky stats (for example the 500 on a
  tampered JWT). Mention them once, do not file duplicates.
- Never put credentials or tokens in the report.
