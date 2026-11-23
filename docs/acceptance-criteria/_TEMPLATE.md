---
feature: <short-kebab-name>        # e.g. product-reviews; becomes the test-plan filename
module: <Module>                   # existing: System, Products, Auth, Users, Carts, Posts, Comments, Todos, Recipes, Quotes, Cross-cutting (or a new one)
base_endpoints:                    # endpoints in scope
  - GET /products/search
auth: none                         # none | bearer | cookie | mixed
status: new                        # new -> planned -> scripted (updated by the skills)
---

# <Feature title>

## Context
One or two sentences: what the API does and who uses it.

## Acceptance Criteria
Use one numbered, testable statement per line. Prefer Given/When/Then.

- **AC-1** Given <state>, when <request>, then <status + observable result>.
- **AC-2** ...

## Negative / edge behaviour
- **AC-N1** Given an invalid <input>, when <request>, then <status + error message>.

## Out of scope
- DummyJSON writes are simulated; persistence is never asserted.

## Notes (optional)
Sample payloads, links to docs, known quirks.
