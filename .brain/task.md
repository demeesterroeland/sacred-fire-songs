# Task: Story 3.6.1 review + test pyramid alignment (#258, PR #259)

- [x] Merge `origin/main` (song collection move #269, git guide #260, Cucumber runner #271) into `feat/userstory-3.6`; resolve logbook/.brain/design-doc conflicts by combining both sides
- [x] Review the implementation against the Story 3.6.1 acceptance criteria
- [x] Fix the user detail query: `compositions.artist` → `original_author`, `song_versions.song_id`/`name` → `composition_id`/`version_name` (contribution tabs were always empty); log query errors
- [x] Add per-user activity status, `expert` role (musician status), public playlist counts, "Musician / Expert" filter, separate empty states, `User Not Found` page, accessible tabs/list/account-menu labels
- [x] Extract `lib/admin/userOverview.ts` (pure helpers) and `lib/admin/userQueries.ts` (client-injected queries); `serverQueries.ts` becomes a thin wrapper
- [x] TDD: `testing/unit/tests/adminUserOverview.test.ts` + `adminQueries.test.ts` (moved from `lib/unit-tests`), 48 tests, against the schema-checking `testing/support/fakeSupabase.ts`
- [x] Gherkin `docs/testing/admin-users.feature` (@unit/@seed/@e2e, @adminUsers) registered in `cucumber.json`
- [x] Cucumber steps `testing/bdd/steps/admin-users.steps.ts` + `testing/bdd/support/db.ts` (20 scenarios pass)
- [x] Playwright `e2e/tests/admin-users.spec.ts` (24 passed, 2 skipped on mobile)
- [x] Apply migration `20261009194500` to the local Supabase stack
- [x] Doc sync: design doc v1.36, epic & user stories v1.37, e2e overview v1.5
