# Practice: Listen, Record & Recordings (draft)

**Version:** 0.13 | **Date:** Nov 10, 2026

## Changelog

| Version | Date | Change |
| :--- | :--- | :--- |
| 0.13 | Nov 10, 2026 | The Share and Singer dialogs find a member by name, or by their complete e-mail address; they show names only, never e-mail addresses. |
| 0.12 | Nov 7, 2026 | The audio item is a **recording** everywhere (validation round 2, item 8): Save Recording, Delete recording, My recordings, Recordings chip, Your recordings; the toggle in the recorder is **Record**; the ⋮ menu on the song page is the one menu (Share, Edit, Delete, Transpose, Auto-scroll speed, Screen stays on). |
| 0.11 | Nov 6, 2026 | Keyboard and screen reader notes for the Practice panel; the recorder says its state out loud; the delete question works with the keyboard (#418). |
| 0.10 | Nov 6, 2026 | The Make Public dialog names the recording and the song and says who will hear it; a recording on a private song starts with making the song public; guests hear public recordings on the Listen tab (a link to a public recording opens it there); the dialog says you can make the recording private again, but not undo what was heard (#405). |
| 0.9 | Nov 6, 2026 | Recorder: level meter, optional 3-2-1 count-in, time left in the last minute, Save Recording as the one big button (#404); the no-sound hint follows the last 3 seconds. |
| 0.8 | Nov 5, 2026 | Listen: one button per available provider (even when there is only one), the player and the Listen tab say in words what plays and whether it is paused; "Control Track" is now **Open player** (UX v2, #397). |
| 0.7 | Nov 5, 2026 | The Share dialog explains who can be found and, on a private song, what happens before you confirm (#402). |
| 0.6 | Nov 5, 2026 | Practice is a button in the bar at the bottom of the song page; it opens on Listen when the song has a reference track, otherwise on Record (UX v2, #393). |
| 0.5 | Nov 5, 2026 | **⋯** on a recording opens a bottom sheet with the actions in groups; Delete recording is alone at the bottom, in red (#401). |
| 0.4 | Nov 5, 2026 | Recording rows show their status in words: Public, Shared · n, Pending invite (owner only), Verified musician (#400). |
| 0.3 | Nov 5, 2026 | Recordings shared with you are listed under their own heading, Shared with me, with who shared them (UXD-3, #399). |
| 0.2 | Nov 5, 2026 | The player bar appears only after you press play and stops with the song page (UXD-5, #396). |
| 0.1 | Nov 4, 2026 | First draft: reference tracks, recorder, upload, managing recordings, sharing, publishing with consent, singer attribution, shared-with-me view. |
| 0.2 | Nov 5, 2026 | One name: Practice (panel, menu, tabs Listen / Record, Recordings chip, My recordings). Button and message wording now says "recording" (Save Recording, Delete recording, Share recording, Publish Recording). |

> Naming: the app calls this place **Practice** everywhere: menu item, panel title, tabs **Listen** and **Record**, the **Recordings** chip on songs, **Your recordings** in the Library. (Before Nov 2026 it was called Rehearsal Space, Recordings and Voice Recorder.)

## Opening Practice

On a song page tap **Practice** in the bar at the bottom. If the song has a reference track (YouTube, SoundCloud or Spotify) the panel opens on **Listen**; tap **Record** to start recording (two taps in all). Without a reference track it opens straight on **Record**. A panel slides up from the bottom with the song title and two tabs. Close it with ✕ or by swiping down.

Songs where you have recordings show a **Recordings** chip, and the header shows how many recordings you have.

### With a keyboard or a screen reader

Practice opens as a dialog named *Practice* and the song. While it is open, **Tab** and **Shift+Tab** move only inside it (and the mini player, if it is showing), **Escape** or the ✕ button closes it, and focus goes back to the **Practice** button. **Listen** and **Record** are tabs: use the **←** and **→** keys (or **Home** and **End**) to switch. The recorder says *Recording...* and *Recording paused* out loud when you start or pause, and **Upload File** can be reached and opened with the keyboard. The question *Delete recording?* is also a dialog: it starts on **Cancel**, **Tab** moves between **Cancel** and **Yes, Delete**, and **Escape** closes only the question (the Practice panel stays open). **Escape** while you are renaming a recording only stops the renaming.

## Listen (everyone)

1. Tab **Listen**.
2. Choose **YouTube**, **SoundCloud** or **Spotify**. Only the providers the song has a link for are shown, always in that order; the chosen one has a check mark, and a speaker shows the one that is playing. A line under the buttons says what is playing: *Playing: YouTube Reference* or *Paused: …* (for Spotify only the name: Spotify does not tell the app when you pause).
3. Play it in the panel. The **player bar** above the bottom bar appears once you press play (a song page never shows it before) and keeps playing when you close the panel or scroll the lyrics: ⟲ 15 s back, ▶/❚❚, ⟳ forward, ✕ stop. Leaving the song (another song, Home, Library) stops the music; the bar never carries over.

## Recording a recording (members)

1. Tab **Record**. The first time, your browser asks for **microphone** permission — allow it.
2. **Record Audio** is selected. A reference track can keep playing (*Reference: YouTube video loaded*, with **Open player** to go back to the Listen tab) — **wear headphones** so it is not recorded along.
3. Under the timer the recorder says *Maximum recording length: 3 minutes*. The switch **Count in 3-2-1 before recording** is on by default: switch it off if you want to start at once (the app remembers your choice on this phone).
4. Tap the big **microphone** button. With the count-in on you read *Starting in 3 … 1* (tap the bin to cancel); then the timer runs. The **level meter** below the timer moves with your voice: if the bars stay flat for 3 seconds in a row, a hint says *No sound yet* — check that your microphone is on and not muted. It disappears when you make a sound. In the last 10 seconds the time left turns red and bold. You can **pause / resume**, or **cancel and discard**.
5. Tap **stop**. *Review your recording*: listen in the preview player and change the name (default: *Recording – date time*).
6. **Save Recording** (the big button) stores it privately; **Discard** below it throws it away.

Limits: a recording stops automatically at **3:00**. In the last minute the screen says how long is left, for example *1:00 left* at 2:00.

### Uploading an existing file

Choose **Upload File** instead of Record Audio. Accepted: mp3, wav, ogg, m4a, webm, opus, flac, aac. Maximum **10 MB** ("File size exceeds the 10 MB limit."). The name defaults to the file name.

## Your recordings

Under **My recordings** each recording shows ▶ play, name, date and length, and status icons:

| Icon | Meaning |
| :--- | :--- |
| 👥 + number | Shared with that many people |
| 🌐 | Public — everyone visiting the song can listen |
| ✓ next to a singer name | Singer is a verified musician |
| 🕓 next to a singer name | Singer has no account yet (pending invite) |

Drag the ⠿ handle to reorder recordings (sort: Newest, Oldest, Custom → **Save order**).

Tap **⋯** on one of your recordings. A sheet slides up from the bottom with the actions in groups:

- **Play** (or **Pause**), **Edit recording name** (type, then Save) and **Download recording**
- **Share** (see below), **Singer Attribution**, **Make Public / Make Private** and **Copy link**
- **Delete recording**, on its own at the bottom in red — it asks to confirm; the file is removed for good and people it was shared with lose access.

Choose an action and the sheet closes. To close it without choosing, swipe the bar at its top down, press Esc, or tap outside it. Recordings that other people shared with you or made public have no ⋯: you can only play them.

## Sharing a recording with someone

1. ⋯ → **Share**.
2. Search a **registered member** by name, or type their complete e-mail address, and add them. The list shows names only, never e-mail addresses. The dialog says it under the search box: *You can share with registered members only. Someone without an account needs to sign up first.* If nobody matches, it says so and repeats that hint.
3. *Shared with (n)* lists everyone; **Revoke** removes access.

Rules (so the singer stays protected):
- People you share with can **listen only**: they cannot download it ("Shared recordings cannot be downloaded") and cannot share it further ("Only the recording owner can share this recording.").
- The song must be public so they can open it. If the song is private and it is **your** song, the dialog first asks *Make the song public to share this recording?* and lists two effects: **the song lyrics become public** (everyone can see the song), and **the recording is shared** only with the members you pick next. Nothing changes until you tap **Make song public and continue**; **Cancel** leaves everything as it was. If you leave after confirming, the song stays public. If it is someone else's private song, the dialog explains that only the song owner can make the lyrics public, and shows no search.

## When someone shares a recording with you

Open the same song → **Practice** → **Record**. Recordings shared with you are under their own heading, **Shared with me**, below **My recordings**; the heading is hidden when nobody shared a recording on this song. Each row says **Shared by <name>** and the length in its grey line. You can play it; there is no ⋯ menu, so download, share and delete are not available. **(planned: a notification when someone shares a recording with you)**

## Making a recording public

1. ⋯ → **Make Public**. The dialog shows the name of the recording and, under it, the song (*Song: …*).
2. Read who will hear it. On a public song: *Everyone visiting this song, including guests, will be able to listen.* Guests who are not signed in can listen only, on the **Listen** tab of the song's Practice panel; recording, sharing and downloading stay with you, the owner of the recording. A recording belongs to one version of a song, so it is heard in that version's Practice panel.
3. **A recording on a private song has no audience yet, so publishing starts with the song.** The dialog then says the song is private and must be made public first, and there is no **Publish Recording** button. If you own the song (or are an admin), tap **Make song public and continue**: the lyrics become public, and recordings already public on that song will then be listed for everyone on the song page. After that the dialog continues with the steps below. Otherwise ask the song owner to make the song public. If the dialog says it could not check whether the song is public, close it and try again; there is no **Publish Recording** button until it can.
4. Read **Singer Consent & Rights**.
5. Tick *I confirm that I have obtained explicit consent and permission from the singer/musician to publish this recording publicly.*
6. **Publish Recording**. The recording is now public.

Without the tick the button stays grey and the recording stays private. **Cancel** changes nothing (it is locked for the moment the recording is being published). You can make the recording private again at any time: ⋯ → **Make Private**. New visitors then can't listen, but this can't undo what someone already heard or saved.

## Naming the singer (attribution)

1. ⋯ → **Singer Attribution**.
2. Search a **registered musician or user** — their name links to their profile, and the recording shows the grey label *Verified musician* when they are one.
3. Or tick **Singer does not have an account yet** and type their name (and optionally e-mail) — shown with the grey label *Pending invite* until they have an account.
4. **Save Attribution**. **Remove Attribution** clears it.

## What the labels under a recording mean

Each recording can show small grey labels with an icon and words (nothing needs a hover):

| Label | Meaning |
| :--- | :--- |
| **Public** | Everyone who visits the song can listen. |
| **Shared · 2** | You shared it with 2 people (only you see this number). |
| **Verified musician** | The singer is a verified musician with a profile. |
| **Pending invite** | The singer has no account yet. Only you, the owner, see this label. |

A private recording that nobody has seen has no label. A public recording shared with two people shows both **Public** and **Shared · 2**.

## Questions people will ask (FAQ seeds)

- *Who can hear my recordings?* Only you, unless you share or publish them.
- *Can the person I shared with keep a copy?* Not through the app (no download button). It is "DRM-lite": it does not stop screen recording.
- *Why can't I share a recording?* The song is private and you are not its owner.
- *My recording stopped by itself.* The 3-minute limit.
- *The recorder does nothing.* Allow microphone access in the browser's site settings.
