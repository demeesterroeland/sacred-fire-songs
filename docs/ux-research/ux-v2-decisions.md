# UX v2: Agent Decisions (ADR-lite)

**Version:** 1.30 | **Date:** Nov 6, 2026 | **Epic:** 6.1 (#375)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.30 | Nov 6, 2026 | Added UXA-044 (Add Song preview replaces the editor in place, debounced) and UXA-045 (upload is one visible button; dead help icon and dead second Upload removed; #415). |
| 1.29 | Nov 6, 2026 | Added UXA-042 and UXA-043 (Home welcome block for guests only, wording; Recently added = 5 newest public songs; #412). |
| 1.28 | Nov 6, 2026 | Added UXA-046 and UXA-047 (New Playlist visibility switch and wording; Add to playlist sheet stays private; #416). |
| 1.27 | Nov 6, 2026 | Added UXA-032 (reader tools: where transpose and speed live, who transposes, how a shift is kept) and UXA-033 (auto-scroll: speeds, what pauses it, the sticky toolbar, stay-awake indicator; #394). |
| 1.26 | Nov 6, 2026 | Added UXA-036 (recorder: remaining-time rule, limit caption, silent-microphone hint, meter design) and UXA-037 (count-in default and memory, cancel during count-in, review buttons; #404). |
| 1.25 | Nov 6, 2026 | Added UXA-038 and UXA-039 (auth pages: where Back leads, plain page layout; #409). |
| 1.24 | Nov 6, 2026 | Added UXA-030 and UXA-031 (unfinished features hidden behind lib/features.ts, deep link of a hidden settings tab, planned preferences and melody notation; #389). |
| 1.23 | Nov 5, 2026 | Added UXA-034 and UXA-035 (Listen tab providers and status; calm mini player; #397). |
| 1.22 | Nov 5, 2026 | Added UXA-029 (Shared with me: badge on the bell only, entry as a Library row, read rules; #403). |
| 1.21 | Nov 5, 2026 | Added UXA-028 (Share dialog: private-song confirmation moves into the dialog, wording of the two effects, who the search finds; #402). |
| 1.20 | Nov 5, 2026 | Added UXA-027 (Add to playlist sheet: tap removes, New playlist inline, sheet stays open; #414). |
| 1.19 | Nov 5, 2026 | Added UXA-023 to UXA-026 (song action bar: ⋮ sheet content, hide-on-scroll rule, bottom nav height fix, bar style and copy; #393). |
| 1.18 | Nov 5, 2026 | Added UXA-022 (search suggestions: what chips do, when the panel shows, when a search is remembered; #413). |
| 1.17 | Nov 5, 2026 | Added UXA-021 (take action sheet: group order, Copy link kept, listen-only takes get no sheet, swipe on the shared sheet, #401). |
| 1.16 | Nov 5, 2026 | Added UXA-020 (bottom bar: Search target, "+" in Library, /explore gone; #408). |
| 1.15 | Nov 5, 2026 | Added UXA-019 (category grid: tag emoji and flags dropped, #388). |
| 1.14 | Nov 5, 2026 | UXA-010 now asks for confirmation (playback stopping on leaving a song is a product choice; listed in the decisions issue). |
| 1.13 | Nov 5, 2026 | Added UXA-018 (take status pills: what "Pending invite" means, Public and Shared both shown, shared-with-me rows without a count, #400). |
| 1.12 | Nov 5, 2026 | Added UXA-017 (readable labels: sentence-case copy, token colours on tested pages, guard allow-list, axe-core pin; #387). |
| 1.11 | Nov 5, 2026 | Added UXA-016 (what "Shared with me" contains and how the sharer is named, #399). |
| 1.10 | Nov 5, 2026 | Added UXA-015 (song rows drop the chord/melody/take icons and the tag links). |
| 1.9 | Nov 5, 2026 | Added UXA-010 (mini player details, #396; playback does not follow to another song). |
| 1.8 | Nov 5, 2026 | Added UXA-008 (take vocabulary in all 8 languages, incl. recorder and dialogs; "Shared with me" heading deferred to #399) and UXA-009 (internal identifiers and message key names keep legacy names), from #398. |
| 1.7 | Nov 5, 2026 | Added UXA-012, UXA-013 (Story 6.1.26 / #410: GuestGate decisions) and UXA-014 (signed-in users and public takes). |
| 1.6 | Nov 5, 2026 | Added UXA-011 (generic 404 copy and protected-prefix routing, #406). |
| 1.3 | Nov 5, 2026 | Added UXA-007 (reader text-size steps follow the #385 tokens). |
| 1.2 | Nov 5, 2026 | Added UXA-006 (song technical badges move into the expanded meta line). |
| 1.1 | Nov 5, 2026 | UXA-003 refined (grey bridge); added UXA-004 (Claude-only cross-review) and UXA-005 (`accent` = fire accent). |
| 1.0 | Nov 5, 2026 | Created the decision log for the UX v2 build (UXA-001 to UXA-003). |

Choices the build agent made on its own during UX v2. Owner decisions (UXD-1 to UXD-7) are ADRs in [`docs/design/adr/`](../design/adr/README.md). Entries marked `Confirm: yes` change behaviour, copy tone, data or permissions beyond the story text; they are listed in the GitHub issue "UX v2: decisions to confirm".

| ID | Date | Story | Decision | Confirm |
| :--- | :--- | :--- | :--- | :--- |
| UXA-001 | Nov 5, 2026 | all | Capture scripts live in `scripts/dev/ux/`, not `scripts/ux/` | no |
| UXA-002 | Nov 5, 2026 | #385 | Start from the owner's draft tokens and v2 mockups | no |
| UXA-003 | Nov 5, 2026 | #385 | Semantic tokens via Tailwind `@theme`, grey palettes remapped as a bridge | no |
| UXA-004 | Nov 5, 2026 | all | Cross-review by a different Claude model (owner: Claude models only) | no |
| UXA-005 | Nov 5, 2026 | #385 | `accent` means the fire accent; shadcn hover uses `surface-2` | no |
| UXA-006 | Nov 5, 2026 | #391 | Chords / Melody / My take badges move from the song header into the expanded meta line | yes |
| UXA-007 | Nov 5, 2026 | #390 | Reader text-size steps follow the #385 `LYRIC_STEPS` tokens (15–28 px, six steps) | no |
| UXA-008 | Nov 5, 2026 | #398 | "Take(s)" is the noun for a recording in every language, including recorder, dialogs, e-mail, list empty states and filters; "Shared with me" heading deferred to #399; Quechua needs native review | yes |
| UXA-009 | Nov 5, 2026 | #398 | Internal identifiers keep their legacy names (`myRecordings` URL param, reserved smart-playlist title, `rehearsal.*` / `recording.*` message key names) | no |
| UXA-010 | Nov 5, 2026 | #396 | Mini player: shows after play, stays on pause, reserves bar + bottom nav, one accent colour || yes |
| UXA-011 | Nov 5, 2026 | #406 | Generic 404 copy "Page not found" + plain "Go home"; only `/account`, `/admin`, `/users` redirect guests to login | yes |
| UXA-012 | Nov 5, 2026 | #410 | Guest Listen tab for consented public takes deferred until the Practice drawer restructure; RLS enforces consent now | yes |
| UXA-013 | Nov 5, 2026 | #410 | Fake demo playlists and per-card locks removed from the guest Library; add-to-playlist becomes a bottom sheet gate | yes |
| UXA-014 | Nov 5, 2026 | #410 | Signed-in users still see public takes without singer consent; UXD-2 covers guests only | yes |
| UXA-015 | Nov 5, 2026 | #386 | Song rows drop the chord / melody / take icons and the author/tag links | yes |
| UXA-016 | Nov 5, 2026 | #399 | "Shared with me" holds takes shared with me; public takes of others get their own "Public takes" list; the sharer is named by full name only; rows of others are listen only | yes |
| UXA-017 | Nov 5, 2026 | #387 | Readable labels: sentence-case copy, token colours where axe found low contrast, guard allow-list, axe-core pin | yes |
| UXA-018 | Nov 5, 2026 | #400 | Take status pills: "Pending invite" = singer without a linked profile; Public and Shared · n both shown; no count on others' takes | yes |
| UXA-019 | Nov 5, 2026 | #388 | Category grid: tags lose their emoji / flag, the category icon stays (grey) | no |
| UXA-020 | Nov 5, 2026 | #408 | Bottom bar: Search = `/songs` with the header field focused; "+" in the Library header (members only); `/explore` is a 404 | yes |
| UXA-021 | Nov 5, 2026 | #401 | Take action sheet: Rename and Download sit with Play, Copy link stays under Share, takes of others get no sheet, swipe-to-close on the shared bottom sheet, no new copy | yes |
| UXA-022 | Nov 5, 2026 | #413 | Search suggestions: top-level category chips toggle the `category` filter; panel only while the field is empty; a search is remembered on Enter, on tap and on leaving the field with ≥ 2 characters; selected chip = inverted greys + check | yes |
| UXA-023 | Nov 5, 2026 | #393 | The ⋮ sheet loses Practice, Playlist and the heart (they live in the action bar); desktop header keeps its buttons and its Practice opens on Record | yes |
| UXA-024 | Nov 5, 2026 | #393 | Action bar hides on scroll down only when the auto-hide preference is on; 8 px jitter threshold, always visible near the top | no |
| UXA-025 | Nov 5, 2026 | #393 | `--bottom-nav-height` reports 3.5rem whenever the nav is on screen (it was 0 with auto-hide off, so bars overlapped the nav) | no |
| UXA-026 | Nov 5, 2026 | #393 | Action bar style and copy: Practice in accent text with take count, Playlist and Like in grey, new short labels "Playlist" / "Like" / "Liked"; members reuse the playlist popover until #414 | yes |
| UXA-027 | Nov 5, 2026 | #414 | Add to playlist sheet: tap on a check removes the song, "New playlist" opens a name field in the first row, the sheet stays open until Done | yes |
| UXA-028 | Nov 5, 2026 | #402 | Share dialog: the private-song confirmation lives inside the dialog and lists both effects; the song becomes public when the owner confirms, before a member is picked | yes |
| UXA-032 | Nov 6, 2026 | #394 | Reader tools: transpose and speed live in a ⋯ bottom sheet (toolbar keeps Chords · A− · A+ · ▶ · ⋯), only musician / expert / admin transpose, the shift is per song and not stored, key shown on the meta line, range ±11 | yes |
| UXA-033 | Nov 6, 2026 | #394 | Auto-scroll: five speeds, a touch / wheel / paging key outside the reading tools pauses it, it stops when the end of the lyrics is on screen, the toolbar sticks under the title bar only while it runs, the stay-awake indicator shows only while the browser really holds the lock | yes |
| UXA-034 | Nov 5, 2026 | #397 | Listen tab: one button per provider with a link, also for a single provider; chosen = surface + border + check (no brand colours); a status line says what plays and whether it is paused | yes |
| UXA-035 | Nov 5, 2026 | #397 | Mini player: plain surface bar, grey progress, accent only on the play button, equalizer and pulsing dot removed, subtitle "Playing · name" / "Paused · name"; "Control Track" becomes "Open player" | yes |
| UXA-029 | Nov 5, 2026 | #403 | Shared with me: the unread badge stays on the bell only (account menu and Library entries say "n new" in words), the Library entry is a row under the tabs (not a fifth tab), one row per take, opening Practice marks the song's notifications read | yes |
| UXA-030 | Nov 6, 2026 | #389 | Unfinished features hide behind one list of switches (`lib/features.ts`), all off: avatar block, Privacy & Data tab, planned preference rows. The "Coming soon" labels and their message keys are deleted; code and routes stay. A `?tab=privacy` link opens Profile like any unknown tab. | yes |
| UXA-031 | Nov 6, 2026 | #389 | Two placeholders beyond the story text are hidden too: the three disabled Preferences rows (auto-scroll, default chords, offline mode) and the "Melody notation" section of the song form. | yes |
| UXA-036 | Nov 6, 2026 | #404 | Recorder: `m:ss left` from 2:00 on (not "2:41 left"), the limit in words before recording, a "No sound yet" hint after 3 s, meter = 8 bars of recent levels | yes |
| UXA-037 | Nov 6, 2026 | #404 | Recorder: count-in on by default and remembered per device, cancel during the count-in, Save full-width primary with Discard as a text button below | yes |
| UXA-038 | Nov 6, 2026 | #409 | Auth pages: "Back" leads to the hardened `next=` target, else Home; a `next` pointing at another auth page counts as none (no loop); the ✕ is removed, not repurposed; forgot-password's Back returns to login and keeps `next` | no |
| UXA-039 | Nov 6, 2026 | #409 | Auth pages are plain pages on tokens: Back link above the form, no card on phones, bordered panel from `md`, accent-soft flame badge instead of the orange gradient and glow; sign-up-success and error pages are not touched | no |
| UXA-042 | Nov 6, 2026 | #412 | Home welcome block (heading, one line, search field, Recently added) is for guests only; members see Your library and nothing else new; the welcome copy is new; on Home the header search field is hidden for guests (one field, not two) | yes |
| UXA-043 | Nov 6, 2026 | #412 | Recently added = the 5 newest **public** songs (explicit `is_public` filter on top of RLS, no RLS change), newest first, *All songs* link, row hidden when empty; Home search reuses the G7.1 panel | no |
| UXA-044 | Nov 6, 2026 | #415 | Add Song preview: a toggle swaps the lyrics editor for the song page renderer in the same 400 px box (no layout jump), debounced 200 ms, off by default and not remembered; empty text shows a hint | no |
| UXA-045 | Nov 6, 2026 | #415 | Add Song upload: one visible secondary button under the lyrics opens the file picker at once; the top link, the info panel with a dead second Upload button and the dead help icon are removed; a failed read shows an error | no |
| UXA-046 | Nov 6, 2026 | #416 | New Playlist: a Make public switch (off by default) and one line that follows it, worded from what RLS does (private: only you; public: anyone, with or without an account); any member may create public | yes |
| UXA-047 | Nov 6, 2026 | #416 | Add to playlist sheet keeps creating private only and says so under the name field; the shared `Switch` moves to semantic tokens (affects Settings → Preferences look) | no |


---

### UXA-001 · Capture scripts path

- **Date / story:** Nov 5, 2026 · all stories
- **Context:** the build prompt names `scripts/ux/capture-*.mjs`; the scripts moved to `scripts/dev/ux/` (scripts layout contract, `docs/ux-research/README.md` v1.2).
- **Options:** (a) move them back; (b) use `scripts/dev/ux/`.
- **Choice:** (b). Screenshots for UX v2 go to `docs/ux-research/screenshots/ux-v2/<issue>/` via `UX_OUT`.
- **Consequences:** none for the app.
- **Confirm:** no

### UXA-002 · Draft tokens and mockups as the starting point

- **Date / story:** Nov 5, 2026 · #385 (G1.1)
- **Context:** an unpublished draft from Nov 4 (`docs/design/screens/v2/`: `tokens.css`, design-system sheet, song page, song list, practice drawer, home, playlist sheet) already turns report §5 into values: warm greys, accent `#c23a0c` / `#ff6a2b` (dark), type 12–28 px, spacing 4–32, radius, one sheet shadow, measured contrast.
- **Options:** (a) design new values; (b) adopt the draft and make it theme-ready (UXD-7).
- **Choice:** (b). Values are kept; names become semantic and are scoped by `data-style="sober"`.
- **Consequences:** the mockups are the visual reference for every restyle story.
- **Confirm:** no

### UXA-003 · Semantic tokens in Tailwind, palette remap as a bridge

- **Date / story:** Nov 5, 2026 · #385 (G1.1)
- **Context:** about 90 components use Tailwind palette classes (`gray-*`, `red-*`, `amber-*`, `indigo-*`). UXD-7 requires components to use semantic tokens only, but each restyle story owns its own screens.
- **Options:** (a) rewrite all components in #385; (b) expose semantic utilities (`bg-surface`, `text-muted`, `text-accent`, …) and leave palette classes to the restyle stories; (c) (b) plus map the Tailwind `gray` scale to the sober warm greys so untouched screens already look calmer.
- **Choice:** (b) + (c) for the grey palettes only: `gray/slate/zinc/neutral/stone-*` render as warm sober greys with the same lightness as Tailwind's (contrast unchanged). Hue palettes (`red`, `amber`, `indigo`, …) are not remapped, because some of them still carry meaning; each restyle story converts its own files. The ratchet test `paletteRatchet.test.ts` (baseline 3081 at #385) only lets the count go down.
- **Consequences:** untouched screens already read calmer; colourful accents remain until their story lands.
- **Confirm:** no

### UXA-004 · Cross-review with Claude models only

- **Date / story:** Nov 5, 2026 · all stories
- **Context:** the build prompt asks for a reviewer from a different model family (Gemini for Claude-authored work). The owner then said to use only Claude models.
- **Options:** (a) Gemini review; (b) a different Claude model than the author.
- **Choice:** (b). Opus-authored work is reviewed by Sonnet; Sonnet- or Haiku-authored work by Opus. The reviewer gets the diff, the Gherkin and the quality bar, not the author's conclusions.
- **Consequences:** less model diversity; mitigated by the blind brief.
- **Confirm:** no

### UXA-005 · `accent` means the fire accent

- **Date / story:** Nov 5, 2026 · #385 (G1.1)
- **Context:** shadcn-style primitives use `bg-accent` for a hover grey; UXD-7 names the fire orange `--accent`.
- **Options:** (a) rename the fire token; (b) keep `--accent` = fire and move shadcn hovers to `bg-surface-2`.
- **Choice:** (b), done in `components/ui/dialog.tsx` and `dropdown-menu.tsx`.
- **Consequences:** new code must not use `bg-accent` for hover states (documented in `design-tokens.md` §4).
- **Confirm:** no

### UXA-006 · Song technical badges inside the meta line

- **Date / story:** Nov 5, 2026 · #391 (G2.2)
- **Context:** the story asks for one grey meta line and one technical line; the CHORDS / MELODY / RECORDING badges were a third coloured row on the song page (phone and desktop header).
- **Options:** (a) keep them as a third line; (b) add them to the technical line; (c) show them as links only when the meta line is expanded.
- **Choice:** (c). The chords are visible in the lyrics anyway; the links (filter by chords/melody/my takes) stay one tap away. Practice entry points come with #393.
- **Consequences:** the song page no longer shows a "has my take" badge at a glance until the Practice bar (#393) lands.
- **Confirm:** yes

### UXA-007 · Reader text-size steps follow the design tokens

- **Date / story:** Nov 5, 2026 · #390 (G2.1)
- **Context:** the story text names five steps from 14 to 26 px; the tokens merged with #385 define `LYRIC_STEPS` = 15, 17, 19, 21, 24, 28 px (default 17) and `MIN_FONT_PX` = 12.
- **Options:** (a) a second scale for the toolbar; (b) use the token scale.
- **Choice:** (b). One source of truth; chords run at 70 % of the lyric size and never below 12 px. The old disabled "Large Stage Font" preference had no stored value, so it is removed without a migration. The disabled "Show chords by default" row stays until #389 hides unfinished features.
- **Consequences:** six steps instead of five; the smallest lyric size is 15 px, not 14.
- **Confirm:** no

### UXA-011 · Generic 404 copy and protected-prefix routing

- **Date / story:** Nov 5, 2026 · #406 (G5.1)
- **Context:** the proxy sent every path outside a public allowlist to login, so an unknown URL looked like a login-gated page. The generic 404 reused the song copy "Song Not Found".
- **Options:** (a) keep the allowlist and add a 404 check; (b) invert it: only a short list of protected prefixes redirects, everything else falls through to `app/not-found.tsx`.
- **Choice:** (b). The list is `PROTECTED_PATH_PREFIXES` in `lib/supabase/routeAccess.ts` (`/account`, `/admin`, `/users`: exactly the existing routes that were not on the allowlist, so nothing opens that was protected). Prefixes match whole segments (`/admin-x` is a 404). Copy: "Page not found", a one-sentence warm line, and a plain "Go home" button in all 8 locales. The song (`app/songs/[id]`) and recording (`app/recordings/[id]`) not-found pages keep their own copy. Private playlists and unknown user ids now show the generic 404 instead of "Song Not Found". Pages under `/library`, `/songs`, `/recordings`, `/playlists` still guard themselves.
- **Consequences:** unknown paths now answer 404 for everyone, including static files in `public/` that the old allowlist hid from guests. Routing only; RLS is unchanged. The guest gate (#410) can reuse the constant. The warm sentence ("The fire is still burning ...") is a copy-tone choice to confirm.
- **Update (#410, Nov 5, 2026):** `/account` and `/users` left the list; those pages render the GuestGate for guests (UXA-012..014). The list is now `/admin` only.
- **Confirm:** yes

### UXA-012 · Guest Listen tab for public takes deferred

- **Date / story:** Nov 5, 2026 · #410 (G6.1)
- **Context:** UXD-2 says guests may listen to consented public takes in Practice → Listen. #410 only asks for the GuestGate pattern and the Record-tab gate; the drawer (`RehearsalDrawer.tsx`, ~1700 lines) is being renamed and restructured by #398 (G4.1) and later #399/#400.
- **Options:** (a) wire a guest takes list into the drawer now; (b) enforce the rule in RLS now and wire the list after the drawer restructure.
- **Choice:** (b). Migration `20261105120000` makes anon reads (table and storage) require `is_public AND singer_consent_confirmed`, proven by an `@seed` scenario. The guest Listen list is a follow-up on top of the new drawer; until then guests see reference tracks only (unchanged).
- **Consequences:** the data rule is enforced server-side already; no guest UI exposes takes yet. Follow-up issue: "Guests: list consented public takes in Practice → Listen".
- **Confirm:** yes (permissions)

### UXA-013 · Removing the fake demo playlists and per-card locks from the guest Library

- **Date / story:** Nov 5, 2026 · #410 (G6.1)
- **Context:** the guest Library showed four locked smart-playlist cards and two hard-coded demo private playlists ("Yage Ceremony 2024", "Temazcal — Water Songs", English only, not translated).
- **Options:** (a) keep them and restyle; (b) replace them with one GuestGate (`smartPlaylists`) and keep the public playlists below it.
- **Choice:** (b): one pattern, no untranslated fake content, one sign-in button instead of three. Dropped keys: `playlists.guest.*`, `playlists.membersOnly`, `playlists.signInToCreate`, `rehearsal.guest.*`, `song.signInForPlaylists`, `song.signInAction` (all locales).
- **Consequences:** guests no longer see a "ghost" of what a private playlist looks like; the blurred placeholder rows are generic. The song-page add-to-playlist prompt for guests changes from a toast to a bottom sheet with the same gate (`addToPlaylist`).
- **Confirm:** yes (behaviour, copy)

### UXA-014 · Signed-in users still see public takes without singer consent

- **Date / story:** Nov 5, 2026 · #410 (G6.1), found in review
- **Context:** UXD-2 says public takes are listenable by guests only when the singer consented. Migration `20261105120000` tightens the `anon` policies, but the `authenticated` policy on `user_recordings` still reads `is_public = true` (no consent check), so a signed-in user can read a public take without singer consent that a guest cannot.
- **Options:** (a) tighten the `authenticated` policy too (RLS change beyond the story); (b) leave it, log it, ask the owner.
- **Choice:** (b). UXD-2 as written covers guests; the story does not authorise further RLS changes.
- **Consequences:** a public take without consent is visible to members but not to guests. Owner to decide whether members should follow the same rule; then a follow-up migration is needed.
- **Confirm:** yes (permissions)

### UXA-008 · "Take" as the one noun, in every language

- **Date / story:** Nov 5, 2026 · #398 (G4.1)
- **Context:** the story names the heading "My takes", the badge "Takes", the smart playlist "Your takes" and the guest card "Practice recorder". The same audio items were also called "recordings" in filters, empty states, the toast action, the recorder (Save / Preview / name placeholder), delete / share / publish dialogs, the share e-mail, the mini-player source group and the not-found page.
- **Options:** (a) rename only the six places named in the story; (b) rename every user-visible noun for the item. Verbs and progress states ("Start recording", "Recording...", "Recording paused") stay: the user is recording, the result is a take.
- **Choice:** (b), after review (first pass kept "Save Recording" and similar). Now "Save Take", "Delete take?", "Share take", "Publish Take", "My take" (fallback mini-player label), and the e-mail says "practice take". Dropdown group headings in the mini-player follow the names elsewhere: the reference group is headed **Listen** (the tab name; the old "Reference Tracks" label is removed) and the takes group **My takes**. Translations: nl "take(s)", es "toma(s)", it "take", ru "дубль/дубли", fr "prise(s)", pt "take(s)", qu "toma(kuna)" (one form: Tomakuna). Practice → nl Oefenen, es Práctica, it Pratica, ru Практика, fr Pratique, pt Prática, qu Yachakuy. ru guest card: "Диктофон для практики".
- **Deferred:** the "Shared with me" list heading in the drawer still follows the old wording where it exists; renaming and splitting that list belongs to #399 (G4.2, takes shared with me listed separately), so no code changes here.
- **Consequences:** the owner should have a native speaker check the Quechua and Russian terms before release.
- **Confirm:** yes (copy tone in 7 languages)

### UXA-009 · Internal identifiers keep legacy names

- **Date / story:** Nov 5, 2026 · #398 (G4.1)
- **Context:** the old names also exist as identifiers: the `?myRecordings=true` URL param, the reserved smart-playlist title `My Recordings` (`lib/playlists/smartPlaylists.ts`), `rehearsal.*` message keys and the `RehearsalDrawer` component.
- **Options:** (a) rename all; (b) rename only user-visible copy and message keys that embedded an old name.
- **Choice:** (b). Renaming the URL param would break saved links; the reserved title only blocks users from creating a playlist with that name. Message keys that carried the old name as a *label* (`rehearsal.title`, `rehearsal.tab.*`, `song.recordings`, …) moved to `practice.*`. Keys whose *value* was reworded to "take" (`recorder.btn.save`, `recording.sharing.*`, `recording.publish.*`, `email.recordingShared.*`, `feedback.notFound.recording.*`, `miniPlayer.source.userRecording`, …) keep their key names so the diff stays reviewable; only the visible values changed.
- **Consequences:** a later cleanup can rename the component and the remaining `rehearsal.*` / `recording.*` keys.

### UXA-010 · Mini player: when it shows, what it reserves, how it looks

- **Date / story:** Nov 5, 2026 · #396 (G3.1)
- **Context:** UXD-5 says "only after play" but not what pause, stop, switching source or the bottom nav do, and the old bar used orange for reference tracks and indigo for takes.
- **Options:** (a) hide on pause; (b) keep the bar after play until stopped; reserve only the bar height; (c) reserve bar height plus the bottom nav it sits on.
- **Choice:** (b) and (c). The bar stays when paused or when the Practice drawer closes, and goes away on stop (✕), when the take is removed, when the user opens another song, or on a fresh page. `--mini-player-h` = bar height + bottom nav, so sheets, the drawer and the page clear the whole stack. One accent colour for every source (the label names the source), 44 px controls, equalizer only under `motion-safe`. A reference track counts as started as soon as the user presses its play (or the player reports playing), not only when the iframe confirms.
- **Consequences:** playback never follows the user to another song. Reference tracks stop when the iframe unmounts; the drawer also stops its own active take on unmount, and the bar ignores a take that is not in this song's recordings (`AudioProvider` is global). Stop (✕) acts on what the bar shows. The old source colours (indigo for takes) are gone.
- **Confirm:** yes (music stops when the user leaves the song; the bar never carries over)

### UXA-015 · Song rows without indicator icons and tag links

- **Date / story:** Nov 5, 2026 · #386 (G1.2)
- **Context:** the old cards had coloured author/tag pills (each a filter link) and amber/green/violet icons for chords, melody and "my take". The story asks for title + one grey meta line + key badge and at most two coloured elements per row.
- **Options:** (a) keep the icons in grey; (b) drop them; filtering by chords / melody / my takes stays in Search options.
- **Choice:** (b). The meta line is plain text; the whole row opens the song. Heart (accent when set) and add-to-playlist stay. Artist rows in Library show the song count and titles on the meta line.
- **Consequences:** a list no longer shows at a glance which songs have chords, melody or a take of yours; one tap fewer to filter by an author or tag from the list.
- **Confirm:** yes

### UXA-016 · What "Shared with me" contains and how the sharer is named

- **Date / story:** Nov 5, 2026 · #399 (G4.2)
- **Context:** the story splits the Record tab in "My takes" and "Shared with me". The take query returns more than those two groups: signed-in users also see public takes of other users (UXA-014). A recipient can read the profile of a take's owner only through the share policy.
- **Options:** (a) a third list for public takes of others; (b) show them under "Shared with me"; (c) hide them in the drawer.
- **Choice:** (a), after review: under "Shared with me" a public take nobody shared looked shared, and a sharer's unrelated public takes read "Shared by X". A take counts as shared when the recipient has a share row for it (or it is private and still readable, which only a share allows); other public takes go to **Public takes**. The row says **Shared by {name}** with the owner's full name only; the e-mail is never shown (profile reads are not meant for display, and admins can read every profile). Without a name the row says "Shared with you"; public rows keep the date and length (on a shared row the date is dropped so the name is not cut off at 390 px), and a share without a readable name says "Shared with you" in words. Shared rows are listen only: no ⋯ menu, no rename; the 14 px people icon is removed because text now says it. The mini-player source menu uses the same groups. No migration, no RLS change.
- **Consequences:** one extra query (the recipient's share rows for the listed takes). If the owner prefers fewer headings, public takes of others can move back under "Shared with me" in `partitionTakes`.
- **Confirm:** yes (a third list "Public takes" in the Record tab)

### UXA-017 · Readable labels: copy case, colours fixed for contrast, guard scope

- **Date / story:** Nov 5, 2026 · #387 (G1.3)
- **Context:** axe-core `color-contrast` on `/`, `/songs`, a song page and `/library` (390 px, light and dark) found low contrast beyond the uppercase micro-labels: bottom-bar labels (`gray-400` / `red-400` on white), sidebar group labels, playlist-card sub-lines with green/amber counts on tinted cards, and the red "New" button. Several English section titles were Title Case.
- **Options:** (a) only restyle the micro-labels; (b) also fix what axe reports on those four pages; for text outside them follow the same rule where the touched line allowed it.
- **Choice:** (b). English section titles become sentence case (other locales already were): "Your library", "Explore by category", "Public / Smart / My private playlists", "Recently viewed", "New since last visit". Bottom bar uses `text-accent` (active) and `text-fg-muted`. Playlist card counts lose their green/amber colour (the words "public" / "draft" carry the meaning). The "New" button and the amber/red badges become neutral outline / `surface-2` badges. Two hard-coded strings on touched lines ("or enter code", "Match any") became message keys in all 8 locales. The unit guard (`lib/design/labelAudit.ts`) allows only `components/song/RehearsalDrawer.tsx`, which #399 and #400 rework and will clean up (remove the allow-list entry then). `@axe-core/playwright` is pinned at 4.14.0 (released Oct 15, 2026).
- **Consequences:** a few colour accents on Library cards and badges are gone (greyscale + one accent); `text-accent` on `accent-soft` is 4.48:1 in light, so accent text must not sit on `accent-soft` — use `text-fg` or `text-fg-muted`. Pages other than the four tested ones are only covered by the 12 px guard, not by axe.
- **Confirm:** yes

### UXA-018 · Take status pills: what each label means

- **Date / story:** Nov 5, 2026 · #400 (G4.3)
- **Context:** the story asks for the texts "Public", "Shared · 2", "Pending invite" and "Verified musician" next to the status icons. The old row showed either the globe or the people icon (never both), only the owner knows the share count, and no invite state exists in the data: a singer attribution without an account is stored as `singer_name` / `singer_email` with no `singer_profile_id`, and no invitation e-mail or accept step is recorded.
- **Options:** (a) add an invite status table or column; (b) keep the existing meaning of the old "Pending Invite" badge (attribution to a singer without a linked profile) and label it in words; (c) drop "Pending invite".
- **Choice:** (b). No migration, no invented state. "Pending invite" = singer named without a linked profile (the old clock icon, now a text pill); it disappears once the attribution links a profile. A public take that is also shared shows both **Public** and **Shared · n** (the old row hid the share count when public). Takes of other users never show a count (it is not readable for them; the row says "Shared by …"). "Verified musician" = singer linked to a profile with role musician or expert (the old amber check). Private and unshared stays unmarked. The pills are grey (chip tokens), so the amber/green/indigo colours of the old icons are gone; the missing-file badge is grey text too. Old key `recording.attribution.badgePending` is no longer used by the row (kept for now); the pills use new `recording.status.*` keys in sentence case. Review fixes: "Pending invite" shows only to the owner (it is their to-do; other viewers see no singer pill); the visible "Shared · n" is `aria-hidden` and a visually hidden "Shared, number of people: n" is read instead; it/pt/ru use the masculine form that matches "take" / "дубль" (the older publish / private labels in pt and ru follow; fr labels follow the feminine "prise").
- **Consequences:** "Pending invite" can be read as "an e-mail was sent"; today it only means the singer has no account yet. If real invites are built later, the pill should follow that state.
- **Confirm:** yes (copy, and the share count now also shows on public takes)

### UXA-019 · Category grid: no emoji on tags

- **Date / story:** Nov 5, 2026 · #388 (G1.4)
- **Context:** the story asks for monochrome icons and tags as plain text links with a count. Tags carried an emoji (🔥, 💧, country flags); emoji are always in colour.
- **Options:** (a) keep the emoji next to the text; (b) drop the emoji on tags and keep only the category icon (Lucide, grey); (c) render the emoji in greyscale.
- **Choice:** (b). Tags show name + grey count only. A category without a Lucide icon falls back to its emoji with the CSS `grayscale` filter. `TagPill` stays in use elsewhere (song rows, filters); only the home grid stops using it.
- **Consequences:** the language tags no longer show flags on the home page; the language name carries the meaning.
- **Confirm:** no

### UXA-020 · Bottom bar: where Search goes, where "+" sits, what `/explore` becomes

- **Date / story:** Nov 5, 2026 · #408 (G5.3, owner decision UXD-1)
- **Context:** UXD-1 fixes the bar as Home · Search · Library, Create inside Library as a "+", `/explore` redirect removed. It does not say what Search opens, where the "+" lives, whether guests see it, or what the old URL answers.
- **Options:** Search: (a) a new search page; (b) the existing song list `/songs` with the header search field focused; (c) the global search modal. "+": (a) top of the Library page; (b) a floating button; (c) per tab. `/explore`: (a) real 404; (b) keep a redirect.
- **Choice:** Search = (b): the tab links to `/songs` and the tap focuses the always-visible header field (the song list is where results already show, and Story 1.1.9 words it that way). Search stays highlighted on song pages; Library on every `/library/*` page; only one item is ever active. "+" = (a): a 44 px outline button right of the Library title (phones only; from `lg` the header Create menu does the same), opening a bottom sheet with Add Song and New Playlist. Guests see no "+" (the Library already shows a locked preview with Sign in), replacing the old "sign-in nudge" on the Create tab. `/explore` = (a): the route is deleted, so it answers 404 with the page from #406; the sign-up fallback that pointed at it now goes to Home. `nav.explore` is deleted from all 8 locales; new `nav.search` has real translations. The red top-edge glow of the bar is removed (greyscale + one accent).
- **Consequences:** Old bookmarks and links to `/explore` now show "Page not found". Contributors need two taps (Library, "+") instead of one. Library's `+` is not on the Playlists detail pages (breadcrumb view).
- **Review note:** a tap before the page has hydrated is a plain link, so the song list opens without focusing the field (graceful, not broken). Search always opens the full list, so an active `?tag=` filter is dropped.
- **Confirm:** yes (guests lose the Create nudge; `/explore` 404s)

### UXA-021 · Take action sheet: groups, listen-only takes, swipe

- **Date / story:** Nov 5, 2026 · #401 (G4.4)
- **Context:** the story lists the groups as "Play / Rename · Share / Singer / Make public · Download · Delete (red, separated)" and says shared-with-me takes "show only Play". The old menu had one more action, **Copy link** (deep link to the take), and the shared `BottomSheet` (#385) had a drawing of a handle but no gesture. Rows of other people already had no ⋯ button (#399).
- **Options:** (a) follow the story's order literally (Download as its own group); (b) put Play, Rename and Download together as "this take", Share-type actions together, Delete alone; for takes of others (c) show a ⋯ that opens a sheet with only Play, or (d) keep no ⋯ and let the row's play button be the one action.
- **Choice:** (b) and (d). Groups: **Play / Pause, Edit take name, Download take** · **Share, Singer Attribution, Make Public / Make Private, Copy link** · **Delete take** alone, in `text-danger` with the word "Delete take" (colour never alone), after a divider and at least three rows away from Share. A sheet with one row (Play) would be an extra tap for nothing, so shared and public takes keep only their play button. Copy link is kept (dropping it would remove a feature) in the share group. The shared `BottomSheet` now has a 32 px handle on phones that follows a swipe down and closes the sheet (80 px, or a 30 px flick faster than 0.5 px/ms; a tap does nothing); Esc and the scrim also close it. Rows reuse the existing labels ("Edit take name", "Download take", "Delete take"), so no new copy and no new keys in the 8 locales. The chosen action runs after the sheet has closed, so two dialogs never overlap (rename focuses the name field, Share / Singer / Publish open their dialogs, Delete opens the same confirmation as before). The ⋯ trigger grew from about 28 px to a 44 px target.
- **Consequences:** every `BottomSheet` on a phone gets the swipe handle and a taller (32 px) top area; the sheet title on touch is the take name. Playing from the sheet and from the row stay equal. The "Edit take name" row opens an inline field on the row, not a dialog.
- **Confirm:** yes (Rename and Download moved into the first group; swipe on every bottom sheet)

### UXA-022 · Search suggestions: what a chip does, when the panel shows, when a search is remembered

- **Date / story:** Nov 5, 2026 · #413 (G7.1)
- **Context:** the story asks for the last 5 searches and the top-level categories as chips when the search field is focused. It does not say what a chip tap does, when the panel is shown, when a search counts as "searched" (the field live-searches, so Enter is optional), or how a selected chip looks. The brief also says "the accent only marks the selected state", while the Chip primitive of the component sheet marks selection with inverted greys plus a check.
- **Options:** chip tap: (a) set the category filter and keep other filters; (b) open the category's page; (c) put the category name in the field. Panel: (a) only while the field is empty; (b) always on focus. Remembering: (a) Enter only (as before); (b) also when the person leaves the field with a term; (c) every debounced live search. Selected chip: (a) the Chip primitive as is; (b) accent fill.
- **Choice:** chip = (a): it toggles `category=<slug>` on `/songs`, keeps the other URL filters (sort, tag, …) and drops the search term (the panel only shows with an empty field); a second tap removes it, so a chip both narrows and un-narrows in one tap. Only top-level categories are chips (the tags stay on the Search options sheet and the home grid). Panel = (a): while the field holds text the person is typing, not choosing; with no recent searches it shows the chips alone. Remembering = (b): Enter, tapping a suggestion and leaving the field with at least 2 characters (a half-typed "a" is not kept); (c) would store "ag", "agu", "agua". Selected chip = (a): the component sheet's inverted greys + check + `aria-pressed` (colour never alone); the accent stays on the focus ring. Older builds stored up to 8 searches: only 5 are shown, and the list is cut to 5 on the next write. "Clear all" and the per-search remove reuse the existing `header.clearAll` and `common.remove` keys; the category heading reuses `search.categories.heading`. The panel is full width under the top bar on phones (the field itself is only about 230 px wide there). The header search field and its filter button were moved to tokens and 44 px targets because they are the focus state's anchor.
- **Consequences:** searches are stored on this device only (no account, no server). Picking a chip drops the old `tag` filter (tags belong to a category). ArrowDown from the field skips "Clear all", so ArrowDown + Enter never wipes the history (review). Focusing the field when it already holds the current search (`/songs?search=agua`) shows no panel until the text is cleared (Esc clears it).
- **Confirm:** yes (more searches are remembered than before; the field's look changes)

### UXA-023 · What stays in the ⋮ sheet; desktop unchanged

- **Date / story:** Nov 5, 2026 · #393 (G2.4)
- **Context:** the story says the ⋮ sheet "keeps secondary actions (share song, edit, delete)". It does not say whether Practice, Add to playlist and Like stay there as duplicates. On desktop (`lg`) the bar is not shown; the header already has Practice, Playlist, ♥ and Share.
- **Options:** (a) keep duplicates in ⋮; (b) move the three actions out of ⋮ and leave only share, edit, delete; (c) also change the desktop Practice button to open on Listen when media exists.
- **Choice:** (b) for phones. Two ways to the same action cost screen space and invite "which one?"; the bar is always in reach. Desktop is not touched (no bar there; the header buttons stay and Practice there still opens on Record), so the Listen-first rule is a phone rule for now. A guest's ⋮ sheet therefore shows only **Share Song**.
- **Consequences:** every E2E spec that reached Practice, Playlist or the heart through ⋮ now uses the bar (`e2e/fixtures/songActions.ts`, `song-action-*` test ids). Desktop and phone differ on the Practice start tab until someone decides to unify them.
- **Confirm:** yes (changes where actions live and the desktop/phone difference)

### UXA-024 · When the action bar hides

- **Date / story:** Nov 5, 2026 · #393 (G2.4)
- **Context:** "hides on scroll down, shows on scroll up (respects the auto-hide preference)". The preference is the existing Settings → Preferences switch `autoHideBottomNav` (it also hides the bottom nav after 3 s of inactivity).
- **Options:** (a) the bar follows the nav's inactivity timer; (b) the bar hides on scroll direction only while the preference is on and never hides while it is off.
- **Choice:** (b). Scroll direction is measured against an anchor that moves only after 8 px, so slow scrolling still counts and jitter does not flicker; within 48 px of the top the bar always shows. A hidden bar leaves the tab order and the accessibility tree (`visibility: hidden` after the slide). The page reserves the bar's height (`--action-bar-h`) while it is mounted, whether it is shown or not, so the end of the song never jumps.
- **Consequences:** with the preference on, the nav (inactivity timer) and the bar (scroll direction) hide for different reasons and can be out of step for a moment.
- **Confirm:** no

### UXA-025 · Bottom nav height variable was 0 with auto-hide off

- **Date / story:** Nov 5, 2026 · #393 (G2.4)
- **Context:** `MobileBottomNav` published `--bottom-nav-height` as 3.5rem only when it was on a song page, visible **and** the auto-hide preference was on. With the preference off the nav is always on screen but the variable was 0, so the mini player (#396) already sat on top of the nav and the new action bar would have done the same.
- **Options:** (a) leave it and compute the bar position differently; (b) publish the nav's real on-screen height (`bottomNavHeight(isVisible)`).
- **Choice:** (b), a one-line change in `components/common/MobileBottomNav.tsx` plus `bottomNavHeight()` in `lib/song/actionBar.ts`. The bar sits at `max(--mini-player-h, --bottom-nav-height) + safe-area inset`, so it clears the nav and rises above the mini player (whose own height already includes the nav).
- **Consequences:** from `lg` the nav is hidden by CSS, so the variable is 0 there (review: otherwise desktop pages padded 56 px extra under the mini player). #408 rewrites the bottom nav in parallel; whoever merges second must keep publishing the nav's real height in `--bottom-nav-height` (see `testing/unit/tests/songActionBar.test.ts`, `e2e/tests/ux-v2-song-action-bar.spec.ts`).
- **Confirm:** no

### UXA-026 · Bar style and copy

- **Date / story:** Nov 5, 2026 · #393 (G2.4)
- **Context:** the story fixes the three actions, not how they look or what they say. Design rules: greyscale plus one accent, 44 px targets, labels at least 12 px, colour never alone. The mini player (#396) is already an accent-filled bar.
- **Options:** (a) Practice as an accent-filled button; (b) icons only; (c) icon plus text label, Practice in accent text.
- **Choice:** (c). `Toolbar` / `ToolbarButton` primitives, three equal thirds, icon and 13 px label side by side. Practice is accent text with the number of takes in a grey chip (so an accent fill does not stack on the accent mini player); Playlist is grey; the heart is a grey outline that becomes a filled heart with the label **Liked** (shape and word change, not only colour). New keys `songBar.toolbar` ("Song actions"), `songBar.playlist`, `songBar.like`, `songBar.liked` in all 8 locales; the accessible names stay "Add to Playlist" and "Add to / Remove from Liked Songs". Members get the existing playlist popover in the middle slot (it flips above the bar); #414 turns it into a bottom sheet. A guest's Playlist and heart open the sign-in sheet; Practice opens the drawer for guests too (Record shows the recorder gate).
- **Consequences:** two new short labels in every language to proofread; Quechua "Munay" / "Munasqa" and the Dutch "Favoriet" / "In favorieten" should be checked by native speakers.
- **Confirm:** yes (copy and look)

### UXA-027 · Add to playlist sheet: removing, creating, staying open

- **Date / story:** Nov 5, 2026 · #414 (G8.1)
- **Context:** the story asks for a bottom sheet with "New playlist" first and check marks, and the scope says "playlists with the song show a check and tap removes". It does not say how "New playlist" asks for a name, whether the sheet closes after a tap, or what Story 3.1.4.6 ("one creation interface") means for a sheet.
- **Options:** creation: (a) navigate to the Add playlist page; (b) a name field inside the first row; (c) a second sheet. After a tap: (a) close the sheet; (b) stay open so several playlists can be ticked.
- **Choice:** removing = the existing server toggle (`addSongToPlaylist` deletes the row when the song is already in the playlist), no new action and no RLS change. Creating = (b): tapping **New playlist** turns the first row into a name field with **Create**; it calls the same `createPlaylist` action as the Add playlist page (one creation path, Story 3.1.4.6) and adds the song straight away, so the new playlist appears ticked. The sheet stays open after a tap (b); a **Done** button, the scrim, Escape or a swipe down closes it. The sheet creates a private playlist with just a name; the privacy line of #416 is not added here. Toasts reuse `playlists.picker.added` / `removed` (the hard-coded English strings are gone) and keep the "Open playlist" action. On the song page the ⋮ menu closes together with the sheet.
- **Consequences:** a playlist "holds" the song when it holds any version of it; unticking removes every version of the song from that playlist, ticking adds the oldest version (review: before, the server toggled only the oldest version while the check looked at all of them). a mistaken tap removes the song without a confirmation (undo = tap again; the toast says "Removed from …"). The sheet needs one more tap than the old popover to leave. Admins and gatekeepers still see public playlists in the list, as before.
- **Confirm:** yes (tap removes without confirmation)

### UXA-028 · Share dialog: where the private-song confirmation lives and what it promises

- **Date / story:** Nov 5, 2026 · #402 (G4.5)
- **Context:** the story asks for a confirmation that "the song lyrics become public and the take is shared", and nothing changing until the owner confirms. Real behaviour today (checked in `lib/actions/rehearsal.ts`): `shareRecording` refuses a take on a private song; `makeSongPublic` (song owner or admin) sets `compositions.is_public = true` at once; a take is only shared when a member is picked afterwards (`recording_shares` insert). So the lyrics do become public as the AC says, but the take is not shared by the confirm tap itself, and cancelling after confirming leaves the song public. The search (`search_users_for_sharing`) finds every registered profile by e-mail or name, at least 2 characters, at most 10 results, and shows e-mail addresses.
- **Options:** (a) keep the separate prompt in `RehearsalDrawer` and only reword it; (b) move the confirmation into the Share dialog as its first step; (c) change the server action so confirm + share happen in one transaction.
- **Choice:** (b), no change to RLS, actions or data. The dialog opens on a confirmation that lists both effects: the lyrics become public (everyone can see the song) and the take is shared only with the members picked next. The text also states the truth that the song becomes public as soon as the owner confirms, and that nothing changes before. A song owner or admin sees **Make song public and continue** / **Cancel**; a member who only owns the take sees an explanation (no toast) and no search. The helper line and empty state say the search finds registered members and suggest inviting others (no invite mechanism exists; it is only a hint). The old keys `privateSongPrompt.title|body|confirm|notOwner` were reworded in all 8 locales; new keys: `privateSongPrompt.effectLyrics|effectTake|note|notOwnerTitle`, `recording.sharing.helper|noResults`.
- **Consequences:** review: the dialog title names the step, focus moves to the search once the song is public, a failure shows an error toast, the take line no longer promises "nobody else can listen" (a take can already be public), and the helper no longer offers an invite that does not exist (it says someone without an account needs to sign up first). a song owner who confirms and then closes the dialog without choosing anyone has made the song public. (c) would avoid that but changes data semantics, which is out of scope. The confirmation no longer opens from the drawer, so any future caller of the Share dialog must pass `songIsPublic`, `canMakeSongPublic` and `onMakeSongPublic`. The search results still show e-mail addresses of all registered members; whether that is wanted is a privacy question for the owner.
- **Confirm:** yes (copy, and the confirmation moves; the e-mail exposure in search is unchanged but worth a decision)

### UXA-029 · Shared with me: where the badge lives, where the entry lives, when it is read

- **Date / story:** Nov 5, 2026 · #403 (G4.6)
- **Context:** the story text asks for "a badge on the account avatar", a "Shared with me" entry in the account menu and in Library, and mark-as-read on Practice open. UXD-3 already keeps the header bell (Story 4.6.6) next to the list. UXA-028 is taken by #402 (not merged yet).
- **Options:** badge: (a) bell only, count in words on the entries; (b) bell and a second badge on the avatar. Library entry: (a) a fifth tab; (b) a row under the tabs. Rows: (a) one per song; (b) one per take. Read rule: (a) opening the list marks all read; (b) only opening the song's Practice drawer does.
- **Choice:** badge (a): one thing, one badge. The account menu and Library entries say "3 new" in words, so the count is visible without a second dot, and the avatar stays calm. Library entry (b): the tab row was fitted to 390 px in #407 and a fifth tab would scroll off; the page is a breadcrumb page (Library › Shared with me). Rows (b): each take has its own sharer, name and link, so one tap lands on the right take (the permalink opens the song with Practice on it). Read rule (b), as the story says; the deep link opens the drawer too, so tapping a row also clears it. The mark-read call updates every unread notification of the song, also ones older than the bell's latest 20.
- **Consequences:** the "n new" count, like the bell, counts the latest 20 notifications, so it tops out at 20; opening Practice still marks older unread rows of that song read (review: before, an unread row older than the latest 20 never cleared). a user who only opens the list without opening a song still sees "New" and the bell number; "Mark all as read" in the bell remains the way to clear them. If a notification was dismissed or deleted, the share still lists but without a "New" marker. A song the recipient cannot read (private) is named from the notification snapshot, else by the take name. New keys in 8 locales: `sharedWithMe.title|empty|new|unreadCount`, `guestGate.sharedWithMe.title|reason` (Quechua to proofread).
- **Confirm:** yes (no avatar badge, entry placement, copy)

### UXA-032 · Reader tools: where transpose and speed live, who transposes, how a shift is kept

- **Date / story:** Nov 6, 2026 · #394 (G2.5)
- **Context:** the story puts transpose (musician) and auto-scroll in the G2.1 toolbar, "overflow menu on 390 px". The code had neither on the song page (transpose only existed in the PDF export; auto-scroll was a hidden planned preference (UXA-031)), so there was nothing to move. The story does not say what the overflow looks like, which roles are "musician", whether a shift is remembered, or how far it goes.
- **Options:** layout: (a) everything in one wrapped row; (b) `Chords · A− · A+ · ▶` plus a ⋯ button that opens the shared bottom sheet with transpose and speed; (c) a ⋯ popover menu. Roles: (a) musician and expert only; (b) also admin; (c) also gatekeeper. Memory: (a) per song on this device; (b) for this visit only. Range: (a) wrap around after 12; (b) stop at ±11.
- **Choice:** layout (b): the row on a 390 px phone is Chords · A− · A+ · Auto-scroll (▶ / ⏸) · ⋯, five 44 px controls in one line; the ⋯ sheet "Reading tools" holds **Transpose** (− / value / +, the new key with the original in brackets, **Original key** after a change) and the **Auto-scroll** start / pause and speed. The sheet is the shared `BottomSheet` (modal, scrim, swipe handle, **Close** button) and auto-scroll keeps running behind it. When the song is shifted, the ⋯ button shows the shift as text (`+2`) and the meta line reads the new key (`Key F# · Capo 1 · …`); the capo is not changed. Roles (b): `musician`, `expert` and `admin` (the roles table: Transpose = musician and admin; the gatekeeper column says "musician" but a profile has one role, so a gatekeeper without the musician role does not transpose). Guests and members see the ⋯ button with auto-scroll only; songs without chords never offer transpose. Memory (b): the shift belongs to the song page you are on and is forgotten when you leave it (a transposed song silently kept on the next visit would make chords look wrong); the auto-scroll speed is a device preference stored with the other reader preferences (older stored values get speed 3). Range (b): −11 … +11, a text value with a sign (`+2`, `−3`), never colour alone. Only the displayed chords and key change, never the stored song. Chords written above the lyrics are converted first, tokens that are not chords (`N.C.`) stay.
- **Consequences:** two taps (⋯, +) for the first semitone instead of one; the PDF export keeps its own `transposition` input, untouched. The planned "Auto-scroll Lyrics" row in Settings → Preferences stays hidden behind the `plannedPreferences` switch (UXA-031); this story does not change Settings. Spelling follows the key the song moves to: flats when it lands in a flat key (song in E, +1 → F: A shows Bb, not A#), sharps in sharp keys (E +2 → F#), and the usual names in C / Am (C#, Eb, F#, Ab, Bb). The new key is named the way musicians write it (G +3 → Bb, Am +1 → Bbm, never A# or E#); without a written key the first chord stands in for it. Only tokens shaped like a chord (root A–G, optional #/b, chord quality, optional /bass) are shifted, so section labels such as [Chorus], [Coro] or [Coda] stay as written; a chord line with no lyric to attach to (song end, intro, before a directive) is shifted in place.
- **Confirm:** yes (new role gate, shift not remembered, key on the meta line)

### UXA-033 · Auto-scroll: speeds, what pauses it, sticky toolbar, stay-awake indicator

- **Date / story:** Nov 6, 2026 · #394 (G2.5)
- **Context:** the story asks for "auto-scroll play/pause + speed" and a "stay-awake indicator when wake lock is active". It gives no speeds, no rule for stopping and does not say how the controls stay reachable while the page scrolls away from the toolbar.
- **Options:** speed: (a) a free slider; (b) five fixed levels. Stopping: (a) only the play button; (b) also any touch on the page, a wheel or a paging key; (c) also at the end of the song. Reach: (a) the toolbar always sticky; (b) sticky only while auto-scroll runs; (c) a floating pause button. Indicator: (a) shown when the preference "keep screen awake" is on; (b) shown only when the browser really holds the lock.
- **Choice:** speed (b): five levels, 10 / 18 / 28 / 42 / 60 px per second (default level 3 = 28 px per second, a little under one line a second at the default text size), shown as "Speed 3 of 5" with **Slower** and **Faster**; whole pixels are scrolled each frame and the fraction carried over so level 1 is smooth; a frame counts at most 100 ms, so a background tab cannot make the page jump. Stopping (b)+(c): a touch, mouse press, wheel or ↑ ↓ PgUp PgDn Home End Space anywhere outside the reading tools pauses it (the toolbar and the sheet are marked, so changing the text size, the speed or transposing does not pause it), and it stops by itself when the end of the lyrics is on screen (the page bottom otherwise). Tapping the darkened backdrop of a sheet closes the sheet and does not pause it. Reach (b): the toolbar strip sticks right under the title bar (under the page header on desktop, which scrolls inside the main area, so the scroll container is looked up) only while auto-scroll runs, and scrolls away with the page otherwise, so the lyrics are never covered at rest; while it scrolls the action bar slides away when the user has auto-hide on (as for any downward scroll). Indicator (b): a small sun icon after the ⋯ button (label "Screen stays on", also a row of words in the sheet) is shown only while the Wake Lock sentinel is held; it disappears when the preference is off, the browser refuses (for example a low battery) or the tab is hidden. `useWakeLock` now returns `isActive`; its console logging was removed.
- **Consequences:** a tap on the lyrics while scrolling pauses instead of doing nothing; there is no way to scroll by hand during auto-scroll except by touching (which pauses). The 5 levels are fixed; a free speed or "start after 3 s" is a possible follow-up. 8 locales have new keys `viewer.*` (Quechua strings need a native check).
- **Confirm:** yes (tap pauses, sticky strip while scrolling, new stay-awake icon)

### UXA-034 · Listen tab: providers and status line

- **Date / story:** Nov 5, 2026 · #397 (G3.2)
- **Context:** the story says provider buttons appear only for providers with a link ("verify current behaviour first"). Verified: the buttons already depended on the link, but only appeared when the song had two or more providers; with one link the tab showed a bare player and no name. The Gherkin expects a "YouTube" button for a song with only a YouTube link. Each button also carried a brand colour (red, orange, green) when chosen.
- **Options:** (a) keep hiding the buttons for a single provider; (b) always show the buttons of the providers that exist; and either brand colours or greys for the chosen one.
- **Choice:** (b) with greys. The buttons are a labelled group in a fixed order (YouTube, SoundCloud, Spotify), 44 px tall; the chosen one has `aria-pressed`, a surface background, a border and a check (never colour alone). A line under the buttons (`role="status"`) says *Playing: YouTube Reference* or *Paused: …* while the bar is visible, so it is clear which reference or take plays. The Record tab status line may wrap (no truncation) and loses its pulsing dot.
- **Consequences:** review: the check marks the provider shown; a speaker (with sr-only "Playing") marks the one that plays, since both can differ; the status line stays mounted so the first change is announced; Spotify gets no state word because its embed does not report pause. a song with one link now shows one (already pressed) button; the brand colours of the provider buttons are gone (the embedded players keep their own look). New keys `rehearsal.listen.status` and `miniPlayer.paused` in eight languages (Quechua to be proofread).
- **Confirm:** yes (single provider now shows a button, brand colours removed, copy)

### UXA-035 · Calm mini player and "Open player"

- **Date / story:** Nov 5, 2026 · #397 (G3.2)
- **Context:** the bar was solid accent with animated equalizer bars; "Control Track" on the Record tab did not say what it does. Design rules: greyscale plus one accent, no decorative motion, state never by colour or motion alone.
- **Options:** keep the equalizer under `motion-safe`, or remove it; accent bar, or plain bar with an accent play button.
- **Choice:** plain `bg-surface` bar with `border-line-strong`; progress is grey; the play/pause button is the only accent element. The equalizer is removed (a decorative animation says less than the word); the subtitle reads *Playing · name* or *Paused · name*. `rehearsal.controlTrack` becomes **Open player** (it opens the Listen tab).
- **Consequences:** review: the bar names references by brand only ("Playing · YouTube") so it fits at 390 px; the full label is in the Listen status line. The equalizer in the desktop Practice header button on the song page is still animated (follow-up). `miniPlayer.playing` is now shown in the bar (it was only a tooltip). The small equalizer in the desktop Practice header button (song page) is outside the player and is untouched; it is not under `motion-safe` yet.
- **Confirm:** yes (look, copy)

### UXA-030 · Unfinished features hide behind one list of switches

- **Date / story:** Nov 6, 2026 · #389 (G1.5)
- **Context:** the story asks to hide the Albums tab, the avatar block and the Privacy & Data tab "behind a feature flag defaulting to off" and to remove `settings.comingSoon` usages that become dead. #407 already added `FEATURES.albums` (UXD-4) and removed the Albums tab. The avatar block is a grey picture with a "Coming soon" badge (the upload handler exists but no control calls it). The Privacy & Data tab shows toggles, a data export and "Delete My Account" that do nothing, under a "not yet active" banner.
- **Options:** (a) one flag per feature in the existing `lib/features.ts`; (b) an environment variable; (c) delete the code. Deep link of a hidden tab: (a) fall back to Profile like an unknown value; (b) 404.
- **Choice:** (a) switches in `lib/features.ts`, a compile-time constant, all off: `avatarUpload`, `privacySettings` (next to `albums`). The code and the data model stay, so a later story switches a feature on once it works. The "Coming soon" badges, the "not yet active" banner and the keys `settings.comingSoon`, `settings.privacy.notActive`, `settings.profile.avatar.comingSoon` and `common.comingSoon` are deleted from all 8 locales (nothing would render them: a feature that is switched on must be finished). The settings tab list is computed in `lib/account/settingsTabs.ts` (`visibleSettingsTabs`); `?tab=privacy` already followed the "unknown value opens Profile" rule, which now covers it. This is a query parameter on a page that exists, so a 404 (#406 is for unknown paths) would be wrong; the Albums route keeps its real not-found page (#407).
- **Consequences:** members cannot reach Privacy & Data or the avatar block; there is still no way to delete an account or export data in the app (it never worked). The flags are not runtime-configurable: turning one on needs a code change. The remaining privacy toggles in `PrivacySettings.tsx` are inert and must be wired before `privacySettings` is switched on.
- **Confirm:** yes (hides an existing tab and block; no data or permission change)

### UXA-031 · Planned preference rows and melody notation are hidden too

- **Date / story:** Nov 6, 2026 · #389 (G1.5)
- **Context:** the story names three places, but the acceptance test says "no element labelled Coming soon is visible in Library and Account Settings". The Preferences tab has three greyed rows with a "Coming soon" badge (auto-scroll lyrics, show chords by default, offline mode), and the Add/Edit song form has a "Melody notation" section with a "Coming soon" badge (the story gap analysis found only the settings ones; the song form is the same kind of placeholder).
- **Options:** (a) hide them behind switches, like the others; (b) keep the rows without the badge (still dead switches); (c) leave them.
- **Choice:** (a): `plannedPreferences` and `melodyNotation`, both off. Offline mode belongs to the Offline Library epic (#357), which brings its own setting. Wording of the Preferences page: it now lists appearance, language, keep screen awake, auto-hide navigation and e-mail notifications, all working.
- **Consequences:** a member who read about "auto-scroll" or "offline mode" on the Preferences page no longer sees them; the manual drops them too. Melody notation is not offered anywhere until it exists.
- **Confirm:** yes (removes visible, if inert, UI)

### UXA-038 · Where "Back" leads on the auth pages

- **Date / story:** Nov 6, 2026 · #409 (G5.4)
- **Context:** the login and sign-up cards had a ✕ that always went Home, and a second "Back" (page level) that also went Home. The story says: remove ✕ or make it Back to the `next=` target or home.
- **Options:** (a) browser history back (`router.back()`); (b) a link to the validated `next=` target, else Home.
- **Choice:** (b). History back breaks after a reload, a direct visit, or after moving login → sign-up → login (it would walk the auth pages). The `next=` target is already what sign-in returns to (GuestGate, #410), so Back and a successful sign-in lead to the same page. `authBackHref` reuses the hardened `safeNextPath`; a target under `/auth` (a loop) becomes Home. `next` is carried across login, sign-up and forgot-password, so the way back survives the detours. The ✕ is removed rather than turned into a second Back: one control, one word, in the same place on every auth page.
- **Consequences:** a guest who reached login from the header "Sign In" on a page gets `next=<that page>` from `UserProfile` and goes back there; a visit with no `next` goes Home. If `next` is a members-only page, Back leads to its locked preview (GuestGate), which is the page they came from. No new message keys (`common.back` already exists in 8 locales).
- **Confirm:** no

### UXA-039 · Auth pages as plain pages on tokens

- **Date / story:** Nov 6, 2026 · #409 (G5.4)
- **Context:** scope item "plain page layout for auth using the tokens". The forms were palette-heavy (hex colours, an orange gradient button with glow, a heavy card with a large shadow), which made a blank page look like a modal.
- **Options:** (a) keep the card and only remove ✕; (b) a plain page with the shared tokens and the shared `Button`.
- **Choice:** (b): `components/auth/AuthShell.tsx` gives all four auth forms the same layout (Back link, header with an accent-soft flame/key badge, token inputs ≥ 44 px, notices with a border and words, not colour alone). Phones show no card; from `md` a bordered panel. Primary actions use the shared `Button` (one accent fill per screen). `sign-up-success` and `error` pages are left as they are (no ✕ or Home trap there; a later restyle can use the same shell).
- **Consequences:** palette baseline −192, lint warnings −11. The magic-link success text is a neutral notice instead of a green box. The Terms / Privacy links are still placeholders (`#`), as before.
- **Confirm:** no

### UXA-036 · Recorder: when "left" shows, the limit in words, the silent-microphone hint, the meter

- **Date / story:** Nov 6, 2026 · #404 (G4.7)
- **Context:** the scope says "Timer shows `2:41 left` in the last minute"; the Gherkin says a recording at 2:00 shows "1:00 left". 2:41 left would be 19 s into a take, not the last minute, so the two disagree. The mockup (`screen23_practice_drawer.html`) shows *Maximum take length: 3 minutes (2:41 left)* in one line and an eight-bar meter. The story does not say what the meter does while paused or what happens when the microphone is silent (R14: "know the microphone works").
- **Options:** left time: (a) always from the start; (b) from the last minute on, as the Gherkin; (c) only in the last 10 s. Meter: (a) one bar that grows; (b) eight bars with the recent levels (mockup). Silent microphone: (a) nothing; (b) a hint after a few seconds.
- **Choice:** left time (b): from 2:00 on the line reads `m:ss left` (always words and numbers; bold, danger colour in the last 10 s); before that the same line states the limit (*Maximum take length: 3 minutes*), so the limit is known before it comes. The elapsed clock stays `mm:ss`. Meter (b): eight bars showing the last eight levels (about 20 per second), bar height = level (8–32 px), `role="meter"` with an accessible name and the value; no CSS transition, so reduced motion needs nothing extra. It listens during the count-in and while recording, reads 0 while paused, and the microphone is never routed to the speakers. The level is RMS on a dB scale (−60 dB … 0 dB). Hint (b): after 3 s in a row of recording with no level above about −51 dB the recorder says *No sound yet. Check that your microphone is on and not muted.* It is a rolling 3-second window: the next sound clears it and another 3 s of silence brings it back; the count-in and a pause are not counted. It is polite live text in a region that is always mounted (empty until needed).
- **Consequences:** the caption and the hint are new copy (8 locales; Quechua to proofread). A very quiet room with a good microphone can trigger the hint for a take that starts with silence; it goes away at the first sound and costs nothing. Web Audio is missing in very old browsers: the meter then stays flat, the recording still works. The 2:41 example in the story text is read as an example, not as a rule. Known limitation: the take clock counts one tick per second (as before), so on a very busy phone the shown time can lag the real time slightly; the meter and the 3-minute stop use that same clock.
- **Review:** the last 10 s are bold as well as red (colour is never alone); the no-sound hint is a rolling window instead of a latch for the whole stream; the meter sits *below* the clock and the limit/time-left line; the count-in line and the hint are live regions that are always mounted; one audio context per take is created in the record tap (iOS) and shared with the meter; a failed start releases the microphone; Discard detaches the recorder so a late stop cannot refill the take; the meter lives in its own component so the recorder does not re-render 20 times a second.
- **Confirm:** yes (new copy: limit caption and silent hint)

### UXA-037 · Recorder: count-in default, memory, cancel, and the review buttons

- **Date / story:** Nov 6, 2026 · #404 (G4.7)
- **Context:** today every recording starts with a 3-2-1 count-in (also to warm the microphone, avoiding the "pop" at the start). The story asks for an *optional* count-in toggle and for Save as the single full-width primary with Discard as a text button. It does not say what the default is, whether the choice is remembered, or whether the count-in can be cancelled (today it cannot).
- **Options:** default: (a) on, as today; (b) off. Memory: (a) none; (b) per device (`localStorage`). Cancel during count-in: (a) no; (b) yes.
- **Choice:** default (a) on, so nothing changes for anyone who does not touch the switch, and the microphone still has three seconds to warm up; memory (b), key `sfs:recorder:count-in` (`"off"` when switched off), read once when the recorder opens, failures of storage are ignored; cancel (b): the bin button is shown during the count-in and releases the microphone. The toggle is a native checkbox with `role="switch"` in a 44 px labelled row (*Count in 3-2-1 before recording*), shown only while idle. Review: **Save Take** is the single `primary` full-width Button (min 44 px), **Discard** a `ghost` Button, full width below it, no border; Discard has no icon any more.
- **Consequences:** with the count-in off, recording starts as soon as the microphone answers and the first fraction of a second can contain the microphone start-up pop. The choice does not follow the member to another device. The old side-by-side Discard / Save pair is gone, so Discard is one tap further from the thumb on purpose (it is a destructive action).
- **Review:** the count-in line (*Starting in n*) is a live region that is mounted empty and filled in, so screen readers announce each step; if capturing cannot start after the count-in, the microphone is released and the error shows instead of an uncaught error; the Dutch count-in reads *Begint over n* and the French time left *Il reste m:ss*.
- **Confirm:** yes (default on and remembered on the device)

### UXA-044 · Add Song preview: where it shows and when it updates

- **Date / story:** Nov 6, 2026 · #415 (G8.2)
- **Context:** the story asks for a "Preview toggle under the lyrics field rendering with the ChordPro viewer" and the Gherkin says that after switching Preview on, "Dm" is rendered above "Abre". It does not say whether the preview sits beside, below or instead of the editor, or how it follows typing.
- **Options:** (a) preview below the editor (the form grows, everything under it jumps); (b) side by side (no room on a 390 px phone and in a 672 px form); (c) the preview replaces the editor in the same fixed-height box.
- **Choice:** (c). The editor box is 400 px high with or without the preview, so nothing moves when the toggle is switched and no horizontal scroll appears at 390 px. The preview is the same `SongDisplay` the song page uses (default lyric size, chords on when the text has chords), so the output matches the song page. The text is debounced (200 ms) before it is rendered. The editor stays mounted while hidden, so text, undo and the guest draft (G6.2) are untouched; the toggle is not remembered and starts off, so the member opens on the editor.
- **Consequences:** the member cannot type and see the preview at the same moment on a phone; they toggle between the two with one tap. A wide layout with both side by side can come later. New copy: Preview, the region label and the empty-state hint (8 locales; Quechua to proofread).
- **Confirm:** no

### UXA-045 · Add Song upload as a visible button

- **Date / story:** Nov 6, 2026 · #415 (G8.2)
- **Context:** the upload was a small blue link at the top of the form that opened a panel with a drop area and a second **Upload** button that did nothing (choosing a file already imported it).
- **Options:** (a) keep the panel and make the link bigger; (b) one secondary button under the lyrics that opens the file picker.
- **Choice:** (b), next to Preview, same width and height (≥ 44 px, `Button` outline). The file input stays in the form for tests and assistive technology. Choosing a file still fills title, author, key, capo and the lyrics; a failed read shows a short error instead of only logging; files above 512 KB are refused with their own message (the browser would otherwise read them whole) and the bytes are decoded as UTF-8, falling back to Windows-1252 for files from older editors. The error clears when the member taps Upload again or edits the lyrics. The input is cleared afterwards so the same file can be chosen again. A single caption under the buttons says that title and author are detected. The decorative `help_outline` icon next to the heading did nothing and is removed. Unused keys (`songForm.cancel`, `songForm.upload.select`, `.chordProOnly`, `.button`) are deleted from all locales.
- **Consequences:** the large dashed drop area is gone (it did not work as a drop target anyway).
- **Confirm:** no

### UXA-046 · New Playlist: visibility switch and one line of explanation

- **Date / story:** Nov 6, 2026 · #416 (G8.3)
- **Context:** the page only had a small grey hint (*Created as private — you can change this later*); there was no way to choose. The story asks for one line that states the playlist is private unless made public, plus a visibility switch on creation. What is true in the database: RLS on `setlists` lets the owner (and admins) read a private playlist and everyone, signed in or not, read a public one; public playlists are listed under *Public playlists*. Only the owner (or an admin or gatekeeper, for a public one) can change it afterwards.
- **Options:** (a) a switch plus a line that always says the same thing; (b) a switch plus one line that follows the switch; (c) two radio cards (Private / Public) with longer text.
- **Choice:** (b): a **Make public** switch, off by default, and one line under it: off *Private: only you can see this playlist unless you make it public.*, on *Public: anyone can find and open this playlist, with or without an account.* The line is tied to the switch with `aria-describedby`, and the icon changes (lock / globe) so the state is never colour alone. Any member may create a public playlist directly: this is the same right they already have after creating (the playlist's menu → Make Public), so it adds no new permission, only one tap fewer. `createPlaylist(title, isPublic = false)`; only an explicit `true` is public. RLS and the data model are not touched.
- **Consequences:** the key `playlists.add.privateHint` is replaced by `visibilityLabel`, `privateExplain` and `publicExplain` in all 8 locales. A member can now publish a playlist in one step; the copy says who can see it. Songs inside a public playlist still follow their own visibility. "Only you" is shorthand: admins can also open private playlists (moderation), as `lib/playlists/visibility.ts` states.
- **Confirm:** yes (new way to publish at creation, new copy)

### UXA-047 · Add to playlist sheet stays private; shared Switch on tokens

- **Date / story:** Nov 6, 2026 · #416 (G8.3), with #414 (G8.1)
- **Context:** the story says to keep the wording consistent where the sheet also creates playlists. The sheet is a quick action while looking at a song; adding a switch there would slow it down and crowd the sheet.
- **Options:** (a) no hint in the sheet; (b) the same switch in the sheet; (c) a one-line hint under the name field, private only.
- **Choice:** (c): when *New playlist* opens its name field the sheet says *New playlists are private: only you can see them unless you make them public.* (`playlists.picker.newPrivateHint`). Making it public is done from the playlist afterwards. The shared `components/ui/switch.tsx` moved from shadcn defaults (`bg-primary`, `bg-input`, 32×18 px) to semantic tokens (accent when on, `line-strong` when off, 44×24 px, no transition under reduced motion), because the new page needs a token-based switch; Settings → Preferences uses the same component and keeps its own colour override.
- **Consequences:** the switches in Settings → Preferences are a little larger, use the accent token instead of a hex colour and now have an accessible name (the row label); no other behaviour changes.

### UXA-042 · Home welcome block: guests only, and what it says

- **Date / story:** Nov 6, 2026 · #412 (G6.3)
- **Context:** the story says "Shown to guests; members keep the Your Library stats", but not whether members also get the search field, or what the welcome line says. The header already has a search field on every page.
- **Options:** (a) show welcome, search and Recently added to everyone; (b) guests only, members unchanged.
- **Choice:** (b). Guests get a heading *Welcome* and one sentence: *A shared songbook of medicine songs with lyrics, chords and recordings, free to browse.* (translated in all 8 locales, no marketing tone, no promises beyond what the site does today). Members already know the site and keep Your library plus the category grid; they search from the header. Guests on Home would otherwise see two search fields (header and inline): the header one is hidden there for guests only (`/` and signed out); members and every other page keep it.
- **Consequences:** a signed-in member never sees the welcome copy and keeps the header field on Home; a guest on Home has one search field, and the bottom bar's Search tab (which opens the song list) is unaffected; if the owner wants a different sentence only the `home.welcome.*` keys change.
- **Confirm:** yes (new copy, and members get no search/Recently added on Home, and guests lose the header search field on Home)

### UXA-043 · Recently added: what it contains

- **Date / story:** Nov 6, 2026 · #412 (G6.3)
- **Context:** "Recently added" must only show songs a guest may see, without RLS changes.
- **Options:** (a) rely on RLS only; (b) RLS plus an explicit `is_public = true` filter; sort by `created_at` (newest added), not `updated_at`.
- **Choice:** (b), 5 rows, newest first, as G1.2 song rows (heart opens the guest gate; no add-to-playlist for guests), with an *All songs* link to `/songs`. The row is hidden when there are no songs. Home search reuses the G7.1 suggestion panel (recent searches and category chips) and the same recent-search storage as the header field.
- **Consequences:** one extra query on guest Home loads. The explicit filter keeps the row identical for everyone should it ever be shown to members.
- **Confirm:** no
