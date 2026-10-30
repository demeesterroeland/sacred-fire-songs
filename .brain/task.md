# Task: Story 3.6.1 review + test pyramid alignment (#258, PR #259)

# Tasks: Implement Multi-Language Support (i18n) (#246)

## Overview
Implementation of lightweight custom i18n across the application without heavy external libraries or router rewriting.

---

### Task 1: Core i18n Engine & Architecture
- [x] **FINISHED**: Create core i18n module `lib/i18n/index.ts` with `t()`, `tWithLocale()`, and locale management.
- [x] **FINISHED**: Create primary dictionary `messages/en.ts` and translations in `messages/nl.ts`.
- [x] **FINISHED**: Create client-side `LocaleContext.tsx` with hydration safety and `localStorage` persistence.
- [x] **FINISHED**: Wrap application in `LocaleProvider` inside `app/layout.tsx`.

### Task 2: Auth Components & Pages
- [x] **FINISHED**: Migrate `components/login-form.tsx`
- [x] **FINISHED**: Migrate `components/sign-up-form.tsx`
- [x] **FINISHED**: Migrate `components/update-password-form.tsx`
- [x] **FINISHED**: Migrate `app/auth/error/page.tsx`
- [x] **FINISHED**: Migrate `app/auth/sign-up-success/page.tsx`
- [x] **FINISHED**: Migrate `components/forgot-password-form.tsx`
- [x] **FINISHED**: Migrate `components/finish-registration-form.tsx`

### Task 3: Navigation & Shell Components
- [x] **FINISHED**: Migrate `components/common/navigation/UserProfile.tsx` with Language Switcher (EN / NL)
- [x] **FINISHED**: Migrate `components/common/navigation/ThemeToggle.tsx`
- [x] **FINISHED**: Migrate `components/common/MobileBottomNav.tsx`
- [x] **FINISHED**: Migrate `components/common/Sidebar.tsx`
- [x] **FINISHED**: Migrate `components/common/Header.tsx`

### Task 4: Song Viewing & Display Components
- [x] **FINISHED**: Migrate `app/songs/[id]/page.tsx` (Song detail view, actions, delete dialog)
- [x] **FINISHED**: Migrate `components/song/SongDisplay.tsx`
- [x] **FINISHED**: Migrate `components/song/SongMetadataPills.tsx`
- [x] **FINISHED**: Migrate `components/song/SongTechnicalBadges.tsx`
- [x] **FINISHED**: Migrate `components/song/MediaEmbeds.tsx`
- [x] **FINISHED**: Migrate `components/song/RehearsalDrawer.tsx`
- [x] **FINISHED**: Migrate `components/song/AudioRecorder.tsx`

### Task 5: Song Management & Forms
- [x] **FINISHED**: Migrate `app/songs/SongsPageContent.tsx` (Song list & quick filter pills)
- [x] **FINISHED**: Migrate `app/songs/page.tsx`
- [x] **FINISHED**: Migrate `components/song/SongForm.tsx` (Add/Edit song form, category/status labels)
- [x] **FINISHED**: Migrate `app/songs/add/page.tsx`
- [x] **FINISHED**: Migrate `app/songs/[id]/edit/page.tsx`

### Task 6: Library, Playlists, Explore & Search Modal
- [x] **FINISHED**: Migrate `components/library/SearchFiltersModal.tsx`
- [x] **FINISHED**: Migrate `components/common/GlobalSearchModal.tsx`
- [x] **FINISHED**: Migrate `components/library/TagSelector.tsx`
- [x] **FINISHED**: Migrate `app/library/LibraryTabs.tsx`
- [x] **FINISHED**: Migrate `app/library/page.tsx` & `app/library/layout.tsx`
- [x] **FINISHED**: Migrate `app/library/playlists/page.tsx`
- [x] **FINISHED**: Migrate `app/library/recently-viewed/page.tsx`
- [x] **FINISHED**: Migrate `app/library/albums/page.tsx`
- [x] **FINISHED**: Migrate `app/library/artists/ArtistsPageContent.tsx`
- [x] **FINISHED**: Migrate `components/playlists/PlaylistDetailClient.tsx`
- [x] **FINISHED**: Migrate `components/playlists/PlaylistDetailHeader.tsx`
- [x] **FINISHED**: Migrate `components/playlists/CreatePlaylistInput.tsx`
- [x] **FINISHED**: Migrate `components/playlists/PlaylistContextMenu.tsx`
- [x] **FINISHED**: Migrate `components/playlists/AddSongsSheet.tsx`
- [x] **FINISHED**: Migrate `components/playlists/PlaylistPicker.tsx`
- [x] **FINISHED**: Migrate `app/explore/page.tsx`
- [x] **FINISHED**: Migrate `app/page.tsx` (Home library summary)

### Task 7: Account Settings
- [x] **FINISHED**: Migrate `components/account/settings/AccountSettings.tsx`
- [x] **FINISHED**: Migrate `components/account/settings/ProfileSettings.tsx`
- [x] **FINISHED**: Migrate `components/account/settings/SecuritySettings.tsx`
- [x] **FINISHED**: Migrate `components/account/settings/PreferencesSettings.tsx`
- [x] **FINISHED**: Migrate `components/account/settings/PrivacySettings.tsx`
- [x] **FINISHED**: Migrate `app/account/settings/page.tsx`

### Task 8: Common Feedback, Modals & Error Pages
- [x] **FINISHED**: Migrate `components/common/DeleteConfirmationModal.tsx`
- [x] **FINISHED**: Migrate `components/common/feedback/NotFound.tsx`
- [x] **FINISHED**: Migrate `components/common/feedback/AccessDenied.tsx`
- [x] **FINISHED**: Migrate `components/common/feedback/UnderConstruction.tsx`
- [x] **FINISHED**: Migrate `app/not-found.tsx`

### Task 9: Verification, Testing & Artifact Sync
- [x] **FINISHED**: Run unit tests (`npm run test:unit`) & build check (`npm run build`)
- [x] **FINISHED**: Sync logbook artifacts (`master-walkthrough.md`, `master-tasks.md`, `master-timetracking.md`)

### Task 10: Architecture hardening (Oct 30, 2026)
- [x] **FINISHED**: Merge `origin/main` (song-collection move #269, git workflow guide #260, Cucumber runner #263/#271)
- [x] **FINISHED**: Request-scoped server locale (`lib/i18n/server.ts`: cookie → Accept-Language → English); Server Components use `getServerT()`
- [x] **FINISHED**: `LocaleProvider` hydrates in the server locale, exposes bound `t`; client components use `useLocale().t`
- [x] **FINISHED**: Browser-language default, cookie + localStorage persistence (`lib/i18n/persistence.ts`), self-healing Server Component refresh
- [x] **FINISHED**: `LanguageSwitcher` in sidebar footer (guests), user menu and Account → Preferences
- [x] **FINISHED**: Migrate remaining strings (auth pages, playlists add, SongCard, LibrarySummary, RecentlyViewed, NewSinceLastVisit, toasts); restore English copy changed by the migration

### Task 11: Test pyramid (#262 conventions)
- [x] **FINISHED**: Story 3.7.1 with I18N-01…10 in `epic&user stories.md`
- [x] **FINISHED**: `docs/testing/i18n.feature` (@unit / @e2e / @static)
- [x] **FINISHED**: TDD vitest: `testing/unit/tests/i18n.test.ts`, `localePersistence.test.ts`
- [x] **FINISHED**: Cucumber steps `testing/bdd/steps/i18n.steps.ts` + `npm run test:bdd:i18n`
- [x] **FINISHED**: Playwright `e2e/tests/i18n.spec.ts` (desktop + mobile)

### Task 12: Docs & PR
- [x] **FINISHED**: `application-analysis&design.md` §6.4, `e2e-test-overview.md` ACC-07, `docs/plans/2026-10-30-i18n.md`, `testing/README.md`
- [x] **FINISHED**: Merge origin/main #220 and translate PDF export (I18N-11)
- [x] **FINISHED**: Add es, it, ru, qu, fr, pt + select switcher (I18N-12)
- [ ] **WAITING**: User manual validation, then "klaar" / "merge"

---

# Task: Set up Cucumber runner and TypeScript test execution for BDD (#263)

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
- [x] Doc sync: design doc v1.37, epic & user stories v1.37, e2e overview v1.5
