# UX v2: Agent Decisions (ADR-lite)

**Version:** 1.13 | **Date:** Nov 5, 2026 | **Epic:** 6.1 (#375)

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
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
| UXA-010 | Nov 5, 2026 | #396 | Mini player: shows after play, stays on pause, reserves bar + bottom nav, one accent colour | no |
| UXA-011 | Nov 5, 2026 | #406 | Generic 404 copy "Page not found" + plain "Go home"; only `/account`, `/admin`, `/users` redirect guests to login | yes |
| UXA-012 | Nov 5, 2026 | #410 | Guest Listen tab for consented public takes deferred until the Practice drawer restructure; RLS enforces consent now | yes |
| UXA-013 | Nov 5, 2026 | #410 | Fake demo playlists and per-card locks removed from the guest Library; add-to-playlist becomes a bottom sheet gate | yes |
| UXA-014 | Nov 5, 2026 | #410 | Signed-in users still see public takes without singer consent; UXD-2 covers guests only | yes |
| UXA-015 | Nov 5, 2026 | #386 | Song rows drop the chord / melody / take icons and the author/tag links | yes |
| UXA-016 | Nov 5, 2026 | #399 | "Shared with me" holds takes shared with me; public takes of others get their own "Public takes" list; the sharer is named by full name only; rows of others are listen only | yes |
| UXA-017 | Nov 5, 2026 | #387 | Readable labels: sentence-case copy, token colours where axe found low contrast, guard allow-list, axe-core pin | yes |
| UXA-018 | Nov 5, 2026 | #400 | Take status pills: "Pending invite" = singer without a linked profile; Public and Shared · n both shown; no count on others' takes | yes |

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
- **Confirm:** no

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
