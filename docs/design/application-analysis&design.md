# Project Analysis & Design Document: Song Sharing Application (Sacred Fire Songs)

**Version:** 1.51
**Status:** Living Document
**Date:** Oct 31, 2026

## Changelog

| Version | Date | Description of Changes | 
| ----- | ----- | ----- | 
| **1.0** | Oct 26, 2023 | Initial Document Creation. Defined User Personas, Core Requirements, Domain Model, and Tech Stack. | 
| **...** | ... | (Previous versions 1.1 - 1.17 retained in history) |
| **1.18** | Feb 1, 2026 | Standardized navigation layout across all administrative screens. Renamed "Settings" to "Playlists". Refined inter-linking between Home, Explore, and Detail screens. |
| **1.19** | Feb 1, 2026 | Refined sidebar navigation (Dashboard, Explore, Library, Playlist, Add Song). Implemented new Library hub (screen15) and Playlists management (screen16) mockups. |
| **1.20** | Feb 3, 2026 | Implemented Draft Auto-Save (Story 1.1.7). Updated Song Form UI (Layout, Tags). Styled Profile Pill. |
| **1.21** | Feb 23, 2026 | Removed Home page search box and renamed "Library" to "Search Songs". |
| **1.22** | Mar 3, 2026 | Architecture Audit: Added images remote patterns for Supabase and tuned staleTime defaults. |
| **1.23** | Jun 23, 2026 | Dedicated Artist filter parameter (?artist=) to prevent search collisions, and "No Artist" grouping at the bottom of the artists list. |
| **1.24** | Jun 23, 2026 | Added dedicated E2E test database cleanup and seeding script (`setup-test-db.mjs`), integrated via Playwright `globalSetup` to isolate tests from the staging environment. |
| **1.25** | Jun 23, 2026 | Added client-side relative Supabase API proxy (/supabase-api) rewrite in client.ts and next.config.ts to prevent Mixed Content protocol blocking on self-hosted environments. |
| **1.26** | Jun 23, 2026 | Added programmatic random seeder (`random-seeder.mjs`) supporting dynamic generation of rich mock data (visibility, ownership, key/capo, and element/lineage tags) for advanced local and E2E testing, toggleable via `E2E_RANDOM_SEED=1` env variable. |
| **1.27** | Jun 27, 2026 | Resolved duplicate avatar widget on desktop song detail page. Replaced AccountInfoPanel with UserProfile in Header.tsx, removed duplicate UserProfile from app/songs/[id]/page.tsx, and deleted the obsolete AccountInfoPanel component. |
| **1.28** | Jun 27, 2026 | Resolved duplicate action buttons on mobile song detail page, removed duplicate Edit/Delete buttons from the main content body, and reduced vertical top/margin whitespace. |
| **1.29** | Jun 27, 2026 | Implemented mobile song detail page Spotify-style slide-up bottom sheet context menu, moved Like button inside drawer, removed Back button, enabled bottom nav on details page, and added auto-hide bottom nav preference toggle. |
| **1.30** | Jun 28, 2026 | Fixed infinite song detail skeleton loader by adding 5s auth timeout (guest fallback) and 10s page load timeout. Rewrote random seeder into an optimized PL/pgSQL database-side seeder (reducing setup time from 70s to 3s). Added e2e/tests/timeouts.spec.ts, randomized categories/tags, and normally distributed tag assignment. |
| **1.31** | Jun 29, 2026 | Implemented Private Rehearsal Audio Recording (Story 4.6.1). Created private rehearsals storage bucket and user_recordings table. Integrated AudioRecorder and RehearsalDrawer components on song detail page. |
| **1.32** | July 16, 2026 | Moved existing song folders from `doc/extracted_songs` to `data/extracted_songs` and created a Python sync & PDF compiler script (`prod_songs_2_pdf.py`) to extract and sync all Production DB songs locally to `.cho` files ignored by Git and compile them into a PDF. |
| **1.33** | Oct 30, 2026 | Moved the ChordPro song collection (`data/songs`, `data/extracted_songs`, `data/scripts`) and the songbook scripts (`scripts/prod_songs_2_pdf.py`, `scripts/compile_songbook.py`) out of this repository into the sibling repository `sacred-fire-songs-collection`, preserving git history. Only test fixtures remain here (`supabase/seeds`, `lib/unit-tests`, `testing/unit/tests`, `e2e/fixtures`). |
| **1.34** | Oct 30, 2026 | Moved the 221 seeded songs (`supabase/seeds/03_*.sql` … `10_*.sql`) to `sacred-fire-songs-collection`; `setup-test-db.mjs` now always seeds test accounts plus randomly generated songs (`E2E_RANDOM_SEED` flag retired). Extended `random-seeder.mjs` to generate every song shape exercised by the unit and E2E tests, and added `docs/testing/song.feature` describing those situations in Gherkin. |
| **1.35** | Oct 30, 2026 | Added `scripts/export-random-seed.mjs` (`npm run seed:generate`) which runs the random seeder and writes `supabase/seeds/03_songs_random_generated.sql` (200 generated songs) so `supabase db reset` / `supabase start` still seed a realistic local database. |
| **1.36** | Oct 30, 2026 | Implemented Story 4.2.1 (Issue #18) for musician setlist PDF export using ChordSheetJS and jsPDF with firelight-optimized typography, pagination, section headers, transposition overrides, and UI quick action buttons. |
| **1.37** | Oct 30, 2026 | Epic 3.6 / Story 3.6.1 (Admin User Overview & Contributions, #257/#258): admin area `/admin/users` and `/admin/users/[id]` with server-side role guard, `public.fn_is_admin()` and admin read policies on `profiles`/`setlists`, per-user status (active/inactive/never), musician status, contribution counts and lists. Fixed the user detail query to use `compositions.original_author` and `song_versions.composition_id`/`version_name`. Added sections 5.2 (admin access), 6.4 (testing pyramid for Story 3.6.1), 7.12–7.13 (admin screens). |
| **1.38** | Oct 30, 2026 | Admin screens now use the app layout of the Library section: own scroll container (fixes the sticky admin header overlapping the summary cards), page title + pill tabs, breadcrumb on the user detail page, summary cards in the `LibrarySummary` style and pill tabs for contributions. |
| **1.39** | Oct 30, 2026 | Added §6.5 Internationalization (Story 3.7.1, #246): English + Dutch UI via a lightweight typed `t()` (`lib/i18n`), request-scoped server locale (`lib/i18n/server.ts`, cookie → Accept-Language → English), `LocaleProvider` hydrating in the server locale, `LanguageSwitcher` (sidebar, user menu, Account → Preferences). Playlist PDF export (#220) UI strings translated and PDF labels localized via `getPdfLabels(locale)`. Tests: `docs/testing/i18n.feature`, `testing/bdd/steps/i18n.steps.ts`, `e2e/tests/i18n.spec.ts`. |
| **1.40** | Oct 30, 2026 | §6.5: added Spanish, Italian, Russian, Southern Quechua, French and Brazilian Portuguese (Story 3.7.1, I18N-12); language switcher is now a select. |
| **1.41** | Oct 30, 2026 | §6.5: language picker redesigned as an accessible listbox with ember "wick" markers (full variant in the sidebar, compact in user menu and Preferences). |
| **1.42** | Oct 30, 2026 | §6.5: admin area (Story 3.6.1, #259) translated into all eight languages (`admin.*` keys); admin dates follow `LOCALE_DATE_TAGS`; account-menu trigger label `userMenu.trigger`. |
| **1.43** | Oct 30, 2026 | Admin users overview: role and sort pickers use the new listbox component `components/common/ui/WickSelect.tsx` (same design as the language picker on the i18n branch, keyboard logic in `lib/ui/listbox.ts`); sort by name A-Z/Z-A and most/fewest songs, remembered in `localStorage` (#278); whole user row opens the details (#279). |
| **1.44** | Oct 30, 2026 | Role colors have one source (`lib/admin/roleColors.ts`): role badges and the role filter picker use the same color per role (admin purple, gatekeeper amber, musician/expert emerald, member blue). `WickSelect` options accept an `accent` color (`wick-ignite` animation in `app/globals.css`). |
| **1.45** | Oct 30, 2026 | PDF export (Stories 4.2.3/4.2.4, #303/#304): footer shows only the site host plus a 1 cm QR code (`qrcode`) linking to the song on that page (continuation pages included); `lib/export/pdfCache.ts` reuses the last PDF per user + playlist (IndexedDB) until a SHA-256 fingerprint of the exported content, locale and site changes; cache cleared on sign-out. |
| **1.46** | Oct 30, 2026 | Added §6.6 Delivery Pipeline Contract Tests (Epic 5.1 Phase 0, #287): `testing/support/workflowContract.ts`, Vitest `testing/unit/tests/ci/`, Cucumber profile `ci` for `docs/testing/gitflow-cicd.feature`, bats `testing/scripts/`, npm scripts `test:bdd:ci`, `test:scripts`, `lint`, `typecheck`. |
| **1.47** | Oct 31, 2026 | §6.6: CI quality gate `ci.yml` (lint ratchet, typecheck, unit, BDD @unit, build, pipeline job), single unit-test tree `testing/unit/tests/`, SHA-pinned actions, Dependabot (Epic 5.1 Phase 1, #282). |
| **1.48** | Oct 31, 2026 | Reorganized `scripts/` into `scripts/cicd/`, `scripts/db/` and `scripts/dev/` (#274), moved the story-sync scripts from `.claude/scripts/` to `scripts/cicd/`, added `scripts/README.md` and `testing/scripts/scripts-layout.bats`; updated §6.3 and §6.6 paths. |
| **1.49** | Oct 31, 2026 | §6.6: PR policy (`pr-lint.yml`, `scripts/cicd/lib/prPolicy.mjs`), branch rulesets as code (`.github/rulesets/`), `start-issue.sh` input validation, `dev2preview.sh --dry-run` (Epic 5.1 Phase 2, #283). |
| **1.50** | Oct 31, 2026 | §6.6: staging continuous deployment from `develop` (`docker.yml` develop images, no `:latest`; `deploy-staging.yml` → SSH forced command `deploy-songbook-staging.sh` in cloud-infra) (Epic 5.1 Phase 3, #284). |
| **1.51** | Oct 31, 2026 | Added §6.7 Client Auth State (#321): `useAuth()` without a server user starts with `loading = true` until the session resolves (`initialUser` `undefined` = unknown, `null` = server-confirmed guest); `/library/playlists/add` guards auth on the server (`redirect('/auth/login?next=/library/playlists/add')`) with the form in `components/playlists/CreatePlaylistForm.tsx`. Fixes logged-in users being redirected to `/` from "New Playlist". Lint cap lowered to 181. |


## 1. Introduction

### 1.1 Purpose
The purpose of this application is to centralize, preserve, and share the medicine songs (Icaros, ceremonial songs) of the Sacred Fire community. It serves as a digital songbook that bridges the gap between oral tradition and accessibility.

### 1.2 Scope
The application is a **Progressive Web App (PWA)** optimized for mobile use during ceremonies (dark mode, offline capable).
* **It IS:** A collaborative library for lyrics and chords.
* **It IS NOT:** A music streaming service.

### 1.3 Key Definitions
* **ChordPro:** A text-based format (`Example [Am]Chord`) used for rendering.
* **Song:** A "Composition" entity containing metadata (Title, Author).
* **Version:** A specific arrangement of a Song (e.g., "Capo 2", "Simplified").

## 2. User Analysis

### 2.1 User Personas
1.  **The Guitarero (Musician):** Needs accurate chords, transposition, and offline access.
2.  **The Singer:** Needs clear lyrics and melody reference.
3.  **The Guardian:** Ensures cultural respect and accuracy.

## 3. Functional Requirements

### 3.1 Song Library & Discovery
* **[Implemented] Lazy List:** Efficient fetching of song titles.
* **[Implemented] Search:** Real-time filtering by Title and Author.
* **[Planned] Taxonomy:** Filtering by Category (Water, Fire) deferred to later phases.

### 3.2 The Song Viewer
* **[Implemented] ChordPro Rendering:** Custom parser renders chords above lyrics.
* **[Implemented] Version Switching:** UI pills to toggle between versions.
* **[Implemented] Transposition:** (Foundation laid in logic, UI pending).

### 3.3 Offline Support
* **[Implemented] PWA:** Installable on mobile.
* **[Implemented] Caching:** `Stale-While-Revalidate` strategy via TanStack Query ensures songs work offline after first visit.

## 4. Roadmap Status

### Phase 1: The Bare Essentials (MVP) - [COMPLETED]
* **[x] Foundation:** Next.js + Tailwind Setup.
* **[x] Database:** Supabase connected with RLS.
* **[x] Public Library:** Home screen with Search.
* **[x] Song Viewer:** Dynamic routing `[id]` and ChordPro rendering.
* **[x] Navigation:** Persistent Header and Back Button integration.

### Phase 2: Minimal Lovable Product (MLP) - [IN PROGRESS]
* **[ ]** Transposition: UI controls to shift keys.
* **[ ]** Melody: ABC Notation rendering.
* **[x]** Rich Editing: Create/Edit Songs (Owner/Admin).

### Phase 3 & 4 (Future)
* User Accounts, Favorites, Gatekeeper Role, Musician Setting, Setlists, PDF Export.
* **[~]** Administrative Management (Epic 3.6): **[x]** Story 3.6.1 Admin user overview, details & contributions; further admin stories (configuration, settings, songs) pending.

## 5. Domain & Data Model (Implemented Codebase)

### 5.1 Schema: `public`

#### **A. compositions** (The Song Identity)
* `id`: uuid (PK)
* `title`: text
* `original_author`: text
* `owner_id`: uuid (FK -> profiles.id)
* `is_public`: boolean
* `has_chords`: boolean
* `has_melody`: boolean
* `created_at`: timestamptz

#### **B. song_versions** (The Content)
* `id`: uuid (PK)
* `composition_id`: uuid (FK -> compositions.id)
* `version_name`: text (e.g., "Standard", "Capo 2")
* `content_chordpro`: text (The raw lyrics/chords)
* `key`: text (e.g., "Am")
* `capo`: integer
* `soundcloud_url`: text (Renamed from audio_url)
* `youtube_url`: text
* `spotify_url`: text
* `contributor_id`: uuid
* `created_at`: timestamptz

#### **C. user_recordings** (Private Rehearsal Metadata)
* `id`: uuid (PK)
* `user_id`: uuid (FK -> profiles.id)
* `song_version_id`: uuid (FK -> song_versions.id)
* `recording_name`: text
* `storage_path`: text (Unique path in 'rehearsals' private storage bucket)
* `created_at`: timestamptz

*(Categories and Setlists tables are designing but not yet implemented).*

### 5.2 Admin Access (Epic 3.6)
* **Role source:** `profiles.role` (`user_role` enum: `admin`, `gatekeeper`, `expert`, `musician`, `member`). Only `admin` may open `/admin/*`. "Musician status" in the admin UI means role `musician` or `expert`.
* **`public.fn_is_admin()`** (migration `20261009194500_admin_profiles_policy.sql`): `SECURITY DEFINER` helper returning whether `auth.uid()` has role `admin`, used in RLS without recursing into `profiles` policies.
* **Policies:** "Admins can read all profiles" (`profiles`, SELECT) and "Admins can view all setlists" (`setlists`, SELECT, so private playlists are counted and listed). Admins already read all `compositions` / `song_versions` via the existing admin-aware SELECT policies.
* **Queries:** `lib/admin/userQueries.ts` holds the queries with the Supabase client injected (`fetchAdminAccess`, `fetchAdminUsersList`, `fetchAdminUserDetails`); `lib/admin/serverQueries.ts` wraps them with the server client (`checkAdminAccess`, `getAdminUsersList`, `getAdminUserDetails`). Both list and detail queries return `null` for non-admin callers. Pure presentation logic (activity status, role labels, search/filter/sort, totals) lives in `lib/admin/userOverview.ts`.
* **Activity status:** `active` when `profiles.last_seen_at` is within 30 days, `inactive` when older, `never` when null.
* **Not modelled yet:** comments and flags (named as example contributions in Story 3.6.1) have no tables, so they are not shown.

## 6. System Architecture

### 6.1 Technology Stack
* **Framework:** **Next.js 15** (App Router).
* **Styling:** **Tailwind CSS**.
* **Fonts:** **Geist Sans** / **Geist Mono**.
* **Icons:** **Lucide React**.
* **Animations:** **Framer Motion** (Page transitions, micro-interactions).
* **Backend:** **Supabase** (PostgreSQL, Auth, RLS).
* **State Management:** **TanStack Query (React Query)** for server-state caching.
* **Hosting:** Next.js container / Node server (Vite/Node/Docker), deployable to any cloud, PaaS, or VPS hosting provider (e.g., Docker, Kubernetes, Coolify, cloud platforms).

### 6.2 Offline Strategy
* **React Query:** Configured with `staleTime: 1 minute` (default for lists) and `gcTime: 24 hours`. Detail queries may override to 5 minutes.
* **Browser Cache:** Assets cached via Vercel headers.

### 6.3 E2E Testing Environment & Database Isolation
* **Isolation Strategy:** Playwright E2E tests are configured to run against a separate, online staging Supabase instance. This preserves the integrity of the self-hosted Supabase database used to drive the staging application.
* **Database Setup & Seeding:** E2E runs use a Playwright `globalSetup` hook (`e2e/global-setup.ts`) to execute a custom Node.js setup script (`scripts/db/setup-test-db.mjs`). This script connects to the target database, dynamically truncates all public tables (preserving the static `categories` lookup taxonomy), wipes `auth.users`, seeds the fixed test accounts from `supabase/seeds/01_auth_users.sql` and `02_profiles.sql`, and then always runs the programmatic random seeder. The real song collection and its SQL seeds (`03_songs_initial.sql` … `10_personal_recordings.sql`) live in the sibling repository `sacred-fire-songs-collection` and are no longer part of this repository.
* **Static Generated Seed:** `supabase/seeds/03_songs_random_generated.sql` is a snapshot of the generator's output (200 songs, timestamps relative to `now()`), loaded by `supabase db reset` / `supabase start` through `config.toml` `sql_paths`. It is a generated file; regenerate it with `npm run seed:generate` after changing the generator.
* **Programmatic Random Seeding:** `scripts/db/random-seeder.mjs` (PL/pgSQL, executed by `setup-test-db.mjs`; song count via `E2E_RANDOM_SONGS_COUNT`, default 80) generates randomized song titles, ChordPro content, media links, elements/lineage taxonomy mappings, playlists and private user rehearsal recordings (staggered takes for 30% of songs, and multiple 2-5 takes for 50% of songs). The generated songs deliberately cover every song shape the unit and E2E tests exercise; see `docs/testing/song.feature` for the catalogue of situations. This exercises the system's parsing, filtering, layout, search, and private recording drawer list views.
* **Local Optimization:** For fast local test iteration, setting the environment variable `E2E_REUSE_DB=1` skips the database wipe and re-seed, reusing the existing database state.

### 6.4 Testing Pyramid for Story 3.6.1 (Admin Users)
* **Living spec:** `docs/testing/admin-users.feature` (tags `@unit`, `@seed`, `@e2e`, domain tag `@adminUsers`), registered in `cucumber.json` next to `docs/testing/song.feature`.
* **@unit (Cucumber + vitest):** `testing/bdd/steps/admin-users.steps.ts` and `testing/unit/tests/adminUserOverview.test.ts` / `adminQueries.test.ts` run the real query code against `testing/support/fakeSupabase.ts`, an in-memory client that rejects columns missing from the real tables (PostgREST error `42703`).
* **@seed (Cucumber + Postgres):** `testing/bdd/support/db.ts` connects to `DATABASE_URL` (default local Supabase on port 54322), runs each scenario in a rolled-back transaction and impersonates seeded users (`SET LOCAL ROLE authenticated` + `request.jwt.claims`) to check `fn_is_admin()`, RLS on private playlists, and that the fake's column list matches the database.
* **@e2e (Playwright):** `e2e/tests/admin-users.spec.ts` (role-based access, account menu link, overview, search/filter/empty state, detail tabs, unknown user). It upserts one song, version and public playlist for the gatekeeper with fixed ids.

### 6.5 Internationalization (i18n)
* **Languages:** English (default, source of truth), Dutch, Spanish, Italian, Russian, Southern Quechua (Runasimi), French and Brazilian Portuguese. Codes `en nl es it ru qu fr pt`; browser tags `quz`/`quy` map to `qu`, `pt-BR`/`pt-PT` to `pt`; dates use `LOCALE_DATE_TAGS`. Quechua is machine-assisted and needs native review. Only the interface is translated; song content (titles, lyrics, chords, artists, tags) never is. Story 3.7.1 / issue #246; behaviour catalogue in `docs/testing/i18n.feature` (I18N-01 … I18N-10).
* **Dictionaries:** `messages/en.ts` (`as const`, `TranslationKey = keyof typeof en`) and one `Partial<Record<TranslationKey, string>>` file per language (`messages/nl.ts`, `es`, `it`, `ru`, `qu`, `fr`, `pt`), registered in `DICTIONARIES`. Count strings in Russian/Quechua use count-neutral phrasing because the engine only knows one/other. Keys are dot-namespaced per feature; placeholders use `{name}`. Unit tests enforce identical key sets, identical placeholders and no empty values.
* **Engine (`lib/i18n/index.ts`):** no third-party library, no middleware or locale URLs. `tWithLocale(locale, key, params)` interpolates and falls back active dictionary → English → the key itself (never blank). `resolveLocale()` picks the explicit choice (localStorage, then cookie) → first supported browser language (`navigator.languages` / `Accept-Language`, `nl-BE` → `nl`) → English; unknown values are ignored.
* **Server Components:** `const t = await getServerT()` from `lib/i18n/server.ts` reads the `sacred-fire-songs-locale` cookie, else `Accept-Language` (request-scoped, safe under concurrency). The root layout renders `<html lang>` with that locale and passes it to `LocaleProvider`.
* **Client Components:** `const { t } = useLocale()` (`context/LocaleContext.tsx`). The provider starts in the server's locale, so SSR and hydration match (no hydration mismatch, no English flash). After mount it re-reads localStorage/cookie/browser language (`lib/i18n/persistence.ts`); a browser-language default is never persisted. Switching writes localStorage + a 1-year `SameSite=Lax` cookie, updates `<html lang>` and refreshes Server Components until the layout's locale matches (bounded retries).
* **Language switcher:** `components/common/navigation/LanguageSwitcher.tsx` (WAI-ARIA listbox: trigger button + list portalled to `<body>` so it is never clipped; each language in its own name and script, sorted by that name; the active language marked by a lit ember "wick" that ignites once on selection, skipped under reduced motion; keyboard: arrows, Home/End, type-ahead, Enter, Esc; pure logic in `components/common/navigation/languageListbox.ts`) in the sidebar footer (also for guests), the user menu and Account → Preferences → Language. The choice is per device/browser (not stored in the profile) and survives reloads and sign-out.
* **PDF footer & cache (#303/#304):** bottom-left shows the site host and a 1 cm QR code to the page's song; repeated exports reuse the cached PDF (`lib/export/pdfCache.ts`) until the playlist content, language or site changes.
* **PDF export:** `exportPlaylistToPdf({ …, locale })` uses `getPdfLabels(locale)` (`lib/export/pdfExport.ts`) for page footer, song metadata, subtitle and date format; the UI passes the active locale. Song content in the PDF is untranslated; server-action error messages are shown as the toast description under a translated title.
* **Not translated:** `app/manifest.ts` and `<title>`/meta description (static, English); server action error codes; unused starter components (`auth-button`, `logout-button`, `LibrarySidebar`, `home/SearchBar`, `YouTubeEmbed`).

### 6.6 Delivery Pipeline Contract Tests (Epic 5.1, Gitflow CI/CD)
* **Branching:** lightweight Gitflow — `main` (production), `develop` (integration + staging, GitHub default branch), work branches `feat|fix|chore|docs/*` squash-merged into `develop`, `hotfix/*` from `main`. Plan: `docs/plans/2026-10-30-gitflow-cicd-migration.md`.
* **Contract helper:** `testing/support/workflowContract.ts` parses `.github/workflows/*.yml` (via `yaml`) and repo files so the pipeline is tested as data: triggers and branch globs, jobs, environments, step order, SHA-pinned actions.
* **Unit (Vitest):** `testing/unit/tests/ci/workflowContract.test.ts` tests the helper on fixtures plus invariants that already hold (Release Please only on `main`, E2E smoke on PRs into `develop` and `main`).
* **Acceptance (Cucumber, profile `ci`):** `npm run test:bdd:ci` runs the `@ci-contract` scenarios of `docs/testing/gitflow-cicd.feature` with `testing/bdd/steps/gitflow-cicd.steps.ts`. Written test-first: scenarios of unimplemented stories fail or are `pending` until their story lands. Not part of the default profile.
* **Scripts (bats):** `npm run test:scripts` runs `testing/scripts/*.bats`; `start-issue.bats` runs `scripts/cicd/start-issue.sh` in a throw-away clone with a local bare `origin` (diverged `main`/`develop`); `scripts-layout.bats` checks that every script sits in exactly one category folder and is listed in `scripts/README.md`.
* **Scripts layout (#274):** `scripts/` is grouped by purpose and documented in `scripts/README.md`: `scripts/cicd/` (issue worktrees, preview/production promotion, performance benchmark, GitHub roadmap and story sync — the story-sync scripts moved here from `.claude/scripts/`), `scripts/db/` (migrations, E2E database setup, random seeder, seed export, staging clone, auth rate limits) and `scripts/dev/` (icon generation, ChordPro debug helpers). Shellcheck in the `pipeline` job checks `scripts/*/*.sh`.
* **Static checks:** `npm run typecheck` (`tsc --noEmit`; `tsconfig.json` excludes `testing/` and `e2e/`, so tests are not type-checked) and `npm run lint` (`eslint . --max-warnings 181`). Lint ratchet: `no-explicit-any` is a warning, all other rules are errors; the warning cap may only go down.
* **CI quality gate (`.github/workflows/ci.yml`):** on every push and on PRs into `develop`/`main`: jobs `lint`, `typecheck`, `unit` (`npm test`), `bdd` (`test:bdd:unit`, no database), `build`, `pipeline` (actionlint + shellcheck via digest-pinned images, bats, `test:bdd:ci-gate` = strict `@ci-contract` scenarios of implemented stories). The job ids are the required checks of the `main` ruleset.
* **PR policy (`.github/workflows/pr-lint.yml`, check `pr-policy`):** runs `scripts/cicd/lib/prPolicy.mjs` on PRs into `develop`/`main`. Title must be a Conventional Commit (Release Please input); head → base must follow Gitflow (work branches/Dependabot/back-merge `main` → `develop`; `develop`/`hotfix/*`/Release Please → `main`). PR data reaches the script only through `env:` (no script injection).
* **Branch rulesets as code (`.github/rulesets/main.json`, `develop.json`):** deletion + force-push blocked, PR with resolved threads, no bypass actors, required checks = all `ci.yml` jobs + `pr-policy` + `e2e`; `main` and `develop` allow merge + squash (merge commits for promotion and back-merge), never rebase. `testing/unit/tests/ci/rulesets.test.ts` keeps the required checks in sync with the workflow job ids; applied with `gh api … --input`.
* **Scripts under test (bats):** `start-issue.sh` (type/issue validation, base branches), `dev2preview.sh --dry-run` (image names like `docker/metadata-action`: runs of invalid characters → `-`, case kept), scripts layout; a skipped test guards against `gh pr merge --admin` until plan task 4.7.
* **Staging CD (`.github/workflows/deploy-staging.yml`):** a successful `docker.yml` run on `develop` (images `sacred-fire-songs-app` / `-migrator` tagged `:develop` + short SHA; `:latest` is no longer produced anywhere) triggers a deploy in the `Staging` environment. The runner connects with a pinned host key and a key that the VPS locks to `restrict,command="…/deploy-songbook-staging.sh"` (cloud-infra), and sends only `deploy develop <sha>`. The script pulls the images, runs the migrator (self-hosted staging Supabase, no `supabase db push` from CI), restarts the app, waits for the health check and verifies the image's `org.opencontainers.image.revision` label. Staging is Tailscale-only, so all health checks run on the server.
* **Single unit-test tree:** Vitest only collects `testing/unit/tests/**/*.test.{ts,tsx,mjs}`; Playwright specs live in `e2e/`.
* **Supply chain:** every third-party action is pinned to a commit SHA (version in a trailing comment), every workflow declares top-level `permissions`, `.github/dependabot.yml` updates `github-actions` and `npm` weekly against `develop`.

### 6.7 Client Auth State (`useAuth`, #321)
* **Server-seeded:** `app/layout.tsx` resolves the user on the server and passes it to `Header` / `UserProfile` as `initialUser` (`AuthUser` or `null` for a guest). With a server view, `useAuth(initialUser)` starts with `loading = false`, so the header never flashes.
* **Unseeded callers:** `useAuth()` without an argument (`initialUser === undefined`) starts with `loading = true` and only drops it once `getSession()` + profile resolve (5 s profile timeout, guest fallback). Client guards must wait for `!loading` before treating `user === null` as a guest.
* **Prefer server guards:** pages that require login check `supabase.auth.getUser()` in a Server Component and `redirect('/auth/login?next=<path>')` (`/library/playlists/add`, `/library/playlists/[id]`, `/library/recently-viewed`). `/auth/login` redirects an already-signed-in user to `next` (default `/`), so a client guard that fires too early bounces the user to the home page.
* **Tests:** `testing/unit/tests/useAuth.test.ts` (first-render state), `e2e/tests/playlist-add-auth.spec.ts` (logged-in user stays on the form, guest gets `next=`).

## 7. Screen Inventory (Implemented)

### 7.1 Screen 1: Home (Dashboard)
* **Status:** Implemented (`app/page.tsx`).
* **Features:** Quick stats / actions cards, 10 Latest Songs list. (Search moved to Dedicated Search page).

### 7.2 Screen 2: Song Detail
* **Status:** Implemented (`app/songs/[id]/page.tsx`).
* **Features:** Sticky Header with Back Button, Version Pills, ChordPro Display. Integrated "Record Rehearsal" trigger to launch private recording space.

### 7.2b Rehearsal Space (Slide-Up Bottom Sheet Drawer)
* **Status:** Implemented (`components/song/RehearsalDrawer.tsx`).
* **Features:** Live microphone capture (HTML5 MediaRecorder), local playback pre-save review, private cloud storage upload (Supabase Storage 'rehearsals' private bucket), and list of past saved takes with play/delete actions.

### 7.3 Screen 3: Login
* **Status:** Mockup Only (Doc). Implementation Pending.

### 7.4 Screen 4: Add Song
* **Status:** Implemented (`app/songs/add/page.tsx`).
* **Features:** Reuseable `SongForm` with Metadata support (Language, Tags, YouTube/Spotify/SoundCloud links), File Upload import, and Client-Side Access Control.

### 7.5 Screen 5: Edit Song
* **Status:** Implemented (`app/songs/[id]/edit/page.tsx`).
* **Features:** Route Protection (Owner/Admin), Data Prefill, Save Mutation.

### 7.6 Screen 6: Access Denied
* **Status:** Implemented (`components/common/AccessDenied.tsx`).
* **Features:** Visual error page for unauthorized edit attempts.

### 7.7 Screen 7: Explore Categories
* **Status:** Mockup Updated (`doc/design/screens/screen7_explore_categories.html`).
* **Features:** Grid of categories and subcategories, inter-linking to Screen 8.

### 7.8 Screen 8: Category Detail (Results) [DEPRECATED]
* **Status:** Deprecated (Merged into Screen 15).
* **Notes:** Replaced by the enhanced Library Hub (`doc/design/screens/screen15_library.html`) which now supports full category filtering.

### 7.10 Screen 15: Search Songs
* **Status:** Implemented (`app/songs/SongsPageContent.tsx`).
* **Features:** Unified search and filtering hub. Supports elements, origins, and categories. Includes active filter pills and results count.

### 7.11 Screen 16: Playlists
* **Status:** Mockup Created (`doc/design/screens/screen16_playlists.html`).
* **Features:** Playlist management with creation and list view of ceremonial sets.

### 7.12 Admin Users Overview
* **Status:** Implemented (`app/admin/users/page.tsx`, `components/admin/AdminUsersTable.tsx`). No mockup in `docs/design/screens/`; the layout mirrors the Library section (`app/library/layout.tsx`, `LibraryTabs.tsx`): `<main>` scroll container, "Administration" title with pill tabs (Users, Configuration – planned), and summary cards styled like `components/home/LibrarySummary.tsx`.
* **Access:** `app/admin/layout.tsx` checks the role server-side; non-admins get `components/admin/AccessDeniedNotice.tsx`, guests are redirected to `/auth/login` by `proxy.ts`. Entry points: "Admin Portal" in the account menu and "Administration" in the sidebar (admins only).
* **Features:** Totals (users, active in last 30 days, songs, playlists, admins & gatekeepers), search by name/e-mail, role filter (the "Musician / Expert" option matches both roles), sort (recently joined, top contributors, name A-Z / Z-A, most / fewest songs; the choice is stored in `localStorage` under `admin-users-sort`), and one row per user with role badge, e-mail, songs/versions/playlists counts, activity status and join date. The whole row opens the user's details (stretched link, so Enter, middle-click and Ctrl/Cmd-click work). Separate empty states for "no users" and "no matches".
* **Pickers:** role and sort use `WickSelect` (WAI-ARIA listbox portalled to `<body>`: arrow/Home/End/type-ahead keys, Escape closes, lit "ember" marks the chosen option and ignites once on change). Role filter options carry their role's color from `lib/admin/roleColors.ts`, the same source as the role badges.

### 7.13 Admin User Detail
* **Status:** Implemented (`app/admin/users/[id]/page.tsx`, `components/admin/AdminUserDetailView.tsx`, `app/admin/users/[id]/not-found.tsx`).
* **Features:** Breadcrumb (Administration › Users), profile card (name, e-mail, id, role, join date, last active, activity status, musician status), and pill tabs with counts listing songs added, versions submitted and playlists (with public count, public/private badges). An unknown id shows "User Not Found" with a link back to the list.
