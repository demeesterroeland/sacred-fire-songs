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

## October 30, 2026 (Part 6) - Multi-Language Support i18n (#246, Story 3.7.1)

**Task Overview**
Finished the English/Dutch i18n started on Sep 27 (WIP secured as a commit), merged `origin/main` (#260, #269, Cucumber runner #263/#271) and brought the story in line with the #262 testing pyramid.

**Technical Details**
- **Architecture**: `lib/i18n` gained `resolveLocale()` (localStorage → cookie → browser language → English), `resolveRequestLocale()` / `parseAcceptLanguage()`, cookie helpers and a fallback chain active → English → key. `lib/i18n/server.ts` gives Server Components a request-scoped `getServerT()`; `lib/i18n/persistence.ts` holds DOM-free browser persistence.
- **Provider**: `LocaleProvider` starts in the server locale (no hydration mismatch, no English flash), exposes a bound `t` used by every Client Component (`useLocale().t`), and refreshes Server Components until the root layout's locale matches (a single `router.refresh()` was dropped in ~4% of mobile switches).
- **UI**: `LanguageSwitcher` in sidebar footer (guests), user menu and Account → Preferences → Language; remaining hardcoded strings migrated; English copy changed by the WIP migration restored (it broke the search e2e spec).
- **Tests**: Story 3.7.1 (I18N-01…10); `docs/testing/i18n.feature`; vitest `i18n.test.ts` + `localePersistence.test.ts` (TDD); Cucumber `i18n.steps.ts` + `npm run test:bdd:i18n`; Playwright `e2e/tests/i18n.spec.ts`. Full headless e2e suite identical to a `main` baseline apart from the new passing i18n tests.
- **PDF export (#220)**: second `origin/main` merge; export button, toasts, login prompt and context-menu item translated; PDF labels localized via `getPdfLabels(locale)`; I18N-11 added to story, feature and steps.
- **More languages**: Spanish, Italian, Russian, Southern Quechua (machine-assisted, needs native review), French and Brazilian Portuguese dictionaries (582 keys each, parity + placeholder + "not a copy of English" tests); `quz`/`quy` → `qu`; PDF dates per locale; LanguageSwitcher became a native select; I18N-12 in story, feature, steps and e2e.
- **Merge #259 (admin)**: resolved Sidebar/UserProfile/cucumber.json conflicts, translated the admin area (76 keys) into all eight languages.
