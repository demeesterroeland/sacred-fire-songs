# Guest Guide (draft)

**Version:** 0.32 | **Date:** Nov 13, 2026

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 0.32 | Nov 13, 2026 | Search: the search box also finds a song by the title of one of its translations; the grey line under the song names the language, for example *Dutch: Moeder Aarde* (UX v3, #547). Only translation titles are searched, not the translated lyrics. |
| 0.31 | Nov 13, 2026 | Search: the search box also finds a song by another name it is known by and by the title it has in a songbook (accents and capitals do not matter, "pachamama" finds "Pachamamá"). When the song's own title did not match, the row adds a grey line saying why, for example *Matched by alias: Gran Venerable Madre Tierra* (UX v3, #521). Songs whose title matches are listed first. |
| 0.30 | Nov 12, 2026 | Song page: a song that has a translation shows a second grey switch next to the version switch, with **Original language** and the languages the song has (named in your app language). Tap a language to read that translation without leaving the song; tap **Original language** to go back. Choosing another version also goes back to the original language. A link can end in `?lang=nl` to open a translation (UX v3, #516). Guests see the translations of public songs. |
| 0.29 | Nov 12, 2026 | Song page: a song with several authors shows each name as its own link, joined as in your language ("A and B"); tap a name to see that author's songs. A song without an author shows "Traditional" as plain text. The share text names every author, and the search box finds the song under each of them (UX v3, #515). |
| 0.28 | Nov 12, 2026 | Song page: the version switch names each version after its songbook (for example *Songbook A*) or, for a translation, its language in your app language; the original comes first, then versions from other books, then translations. On a phone with many versions the switch scrolls sideways inside its own strip and shows the version you opened. Two translations in the same language show their songbook too (*English · Songbook B*) (UX v3, #509). |
| 0.27 | Nov 12, 2026 | Song page: a version that has a note from the songbook it was printed in shows **About this song** under the grey lines; tap it to read the background. It starts closed and is hidden when there is no note (UX v3, #511). |
| 0.26 | Nov 12, 2026 | Song page: when a song comes from a printed songbook, a grey line under the lyrics says which book, which page and who compiled it (UX v3, #513). Review round: pages read right (`p. 38`, `pp. 38–39`), an original title that only differs in accents or punctuation is not repeated, and a song printed in several books has a list labelled "Sources". |
| 0.25 | Nov 11, 2026 | Song page: the second line also shows **Beats** when the songbook gives them for the version, e.g. `Key E · Capo 5 · Standard · Beats 8`; the line follows the version you pick (UX v3, #510).
| 0.24 | Nov 11, 2026 | Song page: lines the circle sings more than once sit between repeat bars, `‖:` before the first line and `:‖` after the last one, with `×2` when the song says how many times (UX v3, #518). |
| 0.23 | Nov 9, 2026 | The ☰ menu's Library section lists the same tabs as the Library page; tags under a song title stay on one line with "…" when there are more. |
| 0.22 | Nov 7, 2026 | "recording" is now **recording**; Terms Of Service and Privacy Policy pages (a draft until approved). |
| 0.21 | Nov 6, 2026 | Practice opens on the **Listen** tab for guests; under **Public recordings** you can play recordings that singers made public with their consent (listen only); a link to a public recording opens that recording on the Listen tab, highlighted (UX v2, #405). |
| 0.20 | Nov 6, 2026 | Song page: songs with several versions have a switch under the grey lines; a link can open a given version (UX v2, #395). |
| 0.19 | Nov 6, 2026 | Home now opens with a short welcome, a search field and the five newest songs under **Recently added** (UX v2, #412). Signed-in members still see Your library. |
| 0.18 | Nov 6, 2026 | Song page: **Auto-scroll** (▶) and **⋯** reading tools in the same toolbar (UX v2, #394). |
| 0.17 | Nov 6, 2026 | Sign-in and sign-up pages have a **Back** link instead of a ✕; it returns to the page you came from, else Home (UX v2, #409). |
| 0.16 | Nov 5, 2026 | The player bar is calm (plain background, orange only on play) and says *Playing* or *Paused* with what plays; the Listen tab shows only the providers the song has (UX v2, #397). |
| 0.15 | Nov 5, 2026 | Song page: a bar at the bottom with Practice, Playlist and Like; the ⋮ menu keeps Share (UX v2, #393). |
| 0.14 | Nov 5, 2026 | Search field: recent searches and category chips appear when you tap it (UX v2, #413). |
| 0.13 | Nov 5, 2026 | Add Song as a guest: a banner says saving needs an account; your draft is kept when you sign in (UX v2, #411). |
| 0.12 | Nov 5, 2026 | Bottom bar is Home · Search · Library; Songs and Create are gone from it (UX v2, #408). |
| 0.11 | Nov 5, 2026 | Home categories: grey tiles, tags as plain text with a grey song count (UX v2, #388). |
| 0.10 | Nov 5, 2026 | Song lists: one row per song with a grey meta line (UX v2, #386). |
| 0.9 | Nov 5, 2026 | The player bar appears only after you press play (UX v2, #396). |
| 0.8 | Nov 5, 2026 | Renamed to Practice (menu, Listen / Record tabs). |
| 0.7 | Nov 5, 2026 | Members-only screens now show one locked preview with the reason and a **Sign in** button that brings you back (Story 6.1.26). |
| 0.6 | Nov 5, 2026 | Added "A link that does not work" (real 404 page). |
| 0.3 | Nov 5, 2026 | Song page: `Chords · A− · A+` toolbar (UX v2, #390). |
| 0.2 | Nov 5, 2026 | Song page: meta on two grey lines (UX v2, #391). |
| 0.1 | Nov 4, 2026 | First draft from the UX research. |

## What Sacred Fire Songs is

A songbook of medicine and ceremony songs with lyrics and chords, for singing together in a circle. Anyone can read and listen. With a free account you can also save favourites, make playlists, add songs and record your own practice recordings.

## Finding your way

The screen has three fixed parts:

- **Top bar:** ☰ menu (left), the search field ("Search 200+ songs") with a filter button, and **Sign In** (right).
- **Content** in the middle.
- **Bottom bar:** **Home**, **Search**, **Library**. **Search** opens the song list and puts the cursor in the search field.

The ☰ menu repeats the main places (Home, Songs; under Library the same tabs as the Library page: Playlists, Smart, History, New, Artists; Add Song, New Playlist) and has the **language switch** at the bottom.

## Finding a song

1. **Start on Home:** a one-line welcome says what the site is, the search field recordings you straight to matching songs (tap it to see your recent searches and the main categories), and **Recently added** lists the five newest songs; **All songs** opens the full list.
2. **Browse by category** on Home: groups such as *The Elements* (Air, Earth, Fire, Water), *Nature*, *Lineage & Tradition*, *Medicine & Healing*. Each tag is a plain link; the grey number after it is how many songs it holds. "+3 more" shows the rest.
3. **Search:** tap the search field and type a title, another name the song is known by, its title in a songbook, its title in another language (a translation), a line of the lyrics, an author or a category. Accents do not matter ("aguita" finds "Agüita"). When the title did not match, the row adds a grey line saying why (*Matched by alias: …*, *Matched by songbook title: …*, *Matched by author: …*, or the language and title of a translation, for example *Dutch: Moeder Aarde*); songs whose title matches are listed first. Before you type, the field offers your last 5 searches (tap one to repeat it, **✕** removes one, **Clear all** removes them all; they are kept on this device only) and the main categories as grey buttons (tap one to show only those songs; tap it again to remove the filter). Tap outside the list or press Esc to close it.
4. **Filters:** the slider button in the search field opens *Search options*: sort order, content type (songs with chords / with melody) and category & tag filters. Tap **Show results**.
5. **Search** in the bottom bar lists all songs A–Z and is ready for typing. Each row shows the title, a grey line *author · category · language* and the key on the right; tap the row to open the song.
6. **Library → Artists** lists every author with their number of songs.

## Reading a song

- The title is at the top. Under it, one grey line shows the author and the tags (category, tradition, language); tap it to see them all as links. A song with several authors shows each name as its own link.
- A second line shows **Key**, **Capo**, **Tuning** and, when the songbook gives them, **Beats**, e.g. `Key E · Capo 3 · Standard · Beats 8`. It shows the values of the version you are reading.
- If this version has a note from the songbook it was printed in, **About this song** sits under those lines. Tap it to read the background; it starts closed, and it is not shown when the version has no note.
- If the song exists in more than one version (for example *Original* and *Simplified*, or the same song from two songbooks), a grey switch appears under those lines. A version is named after its songbook, a translation after its language (in your app language); the original comes first, then versions from other books, then translations. Tap a name to read that version; with many versions the switch scrolls sideways inside its own strip. The app opens the first version each time. Songs with one version show no switch. If the song also has translations, a second grey switch sits next to it: **Original language** plus the languages the song has, named in your app language. Tap a language to read that translation (its own title shows above the lyrics when it differs, and `Translated by …` when the translator is known); tap **Original language** to go back. Choosing another version returns to the original language. Songs without translations show no language switch.
- Under those lines: **Chords** switches the chords on or off, **A−** / **A+** make the text smaller or larger. The app remembers your choice on this device.
- **▶** scrolls the song for you, hands free; touch the screen to pause it, or press **⏸**. The **⋮** menu (top right) sets the scroll speed (five steps) and has the **Screen stays on** switch. While the scroll runs the toolbar stays under the title. A small sun next to **⋯** means the screen stays on while you sing.
- Chords are printed above the word where they change.
- Under the lyrics a grey line says where the version you are reading was printed, e.g. `Songbook A · p. 38 · compiled by Compiler A`. When the book printed the song under another title, `Original title: …` follows. A song printed in several books has one line per book, the main book first; the line follows the version you chose. Songs without a known source show no line.
- Lines that are sung more than once stand between repeat bars: `‖:` before the first line and `:‖` after the last one; the repeated lines are slightly indented so they line up behind the start bar. When the song says how many times, you also see it, e.g. `:‖ ×2`. The bars stay when the chords are switched off.
- A bar at the bottom of the song has **Practice**, **Playlist** and **Like**. It slides away when you scroll down and comes back when you scroll up. **Playlist** and **Like** need an account and ask you to sign in.
- ⋮ (top right) opens the song menu: **Share Song**.

## Listening to the song

Tap **Practice** in the bar at the bottom of the song to open the Practice panel.

- **Listen** tab: choose **YouTube**, **SoundCloud** or **Spotify** (when the song has that link) and play it inside the app.
- Under **Public recordings** on the same tab you can play the recordings that singers have made public for this song (listen only: no download, sharing or reordering). If there are none yet you see *No public recordings of this song yet.*
- A small **player bar** (plain background, only the play button is orange; it says *Playing* or *Paused* and what plays) appears above the bottom bar once you press play (a song page never shows it before), so you can keep listening while reading. Use ⟲ / ⟳ to jump back or forward, ✕ to stop. Leaving the song page stops the music.
- Tip: wear headphones if you sing along while recording later.

The **Record** tab shows what members can do and a **Sign In to Record** button.

## Things that need an account

Favourites, playlists, recently viewed, adding or editing songs, recording, account settings, singer profiles. Each of these screens shows the same grey preview with a lock, one sentence saying why it is locked and a **Sign in** button; after signing in you land on the screen you came from. You can listen to public recordings that the singer agreed to publish (Practice → Listen → **Public recordings**); recording, sharing and downloading need an account. You can open the **Add Song** form and start typing as a guest: a grey box at the top says **Draft now — sign in to save**: saving a song needs an account. Your draft stays on this device, so after you sign in (from the box or when you press save) you are back on the form with your text still there.

## Creating an account

The sign-in and sign-up pages have a **Back** link at the top left. It recordings you back to the page you came from (for example the song), or to Home if you opened the page directly.

1. Tap **Sign In** → **Join the Circle** (or go to *Create Account*).
2. Enter e-mail and a password (twice) → **Create Account**.
3. Check your e-mail: click the link **or** type the **6-digit code** → **Verify & Continue**.
4. On *Welcome at the Fire* enter the name others will see → **Finish Setup & Explore**.

## Signing in

- **Send Magic Link:** enter your e-mail, open the link in the mail. No password needed.
- **Sign in with password:** tap the button, enter e-mail and password.
- Forgot your password? **Reset Password** sends a reset link; then choose a new password on *New Password*.

## Install as an app

The site can be installed on your phone's home screen ("Add to Home Screen" / "Install app") and then opens full screen with the Sacred Fire Songs icon **(verify the exact prompt per browser)**.

## No internet?

If you lose connection you see **You're offline**. The page reloads by itself when you are back online, or tap **Try again**.

## A link that does not work

If a web address does not exist, you see **Page not found** with a **Go home** button. You are not sent to the sign-in page. Pages that need an account (for example Account settings) still ask you to sign in.

## Language

Choose your language in the ☰ menu (English, Español, Português, Français, Deutsch, Nederlands, Italiano, עברית). Song titles and lyrics are not translated.
