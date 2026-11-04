# UX Research: Usability, Friendliness & Flow (Mobile First)

**Version:** 1.1 | **Date:** Nov 4, 2026 | **Status:** Draft for review

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.1 | Nov 4, 2026 | Added section 5 (design direction: sober greyscale, user font-size control, tag density, room for variants/translations) and regrouped the plan into 9 themed groups. |
| 1.0 | Nov 4, 2026 | First audit: screen inventory for guest, member, gatekeeper and admin, user flows, heuristic findings and a phased improvement plan. Includes the rehearsal drawer, reference tracks, recorder and recording sharing / publishing / singer attribution. |

---

## 1. Scope and method

**Goal:** find what makes Sacred Fire Songs harder to use than it needs to be, and turn that into a prioritised plan. The phone is the main device: people use it in a circle, around a fire, often one-handed and in low light.

**What was tested**

- Local build of the current app (branch with Epic 4.6 recording sharing), seeded local Supabase.
- Viewport **390 × 844** (iPhone 13/14 class), touch enabled, dark scheme. Desktop 1440 × 900 captured as a secondary check.
- Roles: **Guest** (no session), **Member**, **Gatekeeper** (used as the "someone shared a recording with me" recipient) and **Admin**. Musician is a profile flag, not a role.
- Every route in `app/**/page.tsx` plus the states that have no URL: menus, sheets, modals, the rehearsal drawer, recorder states, mini player.
- Expected behaviour taken from `docs/logbook/epic&user stories.md` and `docs/testing/*.feature`.

**Frameworks used** (industry standard)

| Framework | Used for |
| :--- | :--- |
| Nielsen's 10 usability heuristics | Main lens for every finding (tagged `H1`–`H10`). |
| WCAG 2.2 AA | Contrast, target size (2.5.8: at least 24 × 24 px, 44 × 44 recommended), focus, labels. |
| Apple HIG / Material 3 | Bottom sheets, navigation bars, touch targets (44 pt / 48 dp), modal vs. non-modal. |
| Thumb-zone model (Hoober) | Where primary actions sit on a phone held in one hand. |
| Progressive disclosure, recognition over recall | Song tools and the recording menus. |
| Jobs-to-be-done | The flows in section 3. |

**Severity scale** (Nielsen): **4** blocks a task · **3** major, frequent · **2** minor, slows people down · **1** cosmetic.

**How to reproduce the screenshots:** see [README.md](README.md).

---

## 2. Screen inventory

Screenshots: `docs/ux-research/screenshots/<viewport>/<role>/<nn>-<name>.webp`.

### 2.1 Routes

| # | Route | Guest | Member | Admin | Notes |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 01 | `/` Home | Category grid only | "Your library" stats + categories | same as member | `/explore` redirects here (27). |
| 02 | `/songs` | List | List + playlist/heart buttons | same | Search via header field. |
| 03–05 | `/songs/[id]` | Viewer + auto-loaded mini player | + recordings badge | same | |
| 06 | `/songs/add` | Form shown (gates at save) | Form | Form | |
| 07–08 | `/songs/[id]/edit` | "This Medicine is Not Yours to Edit" | Own: editor; other: blocked | Editor for all | |
| 09–10 | `/library` → `/library/playlists` | Locked smart playlists, "Members only" | Smart playlists + private playlists + recently viewed | + test playlists | |
| 11 | `/library/playlists/add` | → login | Inline title form | same | |
| 12 | `/library/recently-viewed` | → login | History list | same | |
| 13 | `/library/artists` | List | List | List | |
| 14 | `/library/albums` | "Coming soon" | same | same | Dead end in the main tab bar. |
| 15 | `/account/settings` | → login | Profile / Security / Preferences tabs | same | |
| 16–17 | `/admin`, `/admin/users` | → login | Access Denied | Users overview | |
| 18 | `/library/playlists/[id]` | Public playlist | Own playlist editor | same | |
| 19 | `/admin/users/[id]` | — | — | User detail + contributions | |
| 20–26 | `/auth/*` | Login, sign-up, check e-mail (OTP), forgot, update password, finish registration, error | logged-in users are sent to `/` | | |
| 28 | `/users/[id]` | → login | Public musician profile | same | Target of singer attribution links. |
| 30 | unknown URL | → **login** ("Please log in") | 404 | 404 | |
| 31 | unknown song | Song Not Found | same | same | |
| 32 | `/offline.html` | Offline page | same | same | |

### 2.2 States without a URL (captured in `4x`–`7x` files)

| # | State | Who |
| :-- | :-- | :-- |
| 41 | Side menu (hamburger) | all |
| 42–43 | Header search focused / typing ("19 results") | all |
| 44 | Search options sheet (sort, content type, library filters) | all |
| 45 | Account menu (role badge, language, theme, sign out; Admin Portal for admin) | member, admin |
| 46 | Create menu (Add Song / New Playlist) | all |
| 51 | Song "more actions" sheet (like, share, add to playlist, recordings, delete) | all |
| 52 | Add-to-playlist dropdown | member, admin |
| 60–62 | Rehearsal drawer → Reference Tracks (YouTube / SoundCloud / Spotify) | all |
| 63 | Rehearsal drawer → Voice Recorder (guest: blurred preview + "Sign In to Record") | all |
| 64–65 | Recording in progress / review before save | member, admin |
| 66 | Recording row menu: Share · Make Public · Singer Attribution · Rename · Download · Delete | owner |
| 67 | Share Recording modal (search users, shared-with list, revoke) | owner |
| 68 | Publish Recording Publicly (consent disclaimer + checkbox) | owner |
| 69 | Singer Attribution (registered musician search, or name + e-mail for someone without an account) | owner |
| 70 | Inline rename | owner |
| 71 | Delete confirmation | owner |
| 72–73 | Recording playing, mini player after closing the drawer | member |
| 74–75 | Recording shared with me (recipient view) | gatekeeper |

---

## 3. User flows

### 3.1 Guest — "find the song we are singing now"

```
Home (categories) ─┬─ tap category chip ──► Songs list (filtered) ──► Song
                   └─ tap search field ───► type ► results ────────► Song
Song ──► read chords/lyrics
     ──► ⋮ / Recordings ► Rehearsal Space ► Reference Tracks ► YouTube/Spotify/SoundCloud
     ──► Voice Recorder tab ► "Sign In to Record" ► Login ► (back to song?)
```

Friction: the home screen offers no search box in the body, no "recent/popular" songs and no first-time explanation; the mini player appears on every song before anything was played (03–05); the 404 page for a guest is the login screen (30).

### 3.2 Member — "practise a song and record a take"

```
Song ► ⋮ ► Recordings ► Rehearsal Space
      ► Reference Tracks: play YouTube (Control Track) → wear headphones
      ► Voice Recorder: Record Audio | Upload File ► ● record ► ■ stop
      ► Review (preview player, name) ► Save Recording / Discard
      ► Your Recordings list ► ▶ play ► close drawer ► mini player keeps playing
```

Friction: 3 taps and a hidden menu before the recorder; four names for the same place ("Recordings", "Rehearsal Space", "Voice Recorder", "Your Recordings", plus header pill and "RECORDING" badge); the mini player overlaps the bottom of the drawer and sheets (51, 63, 66).

### 3.3 Member — "share a take with my co-singer / publish it"

```
Rehearsal Space ► Voice Recorder ► recording row ⋯
   ├─ Share ► search user by e-mail/name ► add ► "Shared with (n)" ► revoke
   ├─ Make Public ► read consent text ► tick checkbox ► Publish Recording
   ├─ Singer Attribution ► search musician  | or "Singer does not have an account" ► name (+ e-mail)
   ├─ Edit recording name / Download / Delete (confirm)
Recipient: opens the same song ► Rehearsal Space ► Voice Recorder ► row with "shared" icon ► play only
```

Friction: the recipient gets no notification or "Shared with me" list — they must already know which song to open (74); shared takes are mixed under the heading "Your Recordings"; the only cue is a small people icon. Sharing a take on a private song triggers a "make lyrics public" prompt, which is a big side-effect hidden inside a share action.

### 3.4 Member — "prepare the songs for tonight's ceremony"

```
Song ► ⋮ ► Add to Playlist ► pick playlist (or "New playlist…")
Library ► Playlists ► playlist ► reorder / description / public toggle / print PDF / share link
```

Friction: the add-to-playlist control on mobile is a small desktop dropdown that opens over a blurred sheet (52); test playlists with timestamps are visible in seeded data.

### 3.5 Admin — "who is using the app"

```
Account menu ► Admin Portal ► Users (search, role filter, sort) ► row ► user detail ► contributions tabs
```

Works well; mainly polish (horizontal tab overflow, long UUID visible, tiny "Details" button next to a row that is already clickable).

---

## 4. Findings

Evidence paths are relative to `docs/ux-research/screenshots/mobile/`.

### 4.1 Navigation & information architecture

| ID | Finding | Heuristic | Sev | Evidence |
| :-- | :-- | :-- | :-- | :-- |
| N1 | **Persistent mini player shows on every song before anything was played** ("Danza del Ci… YOUTUBE REFERENCE" with ⟲ ▶ ⟳ ♫ ✕). It takes ~60 px, sits above the bottom nav and covers sheets, the drawer and the last lyric lines. | H8 aesthetic/minimal, H3 control | 3 | guest/03, member/50, 51, 63 |
| N2 | Unknown URL as guest redirects to **login** with "Please log in to access this page" instead of a 404. Misleading: suggests content exists behind a wall. | H9 errors | 3 | guest/30 |
| N3 | Guest edit link lands on "This Medicine is Not Yours to Edit" instead of a sign-in prompt; the copy is clever but does not say what to do. | H9, H2 | 2 | guest/07, 08 |
| N4 | **Albums** tab is "Coming soon" but sits in the main Library tab row, which also overflows horizontally on 390 px (Albums is cut off). | H8, H4 | 2 | member/09, 14 |
| N5 | `/explore` silently redirects to Home and Home equals Explore for guests; bottom nav has no "Search" although Story 1.1.9 describes Home, Search, Your Library. | H4 consistency | 2 | guest/27 |
| N6 | Inconsistent guest gating: some members-only pages show the GuestGate preview (Library smart playlists: good), others jump to a full login page (recently viewed, new playlist, settings, user profile). Story 3.1.4.2 asks for the locked preview everywhere. | H4 | 2 | guest/09 vs 11, 12, 28 |
| N7 | Auth pages are styled as dismissible modals (✕ top right) on a blank page; the ✕ has no clear destination. | H3 | 1 | guest/20, 21 |
| N8 | Song title in the sticky header is clipped on both sides ("anza del Cielo Curandero"), losing the first letter. | H1, H8 | 2 | member/50 |

### 4.2 Rehearsal Space, reference tracks & recordings

| ID | Finding | Heuristic | Sev | Evidence |
| :-- | :-- | :-- | :-- | :-- |
| R1 | **Recorder is hidden** behind ⋮ → "Recordings" on mobile (3 taps). It is a headline feature for members. No visible "Practise" / "Record" entry on the song screen except the small "RECORDING" badge. | H6 recognition, H7 efficiency | 3 | member/50, 51 |
| R2 | **Naming is inconsistent:** menu "Recordings", drawer "Rehearsal Space", tabs "Reference Tracks / Voice Recorder", list "Your Recordings", library "Your Recordings", badge "RECORDING", guest card "Personal Audio Recorder". People cannot build one mental model. | H4 | 3 | 51, 60, 63, guest/63 |
| R3 | Mini player overlaps the drawer: the recordings list scrolls under it, the last takes are hidden and the drawer has no bottom padding for it. | H8 | 3 | member/63b, 66, 72 |
| R4 | Recordings shared with me are listed under **"Your Recordings"** mixed with my own; only a 14 px people icon marks them. The "Shared by {name}" string exists but is not visible on the row. | H1 visibility, H2 match | 3 | gatekeeper/74 |
| R5 | No inbox for shared recordings: a recipient gets no in-app notice and has no "Shared with me" view (a `notifications` table is being added on the branch). | H1 | 3 | gatekeeper/74 |
| R6 | Row icons are tiny and unlabelled (share count "👥2", globe, clock for pending invite, ✓ for verified). Meaning only via `title` tooltip, which does not exist on touch. | H6, WCAG 1.4.1 | 2 | member/63b |
| R7 | Row "⋯" targets and the drag handle are about 24 px; play button is fine. Recording rows put drag handle, play, title, badges and ⋯ in one line. | WCAG 2.5.8, Fitts | 2 | member/66 |
| R8 | Row menu opens as a desktop popover covering other rows; on mobile a bottom action sheet (like the song ⋮ sheet) is the norm and keeps actions in the thumb zone. | H4 | 2 | member/66 |
| R9 | Destructive and privacy-relevant actions sit next to each other without grouping: Share / Make Public / Attribution / Rename / Download / Delete. "Make Public" is one tap from "Share". | H5 error prevention | 2 | member/66 |
| R10 | Share modal has a strong DRM note (good) but no explanation of *who* can be found (registered users only) and no empty-state when the search finds nothing. | H10 help | 2 | member/67 |
| R11 | Publish modal: the consent checkbox is good practice. The primary button is green while the destructive "make everything public" effect is permanent for listeners; add the song title and what "public" means (all visitors incl. guests). | H5 | 1 | member/68 |
| R12 | Sharing a take on a private song asks to make the **lyrics** public: a large side effect inside a small action. Needs its own clear dialog with both outcomes explained, or a "share song + take" option. | H5 | 2 | (code: `recording.sharing.privateSongPrompt`) |
| R13 | Reference tab: status line "Reference: YouTube video load…" is truncated on 390 px and "Control Track" is unclear wording. (Not verified yet: whether the provider switch hides providers without a link — the tested song has all three.) | H2 | 2 | member/60–62 |
| R14 | Recorder: the big red button is good; "Record Audio / Upload File" segmented control is good. Missing: input level meter, count-in, and the 3:00 limit is only visible when hit. | H1 | 2 | member/63, 64 |
| R15 | Review step: auto-name "Recording - Nov 4 07:38 PM" is fine; "Save Recording" and "Discard" sit side by side with similar size. Make Save the clear full-width primary and Discard a text button. | H8 | 1 | member/65 |
| R16 | Guest voice-recorder preview (blurred demo takes + "Sign In to Record") is a good GuestGate pattern — reuse it for sharing and favourites. | ✅ | — | guest/63 |

### 4.3 Search, browse & song viewer

| ID | Finding | Heuristic | Sev | Evidence |
| :-- | :-- | :-- | :-- | :-- |
| S1 | Home for a first-time guest is only a category grid: no search prompt in the content, no "popular / recently added", no one-line explanation of what the site is. | H10, onboarding | 2 | guest/01 |
| S2 | Focusing search shows no recent searches or suggestions on mobile (the strings exist: "Recent searches", "Clear all"). | H6 | 2 | member/42 |
| S3 | Search results are big cards (≈150 px each) with many tags; only ~3 results fit. A compact list mode would help scanning. | H7 | 2 | member/43, guest/02 |
| S4 | Song cards repeat the metadata as colourful chips (author, tradition, category, language); colour noise makes the title less dominant. | H8 | 1 | guest/02 |
| S5 | Viewer: Key / Capo / Tuning block uses a lot of vertical space above the first lyric line on a small screen; chord letters above lyrics are small (≈10 px) for reading at arm's length. | H8, WCAG 1.4.4 | 2 | member/04 |
| S6 | No visible font-size / auto-scroll / transpose controls on the mobile viewer (transpose only for musicians, buried). | H7 | 2 | member/50 |
| S7 | Add-to-playlist is a small dropdown over a blurred sheet; on mobile it should be its own bottom sheet with "New playlist" first. | H4 | 2 | member/52 |

### 4.4 Forms, auth & settings

| ID | Finding | Heuristic | Sev | Evidence |
| :-- | :-- | :-- | :-- | :-- |
| F1 | Login defaults to magic link; password is a second step. Good for members, but the e-mail field is followed by two equal-weight buttons. Fine — keep, but say which is faster. | H2 | 1 | guest/20 |
| F2 | "Check your email" offers both link and 6-digit code (good). The disabled "Verify & Continue" has low contrast. | WCAG 1.4.3 | 1 | guest/22 |
| F3 | Add Song form: lyrics textarea has a bracket hint but no live chord preview on mobile; "Or upload a file" link is at the top right, easy to miss. | H6 | 2 | member/06 |
| F4 | Guest can fill in the whole Add Song form without any notice that saving needs an account (Story 3.1.4.4 keeps the input, but say it up front). | H1 | 2 | guest/06 |
| F5 | Settings: "Avatar — coming soon" placeholder takes the top of the Profile tab. | H8 | 1 | member/15 |
| F6 | New playlist page is just an underlined title field and a dim button; no explanation of private/public beyond the small hint. | H10 | 1 | member/11 |

### 4.5 Visual, accessibility & content

| ID | Finding | Heuristic | Sev | Evidence |
| :-- | :-- | :-- | :-- | :-- |
| A1 | Many labels are 10–11 px uppercase grey on dark ("SMART PLAYLISTS", "YOUR RECORDINGS", sub-lines in cards). Likely below 4.5:1. | WCAG 1.4.3 | 2 | member/09, 63 |
| A2 | Info is often carried by colour or icon only (status dots, public/shared icons). | WCAG 1.4.1 | 2 | 63b, admin/17 |
| A3 | Seeded "E2E Admin Playlist", "Smoke Test Playlist 1793…" appear in public lists (test data leaking into demo data). | H8 | 1 | guest/18, member/52 |
| A4 | Tone of copy is warm and on-brand ("Back to the Hearth", "Return to the Circle"); keep it, but always pair it with a plain action ("Sign in to edit", "Go home"). | H2 | 1 | 07, 31 |

### 4.6 What works well (keep)

- Bottom navigation with 4 clear items and active state.
- Category grid with counts is a strong browse entry for this domain.
- GuestGate previews in Library and the blurred recorder preview.
- Rehearsal drawer as a bottom sheet with tabs; YouTube/Spotify embeds inline.
- Consent checkbox before publishing; DRM note in the share dialog; delete confirmation that says sharees lose access.
- Admin users overview: search, filter, sort, whole-row click.

---

## 5. Design direction (owner decision, Nov 4, 2026)

The owner's own verdict after reading section 4: the ChordPro rendering is the one part that looks right; the rest reads as "vibe-coded" — many saturated colours, big type, big chips, little white space. Direction chosen:

1. **Sober, near-monochrome palette.** Black / white / greys for everything structural. One accent (the fire orange) reserved for the single primary action on a screen and for the "now playing" state. Colour never carries meaning on its own (WCAG 1.4.1), so categories and tags lose their rainbow.
2. **Smaller base type, more air.** Body 15–16 px, secondary 13 px, no 10–11 px uppercase labels. Spacing scale 4/8/12/16/24/32. Dense lists (songs, takes) become one-line rows with a title and a single grey meta line.
3. **The reader controls the size, not the designer.** A small toolbar on the song page — `Chords [on/off] · A− · A+` (see `references/font-size-control.png`) — replaces "Large Stage Font" in settings. Size is remembered per device. Same control later for auto-scroll and transpose.
4. **Tags are metadata, not decoration.** On a song page one grey line: *Herbert Quinteros · Fire · Healing · Spanish*; tap to expand. On cards at most two tokens. Full tag chips only in the filter sheet, where they are actions.
5. **Keep the ChordPro viewer as the reference style** and derive the rest from it: same font family, same chord colour as the only hue on the lyrics screen.
6. **Fewer surfaces.** Cards with borders and glows go; use dividers and spacing. Sheets and modals share one bottom-sheet component.

Why this also prepares for the roadmap: **song/lyric variants and translations** (Epic 3.2 + a translation layer) add a version switch and a language switch to the same song page. On the current design there is no room; on the sober layout they become one more grey segmented control under the title (*Original · Simplified · Live* / *ES · EN*) and the viewer stays readable.

**Deliverable:** a small design system in `docs/design/` (tokens: colour, type scale, spacing, radius; components: list row, chip, sheet, toolbar) before any page is restyled — otherwise each page drifts again.

---

## 6. Improvement plan, grouped

41 findings → 29 actions in 9 groups. Priority: **A** quick win (≈ 1 sprint together), **B** flow work (≈ 2 sprints), **C** backlog. Each action becomes a GitHub issue with Gherkin criteria (`/create-issue`); all copy in the 8 locales.

### G1 · Visual language & design system

| # | Pri | Action | Fixes |
| :-- | :-: | :-- | :-- |
| G1.1 | A | Design tokens + component sheet (section 5): greyscale palette, one accent, type scale, spacing. Document in `docs/design/`. | S4, A1, A2 |
| G1.2 | A | Restyle song cards and list rows: title + one meta line, no coloured chips, no glow/border. | S3, S4 |
| G1.3 | A | Raise small-text contrast and minimum size (≥ 12 px, ≥ 4.5:1); drop uppercase micro-labels. | A1 |
| G1.4 | B | Category grid: monochrome icons, counts in grey; one accent on hover/active only. | S4 |
| G1.5 | C | Replace "coming soon" placeholders (Albums, Avatar, Privacy) by hiding them. | N4, F5 |

### G2 · Song page: reading in the circle

| # | Pri | Action | Fixes |
| :-- | :-: | :-- | :-- |
| G2.1 | A | Viewer toolbar `Chords · A− · A+` under the title; size stored per device; remove "Large Stage Font" setting. | S5, S6 |
| G2.2 | A | Collapse Key / Capo / Tuning into one grey line; tags into one line, tap to expand. | S5, S4 |
| G2.3 | A | Fix clipped sticky title (ellipsis end only). | N8 |
| G2.4 | B | Sticky bottom action bar in thumb reach: **Practice · Playlist · ♥** (replaces most of the ⋮ sheet). | R1, S7 |
| G2.5 | C | Add auto-scroll and transpose (musician) to the same toolbar; stay-awake indicator. | S6 |
| G2.6 | C | Reserve the slot for variant / language segmented control (Epic 3.2, translations). | roadmap |

### G3 · Media player

| # | Pri | Action | Fixes |
| :-- | :-: | :-- | :-- |
| G3.1 | A | Mini player only after the user presses play; sheets and drawer get bottom padding when it is visible. | N1, R3 |
| G3.2 | C | Mini player in greyscale with one accent; show only providers with a link; "Control Track" → "Open player"; status line wraps. | R13 |

### G4 · Practice & recordings

| # | Pri | Action | Fixes |
| :-- | :-: | :-- | :-- |
| G4.1 | A | One name: **Practice** (tabs *Listen* / *Record*, lists *My takes* / *Shared with me*). Rename menu item, badge, smart playlist, guest card. | R2 |
| G4.2 | A | Split list into *My takes* and *Shared with me*; show "Shared by {name}". | R4 |
| G4.3 | A | Text labels next to status icons ("Public", "Shared · 2", "Pending invite"). | R6 |
| G4.4 | B | Row actions as a grouped bottom action sheet, 44 px targets, Delete separated in red. | R7, R8, R9 |
| G4.5 | B | Share dialog: "registered members only", empty state, private-song case as an explicit separate choice. | R10, R12 |
| G4.6 | B | Shared-with-me inbox: badge in account menu + Library entry; uses the `notifications` table. | R5 |
| G4.7 | C | Recorder: level meter, count-in, "2:41 left"; Save as the single primary in review. | R14, R15 |
| G4.8 | C | Publish dialog: name the song, say "all visitors including guests can listen". | R11 |

### G5 · Navigation & information architecture

| # | Pri | Action | Fixes |
| :-- | :-: | :-- | :-- |
| G5.1 | A | Real 404 for everyone; no login redirect on unknown paths. | N2 |
| G5.2 | A | Hide Albums tab; Library tab row fits 390 px. | N4 |
| G5.3 | B | Decide Home vs Explore vs Search in the bottom bar (Story 1.1.9 says Home · Search · Library). | N5 |
| G5.4 | C | Auth pages: remove the fake modal ✕ or give it a destination. | N7 |

### G6 · Guest experience

| # | Pri | Action | Fixes |
| :-- | :-: | :-- | :-- |
| G6.1 | A | One GuestGate pattern everywhere (edit, history, new playlist, profile): reason + "Sign in" with `next=`. | N3, N6 |
| G6.2 | B | Add Song as guest: top banner "Draft now, sign in to save". | F4 |
| G6.3 | C | First-visit Home: one-line welcome, search box in content, "Recently added". | S1 |

### G7 · Search & browse

| # | Pri | Action | Fixes |
| :-- | :-: | :-- | :-- |
| G7.1 | B | Search focus shows recent searches + category chips; compact result rows (ties to G1.2). | S2, S3 |

### G8 · Playlists & forms

| # | Pri | Action | Fixes |
| :-- | :-: | :-- | :-- |
| G8.1 | B | Add-to-playlist as a bottom sheet, "New playlist" first, check marks for playlists that already hold the song. | S7 |
| G8.2 | C | Add Song: live chord preview toggle; upload as a visible secondary button. | F3 |
| G8.3 | C | New playlist page: explain private/public in one line; clean up the dim button. | F6 |

### G9 · Accessibility & data hygiene

| # | Pri | Action | Fixes |
| :-- | :-: | :-- | :-- |
| G9.1 | A | Clean the seed: no E2E/smoke playlists in demo data. | A3 |
| G9.2 | C | axe + screen-reader pass on song page and Practice panel after the restyle. | A1, A2 |

**Suggested order:** G1.1 (tokens) → G2.1–G2.3 + G3.1 (song page, the screen people stare at) → G4.1–G4.3 → rest of A → B → C.

### Measuring success

- Task-based test with 5 people per role (Nielsen's 5-user rule) on: find a song, start a practice take, share it, find a take shared with you, add a song to a playlist.
- Metrics: task success, time on task, taps to recorder (target ≤ 2), SUS score before/after.
- Add Playwright journeys for the new flows (`@e2e`) and Gherkin scenarios in `docs/testing/`.

---

## 7. Open questions for the product owner

1. Should "Practice" (recordings) be promoted to a bottom-nav or song-level primary action, or stay secondary?
2. Should guests be able to *listen* to public takes (published with consent)? Today the guest drawer only shows reference tracks.
3. Is a "Shared with me" library view wanted, or only notifications?
4. Albums: build, or remove from the roadmap?
5. Is the persistent mini player intended as a "now playing" for the reference track of every opened song?
