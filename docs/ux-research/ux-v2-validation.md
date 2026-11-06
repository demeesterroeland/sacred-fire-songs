# UX v2: Phone Validation Script

**Version:** 1.36 | **Date:** Nov 6, 2026 | **Epic:** 6.1 (#375) | **Branch:** `feat/ux-v2`

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.36 | Nov 6, 2026 | Added #418 (accessibility audit of the song page and the Practice panel: what to check with a keyboard and a screen reader on a phone; the screen reader pass is still to be done). |
| 1.35 | Nov 6, 2026 | Added #405 (publish dialog names the song and says who will hear the take; a take on a private song starts with making the song public; guests hear public takes on the Listen tab; long names, focus return). |
| 1.34 | Nov 6, 2026 | Added #395 (version switch under the song title; steps 6, 6b, 6c: `?version=` link, Save returns to the edited version, a take in progress blocks switching). |
| 1.33 | Nov 6, 2026 | Added #415 (Add Song preview and visible upload button). |
| 1.32 | Nov 6, 2026 | Added #412 (Home welcome, search field and Recently added for guests). |
| 1.31 | Nov 6, 2026 | Added #416 (New Playlist: visibility switch and one-line explanation). |
| 1.30 | Nov 6, 2026 | Added #394 (auto-scroll and transpose in the reader toolbar). |
| 1.29 | Nov 6, 2026 | Added #404 (recorder level meter, count-in, time left, review buttons); review: rolling no-sound window, bold last 10 s, meter below the clock. |
| 1.28 | Nov 6, 2026 | Added #409 (auth pages without a fake close button). |
| 1.27 | Nov 6, 2026 | Added #389 (unfinished features hidden). |
| 1.26 | Nov 5, 2026 | Added #397 (calm player and reference tab). |
| 1.25 | Nov 5, 2026 | Added #403 (Shared with me). |
| 1.24 | Nov 5, 2026 | Added #402 (Share dialog explains who can be found and what happens on a private song). |
| 1.23 | Nov 5, 2026 | Added #414 (Add to playlist bottom sheet). |
| 1.22 | Nov 5, 2026 | Added #393 (sticky Practice · Playlist · ♥ action bar). |
| 1.21 | Nov 5, 2026 | Added the #413 section (recent searches and category chips in the search field). |
| 1.20 | Nov 5, 2026 | Added #401 (take actions in a bottom sheet). |
| 1.19 | Nov 5, 2026 | Added #411 (guest draft banner on Add Song). |
| 1.18 | Nov 5, 2026 | Added the #408 section (bottom bar Home · Search · Library); #387 step 2 labels updated. |
| 1.17 | Nov 5, 2026 | Added #388 (calm category grid). |
| 1.16 | Nov 5, 2026 | Added #400 (take status in words). |
| 1.15 | Nov 5, 2026 | Added #387 (readable small labels). |
| 1.14 | Nov 5, 2026 | Added #399 (takes shared with me listed apart, "Shared by").  |
| 1.13 | Nov 5, 2026 | Added #386 (compact song rows). |
| 1.12 | Nov 5, 2026 | Added #396 (mini player on play, none on the next song). |
| 1.11 | Nov 5, 2026 | Added #398 (one name: Practice; recorder and dialogs say "take"). |
| 1.10 | Nov 5, 2026 | Added #410 (GuestGate). |
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

**Preconditions:** guest (signed out) for steps 1–4, member for step 5, admin for step 6. Visual check only: the browser address bar does not show HTTP status. An unmatched URL is a real HTTP 404; the unknown-song page (step 4) is rendered by the streamed song route and keeps HTTP 200 with `noindex` (automated in `e2e/tests/real-404.spec.ts`).

- [ ] 1. Signed out, open `/this-page-does-not-exist`. The page says **Page not found** with a **Go home** button; the address stays the same and there is no login screen. Screenshot: `docs/ux-research/screenshots/ux-v2/406/after-light/mobile/guest/30-not-found.webp` (dark: `after-dark/…`).
- [ ] 2. Tap **Go home**: the home page opens.
- [ ] 3. Open `/admin`: you are sent to the login page (still protected).
- [ ] 4. Open `/songs/00000000-0000-4000-a000-000000000000`: **Song Not Found** (song copy, not the generic one). Screenshot: `…/406/after-light/mobile/guest/31-song-not-found.webp`.
- [ ] 5. Sign in as member, open `/this-page-does-not-exist`: the same **Page not found** page.
- [ ] 6. Sign in as admin, open `/this-page-does-not-exist`: the same **Page not found** page.

### #410 · G6.1 One GuestGate on every members-only screen

**Preconditions:** signed out (guest) for steps 1–9; signed in as the seeded member for steps 10–11. Seeded song owned by the musician: `/songs/fb193fc1-8d60-45db-85ab-b076d5985255`.

Each gate shows a greyed placeholder, a lock, a title, one sentence saying why, and a **Sign in** button at least 44 px high. Screenshots: `docs/ux-research/screenshots/ux-v2/410/`.

- [ ] 1. Open `/library/recently-viewed`. You stay on this URL and see the "Sign in to see your history" gate (no jump to a login page). Screenshot: `…/410/after-light-12-recently-viewed.webp`.
- [ ] 2. Tap **Sign in**, sign in with the member account. You land on `/library/recently-viewed` with your history.
- [ ] 3. Open `/library/playlists/add`: "Sign in to create a playlist". Tap **Sign in**: the address bar shows `/auth/login?next=%2Flibrary%2Fplaylists%2Fadd`.
- [ ] 4. Open `/library/playlists`: one gate "Sign in to see your library", with the public playlists listed below it (no fake "Yage Ceremony" cards). Screenshot: `…/410/after-light-10-playlists.webp`.
- [ ] 5. Open `/account/settings` and `/account/settings?tab=privacy`: "Sign in to open your settings"; after signing in you return to the same tab.
- [ ] 6. Open `/users/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12`: "Sign in to see profiles".
- [ ] 7. Open `/songs/fb193fc1-8d60-45db-85ab-b076d5985255/edit`: "Sign in to edit songs" (no "Not Yours to Edit"). Screenshot: `…/410/after-light-08-song-edit-other.webp`.
- [ ] 8. On a song, tap ⋮ → **Add to playlist**: a bottom sheet with the gate "Sign in to add songs to playlists"; **Sign in** returns to the same song.
- [ ] 9. On a song, open Practice (microphone button) → **Record** tab: the blurred recorder is covered by the gate "Sign in to record". Screenshot: `…/410/after-light-63-recorder.webp`.
- [ ] 10. As the member, open `/songs/fb193fc1-8d60-45db-85ab-b076d5985255/edit` (not your song): the warm "This Medicine is Not Yours to Edit" with **Back to the song** and **Return to the Circle**.
- [ ] 11. As the member, open `/library/recently-viewed`, `/library/playlists/add`, `/account/settings`: no gate, the normal screens.
- [ ] 12. Dark mode and a 390 px window: every gate readable, no horizontal scroll.
- [ ] 13. On a song, tap the heart (♥): a bottom sheet with the gate "Sign in to save favourites" (no toast). Add `?ref=heart` to the URL first: **Sign in** leads to `/auth/login?next=%2Fsongs%2F…%3Fref%3Dheart`. The same on a heart in the song list.
- [ ] 14. Open `/auth/login?next=//example.org` while signed in, and `/auth/login?next=/%5Cexample.org` after signing in: you land on the home page, never on another site.

### #398 · G4.1 One name: Practice

**Preconditions:** a member account on a song that has at least one YouTube, SoundCloud or Spotify link (so both tabs show). Repeat step 1 as a guest.

- [ ] 1. Open the song, tap ⋮ (top right). The menu entry reads **Practice** (not "Recordings"). Screenshot: `docs/ux-research/screenshots/ux-v2/398/after-light/mobile/member/01-song-menu.webp`.
- [ ] 2. Tap **Practice**. The panel title reads **Practice** (not "Rehearsal Space"). Screenshot: `docs/ux-research/screenshots/ux-v2/398/after-light/mobile/member/02-drawer.webp`, Record tab: `docs/ux-research/screenshots/ux-v2/398/after-light/mobile/member/03-drawer-record-tab.webp`.
- [ ] 3. The two tabs read **Listen** and **Record**.
- [ ] 4. On **Record**, the list under the recorder is headed **My takes**. As a guest, the lock card reads **Practice recorder**.
- [ ] 5. Close the panel. On the song list, a song where you have takes shows a **Takes** chip.
- [ ] 6. Open Library. The card reads **Your takes**. Screenshot: `docs/ux-research/screenshots/ux-v2/398/after-light/mobile/member/10-playlists.webp`.
- [ ] 7. Switch the language (account menu) to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua. Steps 1–6 show the translated word for Practice, Listen, Record, takes. Nothing says Rehearsal Space, Voice Recorder or Recordings in any language.
- [ ] 8. On **Record**, start a take and stop it: the review step reads *Review your take*, the name field *Take Name (e.g. Take 1)*, the button **Save Take**. In the list, ⋯ → Delete asks **Delete take?**; Share is titled **Share take**.
- [ ] 9. With a reference track and a take loaded, tap the mini-player title: the source menu is headed **Listen** (not "Reference Tracks") and **My takes** (not "User Recordings").

### #396 · G3.1 Mini player appears only after play

**Preconditions:** member account; a song with a reference track (YouTube) and at least one saved take; light and dark mode.

- [ ] 1. Open any song, e.g. `/songs/<id>` (do not tap anything). No orange bar above the bottom bar; the last lyric line scrolls fully into view. Screenshot: `docs/ux-research/screenshots/ux-v2/396/after-light/mobile/member/01-song-no-player.webp`.
- [ ] 2. Tap ⋮ → **Recordings** → **Reference Tracks**, tap play on the YouTube video. The orange player bar appears above the bottom bar with the song title and *YouTube Reference*. Screenshot: `…/396/after-light/mobile/member/02-drawer-player-on-play.webp`.
- [ ] 3. Scroll the panel to its end. The last row is fully visible above the bar (nothing hidden behind it).
- [ ] 4. Tap pause on the bar, then close the panel. The bar stays (paused). Tap ✕ on the bar: the bar disappears.
- [ ] 5. Reopen ⋮ → **Recordings** → **Voice Recorder**, tap ▶ on the last take, scroll to the end. The last take row is fully visible above the bar. Screenshot: `…/396/after-light/mobile/member/03-drawer-scrolled-to-end.webp`.
- [ ] 6. Open ⋮ (the song menu sheet) while the take plays. The sheet's last action is not covered by the bar.
- [ ] 7. Play the take, then open another song from Songs (bottom bar). The music stops and no bar shows on the other song (the bar never follows you to another song).
- [ ] 8. Repeat step 1 in dark mode; with *reduce motion* on, the equalizer bars do not animate.

### #386 · G1.2 Compact song rows

**Preconditions:** guest, then member; phone (or 390 × 844 window).

- [ ] 1. Open **Songs** (`/songs`). Each song is one row: the title, one grey line `Author · Category · Language`, and the key on the right. No coloured chips. At least six rows fit on the screen. Screenshot: `docs/ux-research/screenshots/ux-v2/386/after-light/mobile/member/02-songs-search.webp`.
- [ ] 2. Tap a row anywhere except the icons: the song opens.
- [ ] 3. As a member tap ♥ on a row: it fills with the accent colour; the song does not open. Tap the playlist icon: the playlist picker opens.
- [ ] 4. Library → Playlists: Recently viewed and New since last visit use the same grey rows. Open a playlist: its songs are rows too, with the drag handle and remove button.
- [ ] 5. Library → Artists: each artist is a row with the number of songs and their titles on one grey line.

### #399 · G4.2 Takes shared with me are listed apart

**Preconditions:** two member accounts, A and B. As A, on a song: record (or upload) a take and share it with B (⋯ → Share take). B also has at least one own take on the same song. Run steps 1–6 as B; step 7 as A.

- [ ] 1. As B, open the song, tap ⋮ → **Practice** → **Record**. Under the recorder two lists show: **My takes** and **Shared with me**. Screenshot: `docs/ux-research/screenshots/ux-v2/399/after-light/mobile/member/01-record-tab.webp`.
- [ ] 2. The take A shared is listed under **Shared with me** and not under **My takes**. B's own take is under **My takes** only.
- [ ] 3. The shared row's grey line reads **Shared by <A's name>** followed by the length (no date on shared rows). Screenshot: `docs/ux-research/screenshots/ux-v2/399/after-dark/mobile/member/01-record-tab.webp`. No tooltip is needed to know it is shared.
- [ ] 4. The shared row has a play button but no ⋯ menu: no Download, Share or Delete. Double-tapping its name does not start renaming. The own take keeps its ⋯ menu.
- [ ] 5. Tap play on the shared take: it plays, and the player bar appears (#396). Open the bar's title menu: the takes are grouped under **My takes** and **Shared with me**.
- [ ] 6. Switch the language (account menu) to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the heading and "Shared by" are translated. Repeat step 1 in dark mode.
- [ ] 7. As A (or as any user with no shared takes), open the Record tab: there is no **Shared with me** heading at all.

### #387 · G1.3 Small labels are readable
**Preconditions:** member signed in on a 390 px phone, English; run once in light and once in dark (Account settings → Preferences → theme). Seed data as in the setup section.

1. Open `/`. **Expected:** the section titles "Your library" and "Explore by category" are sentence case, 13 px, clearly readable grey — not tiny uppercase letters. Counter labels (Favorites, Drafts …) are readable. Screenshot: `docs/ux-research/screenshots/ux-v2/387/after-light/mobile/member/01-home.webp` (and `after-dark`). Before: `docs/ux-research/screenshots/ux-v2/387/before-light/mobile/member/01-home.webp`.
   - [ ] Pass
2. Look at the bottom bar on `/`. **Expected:** the labels (Home, Search, Library) are as large as the other small text and readable; the active one is orange. Same screenshot.
   - [ ] Pass
3. Open `/library` (opens Playlists). **Expected:** "Public playlists", "Smart playlists", "My private playlists" are sentence case; the card sub-lines (song counts, descriptions) are readable grey and the "New" button has a visible outline. Screenshot: `docs/ux-research/screenshots/ux-v2/387/after-light/mobile/member/09-library.webp`.
   - [ ] Pass
4. Open `/songs`, then any song. **Expected:** nothing looks greyed-out or tiny; section labels on the song page (Verse, Chorus, media titles) are readable. Screenshots: `…/387/after-light/mobile/member/02-songs-search.webp`, `03-song-detail.webp`.
   - [ ] Pass
5. Repeat steps 1–4 in dark mode. **Expected:** the same, text readable on the dark background.
   - [ ] Pass
6. Switch the language (☰ menu → language) to Nederlands and Español and open `/`. **Expected:** the section titles read naturally and are not in capitals.
   - [ ] Pass

### #400 · G4.3 Take status in words

**Preconditions:** member account; a song with a take that you made public (⋯ → **Make Public**) and shared with two people (⋯ → **Share take**), and the singer named as a person without an account (⋯ → **Singer Attribution** → *Singer does not have an account yet*); light and dark mode.

- [ ] 1. Open the song, tap ⋮ → **Practice** → **Record**. Under the take's name grey labels read **Public**, **Shared · 2** and **Pending invite**, each with a small icon. Screenshot: `docs/ux-research/screenshots/ux-v2/400/after-light/mobile/member/01-take-status.webp`.
- [ ] 2. Nothing needs a long-press or hover to be understood. Labels are at least as big as the grey date line (12 px) and wrap to a second line on a narrow phone without cutting words.
- [ ] 3. Make the take private (⋯ → **Make Private**): **Public** disappears, **Shared · 2** stays. Remove both shares: **Shared · 2** disappears. A take that is private and not shared has no label at all.
- [ ] 4. Name a singer who is a verified musician (⋯ → **Singer Attribution**, pick the musician): the label **Verified musician** shows and the singer's name still links to their profile.
- [ ] 5. Open the take of another member that is shared with you: the row says **Shared by <name>**, with no share count.
- [ ] 6. Section titles (**Practice**, **My takes**, **Shared with me**) are normal sentence case, not capitals. Screenshot dark: `…/400/after-dark/mobile/member/01-take-status.webp`.
- [ ] 7. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the labels are translated. Repeat step 1 in dark mode.

### #388 · G1.4 Calm category grid

**Preconditions:** signed out (guest) on a 390 px phone, English; run once in light and once in dark. Seed data as in the setup section.

- [ ] 1. Open `/`. **Expected:** under "Explore by category" the tiles are plain grey cards with a grey icon; no blue, green, purple, amber or red tiles and no coloured chips. Screenshot: `docs/ux-research/screenshots/ux-v2/388/after-light/mobile/guest/01-home.webp`. Before: `docs/ux-research/screenshots/ux-v2/388/before-light/mobile/guest/01-home.webp`.
- [ ] 2. **Expected:** the tags inside a tile (e.g. *Air 7*, *Earth 8*) are plain text with the number in a lighter grey; no emoji or flags.
- [ ] 3. Press and hold a category title or a tag. **Expected:** only then it turns orange (the one accent); releasing opens the songs list for that category or tag.
- [ ] 4. Tap **+3 more** in a tile. **Expected:** the hidden tags appear in the same tile. Every link is easy to hit with a thumb (at least 44 px tall).
- [ ] 5. Repeat steps 1–4 in dark mode. Screenshot: `…/388/after-dark/mobile/guest/01-home.webp`.

### #408 · G5.3 Bottom bar: Home · Search · Library

**Preconditions:** 390 px phone, English, light and dark. Run steps 1–3 as a guest (signed out), steps 4–6 as a member.

- [ ] 1. Open `/`, `/songs` and `/library/playlists`. The bottom bar has exactly three items: **Home**, **Search**, **Library**. No Songs, no Create. Screenshots: `docs/ux-research/screenshots/ux-v2/408/after-light/mobile/guest/01-home.webp`, `…/after-dark/mobile/guest/01-home.webp`.
- [ ] 2. The current page's item is orange and bold, the other two grey; never two orange items. Each item is easy to hit with a thumb and its label is as large as other small text.
- [ ] 3. On `/`, tap **Search**. The song list opens, the cursor is in the search field (the keyboard opens) and **Search** is highlighted.
- [ ] 4. Sign in. Open **Library**. A round **+** sits at the right of the heading "Library". Tap it: a sheet slides up with **Add Song** and **New Playlist**. Screenshot: `docs/ux-research/screenshots/ux-v2/408/after-light/mobile/member/02-library-create.webp`.
- [ ] 5. Tap **New Playlist**: the new-playlist form opens. Go back, tap **+**, then **Add Song**: the add-song form opens. Tap outside the sheet: it closes.
- [ ] 6. **Home** and the song list have no **+**. As a guest, Library shows the sign-in preview and no **+**.
- [ ] 7. Open `/explore`: a "Page not found" page, not Home.
- [ ] 8. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the middle item is translated (Zoeken, Buscar, Cerca, Поиск, Rechercher, Pesquisar, Maskay) and the three items still fit one row.

### #411 · G6.2 Guest draft on Add Song

**Preconditions:** signed out (guest) on a 390 px phone, English; run once in light and once in dark. A member account to sign in with.

- [ ] 1. Open `/songs/add`. **Expected:** above the form a grey box says **Draft now — sign in to save** and "Saving a song needs an account. Your draft stays on this device while you sign in.", with an orange **Sign in** button. Screenshot: `docs/ux-research/screenshots/ux-v2/411/after-light/mobile/guest/06-song-add.webp`. Before: `docs/ux-research/screenshots/ux-v2/411/before-light/mobile/guest/06-song-add.webp`.
- [ ] 2. Type a title and a few lyric lines.
- [ ] 3. Tap **Sign in** in the box and sign in. **Expected:** you come back to Add Song, the box is gone and the title and lyrics you typed are still there.
- [ ] 4. Sign out, open `/songs/add`, type a title and lyrics and press **Publish Song**. **Expected:** the sign-in page opens; after signing in you are back on Add Song with the text kept.
- [ ] 5. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the box is translated. Repeat step 1 in dark mode (`…/411/after-dark/mobile/guest/06-song-add.webp`).

### #401 · G4.4 Take actions in a grouped bottom sheet

**Preconditions:** member account; a song with at least one take of your own and one take that someone shared with you; English, 390 px phone; light and dark mode.

- [ ] 1. Open the song, tap ⋮ → **Practice** → **Record**. On a take of **My takes**, the **⋯** button is a comfortable thumb target. Tap it. A sheet slides up from the bottom, titled with the take's name, with a small grey bar at its top. Screenshot: `docs/ux-research/screenshots/ux-v2/401/after-light/mobile/member/01-take-actions.webp`.
- [ ] 2. Three groups, separated by thin lines: **Play, Edit take name, Download take** · **Share, Singer Attribution, Make Public, Copy link** · **Delete take** alone at the bottom, red text with a bin icon. Delete is not next to Share.
- [ ] 3. Every row is easy to hit with a thumb (at least 44 px tall) and reads clearly in dark mode too. Screenshot dark: `…/401/after-dark/mobile/member/01-take-actions.webp`.
- [ ] 4. Tap **Share**: the sheet closes and the **Share take** dialog opens as before. Close it.
- [ ] 5. Open the sheet again, tap **Edit take name**: the sheet closes and the name field is ready to type in on the row. Press Esc to leave the name unchanged.
- [ ] 6. Open the sheet, tap **Delete take**: the sheet closes and the question **Delete take?** appears. Tap **Cancel**: the take is still there.
- [ ] 7. Open the sheet and drag the grey bar down: the sheet follows your finger and closes when you let go after a long drag. A tap on the bar or a short slow drag leaves it open. Tapping outside the sheet also closes it.
- [ ] 8. Look at a take under **Shared with me** (or **Public takes**): no **⋯** button — only its play button.
- [ ] 9. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua and open the sheet: all rows are translated and Delete is still alone at the bottom.

### #413 · G7.1 Recent searches and category chips

**Preconditions:** signed out (guest) on a 390 px phone, English; light and dark. Clear the site data first so the recent searches start empty. Seed data as in the setup section.

- [ ] 1. Open `/songs` and tap the search field. **Expected:** a panel opens under the top bar with only a **Categories** heading and grey chips (The Elements, Nature, …); no empty "Recent searches" heading.
- [ ] 2. Type `agua`, press Enter on the keyboard. Open `/songs` again and tap the search field. **Expected:** **Recent searches** lists `agua` above **Categories**. Screenshot: `docs/ux-research/screenshots/ux-v2/413/after-light/mobile/guest/01-search-focused.webp`. Before: `docs/ux-research/screenshots/ux-v2/413/before-light/mobile/guest/01-search-focused.webp`.
- [ ] 3. Search six different words one after another (leave the field after each). **Expected:** only the last 5 are listed, newest on top.
- [ ] 4. Tap a recent search. **Expected:** the song list shows the results for that word and the panel closes.
- [ ] 5. Tap the **✕** next to one search: only that one goes. Tap **Clear all**: the searches go, the categories stay. Reload the page: they are still gone.
- [ ] 6. Tap a category chip (e.g. **Nature**). **Expected:** the song list shows only songs of that category. Tap the field again: that chip is marked with a check and a dark fill (not just a colour). Tap it again: the filter is removed.
- [ ] 7. With the panel open, tap anywhere outside it: it closes. Open it again and press Esc (hardware keyboard): it closes.
- [ ] 8. Go to Home and tap **Search** in the bottom bar. **Expected:** the song list opens, the cursor is in the field and the panel is open.
- [ ] 9. Every row, **✕**, **Clear all** and chip is easy to hit with a thumb (at least 44 px) and the text is at least as large as the grey meta line.
- [ ] 10. Repeat steps 1–2 and 6 in dark mode. Screenshot: `…/413/after-dark/mobile/guest/01-search-focused.webp`. Switch the language to Dutch: the headings **Recente zoekopdrachten**, **Categorieën** and **Alles wissen** show.

### #393 · G2.4 Sticky action bar: Practice · Playlist · ♥

**Preconditions:** a member account and a guest (private window); one song with a YouTube / SoundCloud / Spotify link and one without; light and dark mode; Settings → Preferences → auto-hide on (default).

- [ ] 1. Member: open a song. At the bottom, above the bottom navigation, a bar shows **Practice** (orange, with your number of takes), **Playlist** and **Like**, each with an icon and a word. Screenshot: `docs/ux-research/screenshots/ux-v2/393/after-light/mobile/member/04-song-detail-own.webp`.
- [ ] 2. The three actions are easy to hit with the thumb (at least 44 px high) and the words are readable.
- [ ] 3. On the song **with** a reference track: tap **Practice**. The panel opens on **Listen**; tap **Record**: the recorder is ready (two taps). Screenshot: `…/393/after-light/mobile/member/05-practice-opened-from-bar.webp`.
- [ ] 4. On the song **without** a reference track: tap **Practice**: the panel opens straight on **Record** (one tap). Close it with ✕.
- [ ] 5. Tap **Like**: the heart fills and the label reads **Liked**. Tap again to undo. Tap **Playlist**: the list of your playlists opens above the bar; tick one and close it.
- [ ] 6. Tap ⋮ (top right): the menu offers **Share Song** (and **Edit**, **Delete** on your own songs). Practice, Add to Playlist and Like are no longer in it.
- [ ] 7. Scroll down: the bar slides away. Scroll up a little: it comes back. At the very top it is always there.
- [ ] 8. Settings → Preferences → switch auto-hide off, return to a song and scroll: the bar (and the bottom navigation) stay put and do not overlap each other.
- [ ] 9. Press play on a reference track and close the panel: the orange player bar shows **above the navigation**, the action bar sits above the player bar, and the last line of the song can still be scrolled clear of both.
- [ ] 10. Guest (private window): the bar shows the same three actions. Tap **Like**: the sign-in sheet opens (reason: favourites) and **Sign in** returns you to this song. Tap **Playlist**: the sheet opens with the playlist reason. Tap **Practice**: the panel opens and **Record** shows the sign-in gate. Screenshot: `…/393/after-dark/mobile/guest/03-song-detail.webp`.
- [ ] 11. Turn the phone sideways and use a phone with a home bar: the bar stays above the home bar and nothing is cut off.
- [ ] 12. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the three labels and the bar's accessible name are translated and fit on one line. Repeat step 1 in dark mode.

### #414 · G8.1 Add to playlist as a bottom sheet

**Preconditions:** signed in as a member on a 390 px phone, English; run once in light and once in dark. Two private playlists exist, e.g. "Water Ceremony" and "Fire Circle", and "Water Ceremony" already holds the song you open.

- [ ] 1. Open that song and tap ⋮, then **Add to Playlist**. **Expected:** a sheet slides up from the bottom (not a small box over a blurred page) titled **Add to playlist**. The first row is **New playlist**; below it your playlists. **Water Ceremony** has a check on the right, **Fire Circle** has none. Screenshot: `docs/ux-research/screenshots/ux-v2/414/after-light/mobile/member/01-playlist-sheet.webp`. Before: `docs/ux-research/screenshots/ux-v2/414/before-light/mobile/member/01-playlist-sheet.webp`.
- [ ] 2. Tap **Fire Circle**. **Expected:** the check appears at once, a message says "Added to Fire Circle" with **Open playlist**; the sheet stays open.
- [ ] 3. Tap **Water Ceremony**. **Expected:** its check disappears and a message says "Removed from Water Ceremony".
- [ ] 4. Tap **New playlist**, type a name, tap **Create**. **Expected:** the new playlist is in the list with a check; open **Library → Playlists** later and it holds the song.
- [ ] 5. Tap **Done** (or the dark area above the sheet, or swipe the grey handle down). **Expected:** the sheet and the ⋮ menu close. Every row is easy to hit with a thumb (at least 44 px).
- [ ] 6. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: **New playlist**, **Create** and **Done** are translated. Repeat step 1 in dark mode (`…/414/after-dark/mobile/member/01-playlist-sheet.webp`).
- [ ] 7. Clean up: delete the playlists you made in step 4.

### #402 · G4.5 Share dialog explains itself

**Preconditions:** member account that owns a **private** song with one take (Add Song → leave it private → Practice → Record a take); a second registered member to share with; English; light and dark mode.

- [ ] 1. Open the song, tap **Practice** in the bar at the bottom → **Record**, then ⋯ on the take → **Share**. **Expected:** the dialog title reads *Make the song public to share this take?* with two lines: *The song lyrics become public: everyone can see this song.* and *The take "…" is shared with the members you pick next.* and *Nothing changes until you confirm.* There is no search box yet. Screenshot: `docs/ux-research/screenshots/ux-v2/402/after-light/mobile/member/01-share-private.webp`.
- [ ] 2. Tap **Cancel**. **Expected:** the dialog closes; the song is still private (no **Public** badge on the song page) and nothing is shared.
- [ ] 3. Open **Share** again and tap **Make song public and continue**. **Expected:** the search box appears with the line *You can share with registered members only. Someone without an account needs to sign up first.* The song is now public. Screenshot: `…/402/after-light/mobile/member/02-share-search.webp`.
- [ ] 4. Type `zzqxjv` in the search box. **Expected:** *No registered member found for "zzqxjv". Someone without an account needs to sign up first.* Screenshot: `…/402/after-light/mobile/member/03-share-empty.webp`.
- [ ] 5. Type the name of the second member and tap **Share**. **Expected:** they appear under *Shared with (1)* and get a notification.
- [ ] 6. Sign in as a member who has a take on a private song they do not own (ask the song owner to make it private again) and tap ⋯ → **Share**. **Expected:** the dialog says *This song is private* and that only the song owner can make the lyrics public; no search box and no toast.
- [ ] 7. Repeat steps 1, 3 and 4 in dark mode (`…/402/after-dark/…`) and in Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: all text is translated. Every button is at least 44 px tall.

### #403 · G4.6 Shared with me

**Preconditions:** two accounts, Alice and Bob (members), on a 390 px phone, English; Bob is signed in, Alice's session on a laptop. Alice has a take on a song and shares it with Bob (Practice → Record → take ⋮ → Share). Run once in light and once in dark.

- [ ] 1. As Bob open any page. **Expected:** the bell at the top shows a number badge (1). The avatar has no badge. Screenshot: `docs/ux-research/screenshots/ux-v2/403/after-light/mobile/member/01-library.webp`.
- [ ] 2. Tap the avatar. **Expected:** the menu lists **Shared with me** with the words **1 new** next to it (a 44 px row).
- [ ] 3. Tap **Library**. **Expected:** under the tabs a row **Shared with me** with **1 new** and an arrow. Before: `…/403/before-light/mobile/member/01-library.webp`.
- [ ] 4. Tap **Shared with me**. **Expected:** the page shows the breadcrumb Library › Shared with me and one row: the song title, *Shared by Alice · <take name>* and the word **New** with a dot. Screenshot: `…/403/after-light/mobile/member/02-shared-with-me.webp`.
- [ ] 5. Tap the row. **Expected:** the song opens with the Practice panel on that take, highlighted. The bell number goes away at once.
- [ ] 6. Back on **Shared with me**: the row has no **New** marker. Reload the page: still read.
- [ ] 7. Alice shares another take of a different song. As Bob, open that song normally (not through the list) and tap **Practice**. **Expected:** the bell number drops; the take was marked read.
- [ ] 8. Bob with nothing shared: the page reads "Nothing has been shared with you yet. …". Screenshot: `…/403/after-light/mobile/member/03-shared-empty.webp`.
- [ ] 9. Signed out (private window): open `/library/shared`. **Expected:** the locked preview "Sign in to see what is shared with you" and a **Sign in** button that returns you here.
- [ ] 10. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the menu entry, the **N new** text, the page title, **New** and the empty text are translated and fit on one line. Repeat steps 1–4 in dark mode.

### #397 · G3.2 Calm player and reference tab

**Preconditions:** a 390 px phone, English; a song with a YouTube, a SoundCloud and a Spotify link, and a second song with only a YouTube link; a guest is enough for steps 1–4 (no sign-in), step 5 needs a member (the Record tab is a preview for guests); run once in light and once in dark.

- [ ] 1. Open the second song (only YouTube) and tap **Practice**. **Expected:** on **Listen** one button, **YouTube**, with a check mark; no SoundCloud or Spotify button. Screenshot: `docs/ux-research/screenshots/ux-v2/397/after-light/mobile/guest/01-listen-one-provider.webp`. Before: `…/397/before-light/…`.
- [ ] 2. Open the song with three links and tap **Practice**. **Expected:** buttons **YouTube · SoundCloud · Spotify** in that order, each at least 44 px tall; the chosen one has a check mark, a border and a lighter background, no red/orange/green. Tap **Spotify**: the check moves. Play the YouTube video, then tap **SoundCloud**: the check moves to SoundCloud while a speaker stays next to **YouTube** (that is what plays).
- [ ] 3. Press play on the YouTube player. **Expected:** a plain bar (not orange) appears above the bottom bar; only the round play/pause button is orange. The bar says **Playing · YouTube**, and Listen shows **Playing: YouTube Reference**. Nothing animates. Screenshot: `…/397/after-light/mobile/guest/02-player-playing.webp`.
- [ ] 4. Pause. **Expected:** both lines now say **Paused**. On the Spotify reference both lines show only the name, without Playing or Paused (Spotify does not report a pause).
- [ ] 5. As a member, tap **Record**. **Expected:** the line *Reference: YouTube video loaded* is fully readable (wraps on a narrow phone, no "…"), and the button next to it reads **Open player**. Tap it: Listen opens.
- [ ] 6. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: **Open player**, **Playing** and **Paused** are translated and fit. Repeat steps 2, 3 and 5 in dark mode (`…/397/after-dark/…`).
- [ ] 7. In the phone's accessibility settings turn on **Reduce motion** (or the OS equivalent). **Expected:** the bar appears without sliding in.

### #389 · G1.5 Unfinished features are hidden

**Preconditions:** a member account on a 390 px phone, English. Run once in light and once in dark.

- [ ] 1. Open **Library**. **Expected:** the tab row shows Playlists, Recently viewed and Artists; no Albums tab and no text "Coming soon" anywhere. Screenshot: `docs/ux-research/screenshots/ux-v2/389/after-light/mobile/member/09-library.webp`.
- [ ] 2. Open the avatar menu → **Account settings**. **Expected:** three tabs: Profile, Security, Preferences; no Privacy & Data. The Profile tab starts with **Display Name** (no grey avatar block, no badge). Screenshot: `…/389/after-light/mobile/member/15-settings.webp`. Before: `…/389/before-light/mobile/member/15-settings.webp`.
- [ ] 3. Tap **Preferences**. **Expected:** Appearance, Language, Keep Screen Awake, Auto-hide navigation bar and Email notifications; no greyed-out rows, no "Coming soon". Screenshot: `…/389/after-light/mobile/member/16-settings-preferences.webp`.
- [ ] 4. Open `/account/settings?tab=privacy`. **Expected:** the Profile tab opens (no error page, no privacy toggles).
- [ ] 5. Open `/library/albums`. **Expected:** the "Page not found" page.
- [ ] 6. Open **Create → Add song** and scroll to the end of the form. **Expected:** no "Melody notation" section with a "Coming soon" badge. Screenshot: `…/389/after-light/mobile/member/17-song-add-bottom.webp`.
- [ ] 7. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua and repeat steps 2–3: no placeholder text in any language. Repeat steps 1–3 in dark mode.

### #409 · G5.4 Auth pages without a fake close button

**Preconditions:** signed out (private window), 390 px phone, English; run once in light and once in dark. Pick any song, e.g. the first one in the list.

- [ ] 1. Open a song, tap **Sign In** in the top bar. **Expected:** the login page shows **Back** at the top left (a plain link with an arrow), the heading **Welcome back**, the form. There is no ✕ anywhere. Screenshot: `docs/ux-research/screenshots/ux-v2/409/after-light/mobile/guest/20-auth-login.webp`. Before (✕ at the top right of a card): `…/409/before-light/mobile/guest/20-auth-login.webp`.
- [ ] 2. Tap **Back**. **Expected:** you are on that song again (not on Home).
- [ ] 3. Open `/auth/login` directly (type the address) and tap **Back**. **Expected:** Home.
- [ ] 4. Open a song, tap **Sign In**, then **Join the Circle**. **Expected:** the sign-up page also has **Back** and no ✕; tapping **Back** returns to the song. Screenshot: `…/409/after-dark/mobile/guest/21-auth-sign-up.webp`.
- [ ] 5. From the login page tap **Sign in with password**, then **Forgot**. **Expected:** the page has **Back** and no ✕; **Back** returns to the login page, whose **Back** still leads to the song. Screenshot: `…/409/after-light/mobile/guest/23-auth-forgot-password.webp`.
- [ ] 6. Open **Add Song**, type a title, tap **Sign in** in the grey box, sign in with a member account. **Expected:** you land on Add Song and your title is still there.
- [ ] 7. **Back**, the links and the buttons are all at least 44 px tall and readable (no text smaller than the small grey captions). Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: **Back** is translated.

### #404 · G4.7 Recorder: level meter, count-in, time left

**Preconditions:** member account on a 390 px phone with a working microphone, English; any song; allow microphone access when asked. Run once in light and once in dark. Nothing here needs saving: discard each take.

- [ ] 1. Open a song, tap **Practice** → **Record**. **Expected:** under the clock *00:00* the line *Maximum take length: 3 minutes*; a row **Count in 3-2-1 before recording** with a switch that is on (the row is at least 44 px high). Screenshot: `docs/ux-research/screenshots/ux-v2/404/after-light/mobile/member/01-record-idle.webp` (before: `…/404/before-light/…`).
- [ ] 2. Tap the big microphone button. **Expected:** *Starting in 3*, *2*, *1* (also shown in the button) and the eight meter bars already move when you speak. Screenshot: `…/404/after-light/mobile/member/02-count-in.webp`.
- [ ] 3. After the count-in, talk, then stay silent. **Expected:** *Recording…*, the clock runs and the **level meter** below it follows your voice: louder = taller bars. Screenshot: `…/404/after-light/mobile/member/03-recording.webp`.
- [ ] 4. Stay silent for about 5 seconds. **Expected:** after 3 seconds of silence the hint *No sound yet. Check that your microphone is on and not muted.* appears under the meter; it goes away as soon as you make a sound and comes back after another 3 seconds of silence (the count-in and a pause do not count; a muted take shows the hint every time).
- [ ] 5. Record until **2:00**. **Expected:** the line under the clock changes from the limit to *1:00 left*, counting down; in the last 10 seconds it turns red and also bold (not colour alone). Pause: the bars drop to the bottom and the text stays. Screenshot: `…/404/after-light/mobile/member/04-time-left.webp`.
- [ ] 6. Let it reach **3:00**. **Expected:** the take stops by itself with the toast about the limit, and the review opens.
- [ ] 7. In review: **Expected:** the name field, then **Save Take** as one wide orange button and **Discard** as plain text below it; both at least 44 px high. Screenshot: `…/404/after-light/mobile/member/05-review.webp` (before: `…/404/before-light/…/05-review.webp`). Tap **Discard**.
- [ ] 8. Switch **Count in 3-2-1 before recording** off, tap the microphone. **Expected:** recording starts at once. Discard, close the panel, reopen it: the switch is still off.
- [ ] 9. Start with the count-in on and tap the bin during the count-in. **Expected:** the count-in stops, the recorder is back to *Ready to record* and the browser's microphone indicator goes out.
- [ ] 10. Turn on *Reduce motion* in the phone's accessibility settings. **Expected:** the microphone icon does not pulse; the bars still change height.
- [ ] 11. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the limit line, the count-in label, *Starting in n*, *n left*, the meter's name and the silence hint are translated and fit on the phone. Repeat steps 1–7 in dark mode (`…/404/after-dark/…`).

### #405 · G4.8 Publish dialog names the song and says who will hear it

**Preconditions:** member account on a 390 px phone, English. You own a take on a **public** song (call it *Song A*) and a take on a **private** song you own (*Song B*; make one from *Add song* with Private visibility and record or upload a take). Both takes are private. For step 7 also give a take on *Song A* a very long name with no spaces (rename it to 60+ letters in a row). Run once in light and once in dark. Do not tick the consent box in steps 1–5.

- [ ] 1. Open *Song A*, tap **Practice** in the bar at the bottom, tap **⋯** on your take, tap **Make Public**. **Expected:** the dialog *Publish Take Publicly* shows your take name in bold and under it *Song: <title of Song A>*. Screenshot: `docs/ux-research/screenshots/ux-v2/405/after-light/mobile/member/01-publish-public-song.webp` (before: `…/405/before-light/…/01-publish-public-song.webp`, which shows only the take name).
- [ ] 2. Read the grey panel. **Expected:** in bold *Everyone visiting this song, including guests, will be able to listen.* and below it *You can make the take private again at any time. New visitors then can't listen, but this can't undo what someone already heard or saved.* The audience sentence is a status line: a screen reader reads it out, and when the dialog first says *Checking whether the song is public…* the real sentence is read out when it replaces it.
- [ ] 3. Read the rest. **Expected:** the box *Singer Consent & Rights* and the checkbox sentence; **Publish Take** is greyed out and cannot be tapped; **Cancel**, the checkbox row and the button are each at least 44 px high.
- [ ] 4. Tap **Cancel**. **Expected:** the dialog closes; the take row shows no *Public* label (nothing changed) and the keyboard focus (or the next Tab) is on that take's **⋯** button, not at the top of the page.
- [ ] 5. Open *Song B*, **Practice**, **⋯**, **Make Public**. **Expected:** the header names *Song B*; the panel says *This song is private, so this take has no audience yet. Make the song public first, then publish the take.* — it does **not** mention guests, and there is **no Publish Take button and no checkbox**. Because you own *Song B* you also see *Make song public and continue* with three lines (lyrics become public, takes already public on this song will then be listed for everyone on the song page, nothing changes until you confirm). Screenshot: `…/405/after-light/mobile/member/02-publish-private-song.webp`. Tap **Cancel** (leave *Song B* private), or tap *Make song public and continue* when you want to continue: **Expected:** the panel changes to the guests sentence and **Publish Take** appears greyed out until the checkbox is ticked.
- [ ] 6. Back on *Song A*: open the dialog again, tick the box, tap **Publish Take**. **Expected:** the toast *Take is now public.*, the row shows **Public**. Sign out (or open a private window) and open *Song A* → **Practice**: **Expected:** it opens on the **Listen** tab; under *Public takes* your take is listed and plays for the guest, with no ⋯ menu, no drag handle, no download or share. On a song without public takes the guest sees *No public takes of this song yet.* The **Record** tab still shows the sign-in gate. Screenshot: `…/405/after-light/mobile/guest/03-guest-listen-public-takes.webp` (dark: `after-dark`). On a desktop-wide window, **Practice** also opens the guest on **Listen**. Copy the take's link (⋯ → **Copy link**) and open it signed out: **Expected:** the song page opens **Practice** on **Listen** with that take highlighted, and it plays.
- [ ] 7. With the very long take name, open **⋯** → **Make Public** on a small phone (or landscape). **Expected:** the long name wraps inside the dialog, nothing runs off the screen sideways, and you can scroll the dialog to reach the checkbox and **Publish Take**.
- [ ] 8. As the owner tap **⋯** → **Make Private**. **Expected:** the toast *Take is now private.*; the guest no longer sees the take after a reload.
- [ ] 9. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua and open the dialog on *Song A* and *Song B*: the song line, both sentences, the reversible line and the make-song-public lines are translated and wrap inside the dialog without cut-off text (Quechua still needs a native proofreader). Repeat steps 1–3 and 5 in dark mode (`…/405/after-dark/…`).

### #394 · G2.5 Auto-scroll and transpose in the reader toolbar

**Preconditions:** a 390 px phone, English, light and dark; three accounts: **musician** (`…+expert@…`), **member** and a guest (private window); a long song with chords (e.g. *Grandmother's Song of the Thousand Rivers…*) and a song in key **E** (e.g. *Danza del Cielo Curandero*); Settings → Preferences → keep screen awake on (default).

- [ ] 1. Musician: open the long song. Under the grey lines one row shows **Chords**, **A−**, **A+**, a **▶** button and a **⋯** button, all easy to hit (44 px); nothing wraps or runs off the screen. Screenshot: `docs/ux-research/screenshots/ux-v2/394/after-light/mobile/musician/01-toolbar.webp`.
- [ ] 2. Open the song in key **E**, tap **⋯**: a sheet *Reading tools* shows **Transpose** (− 0 +) and **Auto-scroll**. Tap **+** twice. **Expected:** the value reads **+2**, the line under it reads *Key F# (original E)*. Screenshot: `…/394/after-light/mobile/musician/03-tools-transposed.webp`.
- [ ] 3. Tap **Close**. **Expected:** every chord on the page is two semitones higher (first chord E → F#), the grey line reads **Key F#**, and the **⋯** button shows **+2** as text. Screenshot: `…/394/after-light/mobile/musician/04-song-transposed.webp`.
- [ ] 4. **⋯** → **Original key**. **Expected:** chords and key are as written again. Leave the song and come back: it opens in its own key (a shift is not remembered).
- [ ] 5. Long song: tap **▶**. **Expected:** the page scrolls down slowly, the button becomes **⏸**, the toolbar sticks right under the title bar and the lyrics keep scrolling under it; the bar at the bottom slides away. Screenshot: `…/394/after-light/mobile/musician/05-auto-scroll-running.webp`.
- [ ] 6. While it scrolls tap **A+**: the text grows and scrolling goes on. Open **⋯**, tap **Faster**: it speeds up (the sheet says *Speed 4 of 5*); tap **Pause** in the sheet: it stops.
- [ ] 7. Tap **▶** again, then tap on the lyrics. **Expected:** it pauses and the toolbar scrolls away with the page again. Start it once more and let it run to the end of the lyrics: it stops by itself, with the last line still on screen.
- [ ] 8. On a phone that allows it, the screen stays on and a small sun appears after **⋯** (*Screen stays on*; also a line in the **⋯** sheet). With keep screen awake off in Settings, no sun shows.
- [ ] 9. Member and guest: the row has the same buttons; the **⋯** sheet has **Auto-scroll** only, no **Transpose**.
- [ ] 10. Switch to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the buttons' names, the sheet and the speed line are translated and fit; repeat step 2 in dark mode (`…/394/after-dark/mobile/musician/02-tools-sheet.webp`).
- [ ] 11. Desktop (wide window): the same row; auto-scroll scrolls the main area and the toolbar sticks under the song title while it runs.

### #395 · G2.6 Version switch under the song title

**Preconditions:** a 390 px phone, English, light and dark; any account (a guest is enough). Songs with several versions are rare in the seed: pick one from the maintainer, or add a second version to a test song in the database and remove it afterwards.

- [ ] 1. Open a song with one version. **Expected:** the grey meta lines are followed directly by the **Chords · A− · A+** row. No switch, no gap, nothing greyed out. Screenshot: `docs/ux-research/screenshots/ux-v2/395/after-light/mobile/guest/01-song-single-version.webp` (before: `…/395/before-light/…`).
- [ ] 2. Open the song with versions *Original* and *Simplified*. **Expected:** under the grey meta lines a grey strip with two segments, **Original** (raised, underlined) and **Simplified**; both at least 44 px high; the strip fits the screen. Screenshot: `…/395/after-light/mobile/guest/02-song-two-versions.webp`; dark: `…/395/after-dark/…`.
- [ ] 3. Tap **Simplified**. **Expected:** the lyrics (and key line, if the versions differ) change at once; **Simplified** is now raised and underlined, **Original** is plain. Screenshot: `…/395/after-dark/mobile/guest/03-song-second-version.webp`. Tap **Original**: back.
- [ ] 4. Tap **A+**, then switch versions. **Expected:** the text size stays. Tap **▶** (auto-scroll): the Chords row sticks under the title bar while the switch scrolls away with the page; nothing overlaps the bar at the bottom.
- [ ] 5. Member: with *Simplified* shown, tap **Practice**. **Expected:** the takes listed belong to the shown version. Close, switch back to *Original*: the take count follows.
- [ ] 5b. Member: start a take (Practice → play), close the drawer, then switch versions. **Expected:** the take stops and the mini player disappears; nothing keeps playing. Tap **Edit** (owner): the form shows the version you were reading.
- [ ] 5c. Keyboard (tab to the switch): **→ / ←** change the version, **Home / End** jump; only one tab stop in the strip.
- [ ] 6. Reload the page. **Expected:** the first version (*Original*) is shown again (the choice is not remembered). Open the same song with `?version=<id of Simplified>` added to the address: *Simplified* is shown; an unknown id shows *Original*; tapping the switch changes the version but does not rewrite the address.
- [ ] 6b. Member (song owner): with *Simplified* shown tap **Edit**. **Expected:** the form says *Editing version: Simplified* above the fields (nothing for a one-version song). Change a word, tap **Publish Song**. **Expected:** the song opens on *Simplified* (the address ends in `?version=…`), showing your change. Edit *Simplified* in a song whose *Original* has chords but *Simplified* is lyrics only: afterwards the song still shows chords (Chords toggle, transpose, the *Has chords* filter).
- [ ] 6c. Member: Practice → **Record**, press the red button (or pick an audio file under *Upload*), close the drawer and tap the other version. **Expected:** the version does **not** switch; a message says *Finish or discard your take before switching version.* and the drawer reopens on **Record** with the take (or file and name) still there. Tap **Discard**, close the drawer, tap the other version: it switches at once.
- [ ] 7. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the control's accessible name (*Song version*, read by a screen reader) is translated; a version without a name reads *Version 2*, etc. in that language.
### #416 · G8.3 New Playlist explains private vs public

**Preconditions:** signed in as a member on a 390 px phone, English; run once in light and once in dark. A second browser (or a private window) signed out, for step 5.

- [ ] 1. Open **Library → Playlists → + New Playlist** (`/library/playlists/add`). **Expected:** the name field, then a row **Make public** with a switch that is off, then one grey line: *Private: only you can see this playlist unless you make it public.* **Create Playlist** is one wide orange button, paler (disabled) while the name is empty. Screenshot: `docs/ux-research/screenshots/ux-v2/416/after-light/mobile/member/11-playlist-add.webp`. Before: `docs/ux-research/screenshots/ux-v2/416/before-light/mobile/member/11-playlist-add.webp`.
- [ ] 2. Type a name. **Expected:** **Create Playlist** becomes active.
- [ ] 3. Tap the switch. **Expected:** it turns orange and the line becomes *Public: anyone can find and open this playlist, with or without an account.* The lock icon becomes a globe. Tap it again: back to the private line.
- [ ] 4. With the switch off, tap **Create Playlist**. **Expected:** you land on the new playlist; in **Library → Playlists** it is under *My private playlists*.
- [ ] 5. Make a second playlist with the switch on. **Expected:** it is listed under *Public playlists*; opening its link in the signed-out browser shows it. Opening the private one from step 4 signed out asks to sign in.
- [ ] 6. Open any song, tap **Playlist** in the bar at the bottom, tap **New playlist**. **Expected:** under the name field: *New playlists are private: only you can see them unless you make them public.*
- [ ] 7. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the switch label and both lines are translated and fit on the phone. Repeat step 1 in dark mode (`…/416/after-dark/mobile/member/11-playlist-add.webp`).
- [ ] 8. Clean up: delete the playlists you made in steps 4 and 5 (and the one from step 6).

### #412 · G6.3 Home welcome, search and Recently added

**Preconditions:** signed out (private window), 390 px phone, English; run once in light and once in dark. A second pass signed in as a member.

- [ ] 1. Open Home. **Expected:** the top bar has no search field (only the one on the page); under it: heading **Welcome**, one sentence about the site, a search field with a **Search** button, then **Recently added** with up to five song rows and **All songs** at the right; below that **Explore by category**. Screenshot: `docs/ux-research/screenshots/ux-v2/412/after-light/mobile/guest/01-home.webp` (dark: `…/after-dark/…`). Before (categories only): `…/412/before-light/mobile/guest/01-home.webp`.
- [ ] 2. Type a word (e.g. *agua*) in the Home search field and tap **Search** (or the keyboard's search key). **Expected:** the song list opens filtered by that word.
- [ ] 3. Go back to Home and tap the empty search field. **Expected:** the panel with **Recent searches** (the word you just used) and the category chips opens under the field; tapping a chip opens the song list for that category; tapping outside, pressing Escape (also with focus inside the panel) or tabbing away from the field closes the panel. On **Songs** the top bar still has its own search field; tapping **Search** in the bottom bar on Home opens **Songs** with that field focused and the panel open.
- [ ] 4. Tap a row under **Recently added**. **Expected:** the song opens. Tap the heart on a row: the sign-in sheet appears.
- [ ] 5. Tap **All songs**. **Expected:** the full song list. No row shows a **Draft** badge.
- [ ] 6. Check size: the search field, **Search**, **All songs** and every row are at least 44 px tall; no text is smaller than the grey captions.
- [ ] 7. Sign in as a member and open Home. **Expected:** **Your library** (favourites, drafts, my songs, new songs) and the categories; no welcome block, no Recently added; the top bar shows its search field.
- [ ] 8. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: the welcome sentence, field label, button and the **Recently added** heading are translated and fit.

### #415 · G8.2 Add Song: live chord preview and visible upload

**Preconditions:** member account on a 390 px phone, English. Run once in light and once in dark.

- [ ] 1. Open **Library → + → Add Song**. **Expected:** directly under the lyrics box two buttons side by side on one row, **Preview** and **Upload .cho / .txt**, each at least 44 px high (the Upload label may take two lines inside its button); no small link at the top of the form. Screenshot: `docs/ux-research/screenshots/ux-v2/415/after-light/mobile/member/06-song-add.webp`.
- [ ] 2. In **Lyrics & chords** type `[Dm]Abre tus alas [A7]pajaro volar`. Tap **Preview**. **Expected:** the box keeps its size; **Dm** is shown above **Abre** and **A7** above **pajaro** in the chord colour, like on a song page. The button looks pressed. Screenshot: `…/415/after-light/mobile/member/06-song-add-preview.webp`.
- [ ] 3. Tap **Preview** again. **Expected:** the editor is back with your text unchanged and nothing below the box moved.
- [ ] 4. Clear the text and tap **Preview**. **Expected:** the hint *Nothing to preview yet. Type or paste your lyrics and chords.*
- [ ] 5. Tap **Upload .cho / .txt** and pick a ChordPro file. **Expected:** title, author and lyrics are filled in; turn **Preview** on to check the chords.
- [ ] 6. Pick a file that cannot be read (e.g. a folder or an empty permission-denied file). **Expected:** the red line *Could not read that file…* (if the phone refuses to select it, skip). A text file larger than 512 KB shows *That file is too large (limit 512 KB)…* instead. Tap **Upload** again: the red line goes away.
- [ ] 7. Switch **Preview** on, leave the title empty and tap **Publish Song**. **Expected:** the editor comes back and the first empty required field is focused with its message.
- [ ] 8. Reload the page (signed out first if you like): the typed title and lyrics are still there (draft), and Preview is off.
- [ ] 9. Scroll to the end of the form. **Expected:** no Melody notation section. Switch the language to Dutch, Spanish, Italian, Russian, French, Portuguese and Quechua: both buttons and the hint are translated and the two buttons stay on one row and long labels wrap inside them. Repeat in dark mode.

### #418 · G9.2 Accessibility audit of the song page and the Practice panel

**Preconditions:** a 390 px phone; steps 1 to 5 need a keyboard (Bluetooth, or a desktop browser narrowed to 390 px); steps 6 and 7 need VoiceOver (iPhone) or TalkBack (Android). Run signed out once and as a member once, in light and in dark. The automated part (axe-core, keyboard journeys) ran in CI-style on a build and is described in `docs/ux-research/2026-11-06-a11y-audit.md`; **the screen reader pass has not been done by anyone yet**, steps 6 and 7 are it. The full checklist with a result column is section 5 of that file.

- [ ] 1. Open a song. Press **Tab** repeatedly. **Expected:** a visible focus ring moves through the header, the reader toolbar and the bar at the bottom (*Practice*, *Playlist*, *Like*) in reading order; **A−** and **A+** show a focus ring.
- [ ] 2. Focus **Practice** and press **Enter**. **Expected:** the Practice panel opens and focus is inside it; the song page behind it is not reachable with Tab. Press **Tab** many times: focus stays in the panel (and the mini player bar if one is showing), then goes back to the start. **Shift+Tab** does the same backwards.
- [ ] 3. Signed out: with focus on the **Listen** tab press **→**. **Expected:** the **Record** tab is selected and focused (the sign-in prompt shows); **←** goes back; **Home** and **End** jump to the first and last tab.
- [ ] 4. Press **Escape**. **Expected:** the panel closes and the focus ring is back on **Practice**. Repeat with the close button (✕).
- [ ] 5. Signed in as a member: open a take's **⋯** (More actions), press **Escape**. **Expected:** the sheet closes and focus is back on that **⋯** button. Open **Playlist** and the song menu (**⋯** top right) and close each with Escape: focus returns to the button you used. In the Record tab, choose **Upload File**: the big dashed area is reachable with Tab and **Enter** opens the file picker.
- [ ] 6. **VoiceOver or TalkBack, song page and Practice panel** (steps 1 to 12 of `docs/ux-research/2026-11-06-a11y-audit.md` §5): the panel is announced as a dialog named *Practice, <song>*; Listen and Record are read as tabs with *selected*; the recorder says *Recording...* and *Recording paused* when you start and pause; each sheet and dialog is announced with its title and closes with focus back where it was. Write the result per step in the audit file.
- [ ] 7. Switch the language to Dutch and repeat the recorder part of step 6: the announcements are in Dutch.
- [ ] 8. Turn on reduced motion in the phone's settings and open the site on a laptop-width window: the bars in the **Practice** button of a playing song do not move.
