# E2E Test Overview & Matrix: Sacred Fire Songs

**Version:** 1.3
**Status:** Living Document
**Date:** May 31, 2026
**Tracking:** GH #142

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | May 30, 2026 | Initial creation. Full E2E test matrix covering all features and variants, derived from `docs/logbook/epic&user stories.md` and a codebase route/component inventory. Tooling recommendation (Playwright) and CI approach included. |
| **1.1** | May 30, 2026 | Phase 0 scaffolded: added Playwright (`playwright.config.ts`, `@playwright/test`), per-role auth setup (`e2e/auth.setup.ts`), seeded-account fixtures, P0 `@smoke` specs (`e2e/tests/smoke.spec.ts`), CI workflow (`.github/workflows/e2e.yml`), and npm scripts. Flipped scaffolded smoke rows (AUTH-04, ACC-01, LIB-01, LIB-07, VIEW-01) to 🟡. |
| **1.2** | May 30, 2026 | CI now runs `@smoke` against the **staging** Supabase on push to `main`/`feat|fix|chore/**` (resolves staging URL + anon key via the CLI) instead of a local stack. Documented the staging seed-data caveat and read-only/shared-DB constraints. |
| **1.3** | May 31, 2026 | CI hardening: the staging anon key is now read from the `SUPABASE_PUBLISHABLE_KEY_STAGING` secret instead of the `supabase projects api-keys` CLI lookup (which returned no key and failed the run). Dropped the Supabase CLI step; URL derived from the project ref. Documented required secrets. |

---

## 1. Purpose

This document is the **single source of truth for end-to-end (E2E) test coverage** of Sacred Fire Songs. It enumerates every user-facing feature and its variants, maps each to one or more named E2E scenarios, records the roles affected, and tracks implementation status so coverage gaps are visible and prioritizable.

It is a **living document**: keep it aligned with `docs/logbook/epic&user stories.md` per the project Documentation Sync Policy. When a story is added or a feature changes, add/adjust the corresponding rows here.

### Scope

- **In scope:** browser-level user workflows across all features (auth, song management, library/discovery, viewer, playlists, favorites, gatekeeper tools, account/settings, navigation, PWA), including role variants and edge cases.
- **Out of scope (covered elsewhere):** pure unit logic already tested by **vitest** in `lib/unit-tests/` (ChordPro parsing, chord utils, query mappers, Zod schemas, guest-favorites logic, playlist action logic). E2E should not duplicate these; it should exercise the *integrated* flow through the UI.

### Current state of testing

- **Unit tests (vitest, v4):** `lib/unit-tests/chordProParsing.test.ts`, `chordUtils.test.ts`, `queries.test.ts`, `songUtils.test.ts`, `playlistActions.test.ts`, `schemas.test.ts`, `useGuestFavorites.test.ts`. Run via `npm test` → `vitest run`.
- **E2E tests:** **Phase 0 scaffolded** (this branch). Playwright is wired up (`playwright.config.ts`, `e2e/`), with per-role auth setup and a handful of P0 `@smoke` specs. Specs are authored but **not yet verified against a running app + seeded Supabase** — that verification happens once CI (or a dev) runs them. See `e2e/README.md`.
- **CI:** `.github/workflows/deploy-db.yml` runs Supabase migrations; **`.github/workflows/e2e.yml`** (new) runs the `@smoke` subset against the **staging** Supabase project on every push to `main` / `feat|fix|chore/**`.

---

## 2. Tooling Recommendation

**Recommended framework: [Playwright](https://playwright.dev/).**

Rationale vs. Cypress:

| Criterion | Playwright | Cypress |
| --- | --- | --- |
| Next.js App Router fit | Excellent (real browser navigation, route handlers, SSR) | Good |
| Multi-browser | Chromium, Firefox, WebKit out of the box | Chromium-family + limited WebKit |
| Mobile emulation | Built-in device descriptors (key for mobile-first UI + bottom nav + wake lock) | Plugin/viewport only |
| Auth/session reuse | `storageState` makes per-role login fast | Custom commands |
| Parallelism / CI speed | Native sharding | Paid dashboard for parallel |
| Network/API mocking | First-class (`route.fulfill`) | First-class |

Mobile emulation and per-role `storageState` matter here because the app is mobile-first (bottom nav, wake lock) and heavily role-gated (Guest/Member/Gatekeeper/Admin).

### Proposed setup

- **Location:** `e2e/` at repo root, specs as `e2e/<feature>.spec.ts`. Shared fixtures/helpers in `e2e/fixtures/`.
- **Config:** `playwright.config.ts` with projects for `chromium-desktop` and `mobile-chrome` (Pixel 5 descriptor); `webServer` boots `next build && next start` (test against a production build, not `next dev`).
- **Auth:** a global-setup that logs in one user per role and saves `storageState` per role (leverage the existing dev quick-login / `NEXT_PUBLIC_DEV_TEST_PASSWORD` and mock-role mechanism noted in `hooks/useAuth.tsx`). Guest = no storage state.
- **Data:** run against a **local Supabase** stack seeded with deterministic fixtures (seed script that creates known songs, playlists, and one account per role). Reset/seed between runs so assertions on counts/titles are stable.
- **Scripts:** add `"test:e2e": "playwright test"` and `"test:e2e:ui": "playwright test --ui"` to `package.json`.

### CI approach

- `.github/workflows/e2e.yml` runs on **push** to `main` / `feat|fix|chore/**` and tests against the **staging** Supabase project. It derives the staging URL from `SUPABASE_PROJECT_ID_STAGING` and reads the (public) anon key from the `SUPABASE_PUBLISHABLE_KEY_STAGING` secret; `E2E_TEST_PASSWORD` provides the seeded-account password. It installs deps + Chromium, runs the `@smoke` subset, and uploads the HTML report.
- **Staging caveat:** seed data (`supabase/seeds/*.sql`) is **not** auto-applied to staging by `deploy-db.yml` (only migrations). The seeded E2E accounts must exist on staging, or `auth.setup.ts` fails. Also, because branches share one staging DB, keep CI specs read-only/idempotent (the current `@smoke` set is) and serialize runs (the workflow uses a per-ref concurrency group).
- For fully isolated runs, an alternative is booting a local Supabase in CI (`supabase start`) instead of staging — kept as a future option. Consider promoting `@smoke` to a required status check and adding a nightly full-suite run.

---

## 3. Legend

- **Roles:** G = Guest, M = Member, GK = Gatekeeper, A = Admin. (Hierarchy: Guest → Member → Gatekeeper → Admin; `is_musician` is a per-profile flag, not a role.)
- **Feature status:** ✅ Implemented · ⚠️ Partial/Stub · ❌ Not implemented — reflects the *app feature*, from the codebase inventory.
- **E2E status:** 🔲 Planned (no spec yet) · 🟡 In progress · ✅ Implemented — every row is 🔲 today since no E2E suite exists.
- **Priority:** P0 = critical smoke path, P1 = important, P2 = nice-to-have/edge.

---

## 4. Test Matrix

### 4.1 Authentication & Accounts (Epic 1.1 / 3.1)

| ID | Feature | Scenario | Variants / Edge cases | Roles | Feat | E2E | Pri | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | Sign up | New user registers and receives a confirmation/verification link | invalid email; weak/mismatched password; already-registered email; terms unchecked | G | ✅ | 🔲 | P0 | 1.1.4, 3.1.3 |
| AUTH-02 | Email confirmation | Clicking the confirmation link verifies the account | expired/invalid `token_hash`; `?next` redirect honored | G | ✅ | 🔲 | P0 | `app/auth/confirm`, `callback` |
| AUTH-03 | Finish registration | Post-signup completion (name, etc.) | skip optional fields | M | ✅ | 🔲 | P1 | `app/auth/finish-registration` |
| AUTH-04 | Log in | Valid credentials sign in and redirect home | wrong password; unknown email; unverified email; `?next` redirect | G→M | ✅ | 🟡 | P0 | 1.1.4, `login-form.tsx` |
| AUTH-05 | Log out | Authenticated user logs out; protected UI disappears | session cleared; guest view restored | M/A | ✅ | 🔲 | P0 | 1.1.4 |
| AUTH-06 | Forgot password | Request reset email for an account | unknown email (no enumeration leak) | G | ✅ | 🔲 | P1 | `forgot-password` |
| AUTH-07 | Update / reset password | Recovery link lets user set a new password | mismatched confirm; weak password; expired recovery link | G | ✅ | 🔲 | P1 | `update-password` |
| AUTH-08 | Auth error page | Invalid/expired auth params show friendly error | missing code & token_hash | G | ✅ | 🔲 | P2 | `app/auth/error` |
| AUTH-09 | Onboarding musician question | New user is asked whether they play an instrument | answer Yes → `is_musician=true`; No/skip → false | M | ⚠️ | 🔲 | P1 | Story 3.5.2 |
| AUTH-10 | Auth doc accuracy (link not OTP) | Documented flow matches link-based confirm/reset | — | — | ⚠️ | 🔲 | P2 | Story 3.1.3 |

### 4.2 Account & Settings (Epic 3.x)

| ID | Feature | Scenario | Variants / Edge cases | Roles | Feat | E2E | Pri | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ACC-01 | Settings access control | Unauthenticated user is redirected to login | deep-link to `/account/settings` | G | ✅ | 🟡 | P0 | `app/account/settings` |
| ACC-02 | Profile settings | Update display name and save | empty name; avatar upload | M | ⚠️ | 🔲 | P1 | ProfileSettings |
| ACC-03 | Security settings | Change password from settings | wrong current password; mismatch | M | ⚠️ | 🔲 | P1 | SecuritySettings |
| ACC-04 | Privacy settings | Toggle privacy / data options | account deletion confirm | M | ⚠️ | 🔲 | P2 | PrivacySettings |
| ACC-05 | Preferences / theme | Toggle dark/light/system; persists across reload | no flash-of-wrong-theme on reload | G/M | ✅ | 🔲 | P1 | ThemeToggle |
| ACC-06 | Musician profile toggle | Enable "I play an instrument" reveals musician features | toggle off hides transpose/chord badges/Chords filter | M | ⚠️ | 🔲 | P1 | Story 3.5.1 |

### 4.3 Song Management (Epic 1.1 / 2.2)

| ID | Feature | Scenario | Variants / Edge cases | Roles | Feat | E2E | Pri | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SONG-01 | Add song via form | Create a song with title/author/content and save | missing required fields; validation errors | M/A | ✅ | 🔲 | P0 | 1.1.1 |
| SONG-02 | Guest add nudge | Guest clicking "Add Song" is prompted to log in / create account | nudge modal vs. silent redirect (see story note) | G | ✅ | 🔲 | P1 | 1.1.5 |
| SONG-03 | `.cho` file upload | Uploading a file auto-fills title/author/content | `.cho`/`.txt`/`.chordpro`/`.pro`; malformed file; drag-drop vs click | M/A | ✅ | 🔲 | P1 | 1.1.2 |
| SONG-04 | Smart paste | Pasting ChordPro metadata into lyrics auto-fills fields | title/author/key/capo; partial metadata; content-only | M/A | ✅ | 🔲 | P1 | 1.1.2-bis |
| SONG-05 | Chords-over-lyrics conversion | Pasted "chords over lyrics" auto-converts to ChordPro | non-chord text not misdetected; key/capo extraction | M/A | ✅ | 🔲 | P1 | 1.1.6 |
| SONG-06 | Edit song | Owner edits fields and saves | non-owner blocked (RLS); admin override | M(owner)/A | ✅ | 🔲 | P0 | 2.2.1 |
| SONG-07 | Delete song | Owner/admin deletes a song with confirmation | non-owner has no delete; cancel modal | M(owner)/A | ✅ | 🔲 | P0 | 1.1.3 |
| SONG-08 | Card delete icon | Hover delete icon on song card (owner/admin) | hidden for non-owner/guest | M(owner)/A | ✅ | 🔲 | P2 | 1.1.4 |
| SONG-09 | Media links | Attach YouTube/Spotify/SoundCloud URLs; embeds render on detail | invalid URL; multiple embeds | M/A | ✅ | 🔲 | P1 | 1.1.7, 1.3.2/1.3.4 |
| SONG-10 | Draft auto-save | In-progress add form persists to localStorage and restores | clears after submit; create-mode only | M | ✅ | 🔲 | P2 | Story 1.1.8 |
| SONG-11 | Public/Draft toggle | Set song visibility on create/edit | draft hidden from guests | M/A | ✅ | 🔲 | P1 | SongForm |

### 4.4 Public Library & Discovery (Epic 1.2 / 2.3)

| ID | Feature | Scenario | Variants / Edge cases | Roles | Feat | E2E | Pri | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LIB-01 | Song list | Guest views the song list | empty state; pagination/infinite scroll | G | ✅ | 🟡 | P0 | 1.2.1 |
| LIB-02 | Search | Search by title / author / lyrics | cross-page results (see bug #129); debounce; clear restores list | G | ✅ | 🔲 | P0 | 1.2.2 |
| LIB-03 | Category filter | Filter songs by category (Water, Fire, …) | combine with search; no-results | G | ✅ | 🔲 | P1 | 2.3.1 |
| LIB-04 | Filter sidebar/modal | Open hamburger/filters and apply | mobile sheet vs desktop | G/M | ✅ | 🔲 | P2 | 2.3.2 |
| LIB-05 | Category page | Browse a single category page | unknown category slug | G | ✅ | 🔲 | P2 | 2.3.3 |
| LIB-06 | Sort | Sort by Title / Author / Newest | stable order; combine w/ filters | G | ✅ | 🔲 | P2 | SongsPageContent |
| LIB-07 | Auth-state refresh | Library updates after login/logout without manual refresh | private/draft appear on login; disappear on logout | G↔M | ✅ | 🟡 | P0 | bug #62 |
| LIB-08 | Filters: chords/melody/favorites/mine/status | Each filter narrows the list with correct counts | musician-gated Chords filter | M | ✅ | 🔲 | P1 | useSongsFilter |
| LIB-09 | Artists tab | Browse songs aggregated by author | author with 1 vs many songs | G | ✅ | 🔲 | P2 | `library/artists` |
| LIB-10 | Albums tab | Placeholder "coming soon" renders | — | G | ⚠️ | 🔲 | P2 | `library/albums` (stub) |
| LIB-11 | Recently viewed | Auth user sees recently viewed songs | requires auth; records on detail visit | M | ✅ | 🔲 | P1 | `library/recently-viewed` |
| LIB-12 | New since last visit | Unviewed recent songs surfaced | last_seen tracking | M | ✅ | 🔲 | P2 | NewSinceLastVisit |
| LIB-13 | Explore/Playlists guest access | Guest can reach Explore & Playlists without login | redirect of `/explore` → `/` | G | ✅ | 🔲 | P2 | 1.2.3 |

### 4.5 Song Viewer (Epic 1.3 / 2.1)

| ID | Feature | Scenario | Variants / Edge cases | Roles | Feat | E2E | Pri | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VIEW-01 | Chords over lyrics | Detail page renders chords aligned above lyrics | songs without chords | G | ✅ | 🟡 | P0 | 1.3.1 |
| VIEW-02 | Stanza breaks | Double newlines render as visible stanza gaps | — | G | ✅ | 🔲 | P2 | bug #63 |
| VIEW-03 | Audio/YouTube/SoundCloud embeds | Embeds load and play on detail page | missing/invalid embed | G | ✅ | 🔲 | P1 | 1.3.2 / 1.3.4 |
| VIEW-04 | Back navigation | Navigate home/back from any page | deep-linked entry | G | ✅ | 🔲 | P2 | 1.3.3 |
| VIEW-05 | Screen wake lock | Wake lock acquired on detail; released on tab hide; re-acquired on return | unsupported browser graceful no-op | G | ✅ | 🔲 | P1 | 1.3.5 |
| VIEW-06 | Transpose | Musician transposes chords up/down | wrap A→G#; only when musician enabled | M(musician) | ⚠️ | 🔲 | P1 | 2.1.1 |
| VIEW-07 | Record view | Visiting detail records a "recently viewed" entry | guest not recorded | M | ✅ | 🔲 | P2 | recordSongView |
| VIEW-08 | Add-to-playlist from detail | Playlist picker opens and adds the song | unauth → nudge | M | ✅ | 🔲 | P1 | PlaylistPicker |

### 4.6 Favorites (Epic 3.1)

| ID | Feature | Scenario | Variants / Edge cases | Roles | Feat | E2E | Pri | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FAV-01 | Heart a song (member) | Toggle heart; song appears in My Favorites | unheart removes it | M | ✅ | 🔲 | P0 | 3.1.2 |
| FAV-02 | Guest favorites | Guest hearts persist in localStorage | survive reload; merge on login (if supported) | G | ✅ | 🔲 | P1 | useGuestFavorites |
| FAV-03 | Favorites filter | Filter library to favorites only | empty favorites state | M | ✅ | 🔲 | P2 | useSongsFilter |

### 4.7 Playlists / Setlists (Epic 4.1)

| ID | Feature | Scenario | Variants / Edge cases | Roles | Feat | E2E | Pri | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PL-01 | Create playlist | Authenticated user creates a playlist inline | empty/duplicate title validation; guest blocked | M | ✅ | 🔲 | P0 | 4.1.x |
| PL-02 | Add songs via search sheet | Open "+ Add Songs", search, add to playlist | song added at end; duplicate add | M | ✅ | 🔲 | P1 | 4.1.3 |
| PL-03 | Reorder songs | Drag-drop reorder persists | keyboard reorder; order survives reload | M | ✅ | 🔲 | P1 | PlaylistDetailClient |
| PL-04 | Remove song | Remove a song from the playlist | last song → empty state | M | ✅ | 🔲 | P2 | PlaylistDetailClient |
| PL-05 | Rename playlist | Owner renames; persists | non-owner cannot | M(owner) | ✅ | 🔲 | P2 | usePlaylistRename |
| PL-06 | Delete playlist | Owner deletes with confirmation | cancel | M(owner) | ✅ | 🔲 | P1 | playlistActions |
| PL-07 | Visibility toggle | Toggle public/private; icon + access change | guest sees public only | M(owner) | ✅ | 🔲 | P1 | 4.1.4 |
| PL-08 | Access control | Private playlist 404/redirect for non-owner; public viewable by anyone | logged-out vs logged-in | G/M | ✅ | 🔲 | P0 | `playlists/[id]` |
| PL-09 | Shareable link | Copy public playlist link; toast confirms | private link not shareable | M | ✅ | 🔲 | P2 | 4.1.5 |
| PL-10 | Description | Add/edit playlist description; persists | empty description | M(owner) | ✅ | 🔲 | P2 | 4.1.6 |
| PL-11 | Duplicate playlist | Duplicate creates "Copy of …" with same songs/order | navigates to new playlist | M | ✅ | 🔲 | P2 | 4.1.8 |
| PL-12 | Per-song transpose | Set +/- semitone offset per song in playlist; original unchanged | offset persists on reload | M(musician) | ⚠️ | 🔲 | P2 | 4.1.9 |
| PL-13 | Cover color/icon | Assign cover color/icon; reflected on card | default grey when unset | M(owner) | ⚠️ | 🔲 | P2 | 4.1.10 |
| PL-14 | Presentation/ceremony mode | Full-screen present; arrows/swipe advance; wake lock active; Esc exits | mobile swipe vs desktop keys | M | ⚠️ | 🔲 | P1 | 4.1.7 |

### 4.8 Gatekeeper Tools (Epic 3.4)

| ID | Feature | Scenario | Variants / Edge cases | Roles | Feat | E2E | Pri | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GK-01 | Assign Gatekeeper role | Admin promotes a member to Gatekeeper | gains GK tools, keeps member caps | A | ⚠️ | 🔲 | P1 | 3.4.1 |
| GK-02 | Flag song | GK flags "Needs Improvement"/"Duplicate"; badge + queue + owner notified | resolve flag removes badge | GK | ⚠️ | 🔲 | P1 | 3.4.2 |
| GK-03 | Edit others' metadata | GK edits key/capo/categories/media of any song | content fields not editable by GK | GK | ⚠️ | 🔲 | P1 | 3.4.3 |
| GK-04 | Merge duplicates | GK merges duplicate into canonical; version selector; redirects | both contributors credited/notified | GK | ⚠️ | 🔲 | P2 | 3.4.4 |
| GK-05 | Feature playlist | GK marks public playlist as Featured; appears in curated section | unfeature; none-featured hides section | GK | ⚠️ | 🔲 | P2 | 3.4.5 |
| GK-06 | Tool visibility gating | GK actions hidden from Member/Guest | — | M/G negative | ⚠️ | 🔲 | P1 | 3.4.1 |

### 4.9 Navigation & Layout (Epic 1.1 / 1.3)

| ID | Feature | Scenario | Variants / Edge cases | Roles | Feat | E2E | Pri | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NAV-01 | Mobile bottom nav | Bottom bar shows Home/Search/Library/Create on mobile; hidden on desktop | active-tab highlight | G/M | ✅ | 🔲 | P1 | 1.1.9 |
| NAV-02 | Avatar vs hamburger | Logged-in mobile shows avatar opening side menu; guest shows hamburger | top-right avatar hidden on mobile | G/M | ✅ | 🔲 | P2 | 1.1.9 |
| NAV-03 | Create tab guest nudge | Guest tapping Create gets sign-in nudge | — | G | ✅ | 🔲 | P2 | 1.1.9 |
| NAV-04 | Desktop sidebar | Sidebar links navigate; collapse/expand | active state | M | ✅ | 🔲 | P2 | Sidebar |
| NAV-05 | Header / global search | Header search opens global search modal | keyboard shortcut; non-song pages | G/M | ✅ | 🔲 | P2 | GlobalSearchModal |
| NAV-06 | Deep links | Query params (`?search=`, `?tag=`, `?sort=`, `?next=`) restore state | invalid params | G | ✅ | 🔲 | P2 | SongsPageContent |

### 4.10 PWA (Epic 3.3 / 4.5)

| ID | Feature | Scenario | Variants / Edge cases | Roles | Feat | E2E | Pri | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PWA-01 | Manifest / installability | Manifest served; install prompt available; standalone launch | icons 192/512; theme color | G | ✅ | 🔲 | P2 | 3.3.1 |
| PWA-02 | Branding | Installed app shows icon/name/splash/theme | — | G | ✅ | 🔲 | P2 | 3.3.2 |
| PWA-03 | Offline fallback | Offline shows branded page; cached pages still load | not-cached route | G | ⚠️ | 🔲 | P2 | 4.5.1 |

---

## 5. Coverage Gaps & Suggested Implementation Order

No E2E specs exist yet, so **every row above is a gap.** Recommended phased rollout:

### Phase 0 — Foundation (enable E2E at all) — ✅ scaffolded (GH #142)
1. ✅ Added Playwright + `@playwright/test`, `playwright.config.ts` (chromium-desktop + mobile-chrome), `webServer` against a production build.
2. ✅ Per-role `storageState` setup (`e2e/auth.setup.ts`) against the existing seeded accounts (admin/musician/member). _Gatekeeper account not seeded yet — add when GK specs land._ Local Supabase already seeds via `supabase/seeds/*.sql`.
3. ✅ CI job (`.github/workflows/e2e.yml`) runs `@smoke` specs on PRs. _Follow-up: make it a required check and add a nightly full-suite run._

> **Remaining to fully "close" Phase 0:** verify the suite actually runs green in CI against a booted Supabase (the specs are authored but unverified in this environment), then mark the 🟡 rows ✅.

### Phase 1 — P0 smoke paths (critical, must stay green)
AUTH-01/02/04/05, ACC-01, SONG-01/06/07, LIB-01/02/07, VIEW-01, FAV-01, PL-01/08. These cover "can a user sign in, browse, view, add/edit/delete a song, favorite, and create/access a playlist."

### Phase 2 — P1 core features
Remaining auth/account (AUTH-03/06/07/09, ACC-02/03/05/06), song import flows (SONG-03/04/05/09/11), discovery (LIB-03/08/11), viewer (VIEW-03/05/06/08), playlists (PL-02/03/06/07/14), gatekeeper core (GK-01/02/03/06), NAV-01.

### Phase 3 — P2 edges & emerging features
Everything remaining, prioritizing features as they move from ⚠️/❌ to ✅ (presentation mode, per-song transpose, cover color, merge/feature, offline fallback, albums).

### Notes on ⚠️/❌ features
Rows marked ⚠️ (musician transpose, onboarding question, presentation mode, per-song transpose, cover color, gatekeeper suite, offline, avatar upload) should have their E2E spec authored **together with** the feature implementation, not before — link each to its story/issue so this matrix updates as those land.

---

## 6. Maintenance

- When a new user story is added to `docs/logbook/epic&user stories.md`, add a matching matrix row here (status 🔲) in the same PR.
- When a feature's E2E spec lands, flip its E2E status to ✅ and link the spec path.
- Treat this matrix as the **definition-of-done checklist** for E2E coverage; a feature is not "fully tested" until its P0/P1 rows are ✅.
