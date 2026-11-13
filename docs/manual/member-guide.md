# Member Guide (draft)

**Version:** 0.40 | **Date:** Nov 13, 2026

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 0.39 | Nov 13, 2026 | Song page: musicians transpose with the **− n +** stepper right after the **Chords** switch in the toolbar (it is not in the ⋮ menu any more) and it shows only while chords are on. **Key**, **Capo** and non-standard **Tuning** (named, e.g. `Key E · Tuning: Drop D`) show only while chords are on; after a transpose the line shows the new key; standard tuning is omitted completely (on the song page and in the PDF); the **Beats** stay (UX v3, #566). |
| 0.40 | Nov 13, 2026 | Non-public songs are labelled **Private**, not Draft; songs without an author show **No artist**, while an author entered as Traditional remains **Traditional** (#564, #565). |
| 0.38 | Nov 13, 2026 | Search options: **Songbook** and **Language** now also appear when you open Search options from another page, counting all songs you may read (public songs plus your own private songs, or all songs for admins) (UX v3, #570). |
| 0.37 | Nov 13, 2026 | Search options: languages are chosen only in the **Language** select, no longer under category & tag filters (UX v3, #569); song edit forms keep the *Languages* group unchanged so you can still set a song's language. |
| 0.36 | Nov 13, 2026 | Search: when a song is found by another name, the grey line under it reads *Also known as …* (in the song list and in **+ Add Songs**). |
| 0.35 | Nov 13, 2026 | Playlists: the **+ Add Songs** search finds a song like the song search does: by its title, by another name it is known by, by any of its authors and by the title it has in a songbook (accents and capitals do not matter). When the song's own title did not match, the row adds a grey line saying why, for example *Also known as Pachamama*; songs whose title matches are listed first (UX v3, #542). |
| 0.34 | Nov 13, 2026 | Search: the search box also finds a song by the title of one of its translations; the grey line under the song names the language, for example *Dutch: Moeder Aarde* (UX v3, #547). Only translation titles are searched, not the translated lyrics. The **+ Add Songs** search in a playlist still matches the title only. |
| 0.33 | Nov 13, 2026 | Search options: **Songbook** and **Language** choices with the number of songs behind each name; see the Guest Guide. They combine with your library toggles (favorites, my songs, recordings, status). |
| 0.32 | Nov 13, 2026 | Song page: a song with a translation has the switch **Original · Translation · Both**. **Translation** shows the translation alone (not transposed); **Both** shows the original and the translation together, verse by verse (under each other on a phone, side by side on a larger screen), with chords and transpose on the original and the translation as lyrics only. With more than one translation the language switch next to it picks the language (the first one until you pick); it no longer has **Original language**. A link with `?lang=nl&view=both` opens both, `?lang=nl&view=translation` the translation, and Share keeps it; choosing another version returns to the original (UX v3, #517). |
| 0.31 | Nov 13, 2026 | Playlist PDF: each song shows the same details as the song page: **Key**, **Capo**, tuning and **Beats** of the version in the playlist, the **source** (songbook, page, compiler) under the lyrics, and the repeat bars **‖: … :‖** (with ×2 when it says how often). A value the version does not have is not printed. A transposed song prints its new key and chords. The labels follow your language; a translation is never printed, the sheet always has the song's own lyrics. |
| 0.30 | Nov 13, 2026 | Songbooks: **Library → Songbooks** lists the printed songbooks; a book's page lists its songs by page (also your own private songs, marked with a lock, which nobody else sees there). The grey source line on a song page links to its book (UX v3, #514). |
| 0.29 | Nov 13, 2026 | Edit Song: the **Songbook details** section lets you correct the **Beats** (for example 8, 6, 8y4 or 8,4) and the **About this song** note of the version you are editing; clear a field to remove it. The **Source** (songbook, page, compiler) is shown there but cannot be changed; admins also see **Correct source** to fix its page and original title (UX v3, #523). |
| 0.28 | Nov 13, 2026 | Search: the search box also finds a song by another name it is known by and by the title it has in a songbook (accents and capitals do not matter, "pachamama" finds "Pachamamá"). When the song's own title did not match, the row adds a grey line saying why, for example *Matched by alias: Gran Venerable Madre Tierra* (UX v3, #521). Songs whose title matches are listed first. The **+ Add Songs** search in a playlist still matches the title only. |
| 0.27 | Nov 12, 2026 | Song page: a song with translations has a language switch next to the version switch (**Original language** and the languages the song has). A translation replaces the lyrics of the version you are reading; its practice recordings, key and playlist entries stay with that version. Choosing another version returns to the original language; a link can end in `?lang=nl`. Old translation versions were moved into this switch, with their recordings going to the song's first original version (after the takes already there) and their playlist entries opening the original language of that version from now on (UX v3, #516). A translation with chords in another key, capo or tuning than the original, with blank lyrics, or with its own melody, note, beats, link or votes, is not moved and stays a version. |
| 0.26 | Nov 12, 2026 | Song page: every author of a co-written song is its own link ("A and B", in your language) and opens that author's songs; the share text names all authors. A song without an author shows "No artist" as plain text; an author entered as "Traditional" is still shown as Traditional. Add/Edit Song: the Author field shows every author of the song, and saving keeps them all; the search box and the Artists list find a song under each of its authors (UX v3, #515, #565). |
| 0.25 | Nov 12, 2026 | A song's version switch names each version after its songbook, or its language for a translation; the original comes first, then versions from other books, then translations (UX v3, #509). Two translations in one language show their songbook too. Adding a song to a playlist or to favourites uses the song's first version (the original). Edit names the version the same way. |
| 0.24 | Nov 12, 2026 | Song page: a version with a songbook note shows **About this song** under the grey lines (closed at first; tap to read it). Empty notes show nothing (UX v3, #511). |
| 0.23 | Nov 12, 2026 | Song page: a grey line under the lyrics names the songbook, page and compiler of the version you are reading, when the song comes from a printed book (UX v3, #513). The guest guide describes it; a song printed in several books gets one line per book. |
| 0.22 | Nov 11, 2026 | Transpose moves alternative chords such as **A7/C7** together (B7/D7 at +2); a slash chord such as **C/E** keeps its bass note (D/F#); chords written with ♭, alt, mi, ma or Δ move too. The PDF follows the same rule (#519). |
| 0.21 | Nov 11, 2026 | Add Song: `{start_of_repeat}` … `{end_of_repeat}` (optionally `{end_of_repeat: x2}`) put repeat bars around the lines between them, on the song page and in the preview (UX v3, #518). |
| 0.20 | Nov 11, 2026 | A singer's profile plays its recordings: tap ▶ to listen there (one at a time), tap the row to open the song with that recording (UX v2, #490). |
| 0.19 | Nov 11, 2026 | Home looks like it does for guests (**Recently added** and the categories), with **Your library** on top: six counters, **New songs** replaced by **Your recordings**, **Shared with me** and **Shared by me**. New page **Shared by me**; the **Shared with me** row under the Library tabs is gone (UX v2, #488). |
| 0.18 | Nov 9, 2026 | A private song's title is lighter (in lists and on the song page) and its ⋮ menu has **Make public**; "Drafts" is now **Private**; the ☰ menu's Library section matches the Library tabs. Library tabs **Playlists · Smart · History · New · Artists**; playlists in three groups; **Export PDF** in a playlist's ⋯ menu; My Drafts is no longer a smart playlist; private songs look lighter; tags are always links; the reading tools come before the version switch. |
| 0.17 | Nov 7, 2026 | "take" is now **recording**; one ⋮ menu with the reading tools and the Screen stays on switch; Terms Of Service and Privacy Policy pages; the Library "+" floats at the bottom right. |
| 0.16 | Nov 6, 2026 | A song that has several versions shows a switch under the title; tap a name to read that version. Edit says which version you are editing and Save brings you back to it. While a practice recording is being recorded or not yet saved, the switch asks you to save or discard it first (UX v2, #395). |
| 0.15 | Nov 6, 2026 | Adding a song: **Preview** shows your chords above the words as on the song page; **Upload .cho / .txt** is a visible button under the lyrics (UX v2, #415). |
| 0.14 | Nov 6, 2026 | New Playlist has a **Make public** switch and one line that says who can see the playlist; a playlist made from the Add to playlist sheet is always private (UX v2, #416). |
| 0.13 | Nov 6, 2026 | Song page toolbar: **Auto-scroll** (▶) and **⋯ reading tools** with scroll speed; musicians also **Transpose** (UX v2, #394). |
| 0.12 | Nov 6, 2026 | Settings lists only what works: Profile, Security and Preferences; no "Coming soon" items (UX v2, #389). |
| 0.11 | Nov 5, 2026 | **Shared with me**: a list of recordings others shared with you, in the account menu and under the Library tabs; the bell tells you when a recording arrives, and opening the song's Practice panel marks it read (UX v2, #403). |
| 0.10 | Nov 5, 2026 | Add to playlist is a sheet from the bottom with **New playlist** first and a check next to playlists that already hold the song (UX v2, #414). |
| 0.9 | Nov 5, 2026 | Like and Add to playlist moved from the song's ⋮ menu to the bar at the bottom of the song (UX v2, #393). |
| 0.8 | Nov 5, 2026 | Create moved from the bottom bar to the **+** in Library (UX v2, #408). |
| 0.7 | Nov 5, 2026 | Section titles and small labels are sentence case and larger (13 px titles, nothing below 12 px) with darker grey (UX v2, #387); "Your Library" reads "Your library". |
| 0.6 | Nov 5, 2026 | Practising: the player bar appears only after you press play and stops with the song page (UX v2, #396); details on the practice page. |
| 0.5 | Nov 5, 2026 | Library card renamed to Your recordings. |
| 0.3 | Nov 5, 2026 | Preferences: large stage font removed; text size is on the song page (UX v2, #390). |
| 0.2 | Nov 5, 2026 | Library tabs: Albums hidden (UX v2, #407). |
| 0.1 | Nov 4, 2026 | First draft from the UX research. |

Everything in the [Guest Guide](guest-guide.md) applies. This page covers what an account adds. Practising and recordings have their own page: [practice-and-recordings.md](practice-and-recordings.md) (the player bar shows only after you press play on a reference track or a recording).

## Your account menu

Tap your initial (top right). You see your name and role (e.g. *Member*), and:

- **Account Settings**, **Your Favorites**, **My private songs**, **My Playlists**, **Shared with me** (with "3 new" when there are new recordings), **Recently Viewed**
- **Language** and the light / dark / automatic theme switch
- **Sign Out**

## Home when signed in

At the top, **Your library** shows six counters: **Favorites**, **Private**, **Your Songs**, **Your recordings** (the songs you recorded), **Shared with me** and **Shared by me**. Tap one to open that list. Below it come **Recently added** (the newest songs) and the categories, as for guests.

**Shared by me** lists the recordings you shared: the song, the recording and the names of the members you shared it with. Tap a row to open the song with that recording.

## Favourites

Tap **Favorite** in the bar at the bottom of the song page (on a desktop the heart in the header, "Add to your Favorites"). The heart fills and the label reads **In Favorites**. Remove it the same way ("Remove from your Favorites"). All favourites are in **Library → Your Favorites**.

## Library

Tabs at the top: **Playlists**, **Smart**, **History**, **New**, **Artists** (on a phone, swipe the row sideways). **Shared with me** and **Shared by me** open from Home (Your library) or the account menu.

### Shared with me

When someone shares a recording with you, the bell at the top shows a number. **Shared with me** (account menu, or Library) lists every recording shared with you: the song, *Shared by* the person's name and the recording. A recording you have not opened yet says **New**. Tap a row to open the song with that recording highlighted. Opening a song's **Practice** panel marks that song's new recordings as read, and the number on the bell goes down. Guests are asked to sign in.

**Playlists** shows **Your private playlists** (with the field to create one), **Your public playlists** and **Other public playlists** from other members. The ⋯ menu of your own playlists has **Export PDF**.

**Smart** playlists are filled automatically:

| Smart playlist | Contains |
| :--- | :--- |
| Your Favorites | Songs you liked |
| Your Songs | Songs you added |
| Your recordings | Songs where you have practice recordings |

Your private songs (not public yet) look lighter in every song list and on the song page, with a lock and the word **Private**; the **Private** count on Home lists them. On a private song you own, ⋮ → **Make public** publishes it.

**History** lists the songs you opened. **New** lists the songs added since your last visit.

## Playlists (setlists)

**Create:** bottom bar **Library → +  → New Playlist**, or **Library → + New Playlist**. Type a name → **Create Playlist**. Under the name, the switch **Make public** is off: *Private: only you can see this playlist unless you make it public.* Switch it on and anyone can find and open the playlist, with or without an account. A new playlist made from the **Add to playlist** sheet is always private; you can change either kind later from the playlist's menu.

**Add songs:**
- From a song: **Playlist** in the bar at the bottom → pick a playlist.

- From a song: ⋮ → **Add to Playlist**. A sheet slides up: **New playlist** is the first row, then your playlists. A check shows where the song already is. Tap a playlist to add the song; tap a playlist with a check to take it out again. **Done** closes the sheet.
- From the playlist: **+ Add Songs** and search. You can search by the song's title, another name it is known by, any of its authors or its title in a songbook; a grey line under the row says why it was found (for example *Also known as Pachamama*). Tap a row to add the song (a check shows it is in the playlist); tap it again to take it out. The search box stays at the top while you scroll, and **Done** closes the sheet.

**In a playlist** you can: reorder songs by dragging, add a description, switch **public / private** (lock icon), **print / export PDF** (printer icon) for the ceremony, share the link of a public playlist, and duplicate it via ⋯ **(verify menu labels)**.

The PDF has one song per section with chords, the details of the version in the playlist (key, capo, non-standard tuning, beats), its source under the lyrics and the repeat bars, and a footer with the site address and a QR code to each song. Exporting the same unchanged playlist again reuses the earlier PDF, so it is fast.

## Adding a song

Bottom bar **Library → + → Add Song**.

1. **Song Title** (required) and **Original Author / Artist** (optional; you can add several).
2. **Lyrics & chords:** put chords in square brackets right before the syllable: `[Dm]Abre tus alas [A7]pájaro volar`. Chords written on a line above the lyrics are converted automatically. Under the field, tap **Preview** to see the chords above the words exactly as on the song page; tap it again to go back to typing.
3. Or tap **Upload .cho / .txt** under the lyrics to import a ChordPro file.
4. Lines like `{title: …}`, `{artist: …}`, `{key: E}`, `{capo: 3}` and `{c: comment}` set the song details. Put `{start_of_repeat}` before the lines the circle sings twice and `{end_of_repeat}` after them (`{end_of_repeat: x2}` shows the count): the song page and the preview show them between repeat bars `‖:` … `:‖`.
5. Add YouTube / Spotify / SoundCloud links so others can listen.
6. Save. Your draft is also kept in the browser while you type.

## Editing a song

Open your song → ⋮ → **Edit** **(verify label)**. You can only edit songs you added. Others see *This Medicine is Not Yours to Edit*. Gatekeepers and admins can edit details of any song.

A song that comes from a printed songbook has a **Songbook details** section (tap to open) with the version's **Beats** and its **About this song** note. Beats are a number from 1 to 99, or numbers joined with *y*, *&*, *+*, */*, *-* or a comma (for example `8`, `6`, `8y4` or `8,4`). The note is plain text; a blank line starts a new paragraph. Leave a field empty to remove it. Below them the **Source** shows the songbook, page and compiler as text: you cannot change it. Admins can tap **Correct source** to fix the page and the original title.

## Settings

**Account Settings** has tabs:

- **Profile:** display name. E-mail changes go via support.
- **Security:** change password, log out from all devices.
- **Preferences:** appearance, language, keep screen awake, auto-hide navigation on song pages and e-mail notifications (text size is set on the song page with A− / A+, auto-scroll with ▶ next to them; musicians transpose with the **− n +** stepper next to the **Chords** switch, and the scroll speed and **Screen stays on** are in the ⋮ menu at the top of the song page; transpose moves alternative chords such as **A7/C7** together and keeps the bass of a slash chord such as **C/E**).

## Public profile

Members and musicians have a profile page (`/users/…`). Singer attributions on recordings link to it. The profile lists the recordings of that singer you may hear: tap ▶ to play one right there (starting another stops the first), or tap the row to open the song with that recording. Guests are asked to sign in to see profiles.
