---
name: test-plan-generator
description: Turn an acceptance-criteria markdown file in docs/acceptance-criteria/ into a reviewable test plan in docs/test-plans/, then (after approval) register the cases in docs/API_TEST_CASES.md and docs/test-cases.json. Use when asked to plan tests, create a test plan, or process new acceptance criteria.
---

# Test Plan Generator

## Inputs
- `docs/acceptance-criteria/<feature>.md` (from `_TEMPLATE.md`)
- `docs/test-cases.json` (to find the highest existing `TC-NNN`)
- `docs/test-plans/_TEMPLATE.md` (output shape)

## Procedure
1. Read the AC file and `CLAUDE.md` conventions. Probe real behaviour of each endpoint with `curl`
   against https://dummyjson.com so expected status/body are facts, not guesses.
2. Next ID = max existing TC number + 1. Never reuse or renumber IDs.
3. For every AC create >=1 case; add NEGATIVE / ERROR-CODE / AUTH / BODY-VALIDATION / STATUS-CODE
   cases where the AC implies them. Categories: HAPPY, NEGATIVE, AUTH, ERROR-CODE, BODY-VALIDATION, STATUS-CODE.
4. Rules: never hard-code totals (assert relationships); writes are simulated so do not assert
   persistence; no sleeps; assertions must be machine-checkable (`status==200`, `body.id==1`).
5. Write `docs/test-plans/<feature>.md` using the template, including the AC coverage matrix and
   open questions. Set status `draft`. STOP and ask the user to review.
6. Only after the user approves: append rows to `docs/API_TEST_CASES.md` (update the Total and category
   counts) and entries to `docs/test-cases.json` (same schema as existing cases, update `total`).
   Set plan status `registered` and AC status `planned`.
