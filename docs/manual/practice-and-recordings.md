# Practice: Listen, Record & Takes (draft)

**Version:** 0.11 | **Date:** Nov 6, 2026

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 0.11 | Nov 6, 2026 | Keyboard and screen reader notes for the Practice panel; the recorder says its state out loud (#418). |
| 0.10 | Nov 6, 2026 | The Make Public dialog names the take and the song and says who will hear it; a take on a private song starts with making the song public; guests hear public takes on the Listen tab (a link to a public take opens it there); the dialog says you can make the take private again, but not undo what was heard (#405). |
| 0.9 | Nov 6, 2026 | Recorder: level meter, optional 3-2-1 count-in, time left in the last minute, Save Take as the one big button (#404); the no-sound hint follows the last 3 seconds. |
| 0.8 | Nov 5, 2026 | Listen: one button per available provider (even when there is only one), the player and the Listen tab say in words what plays and whether it is paused; "Control Track" is now **Open player** (UX v2, #397). |
| 0.7 | Nov 5, 2026 | The Share dialog explains who can be found and, on a private song, what happens before you confirm (#402). |
| 0.6 | Nov 5, 2026 | Practice is a button in the bar at the bottom of the song page; it opens on Listen when the song has a reference track, otherwise on Record (UX v2, #393). |
| 0.5 | Nov 5, 2026 | **⋯** on a take opens a bottom sheet with the actions in groups; Delete take is alone at the bottom, in red (#401). |
| 0.4 | Nov 5, 2026 | Take rows show their status in words: Public, Shared · n, Pending invite (owner only), Verified musician (#400). |
| 0.3 | Nov 5, 2026 | Takes shared with you are listed under their own heading, Shared with me, with who shared them (UXD-3, #399). |
| 0.2 | Nov 5, 2026 | The player bar appears only after you press play and stops with the song page (UXD-5, #396). |
| 0.1 | Nov 4, 2026 | First draft: reference tracks, recorder, upload, managing takes, sharing, publishing with consent, singer attribution, shared-with-me view. |
| 0.2 | Nov 5, 2026 | One name: Practice (panel, menu, tabs Listen / Record, Takes chip, My takes). Button and message wording now says "take" (Save Take, Delete take, Share take, Publish Take). |

> Naming: the app calls this place **Practice** everywhere: menu item, panel title, tabs **Listen** and **Record**, the **Takes** chip on songs, **Your takes** in the Library. (Before Nov 2026 it was called Rehearsal Space, Recordings and Voice Recorder.)

## Opening Practice

On a song page tap **Practice** in the bar at the bottom. If the song has a reference track (YouTube, SoundCloud or Spotify) the panel opens on **Listen**; tap **Record** to start recording (two taps in all). Without a reference track it opens straight on **Record**. A panel slides up from the bottom with the song title and two tabs. Close it with ✕ or by swiping down.

Songs where you have takes show a **Takes** chip, and the header shows how many takes you have.

### With a keyboard or a screen reader

Practice opens as a dialog named *Practice* and the song. While it is open, **Tab** and **Shift+Tab** move only inside it (and the mini player, if it is showing), **Escape** or the ✕ button closes it, and focus goes back to the **Practice** button. **Listen** and **Record** are tabs: use the **←** and **→** keys (or **Home** and **End**) to switch. The recorder says *Recording...* and *Recording paused* out loud when you start or pause, and **Upload File** can be reached and opened with the keyboard.

## Listen (everyone)

1. Tab **Listen**.
2. Choose **YouTube**, **SoundCloud** or **Spotify**. Only the providers the song has a link for are shown, always in that order; the chosen one has a check mark, and a speaker shows the one that is playing. A line under the buttons says what is playing: *Playing: YouTube Reference* or *Paused: …* (for Spotify only the name: Spotify does not tell the app when you pause).
3. Play it in the panel. The **player bar** above the bottom bar appears once you press play (a song page never shows it before) and keeps playing when you close the panel or scroll the lyrics: ⟲ 15 s back, ▶/❚❚, ⟳ forward, ✕ stop. Leaving the song (another song, Home, Library) stops the music; the bar never carries over.

## Recording a take (members)

1. Tab **Record**. The first time, your browser asks for **microphone** permission — allow it.
2. **Record Audio** is selected. A reference track can keep playing (*Reference: YouTube video loaded*, with **Open player** to go back to the Listen tab) — **wear headphones** so it is not recorded along.
3. Under the timer the recorder says *Maximum take length: 3 minutes*. The switch **Count in 3-2-1 before recording** is on by default: switch it off if you want to start at once (the app remembers your choice on this phone).
4. Tap the big **microphone** button. With the count-in on you read *Starting in 3 … 1* (tap the bin to cancel); then the timer runs. The **level meter** below the timer moves with your voice: if the bars stay flat for 3 seconds in a row, a hint says *No sound yet* — check that your microphone is on and not muted. It disappears when you make a sound. In the last 10 seconds the time left turns red and bold. You can **pause / resume**, or **cancel and discard**.
5. Tap **stop**. *Review your take*: listen in the preview player and change the name (default: *Take – date time*).
6. **Save Take** (the big button) stores it privately; **Discard** below it throws it away.

Limits: a take stops automatically at **3:00**. In the last minute the screen says how long is left, for example *1:00 left* at 2:00.

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

Tap **⋯** on one of your takes. A sheet slides up from the bottom with the actions in groups:

- **Play** (or **Pause**), **Edit take name** (type, then Save) and **Download take**
- **Share** (see below), **Singer Attribution**, **Make Public / Make Private** and **Copy link**
- **Delete take**, on its own at the bottom in red — it asks to confirm; the file is removed for good and people it was shared with lose access.

Choose an action and the sheet closes. To close it without choosing, swipe the bar at its top down, press Esc, or tap outside it. Takes that other people shared with you or made public have no ⋯: you can only play them.

## Sharing a take with someone

1. ⋯ → **Share**.
2. Search a **registered member** by e-mail or name and add them. The dialog says it under the search box: *You can share with registered members only. Someone without an account needs to sign up first.* If nobody matches, it says so and repeats that hint.
3. *Shared with (n)* lists everyone; **Revoke** removes access.

Rules (so the singer stays protected):
- People you share with can **listen only**: they cannot download it ("Shared takes cannot be downloaded") and cannot share it further ("Only the recording owner can share this recording.").
- The song must be public so they can open it. If the song is private and it is **your** song, the dialog first asks *Make the song public to share this take?* and lists two effects: **the song lyrics become public** (everyone can see the song), and **the take is shared** only with the members you pick next. Nothing changes until you tap **Make song public and continue**; **Cancel** leaves everything as it was. If you leave after confirming, the song stays public. If it is someone else's private song, the dialog explains that only the song owner can make the lyrics public, and shows no search.

## When someone shares a take with you

Open the same song → **Practice** → **Record**. Takes shared with you are under their own heading, **Shared with me**, below **My takes**; the heading is hidden when nobody shared a take on this song. Each row says **Shared by <name>** and the length in its grey line. You can play it; there is no ⋯ menu, so download, share and delete are not available. **(planned: a notification when someone shares a take with you)**

## Making a take public

1. ⋯ → **Make Public**. The dialog shows the name of the take and, under it, the song (*Song: …*).
2. Read who will hear it. On a public song: *Everyone visiting this song, including guests, will be able to listen.* Guests who are not signed in can listen only, on the **Listen** tab of the song's Practice panel; recording, sharing and downloading stay with you, the owner of the take. A take belongs to one version of a song, so it is heard in that version's Practice panel.
3. **A take on a private song has no audience yet, so publishing starts with the song.** The dialog then says the song is private and must be made public first, and there is no **Publish Take** button. If you own the song (or are an admin), tap **Make song public and continue**: the lyrics become public, and takes already public on that song will then be listed for everyone on the song page. After that the dialog continues with the steps below. Otherwise ask the song owner to make the song public. If the dialog says it could not check whether the song is public, close it and try again; there is no **Publish Take** button until it can.
4. Read **Singer Consent & Rights**.
5. Tick *I confirm that I have obtained explicit consent and permission from the singer/musician to publish this take publicly.*
6. **Publish Take**. The take is now public.

Without the tick the button stays grey and the take stays private. **Cancel** changes nothing (it is locked for the moment the take is being published). You can make the take private again at any time: ⋯ → **Make Private**. New visitors then can't listen, but this can't undo what someone already heard or saved.

## Naming the singer (attribution)

1. ⋯ → **Singer Attribution**.
2. Search a **registered musician or user** — their name links to their profile, and the take shows the grey label *Verified musician* when they are one.
3. Or tick **Singer does not have an account yet** and type their name (and optionally e-mail) — shown with the grey label *Pending invite* until they have an account.
4. **Save Attribution**. **Remove Attribution** clears it.

## What the labels under a take mean

Each take can show small grey labels with an icon and words (nothing needs a hover):

| Label | Meaning |
| :--- | :--- |
| **Public** | Everyone who visits the song can listen. |
| **Shared · 2** | You shared it with 2 people (only you see this number). |
| **Verified musician** | The singer is a verified musician with a profile. |
| **Pending invite** | The singer has no account yet. Only you, the owner, see this label. |

A private take that nobody has seen has no label. A public take shared with two people shows both **Public** and **Shared · 2**.

## Questions people will ask (FAQ seeds)

- *Who can hear my takes?* Only you, unless you share or publish them.
- *Can the person I shared with keep a copy?* Not through the app (no download button). It is "DRM-lite": it does not stop screen recording.
- *Why can't I share a take?* The song is private and you are not its owner.
- *My take stopped by itself.* The 3-minute limit.
- *The recorder does nothing.* Allow microphone access in the browser's site settings.
