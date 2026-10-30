# Project Analysis & Design Document: Song Sharing Application (Sacred Fire Songs)

**Version:** 1.36
**Status:** Living Document
**Date:** Oct 30, 2026

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
| **1.36** | Oct 30, 2026 | Epic 3.6 / Story 3.6.1 (Admin User Overview & Contributions, #257/#258): admin area `/admin/users` and `/admin/users/[id]` with server-side role guard, `public.fn_is_admin()` and admin read policies on `profiles`/`setlists`, per-user status (active/inactive/never), musician status, contribution counts and lists. Fixed the user detail query to use `compositions.original_author` and `song_versions.composition_id`/`version_name`. Added sections 5.2 (admin access), 6.4 (testing pyramid for Story 3.6.1), 7.12–7.13 (admin screens). |


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
* **Database Setup & Seeding:** E2E runs use a Playwright `globalSetup` hook (`e2e/global-setup.ts`) to execute a custom Node.js setup script (`scripts/setup-test-db.mjs`). This script connects to the target database, dynamically truncates all public tables (preserving the static `categories` lookup taxonomy), wipes `auth.users`, seeds the fixed test accounts from `supabase/seeds/01_auth_users.sql` and `02_profiles.sql`, and then always runs the programmatic random seeder. The real song collection and its SQL seeds (`03_songs_initial.sql` … `10_personal_recordings.sql`) live in the sibling repository `sacred-fire-songs-collection` and are no longer part of this repository.
* **Static Generated Seed:** `supabase/seeds/03_songs_random_generated.sql` is a snapshot of the generator's output (200 songs, timestamps relative to `now()`), loaded by `supabase db reset` / `supabase start` through `config.toml` `sql_paths`. It is a generated file; regenerate it with `npm run seed:generate` after changing the generator.
* **Programmatic Random Seeding:** `scripts/random-seeder.mjs` (PL/pgSQL, executed by `setup-test-db.mjs`; song count via `E2E_RANDOM_SONGS_COUNT`, default 80) generates randomized song titles, ChordPro content, media links, elements/lineage taxonomy mappings, playlists and private user rehearsal recordings (staggered takes for 30% of songs, and multiple 2-5 takes for 50% of songs). The generated songs deliberately cover every song shape the unit and E2E tests exercise; see `docs/testing/song.feature` for the catalogue of situations. This exercises the system's parsing, filtering, layout, search, and private recording drawer list views.
* **Local Optimization:** For fast local test iteration, setting the environment variable `E2E_REUSE_DB=1` skips the database wipe and re-seed, reusing the existing database state.

### 6.4 Testing Pyramid for Story 3.6.1 (Admin Users)
* **Living spec:** `docs/testing/admin-users.feature` (tags `@unit`, `@seed`, `@e2e`, domain tag `@adminUsers`), registered in `cucumber.json` next to `docs/testing/song.feature`.
* **@unit (Cucumber + vitest):** `testing/bdd/steps/admin-users.steps.ts` and `testing/unit/tests/adminUserOverview.test.ts` / `adminQueries.test.ts` run the real query code against `testing/support/fakeSupabase.ts`, an in-memory client that rejects columns missing from the real tables (PostgREST error `42703`).
* **@seed (Cucumber + Postgres):** `testing/bdd/support/db.ts` connects to `DATABASE_URL` (default local Supabase on port 54322), runs each scenario in a rolled-back transaction and impersonates seeded users (`SET LOCAL ROLE authenticated` + `request.jwt.claims`) to check `fn_is_admin()`, RLS on private playlists, and that the fake's column list matches the database.
* **@e2e (Playwright):** `e2e/tests/admin-users.spec.ts` (role-based access, account menu link, overview, search/filter/empty state, detail tabs, unknown user). It upserts one song, version and public playlist for the gatekeeper with fixed ids.

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
* **Status:** Implemented (`app/admin/users/page.tsx`, `components/admin/AdminUsersTable.tsx`). No mockup in `docs/design/screens/`; follows the card/pill styling of the existing screens.
* **Access:** `app/admin/layout.tsx` checks the role server-side; non-admins get `components/admin/AccessDeniedNotice.tsx`, guests are redirected to `/auth/login` by `proxy.ts`. Entry points: "Admin Portal" in the account menu and "Administration" in the sidebar (admins only).
* **Features:** Totals (users, active in last 30 days, songs, playlists, staff), search by name/e-mail, role filter (the "Musician / Expert" option matches both roles), sort (recently joined, top contributors, name), and one row per user with role badge, e-mail, songs/versions/playlists counts, activity status and join date. Separate empty states for "no users" and "no matches".

### 7.13 Admin User Detail
* **Status:** Implemented (`app/admin/users/[id]/page.tsx`, `components/admin/AdminUserDetailView.tsx`, `app/admin/users/[id]/not-found.tsx`).
* **Features:** Profile card (name, e-mail, id, role, join date, last active, activity status, musician status), contribution cards (songs, versions, playlists with public count), and tabs listing songs added, versions submitted and playlists (public/private). An unknown id shows "User Not Found" with a link back to the list.
