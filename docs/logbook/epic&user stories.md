# Epics & User Stories: Sacred Fire Songs

**Version:** 1.33
**Status:** Living Document
**Date:** February 28, 2026

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | Dec 25, 2025 | Initial Document Creation. Defined Epics and User Stories for Phases 1-4. |
| **1.1** | Dec 29, 2025 | Added Story 1.3.3 (Navigation) and aligned UI mockups. |
| **1.2** | Jan 04, 2026 | Added stories for Dashboard, Category Filtering, Desktop View, and YouTube links based on user feedback. |
| **1.3** | Jan 10, 2026 | Changed project name to Sacred Fire Songs. |
| **1.4** | Jan 10, 2026 | Added Roles & Permissions Summary table. |
| **1.5** | Jan 10, 2026 | Expanded song management stories (Members create, Owners edit). |
| **1.6** | Jan 10, 2026 | Refactored "Upload" terminology to "Add Song". |
| **1.7** | Jan 11, 2026 | Implemented Edit Song (Story 2.2.1), Access Control, Mock Auth, and Logout. |
| **1.8** | Jan 17, 2026 | Added Story 1.1.6 (Auto-convert Chords) and Story 1.1.2-bis (Smart Paste). |
| **1.20** | Feb 3, 2026 | Added Story 1.1.8 (Draft Auto-Save). |
| **1.21** | Feb 23, 2026 | Removed Home page search box and renamed "Browse Songs" to "Search Songs". |
| **1.22** | Feb 26, 2026 | Codebase audit: marked 1.1.4 as [Partial] (missing card-level delete icons), 1.1.5 as [Not Implemented] (no guest upload modal), 1.1.6 as [Implemented] (full chords-over-lyrics detection and conversion). |
| **1.23** | Feb 26, 2026 | Marked stories 1.3.2, 1.3.4, and 1.3.5 as [Implemented] (SoundCloud embed, YouTube embed, Screen Wake Lock). |
| **1.24** | Feb 26, 2026 | Marked 2.3.1 as [Implemented] (category filtering); removed story 3.1.1 (social login — out of scope). |
| **1.25** | Feb 26, 2026 | GH sync: added stories 1.2.2, 2.3.3; marked 2.3.2, 3.1.2, 4.4.1 as [Implemented]; closed GH #13; fixed GH #56 label (1.1.7→1.1.8). |
| **1.26** | Feb 26, 2026 | Marked 1.1.4 as [Implemented]: delete icons on song cards in library view (owner/admin, hover-visible, top-right overlay) plus profiles RLS policies fix. |
| **1.27** | Feb 26, 2026 | Marked 1.1.5 as [Implemented]: guest upload modal (Log In / Create Account) now shows when unauthenticated user clicks "Add Song". |
| **1.28** | Feb 26, 2026 | Marked 1.1.4 as [Implemented]: delete icons on song cards in library view (owner/admin, hover-visible, top-right overlay) plus profiles RLS policies fix. |
| **1.29** | Feb 28, 2026 | Added playlist feature stories 4.1.3–4.1.10: quick-win playlist enhancements (search-and-add sheet, visibility toggle, shareable link, description) and high-value future features (presentation mode, duplicate, per-song transpose, cover color). |
| **1.30** | Feb 28, 2026 | Added Epic 4.5 (Progressive Web App): stories 4.5.1 (Install as App), 4.5.2 (App icons & branding), 4.5.3 (Offline shell/fallback). Updated Roles & Permissions table. |
| **1.31** | Feb 28, 2026 | Moved PWA install (3.3.1) and branding (3.3.2) to new Epic 3.3 in Phase 3; offline fallback remains as 4.5.1 in Phase 4. |
| **1.32** | Feb 28, 2026 | Added Epic 3.4 Gatekeeper role: stories 3.4.1 (role & permissions), 3.4.2 (flagging & queue), 3.4.3 (metadata editing), 3.4.4 (duplicate merging), 3.4.5 (featured playlists). Updated Roles & Permissions table. |
| **1.33** | Feb 28, 2026 | Removed Musician as a role. Added Epic 3.5: Musician profile setting (self-declared). Role hierarchy is now Guest → Member → Gatekeeper → Admin. Updated Roles & Permissions table. |
| **1.34** | Mar 1, 2026 | GH sync: marked 3.3.1, 3.3.2, 4.1.8 as [Implemented]. Added Story 1.1.9 (Spotify-style mobile bottom nav bar). |


This document breaks down the project roadmap into actionable Epics and User Stories, following the Agile methodology. Acceptance Criteria are defined using **Gherkin syntax** (Given/When/Then).

## Phase 1: The Bare Essentials (MVP)

**Focus:** Core song management and basic public viewing.

### Epic 1.1: Song Management (Admin)

**Story 1.1.1: [Implemented]** As a Member, I want to add a song using a web form so that I can share medicine with the community.

```
Scenario: Admin uploads via Form
  Given I am logged in as an Admin
  And I am on the "Add Song" page
  When I fill in the Title "New Song" and Content "[C]Lyrics"
  And I click the "Add Song" button
  Then a new song should be created in the database
  And I should be redirected to the Home page
```

**Story 1.1.2: [Implemented]** As an Admin, I want to upload a raw `.cho` file via an expandable upload section to auto-fill the form so that I don't have to type metadata manually.

```
Scenario: Import metadata from File via Expandable Section
  Given I am on the Add Song page
  When I click the "Or upload a file" toggle
  And I select a file containing "{title: Grandmother Earth} {author: Traditional}"
  Then the "Title" field should be automatically filled with "Grandmother Earth"
  And the "Author" field should be automatically filled with "Traditional"
  And the "Content" field should be filled with the file body
```

**Story 1.1.2-bis: [Implemented]** As an Admin, I want pasted metadata (title/author) in the lyrics field to populate the form fields automatically so that I can copy-paste full song files easily.

```
Scenario: Smart Paste
  Given I am on the Add Song page
  When I paste content containing "{title: Grandmother Earth} {author: Traditional}" into the "Lyrics & chords" textarea
  Then the "Title" field should be filled with "Grandmother Earth"
  And the "Author" field should be filled with "Traditional"
  And the "Lyrics & chords" field should contain only the song content
```

**Story 1.1.3: [Implemented]** As an Admin, I want to delete a song so that I can remove duplicate or incorrect entries.

```
Scenario: Admin deletes a song
  Given I am logged in as an Admin
  And I am viewing the song list
  When I click the "Delete" icon on the song "Pachamama"
  And I confirm the deletion in the modal
  Then the song "Pachamama" should no longer appear in the list
```

**Story 1.1.4: [Implemented]** As a Member, I want to log in securely so that I can access personalized features.
<!-- Login (magic link + password) works and redirects to Home. Edit/Delete controls visible on song detail page for owner/admin. Delete icons on song cards in the library view implemented (owner/admin, hover-visible top-right overlay). Profiles RLS policies added to fix role fetch. -->

```
Scenario: Successful Admin Login
  Given I am on the Login page
  When I enter a valid email "admin@sacredfire.com" and valid password
  And I click "Sign In"
  Then I should be redirected to the Home page
  And I should see Admin controls (e.g., Upload button, Delete icons)
```

**Story 1.1.5: [Implemented]** As a Guest, I want to be kindly prompted to create an account when I click "Upload" so that I understand this is a community feature.
<!-- /songs/add renders SongForm directly for all users. The only guard is a silent redirect to /auth/login on submit. No "Please join our circle" modal or Log In / Create Account prompt exists. -->

```
Scenario: Guest clicks Upload
  Given I am an unauthenticated Guest
  When I click the "Add Song" icon in the header
  Then I should see a modal or page saying "Please join our circle to share medicine."
  And I should be offered options to "Log In" or "Create Account"
```

**Story 1.1.6: [Implemented]** As a Content Contributor, I want the system to automatically detect and convert songs formatted with "Chords over Lyrics" into standard ChordPro format, so that I don't have to manually reformat existing song sheets when adding them to the library.
<!-- lib/chordProParsing.ts: full detection heuristic, conversion, Title/Author/Key/Capo auto-fill. Paste and file-upload handlers in SongForm. Unit tests in lib/unit-tests/chordProParsing.test.ts. -->

```
Scenario: Paste "Chords over Lyrics" content
  Given I am on the "Add Song" page
  When I paste text with chords over lyrics into the "Lyrics & chords" textarea
  Then the system should detect the format
  And the content should automatically convert to ChordPro format
  And the "Title" and "Author" fields should be populated if present
```

**Story 1.1.7: [Implemented]** As a User, I want to attach YouTube, Spotify, and SoundCloud links to a song so that I can listen to reference recordings directly on the song page.

```
Scenario: Persist and Display Media Links
  Given I am on the "Add Song" or "Edit Song" page
  When I paste a valid URL into the YouTube, Spotify, or SoundCloud fields
  And I save the song
  Then the links should be persisted in the database
  And when I view the song details
  Then I should see the corresponding embedded player(s) for the provided links
```

### Epic 1.2: Public Library & Discovery

**Story 1.2.1: [Implemented]** As a Guest, I want to view a list of all songs so that I can see what is available in the songbook.

```
Scenario: Guest views song library
  Given I am an unauthenticated Guest
  When I visit the Home page
  Then I should see a clear Dashboard with options: "Search Songs", "Upload Song", "Settings"
  When I click "Search Songs"
  Then I should see a list of songs
  And each song card should display a Title and Author
  And the list should load more songs as I scroll down
```

**Story 1.2.2: [Implemented]** As a Guest, I want to search for a song by title or lyrics so that I can quickly find a specific song.

```
Scenario: Search by title
  Given I am on the Songs page
  When I type "Grandmother" into the search field
  Then only songs whose title or lyrics contain "Grandmother" should be visible
```

**Story 1.2.3: [Implemented]** As a Guest, I want to access the Explore and Playlists pages so that I can discover medicine songs without being forced to log in.

```gherkin
Scenario: Guest accesses Explore page
  Given I am an unauthenticated Guest
  When I visit the "/explore" page
  Then I should see the category grid
  And I should not be redirected to the login page

Scenario: Guest accesses Playlists page
  Given I am an unauthenticated Guest
  When I visit the "/playlists" page
  Then I should see the Playlists overview
  And I should not be redirected to the login page
```

### Epic 1.3: Basic Song Viewer

**Story 1.3.1: [Implemented]** As a Musician, I want to see chords displayed above the lyrics so that I can play the song on my guitar.

```
Scenario: Render ChordPro content
  Given a song has content "[Am]Grandmother [C]Earth"
  When I view the Song Detail page
  Then the chord "Am" should be rendered visually above the word "Grandmother"
  And the chord "C" should be rendered visually above the word "Earth"
```

**Story 1.3.2: [Implemented]** As a Guest, I want to listen to an audio reference so that I can learn the melody.

```
Scenario: Display Audio Player
  Given a song has an audio_url "https://soundcloud.com/example"
  When I view the Song Detail page
  Then I should see an embedded SoundCloud player at the bottom of the page
```

**Story 1.3.4: [Implemented]** As a Guest, I want to watch a YouTube video reference so that I can see how the song is played.

```
Scenario: Display YouTube Video
  Given a song has a youtube_url "https://youtube.com/watch?v=example"
  When I view the Song Detail page
  Then I should see an embedded YouTube player
```

**Story 1.3.3: [Implemented]** As a Guest, I want to navigate back to the home screen from any page so that I can easily browse more songs.

```
Scenario: Navigate back to home
  Given I am on the Song Detail page
  When I click the "Back" arrow in the header
  Then I should be redirected to the Home page

**Story 1.3.5: [Implemented]** As a Musician, I want the screen to stay awake while I am viewing a song so that I don't have to touch it to keep the lyrics and chords visible while playing.

```gherkin
Scenario: Prevent screen sleep on Song Detail page
  Given I am on the Song Detail page of a song
  And I am on a supported mobile browser
  When the page load is complete
  Then a Wake Lock should be requested automatically (using Screen Wake Lock API)
  And the screen should remain on regardless of system timeout settings

Scenario: Behavior on visibility change
  Given I have a wake lock active on a song page
  When I switch tabs or minimize the browser
  Then the wake lock should be released
  When I return to the song page tab
  Then the wake lock should be re-acquired automatically
```
```

## Phase 2: Minimal Lovable Product (MLP)

**Focus:** Utility for musicians and better organization.

### Epic 2.1: Music Tools

**Story 2.1.1:** As a Musician, I want to transpose the chords of a song so that I can match my vocal range.

```
Scenario: Transpose Up
  Given the current key is "C"
  And the first chord displayed is "C"
  When I click the "Transpose +1" button
  Then the displayed key should be "C#"
  And the first chord displayed should change to "C#"
```

**Story 2.1.2:** As a Learner, I want to see the melody in sheet music notation so that I can learn the exact notes.

```
Scenario: Render Sheet Music
  Given a song has ABC notation data "C D E F"
  When I view the Song Detail page
  Then I should see a musical staff rendered visually
  And the notes C, D, E, and F should be visible on the staff
```

**Story 2.1.3:** As a Learner, I want to play the melody notes so that I can hear how it sounds without an instrument.

```
Scenario: Play Melody
  Given the sheet music is visible
  When I click the "Play Melody" button
  Then I should hear the notes generated by the synthesizer
  And the cursor should move along the notes as they play
```

### Epic 2.2: Rich Editing

**Story 2.2.1: [Implemented]** As a User, I want to edit the lyrics of a song I uploaded so that I can fix typos.

```
Scenario: Manual Edit
  Given I am logged in as Admin
  And I am on the Edit page for "Song A"
  When I change the text "[C]Hello" to "[G]Hello"
  And I click "Save"
  Then the song should be updated in the database
  And I should be redirected to the Song Detail view showing the chord "G"
```

### Epic 2.3: Taxonomy & Filtering

**Story 2.3.1: [Implemented]** As a Guest, I want to filter songs by category (e.g., "Water", "Fire") so that I can find songs for specific ceremony moments.

```
Scenario: Filter by Category
  Given there are songs tagged "Water" and songs tagged "Fire"
  When I select "Water" from the filter menu
  Then only songs tagged with "Water" should be visible
  And songs tagged with "Fire" should be hidden
```

**Story 2.3.2: [Implemented]** As a Guest & Authenticated Member, I want to open a side menu (hamburger) to access filters easily without cluttering the main view.

```
Scenario: Open Filter Menu
  Given I am on the Song List page
  When I click the hamburger menu icon
  Then a side drawer should slide in
  And I should see filter options for "Theme", "Rhythm", etc.
```

**Story 2.3.3: [Implemented]** As a Guest, I want to browse songs by category page so that I can explore all songs in a specific theme.

```
Scenario: Browse by Category
  Given I am on the Explore page
  When I click on the "Water" category
  Then I should be taken to a page listing all songs tagged "Water"
```


## Phase 3: Community & Evolution

**Focus:** User engagement and crowdsourcing.

### Epic 3.1: User Accounts

**Story 3.1.2: [Implemented]** As a Member, I want to "Heart" songs so that I can quickly access my favorites.

```
Scenario: Add to Favorites
  Given I am logged in
  When I click the "Heart" icon on a song
  Then the icon should change to filled/active
  And the song should appear in my "My Favorites" list
```

### Epic 3.2: Version Control

**Story 3.2.1:** As a Musician, I want to submit a new version of a song (e.g., "Simplified Chords") so that beginners can play it too.

```
Scenario: Add Alternative Version
  Given I am viewing the song "Grandmother Earth"
  When I click "Add Version"
  And I submit valid ChordPro content with the name "Simplified"
  Then a new version should be linked to "Grandmother Earth"
  And it should be viewable via the version selector
```

**Story 3.2.2:** As a Member, I want to vote on song versions so that the best arrangement rises to the top.

```
Scenario: Upvote Version
  Given there are two versions of a song
  When I click "Upvote" on Version B
  Then the vote count for Version B should increment by 1
```

### Epic 3.3: Progressive Web App — Installability

**Story 3.3.1: [Implemented]** As a Musician, I want to install Sacred Fire Songs as an app on my phone or tablet so that I can launch it from my home screen like a native app, without opening a browser.

```gherkin
Scenario: Install prompt on mobile
  Given I am visiting Sacred Fire Songs in a supported mobile browser (Chrome/Safari)
  When the browser detects the app is installable
  Then I should see an "Add to Home Screen" prompt or banner
  And after installing, the app should open in standalone mode (no browser chrome)
  And the app icon should appear on my home screen with the Sacred Fire Songs icon and name

Scenario: Standalone launch
  Given I have installed the app on my home screen
  When I tap the Sacred Fire Songs icon
  Then the app should open in full-screen standalone mode
  And the browser address bar should not be visible
  And the app should load to the home dashboard
```

**Story 3.3.2: [Implemented]** As a Musician, I want the installed app to display Sacred Fire Songs branding (icon, splash screen, theme color) so that it feels like a proper native app rather than a pinned website.

```gherkin
Scenario: App icon and name
  Given the app is installed on my device
  When I view my home screen or app drawer
  Then the icon should display the Sacred Fire Songs logo
  And the app name should read "Sacred Fire Songs" (or a short variant that fits)

Scenario: Splash screen on launch
  Given I open the installed app
  When the app is loading
  Then I should see a branded splash screen with the app icon and background color
  Rather than a blank white screen

Scenario: Status bar theme
  Given I am using the installed app on Android
  Then the status bar and browser toolbar (if visible) should match the app's dark theme color
```

### Epic 3.4: Gatekeeper Role

**Story 3.4.1:** As an Admin, I want to assign the Gatekeeper role to trusted community members so that they can curate the library without having full Admin access.

```gherkin
Scenario: Assign Gatekeeper role
  Given I am logged in as an Admin
  And I am on a user's profile or the user management page
  When I change their role to "Gatekeeper"
  Then they should immediately gain Gatekeeper capabilities
  And lose no capabilities they had as a Musician

Scenario: Gatekeeper accesses their tools
  Given I am logged in as a Gatekeeper
  When I visit the library or a song detail page
  Then I should see Gatekeeper-specific actions (Flag, Edit metadata, Merge)
  That are not visible to Members or Musicians
```

**Story 3.4.2:** As a Gatekeeper, I want to flag songs as "Needs Improvement" or "Duplicate" so that quality issues are visible to the community and tracked in my queue, and the original contributor is informed.

```gherkin
Scenario: Flag a song as needing improvement
  Given I am logged in as a Gatekeeper
  And I am viewing a song detail page
  When I select "Flag — Needs Improvement" from the song actions
  Then a "Needs Improvement" badge should appear on the song card and detail page
  And the song should appear in the Gatekeeper queue under "Needs Improvement"
  And the original poster should receive a notification: "Your song '[title]' has been flagged as needing improvement"

Scenario: Flag a song as a duplicate
  Given I am logged in as a Gatekeeper
  When I flag a song as "Duplicate"
  Then a "Duplicate" badge appears on the song
  And the song appears in the Gatekeeper queue under "Duplicates"
  And the original poster is notified

Scenario: Resolve a flag
  Given a song is flagged
  When I remove the flag (after improvements are made or the duplicate is merged)
  Then the badge disappears from the song card and detail page
  And the original poster receives a notification that the flag has been resolved
  And the song is removed from the Gatekeeper queue
```

**Story 3.4.3:** As a Gatekeeper, I want to edit the metadata and media links of any song so that I can enrich the library without waiting for the original contributor.

```gherkin
Scenario: Add a YouTube link to someone else's song
  Given I am logged in as a Gatekeeper
  And I am on the edit page for a song I did not create
  When I add a valid YouTube URL and save
  Then the YouTube embed should appear on the song detail page
  And the song detail should show "Last updated by [Gatekeeper name]"

Scenario: Update song categories and key
  Given I am logged in as a Gatekeeper
  When I edit the key, capo, or categories of any song
  Then the changes are saved immediately
  And the lyrics and ChordPro content fields are not editable for me
```

**Story 3.4.4:** As a Gatekeeper, I want to merge two duplicate songs into one canonical entry with multiple versions so that the library stays clean and both contributors are acknowledged.

```gherkin
Scenario: Merge a duplicate into a canonical song
  Given I am logged in as a Gatekeeper
  And I am viewing a song flagged as a duplicate
  When I select "Merge with…" and search for and select the canonical song
  And I confirm the merge
  Then the duplicate song becomes an alternate version of the canonical song
  And the canonical song's detail page shows a version selector
  And both original contributors are notified with a link to the merged entry
  And the duplicate song's old URL redirects to the canonical song page

Scenario: Merge is visible in version selector
  Given a song has been merged from two originals
  When any user views the canonical song
  Then they can switch between versions using the version selector
  And each version credits its original contributor
```

**Story 3.4.5:** As a Gatekeeper, I want to mark a public playlist as "Featured" so that it appears in a curated section at the top of the playlists page for all visitors.

```gherkin
Scenario: Feature a playlist
  Given I am logged in as a Gatekeeper
  And I am viewing a public playlist
  When I select "Feature Playlist" from the context menu
  Then the playlist should appear in a "Featured" section at the top of the /library/playlists page
  And the Featured section should be visible to guests and all authenticated users

Scenario: Unfeature a playlist
  Given a playlist is currently featured
  When I select "Remove from Featured" from the context menu
  Then it should move back to the regular Public Playlists section

Scenario: No featured playlists
  Given no playlists are currently featured
  Then the Featured section should not appear on the playlists page
```

### Epic 3.5: Musician Profile Setting

> **Note:** The `musician` role has been removed from the role hierarchy. Playing an instrument and reading chords is a personal skill, not a trust level. Members self-declare this via their profile.
>
> Role hierarchy: **Guest → Member → Gatekeeper → Admin**

**Story 3.5.1:** As a Member, I want to indicate in my profile that I play an instrument and can read chord notation, so that the app shows me musician-focused features like transpose controls and sheet music.

```gherkin
Scenario: Enable musician features from profile
  Given I am logged in as a Member
  And I am on the Profile / Settings page
  When I toggle "I play an instrument and can read chord notation" to on
  And I save my profile
  Then transpose controls should appear on song detail pages
  And sheet music / ABC notation should be visible (when available)
  And a chord icon badge should appear on song cards that have chords
  And a "Chords" filter toggle should appear on the Songs page

Scenario: Disable musician features
  Given I have the musician setting enabled
  When I toggle it off and save
  Then transpose controls should no longer appear on song detail pages
  And chord badges on song cards should be hidden
  And the Chords filter toggle should disappear from the Songs page

Scenario: Default for new accounts
  Given I create a new account
  Then the musician setting should be off by default
  And I can enable it at any time from my profile settings
```

**Story 3.5.2:** As a new user, I want to be asked during sign-up whether I play an instrument, so that the right features are available to me immediately without having to find the setting later.

```gherkin
Scenario: Onboarding question
  Given I have just created an account and verified my email
  When the onboarding flow runs
  Then I should be asked "Do you play an instrument or read chord notation?"
  And answering Yes should set is_musician = true on my profile
  And answering No (or skipping) should leave it false
  And I can always change this later in my profile settings
```

## Phase 4: Professional Toolkit

**Focus:** Tools for ceremony leaders.

### Epic 4.1: Setlists

**Story 4.1.1: [Implemented]** As a Musician, I want to create a named setlist so that I can prepare for a specific night.

```
Scenario: Create Setlist
  Given I am logged in
  When I go to "My Setlists" and click "New"
  And I name it "Full Moon Ceremony"
  Then a new empty setlist named "Full Moon Ceremony" should exist
```

**Story 4.1.2: [Implemented]** As a Musician, I want to reorder songs in my setlist so that the flow matches the ceremony intensity.

```
Scenario: Reorder Setlist
  Given I have a setlist with "Song A" at position 1 and "Song B" at position 2
  When I drag "Song B" to position 1
  Then "Song B" should be at position 1
  And "Song A" should be at position 2
```

**Story 4.1.3:** As a Musician, I want to search for and add songs to a playlist directly from the playlist detail page so that I don't have to navigate away to find songs.

```gherkin
Scenario: Add song via search sheet
  Given I am on the Playlist Detail page
  When I click the "+ Add Songs" button
  Then a search sheet should slide up
  And I should be able to type to filter songs
  And clicking a song should add it to the playlist immediately
  And the song should appear at the bottom of the list
```

**Story 4.1.4:** As a Musician, I want to toggle my playlist between public and private so that I can control who can see it.

```gherkin
Scenario: Make playlist public
  Given I am on the Playlist Detail page of a private playlist
  When I click the visibility toggle (Lock icon)
  Then the playlist should become public
  And the icon should change to a Globe
  And a success toast should confirm the change

Scenario: Make playlist private
  Given I am on the Playlist Detail page of a public playlist
  When I click the visibility toggle (Globe icon)
  Then the playlist should become private
  And the icon should change to a Lock
```

**Story 4.1.5:** As a Musician, I want to share a link to a public playlist so that ceremony co-facilitators can view it.

```gherkin
Scenario: Copy shareable link
  Given I am on the Playlist Detail page of a public playlist
  When I click the "Copy Link" button
  Then the playlist URL should be copied to my clipboard
  And a toast should confirm "Link copied"
```

**Story 4.1.6:** As a Musician, I want to add a description or note to a playlist so that I can remember its purpose (e.g. "Closing songs, slow and grounding").

```gherkin
Scenario: Add description
  Given I am on the Playlist Detail page
  When I click the description area (or an edit icon)
  Then an inline text field should appear
  And when I type and save, the description should persist
  And it should display below the playlist title
```

**Story 4.1.7:** As a Ceremony Leader, I want to enter a full-screen presentation mode for a playlist so that I can read songs clearly during a ceremony without UI chrome.

```gherkin
Scenario: Enter presentation mode
  Given I am on the Playlist Detail page with at least one song
  When I click "Present" or the ceremony mode button
  Then the screen should go full-screen showing the current song's lyrics and chords
  And swiping or pressing arrow keys should advance to the next song
  And the screen wake lock should be active
```

**Story 4.1.8: [Implemented]** As a Musician, I want to duplicate a playlist so that I can create variations without rebuilding from scratch.

```gherkin
Scenario: Duplicate playlist
  Given I am on the Playlist Detail page
  When I select "Duplicate" from the context menu
  Then a new playlist named "Copy of [original name]" should be created
  And it should contain all the same songs in the same order
  And I should be navigated to the new playlist
```

**Story 4.1.9:** As a Musician, I want to set a transposition offset per song within a playlist so that each song is displayed in the right key for our group without modifying the original.

```gherkin
Scenario: Set per-song transpose in playlist
  Given I am on the Playlist Detail page
  When I tap the key indicator next to a song
  Then I should be able to set a +/- semitone offset
  And when I navigate to that song from the playlist, the chords should be shown transposed
  And the original song in the library should remain unchanged
```

**Story 4.1.10:** As a Musician, I want to assign a cover color or icon to a playlist so that I can visually distinguish my playlists at a glance.

```gherkin
Scenario: Set playlist cover color
  Given I am on the Playlist Detail page
  When I click the playlist thumbnail/icon area
  Then I should see a color picker or icon selector
  And after selecting, the playlist card on the Playlists page should reflect the chosen color/icon
```

### Epic 4.2: Print & Export

**Story 4.2.1:** As a Musician, I want to generate a PDF of my setlist so that I can print it for the ceremony.

```
Scenario: Export PDF
  Given I am viewing a setlist
  When I click "Export PDF"
  Then a PDF file should download
  And the PDF should contain the lyrics and chords for all songs in the setlist
```

**Story 4.2.2:** As a Musician, I want to group songs by category in the PDF so that I can keep "Water" songs together on paper.

```
Scenario: Group by Category in PDF
  Given my setlist contains songs from "Water" and "Fire" categories mixed together
  When I select "Group by Category" in the export options
  And I generate the PDF
  Then the PDF should show all "Fire" songs grouped together
  And followed by all "Water" songs grouped together (or vice versa)
```

### Epic 4.3: Offline Reliability

**Story 4.3.1:** As a Musician, I want to access my setlists while offline so that I can use the app in the forest.

```
Scenario: Offline Access
  Given I have previously viewed "Full Moon Setlist" while online
  And I am currently disconnected from the internet
  When I navigate to "Full Moon Setlist"
  Then the setlist and its songs should load from the cache
  And I should see an "Offline Mode" indicator
```

### Epic 4.4: Desktop Experience

**Story 4.4.1: [Implemented]** As a Guest on a laptop, I want a responsive layout so that the app uses the full screen width effectively.

```
Scenario: Desktop Layout
  Given I am viewing the app on a screen wider than 1024px
  When I view the Song List
  Then the list should be displayed in a grid or multi-column layout
  And the navigation menu should be always visible on the side (instead of a hamburger menu)
```

### Epic 4.5: Progressive Web App — Offline Reliability

**Story 4.5.1:** As a Musician, I want to see a friendly offline page when I have no internet connection, so that I understand what happened instead of seeing a browser error.

```gherkin
Scenario: Offline fallback page
  Given the app is installed and I have no internet connection
  When I open the app or navigate to a page that is not cached
  Then I should see a branded offline page explaining I am not connected
  And the page should suggest I connect to the internet or access a cached playlist
  Rather than showing a generic browser "No internet" error

Scenario: Cached pages still load offline
  Given I have previously visited the home page and song list while online
  When I open the app without internet
  Then the home page shell should still load from the service worker cache
  And cached songs and playlists should remain accessible
```

## Roles & Permissions Summary

> **Role hierarchy:** Guest → Member → Gatekeeper → Admin
> **Musician** is a profile setting (`is_musician`), not a role. Any Member can self-enable it.

| Feature / Action | Guest | Member | Gatekeeper | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Browse & Search Songs** | ✅ | ✅ | ✅ | ✅ |
| **View Chords & Lyrics** | ✅ | ✅ | ✅ | ✅ |
| **Listen to Audio/Video** | ✅ | ✅ | ✅ | ✅ |
| **Play Melody (Synth)** | ✅ | ✅ | ✅ | ✅ |
| **Favorite Songs** | ❌ | ✅ | ✅ | ✅ |
| **Vote on Versions** | ❌ | ✅ | ✅ | ✅ |
| **Add/Create Songs** | ❌ | ✅ | ✅ | ✅ |
| **Edit Own Songs** | ❌ | ✅ | ✅ | ✅ |
| **Create/Edit Setlists** | ❌ | ✅ | ✅ | ✅ |
| **Export/Print PDF** | ❌ | ✅ | ✅ | ✅ |
| **Submit New Version** | ❌ | ✅ | ✅ | ✅ |
| **Transpose Chords** *(requires is_musician)* | ❌ | ✅¹ | ✅¹ | ✅ |
| **Sheet Music / ABC Notation** *(requires is_musician)* | ❌ | ✅¹ | ✅¹ | ✅ |
| **Edit Metadata & Links (any song)** | ❌ | ❌ | ✅ | ✅ |
| **Flag Songs (needs improvement, duplicate)** | ❌ | ❌ | ✅ | ✅ |
| **Merge Duplicate Songs** | ❌ | ❌ | ✅ | ✅ |
| **Feature / Unfeature Playlists** | ❌ | ❌ | ✅ | ✅ |
| **Edit Lyrics/Chords (any song)** | ❌ | ❌ | ❌ | ✅ |
| **Delete Songs** | ❌ | ❌ | ❌ | ✅ |
| **Manage Users & Roles** | ❌ | ❌ | ❌ | ✅ |
| **Install as App (PWA)** | ✅ | ✅ | ✅ | ✅ |

*¹ Only when `is_musician = true` on the user's profile (self-declared setting)*


**Story 1.1.8: [Implemented]** As a Member, I want my new song drafts to be saved automatically to my browser's local storage so that I don't lose my work if I navigate away.

```
Scenario: Draft Auto-Save
  Given I am on the "Add Song" page
  When I type in the Title, Author, Lyrics, or Metadata fields
  Then the data should be saved to localStorage

Scenario: Restore draft
  Given I have unsaved changes
  And I navigate away
  When I return to the "Add Song" page
  Then the fields should be populated with the saved data
```

    *   **Acceptance Criteria:**
        *   Form data (Title, Author, Lyrics, Metadata) is saved to `localStorage` on change.
        *   Returning to `/songs/add` restores the saved data.
        *   Submitting the song successfully clears the draft.
        *   Draft persistence only applies to the "Add" mode, not Edit.

**Story 1.1.9: [Not Implemented]** As a User, I want a Spotify-style mobile bottom navigation bar with Home, Search, Your Library, and Create tabs so that I can navigate the app with one hand.

```
Scenario: Bottom bar visible on mobile
  Given I am viewing any page on a mobile device (< md breakpoint)
  Then I should see a fixed bottom navigation bar with four tabs: Home, Search, Your Library, and Create
  And the bottom bar should not appear on tablet or desktop

Scenario: Navigate via bottom bar
  Given I see the bottom navigation bar
  When I tap "Home"
  Then I should navigate to the home/dashboard page
  When I tap "Search"
  Then I should navigate to the songs page with the search field focused
  When I tap "Your Library"
  Then I should navigate to the playlists/library page
  When I tap "Create"
  Then I should navigate to the add song page (or show a guest nudge if not authenticated)

Scenario: Active tab indicator
  Given I am on the songs page
  Then the "Search" tab in the bottom bar should be visually highlighted
  And the other tabs should appear in their default inactive state

Scenario: Avatar replaces hamburger icon
  Given I am logged in on a mobile device
  Then the hamburger menu icon in the header is replaced by my avatar (or initials)
  When I tap the avatar
  Then the side menu slides open containing my personal menu (profile, settings, logout)

Scenario: Top-right avatar hidden on mobile
  Given I am on a mobile device
  Then the personal avatar button in the top-right header area should not be visible
  And it should remain visible on tablet and desktop

Scenario: Guest bottom bar
  Given I am not logged in on a mobile device
  Then the bottom bar should still show Home, Search, and Your Library
  And "Create" should show a sign-in nudge when tapped
  And the hamburger icon should remain (no avatar replacement)
```
