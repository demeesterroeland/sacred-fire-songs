# Project Analysis & Design Document: Song Sharing Application (Sacred Fire Songs)

**Version:** 1.74
**Status:** Living Document
**Date:** Nov 5, 2026

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
| **1.50** | Oct 31, 2026 | §6.6: staging continuous deployment from `develop` (`docker.yml` develop images, no `:latest`; `deploy-staging.yml` → SSH forced command `<server-deploy-script>` in <infra-repo>) (Epic 5.1 Phase 3, #284). |
| **1.51** | Oct 31, 2026 | Added §6.7 Client Auth State (#321): `useAuth()` without a server user starts with `loading = true` until the session resolves (`initialUser` `undefined` = unknown, `null` = server-confirmed guest); `/library/playlists/add` guards auth on the server (`redirect('/auth/login?next=/library/playlists/add')`) with the form in `components/playlists/CreatePlaylistForm.tsx`. Fixes logged-in users being redirected to `/` from "New Playlist". Lint cap lowered to 181. |
| **1.52** | Nov 3, 2026 | Public-repo isolation: removed `deploy-staging.yml` (deployment is out of scope for this public repo; CI only publishes images to GHCR), added `isolation` CI job + `scripts/dev/isolation-guard.sh` (pre-commit, commit-msg, Claude Code hook), `performance.yml` takes its target from input/`PERF_BASE_URL`. Root `AGENTS.md` is now the canonical agent instruction file (`CLAUDE.md` imports it, `GEMINI.md` symlinks it). |
| **1.53** | Nov 4, 2026 | Offline navigation fallback (#353): §3.3 and §6.2 — `public/sw.js` stores the self-contained `public/offline.html` and serves it for page navigations while the browser is offline (online requests stay native); texts from the `offline.*` dictionary keys. Song lookup moved to `lib/songs/fetchSong.ts` and uses `.maybeSingle()`, so an unknown song id shows "Song Not Found" instead of a load error. Spec: `docs/testing/offline.feature`. |
| **1.54** | Nov 4, 2026 | Private Song Sharing, DRM-lite & Singer Attribution (§6.8): schema migration `20261104160000_recording_sharing_and_attribution.sql`, `recording_shares` table, RLS policies for own/shared/public audio, owner verification for sharing and DRM-lite download restrictions (stream-only for shared recipients), explicit singer consent disclaimer modal before public publishing, verified musician attribution linking to `/users/:id` and graceful pending badge for unregistered singers. Executable spec: `docs/testing/recording-sharing.feature`. |
| **1.55** | Nov 4, 2026 | Sharing RLS uses `security definer` helpers `is_recording_owner` / `has_recording_share` (no policy recursion between `user_recordings` and `recording_shares`). Seed audio: four deterministic 30 s sample MP3s (`scripts/dev/generate-sample-recordings.py`) plus the 90 s song `heartbeat-of-the-earth.mp3` in `supabase/seeds/audio/`, uploaded to the `rehearsals` bucket for every seeded recording with `npm run seed:audio`. Known DRM-lite limit tracked in #372 (signed URL can be saved by a recipient). |
| **1.56** | Nov 4, 2026 | Share notifications (§6.9, Story 4.6.6, #373): migration `20261104190000_recording_share_notifications.sql` adds the `notifications` inbox (trigger-created, recipient may only set `read_at`), `recording_shares.email_sent_at`, `profiles.email_notifications` and the `claim_recording_share_email` RPC. Header bell (`NotificationBell`), email opt-out in Settings → Preferences (linked from the email via `/account/settings?tab=preferences`), recording permalink `/recordings/:recordingId` → `/songs/:id?recording=:recordingId` (bell, email, "Copy link"), SMTP mail via `nodemailer` (`SMTP_*`, `SITE_URL`). Spec: `docs/testing/share-notifications.feature`. |
| **1.57** | Nov 5, 2026 | §6.6 Gitflow promotion (Story 5.1.8, #297, re-scoped): CI and image delivery live in this repo, deployment (CD) outside it. `scripts/cicd/develop2main.sh` replaces `preview2prod.sh` (PR `develop` → `main`, merge commit, no `--admin`; then Release Please PR; prints `vX.Y.Z` images). Release images contract (`{{tag}}` + semver, no `:latest`) and "no `deploy*` workflow" contract added to the strict `ci-gate` profile; `@deferred` tag excludes blocked scenarios. |
| **1.58** | Nov 5, 2026 | §6.6 automatic back-merge (Story 5.1.9, #298): `.github/workflows/back-merge.yml` opens a PR `main` → `develop` after every push to `main` (PAT `RELEASE_PLEASE_TOKEN` so CI runs, fails closed without it), labels conflicts `back-merge-conflict`, never merges itself. |
| **1.59** | Nov 5, 2026 | §6.9 recording permalink: unreachable `/recordings/:id` links render a recording-specific "Recording Not Available" page (`app/recordings/[id]/not-found.tsx`, `NotFound` takes optional `titleKey` / `descriptionKey`, keys `feedback.notFound.recording.*` in all 8 locales) instead of the song-themed "Song Not Found". Same copy for no access, unknown and malformed ids. |
| **1.60** | Nov 5, 2026 | §6.6 documentation contract (Story 5.1.13, #300): `@story-5.1.13` `ci-gate` scenarios check that the guides, PR template, `/start-story` and README describe Gitflow (no "GitHub Flow", no "no develop branch" outside changelogs). `development-workflow.md` 2.0, Gitflow PR template with test-pyramid checklist. |
| **1.61** | Nov 5, 2026 | UX v2 (Epic 6.1, Story 6.1.1 / #385): added §6.10 Design System — semantic tokens (`app/styles/sober.css`, `data-style="sober"` × light/dark), Tailwind utility map, component primitives (Button, ListRow, MetaLine, Chip, BottomSheet, Toolbar), token-parity/contrast tests and palette ratchet. |
| **1.62** | Nov 5, 2026 | UX v2 (Story 6.1.33 / #417): §6.3 demo-data hygiene — Playwright `globalTeardown` (`e2e/global-teardown.ts`) removes E2E fixtures; unit + @seed checks that no playlist title looks like a test fixture (`lib/seed/dataHygiene.ts`). |
| **1.63** | Nov 5, 2026 | UX v2 (Story 6.1.8 / #392): Song Detail sticky mobile header — title on one line, left aligned, ellipsis at the end (marquee removed), token styling. |
| **1.64** | Nov 5, 2026 | UX v2 (Story 6.1.23 / #407): Library tab row — Playlists · History · Artists from `libraryTabs()` (`lib/navigation.ts`); Albums hidden behind `FEATURES.albums` (`lib/features.ts`, UXD-4), `/library/albums` renders the not-found page while off. |
| **1.66** | Nov 5, 2026 | UX v2 (Story 6.1.6 / #390): Song Detail reader toolbar — `ReaderToolbar` (`Chords · A− · A+`) under the meta lines; lyric size from `LYRIC_STEPS`, chords layer on/off, both stored per device (`lib/reader/readerPrefs.ts`, key `sacred-fire-songs-reader`). Removed the disabled `Large Stage Font` preference. |
| **1.65** | Nov 5, 2026 | UX v2 (Story 6.1.7 / #391): Song Detail meta — `SongMetaLines` replaces the coloured pills, technical badges and the Key/Capo/Tuning grid with two grey lines (`lib/songs/songMeta.ts`). |
| **1.74** | Nov 5, 2026 | UX v2 (Story 6.1.15 / #399, G4.2, UXD-3): the Practice Record tab lists **My takes** and **Shared with me** apart (`partitionTakes` in `lib/songs/partitionTakes.ts`; section hidden when empty). A shared row says **Shared by {name}** in its meta line (`recording.sharing.sharedBy`, name from `getUserRecordings` → `shared_by_name`) and offers listen only: no download, share or delete. New key `practice.takes.shared` in all 8 locales; the mini-player source menu follows the same split. §7.2b updated. No migration, no RLS change. |
| **1.73** | Nov 5, 2026 | UX v2 (Story 6.1.2 / #386): song cards become compact rows — title, one grey meta line `Author · Category · Language` (`songRowMeta()`), key badge, 44 px heart / add-to-playlist; the same row style in Library (recently viewed, new since last visit, playlist detail) and Artists. |
| **1.72** | Nov 5, 2026 | UX v2 (Story 6.1.12 / #396, G3.1, UXD-5): added §6.13 "Mini player" — the bar appears only after play, `--mini-player-h` reserves room for sheets, the Practice drawer and the song page. |
| **1.71** | Nov 5, 2026 | UX v2 (Story 6.1.14 / #398, G4.1): one name, **Practice**, for the rehearsal feature — drawer title, song menu entry, tabs Listen / Record, list heading My takes, Takes chip (`SongMetaLines` link), Library card Your takes, guest card Practice recorder (all 8 locales; message keys `practice.*`). Review fixes: recorder, dialogs, share e-mail and mini-player now say "take" (values only, key names unchanged); mini-player source groups are headed Listen / My takes; `translationKeysExist` test guards literal `t('key')` usage. §7.2b updated. |
| **1.70** | Nov 5, 2026 | UX v2 (Epic 6.1, Story 6.1.26 / #410; review fixes: `next=` hardened at every consumer, heart gate, `/account` and `/users` removed from `PROTECTED_PATH_PREFIXES` so those pages render the gate): added §6.12 GuestGate — one locked preview with a reason and a `next=` sign-in link on every members-only screen; anon read of public takes now requires singer consent (UXD-2, migration `20261105120000`); `db-schema.sql` 3.1. |
| **1.69** | Nov 5, 2026 | UX v2 (Story 6.1.22 / #406): §6.11 Unknown URLs — the proxy (`lib/supabase/proxy.ts`) redirects guests to login only for `PROTECTED_PATH_PREFIXES` (`lib/supabase/routeAccess.ts`: `/account`, `/admin`, `/users`); every other unknown path renders `app/not-found.tsx` ("Page not found" + "Go home", `feedback.notFound.page.*` in all 8 locales, token-styled `NotFound`). Song (`app/songs/[id]/not-found.tsx`) and recording not-found pages keep their own copy. An unmatched URL is HTTP 404; `notFound()` inside streamed routes keeps HTTP 200 with a `noindex` meta (`app/loading.tsx`). |


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
* **[Implemented] Offline fallback page (#353):** a page navigation without a connection shows a branded offline page in the visitor's interface language, with Retry and an automatic reload when the connection returns, instead of the browser's error page. Reading songs offline from a cache is not implemented yet (Story 4.5.1, second scenario).

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
* **Service worker (`public/sw.js`):** on install it stores `public/offline.html` in the `sfs-offline-v<n>` cache (activate removes older versions). Its fetch handler answers only `GET` page navigations while `navigator.onLine` is false, with that page; everything else, and every request while online, is left to the browser (a pass-through fetch handler once broke online navigations). Why it is needed: when Next.js cannot fetch the RSC payload of a client-side navigation it falls back to a full browser navigation, which offline ends on the browser's error page. `offline.html` is self-contained (inline CSS and script) and resolves its language like `resolveLocale()`; bump the cache version when it changes. Behaviour and tests: `docs/testing/offline.feature` (@unit via a Node `vm` harness, @e2e in `e2e/tests/offline.spec.ts`).

### 6.3 E2E Testing Environment & Database Isolation
* **Isolation Strategy:** Playwright E2E tests are configured to run against a separate, online staging Supabase instance. This preserves the integrity of the self-hosted Supabase database used to drive the staging application.
* **Database Setup & Seeding:** E2E runs use a Playwright `globalSetup` hook (`e2e/global-setup.ts`) to execute a custom Node.js setup script (`scripts/db/setup-test-db.mjs`). This script connects to the target database, dynamically truncates all public tables (preserving the static `categories` lookup taxonomy), wipes `auth.users`, seeds the fixed test accounts from `supabase/seeds/01_auth_users.sql` and `02_profiles.sql`, and then always runs the programmatic random seeder. The real song collection and its SQL seeds (`03_songs_initial.sql` … `10_personal_recordings.sql`) live in the sibling repository `sacred-fire-songs-collection` and are no longer part of this repository.
* **Static Generated Seed:** `supabase/seeds/03_songs_random_generated.sql` is a snapshot of the generator's output (200 songs, timestamps relative to `now()`), loaded by `supabase db reset` / `supabase start` through `config.toml` `sql_paths`. It is a generated file; regenerate it with `npm run seed:generate` after changing the generator. The seed only holds recording metadata; `npm run seed:audio` uploads the sample MP3s from `supabase/seeds/audio/` to the `rehearsals` bucket for every seeded `user_recordings` row (local stack only).
* **Programmatic Random Seeding:** `scripts/db/random-seeder.mjs` (PL/pgSQL, executed by `setup-test-db.mjs`; song count via `E2E_RANDOM_SONGS_COUNT`, default 80) generates randomized song titles, ChordPro content, media links, elements/lineage taxonomy mappings, playlists and private user rehearsal recordings (staggered takes for 30% of songs, and multiple 2-5 takes for 50% of songs). The generated songs deliberately cover every song shape the unit and E2E tests exercise; see `docs/testing/song.feature` for the catalogue of situations. This exercises the system's parsing, filtering, layout, search, and private recording drawer list views.
* **Demo-Data Hygiene (Story 6.1.33):** tests must not leave fixtures in the shared database. `e2e/global-teardown.ts` (Playwright `globalTeardown`, runs once after all projects) deletes the admin-users fixtures by their fixed ids plus timestamped `Smoke Test Playlist <ms>` playlists and `E2E Practice/Uploaded File/Continuity Test - <ms>` takes older than ten minutes, in one transaction that never fails the run. `lib/seed/dataHygiene.ts` (`isTestFixtureTitle`) defines what a fixture title looks like; `testing/unit/tests/dataHygiene.test.ts` checks the committed seed and `docs/testing/ux-v2-data-hygiene.feature` (@seed) checks the database.
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
* **CI quality gate (`.github/workflows/ci.yml`):** on every push and on PRs into `develop`/`main`: jobs `lint`, `typecheck`, `unit` (`npm test`), `bdd` (`test:bdd:unit`, no database), `build`, `pipeline` (actionlint + shellcheck via digest-pinned images, bats, `test:bdd:ci-gate` = strict `@ci-contract` scenarios of implemented stories, minus `@deferred`). The job ids are the required checks of the `main` ruleset.
* **PR policy (`.github/workflows/pr-lint.yml`, check `pr-policy`):** runs `scripts/cicd/lib/prPolicy.mjs` on PRs into `develop`/`main`. Title must be a Conventional Commit (Release Please input); head → base must follow Gitflow (work branches/Dependabot/back-merge `main` → `develop`; `develop`/`hotfix/*`/Release Please → `main`). PR data reaches the script only through `env:` (no script injection).
* **Branch rulesets as code (`.github/rulesets/main.json`, `develop.json`):** deletion + force-push blocked, PR with resolved threads, no bypass actors, required checks = all `ci.yml` jobs + `pr-policy` + `e2e`; `main` and `develop` allow merge + squash (merge commits for promotion and back-merge), never rebase. `testing/unit/tests/ci/rulesets.test.ts` keeps the required checks in sync with the workflow job ids; applied with `gh api … --input`.
* **Scripts under test (bats):** `start-issue.sh` (type/issue validation, base branches), `dev2preview.sh --dry-run` (image names like `docker/metadata-action`: runs of invalid characters → `-`, case kept), `develop2main.sh` (stubbed `gh`: promotion PR `develop` → `main`, `--merge` only, owner confirmation, `--dry-run` prints the `vX.Y.Z` images), scripts layout, and no shell script may run `gh pr merge … --admin`.
* **Promotion (`scripts/cicd/develop2main.sh`, Story 5.1.8):** opens or reuses the PR `develop` → `main` (title `chore(release): promote develop to main`), waits for its checks, asks for the owner's confirmation (`--yes` skips) and merges with a merge commit (never `--squash`, `--admin`, `--auto` or `--delete-branch`); then merges the Release Please PR, optionally prepends a summary to the GitHub Release and prints the explicit `vX.Y.Z` app/migrator images.
* **Back-merge (`.github/workflows/back-merge.yml`, Story 5.1.9):** on every push to `main` (promotion, Release Please release commit, hotfix) it opens or reuses the PR `main` → `develop` when `main` is ahead. It uses the PAT `RELEASE_PLEASE_TOKEN` as `GH_TOKEN` (PRs created with `GITHUB_TOKEN` do not trigger CI) and fails closed without it; a test merge labels conflicting PRs `back-merge-conflict` and comments. The PR is never merged by the workflow: the owner merges it with a merge commit after the required checks.
* **Documentation contract (Story 5.1.13):** `@story-5.1.13` scenarios (strict `ci-gate`) read `docs/guides/git-workflow.md`, `docs/guides/development-workflow.md`, `.github/pull_request_template.md`, `.claude/commands/start-story.md` and `README.md` without their changelog rows and require the Gitflow terms (`develop`, `hotfix/`, back-merge, …) while forbidding "GitHub Flow" / "no develop branch".
* **Images, not deployments (CI vs CD boundary):** CI (build, lint, tests) and image delivery live in this repo; deployment (CD) does not. `docker.yml` publishes `sacred-fire-songs-app` / `-migrator` to GHCR (`develop` → `:develop` + short SHA; `main` → short SHA; published release / `v*` tags → `vX.Y.Z` + `X.Y.Z`; no `:latest`). Deploying those images (staging or production, including approvals and deploy secrets) is up to each self-hoster and is deliberately not part of this public repo: there are no deploy workflows (`deploy*.yml`), SSH keys or GitHub Environments here, enforced by the `@story-5.1.7`/`@story-5.1.8` contracts.
* **Public-repo isolation (`isolation` job, `scripts/dev/isolation-guard.sh`):** scans every tracked file against a denylist that is kept outside the repo (CI secret `ISOLATION_DENYLIST`, locally `~/.config/sfs/denylist`) and fails closed when the list is missing. The same script runs as `.githooks/pre-commit` (staged diff), `.githooks/commit-msg` and as a Claude Code `PreToolUse` hook.
* **Single unit-test tree:** Vitest only collects `testing/unit/tests/**/*.test.{ts,tsx,mjs}`; Playwright specs live in `e2e/`.
* **Supply chain:** every third-party action is pinned to a commit SHA (version in a trailing comment), every workflow declares top-level `permissions`, `.github/dependabot.yml` updates `github-actions` and `npm` weekly against `develop`.

### 6.7 Client Auth State (`useAuth`, #321)
* **Server-seeded:** `app/layout.tsx` resolves the user on the server and passes it to `Header` / `UserProfile` as `initialUser` (`AuthUser` or `null` for a guest). With a server view, `useAuth(initialUser)` starts with `loading = false`, so the header never flashes.
* **Unseeded callers:** `useAuth()` without an argument (`initialUser === undefined`) starts with `loading = true` and only drops it once `getSession()` + profile resolve (5 s profile timeout, guest fallback). Client guards must wait for `!loading` before treating `user === null` as a guest.
* **Prefer server guards:** pages that require login check `supabase.auth.getUser()` in a Server Component and `redirect('/auth/login?next=<path>')` (`/library/playlists/add`, `/library/playlists/[id]`, `/library/recently-viewed`). `/auth/login` redirects an already-signed-in user to `next` (default `/`), so a client guard that fires too early bounces the user to the home page.
* **Tests:** `testing/unit/tests/useAuth.test.ts` (first-render state), `e2e/tests/playlist-add-auth.spec.ts` (logged-in user stays on the form, guest gets `next=`).

### 6.8 Private Song Sharing, DRM-lite & Singer Attribution
* **Data Model & Schema:** Extended `user_recordings` with `is_public` (boolean), `singer_consent_confirmed` (boolean), `singer_profile_id` (UUID references `profiles.id`), `singer_name` (text), and `singer_email` (text). Created join table `recording_shares` (`id`, `recording_id`, `shared_with_user_id`, `created_at`) with foreign keys cascading on delete. Performance indexes on `(recording_id, shared_with_user_id)` and lookup columns.
* **Strict Permissions & DRM-lite:**
  - Recording owners can manage sharing and revoke access. Non-owners (shared recipients) cannot share or reshare recordings.
  - Streaming playback is allowed for shared recipients via signed URLs or public access.
  - Downloads are strictly blocked for non-owners (`getRecordingDownloadUrl` rejects non-owners; client download buttons and controls are omitted for shared recipients).
* **Singer Consent Disclaimer:** Transitioning a recording to public visibility requires explicit user acknowledgement of singer consent via a confirmation modal (`RecordingPublishModal`), persisting `singer_consent_confirmed = true`.
* **Singer Attribution:**
  - Registered musicians: linked by `singer_profile_id` with verified badge and profile link (`/users/:id`), displaying public attributed recordings.
  - Unregistered singers: handled gracefully with `singer_name` and pending invite status badge without breaking playback or navigation.
* **Supabase RLS & Storage Security:**
  - Storage bucket `rehearsals`: SELECT permits owner (`(storage.foldername(name))[1] = auth.uid()::text`), recipients with an active share in `recording_shares`, or public recordings.
  - Profiles: targeted RLS read policies permit reading singer attribution profiles and recipient identities without blanket profile exposure.
* **Tests & Quality:** Executable Gherkin spec `docs/testing/recording-sharing.feature`, step definitions `testing/bdd/steps/recording-sharing.steps.ts`, Vitest unit test suite `testing/unit/tests/recordingSharing.test.ts`, and full 8-locale key parity in `messages/*.ts`.

### 6.9 Share Notifications (Story 4.6.6)
* **In-app notifications:** `public.notifications` (`user_id`, `actor_id`, `type`, `recording_id`, `composition_id`, `metadata` jsonb, `read_at`, `created_at`). Rows are created only by the `security definer` trigger `fn_notify_recording_shared` on `recording_shares` INSERT; there is no INSERT policy. Errors in the trigger are caught and logged as WARNING, so a notification failure never blocks a share. Revoking a share deletes its notification (`fn_remove_recording_share_notification`). RLS: recipients read and delete their own rows; the only column they may update is `read_at` (column grant). `metadata` snapshots `actor_name`, `song_title` and `recording_name`; the UI renders the text with `t('notifications.recordingShared')`, so it follows the reader's locale.
* **Header bell:** `components/common/navigation/NotificationBell.tsx` (signed-in users) shows the unread count and the latest 20 notifications (`lib/notifications/queries.ts`). It refetches on window focus and every 60 s. Opening an item marks it read and goes to the recording permalink (`/recordings/:recordingId`); "Mark all as read" clears the badge.
* **Transactional email:** After a new share (not a duplicate), `shareRecording` calls the server action `sendRecordingShareEmail` (`lib/actions/notifications.ts`) fire-and-forget. The action calls the `claim_recording_share_email` RPC, which sets `recording_shares.email_sent_at` and returns the recipient details only if the caller owns the recording, the share has not been emailed yet and the recipient has `profiles.email_notifications = true`. That makes it idempotent and owner-only. Mail is sent with `after()` over SMTP (`lib/notifications/mailer.ts`, `nodemailer`). Failures are logged, never surfaced. Content: `buildRecordingSharedEmail` (`lib/notifications/email.ts`, `email.recordingShared.*` keys, HTML-escaped, default locale because profiles do not store a language yet). The button links to the recording permalink (`notificationLink(…, recordingId)`); the footer links to `emailSettingsLink()` = `<SITE_URL>/account/settings?tab=preferences`.
* **Recording permalink:** `/recordings/:recordingId` (`app/recordings/[id]/page.tsx`, public in `lib/supabase/proxy.ts`) is the shareable link used by the bell, the email and "Copy link". It reads the recording under RLS (owner, share recipients, public recordings) and redirects to `/songs/:compositionId?recording=:recordingId`. A guest who cannot see it is sent to `/auth/login?next=/recordings/:recordingId`; a signed-in user without access gets a 404 with recording-specific copy (identical for unknown, malformed and inaccessible ids), so the link does not reveal that the recording exists. The link grants nothing by itself.
* **Recording deep links:** `/songs/:compositionId?recording=:recordingId` (`lib/songs/recordingLink.ts`: `recordingPermalink`, `songRecordingPath`, `parseRecordingParam` accepts only a UUID). The song page looks up the recording's `song_version_id` (RLS decides access), selects that version, opens the Rehearsal drawer on the Recordings tab and highlights the row (`aria-current`, scrolled into view); closing the drawer clears the highlight. A recording the viewer cannot read shows "This recording is not available to you" (`rehearsal.recording.linkUnavailable`); guests get the drawer's sign-in prompt. Owners copy the permalink from the row's ⋯ menu ("Copy link"); for a private recording that is not shared yet, the toast adds that only the owner can open it (`rehearsal.recording.linkOwnerOnly`). The guest sign-in prompt in the Recordings tab links to `/auth/login?next=<current path and query>`. Recordings of other users have no drag handle (positions are owner-only) but keep an empty slot so the rows stay aligned.
* **Configuration:** `SMTP_HOST` (empty = email off; in-app notifications still work), `SMTP_PORT` (465 = TLS on connect, otherwise STARTTLS), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SITE_URL` (base for email links; required in production because the request `Host` header is caller-controlled). Local: `supabase/config.toml` exposes the mail catcher's SMTP port `54325` (UI on `54324`).
* **Preferences:** Settings → Preferences → "Email notifications" toggles `profiles.email_notifications`. `/account/settings?tab=<profile|account|preferences|privacy>` opens that tab (`parseSettingsTab`; unknown values open Profile, and the login redirect keeps the tab).
* **Tests:** `docs/testing/share-notifications.feature` (`@unit` email content, `@seed` trigger/RLS/claim RPC), Vitest `testing/unit/tests/shareNotifications.test.ts` and share wiring in `testing/unit/tests/recordingSharing.test.ts`.

### 6.10 Design System (UX v2, Story 6.1.1)
* **Tokens:** semantic CSS variables in `app/styles/sober.css`, scoped by `:root[data-style="sober"]` (set on `<html>` in `app/layout.tsx` from `ACTIVE_STYLE`, `lib/design/tokens.ts`) and switched to dark by the existing `.dark` class (ADR 0007 / UXD-7). Greys carry structure; `--accent` (fire orange) is the only hue (primary action, now playing, chords); `--danger` only with a label. Type 12–28 px, spacing 4/8/12/16/24/32, radius control/panel/sheet/pill, 44 px tap size, one sheet shadow. Reference: `docs/design/design-tokens.md`, mockups `docs/design/screens/v2/`.
* **Tailwind:** `app/globals.css` maps tokens to utilities in `@theme inline` (`bg-surface`, `text-fg-muted`, `border-line`, `bg-accent`, `text-on-accent`, `text-chord`, `text-meta`, `rounded-control`, `min-h-tap`, `shadow-sheet` …); shadcn names (`bg-primary`, `bg-muted`, `border-input`, `ring-ring` …) alias the same tokens. `accent` means the fire accent, not shadcn's hover grey. Bridge: Tailwind's grey palettes render as warm sober greys (same lightness) until each restyle story moves its files to semantic utilities.
* **Primitives (`components/ui/`):** `button` (primary/secondary/outline/ghost/text/destructive, ≥ 44 px), `list-row`, `meta-line` (`joinMeta`), `chip` (filter-only, `aria-pressed` + check), `bottom-sheet` (Radix Dialog, bottom on phones, reserves `--mini-player-h`; `SheetAction`, `SheetSeparator`), `toolbar` (`ToolbarButton` with `aria-pressed`).
* **Browser chrome:** `<meta name="theme-color">` = `--bg` per mode (`THEME_COLOR`).
* **Tests:** `docs/testing/ux-v2-design-system.feature` (`@unit @story-6.1.1`), Vitest `testing/unit/tests/design/designTokens.test.ts` (doc ↔ CSS parity, theme references, one accent, ≥ 12 px, WCAG contrast in both modes) and `paletteRatchet.test.ts` (palette classes in `app/` + `components/` may only go down). Cucumber profiles pick up every `docs/testing/ux-v2-*.feature`.

### 6.11 Unknown URLs (UX v2, Story 6.1.22)
* **Routing:** `updateSession` calls `shouldRedirectToLogin(pathname, isAuthenticated)`; only `PROTECTED_PATH_PREFIXES` (whole path segments) send a guest to `/auth/login`. Everything else falls through, so Next renders the 404. A path with no matching route answers a real HTTP 404. Where `notFound()` is thrown inside a streamed route (unknown song id, private playlist, `/library/albums` while off), `app/loading.tsx` has already flushed the shell, so Next 16 keeps HTTP 200, shows the not-found page and adds `<meta name="robots" content="noindex">`. Measured on the production build; `e2e/tests/real-404.spec.ts` asserts each case. This is a routing rule, not an RLS change: members-only pages under `/library`, `/songs`, `/recordings` still guard themselves.
* **Adding pages:** `PROTECTED_PATH_PREFIXES` (`lib/supabase/routeAccess.ts`) is the single source for the proxy; prefixes match whole segments, so any future `/admin/*` page inherits protection. Since Story 6.1.26 the list is only `/admin`: `/account/*` and `/users/*` render the GuestGate themselves (§6.12), so a new page there must render its own gate.
* **404 pages:** `app/not-found.tsx` (generic, all roles), `app/songs/[id]/not-found.tsx` ("Song Not Found"), `app/recordings/[id]/not-found.tsx` ("Recording Not Available"). One `NotFound` component, token-styled, plain "Go home" button.
* **Tests:** `docs/testing/ux-v2-real-404.feature` (`@unit @story-6.1.22`), `testing/unit/tests/routeAccess.test.ts`, `notFoundPages.test.ts`, Playwright `e2e/tests/real-404.spec.ts`.

### 6.12 GuestGate: members-only screens (UX v2, Story 6.1.26)
* **One pattern:** `components/common/GuestGate.tsx` (variants `page`, `overlay`, `card`) shows a decorative, inert, blurred placeholder, the **reason** (`guestGate.<feature>.title|reason`) and a **Sign in** button (≥ 44 px) linking to `/auth/login?next=<current path + query>` (`lib/auth/guestGate.ts`: `signInHref`; `lib/auth/safeNext.ts`: `safeNextPath`). `GuestGateSheet` shows the `card` variant in a bottom sheet for inline actions.
* **Features / screens:** `history` (`/library/recently-viewed`), `newPlaylist` (`/library/playlists/add`), `smartPlaylists` (`/library/playlists`, replaces the ad-hoc guest cards and fake demo playlists; public playlists stay below), `settings` (`/account/settings`), `profile` (`/users/[id]`), `edit` (`/songs/[id]/edit`), `recorder` (Practice → Record tab, overlay on the blurred preview), `sharing` (`/recordings/[id]` for a guest without access), `addToPlaylist` (song page: add to playlist, bottom sheet), `favourites` (the heart on the song page and on song cards, bottom sheet via `useToggleFavorite().signInGate`; the old hard-coded English toast is gone). Pages render the gate instead of redirecting; `lib/supabase/proxy.ts` therefore lets `/account`, `/users` and `/recordings` through (whole path segments via `matchesSegment`, so `/accounting` stays protected; a future `/account/*` page inherits this and must render its own gate).
* **`next=` is validated where it is consumed:** one hardened `safeNextPath` (`lib/auth/safeNext.ts`) is used by the gate when it builds the link **and** by every consumer — `/auth/login` and `/auth/sign-up` (already signed in), `LoginForm`, `/auth/callback`, `/auth/confirm` (absolute same-origin URLs are reduced to their path), `FinishRegistrationForm` and `SongForm`. Only a single-`/` same-site path survives; `//`, backslashes, control characters or whitespace, percent-encoded or double-encoded variants, dot-segment collapse to `//`, `@` authority tricks, absolute and `javascript:` URLs all fall back to `/`. Hardening only, no RLS change.
* **Signed-in non-owners** opening `/songs/[id]/edit` keep the warm "This Medicine is Not Yours to Edit" copy (`NotYoursToEdit`) with a plain "Back to the song" action; guests get the `edit` gate.
* **UXD-2 (guests hear public takes):** the anon RLS policies on `user_recordings` and the `rehearsals` storage objects now require `is_public = true AND singer_consent_confirmed = true` (migration `20261105120000_anon_public_takes_require_consent.sql`, no data change). Recording, sharing, download and "My takes" stay members-only. The guest Listen tab does not list public takes yet (see UXA-012). Signed-in users still see public takes without singer consent (`authenticated` policy `is_public = true`); UXD-2 covers guests only, owner to confirm (UXA-014).
* **Known gap (pre-existing, not addressed here):** `docs/design/db-schema.sql` has no `storage.objects` policies (they exist only in the migrations), so a fresh install from that single file lacks the `rehearsals` storage rules this section describes.
* **Tests:** `docs/testing/ux-v2-guest-gate.feature` (`@story-6.1.26`, `@unit` + `@seed` anon RLS), Vitest `guestGate.test.ts`, `safeNextPath.test.ts`, `useToggleFavoriteGate.test.tsx`, Playwright `e2e/tests/guest-gate.spec.ts`.

### 6.13 Mini Player (UX v2, Story 6.1.12, UXD-5)
* **Gating:** `components/song/RehearsalDrawer.tsx` renders the bar (`data-testid="bottom-mini-player"`) only when `isMiniPlayerVisible()` (`lib/player/miniPlayer.ts`): a take **of this song** is the active playback in `AudioProvider` (`activePlaybackId` ∈ the drawer's recordings, `ownsActiveTake()`), or a reference track was started (`mediaSessionReducer`: `playing` latches wherever `setIsMediaPlaying(true)` is called, pause sends no event so the bar stays, `stopped` and a take taking over clear it). `AudioProvider` is global, so a take of another song never shows the bar, and the drawer stops its own active take when it unmounts (leaving the song). The ✕ button stops everything the song plays (reference track and this song's take) and hides the bar. A fresh song page renders no bar even though a reference track is preselected.
* **Reserved space:** while visible, the drawer sets `--mini-player-h` on `<html>` to `calc(3.5rem + var(--bottom-nav-height, 3.5rem))` (bar height plus the bottom nav it sits on), the property is removed when hidden. `BottomSheet`, the song overflow sheet, the Practice drawer body and the song page content add it to their bottom padding, so the last lyric line and the last take are never covered.
* **Style:** accent bar (`bg-accent text-on-accent`) for every source, 44 px controls, equalizer animates only under `motion-safe`.
* **Tests:** `docs/testing/ux-v2-mini-player.feature` (`@unit @story-6.1.12`), Vitest `testing/unit/tests/miniPlayer.test.ts`, Playwright `e2e/tests/media-player.spec.ts` (hidden on load, visible after play, stays after pause and drawer close, last block above the bar when scrolled to the end, hidden after stop) and `e2e/tests/ux-v2-mini-player.spec.ts` (member, real take: last row above the bar, no bar on the next song).

## 7. Screen Inventory (Implemented)

### 7.1 Screen 1: Home (Dashboard)
* **Status:** Implemented (`app/page.tsx`).
* **Features:** Quick stats / actions cards, 10 Latest Songs list. (Search moved to Dedicated Search page).

### 7.2 Screen 2: Song Detail
* **Status:** Implemented (`app/songs/[id]/page.tsx`).
* **Features:** Sticky Header with Back Button, Version Pills, ChordPro Display. The mobile sticky header (`lg:hidden`) shows the song title on one line, left aligned with a 16 px margin, truncated with an ellipsis at the end (full title in the `title` attribute); no scrolling marquee (Story 6.1.8, `e2e/tests/ux-v2-sticky-title.spec.ts`). Above the lyrics `components/song/SongMetaLines.tsx` shows two grey `text-meta` lines (Story 6.1.7): `Author · Tag · Tag` (a button with `aria-expanded`; tapping expands it into links to the author/tag filters plus Chords, Melody and My take) and `Key E · Capo 3 · Standard` (only when the version has a key, capo or special tuning; `technicalItems()` in `lib/songs/songMeta.ts`). The old `SongMetadataPills` / `SongTechnicalBadges` and the three-column grid are removed; the first lyric line is above the fold at 390 × 844 (`e2e/tests/ux-v2-song-meta.spec.ts`). Under the meta lines `components/song/ReaderToolbar.tsx` (Story 6.1.6) is a `role=toolbar` with a `Chords` switch (`role=switch`, only for songs with chords) and `A−` / `A+` buttons (≥ 44 px). They set the lyric size along `LYRIC_STEPS` (15–28 px, default 17; chords at 70 %, never below 12 px) and hide or show the chord layer; hidden chords render nothing, each lyric line keeps its own row. The choice is stored per device in `localStorage` (`sacred-fire-songs-reader`, `useReaderPrefs` via `useSyncExternalStore`; blocked storage keeps the choice for this session only, unreadable stored values fall back to the defaults) and survives a reload (`e2e/tests/ux-v2-reader-toolbar.spec.ts`). The disabled "Large Stage Font" preference row in Settings is removed. Integrated "Record Rehearsal" trigger to launch private recording space.

### 7.2b Practice (Slide-Up Bottom Sheet Drawer)
* **Status:** Implemented (`components/song/RehearsalDrawer.tsx`). Called **Practice** everywhere in the UI since Story 6.1.14 (#398): song menu entry **Practice**, tabs **Listen** (reference tracks) and **Record** (recorder, **My takes** list), **Takes** chip on songs, **Your takes** in the Library, **Practice recorder** guest card. The audio item is a *take* in every user-visible noun (Save Take, Delete take?, Share take, Publish Take, share e-mail); the mini-player source groups are headed **Listen** and **My takes**.
* **Takes shared with me (Story 6.1.15 / #399, UXD-3):** the Record tab shows up to three lists. **My takes** holds the takes I own (sortable, full action menu); **Shared with me** (`practice.takes.shared`) holds takes of others that were shared with me (a share row for me, or a private take I can only read through a share); **Public takes** (`practice.takes.public`) holds public takes of other singers. The two lists of others are hidden when empty. A shared row's meta line reads **Shared by {name}** · length (no date, so the name is not truncated on a phone) (full name only, never the e-mail; the name comes from the owner profile that the share policy lets the recipient read; without a name the row says "Shared with you"); public rows keep the date line and has no ⋯ menu: listen only (DRM-lite). The split is the pure helper `partitionTakes` (`lib/songs/partitionTakes.ts`); the old 14 px people icon is gone. The mini-player source menu uses the same groups. `getUserRecordings` reads the recipient's own `recording_shares` rows to tell shared from public (no RLS change).
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
* **Song rows (Story 6.1.2, `components/home/SongCard.tsx`):** each result is a compact row, not a card: title (`text-row`), one grey `text-meta` line `Author · Category · Language` (`songRowMeta()` in `lib/songs/songMeta.ts`: authors joined, the first non-artist, non-language tag, the first language tag), a key badge on the right, and heart + add-to-playlist as separate 44 px buttons. The whole row is a stretched link; no coloured chips, glow, accent bar or chord/melody/take icons. At 390 × 844 at least six rows are visible (`e2e/tests/ux-v2-song-rows.spec.ts`). Library lists (recently viewed, new since last visit, playlist detail) and Library → Artists use the same `ListRow` style.

### 7.11 Screen 16: Playlists
* **Status:** Mockup Created (`doc/design/screens/screen16_playlists.html`).
* **Features:** Playlist management with creation and list view of ceremonial sets.
* **Library tabs (`app/library/LibraryTabs.tsx`, Story 6.1.23):** Playlists · History · Artists, built from `libraryTabs()` in `lib/navigation.ts`; tabs are ≥ 44 px token pills (`bg-chip` / `bg-chip-active`, `aria-current`) that fit 390 px. Albums is on the roadmap but hidden (UXD-4): `FEATURES.albums = false` in `lib/features.ts` removes the tab, and `app/library/albums/page.tsx` calls `notFound()` until the flag is switched on (the route and data model stay).

### 7.12 Admin Users Overview
* **Status:** Implemented (`app/admin/users/page.tsx`, `components/admin/AdminUsersTable.tsx`). No mockup in `docs/design/screens/`; the layout mirrors the Library section (`app/library/layout.tsx`, `LibraryTabs.tsx`): `<main>` scroll container, "Administration" title with pill tabs (Users, Configuration – planned), and summary cards styled like `components/home/LibrarySummary.tsx`.
* **Access:** `app/admin/layout.tsx` checks the role server-side; non-admins get `components/admin/AccessDeniedNotice.tsx`, guests are redirected to `/auth/login` by `proxy.ts`. Entry points: "Admin Portal" in the account menu and "Administration" in the sidebar (admins only).
* **Features:** Totals (users, active in last 30 days, songs, playlists, admins & gatekeepers), search by name/e-mail, role filter (the "Musician / Expert" option matches both roles), sort (recently joined, top contributors, name A-Z / Z-A, most / fewest songs; the choice is stored in `localStorage` under `admin-users-sort`), and one row per user with role badge, e-mail, songs/versions/playlists counts, activity status and join date. The whole row opens the user's details (stretched link, so Enter, middle-click and Ctrl/Cmd-click work). Separate empty states for "no users" and "no matches".
* **Pickers:** role and sort use `WickSelect` (WAI-ARIA listbox portalled to `<body>`: arrow/Home/End/type-ahead keys, Escape closes, lit "ember" marks the chosen option and ignites once on change). Role filter options carry their role's color from `lib/admin/roleColors.ts`, the same source as the role badges.

### 7.13 Admin User Detail
* **Status:** Implemented (`app/admin/users/[id]/page.tsx`, `components/admin/AdminUserDetailView.tsx`, `app/admin/users/[id]/not-found.tsx`).
* **Features:** Breadcrumb (Administration › Users), profile card (name, e-mail, id, role, join date, last active, activity status, musician status), and pill tabs with counts listing songs added, versions submitted and playlists (with public count, public/private badges). An unknown id shows "User Not Found" with a link back to the list.
