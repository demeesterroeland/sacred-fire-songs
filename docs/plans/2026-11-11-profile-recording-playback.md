# Plan: Play recordings from a singer profile (#490)

**Date:** Nov 11, 2026 | **Issue:** #490 | **Epic:** 6.1 (#375) | **Branch:** `feat/490-profile-recording-playback`

## Goal

On a singer profile (`/users/:id`) every listed recording gets a play/pause button that plays it on the page, one at a time, through the app's shared audio player.

## Design

One row per recording, the same flat row as the Library lists (title 16 px in, one grey meta line):

```
 ▶  Tempo check                                   ›
    Abuelo Cielo Brillante · Nov 4, 2026
```

- **▶ / ❚❚** (44 px, left): plays or pauses the recording here. Accessible label "Play {name}" / "Pause {name}"; `aria-pressed` reflects playing.
- **Row** (title, meta, ›): opens the song with that take selected (`recordingPermalink`, same deep link as the share notification and "Shared with me"). Replaces the "Back to song" button.
- Playback goes through the global `AudioProvider` (`handleTogglePlay`), so starting another recording stops the first, and a take playing elsewhere stops too.
- A recording whose file cannot be signed (missing file, no access) shows no play button; the row still opens the song.

## Access

- Listing stays as now: `user_recordings` rows with `singer_profile_id = :id` that RLS lets the viewer read (own, public, shared with me).
- Audio: signed URLs created server-side in `fetchMusicianProfile` with the viewer's session (`createSignedUrls`, 1 h), so the storage read policy (own folder, public take, shared with me) decides. No new policy, no migration.
- No e-mail addresses anywhere (only `public_profiles` and recording columns from `RECORDING_COLUMNS`-safe fields).

## Files

- `lib/users/serverQueries.ts`: select `storage_path`; add `audio_url` per recording via one `createSignedUrls` call.
- `lib/users/profileRecordings.ts` (new, pure): map rows + signed URLs to view items (testable).
- `components/profile/UserProfileView.tsx`: rows as `ListRow`-style links with a play button (client component part `ProfileRecordingRow`).
- i18n (8 locales): `user.profile.play` ("Play {name}"), `user.profile.pause` ("Pause {name}"); drop `user.profile.backToSong` if unused.

## Tests

- Unit: mapping (signed URL attached; missing URL → no play), `UserProfileView` row renders play button with label and a link to the recording permalink (RTL).
- E2E (`e2e/tests/ux-v2-profile-playback.spec.ts`, member): open a singer profile with an attributed take, press play → audio element plays (`paused === false`), button shows Pause; press play on a second take → first pauses; row link opens `/recordings/:id` → song page.
- Feature file `docs/testing/ux-v2-profile-playback.feature` (@unit, @e2e).

## Verification (manual)

1. Sign in as member, open a song's Practice → a take → singer name → profile.
2. Press ▶ on a recording: it plays; ▶ on another: the first stops.
3. Tap the row: the song opens with the take highlighted.
4. Light/dark, 390 and 1280 px; keyboard: Tab to ▶, Enter toggles.

## Open questions

- None blocking. Sorting stays newest first.
