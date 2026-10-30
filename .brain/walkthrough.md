## October 30, 2026 (Part 4) - Multi-Language Support i18n (#246, Story 3.7.1)

**Task Overview**
Finished the English/Dutch i18n started on Sep 27 (WIP secured as a commit), merged `origin/main` (#260, #269, Cucumber runner #263/#271) and brought the story in line with the #262 testing pyramid.

**Technical Details**
- **Architecture**: `lib/i18n` gained `resolveLocale()` (localStorage → cookie → browser language → English), `resolveRequestLocale()` / `parseAcceptLanguage()`, cookie helpers and a fallback chain active → English → key. `lib/i18n/server.ts` gives Server Components a request-scoped `getServerT()`; `lib/i18n/persistence.ts` holds DOM-free browser persistence.
- **Provider**: `LocaleProvider` starts in the server locale (no hydration mismatch, no English flash), exposes a bound `t` used by every Client Component (`useLocale().t`), and refreshes Server Components until the root layout's locale matches (a single `router.refresh()` was dropped in ~4% of mobile switches).
- **UI**: `LanguageSwitcher` in sidebar footer (guests), user menu and Account → Preferences → Language; remaining hardcoded strings migrated; English copy changed by the WIP migration restored (it broke the search e2e spec).
- **Tests**: Story 3.7.1 (I18N-01…10); `docs/testing/i18n.feature`; vitest `i18n.test.ts` + `localePersistence.test.ts` (TDD); Cucumber `i18n.steps.ts` + `npm run test:bdd:i18n`; Playwright `e2e/tests/i18n.spec.ts`. Full headless e2e suite identical to a `main` baseline apart from the new passing i18n tests.
