# Roles & Glossary (draft)

**Version:** 0.11 | **Date:** Nov 13, 2026

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 0.11 | Nov 13, 2026 | Glossary: Both (languages), the original and its translation together on the song page (UX v3, #517). |
| 0.10 | Nov 13, 2026 | Admin portal: **Catalog edits** (imported songs corrected in the app, kept safe from the next import; UX v3, #524). Glossary: Catalog edit. |
| 0.9 | Nov 13, 2026 | Roles: admins link a duplicate song as a version of another song; gatekeepers only songs they own (song page → ⋮ → **Link as a version of…**; both songs public or both private; UX v3, #512). Glossary: Linked song. |
| 0.8 | Nov 12, 2026 | Glossary: Language switch, the switch next to the version switch that shows a translation of the song (UX v3, #516). |
| 0.7 | Nov 11, 2026 | Glossary: Beats, the songbook beats of a version on the song page (UX v3, #510). |
| 0.6 | Nov 7, 2026 | Glossary: "recording" is now **recording**. |
| 0.5 | Nov 6, 2026 | Glossary: Version (switch under the song title, #395). |
| 0.4 | Nov 6, 2026 | Transpose is in the song page's **⋯ reading tools** (musician, expert and admin; UX v2, #394). |
| 0.1 | Nov 4, 2026 | First draft. Roles summarised from the Roles & Permissions table in `docs/logbook/epic&user stories.md`. |
| 0.3 | Nov 5, 2026 | Glossary: Shared with me (list of recordings shared with you, #399). |
| 0.2 | Nov 5, 2026 | Glossary: Practice replaces Rehearsal Space; Recording; Your recordings. |

## Roles

**Guest → Member → Gatekeeper → Admin.** *Musician* is not a role but a profile setting any member can switch on.

| What | Guest | Member | Gatekeeper | Admin |
| :--- | :-: | :-: | :-: | :-: |
| Browse, search, read chords & lyrics | ✅ | ✅ | ✅ | ✅ |
| Listen to reference tracks | ✅ | ✅ | ✅ | ✅ |
| Favourites, history | — | ✅ | ✅ | ✅ |
| Add songs, edit own songs | — | ✅ | ✅ | ✅ |
| Playlists, PDF export | — | ✅ | ✅ | ✅ |
| Record, share, publish own recordings | — | ✅ | ✅ | ✅ |
| Transpose (song page → ⋮), sheet music | — | musician | musician | ✅ |
| Edit details & links of any song, curate public playlists | — | — | ✅ | ✅ |
| Link a duplicate song as a version of another song (song page → ⋮ → **Link as a version of…**; both songs public or both private) | — | — | ✅ own songs only (source and target) | ✅ any song |
| Admin portal (users overview, catalog edits) | — | — | — | ✅ |

## Glossary

| Word in the app | Meaning |
| :--- | :--- |
| Practice | Panel on a song with a **Listen** tab (reference tracks) and a **Record** tab (your recorder and **My recordings**). Replaces the old names Rehearsal Space, Voice Recorder and Recordings. |
| Version | One arrangement of a song (for example *Original*, *Simplified*, *Live*) with its own lyrics, key and recordings. Songs with several versions show a switch under the title. |
| Language switch | Grey switch next to the version switch with **Original language** and the languages the song has a translation in. Choosing a language shows that translation of the lyrics under the version you are reading; choosing a version returns to the original language. |
| Both (languages) | Choice next to the language switch while a translation is shown: each verse of the original with its translation, under it on a phone and side by side on a larger screen. Chords stay on the original. |
| Catalog edit | A correction made in the app to a song or version that came from an imported songbook catalog. The next import leaves it alone; admins find it under **Admin → Catalog edits**, download the list as JSON for the catalog, and press **Taken over** once the catalog has the correction. |
| Linked song | A duplicate an admin, or a gatekeeper who owns both songs, linked as a version of another song (both public or both private): its versions, recordings and playlist entries now live in that song, its title became an other title of it, and its old link opens it. The sheet shows what moves before you confirm; it cannot be undone. |
| Reference Track | YouTube / SoundCloud / Spotify version of the song. |
| Recording | An audio file you recorded or uploaded for a song. Private by default. |
| Shared with me | The list of recordings other members shared with you, under My recordings in Practice → Record. Each row says who shared it. Listen only. |
| Public (recording) | Recording everyone can hear, published with singer consent. |
| Singer Attribution | Who sings on a recording; links to their profile when registered. |
| Smart playlist | Automatic list (Favorites, Your Songs, Drafts, Your recordings). |
| Draft | A song you added that is not public yet. |
| Magic Link | Sign-in link sent by e-mail, no password needed. |
| ChordPro (.cho) | Text format for songs with chords in brackets. |
| Capo | Fret where the capo goes; shown above the lyrics. |
| Beats | The beats of a version as printed in its songbook (e.g. `8`, `8y4`); shown on the song page after Key, Capo and Tuning when the book gives them. |
