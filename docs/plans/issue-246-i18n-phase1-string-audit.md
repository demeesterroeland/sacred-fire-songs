# Issue 246 – i18n Phase 1: Hardcoded English String Audit

> **Purpose:** Exhaustive catalogue of all user-visible hardcoded English strings in the application.
> This is the extraction baseline for Phase 2 (technical implementation).
>
> **Scope:** All `.tsx` / `.ts` files under `app/` and `components/`.
> **Excludes:** `console.*` developer messages, CSS class names, internal IDs/keys, code comments.

---

## 🔐 Authentication

### `components/login-form.tsx`
- `"Welcome at the Fire"` — page heading
- `"Sign in to your account"` — subheading
- `"Email"` — field label
- `"name@example.com"` — email placeholder
- `"Password"` — field label
- `"••••••••"` — password placeholder
- `"Forgot your password?"` — link text
- `"Sign In"` — button label
- `"Signing in…"` — loading state button
- `"Don't have an account?"` — footer text
- `"Create one here"` — link text
- `"May the song carry you home to the sacred fire."` — footer quote

### `components/sign-up-form.tsx`
- `"Welcome at the Fire"` — page heading
- `"Create your account"` — subheading
- `"Full Name"` — field label
- `"Your Full Name"` — placeholder
- `"Email"` — field label
- `"name@example.com"` — placeholder
- `"Password"` — field label
- `"••••••••"` — placeholder
- `"Create Account"` — button label
- `"Creating account…"` — loading state button
- `"Already have an account?"` — footer text
- `"Sign in here"` — link text
- `"May the song carry you home to the sacred fire."` — footer quote

### `components/forgot-password-form.tsx`
- `"Welcome at the Fire"` — page heading
- `"Reset your password"` — subheading
- `"Enter your email and we'll send you a reset link."` — description
- `"Email"` — field label
- `"m@example.com"` — placeholder
- `"Send Reset Link"` — button label
- `"Sending…"` — loading state button
- `"Back to Sign In"` — link text

### `components/finish-registration-form.tsx`
- `"Welcome at the Fire"` — page heading
- `"Email successfully verified!"` — success banner
- `"The smoke has cleared, and your invitation is now official. The circle awaits—tell us how we shall call you as you join us by the fire."` — description
- `"What should we call you?"` — field label
- `"Your Full Name"` — placeholder
- `"Finish Setup & Explore"` — button label
- `"Finishing…"` — loading state button
- `"May the song carry you home to the sacred fire."` — footer quote

### `components/update-password-form.tsx`
- `"Reset Your Password"` — card title
- `"Please enter your new password below."` — card description
- `"New password"` — field label
- `"New password"` — placeholder
- `"Save new password"` — button label
- `"Saving…"` — loading state button

### `app/auth/sign-up-success/page.tsx`
- `"Check your email"` — heading
- `"We sent a confirmation link to your inbox."` — description

### `app/auth/error/page.tsx`
- `"Something went wrong"` — heading
- `"We encountered an error during authentication. Please try again."` — default error message
- `"Back to Login"` — link text
- `"Loading..."` — suspense fallback

---

## 🏠 Navigation & Chrome

### `components/common/Sidebar.tsx`
- `"Sacred Fire Songs"` — app name / logo text
- `"Home"` — nav label
- `"Songs"` — nav label
- `"Explore"` — nav label
- `"Library"` — nav label
- `"Add Song"` — nav label
- `"Admin"` — nav label (admin only)

### `components/common/MobileBottomNav.tsx`
- `"Home"` — nav label
- `"Songs"` — nav label
- `"Explore"` — nav label
- `"Library"` — nav label

### `components/common/navigation/UserProfile.tsx`
- `"Account"` — dropdown section title
- `"Account Settings"` — menu item
- `"Your Favorites"` — menu item
- `"My Drafts"` — menu item
- `"My Playlists"` — menu item
- `"Recently Viewed"` — menu item
- `"Sign Out"` — menu item
- `"Member"` — default display name fallback

### `components/common/navigation/ThemeToggle.tsx`
- `"Light"` — theme option label
- `"Dark"` — theme option label
- `"System"` — theme option label
- `"Theme: ${current.label}"` — aria-label / title pattern

### `components/common/Header.tsx`
- `"Show search options"` — aria-label for search button

---

## 🎵 Songs

### `app/songs/SongsPageContent.tsx` / `app/songs/page.tsx`
- `"Search 200+ songs..."` — search placeholder (authenticated)
- `"Search 200+ medicine songs..."` — search placeholder (guest)
- `"Search 200+ songs"` — mobile placeholder variant
- `"Songs"` — page title
- `"No songs found"` — empty state heading
- `"Try adjusting your filters."` — empty state description
- `"Clear filters"` — button
- `"Filter Draft songs"` — filter chip title
- `"Filter songs with Chords"` — filter chip title
- `"Filter songs with Melody"` — filter chip title
- `"Filter songs with Personal Recording"` — filter chip title
- `"My Recordings"` — filter chip label
- `"Chords"` — filter chip label
- `"Melody"` — filter chip label
- `"New"` — filter chip label

### `app/songs/[id]/page.tsx` — Song Detail
- `"Share Song"` — overflow menu item
- `"Add to Liked Songs"` — menu item
- `"Remove from Liked Songs"` — menu item (toggled)
- `"Add to Playlist"` — menu item
- `"Recordings"` — menu item / button label
- `"Edit Song"` — menu item
- `"Delete Song"` — menu item
- `"Sign in to manage playlists"` — toast message
- `"Sign in →"` — toast action
- `"Are you sure?"` — delete confirmation title
- `"This will permanently delete"` — delete confirmation body prefix
- `"Delete"` — confirm button
- `"Cancel"` — cancel button
- `"Song deleted."` — success toast
- `"Share song"` — aria-label
- `"Traditional"` — fallback for missing author
- `"by {author}"` — author attribution pattern
- `"Draft"` — status badge
- `"Show chords"` — toggle label
- `"Hide chords"` — toggle label

### `components/song/SongForm.tsx` — Add / Edit Song
- `"Add New Song"` — page title (add mode)
- `"Edit Song"` — page title (edit mode)
- `"Title"` — field label
- `"Song title..."` — placeholder
- `"Original Author / Artist"` — field label
- `"e.g. Traditional or Artist Name"` — placeholder
- `"e.g. Grandmother Earth"` — placeholder variant
- `"Lyrics / ChordPro"` — field label
- `"Category"` — field label
- `"Tags"` — field label
- `"YouTube URL"` — field label
- `"Paste YouTube link"` — placeholder
- `"Spotify URL"` — field label
- `"Paste Spotify link"` — placeholder
- `"SoundCloud URL"` — field label
- `"Paste Soundcloud link"` — placeholder
- `"Melody Notation"` — field label
- `"Status"` — field label
- `"Public"` — status option
- `"Draft"` — status option
- `"Save Song"` — button label
- `"Saving..."` — loading state
- `"Cancel"` — button label
- `"Song saved successfully!"` — success toast
- `"Failed to save song."` — error toast

### `components/song/SongMetadataPills.tsx`
- `"Traditional"` — fallback author

### `components/song/SongTechnicalBadges.tsx`
- `"Chords"` — badge label
- `"Melody"` — badge label
- `"Recording"` — badge label
- `"Draft"` — badge label

### `components/home/SongCard.tsx`
- `"Traditional"` — fallback author
- `"Draft"` — badge label

---

## 🎙️ Rehearsal Space

### `components/song/RehearsalDrawer.tsx`
- `"Rehearsal Space"` — drawer title
- `"Reference Tracks"` — tab label
- `"My Recordings"` — tab label
- `"No recordings yet"` — empty state
- `"Start recording to capture your practice."` — empty state description
- `"No recordings yet — start recording your practice."` — alt empty state
- `"Record"` — sub-tab label
- `"Upload"` — sub-tab label
- `"Recordings"` — section heading
- `"Sort"` — sort control label
- `"Newest"` — sort option
- `"Oldest"` — sort option
- `"Custom"` — sort option
- `"Save order"` — button
- `"Saving..."` — loading state
- `"Failed to save recording order"` — error toast
- `"Edit recording name"` — aria-label / title
- `"Download recording"` — aria-label / title
- `"Delete recording"` — aria-label / title
- `"Drag to reorder"` — aria-label / title
- `"YouTube Reference"` — mini-player subtitle
- `"SoundCloud Reference"` — mini-player subtitle
- `"Spotify Reference"` — mini-player subtitle
- `"Tap to play"` — mini-player subtitle (idle)
- `"Expand Rehearsal Space"` — mini-player expand button title
- `"Stop playback & close player"` — mini-player stop button title
- `"Seek 15s backward"` — seek button title
- `"Seek 15s forward"` — seek button title
- `"Playing"` — playback status label
- `"Audio file missing or corrupted"` — missing audio title
- `"Missing File"` — missing audio badge
- `"Rename recording"` — inline edit label
- `"Save"` — inline edit save button
- `"Cancel"` — inline edit cancel button
- `"Recording deleted."` — success toast
- `"Failed to delete recording."` — error toast
- `"Failed to rename recording."` — error toast
- `"Recording automatically stopped at the 3-minute limit."` — info toast

### `components/song/AudioRecorder.tsx`
- `"Ready to record"` — idle state label
- `"Recording..."` — active recording label
- `"Recording paused"` — paused state label
- `"Review your recording"` — stopped state label
- `"Preview Recording"` — audio preview label
- `"Click to select an audio file"` — upload drop zone heading
- `"Supports MP3, M4A, OPUS, FLAC, WAV, OGG, WEBM (Max 25 MB)"` — upload drop zone description
- `"Recording Name (e.g. Recording 1)"` — input placeholder
- `"Discard"` — button label
- `"Save Recording"` — button label
- `"Upload File"` — button label
- `"Start recording"` — button title
- `"Pause recording"` — button title
- `"Resume recording"` — button title
- `"Stop recording"` — button title
- `"Cancel and discard"` — button title
- `"Recording saved successfully!"` — success toast
- `"Audio file is missing or not available for download."` — error toast
- `"Audio URL is not available."` — error toast
- `"Failed to download recording."` — error toast
- `"Download started."` — success toast

---

## 📚 Library & Playlists

### `components/library/SearchFiltersModal.tsx`
- `"Search songs…"` — search input placeholder
- `"Sort by"` — label
- `"Title"` — sort option
- `"Author"` — sort option
- `"Newest"` — sort option
- `"Filters"` — section heading
- `"Chords"` — filter label
- `"Melody"` — filter label
- `"My Recordings"` — filter label
- `"Favorites"` — filter label
- `"My Songs"` — filter label
- `"New"` — filter label
- `"Status"` — filter section
- `"All"` — status option
- `"Public"` — status option
- `"Drafts"` — status option
- `"Categories"` — section heading
- `"Tags"` — section heading
- `"Search tags or browse categories below..."` — tag search placeholder
- `"Reset"` — button label
- `"Show Results"` — button label
- `"Sign in to access personal filters"` — auth gate message

### `app/library/playlists/page.tsx`
- `"My Playlists"` — page title
- `"New Playlist"` — button label
- `"No playlists yet"` — empty state
- `"Create your first playlist to organize songs."` — empty state description

### `components/playlists/CreatePlaylistInput.tsx`
- `"New playlist…"` — placeholder
- `"Playlist name…"` — placeholder variant
- `"Create"` — button label

### `components/playlists/PlaylistContextMenu.tsx`
- `"Rename"` — context menu item
- `"Delete Playlist"` — context menu item / dialog title
- `"Are you sure you want to delete"` — confirmation body prefix
- `"This action cannot be undone."` — confirmation body suffix
- `"Cancel"` — button
- `"Delete"` — button

### `components/playlists/PlaylistDetailHeader.tsx`
- `"Add Songs"` — button label
- `"songs"` — count suffix

### `components/playlists/AddSongsSheet.tsx`
- `"Add Songs to Playlist"` — sheet title
- `"Search songs…"` — placeholder
- `"No songs found."` — empty state
- `"Done"` — button label

### `components/playlists/PlaylistPicker.tsx`
- `"Add to Playlist"` — button label / title
- `"My Playlists"` — popover heading
- `"No playlists yet"` — empty state
- `"Create one first"` — empty state link
- `"Added to"` — success toast prefix
- `"Removed from"` — success toast prefix

### `app/library/recently-viewed/page.tsx`
- `"Recently Viewed"` — page title
- `"No songs viewed yet."` — empty state

### `app/library/albums/page.tsx`
- `"Albums"` — page title / tab label

### `app/library/artists/page.tsx` / `ArtistsPageContent.tsx`
- `"Artists"` — page title / tab label
- `"No artists found."` — empty state

### `components/library/NewSinceLastVisit.tsx`
- `"New Since Last Visit"` — section heading
- `"View All"` — link text

### `components/library/RecentlyViewed.tsx`
- `"Recently Viewed"` — section heading
- `"View All"` — link text

### `components/home/LibrarySummary.tsx`
- `"Your Favorites"` — section heading
- `"Your favorited songs, always with you"` — description
- `"Your favorited songs"` — aria description
- `"Your Songs"` — section heading
- `"Songs you've contributed to the library"` — description
- `"Songs you've contributed"` — aria description
- `"Your Recordings"` — section heading
- `"Your private rehearsal recordings"` — description
- `"My Drafts"` — section heading
- `"Your work-in-progress songs"` — description
- `"Your private work-in-progress songs"` — aria description
- `"No songs yet — tap ♥ on any song"` — favorites empty state
- `"No songs yet"` — generic empty state
- `"No recordings yet"` — recordings empty state
- `"No drafts yet"` — drafts empty state

---

## 🔍 Explore

### `app/explore/page.tsx`
- `"Explore"` — page title
- `"Browse by Category"` — section heading
- `"Discover songs by theme and tradition"` — section description

### `components/home/CategoryGrid.tsx`
- `"Explore songs related to {category.name}."` — category card description

---

## ⚙️ Account Settings

### `components/account/settings/AccountSettings.tsx`
- `"Account Settings"` — page title
- `"Profile"` — tab label
- `"Security"` — tab label
- `"Preferences"` — tab label
- `"Privacy"` — tab label

### `components/account/settings/ProfileSettings.tsx`
- `"Profile"` — section heading
- `"Display Name"` — field label
- `"Your Full Name"` — placeholder
- `"Email"` — field label (read-only note)
- `"Email change is currently handled via support."` — info message
- `"Avatar"` — section label
- `"Upload Avatar"` — button label
- `"Remove"` — button label
- `"Save Changes"` — button label
- `"Saving..."` — loading state
- `"Profile updated successfully"` — success toast
- `"Failed to update profile"` — error toast
- `"Avatar updated successfully"` — success toast
- `"Failed to upload avatar"` — error toast
- `"Please upload an image file"` — validation error
- `"Image size must be less than 2MB"` — validation error

### `components/account/settings/SecuritySettings.tsx`
- `"Security"` — section heading
- `"Change Password"` — subsection heading
- `"Current Password"` — field label
- `"New Password"` — field label
- `"Confirm New Password"` — field label
- `"Update Password"` — button label
- `"Updating..."` — loading state
- `"Sign out all devices"` — button label
- `"Passwords do not match"` — validation error
- `"Password updated successfully"` — success toast
- `"Failed to update password"` — error toast
- `"Failed to log out from all devices"` — error toast
- `"6-digit code"` — 2FA placeholder
- `"Active Sessions"` — subsection heading

### `components/account/settings/PreferencesSettings.tsx`
- `"App Preferences"` — section heading
- `"Appearance"` — subsection heading
- `"Choose between light, dark, or automatic based on your device settings."` — description
- `"Light"` — theme option
- `"Dark"` — theme option
- `"System"` — theme option
- `"Keep Screen Awake"` — toggle label
- `"Prevent the screen from dimming while viewing lyrics."` — description
- `"Auto-hide navigation bar"` — toggle label
- `"Hide bottom navigation bar on song detail pages after a few seconds of inactivity."` — description
- `"Auto-scroll Lyrics"` — toggle label (coming soon)
- `"Automatically scroll through a song during performance."` — description
- `"Show Chords by Default"` — toggle label (coming soon)
- `"Always show chord annotations when opening a song."` — description
- `"Large Stage Font"` — toggle label (coming soon)
- `"Increase text size for better readability on stage."` — description
- `"Offline Mode"` — toggle label (coming soon)
- `"Cache songs locally for use without an internet connection."` — description
- `"Coming soon"` — badge label

### `components/account/settings/PrivacySettings.tsx`
- `"Privacy Settings"` — section heading
- `"These settings are not yet active."` — notice
- `"Coming soon"` — badge
- `"Make Profile Public"` — toggle label
- `"Allow others to see your public song collections."` — description
- `"Show Activity"` — toggle label
- `"Display when you're live-viewing a shared song."` — description
- `"Data Management"` — subsection heading
- `"Download your personal song data, history, and preferences."` — description
- `"Request Data Take Out (.json)"` — button label
- `"Danger Zone"` — subsection heading
- `"Deleting your account is permanent and will remove all your collections and personalized settings."` — warning
- `"Delete My Account"` — button label

---

## ❌ Feedback States

### `components/common/feedback/NotFound.tsx`
- `"Back to the Hearth"` — button label
- `"Spiritual Inquiry"` — button label
- `"Connected to the Sacred Source"` — footer text
- *(title and description are passed as props — dynamic per usage)*

### `components/common/feedback/AccessDenied.tsx`
- `"Access Denied"` — heading (likely prop)
- `"Back to the Hearth"` — button label

### `components/common/feedback/UnderConstruction.tsx`
- `"Under Construction"` — heading (likely prop)
- `"Coming Soon"` — badge

### `components/common/DeleteConfirmationModal.tsx`
- `"Are you sure?"` — dialog title
- `"This action cannot be undone."` — dialog body
- `"Cancel"` — button
- `"Delete"` — button

### `app/not-found.tsx`
- Delegates to `<NotFound />` component — no direct strings

---

## 🌐 App Metadata & Manifest

### `app/manifest.ts`
- `"Sacred Fire Songs"` — app name
- `"Sacred Fire"` — short name
- `"A digital songbook for medicine music ceremonies."` — description

### `app/layout.tsx`
- `"🔥Sacred Fire Songs"` — `<title>`
- `"A digital songbook for medicine music ceremonies."` — meta description

---

## 📊 String Count Summary

| Feature Area | Approx. Strings |
| :--- | :---: |
| Authentication (login, signup, forgot-pw, etc.) | ~45 |
| Navigation & Chrome (sidebar, header, user profile) | ~20 |
| Songs (list, detail, add/edit form) | ~40 |
| Rehearsal Space (drawer, recorder, mini-player) | ~50 |
| Library & Playlists | ~45 |
| Explore & Categories | ~5 |
| Account Settings (profile, security, prefs, privacy) | ~50 |
| Feedback States (not-found, delete confirm, etc.) | ~15 |
| App Metadata & Manifest | ~5 |
| **Total (estimated)** | **~275** |

---

## 📝 Notes for Phase 2 Implementation

1. **Plural forms needed:** Several strings include counts (e.g. `"X songs"`, `"+{overflow} more"`). The `t()` function needs basic pluralization support.
2. **Interpolated strings:** Many strings use template variables (e.g. `"Added to ${playlistTitle}"`). The `t()` function should support `t('key', { var: value })` interpolation.
3. **Dynamic/Branded strings:** The fire/ceremony-themed strings (e.g. *"Welcome at the Fire"*, *"Back to the Hearth"*, *"Connected to the Sacred Source"*) are intentional brand voice — may want a separate review for whether these should be translated verbatim or adapted.
4. **Category names** (`"The Elements"`, `"Nature"`, etc.) come from the **database taxonomy** — they will need a separate translation layer (or database-level translations), not just dictionary files.
5. **Error messages from Supabase Auth** appear dynamically (e.g. in the auth error page) — these come from the backend and cannot be translated from the dictionary approach alone.
