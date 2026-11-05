# UX v2: Phone Validation Script

**Version:** 1.9 | **Date:** Nov 5, 2026 | **Epic:** 6.1 (#375) | **Branch:** `feat/ux-v2`

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.9 | Nov 5, 2026 | Added #406 (real 404). |
| 1.6 | Nov 5, 2026 | Added #390 (reader toolbar). |
| 1.5 | Nov 5, 2026 | Added #391 (song meta lines). |
| 1.4 | Nov 5, 2026 | Added #407 (Library tabs). |
| 1.3 | Nov 5, 2026 | Added #392 (sticky title). |
| 1.2 | Nov 5, 2026 | Added #417 (clean demo data). |
| 1.1 | Nov 5, 2026 | Added #385 (design tokens). |
| 1.0 | Nov 5, 2026 | Skeleton: setup, reset and seed, preview image, smoke path. Story sections are added as stories merge. |

Use a phone (or a 390 px browser window) against the preview image. Tick each box. Report a failure as **"failed #N step X"**, a pass as **"validated #N"**.

## 0. Setup

### Run the preview image locally

```bash
# in a checkout of the repo, with a .env built from .env.example
IMAGE_TAG=ux-v2-preview docker compose pull
IMAGE_TAG=ux-v2-preview docker compose up -d
# open http://<host>:<port>/ on the phone (same network); port from docker-compose.yml
```

### Reset and seed the local stack (dev server instead of the image)

```bash
npx supabase start
npx supabase db reset          # applies migrations + supabase/seeds/*
npm run seed:audio             # optional: sample takes for the Practice panel
npm run dev -- --port 3000
```

Test accounts (password `NEXT_PUBLIC_DEV_TEST_PASSWORD`, default `sacred-fire-dev`): **member** `…+member@…`, **gatekeeper** `…+gatekeeper@…` (recipient of shared takes), **admin** `…+admin@…` (see `scripts/dev/ux/lib.mjs`).

Seeded songs: **Danza del Cielo Curandero** (member's song, media + 5 takes, 2 shared), **Morning Sunrise** (musician's song, media), **Down to the River** (admin's song).

## 1. Ten-minute smoke path

### Guest (signed out, private window)

- [ ] 1. Open `/`. Calm greyscale page; one orange accent at most. Bottom bar: **Home · Search · Library**.
- [ ] 2. Tap **Search**, type `danza`, open **Danza del Cielo Curandero**.
- [ ] 3. Song page: title not clipped, one grey meta line, first lyric line visible without scrolling. No mini player.
- [ ] 4. Tap **A+** twice: lyrics grow. Reload: size is kept.
- [ ] 5. Open **Practice** → **Listen**: reference tracks and public takes play. **Record** shows the locked preview with "Sign in".
- [ ] 6. Open `/does-not-exist`: a 404 page, not the login page.

### Member

- [ ] 7. Sign in as member. **Library** shows no Albums tab; the tab row fits the screen; a "+" creates a song or playlist.
- [ ] 8. Open the same song: sticky bar **Practice · Playlist · ♥** in thumb reach.
- [ ] 9. **Playlist** opens a bottom sheet with "New playlist" first and check marks.
- [ ] 10. **Practice** → **Record**: lists **My takes** and **Shared with me**; status icons have text labels.

### In the circle (song page, low light)

- [ ] 11. Dark mode, phone at arm's length: chords in orange, lyrics readable, no text smaller than 12 px.
- [ ] 12. Play a reference track: the mini player appears only now and does not cover the last lyric line.

## 2. Stories

Sections are added per story as it merges into `feat/ux-v2`.

### #385 · G1.1 Design tokens and component sheet

**Preconditions:** any role; light and dark mode (account menu → theme).

- [ ] 1. Open `/` in dark mode. Background is near-black warm grey (not red-black); the phone's status bar matches it. Screenshot: `docs/ux-research/screenshots/ux-v2/385/after-dark-01-home.webp`.
- [ ] 2. Switch to light mode. Background is warm off-white; greys look warm, not blue. Screenshot: `…/385/after-light-01-home.webp`.
- [ ] 3. Open a dialog (e.g. song ⋮ → Delete is not needed; account menu is enough). Hover/pressed rows are grey, never orange.
- [ ] 4. On a laptop, open `docs/design/screens/v2/screen20_design_system.html`: the component sheet shows the same colours as the app.

### #417 · G9.1 Clean demo data

**Preconditions:** guest or member; preview freshly reset and seeded (§0).

- [ ] 1. Open Library → Playlists → public playlists. No title contains "E2E" or "Smoke Test".
- [ ] 2. Search "E2E" and "Smoke". No playlist or song fixture appears (E2E practice takes are removed after each test run).

### #392 · G2.3 Sticky song title truncates at the end

**Preconditions:** any role; phone (or 390 px window).

- [ ] 1. Search "Grandmother's Song of the Thousand Rivers" (or any very long title) and open it.
- [ ] 2. Scroll down. The header shows the title from its first letter, ending in "…"; it does not slide or animate. Screenshot: `docs/ux-research/screenshots/ux-v2/392/after-dark-song-long-title.webp`.
- [ ] 3. Open a short title: shown in full, left aligned. The ⋮ button stays on the right and is easy to tap.

### #407 · G5.2 Library tabs fit the phone

**Preconditions:** member; phone (or 390 px window).

- [ ] 1. Open Library. The tab row shows **Playlists · History · Artists**, all fully visible, no Albums. Screenshot: `docs/ux-research/screenshots/ux-v2/407/after-dark/mobile/member/10-playlists.webp`.
- [ ] 2. Tap each tab. Every tab opens a working page; none says "Coming soon".
- [ ] 3. Type `/library/albums` in the address bar. You see the not-found page, not an Albums placeholder.

### #391 · G2.2 Song meta on two grey lines

**Preconditions:** guest; phone (or 390 × 844 window).

- [ ] 1. Open a song with many tags (e.g. "Grandmother's Song of the Thousand Rivers"). Under the title: one grey line `Author · Tag · …` and one line `Key D · Capo 1 · DADGAD`. No coloured chips. Screenshot: `docs/ux-research/screenshots/ux-v2/391/after-dark-song-detail.webp`.
- [ ] 2. The first lyric line is visible without scrolling.
- [ ] 3. Tap the meta line. It expands into links (authors, tags, Chords/Melody); tap a tag → the song list filtered by it. Tap the line again to collapse.
- [ ] 4. A song without key/capo shows only the meta line.

### #390 · G2.1 Reader toolbar `Chords · A− · A+`

**Preconditions:** guest; phone (or 390 × 844 window).

- [ ] 1. Open a song with chords (e.g. "Abuelita Corazón Viejo"). Under the grey meta lines: a `Chords` switch, `A−` and `A+`. Screenshot: `docs/ux-research/screenshots/ux-v2/390/after-light-song-detail.webp`.
- [ ] 2. Tap `A+` twice. The lyrics grow two steps; the chords grow with them. `A+` greys out at the largest size, `A−` at the smallest.
- [ ] 3. Reload the page (or open another song). The size you chose stays.
- [ ] 4. Switch `Chords` off. The chord letters disappear, every lyric line stays on its own line, nothing jumps sideways. Screenshot: `…/390/after-dark-song-detail-large-no-chords.webp`.
- [ ] 5. A song without chords shows only `A−` / `A+`.
- [ ] 6. Settings → Preferences no longer lists "Large Stage Font".

### #406 · G5.1 Unknown URL shows a real 404

**Preconditions:** guest (signed out) for steps 1–4, member for step 5, admin for step 6.

- [ ] 1. Signed out, open `/this-page-does-not-exist`. The page says **Page not found** with a **Go home** button; the address stays the same and there is no login screen. Screenshot: `docs/ux-research/screenshots/ux-v2/406/after-light/mobile/guest/30-not-found.webp` (dark: `after-dark/…`).
- [ ] 2. Tap **Go home**: the home page opens.
- [ ] 3. Open `/admin`: you are sent to the login page (still protected).
- [ ] 4. Open `/songs/00000000-0000-4000-a000-000000000000`: **Song Not Found** (song copy, not the generic one). Screenshot: `…/406/after-light/mobile/guest/31-song-not-found.webp`.
- [ ] 5. Sign in as member, open `/this-page-does-not-exist`: the same **Page not found** page.
- [ ] 6. Sign in as admin, open `/this-page-does-not-exist`: the same **Page not found** page.
