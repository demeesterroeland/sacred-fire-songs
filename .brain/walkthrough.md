## October 30, 2026 (Part 4) - Story 3.6.1 Review, Bug Fix & Test Pyramid (#258, PR #259)

**Task Overview**
Reviewed the admin users overview against the Story 3.6.1 acceptance criteria after merging `origin/main` (Cucumber runner #271), fixed a data bug, closed the AC gaps and covered every criterion at the unit, BDD (@unit/@seed) and e2e layers.

**Technical Details**
- **Bug**: `getAdminUserDetails` selected `compositions.artist` and `song_versions.song_id`/`name`, which do not exist (`original_author`, `composition_id`, `version_name`). PostgREST errors were swallowed, so the songs and versions tabs were always empty. The old vi.fn() mocks returned whatever shape the code expected and hid it. Fixed, and errors are now logged.
- **Refactor**: `lib/admin/userQueries.ts` takes the Supabase client as a parameter (used by vitest, Cucumber and `serverQueries.ts`); `lib/admin/userOverview.ts` holds activity status (30-day window), role labels, musician status (`musician`/`expert`), search/filter/sort and totals.
- **AC gaps closed**: per-user status in the list, `expert` role badge + "Musician / Expert" filter, musician status and activity status on the detail page, public playlist counts, "No registered users yet" vs "No users found" empty states, `app/admin/users/[id]/not-found.tsx`.
- **Test double**: `testing/support/fakeSupabase.ts` validates selected columns against the real table shapes (PostgREST 42703 on unknown columns); a @seed scenario checks those shapes against `information_schema` so the fake cannot drift.
- **Tests**: 48 vitest tests (`testing/unit/tests/admin*.test.ts`), 20 Cucumber scenarios (`docs/testing/admin-users.feature`: access by role, no session, `fn_is_admin()`, RLS on private playlists in a rolled-back transaction, overview, status, counts, search/filter/sort, details, contributions, unknown id), Playwright `e2e/tests/admin-users.spec.ts` (24 passed, 2 skipped on mobile).
- **Findings outside scope**: guests are redirected by `proxy.ts` to `/auth/login?message=…` (no `next`), so the layout's `next=/admin/users` redirect is unreachable; `notFound()` renders with HTTP 200 because `app/loading.tsx` streams; bare `vitest run` (`npm test`) also collects Playwright specs; `@types/pg` is missing.
