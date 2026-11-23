# Acceptance criteria inbox

Drop one markdown file per feature here, copied from `_TEMPLATE.md`
(e.g. `product-reviews.md`).

## Workflow

1. **Write** `docs/acceptance-criteria/<feature>.md` (status: new).
2. **Plan** - ask Claude: `Use the test-plan-generator skill on docs/acceptance-criteria/<feature>.md`
   - Output: `docs/test-plans/<feature>.md` (review/edit this by hand).
3. **Register** - the same skill, once you approve the plan, appends the rows to
   `docs/API_TEST_CASES.md` and `docs/test-cases.json` with the next free `TC-NNN` IDs.
4. **Script** - ask Claude: `Use the test-script-generator skill for <feature>`
   - Output: new/extended `tests/api/<module>.spec.ts`, then runs the new tests.
5. **Flake check** - `npm run flaky` (see flaky-monitor skill).
6. Processed criteria files move to `processed/` (status: scripted).

Rule: the AC file is the *intent*, the test plan is the *review gate*,
`test-cases.json` is the *source of truth* for scripts.
