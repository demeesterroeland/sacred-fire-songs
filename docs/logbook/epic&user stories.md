# Epics & User Stories: Sacred Fire Songs

**Version:** 1.82
**Status:** Living Document
**Date:** Nov 6, 2026

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | Dec 25, 2025 | Initial Document Creation. Defined Epics and User Stories for Phases 1-4. |
| **1.1** | Dec 29, 2025 | Added Story 1.3.3 (Navigation) and aligned UI mockups. |
| **1.2** | Jan 04, 2026 | Added stories for Dashboard, Category Filtering, Desktop View, and YouTube links based on user feedback. |
| **1.3** | Jan 10, 2026 | Changed project name to Sacred Fire Songs. |
| **1.4** | Jan 10, 2026 | Added Roles & Permissions Summary table. |
| **1.5** | Jan 10, 2026 | Expanded song management stories (Members create, Owners edit). |
| **1.6** | Jan 10, 2026 | Refactored "Upload" terminology to "Add Song". |
| **1.7** | Jan 11, 2026 | Implemented Edit Song (Story 2.2.1), Access Control, Mock Auth, and Logout. |
| **1.8** | Jan 17, 2026 | Added Story 1.1.6 (Auto-convert Chords) and Story 1.1.2-bis (Smart Paste). |
| **1.20** | Feb 3, 2026 | Added Story 1.1.8 (Draft Auto-Save). |
| **1.21** | Feb 23, 2026 | Removed Home page search box and renamed "Browse Songs" to "Search Songs". |
| **1.22** | Feb 26, 2026 | Codebase audit: marked 1.1.4 as [Partial] (missing card-level delete icons), 1.1.5 as [Not Implemented] (no guest upload modal), 1.1.6 as [Implemented] (full chords-over-lyrics detection and conversion). |
| **1.23** | Feb 26, 2026 | Marked stories 1.3.2, 1.3.4, and 1.3.5 as [Implemented] (SoundCloud embed, YouTube embed, Screen Wake Lock). |
| **1.24** | Feb 26, 2026 | Marked 2.3.1 as [Implemented] (category filtering); removed story 3.1.1 (social login — out of scope). |
| **1.25** | Feb 26, 2026 | GH sync: added stories 1.2.2, 2.3.3; marked 2.3.2, 3.1.2, 4.4.1 as [Implemented]; closed GH #13; fixed GH #56 label (1.1.7→1.1.8). |
| **1.26** | Feb 26, 2026 | Marked 1.1.4 as [Implemented]: delete icons on song cards in library view (owner/admin, hover-visible, top-right overlay) plus profiles RLS policies fix. |
| **1.27** | Feb 26, 2026 | Marked 1.1.5 as [Implemented]: guest upload modal (Log In / Create Account) now shows when unauthenticated user clicks "Add Song". |
| **1.28** | Feb 26, 2026 | Marked 1.1.4 as [Implemented]: delete icons on song cards in library view (owner/admin, hover-visible, top-right overlay) plus profiles RLS policies fix. |
| **1.29** | Feb 28, 2026 | Added playlist feature stories 4.1.3–4.1.10: quick-win playlist enhancements (search-and-add sheet, visibility toggle, shareable link, description) and high-value future features (presentation mode, duplicate, per-song transpose, cover color). |
| **1.30** | Feb 28, 2026 | Added Epic 4.5 (Progressive Web App): stories 4.5.1 (Install as App), 4.5.2 (App icons & branding), 4.5.3 (Offline shell/fallback). Updated Roles & Permissions table. |
| **1.31** | Feb 28, 2026 | Moved PWA install (3.3.1) and branding (3.3.2) to new Epic 3.3 in Phase 3; offline fallback remains as 4.5.1 in Phase 4. |
| **1.32** | Feb 28, 2026 | Added Epic 3.4 Gatekeeper role: stories 3.4.1 (role & permissions), 3.4.2 (flagging & queue), 3.4.3 (metadata editing), 3.4.4 (duplicate merging), 3.4.5 (featured playlists). Updated Roles & Permissions table. |
| **1.33** | Feb 28, 2026 | Removed Musician as a role. Added Epic 3.5: Musician profile setting (self-declared). Role hierarchy is now Guest → Member → Gatekeeper → Admin. Updated Roles & Permissions table. |
| **1.34** | Mar 1, 2026 | GH sync: marked 3.3.1, 3.3.2, 4.1.8 as [Implemented]. Added Story 1.1.9 (Spotify-style mobile bottom nav bar). |
| **1.34** | Jun 28, 2026 | Added Epic 4.6: Private Rehearsal & Audio Storage (Story 4.6.1) for microphone recording and private Supabase storage uploads. |
| **1.35** | Jul 14, 2026 | Vercel preview deploy fix (`framework: null` → `nextjs`), Enter key submits search in modal, header spacing polish. Merged to main, closed #185. Story 1.2.4 fully deployed. |
| **1.36** | Oct 30, 2026 | Marked Story 4.2.1 as [Implemented] (Issue #18 / PR #220: PDF Setlist export for ceremony musicians using ChordSheetJS & jsPDF). |
| **1.37** | Oct 30, 2026 | Added Epic 3.6 (Administrative Management, #257) and Story 3.6.1 (User Overview, Details & Contributions, #258); marked Story 3.6.1 as implemented, noted that comments/flags are not modelled yet and linked the executable spec `docs/testing/admin-users.feature`. |
| **1.38** | Oct 30, 2026 | Added Epic 3.7: Multi-Language Support (Story 3.7.1, issue #246) with acceptance criteria I18N-01…I18N-12 (I18N-11: PDF export from #220; I18N-12: six additional languages), executable in `docs/testing/i18n.feature`. |
| **1.39** | Oct 30, 2026 | Added Stories 3.6.2 (invite/create users, #275), 3.6.3 (suspend/reactivate, #276), 3.6.4 (change role, #277), 3.6.5 (sort by name and songs, #278, implemented) and 3.6.6 (clickable user rows, #279, implemented). |
| **1.40** | Oct 30, 2026 | Added Phase 5 (Engineering Excellence) with Epic 5.1: Gitflow CI/CD Migration, stories 5.1.1–5.1.14 [Planned]. Plan: `docs/plans/2026-10-30-gitflow-cicd-migration.md`; executable spec: `docs/testing/gitflow-cicd.feature`. |
| **1.41** | Oct 30, 2026 | Epic 5.1 created on GitHub: master epic #280, phase epics #281–#286, Task 5.1.0 #287, stories #288–#301 (sub-issues, `model:tier-1/2` labels, blocked-by dependencies). Linked issue numbers in the story table. Story 5.1.1 aligned with owner decision D4 (PR smoke against staging, no local stack). |
| **1.42** | Oct 30, 2026 | Added Stories 4.2.3 (#303, PDF footer: site URL + 1 cm song QR code) and 4.2.4 (#304, reuse the setlist PDF while the playlist is unchanged), both [Implemented]. |
| **1.43** | Oct 31, 2026 | Epic 5.1 Phase 1 (PR #310): Stories 5.1.1 (CI quality gate; required checks on the `main` ruleset), 5.1.3 (single unit-test tree) and 5.1.12 (pinned actions, permissions, Dependabot) implemented; Story 5.1.2 (E2E) deferred by the owner. |
| **1.44** | Oct 31, 2026 | Epic 5.1 Phase 2 (#283): Stories 5.1.5 (PR policy) implemented, 5.1.4 (rulesets as code, `develop` ruleset pending owner action) and 5.1.6 (script fixes; `--admin` removal waits for Phase 4) partly implemented. |
| **1.45** | Oct 31, 2026 | Story 5.1.4 [Implemented] (both rulesets applied). Story 5.1.7 [Partial]: develop images + `deploy-staging.yml` + server deploy script (<infra-repo> #107), rollout pending. Story 5.1.11 [Deferred] (staging is Tailscale-only). |
| **1.46** | Nov 3, 2026 | Story 5.1.7 re-scoped: deployment of the maintainer's environments moved out of this public repo (`deploy-staging.yml` removed); this repo only publishes images. Added public-repo isolation enforcement (`isolation` CI job, git hooks, Claude Code hook). |
| **1.47** | Nov 4, 2026 | Story 4.5.1 [Partial]: offline fallback page for page navigations implemented (#353, `docs/testing/offline.feature`); cached pages and songs offline (second scenario) not yet. |
| **1.48** | Nov 4, 2026 | Aligned MD logbook with GitHub: synced [Implemented] statuses (3.4.6, 4.2.1, 4.2.3, 4.2.4, 5.1.3, 5.1.4, 5.1.5); added Story 1.2.5 (#218), Stories 3.1.1 (#13), 3.1.3 (#140), 3.1.4 and sub-stories 3.1.4.1–3.1.4.6 (#323–#329); expanded Epic 4.3 with Stories 4.3.2–4.3.8 (#357, #358–#364). |
| **1.49** | Nov 4, 2026 | Added Stories 4.6.2 (User-to-User Private Sharing with DRM-lite restriction), 4.6.3 (Public Publication with Explicit Singer Consent Disclaimer), and 4.6.4 (Singer Attribution & Musician Profile Linking), all [Implemented]. Executable spec: `docs/testing/recording-sharing.feature`. |
| **1.50** | Nov 4, 2026 | Added Story 4.6.6 (Notification & Email Dispatching for Shared Rehearsal Recordings, #373) [Implemented]. Executable spec: `docs/testing/share-notifications.feature`. |
| **1.51** | Nov 4, 2026 | Added Phase 6 and Epic 6.1 (UX & Design Rework, #375): 9 group epics and 34 stories from the UX research in `docs/ux-research/`. |
| **1.52** | Nov 5, 2026 | Added Story 4.6.5 (Personal Reordering of Shared-with-Me and Public Recordings, #420) [Planned] with Option A decision (decoupled user-specific ordering table). |
| **1.53** | Nov 5, 2026 | Epic 5.1: Story 5.1.8 (#297) re-scoped and implemented — promotion `develop` → `main` via `scripts/cicd/develop2main.sh` (merge commit, no `--admin`) and versioned release images; production deployment lives outside the public repo. Story 5.1.6 (#294) completed (no script uses `--admin`). Stories 5.1.1, 5.1.7 and 5.1.12 closed on GitHub. |
| **1.54** | Nov 5, 2026 | Story 5.1.9 (#298) implemented: `back-merge.yml` opens the PR `main` → `develop` after every push to `main`, labels conflicts; merged by the owner, never automatically. |
| **1.55** | Nov 5, 2026 | Story 5.1.13 (#300) implemented: development guide 2.0 (Gitflow, environments, CI vs CD boundary), Gitflow PR template, `/start-story` and `/sync-artifacts` target `develop`, README contributing; documentation contract in `ci-gate`. Story 5.1.10 (#299) code complete; its end-to-end check moves into the 5.1.14 dress rehearsal (owner). |
| **1.56** | Nov 5, 2026 | Epic 6.1: Story 6.1.1 (#385, G1.1) implemented on the integration branch `feat/ux-v2` — design tokens, component primitives and token tests (`docs/design/design-tokens.md`). |
| **1.57** | Nov 5, 2026 | Epic 6.1: Story 6.1.33 (#417, G9.1) implemented on `feat/ux-v2` — E2E fixtures removed by a Playwright global teardown; seed hygiene checks. |
| **1.58** | Nov 5, 2026 | Epic 6.1: Story 6.1.8 (#392, G2.3) implemented on `feat/ux-v2` — sticky song title truncates at the end. |
| **1.59** | Nov 5, 2026 | Epic 6.1: Story 6.1.23 (#407, G5.2) implemented on `feat/ux-v2` — Library tabs fit a phone, Albums hidden behind a feature flag (UXD-4). |
| **1.61** | Nov 5, 2026 | Epic 6.1: Story 6.1.6 (#390, G2.1) implemented on `feat/ux-v2` — `Chords · A− · A+` reader toolbar, size persisted per device. |
| **1.60** | Nov 5, 2026 | Epic 6.1: Story 6.1.7 (#391, G2.2) implemented on `feat/ux-v2` — song meta and Key · Capo · Tuning on one grey line each. |
| **1.82** | Nov 6, 2026 | Epic 6.1: Story 6.1.5 (#389, G1.5) implemented on `feat/ux-v2` — unfinished features hidden behind `lib/features.ts` (Albums already by #407; avatar block, Privacy & Data tab, planned preference rows, melody notation section); "Coming soon" copy removed from all 8 locales. Decisions UXA-030, UXA-031. |
| **1.80** | Nov 5, 2026 | Epic 6.1: Story 6.1.19 (#403, G4.6) implemented on `feat/ux-v2` — **Shared with me** page (`/library/shared`) listing takes shared with me with the sharer and a **New** marker, entered from the account menu and a Library row (unread count in words); opening a song's Practice drawer marks its notifications read and the bell badge drops (UXD-3, UXA-029). |
| **1.79** | Nov 5, 2026 | Epic 6.1: Story 6.1.18 (#402, G4.5) implemented on `feat/ux-v2` — the Share dialog says who can be found (registered members) with an empty state and invite hint, and on a private song lists both effects (lyrics become public, take is shared) before anything changes; non-owners get an explanation instead of a toast. |
| **1.78** | Nov 5, 2026 | Epic 6.1: Story 6.1.30 (#414, G8.1) implemented on `feat/ux-v2` — Add to playlist is a bottom sheet with "New playlist" first, check marks and tap-to-toggle; Story 3.1.4.6 reused (one `createPlaylist` action). |
| **1.81** | Nov 5, 2026 | Epic 6.1: Story 6.1.13 (#397, G3.2) implemented on `feat/ux-v2` — calm mini player (plain bar, accent only on play, state in words), provider buttons only for providers with a link, "Open player", wrapping status line. |
| **1.77** | Nov 5, 2026 | Epic 6.1: Story 6.1.9 (#393, G2.4) implemented on the integration branch `feat/ux-v2` — sticky Practice · Playlist · ♥ action bar on the song page (phones). |
| **1.76** | Nov 5, 2026 | Epic 6.1: Story 6.1.29 (#413, G7.1) implemented on `feat/ux-v2` — focusing the search field shows the last 5 recent searches (clearable) and the top-level categories as chips. |
| **1.75** | Nov 5, 2026 | Epic 6.1: Story 6.1.17 (#401, G4.4) implemented on `feat/ux-v2` — take actions open as a grouped bottom action sheet (Play / Edit name / Download · Share / Singer / Make public / Copy link · Delete alone in red), rows ≥ 44 px, 32 px swipe handle; shared-with-me takes stay listen only. |
| **1.74** | Nov 5, 2026 | Epic 6.1: Story 6.1.27 (#411, G6.2) implemented on `feat/ux-v2` — guests on Add Song see "Draft now — sign in to save"; the draft survives the sign-in round trip (E2E). |
| **1.73** | Nov 5, 2026 | Epic 6.1: Story 6.1.24 (#408, G5.3) implemented on `feat/ux-v2` — bottom bar is Home · Search · Library (UXD-1), Create is a "+" in Library, `/explore` removed; Story 1.1.9 updated. |
| **1.72** | Nov 5, 2026 | Epic 6.1: Story 6.1.4 (#388, G1.4) implemented on `feat/ux-v2` — calm monochrome category grid: grey tiles, tags as text links with a grey count, 44 px links, accent only when pressed. |
| **1.71** | Nov 5, 2026 | Epic 6.1: Story 6.1.16 (#400, G4.3) implemented on `feat/ux-v2` — take rows show **Public**, **Shared · n**, **Pending invite** and **Verified musician** as text pills (no tooltip-only icons), in 8 locales. |
| **1.70** | Nov 5, 2026 | Epic 6.1: Story 6.1.3 (#387, G1.3) implemented on `feat/ux-v2` — small labels readable: sentence-case 13 px section titles, nothing below 12 px, axe-core colour-contrast smoke test. |
| **1.69** | Nov 5, 2026 | Epic 6.1: Story 6.1.15 (#399, G4.2) implemented on `feat/ux-v2` — Record tab splits **My takes** and **Shared with me**; shared rows say "Shared by {name}" and are listen-only. |
| **1.68** | Nov 5, 2026 | Epic 6.1: Story 6.1.2 (#386, G1.2) implemented on `feat/ux-v2` — compact song rows with one grey meta line. |
| **1.67** | Nov 5, 2026 | Epic 6.1: Story 6.1.12 (#396, G3.1) implemented on the integration branch `feat/ux-v2` — the mini player appears only after play (UXD-5); sheets, drawer and page reserve `--mini-player-h`. |
| **1.66** | Nov 5, 2026 | Epic 6.1: Story 6.1.14 (#398, G4.1) implemented on the integration branch `feat/ux-v2` — one name, Practice, in all 8 locales. |
| **1.65** | Nov 5, 2026 | Epic 6.1: Story 6.1.26 (#410, G6.1) implemented on `feat/ux-v2` — GuestGate on every members-only screen; guest read of public takes requires singer consent (UXD-2). |
| **1.64** | Nov 5, 2026 | Epic 6.1: Story 6.1.22 (#406, G5.1) implemented on `feat/ux-v2` — unknown URLs show a real 404 page for every role; the proxy redirects guests to login only for `/account`, `/admin`, `/users`. Spec: `docs/testing/ux-v2-real-404.feature`. |

This document breaks down the project roadmap into actionable Epics and User Stories, following the Agile methodology. Acceptance Criteria are defined using **Gherkin syntax** (Given/When/Then).

## Phase 1: The Bare Essentials (MVP)

**Focus:** Core song management and basic public viewing.

### Epic 1.1: Song Management (Admin)

**Story 1.1.1: [Implemented]** As a Member, I want to add a song using a web form so that I can share medicine with the community.

```
Scenario: Admin uploads via Form
  Given I am logged in as an Admin
  And I am on the "Add Song" page
  When I fill in the Title "New Song" and Content "[C]Lyrics"
  And I click the "Add Song" button
  Then a new song should be created in the database
  And I should be redirected to the Home page
```

**Story 1.1.2: [Implemented]** As an Admin, I want to upload a raw `.cho` file via an expandable upload section to auto-fill the form so that I don't have to type metadata manually.

```
Scenario: Import metadata from File via Expandable Section
  Given I am on the Add Song page
  When I click the "Or upload a file" toggle
  And I select a file containing "{title: Grandmother Earth} {author: Traditional}"
  Then the "Title" field should be automatically filled with "Grandmother Earth"
  And the "Author" field should be automatically filled with "Traditional"
  And the "Content" field should be filled with the file body
```

**Story 1.1.2-bis: [Implemented]** As an Admin, I want pasted metadata (title/author) in the lyrics field to populate the form fields automatically so that I can copy-paste full song files easily.

```
Scenario: Smart Paste
  Given I am on the Add Song page
  When I paste content containing "{title: Grandmother Earth} {author: Traditional}" into the "Lyrics & chords" textarea
  Then the "Title" field should be filled with "Grandmother Earth"
  And the "Author" field should be filled with "Traditional"
  And the "Lyrics & chords" field should contain only the song content
```

**Story 1.1.3: [Implemented]** As an Admin, I want to delete a song so that I can remove duplicate or incorrect entries.

```
Scenario: Admin deletes a song
  Given I am logged in as an Admin
  And I am viewing the song list
  When I click the "Delete" icon on the song "Pachamama"
  And I confirm the deletion in the modal
  Then the song "Pachamama" should no longer appear in the list
```

**Story 1.1.4: [Implemented]** As a Member, I want to log in securely so that I can access personalized features.
<!-- Login (magic link + password) works and redirects to Home. Edit/Delete controls visible on song detail page for owner/admin. Delete icons on song cards in the library view implemented (owner/admin, hover-visible top-right overlay). Profiles RLS policies added to fix role fetch. -->

```
Scenario: Successful Admin Login
  Given I am on the Login page
  When I enter a valid email "admin@sacredfire.com" and valid password
  And I click "Sign In"
  Then I should be redirected to the Home page
  And I should see Admin controls (e.g., Upload button, Delete icons)
```

**Story 1.1.5: [Implemented]** As a Guest, I want to be kindly prompted to create an account when I click "Upload" so that I understand this is a community feature.
<!-- /songs/add renders SongForm directly for all users. The only guard is a silent redirect to /auth/login on submit. No "Please join our circle" modal or Log In / Create Account prompt exists. -->

```
Scenario: Guest clicks Upload
  Given I am an unauthenticated Guest
  When I click the "Add Song" icon in the header
  Then I should see a modal or page saying "Please join our circle to share medicine."
  And I should be offered options to "Log In" or "Create Account"
```

**Story 1.1.6: [Implemented]** As a Content Contributor, I want the system to automatically detect and convert songs formatted with "Chords over Lyrics" into standard ChordPro format, so that I don't have to manually reformat existing song sheets when adding them to the library.
<!-- lib/chordProParsing.ts: full detection heuristic, conversion, Title/Author/Key/Capo auto-fill. Paste and file-upload handlers in SongForm. Unit tests in lib/unit-tests/chordProParsing.test.ts. -->

```
Scenario: Paste "Chords over Lyrics" content
  Given I am on the "Add Song" page
  When I paste text with chords over lyrics into the "Lyrics & chords" textarea
  Then the system should detect the format
  And the content should automatically convert to ChordPro format
  And the "Title" and "Author" fields should be populated if present
```

**Story 1.1.7: [Implemented]** As a User, I want to attach YouTube, Spotify, and SoundCloud links to a song so that I can listen to reference recordings directly on the song page.

```
Scenario: Persist and Display Media Links
  Given I am on the "Add Song" or "Edit Song" page
  When I paste a valid URL into the YouTube, Spotify, or SoundCloud fields
  And I save the song
  Then the links should be persisted in the database
  And when I view the song details
  Then I should see the corresponding embedded player(s) for the provided links
```

### Epic 1.2: Public Library & Discovery

**Story 1.2.1: [Implemented]** As a Guest, I want to view a list of all songs so that I can see what is available in the songbook.

```
Scenario: Guest views song library
  Given I am an unauthenticated Guest
  When I visit the Home page
  Then I should see a clear Dashboard with options: "Search Songs", "Upload Song", "Settings"
  When I click "Search Songs"
  Then I should see a list of songs
  And each song card should display a Title and Author
  And the list should load more songs as I scroll down
```

**Story 1.2.2: [Implemented]** As a Guest, I want to search for a song by title or lyrics so that I can quickly find a specific song.

```
Scenario: Search by title
  Given I am on the Songs page
  When I type "Grandmother" into the search field
  Then only songs whose title or lyrics contain "Grandmother" should be visible
```

**Story 1.2.3: [Implemented]** As a Guest, I want to access the Explore and Playlists pages so that I can discover medicine songs without being forced to log in.

```gherkin
Scenario: Guest accesses Explore page
  Given I am an unauthenticated Guest
  When I visit the "/explore" page
  Then I should see the category grid
  And I should not be redirected to the login page

Scenario: Guest accesses Playlists page
  Given I am an unauthenticated Guest
  When I visit the "/playlists" page
  Then I should see the Playlists overview
  And I should not be redirected to the login page
```

**Story 1.2.4: [Implemented]** As a Guest, I want to use a unified search field at the top of the screen on mobile and open advanced filters via an inline button, so that I can search and filter songs efficiently on mobile.

```gherkin
Scenario: Unified Search Field on Mobile
  Given I am using a mobile device
  When I visit the Songs page
  Then I should see the search input field directly in the header instead of just a looking glass icon
  And the search input field should contain an inline "advanced filter" button

Scenario: Open Advanced Filter Popup on Mobile
  Given I am using a mobile device
  And I am on the Songs page
  When I click the inline "advanced filter" button inside the search field
  Then the "search options" popup modal should open

Scenario: Advanced Filter Action Panel Position
  Given the "search options" popup modal is open
  Then the action panel containing the "Clear All" and "Show results" buttons should be rendered at the top of the popup
  And it should be located directly below the popup title "Search options"
  And it should be located above the filter options/selections

Scenario: Disable Automatic Search when Advanced Filter is Open
  Given the "search options" popup modal is open
  When I type a search query in the search field
  Then the automatic debounced search should NOT execute while the popup is open
  And the search should only execute when I click the "Show results" button
```

**Story 1.2.5: [Implemented]** As a logged-in user, I want to filter and identify songs with personal rehearsal recordings and interact with author pills across all viewports.

```gherkin
Scenario: Personal Rehearsal Recording indicator for logged-in user
  Given I am logged in as a user who has saved or uploaded a private rehearsal recording for a song
  When I view the song listing or song detail header
  Then I should see a personal rehearsal indicator (🎙️ Mic / Violet icon) labeled "Recording" on that song card / detail header
  And public melody links should continue to display the 🎵 Emerald Note icon

Scenario: Direct Audio File Upload in Rehearsal Drawer
  Given I am a logged-in user on a song detail page
  When I open the Rehearsal Drawer
  Then I should see options to both record live audio and upload an existing audio file (.mp3, .m4a, .wav, .webm)
  When I select and upload an audio file
  Then the file should be saved under my private user recordings in Supabase storage
  And the song should immediately display the "Recording" badge

Scenario: Privacy boundary for anonymous visitors
  Given I am an anonymous visitor (not logged in)
  When I view the song listing
  Then I should NOT see any personal rehearsal indicators (🎙️ Mic / Violet icon)
  And the "My Recordings" filter toggle should be hidden from the Search & Filter bar

Scenario: Smart Playlist card for "My Recordings"
  Given I am a logged-in user viewing the Playlists page (/library/playlists)
  Then I should see a "My Recordings" card under the Smart Playlists section
  And it should display a Mic (🎙️) icon, description "Your private rehearsal recordings", and count of songs with personal recordings
  When I click the "My Recordings" Smart Playlist card
  Then I should be navigated to the Songs page filtered by "?myRecordings=true"

Scenario: Interactive Author Pill across all viewports
  Given I am viewing a song detail page on mobile, tablet, or desktop
  Then the author name should be rendered as a clear, interactive pill badge (e.g. 👤 Author Name)
  When I tap or click the Author pill badge
  Then I should be navigated to the Songs page filtered strictly by that author ("?artist=AuthorName")

Scenario: Filtering song list by "My Recordings"
  Given I am logged in on the Songs page
  When I activate the "My Recordings" filter toggle in the Search & Filter bar
  Then only songs for which I (auth.uid()) have saved or uploaded a private rehearsal recording should be displayed
  And the "My Recordings" filter toggle should be displayed as active
```

### Epic 1.3: Basic Song Viewer

**Story 1.3.1: [Implemented]** As a Musician, I want to see chords displayed above the lyrics so that I can play the song on my guitar.

```
Scenario: Render ChordPro content
  Given a song has content "[Am]Grandmother [C]Earth"
  When I view the Song Detail page
  Then the chord "Am" should be rendered visually above the word "Grandmother"
  And the chord "C" should be rendered visually above the word "Earth"
```

**Story 1.3.2: [Implemented]** As a Guest, I want to listen to an audio reference so that I can learn the melody.

```
Scenario: Display Audio Player
  Given a song has an audio_url "https://soundcloud.com/example"
  When I view the Song Detail page
  Then I should see an embedded SoundCloud player at the bottom of the page
```

**Story 1.3.4: [Implemented]** As a Guest, I want to watch a YouTube video reference so that I can see how the song is played.

```
Scenario: Display YouTube Video
  Given a song has a youtube_url "https://youtube.com/watch?v=example"
  When I view the Song Detail page
  Then I should see an embedded YouTube player
```

**Story 1.3.3: [Implemented]** As a Guest, I want to navigate back to the home screen from any page so that I can easily browse more songs.

```
Scenario: Navigate back to home
  Given I am on the Song Detail page
  When I click the "Back" arrow in the header
  Then I should be redirected to the Home page

**Story 1.3.5: [Implemented]** As a Musician, I want the screen to stay awake while I am viewing a song so that I don't have to touch it to keep the lyrics and chords visible while playing.

```gherkin
Scenario: Prevent screen sleep on Song Detail page
  Given I am on the Song Detail page of a song
  And I am on a supported mobile browser
  When the page load is complete
  Then a Wake Lock should be requested automatically (using Screen Wake Lock API)
  And the screen should remain on regardless of system timeout settings

Scenario: Behavior on visibility change
  Given I have a wake lock active on a song page
  When I switch tabs or minimize the browser
  Then the wake lock should be released
  When I return to the song page tab
  Then the wake lock should be re-acquired automatically
```
```

## Phase 2: Minimal Lovable Product (MLP)

**Focus:** Utility for musicians and better organization.

### Epic 2.1: Music Tools

**Story 2.1.1:** As a Musician, I want to transpose the chords of a song so that I can match my vocal range.

```
Scenario: Transpose Up
  Given the current key is "C"
  And the first chord displayed is "C"
  When I click the "Transpose +1" button
  Then the displayed key should be "C#"
  And the first chord displayed should change to "C#"
```

**Story 2.1.2:** As a Learner, I want to see the melody in sheet music notation so that I can learn the exact notes.

```
Scenario: Render Sheet Music
  Given a song has ABC notation data "C D E F"
  When I view the Song Detail page
  Then I should see a musical staff rendered visually
  And the notes C, D, E, and F should be visible on the staff
```

**Story 2.1.3:** As a Learner, I want to play the melody notes so that I can hear how it sounds without an instrument.

```
Scenario: Play Melody
  Given the sheet music is visible
  When I click the "Play Melody" button
  Then I should hear the notes generated by the synthesizer
  And the cursor should move along the notes as they play
```

### Epic 2.2: Rich Editing

**Story 2.2.1: [Implemented]** As a User, I want to edit the lyrics of a song I uploaded so that I can fix typos.

```
Scenario: Manual Edit
  Given I am logged in as Admin
  And I am on the Edit page for "Song A"
  When I change the text "[C]Hello" to "[G]Hello"
  And I click "Save"
  Then the song should be updated in the database
  And I should be redirected to the Song Detail view showing the chord "G"
```

### Epic 2.3: Taxonomy & Filtering

**Story 2.3.1: [Implemented]** As a Guest, I want to filter songs by category (e.g., "Water", "Fire") so that I can find songs for specific ceremony moments.

```
Scenario: Filter by Category
  Given there are songs tagged "Water" and songs tagged "Fire"
  When I select "Water" from the filter menu
  Then only songs tagged with "Water" should be visible
  And songs tagged with "Fire" should be hidden
```

**Story 2.3.2: [Implemented]** As a Guest & Authenticated Member, I want to open a side menu (hamburger) to access filters easily without cluttering the main view.

```
Scenario: Open Filter Menu
  Given I am on the Song List page
  When I click the hamburger menu icon
  Then a side drawer should slide in
  And I should see filter options for "Theme", "Rhythm", etc.
```

**Story 2.3.3: [Implemented]** As a Guest, I want to browse songs by category page so that I can explore all songs in a specific theme.

```
Scenario: Browse by Category
  Given I am on the Explore page
  When I click on the "Water" category
  Then I should be taken to a page listing all songs tagged "Water"
```


## Phase 3: Community & Evolution

**Focus:** User engagement and crowdsourcing.

### Epic 3.1: User Accounts

**Story 3.1.1: [Implemented]** As a Guest, I want to sign up with my Google account so that I don't have to remember another password.

```gherkin
Scenario: Social Login
  Given I am on the Login page
  When I click "Continue with Google"
  And I authenticate successfully with Google
  Then a user profile should be created for me in the system
  And I should be logged in
```

**Story 3.1.2: [Implemented]** As a Member, I want to "Heart" songs so that I can quickly access my favorites.

```
Scenario: Add to Favorites
  Given I am logged in
  When I click the "Heart" icon on a song
  Then the icon should change to filled/active
  And the song should appear in my "My Favorites" list
```

**Story 3.1.3:** As an operator/maintainer, I want to switch the transactional email delivery mechanism via a single environment variable (between built-in Supabase/Inbucket, Gmail SMTP, and SendGrid SMTP) so that I can use a local mailbox in development and a real provider in production without code changes.

```gherkin
Scenario: Development email using Inbucket
  Given the environment is configured with mail provider "inbucket"
  When an auth email is triggered
  Then the message is delivered to the local Inbucket mailbox

Scenario: Production email using SMTP provider
  Given the environment is configured with mail provider "smtp"
  When an auth email is triggered
  Then the message is dispatched via the configured external SMTP service
```

**Story 3.1.4:** As a Guest, I want members-only features to behave consistently — show me what the feature is, tell me why I need an account, and bring me straight back to where I was after signing in.

```gherkin
Scenario: Members-only feature prompt
  Given I am an unauthenticated Guest
  When I attempt to access a members-only action
  Then I should be shown the context for why an account is required
  And after authenticating, I should be redirected back to my original destination
```

**Story 3.1.4.1:** As a Guest, I want foundational sign-in navigation with signInHref, reason keys, and next= query parameters so that my intended destination is preserved across the auth flow.

```gherkin
Scenario: Preserve intent with next parameter
  Given I am an unauthenticated Guest
  When I click sign in with an intended return path
  Then the sign-in URL includes the return path in the next parameter
  And successful authentication returns me to that path
```

**Story 3.1.4.2:** As a Guest, I want a GuestGate locked preview for personal collections so that I can see the value of collections before signing in.

```gherkin
Scenario: Locked preview of collection
  Given I am an unauthenticated Guest navigating to a personal collection
  Then I see a locked preview banner explaining the benefits of membership
  And an action button prompting me to sign in
```

**Story 3.1.4.3:** As a Guest, I want a SignInSheet with intent resume for guest actions so that I can complete my action immediately after signing in.

```gherkin
Scenario: Resume action after sign in
  Given I triggered an action that requires an account
  When the SignInSheet opens and I complete authentication
  Then the pending action resumes or completes seamlessly
```

**Story 3.1.4.4:** As a Guest, I want guest creation flows to gate at save while preserving input so that I do not lose work when prompted to log in.

```gherkin
Scenario: Input preserved during gate at save
  Given I have entered song or playlist data as a Guest
  When I click save and authenticate
  Then my entered data is preserved and saved under my new account
```

**Story 3.1.4.5:** As a Contributor, I want documentation for access tiers and guest pattern mockups so that developers build consistent guest gating.

```gherkin
Scenario: Access tiers documented
  Given the project documentation
  Then access tiers and guest patterns are clearly defined with component usage guidelines
```

**Story 3.1.4.6:** As a User, I want one consistent way to create a playlist across the app so that playlist creation behaves predictably everywhere.

```gherkin
Scenario: Consistent playlist creation
  Given I am anywhere in the app where playlists can be created
  When I choose to create a playlist
  Then the same creation interface and validation are presented
```

### Epic 3.2: Version Control

**Story 3.2.1:** As a Musician, I want to submit a new version of a song (e.g., "Simplified Chords") so that beginners can play it too.

```
Scenario: Add Alternative Version
  Given I am viewing the song "Grandmother Earth"
  When I click "Add Version"
  And I submit valid ChordPro content with the name "Simplified"
  Then a new version should be linked to "Grandmother Earth"
  And it should be viewable via the version selector
```

**Story 3.2.2:** As a Member, I want to vote on song versions so that the best arrangement rises to the top.

```
Scenario: Upvote Version
  Given there are two versions of a song
  When I click "Upvote" on Version B
  Then the vote count for Version B should increment by 1
```

### Epic 3.3: Progressive Web App — Installability

**Story 3.3.1: [Implemented]** As a Musician, I want to install Sacred Fire Songs as an app on my phone or tablet so that I can launch it from my home screen like a native app, without opening a browser.

```gherkin
Scenario: Install prompt on mobile
  Given I am visiting Sacred Fire Songs in a supported mobile browser (Chrome/Safari)
  When the browser detects the app is installable
  Then I should see an "Add to Home Screen" prompt or banner
  And after installing, the app should open in standalone mode (no browser chrome)
  And the app icon should appear on my home screen with the Sacred Fire Songs icon and name

Scenario: Standalone launch
  Given I have installed the app on my home screen
  When I tap the Sacred Fire Songs icon
  Then the app should open in full-screen standalone mode
  And the browser address bar should not be visible
  And the app should load to the home dashboard
```

**Story 3.3.2: [Implemented]** As a Musician, I want the installed app to display Sacred Fire Songs branding (icon, splash screen, theme color) so that it feels like a proper native app rather than a pinned website.

```gherkin
Scenario: App icon and name
  Given the app is installed on my device
  When I view my home screen or app drawer
  Then the icon should display the Sacred Fire Songs logo
  And the app name should read "Sacred Fire Songs" (or a short variant that fits)

Scenario: Splash screen on launch
  Given I open the installed app
  When the app is loading
  Then I should see a branded splash screen with the app icon and background color
  Rather than a blank white screen

Scenario: Status bar theme
  Given I am using the installed app on Android
  Then the status bar and browser toolbar (if visible) should match the app's dark theme color
```

### Epic 3.4: Gatekeeper Role

**Story 3.4.1:** As an Admin, I want to assign the Gatekeeper role to trusted community members so that they can curate the library without having full Admin access.

```gherkin
Scenario: Assign Gatekeeper role
  Given I am logged in as an Admin
  And I am on a user's profile or the user management page
  When I change their role to "Gatekeeper"
  Then they should immediately gain Gatekeeper capabilities
  And lose no capabilities they had as a Musician

Scenario: Gatekeeper accesses their tools
  Given I am logged in as a Gatekeeper
  When I visit the library or a song detail page
  Then I should see Gatekeeper-specific actions (Flag, Edit metadata, Merge)
  That are not visible to Members or Musicians
```

**Story 3.4.2:** As a Gatekeeper, I want to flag songs as "Needs Improvement" or "Duplicate" so that quality issues are visible to the community and tracked in my queue, and the original contributor is informed.

```gherkin
Scenario: Flag a song as needing improvement
  Given I am logged in as a Gatekeeper
  And I am viewing a song detail page
  When I select "Flag — Needs Improvement" from the song actions
  Then a "Needs Improvement" badge should appear on the song card and detail page
  And the song should appear in the Gatekeeper queue under "Needs Improvement"
  And the original poster should receive a notification: "Your song '[title]' has been flagged as needing improvement"

Scenario: Flag a song as a duplicate
  Given I am logged in as a Gatekeeper
  When I flag a song as "Duplicate"
  Then a "Duplicate" badge appears on the song
  And the song appears in the Gatekeeper queue under "Duplicates"
  And the original poster is notified

Scenario: Resolve a flag
  Given a song is flagged
  When I remove the flag (after improvements are made or the duplicate is merged)
  Then the badge disappears from the song card and detail page
  And the original poster receives a notification that the flag has been resolved
  And the song is removed from the Gatekeeper queue
```

**Story 3.4.3:** As a Gatekeeper, I want to edit the metadata and media links of any song so that I can enrich the library without waiting for the original contributor.

```gherkin
Scenario: Add a YouTube link to someone else's song
  Given I am logged in as a Gatekeeper
  And I am on the edit page for a song I did not create
  When I add a valid YouTube URL and save
  Then the YouTube embed should appear on the song detail page
  And the song detail should show "Last updated by [Gatekeeper name]"

Scenario: Update song categories and key
  Given I am logged in as a Gatekeeper
  When I edit the key, capo, or categories of any song
  Then the changes are saved immediately
  And the lyrics and ChordPro content fields are not editable for me
```

**Story 3.4.4:** As a Gatekeeper, I want to merge two duplicate songs into one canonical entry with multiple versions so that the library stays clean and both contributors are acknowledged.

```gherkin
Scenario: Merge a duplicate into a canonical song
  Given I am logged in as a Gatekeeper
  And I am viewing a song flagged as a duplicate
  When I select "Merge with…" and search for and select the canonical song
  And I confirm the merge
  Then the duplicate song becomes an alternate version of the canonical song
  And the canonical song's detail page shows a version selector
  And both original contributors are notified with a link to the merged entry
  And the duplicate song's old URL redirects to the canonical song page

Scenario: Merge is visible in version selector
  Given a song has been merged from two originals
  When any user views the canonical song
  Then they can switch between versions using the version selector
  And each version credits its original contributor
```

**Story 3.4.5:** As a Gatekeeper, I want to mark a public playlist as "Featured" so that it appears in a curated section at the top of the playlists page for all visitors.

```gherkin
Scenario: Feature a playlist
  Given I am logged in as a Gatekeeper
  And I am viewing a public playlist
  When I select "Feature Playlist" from the context menu
  Then the playlist should appear in a "Featured" section at the top of the /library/playlists page
  And the Featured section should be visible to guests and all authenticated users

Scenario: Unfeature a playlist
  Given a playlist is currently featured
  When I select "Remove from Featured" from the context menu
  Then it should move back to the regular Public Playlists section

Scenario: No featured playlists
  Given no playlists are currently featured
  Then the Featured section should not appear on the playlists page
```

**Story 3.4.6: [Implemented]** As an Admin or Gatekeeper, I want to add/remove songs from any Public Playlist, edit the playlist details, and change the song order, so that we can curate public playlists and maintain high-quality collections.

```gherkin
Scenario: Gatekeeper adds a song to another user's Public Playlist
  Given I am logged in as a Gatekeeper
  And there is a Public Playlist owned by a Member
  When I attempt to add a song to this Public Playlist
  Then the song should be successfully added to the playlist
  And I should receive a success confirmation toast

Scenario: Admin reorders songs in another user's Public Playlist
  Given I am logged in as an Admin
  And there is a Public Playlist owned by a Member with multiple songs
  When I change the order of the songs in the playlist
  Then the new song order should be saved successfully

Scenario: Gatekeeper edits another user's Public Playlist details
  Given I am logged in as a Gatekeeper
  And there is a Public Playlist owned by a Member
  When I update the title, description, or public status of this playlist
  Then the changes should be saved successfully

Scenario: Member attempts to edit another user's Public Playlist
  Given I am logged in as a Member
  And there is a Public Playlist owned by another user
  Then I should not see options to edit, reorder, or add/remove songs from this playlist
  And any API request to modify it should be rejected with a permission error
```

### Epic 3.5: Musician Profile Setting

> **Note:** The `musician` role has been removed from the role hierarchy. Playing an instrument and reading chords is a personal skill, not a trust level. Members self-declare this via their profile.
>
> Role hierarchy: **Guest → Member → Gatekeeper → Admin**

**Story 3.5.1:** As a Member, I want to indicate in my profile that I play an instrument and can read chord notation, so that the app shows me musician-focused features like transpose controls and sheet music.

```gherkin
Scenario: Enable musician features from profile
  Given I am logged in as a Member
  And I am on the Profile / Settings page
  When I toggle "I play an instrument and can read chord notation" to on
  And I save my profile
  Then transpose controls should appear on song detail pages
  And sheet music / ABC notation should be visible (when available)
  And a chord icon badge should appear on song cards that have chords
  And a "Chords" filter toggle should appear on the Songs page

Scenario: Disable musician features
  Given I have the musician setting enabled
  When I toggle it off and save
  Then transpose controls should no longer appear on song detail pages
  And chord badges on song cards should be hidden
  And the Chords filter toggle should disappear from the Songs page

Scenario: Default for new accounts
  Given I create a new account
  Then the musician setting should be off by default
  And I can enable it at any time from my profile settings
```

**Story 3.5.2:** As a new user, I want to be asked during sign-up whether I play an instrument, so that the right features are available to me immediately without having to find the setting later.

```gherkin
Scenario: Onboarding question
  Given I have just created an account and verified my email
  When the onboarding flow runs
  Then I should be asked "Do you play an instrument or read chord notation?"
  And answering Yes should set is_musician = true on my profile
  And answering No (or skipping) should leave it false
  And I can always change this later in my profile settings
```

### Epic 3.6: Administrative Management

> **Placeholder & umbrella for administrative user stories.**
> As an administrator, I want to be able to administer configuration, users, settings, and songs in such a way that I can ensure that I have up-to-date info and can act accordingly.

**Story 3.6.1: [Implemented]** As an Admin, I want to have an overview of all users, view their details, and see their contributions, so that I can monitor community activity and ensure account information is accurate and up to date.

```gherkin
Scenario: View user list overview
  Given I am logged in as an Admin
  When I navigate to the Admin Users overview page
  Then I should see a list of all registered users
  And for each user I should see summary details (e.g., name/email, role, join date, status)

Scenario: View user detail and contributions
  Given I am logged in as an Admin
  And I am viewing the users overview list
  When I select a user to view their details
  Then I should see their profile details (e.g., email, role, musician status, last active)
  And I should see an overview of their contributions (e.g., songs added, versions submitted, public playlists created, comments/flags)

Scenario: Non-admin access restricted
  Given I am logged in as a Member or Gatekeeper
  When I attempt to access the Admin Users overview page
  Then I should be denied access with an unauthorized notice
```

> **Implementation notes:** "Status" is derived from `last_seen_at` (active within 30 days / inactive / never active). "Musician status" means role `musician` or `expert`. Comments and flags are not modelled in the database yet, so they are not shown. Executable spec: `docs/testing/admin-users.feature` (`@unit`, `@seed`, `@e2e`).

**Story 3.6.2:** As an Admin, I want to invite a new user by e-mail (or create an account directly) with a chosen role, so that I can onboard community members without them having to self-register. (#275 – acceptance criteria in the issue; needs a server-only `SUPABASE_SECRET_KEY`.)

**Story 3.6.3:** As an Admin, I want to suspend and reactivate user accounts, so that I can stop abusive or compromised accounts without deleting their contributions. (#276 – no self-suspend, at least one active admin, confirmation dialog, audit log.)

**Story 3.6.4:** As an Admin, I want to change a user's role, so that I can grant or withdraw permissions as responsibilities change. (#277 – no self-change, at least one active admin, confirmation dialog, audit log.)

**Story 3.6.5: [Implemented]** As an Admin, I want to sort the users overview by name and by number of songs, so that I can quickly find a user or see who contributes most songs. (#278)

```gherkin
Scenario Outline: Sort the users overview
  Given I am logged in as an Admin
  When I sort by "<sort>"
  Then the users are listed by <order>
  Examples:
    | sort         | order                                           |
    | Name (A-Z)   | display name ascending, falling back to e-mail  |
    | Name (Z-A)   | display name descending, falling back to e-mail |
    | Most songs   | number of songs descending, ties by name        |
    | Fewest songs | number of songs ascending, ties by name         |

Scenario: Sort choice survives a reload
  Given I sorted by "Most songs"
  When I reload the page or come back from a user's details
  Then the list is still sorted by "Most songs"
```

**Story 3.6.6: [Implemented]** As an Admin, I want to open a user's details by clicking anywhere on their row, so that I don't have to aim for the small "Details" button. (#279)

```gherkin
Scenario: Click a row to open the user's details
  Given I am on the Admin Users overview page
  When I click anywhere on a user's row
  Then I am on that user's detail page
  And Enter on the focused row, middle-click and Ctrl/Cmd-click work as for a link
```

### Epic 3.7: Multi-Language Support (i18n)

> **Scope:** the app interface (navigation, buttons, forms, messages) is available in English, Dutch, Spanish, Italian, Russian, Quechua (Runasimi), French and Portuguese. Song content (titles, lyrics, artist names, tags) is **not** translated. Executable scenarios: `docs/testing/i18n.feature` (issue #246).

**Story 3.7.1:** As a visitor or member, I want to use the app in my own language (English, Dutch, Spanish, Italian, Russian, Quechua, French or Portuguese) and have that choice remembered, so that I understand every screen without switching back each visit.

```gherkin
Scenario: I18N-01 – English is the default when nothing is known
  Given I have never chosen a language
  And my browser prefers a language the app does not support (e.g. German)
  When I open any page
  Then the interface is shown in English

Scenario: I18N-02 – The browser language is the default when supported
  Given I have never chosen a language
  And my browser prefers Dutch ("nl-BE", "nl-NL", …)
  When I open any page
  Then the interface is shown in Dutch from the first render

Scenario: I18N-03 – Switching language updates the whole interface immediately
  Given I am on any page (as a guest or signed in)
  When I pick "NL" in the language switcher (sidebar, user menu or Account → Preferences)
  Then navigation, page content, buttons and messages switch to Dutch without a full page reload
  And the <html lang> attribute becomes "nl"

Scenario: I18N-04 – The choice persists across reloads, navigation and logout
  Given I chose Dutch
  When I reload, open another page, or sign out and back in on the same device
  Then the interface is still in Dutch
  And my choice overrides the browser language

Scenario: I18N-05 – Server-rendered pages honour the choice without a hydration mismatch
  Given I chose Dutch
  When a page is rendered on the server and hydrated in the browser
  Then the server HTML is already Dutch
  And no React hydration-mismatch error is logged

Scenario: I18N-06 – Missing translations fall back to English
  Given a key has no Dutch translation
  When it is shown with Dutch active
  Then the English text is shown
  And a key missing in every language shows the key name, never an empty string

Scenario: I18N-07 – An unknown or tampered stored language is ignored
  Given the stored language is not a supported one (e.g. "fr")
  When I open the app
  Then the browser language or English is used instead

Scenario: I18N-08 – Placeholders are interpolated
  Given a message contains placeholders like {count}
  When it is shown
  Then every placeholder is replaced by its value
  And an unknown placeholder is shown literally

Scenario: I18N-09 – Dictionaries stay in sync
  Then every language has exactly the same keys as English
  And every translation uses the same placeholders as its English source
  And no translation is empty
  And using an unknown key in code fails the TypeScript build

Scenario: I18N-10 – Song content is never translated
  Given Dutch is active
  When I open a song
  Then its title, lyrics, chords and artist names are shown exactly as entered

Scenario: I18N-11 – Playlist PDF export follows the interface language
  Given Dutch is active
  When I export a playlist as PDF
  Then the export button, messages and login prompt are in Dutch
  And the PDF labels (page footer, "Toonsoort", "Door", date) are in Dutch
  And the song titles, lyrics and chords in the PDF are unchanged

Scenario: I18N-12 – Additional languages
  Given my browser prefers Spanish, Italian, Russian, Quechua ("quz"/"quy"), French or Portuguese ("pt-BR")
  When I open the app without a stored choice
  Then the interface is shown in that language
  And I can pick any of the eight languages, each listed in its own name, from the language menu
  And every language has a complete translation (same keys and placeholders as English)

## Phase 4: Professional Toolkit

**Focus:** Tools for ceremony leaders.

### Epic 4.1: Setlists

**Story 4.1.1: [Implemented]** As a Musician, I want to create a named setlist so that I can prepare for a specific night.

```
Scenario: Create Setlist
  Given I am logged in
  When I go to "My Setlists" and click "New"
  And I name it "Full Moon Ceremony"
  Then a new empty setlist named "Full Moon Ceremony" should exist
```

**Story 4.1.2: [Implemented]** As a Musician, I want to reorder songs in my setlist so that the flow matches the ceremony intensity.

```
Scenario: Reorder Setlist
  Given I have a setlist with "Song A" at position 1 and "Song B" at position 2
  When I drag "Song B" to position 1
  Then "Song B" should be at position 1
  And "Song A" should be at position 2
```

**Story 4.1.3: [Implemented]** As a Musician, I want to search for and add songs to a playlist directly from the playlist detail page so that I don't have to navigate away to find songs.

```gherkin
Scenario: Add song via search sheet
  Given I am on the Playlist Detail page
  When I click the "+ Add Songs" button
  Then a search sheet should slide up
  And I should be able to type to filter songs
  And clicking a song should add it to the playlist immediately
  And the song should appear at the bottom of the list
```

**Story 4.1.4: [Implemented]** As a Musician, I want to toggle my playlist between public and private so that I can control who can see it.

```gherkin
Scenario: Make playlist public
  Given I am on the Playlist Detail page of a private playlist
  When I click the visibility toggle (Lock icon)
  Then the playlist should become public
  And the icon should change to a Globe
  And a success toast should confirm the change

Scenario: Make playlist private
  Given I am on the Playlist Detail page of a public playlist
  When I click the visibility toggle (Globe icon)
  Then the playlist should become private
  And the icon should change to a Lock
```

**Story 4.1.5: [Implemented]** As a Musician, I want to share a link to a public playlist so that ceremony co-facilitators can view it.

```gherkin
Scenario: Copy shareable link
  Given I am on the Playlist Detail page of a public playlist
  When I click the "Copy Link" button
  Then the playlist URL should be copied to my clipboard
  And a toast should confirm "Link copied"
```

**Story 4.1.6: [Implemented]** As a Musician, I want to add a description or note to a playlist so that I can remember its purpose (e.g. "Closing songs, slow and grounding").

```gherkin
Scenario: Add description
  Given I am on the Playlist Detail page
  When I click the description area (or an edit icon)
  Then an inline text field should appear
  And when I type and save, the description should persist
  And it should display below the playlist title
```

**Story 4.1.7:** As a Ceremony Leader, I want to enter a full-screen presentation mode for a playlist so that I can read songs clearly during a ceremony without UI chrome.

```gherkin
Scenario: Enter presentation mode
  Given I am on the Playlist Detail page with at least one song
  When I click "Present" or the ceremony mode button
  Then the screen should go full-screen showing the current song's lyrics and chords
  And swiping or pressing arrow keys should advance to the next song
  And the screen wake lock should be active
```

**Story 4.1.8: [Implemented]** As a Musician, I want to duplicate a playlist so that I can create variations without rebuilding from scratch.

```gherkin
Scenario: Duplicate playlist
  Given I am on the Playlist Detail page
  When I select "Duplicate" from the context menu
  Then a new playlist named "Copy of [original name]" should be created
  And it should contain all the same songs in the same order
  And I should be navigated to the new playlist
```

**Story 4.1.9:** As a Musician, I want to set a transposition offset per song within a playlist so that each song is displayed in the right key for our group without modifying the original.

```gherkin
Scenario: Set per-song transpose in playlist
  Given I am on the Playlist Detail page
  When I tap the key indicator next to a song
  Then I should be able to set a +/- semitone offset
  And when I navigate to that song from the playlist, the chords should be shown transposed
  And the original song in the library should remain unchanged
```

**Story 4.1.10:** As a Musician, I want to assign a cover color or icon to a playlist so that I can visually distinguish my playlists at a glance.

```gherkin
Scenario: Set playlist cover color
  Given I am on the Playlist Detail page
  When I click the playlist thumbnail/icon area
  Then I should see a color picker or icon selector
  And after selecting, the playlist card on the Playlists page should reflect the chosen color/icon
```

### Epic 4.2: Print & Export

**Story 4.2.1: [Implemented]** As a Member or Musician, I want to generate a PDF of my setlist so that I can print it for the ceremony.

```
Scenario: Export PDF (Authenticated Member)
  Given I am logged in as a Member or Musician
  And I am viewing a setlist with between 1 and 200 songs
  When I click "Export PDF" or the Printer button
  Then a PDF file should download
  And the PDF should contain the lyrics and chords for all songs in the setlist
  And every page should display a 3-part footer:
    | Song URL (bottom left) | Playlist: <name> (bottom middle) | Page X of Y (bottom right) |

Scenario: Guest clicks Export PDF
  Given I am an unauthenticated Guest viewing a public setlist
  When I click "Export PDF" or the Printer button
  Then the export button should be visible
  And clicking it should display a popup modal with a link to log in
  And no PDF download should be initiated

Scenario: Exporting setlist exceeding maximum songs limit
  Given I am viewing a setlist containing more than 200 songs
  When I click "Export PDF" or the Printer button
  Then an alert or toast should inform me that maximum 200 songs can be exported per PDF (upgrade to Premium for 1000 songs)
  And no PDF file should be generated
```

**Story 4.2.2:** As a Musician, I want to group songs by category in the PDF so that I can keep "Water" songs together on paper.

```
Scenario: Group by Category in PDF
  Given my setlist contains songs from "Water" and "Fire" categories mixed together
  When I select "Group by Category" in the export options
  And I generate the PDF
  Then the PDF should show all "Fire" songs grouped together
  And followed by all "Water" songs grouped together (or vice versa)
```

**Story 4.2.3: [Implemented]** As a musician printing a setlist, I want the page footer to show just the songbook's main address and a small QR code for the song, so that the footer stays clean and I can open the song on my phone by scanning it.

```gherkin
Scenario: Footer shows only the main site URL and a QR code to the song
  Given a playlist PDF is exported from the songbook
  When I look at the bottom-left of a page
  Then I see only the site's main URL (no song path or id)
  And a 1 cm × 1 cm QR code that opens the song on that page, also on its continuation pages
  And pages without a song URL show no QR code
```

**Story 4.2.4: [Implemented]** As a musician exporting the same setlist several times, I want the app to reuse the last generated PDF when nothing has changed, so that the download is instant.

```gherkin
Scenario: Only regenerate the PDF when the playlist is dirty
  Given I exported a playlist as PDF
  When I export it again without changes
  Then the previous PDF is reused
  But a change in order, songs added/removed, a song edit, title/description or interface language generates a new PDF
  And cached PDFs are per user and cleared on sign-out
```

### Epic 4.3: Offline Reliability

**Story 4.3.1:** As a Musician, I want to access my setlists while offline so that I can use the app in the forest.

```
Scenario: Offline Access
  Given I have previously viewed "Full Moon Setlist" while online
  And I am currently disconnected from the internet
  When I navigate to "Full Moon Setlist"
  Then the setlist and its songs should load from the cache
  And I should see an "Offline Mode" indicator
```

**Story 4.3.2: [Implemented]** As a Contributor, I want an executable offline-library specification and test harness so that every offline story is built test-first.

```gherkin
Scenario: Offline library spec exists and runs
  Given the feature file docs/testing/offline-library.feature
  When I run npm run test:bdd:offline-library
  Then every scenario of the epic is listed with its tags (@unit or @e2e, @story-4.3.x)
  And scenarios without step code are reported as pending, not passed
  And the unit profile is part of the CI bdd job

Scenario: IndexedDB can be tested without a browser
  Given fake-indexeddb is installed as a dev dependency
  When a vitest or Cucumber step opens an IndexedDB database
  Then it runs in Node in milliseconds and every test starts from an empty database

Scenario: Service worker harness covers the new routing
  Given the Node vm harness of testing/bdd/support/offlineHarness.ts
  When it loads public/sw.js with a set of cached entries and an online/offline flag
  Then steps can assert which response a navigation or asset request gets
```

**Story 4.3.3:** As a Musician, I want my library stored on my device, tied to my account, so that it is available offline and never shown to someone else.

```gherkin
Scenario: Library copy is scoped to one user
  Given the local library belongs to user "A"
  When the store is opened for user "B"
  Then the store is wiped before anything is written or read for "B"

Scenario: Reading the library
  Given a stored library with songs, categories, setlists with items, favourite ids and recently viewed ids
  When the offline UI asks for songs, a song by id, setlists or a setlist by id
  Then it gets the same Song shape the online app uses (mapCompositionToSong), all versions included
  And a setlist returns its items in order_index order with transposition overrides

Scenario: Wipe
  When the library is wiped
  Then all object stores and the meta record are empty

Scenario: Schema upgrade
  Given a library stored with an older schema version
  When the app opens the store with a newer schema version
  Then the old copy is discarded and a full sync is requested
```

**Story 4.3.4:** As a Musician, I want my offline library kept up to date automatically while I am online, and a switch to turn it off, so that I can rely on it in the forest or free up storage.

```gherkin
Scenario: First sync after sign-in
  Given I am signed in, online, and Offline Mode is on
  And there is no local library
  When the app starts
  Then my setlists, then the songs in them, then the rest of the catalogue, then favourites and recently viewed are stored
  And Preferences shows the last synced time, the number of songs and the storage used

Scenario: Refresh
  Given the local library is older than 1 hour
  When the app starts or the device comes back online
  Then the library is refreshed in the background without blocking the page

Scenario: Sync now
  When I press "Sync now" in Preferences
  Then the library is refreshed and the last synced time updates

Scenario: Offline Mode is on by default and can be turned off
  Given I never changed the Offline Mode preference
  Then Offline Mode is on
  When I turn Offline Mode off
  Then the local library is wiped and no further sync runs

Scenario Outline: Wipe on identity change
  Given the local library belongs to me
  When <event>
  Then the local library is wiped
  Examples:
    | event                                          |
    | I sign out                                     |
    | another user signs in on this device           |
    | the app is online and the server says I am signed out |

Scenario: Guests get nothing
  Given I am not signed in
  Then no local library is created

Scenario: Storage full
  Given the browser refuses to store the whole catalogue
  Then the songs of my setlists are kept and Preferences says the library is partial
```

**Story 4.3.5:** As a Musician, I want the installed app to open offline on any page so that I reach my library instead of an error.

```gherkin
Scenario: Shell is precached without user data
  When the service worker installs
  Then it stores the offline shell page and the static chunks it needs in a cache named with the build id
  And the stored shell HTML contains no user id, e-mail, name or private content

Scenario: Offline navigation gets the shell
  Given the shell is cached and the device is offline
  When I navigate to "/", "/songs", "/songs/<id>", "/library/playlists" or "/library/playlists/<id>"
  Then the service worker answers with the shell and the address bar keeps the requested URL

Scenario: Fallback stays
  Given the shell is not cached and the device is offline
  When I navigate to any page
  Then I get /offline.html as today (#353)

Scenario: Online is untouched
  Given the device is online
  When I navigate or load assets
  Then the service worker does not answer the request

Scenario: New deploy
  When a new build activates
  Then old sfs-* caches are deleted and the new shell is precached
```

**Story 4.3.6:** As a Musician in the forest, I want to browse, search and open my songs offline so that I can play from the app without network.

```gherkin
Scenario: Song list offline
  Given my library is stored and I am offline
  When I open "/songs"
  Then I see all stored songs with the same cards, search, category/tag filters and sort as online

Scenario: Song detail offline
  When I open a stored song
  Then I see its lyrics and chords, can switch versions and transpose
  And media embeds are replaced by the offline notice (4.3.7)

Scenario: Song not in the library
  When I open a song that is not stored
  Then I see "This song is not saved on this device" with a link to the song list

Scenario: Home and library offline
  When I open "/" or "/library/playlists"
  Then I see my favourites, drafts, recently viewed and playlists from the local copy
```

**Story 4.3.7:** As a Musician, I want to see clearly that I am offline and which actions are unavailable so that nothing seems broken.

```gherkin
Scenario: Offline indicator
  Given I am offline
  Then a banner says "Offline · library saved <time>" and the header shows an offline badge
  When the device comes back online
  Then the banner disappears

Scenario Outline: Save actions are disabled, not hidden
  Given I am offline
  Then <action> is shown greyed out with the hint "Not available offline" and does nothing
  Examples:
    | action                                       |
    | create, edit or delete a song                |
    | create, rename, delete or reorder a playlist |
    | add or remove a song to a playlist           |
    | favourite (heart)                            |
    | record or delete a recording                 |
    | every setting in account settings            |

Scenario: Media offline notice
  Given I am offline
  When a song has YouTube, Spotify or SoundCloud links or recordings
  Then each media block shows "Not available offline" instead of an embed or spinner
```

**Story 4.3.8:** As the Maintainer, I want end-to-end proof, aligned docs and a preview build of the offline library so that I can test the offline library before shipping.

```gherkin
Scenario: Forest journey (Playwright)
  Given I signed in, the library synced, and the app is reloaded with the network off
  When I open "/library/playlists/<id>", then a song from it, then "/songs" and search
  Then everything renders from the local copy, media shows the offline notice and save actions are disabled

Scenario: No leak between accounts (Playwright)
  Given user A synced a library and signed out
  When user B signs in, syncs and goes offline
  Then B never sees A's private songs or playlists

Scenario: Signed out or Offline Mode off (Playwright)
  Given I signed out, or turned Offline Mode off
  When I go offline and navigate
  Then I get the offline page and no library

Scenario: Preview build
  When the integration branch is complete
  Then an image tagged offline-preview is built from feat/offline-library with the docker workflow
```

### Epic 4.4: Desktop Experience

**Story 4.4.1: [Implemented]** As a Guest on a laptop, I want a responsive layout so that the app uses the full screen width effectively.

```
Scenario: Desktop Layout
  Given I am viewing the app on a screen wider than 1024px
  When I view the Song List
  Then the list should be displayed in a grid or multi-column layout
  And the navigation menu should be always visible on the side (instead of a hamburger menu)
```

### Epic 4.5: Progressive Web App — Offline Reliability

**Story 4.5.1: [Partial]** As a Musician, I want to see a friendly offline page when I have no internet connection, so that I understand what happened instead of seeing a browser error.

```gherkin
Scenario: Offline fallback page
  Given the app is installed and I have no internet connection
  When I open the app or navigate to a page that is not cached
  Then I should see a branded offline page explaining I am not connected
  And the page should suggest I connect to the internet or access a cached playlist
  Rather than showing a generic browser "No internet" error

Scenario: Cached pages still load offline
  Given I have previously visited the home page and song list while online
  When I open the app without internet
  Then the home page shell should still load from the service worker cache
  And cached songs and playlists should remain accessible
```

> **Status (Nov 4, 2026, #353):** the offline fallback page is implemented (`public/sw.js`, `public/offline.html`) in the visitor's language, with Retry and automatic reload when back online. It does not yet point to cached playlists, and the second scenario (cached pages and songs offline) is still open.

### Epic 4.6: Private Rehearsal & Audio Storage


**Story 4.6.1:** As a Member, I want to record an audio reference of a song using my device's microphone and save it securely to private cloud storage so that I can practice and review my private rehearsals.

```gherkin
Scenario: Render microphone recording controls
  Given I am logged in as a Member
  And I am viewing the Song Detail page
  Then I should see a "Record Rehearsal" button in the audio section

Scenario: Record and play back audio locally before saving
  Given I am logged in as a Member
  And I have clicked "Record Rehearsal" and granted microphone permissions
  When I record a rehearsal snippet
  And I click "Stop"
  Then I should be able to play back the recording locally before uploading

Scenario: Save private audio reference to cloud storage
  Given I have completed a local recording snippet
  When I click "Upload to Private Storage"
  Then the audio file (WebM/AAC format) should be uploaded to the Supabase Storage private bucket
  And the recording URL should be linked to the song metadata for my profile
  And only I (the owner) should see and play this recording on the song page

Scenario: Guest cannot record or see private rehearsals
  Given I am a Guest user
  When I view the Song Detail page
  Then the "Record Rehearsal" button should be hidden
  And I should not see any private rehearsal recordings
```

**Story 4.6.2: [Implemented]** As a recording owner, I want to share a private recording directly with another registered user with strict DRM-lite permissions so that they can listen without downloading or resharing.

```gherkin
Scenario: Owner shares recording with registered user
  Given I am the owner of a private recording "Medicine Song (Ceremony Take)"
  When I share the recording with "maya@sacredfiresongs.org"
  Then "maya@sacredfiresongs.org" should have streaming access to the recording
  And "maya@sacredfiresongs.org" should not have download permissions on the recording

Scenario: Shared recipient cannot reshare recording
  Given a recording shared by "Carlos" with "Maya"
  When "Maya" attempts to share the recording with "David"
  Then the sharing request should be rejected with "Only the recording owner can share this recording."
```

**Story 4.6.3: [Implemented]** As a recording owner, I want to publish a private recording publicly only after explicitly confirming singer consent so that musical rights and artist integrity are respected.

```gherkin
Scenario: Publishing without confirming consent is rejected
  Given I am the owner of a private recording "Pachamama Sunrise"
  When I attempt to make the recording public without confirming singer consent
  Then the publication should be rejected with "Singer consent must be explicitly confirmed"
  And the recording should remain private

Scenario: Publishing with singer consent confirmation succeeds
  Given I am the owner of a private recording "Pachamama Sunrise"
  When I confirm singer consent and publish the recording
  Then the recording visibility should be updated to public
```

**Story 4.6.4: [Implemented]** As a recording owner, I want to attribute the singer on a recording with verified profile links or pending guest invites so that singers are acknowledged properly.

```gherkin
Scenario: Attributing registered musician links to verified profile
  Given a recording by an owner
  When the recording is attributed to registered musician "Danit" with id "musician-danit-id"
  Then the recording should display "Danit" with a verified musician badge
  And clicking the singer attribution should navigate to "/users/musician-danit-id"

Scenario: Attributing unregistered singer displays pending invite gracefully
  Given a recording by an owner
  When the recording is attributed to unregistered singer "Elena Wood" with email "elena@wood.org"
  Then the recording should display "Elena Wood" with a pending invite badge
  And the system should not crash
```

**Story 4.6.6: [Implemented]** As a registered user, I want an in-app notification and an email when someone shares a rehearsal recording with me so that I find the take without browsing to the song. (GitHub #373)

```gherkin
Scenario: Recipient is notified in-app and by email
  Given a recording owner shares a rehearsal recording with a registered user
  Then the recipient sees an unread notification with the sender, recording and song in the header bell
  And the recipient receives one email with a direct link to "/recordings/[recordingId]"
  And the email links to "/account/settings?tab=preferences" to turn email notifications off

Scenario: A notification opens the shared recording
  Given the recipient opens the notification or the email link
  Then the song opens on the recording's version with the Recordings tab open
  And the shared recording is highlighted

Scenario: A recording link grants no access by itself
  Given a user who is neither the owner nor a recipient opens "/recordings/[recordingId]" of a private recording
  Then they get "not found" (or the login page when signed out, returning to the link after login)

Scenario: Recipient has turned off email notifications
  Given the recipient turned off "Email notifications" in Settings → Preferences
  When a recording is shared with them
  Then they get the in-app notification but no email

Scenario: Dispatch failure does not block sharing
  Given the mail server is unreachable
  When the owner shares a recording
  Then the share succeeds and the failure is only logged
```

**Story 4.6.5: [Planned]** As a user viewing a song's recordings (my own, shared takes, and public recordings), I want to reorder any recording in my list (including recordings shared with me) so that I can organize the rehearsal takes in the sequence that works best for my practice without altering other users' views. (GitHub #420)

> [!NOTE] Architecture Decision: Option A (Decoupled User-Specific Ordering Table)
> Currently, `user_recordings.position` is an owner-only column. Allowing recipients to reorder shared takes without collisions requires decoupling viewer ordering from recording ownership.
>
> 1. **Schema:** A junction table `user_song_version_recording_orders (user_id, song_version_id, ordered_recording_ids uuid[], updated_at)` with RLS `auth.uid() = user_id`.
> 2. **Persistence:** `reorderUserRecordings` upserts the user's `ordered_recording_ids` array atomically instead of modifying `user_recordings.position`.
> 3. **Query & Sort:** `getUserRecordings` sorts takes according to `ordered_recording_ids`, appending unranked takes by `created_at DESC`.
> 4. **UI:** `RehearsalDrawer.tsx` enables drag handles for all logged-in users (`isCustomSort && user`), not just the recording owner.
> 
> *Cross-cutting applicability:* The same pattern can also be used for personal viewer overrides on shared or public playlists (`user_playlist_orders`).

```gherkin
Scenario: Drag handle is available for shared recordings
  Given I am logged in as a registered user
  And another musician has shared a rehearsal take with me
  When I open the Rehearsal drawer for the song
  Then I should see drag handles on both my own takes and shared takes

Scenario: Reordering shared takes persists per user without affecting others
  Given user "Maya" has a private recording shared with user "Carlos"
  When "Carlos" reorders the shared recording to the top of his list
  Then the new order is saved to Carlos's personal recording order
  And "Maya" continues to see the recording in her original order
```

## Phase 5: Engineering Excellence

Delivery-pipeline work. Personas: **Maintainer** (project owner) and **Contributor** (human or AI agent). GitHub master epic: #280 (phases #281–#286, Task 5.1.0 #287). Full acceptance spec: `docs/testing/gitflow-cicd.feature` (tag `@story-5.1.x`). Plan: `docs/plans/2026-10-30-gitflow-cicd-migration.md`.

### Epic 5.1: Gitflow CI/CD Migration

Move from GitHub Flow to a lightweight Gitflow: `main` = production, `develop` = integration + staging, `feat|fix|chore|docs/*` = work branches (squash into `develop`), `hotfix/*` = urgent fixes from `main`. Quality gates follow the test pyramid; the pipeline is built test-first (contract/bats tests → workflow change → Gherkin acceptance).

| Story | Issue | Title | Plan phase | Status |
|---|---|---|---|---|
| 5.1.1 | #288 | PR quality gate (`ci.yml`) | 1 | [Implemented] |
| 5.1.2 | #289 | No false-green E2E / fail-closed Docker | 1 | [Deferred] (owner, Oct 31; E2E DB on <server> prepared in <infra-repo>#106) |
| 5.1.3 | #290 | Single unit-test tree, strict BDD | 1 | [Implemented] (strict only for `ci-gate`) |
| 5.1.4 | #292 | Protected `main` + `develop` (rulesets), default branch `develop` | 2 | [Implemented] |
| 5.1.5 | #293 | Branch & PR-title policy (`pr-lint.yml`) | 2 | [Implemented] |
| 5.1.6 | #294 | Scripts follow Gitflow (no `--admin`, correct image names) | 2 | [Implemented] |
| 5.1.7 | #295 | Staging CD from `develop` (images, migrations, deploy) | 3 | [Re-scoped] (this repo publishes `develop` images; deployment lives outside the public repo) |
| 5.1.8 | #297 | Promotion `develop` → `main` + versioned release images | 4 | [Implemented] (re-scoped Nov 5: deployment and its approval live outside the public repo; slow-layer required checks deferred with 5.1.2/5.1.11) |
| 5.1.9 | #298 | Automatic back-merge `main` → `develop` | 4 | [Implemented] (PR opened automatically; owner merges) |
| 5.1.10 | #299 | Hotfix flow | 4 | [Partial] (code + automatic back-merge done; end-to-end check in the 5.1.14 dress rehearsal) |
| 5.1.11 | #296 | Test-pyramid schedule (nightly full E2E + perf) | 3 | [Deferred] (needs Tailscale `tag:ci`, with 5.1.2) |
| 5.1.12 | #291 | Supply-chain hardening (pinned actions, Dependabot, permissions) | 1 | [Implemented] |
| 5.1.13 | #300 | Documentation & agent tooling aligned to Gitflow | 5 | [Implemented] |
| 5.1.14 | #301 | Dress rehearsal & cut-over of open branches | 5 | [Planned] |

**Story 5.1.1:** As a Maintainer, I want every pull request to run lint, typecheck, unit, BDD, build and the staging smoke E2E (`e2e`) so that broken code cannot be merged.

```gherkin
Scenario: A failing unit test blocks the merge
  Given a pull request to "develop" that breaks a unit test
  When CI finishes
  Then the "unit" check is red
  And GitHub does not allow merging the pull request
```

**Story 5.1.2:** As a Maintainer, I want E2E and Docker jobs to fail closed so that a green check always means the tests really ran.

```gherkin
Scenario: Missing staging secrets fail the staging E2E job
  Given the staging E2E workflow
  When the required staging secrets are absent
  Then the job fails with a clear "missing secrets" error instead of being skipped
```

**Story 5.1.3: [Implemented]** As a Contributor, I want one unit-test directory and all feature files wired into Cucumber so that tests are not duplicated or silently ignored.

```gherkin
Scenario: Unit tests live in exactly one directory
  Given the repository
  Then no "*.test.ts" file exists in "lib/unit-tests"
  And every "docs/testing/*.feature" file is included in "cucumber.json"
```

**Story 5.1.4: [Implemented]** As a Maintainer, I want `main` and `develop` protected with required checks, no force-push and rules applying to admins so that history is safe and every change is verified.

```gherkin
Scenario: Long-lived branches are protected
  Given the branch "develop" or "main"
  Then force pushes and deletion are blocked for everyone, including administrators
  And the CI checks are required before merging
```

**Story 5.1.5: [Implemented]** As a Maintainer, I want pull requests checked for a Conventional Commit title and an allowed head → base combination so that releases are versioned correctly and work never skips `develop`.

```gherkin
Scenario: Feature PR into main is rejected
  Given a pull request from "feat/300-new-thing" into "main"
  When the "pr-lint" workflow runs
  Then the policy check fails with "work branches must target develop"
```

**Story 5.1.6:** As a Contributor, I want `start-issue.sh` and the preview/promotion scripts to follow Gitflow so that the tools never bypass protection or print wrong image names.

```gherkin
Scenario: start-issue branches work from develop
  When I run "scripts/start-issue.sh 300 feat new thing"
  Then the branch "feat/300-new-thing" is created from "origin/develop"
```

**Story 5.1.7:** As a Maintainer, I want every merge into `develop` to build images, apply migrations to the staging Supabase project and redeploy staging so that staging always reflects `develop`.

> Re-scoped Nov 3, 2026: this public repo only builds and publishes the `develop` images. Pulling them onto a staging server is the self-hoster's concern and is implemented outside this repository.

```gherkin
Scenario: Staging reflects develop after a merge
  Given a feature PR is squash-merged into "develop"
  When the staging pipeline finishes
  Then staging runs the new commit with all migrations applied
```

**Story 5.1.8: [Implemented]** As a Maintainer, I want to promote `develop` to `main` with a merge-commit PR and get explicit `vX.Y.Z` release images, so that every release is traceable and deployable without `:latest`.

> Re-scoped Nov 5, 2026: CI and image delivery live in this repo; deploying a release (CD, approvals, deploy secrets) lives outside the public repository. Requiring the full E2E and k6 checks on the promotion PR is deferred with Stories 5.1.2 / 5.1.11.

```gherkin
Scenario: A published release builds versioned images
  Given Release Please published "v1.8.0"
  When the Docker workflow finishes
  Then "ghcr.io/demeesterroeland/sacred-fire-songs-app:v1.8.0" exists, never "latest"
  And no workflow in this repository deploys it
```

**Story 5.1.9: [Implemented]** As a Maintainer, I want `main` merged back into `develop` after every release or hotfix so that version bumps and fixes are never lost.

```gherkin
Scenario: Release version bump reaches develop
  Given Release Please released "v1.8.0" on "main"
  When the back-merge pull request is merged
  Then "package.json" on "develop" has version "1.8.0"
```

**Story 5.1.10:** As a Maintainer, I want a `hotfix/*` path from `main` so that I can fix production without shipping unfinished `develop` work.

```gherkin
Scenario: Hotfix goes straight to production and back to develop
  Given a production bug tracked in issue 302
  When "hotfix/302-prod-crash" is merged into "main"
  Then a patch release is created
  And the fix is back-merged into "develop"
```

**Story 5.1.11:** As a Maintainer, I want the slow test layers (full E2E, k6) to run nightly against staging and on promotion PRs so that per-PR CI stays fast while regressions are still caught.

```gherkin
Scenario: A nightly failure is visible
  Given the nightly E2E run against staging fails
  Then a GitHub issue labelled "ci-nightly" is opened or updated
```

**Story 5.1.12:** As a Maintainer, I want third-party actions pinned to commit SHAs, least-privilege permissions and Dependabot updates so that the pipeline is not a supply-chain risk.

```gherkin
Scenario: Third-party actions are pinned
  Given every workflow in ".github/workflows"
  Then every third-party "uses:" reference is pinned to a commit SHA
  And every workflow declares top-level "permissions"
```

**Story 5.1.13: [Implemented]** As a Contributor, I want the guides, CLAUDE.md, PR template, design doc and agent skills to describe the Gitflow process so that humans and AI agents follow the same rules.

```gherkin
Scenario: Guides describe Gitflow
  Given "docs/guides/git-workflow.md" and "docs/guides/development-workflow.md"
  Then both describe main, develop, work and hotfix branches
  And both have a version header and changelog entry
```

**Story 5.1.14:** As a Maintainer, I want a full dress rehearsal and the open branches retargeted to `develop` before announcing the switch so that the cut-over is safe.

```gherkin
Scenario: Dress rehearsal passes end to end
  Given a trivial "docs:" change on a work branch
  When it goes through develop, staging, the release PR, production approval and back-merge
  Then every stage succeeds and the run URLs are recorded in the logbook
```

## Phase 6: Experience & Design

UX and visual rework, mobile first. Personas: **Guest**, **Member**, **Musician**, **Owner** (product decisions), **Contributor**. GitHub master epic: **#375** (group epics #376–#384, stories #385–#418). Research and plan: `docs/ux-research/2026-11-04-ux-research.md` (§4 findings, §5 design direction, §6 plan). Manual knowledge base: `docs/manual/`.

### Epic 6.1: UX & Design Rework

Owner decision of Nov 4, 2026: sober greyscale interface with one accent, smaller type with more air, a reader-controlled font size (`Chords · A− · A+`) instead of a "large font" setting, tags shown as one grey meta line, the ChordPro viewer as the reference style, and a reserved slot on the song page for song variants and translations. Design tokens come first (`docs/design/`), then pages are restyled from them.

| Group | Issue | Theme | Exit criterion |
|---|---|---|---|
| G1 | #376 | Visual language & design system | Design tokens exist in `docs/design/`, every list row / card / chip / sheet uses them, no 10–11 px labels remain, contrast ≥ 4.5:1. |
| G2 | #377 | Song page: reading in the circle | A song opens with a one-line meta row, Key/Capo/Tuning in one line, the `Chords · A− · A+` toolbar, and the title never clips. Taps to Practice ≤ 2. |
| G3 | #378 | Media player | The mini player appears only after the user starts playback and never covers sheet or drawer content. |
| G4 | #379 | Practice & recordings | One name (Practice), my takes and shared takes are separate lists with text labels, row actions are a grouped bottom sheet, recipients are notified. |
| G5 | #380 | Navigation & information architecture | Unknown URLs give a 404 for every role, no dead tabs, the bottom bar matches Story 1.1.9. |
| G6 | #381 | Guest experience | Every members-only screen uses the same GuestGate pattern with reason and `next=`; guests know up front when saving needs an account. |
| G7 | #382 | Search & browse | Search focus offers recent searches and category chips; results use the compact row. |
| G8 | #383 | Playlists & forms | Add-to-playlist is a bottom sheet; Add Song and New Playlist explain themselves. |
| G9 | #384 | Accessibility & data hygiene | Demo seed holds no test playlists; axe and screen-reader pass on song page and Practice panel. |

| Story | Issue | Code | Pri | Title | Blocked by |
|---|---|---|---|---|---|
| 6.1.1 | #385 | `G1.1` | A | **[Implemented on feat/ux-v2]** As a Contributor, I want design tokens and a component sheet so that every screen is restyled from one sober greyscale system instead of page by page | — |
| 6.1.2 | #386 | `G1.2` | A | **[Implemented on feat/ux-v2]** As a Guest, I want song cards and list rows to show a title and one grey meta line so that I can scan a list of songs quickly | #385 |
| 6.1.3 | #387 | `G1.3` | A | **[Implemented on feat/ux-v2]** As a Member, I want small labels to be readable so that section headings and meta text are not grey-on-grey | #385 |
| 6.1.4 | #388 | `G1.4` | B | **[Implemented on feat/ux-v2]** As a Guest, I want the category grid in a calm monochrome style so that the home page does not shout | #385 |
| 6.1.5 | #389 | `G1.5` | C | **[Implemented on feat/ux-v2]** As a Member, I want unfinished features hidden so that I do not meet 'coming soon' placeholders | #407 |
| 6.1.6 | #390 | `G2.1` | A | **[Implemented on feat/ux-v2]** As a reader in the circle, I want a `Chords · A− · A+` toolbar on the song page so that I set the text size myself | #385 |
| 6.1.7 | #391 | `G2.2` | A | **[Implemented on feat/ux-v2]** As a reader, I want Key, Capo, Tuning and the tags on one grey line each so that the first lyric line is visible without scrolling | #385 |
| 6.1.8 | #392 | `G2.3` | A | **[Implemented on feat/ux-v2]** As a reader, I want the sticky song title to truncate at the end so that the first letters are never cut off | — |
| 6.1.9 | #393 | `G2.4` | B | **[Implemented on feat/ux-v2]** As a Member, I want a sticky action bar on the song page (Practice · Playlist · ♥) so that the main actions are in thumb reach | #385, #390, #398 |
| 6.1.10 | #394 | `G2.5` | C | As a Musician, I want auto-scroll and transpose in the same viewer toolbar so that all reading tools live in one place | #390 |
| 6.1.11 | #395 | `G2.6` | C | As a Contributor, I want a reserved slot for a variant / language switch under the song title so that song variants and translations fit the sober layout later | #391 |
| 6.1.12 | #396 | `G3.1` | A | **[Implemented on feat/ux-v2]** As a reader, I want the mini player to appear only after I press play so that it does not cover the lyrics and sheets on every song | — |
| 6.1.13 | #397 | `G3.2` | C | **[Implemented on feat/ux-v2]** As a Guest, I want the player and reference tab to be calm and exact so that I know which provider is playing | #385 |
| 6.1.14 | #398 | `G4.1` | A | **[Implemented on feat/ux-v2]** As a Member, I want one name — Practice — for the rehearsal feature so that menu, drawer, tabs, badge and library all say the same thing | — |
| 6.1.15 | #399 | `G4.2` | A | **[Implemented on feat/ux-v2]** As a Member, I want takes shared with me listed separately from my own takes so that I see who shared what | #398 |
| 6.1.16 | #400 | `G4.3` | A | **[Implemented on feat/ux-v2]** As a Member, I want text labels next to take status icons so that I understand 'public', 'shared' and 'pending invite' without a tooltip | #398 |
| 1.79 | #401 | `G4.4` | B | As a Member, I want take actions in a grouped bottom action sheet so that Delete is never one tap from Share | #385, #398 |
| 6.1.18 | #402 | `G4.5` | B | **[Implemented on feat/ux-v2]** As a recording owner, I want the Share dialog to explain who can be found and what happens with a private song so that sharing has no surprises | #398 |
| 6.1.17 | #401 | `G4.4` | B | **[Implemented on feat/ux-v2]** As a Member, I want take actions in a grouped bottom action sheet so that Delete is never one tap from Share | #385, #398 |
| 6.1.18 | #402 | `G4.5` | B | As a recording owner, I want the Share dialog to explain who can be found and what happens with a private song so that sharing has no surprises | #398 |
| 6.1.19 | #403 | `G4.6` | B | **[Implemented on feat/ux-v2]** As a Member, I want to be told when someone shares a take with me so that I do not have to guess which song to open | #399 |
| 6.1.20 | #404 | `G4.7` | C | As a Member, I want a level meter, count-in and remaining time while recording so that I know the microphone works and when the 3-minute limit comes | #385 |
| 6.1.21 | #405 | `G4.8` | C | As a recording owner, I want the publish dialog to name the song and say who will hear it so that consent is informed | #402 |
| 6.1.22 | #406 | `G5.1` | A | **[Implemented on feat/ux-v2]** As a Guest, I want an unknown URL to show a 404 page so that I am not sent to a login screen for content that does not exist | — |
| 6.1.23 | #407 | `G5.2` | A | **[Implemented on feat/ux-v2]** As a Member, I want the Library tab row to fit my phone with no dead tab so that every tab I see works | — |
| 6.1.24 | #408 | `G5.3` | B | **[Implemented on feat/ux-v2]** As the Owner, I want a decision on the bottom bar (Home · Songs · Library · Create vs Home · Search · Library) so that Explore, Home and Search stop overlapping | — |
| 6.1.25 | #409 | `G5.4` | C | As a Guest, I want auth pages without a fake close button so that I always know where I go | #385 |
| 6.1.26 | #410 | `G6.1` | A | **[Implemented on feat/ux-v2]** As a Guest, I want every members-only screen to use the same locked preview with a reason and a sign-in button so that gating feels consistent | — |
| 6.1.27 | #411 | `G6.2` | B | **[Implemented on feat/ux-v2]** As a Guest, I want to know before typing that saving a song needs an account so that I am not surprised at save | #410 |
| 6.1.28 | #412 | `G6.3` | C | As a first-time visitor, I want a one-line welcome, a search box and a 'Recently added' row on Home so that I understand the site and find a song fast | #386, #413 |
| 1.78 | #413 | `G7.1` | B | As a Guest, I want recent searches and category chips when I focus the search field so that I can repeat or narrow a search in one tap | #386 |
| 6.1.30 | #414 | `G8.1` | B | **[Implemented on feat/ux-v2]** As a Member, I want Add to playlist as a bottom sheet with 'New playlist' first and check marks so that I see where the song already is | #385 |
| 6.1.29 | #413 | `G7.1` | B | **[Implemented on feat/ux-v2]** As a Guest, I want recent searches and category chips when I focus the search field so that I can repeat or narrow a search in one tap | #386 |
| 6.1.30 | #414 | `G8.1` | B | As a Member, I want Add to playlist as a bottom sheet with 'New playlist' first and check marks so that I see where the song already is | #385 |
| 6.1.31 | #415 | `G8.2` | C | As a Member, I want a live chord preview and a visible upload button on Add Song so that I see what I am writing | #385 |
| 6.1.32 | #416 | `G8.3` | C | As a Member, I want the New Playlist page to explain private vs public in one line so that I know what I am creating | #385 |
| 6.1.33 | #417 | `G9.1` | A | **[Implemented on feat/ux-v2]** As a Contributor, I want the demo seed free of E2E and smoke-test playlists so that screenshots and demos show real-looking data | — |
| 6.1.34 | #418 | `G9.2` | C | As a reader using assistive technology, I want the song page and Practice panel to pass an accessibility audit so that the app works with a screen reader | #393, #401 |

Priority **A** = quick wins (one sprint together), **B** = flow work, **C** = backlog. Acceptance criteria (Gherkin) live in each GitHub issue and move to `docs/testing/*.feature` when a story starts.

## Roles & Permissions Summary


> **Role hierarchy:** Guest → Member → Gatekeeper → Admin
> **Musician** is a profile setting (`is_musician`), not a role. Any Member can self-enable it.

| Feature / Action | Guest | Member | Gatekeeper | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Browse & Search Songs** | ✅ | ✅ | ✅ | ✅ |
| **View Chords & Lyrics** | ✅ | ✅ | ✅ | ✅ |
| **Listen to Audio/Video** | ✅ | ✅ | ✅ | ✅ |
| **Play Melody (Synth)** | ✅ | ✅ | ✅ | ✅ |
| **Favorite Songs** | ❌ | ✅ | ✅ | ✅ |
| **Vote on Versions** | ❌ | ✅ | ✅ | ✅ |
| **Add/Create Songs** | ❌ | ✅ | ✅ | ✅ |
| **Edit Own Songs** | ❌ | ✅ | ✅ | ✅ |
| **Create/Edit Setlists** | ❌ | ✅ | ✅ | ✅ |
| **Export/Print PDF** | ❌ | ✅ | ✅ | ✅ |
| **Submit New Version** | ❌ | ✅ | ✅ | ✅ |
| **Transpose Chords** *(requires is_musician)* | ❌ | ✅¹ | ✅¹ | ✅ |
| **Sheet Music / ABC Notation** *(requires is_musician)* | ❌ | ✅¹ | ✅¹ | ✅ |
| **Edit Metadata & Links (any song)** | ❌ | ❌ | ✅ | ✅ |
| **Flag Songs (needs improvement, duplicate)** | ❌ | ❌ | ✅ | ✅ |
| **Merge Duplicate Songs** | ❌ | ❌ | ✅ | ✅ |
| **Feature / Unfeature Playlists** | ❌ | ❌ | ✅ | ✅ |
| **Edit/Reorder Any Public Playlist** | ❌ | ❌ | ✅ | ✅ |
| **Edit Lyrics/Chords (any song)** | ❌ | ❌ | ❌ | ✅ |
| **Delete Songs** | ❌ | ❌ | ❌ | ✅ |
| **Manage Users & Roles** | ❌ | ❌ | ❌ | ✅ |
| **Install as App (PWA)** | ✅ | ✅ | ✅ | ✅ |
| **Record & Store Private Audio** | ❌ | ✅ | ✅ | ✅ |



*¹ Only when `is_musician = true` on the user's profile (self-declared setting)*


**Story 1.1.8: [Implemented]** As a Member, I want my new song drafts to be saved automatically to my browser's local storage so that I don't lose my work if I navigate away.

```
Scenario: Draft Auto-Save
  Given I am on the "Add Song" page
  When I type in the Title, Author, Lyrics, or Metadata fields
  Then the data should be saved to localStorage

Scenario: Restore draft
  Given I have unsaved changes
  And I navigate away
  When I return to the "Add Song" page
  Then the fields should be populated with the saved data
```

    *   **Acceptance Criteria:**
        *   Form data (Title, Author, Lyrics, Metadata) is saved to `localStorage` on change.
        *   Returning to `/songs/add` restores the saved data.
        *   Submitting the song successfully clears the draft.
        *   Draft persistence only applies to the "Add" mode, not Edit.

**Story 1.1.9: [Implemented]** As a User, I want a Spotify-style mobile bottom navigation bar with Home, Search and Your Library tabs so that I can navigate the app with one hand. (Decision UXD-1, Story 6.1.24: Create is a "+" inside Library, not a fourth tab.)

```
Scenario: Bottom bar visible on mobile
  Given I am viewing any page on a mobile device (< md breakpoint)
  Then I should see a fixed bottom navigation bar with three tabs: Home, Search and Your Library
  And the bottom bar should not appear on tablet or desktop

Scenario: Navigate via bottom bar
  Given I see the bottom navigation bar
  When I tap "Home"
  Then I should navigate to the home/dashboard page
  When I tap "Search"
  Then I should navigate to the songs page with the search field focused
  When I tap "Your Library"
  Then I should navigate to the playlists/library page

Scenario: Create from Library
  Given I am signed in and on the Library page of a mobile device
  When I tap "+"
  Then a sheet offers "Add Song" and "New Playlist"
  And guests see no "+" (the Library shows its sign-in preview)

Scenario: Active tab indicator
  Given I am on the songs page
  Then the "Search" tab in the bottom bar should be visually highlighted
  And the other tabs should appear in their default inactive state

Scenario: Avatar replaces hamburger icon
  Given I am logged in on a mobile device
  Then the hamburger menu icon in the header is replaced by my avatar (or initials)
  When I tap the avatar
  Then the side menu slides open containing my personal menu (profile, settings, logout)

Scenario: Top-right avatar hidden on mobile
  Given I am on a mobile device
  Then the personal avatar button in the top-right header area should not be visible
  And it should remain visible on tablet and desktop

Scenario: Guest bottom bar
  Given I am not logged in on a mobile device
  Then the bottom bar shows the same three tabs: Home, Search, and Your Library
  And the hamburger icon should remain (no avatar replacement)
```
