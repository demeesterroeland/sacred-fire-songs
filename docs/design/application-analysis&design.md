# Project Analysis & Design Document: Song Sharing Application (Sacred Fire Songs)

**Version:** 1.32
**Status:** Living Document
**Date:** July 16, 2026

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
* User Accounts, Favorites, Setlists, PDF Export.

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
* **Database Setup & Seeding:** E2E runs use a Playwright `globalSetup` hook (`e2e/global-setup.ts`) to execute a custom Node.js setup script (`scripts/setup-test-db.mjs`). This script connects to the target database, dynamically truncates all public tables (preserving the static `categories` lookup taxonomy), wipes `auth.users`, and seeds the database using the SQL scripts located in `supabase/seeds/`.
* **Programmatic Random Seeding:** When the environment variable `E2E_RANDOM_SEED=1` is set, `setup-test-db.mjs` triggers a dynamic seeder (`scripts/random-seeder.mjs`) that generates rich, randomized song titles, ChordPro content, media links, elements/lineage taxonomy mappings, and private user rehearsal recordings (staggered takes for 30% of songs, and multiple 2-5 takes for 50% of songs). This exercises the system's filtering, layout, search, and private recording drawer list views.
* **Local Optimization:** For fast local test iteration, setting the environment variable `E2E_REUSE_DB=1` skips the database wipe and re-seed, reusing the existing database state.

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
