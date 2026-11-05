# Practice: Listen, Record & Takes (draft)

**Version:** 0.2 | **Date:** Nov 5, 2026

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 0.2 | Nov 5, 2026 | The player bar appears only after you press play and stops with the song page (UXD-5, #396). |
| 0.1 | Nov 4, 2026 | First draft: reference tracks, recorder, upload, managing takes, sharing, publishing with consent, singer attribution, shared-with-me view. |
| 0.2 | Nov 5, 2026 | One name: Practice (panel, menu, tabs Listen / Record, Takes chip, My takes). Button and message wording now says "take" (Save Take, Delete take, Share take, Publish Take). |

> Naming: the app calls this place **Practice** everywhere: menu item, panel title, tabs **Listen** and **Record**, the **Takes** chip on songs, **Your takes** in the Library. (Before Nov 2026 it was called Rehearsal Space, Recordings and Voice Recorder.)

## Opening Practice

On a song page tap ⋮ → **Practice**. A panel slides up from the bottom with the song title and two tabs. Close it with ✕ or by swiping down.

Songs where you have takes show a **Takes** chip, and the header shows how many takes you have.

## Listen (everyone)

1. Tab **Listen**.
2. Choose **YouTube**, **SoundCloud** or **Spotify**.
3. Play it in the panel. The **player bar** above the bottom bar appears once you press play (a song page never shows it before) and keeps playing when you close the panel or scroll the lyrics: ⟲ 15 s back, ▶/❚❚, ⟳ forward, ✕ stop. Leaving the song (another song, Home, Library) stops the music; the bar never carries over.

## Recording a take (members)

1. Tab **Record**. The first time, your browser asks for **microphone** permission — allow it.
2. **Record Audio** is selected. A reference track can keep playing (*Reference: YouTube video loaded*) — **wear headphones** so it is not recorded along.
3. Tap the big red **microphone** button. The timer runs. You can **pause / resume**, or **cancel and discard**.
4. Tap **stop**. *Review your take*: listen in the preview player and change the name (default: *Take – date time*).
5. **Save Take** stores it privately, or **Discard**.

Limits: a take stops automatically at **3:00**.

### Uploading an existing file

Choose **Upload File** instead of Record Audio. Accepted: mp3, wav, ogg, m4a, webm, opus, flac, aac. Maximum **10 MB** ("File size exceeds the 10 MB limit."). The name defaults to the file name.

## Your takes

Under **My takes** each take shows ▶ play, name, date and length, and status icons:

| Icon | Meaning |
| :--- | :--- |
| 👥 + number | Shared with that many people |
| 🌐 | Public — everyone visiting the song can listen |
| ✓ next to a singer name | Singer is a verified musician |
| 🕓 next to a singer name | Singer has no account yet (pending invite) |

Drag the ⠿ handle to reorder takes (sort: Newest, Oldest, Custom → **Save order**).

Tap **⋯** on a take for:

- **Share** — see below
- **Make Public / Make Private**
- **Singer Attribution**
- **Edit take name** (type, then Save)
- **Download take** (your own takes only)
- **Delete take** — asks to confirm; the file is removed for good and people it was shared with lose access.

## Sharing a take with someone

1. ⋯ → **Share**.
2. Search a **registered member** by e-mail or name and add them.
3. *Shared with (n)* lists everyone; **Revoke** removes access.

Rules (so the singer stays protected):
- People you share with can **listen only**: they cannot download it ("Shared takes cannot be downloaded") and cannot share it further ("Only the recording owner can share this recording.").
- The song must be public so they can open it. If the song is private and it is **your** song, you are asked *Make lyrics public to share take?* → **Make Public & Share**. If it is someone else's private song, you cannot share takes on it.

## When someone shares a take with you

Open the same song → ⋮ → **Practice** → **Record**. The shared take is in the list with a 👥 icon (*Shared with you*). You can play it; download and share are not available. **(planned: a separate "Shared with me" section and a notification)**

## Making a take public

1. ⋯ → **Make Public**.
2. Read **Singer Consent & Rights**.
3. Tick *I confirm that I have obtained explicit consent and permission from the singer/musician to publish this take publicly.*
4. **Publish Take**. Everyone who visits the song can now listen.

Without the tick the take stays private. ⋯ → **Make Private** undoes it.

## Naming the singer (attribution)

1. ⋯ → **Singer Attribution**.
2. Search a **registered musician or user** — their name links to their profile with a ✓ when they are a verified musician.
3. Or tick **Singer does not have an account yet** and type their name (and optionally e-mail) — shown with a 🕓 *Pending Invite*.
4. **Save Attribution**. **Remove Attribution** clears it.

## Questions people will ask (FAQ seeds)

- *Who can hear my takes?* Only you, unless you share or publish them.
- *Can the person I shared with keep a copy?* Not through the app (no download button). It is "DRM-lite": it does not stop screen recording.
- *Why can't I share a take?* The song is private and you are not its owner.
- *My take stopped by itself.* The 3-minute limit.
- *The recorder does nothing.* Allow microphone access in the browser's site settings.
