# User Manual (knowledge base)

**Version:** 0.1 | **Date:** Nov 4, 2026 | **Status:** Knowledge collection — not yet the published manual

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 0.1 | Nov 4, 2026 | Collected knowledge from the UX research (screens, flows, roles, recording sharing) as the base for a manual for guests and members. |

## Purpose

Raw material for a future end-user manual for **guests** and **members**. Written in plain language. Facts were checked against the running app on Nov 4, 2026; items marked **(verify)** still need a check before publishing, and items marked **(planned)** describe behaviour the UX plan may change.

## Files

| File | Audience |
| :--- | :--- |
| [guest-guide.md](guest-guide.md) | Visitors without an account. |
| [member-guide.md](member-guide.md) | Signed-in members: favourites, playlists, adding songs, settings. |
| [practice-and-recordings.md](practice-and-recordings.md) | Reference tracks, recording takes, sharing, publishing, singer attribution. |
| [roles-and-glossary.md](roles-and-glossary.md) | Who can do what, and the words the app uses. |
| `screenshots/` | Final manual screenshots go here (to be selected). |

## Screenshot candidates

Source: `docs/ux-research/screenshots/mobile/<role>/`. Copy the chosen ones into `docs/manual/screenshots/` once the priority-A UX fixes have landed (otherwise they show the dev banner and the always-on mini player).

| Manual section | Candidate |
| :--- | :--- |
| Home & categories | `guest/01-home.webp`, `member/01-home.webp` |
| Search | `member/42-search-modal.webp`, `member/43-search-typing.webp`, `member/44-search-filters.webp` |
| Song page | `guest/03-song-detail.webp`, `member/51-song-more-actions.webp` |
| Side menu / account menu | `member/41-side-menu.webp`, `member/45-account-menu.webp` |
| Sign in / sign up | `guest/20-auth-login.webp`, `guest/21-auth-sign-up.webp`, `guest/22-auth-sign-up-success.webp` |
| Library | `guest/09-library.webp`, `member/10-playlists.webp`, `member/12-recently-viewed.webp`, `member/13-artists.webp` |
| Playlists | `member/11-playlist-add.webp`, `member/18-playlist-detail.webp`, `member/52-add-to-playlist.webp` |
| Add / edit a song | `member/06-song-add.webp`, `member/07-song-edit-own.webp` |
| Reference tracks | `member/60-drawer-reference-tracks.webp`, `member/61-drawer-youtube-loaded.webp`, `member/62-drawer-spotify-loaded.webp` |
| Recording | `member/63-drawer-voice-recorder.webp`, `member/64-recorder-recording.webp`, `member/65-recorder-review.webp` |
| Managing a take | `member/66-recording-row-menu.webp`, `member/70-recording-rename.webp`, `member/71-recording-delete-confirm.webp` |
| Sharing / publishing / singer | `member/67-recording-share-modal.webp`, `member/68-recording-publish-modal.webp`, `member/69-recording-attribution-modal.webp` |
| Shared with me | `gatekeeper/74-shared-with-you.webp` |
| Mini player | `member/73-mini-player.webp` |
| Guest prompts | `guest/63-drawer-voice-recorder.webp` |
| Settings | `member/15-settings.webp` |
| Offline | `guest/32-offline-fallback.webp` |
