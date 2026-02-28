# Epics & User Stories: Sacred Fire Songs

**Version:** 1.29
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

**Story 1.1.5: [Not Implemented]** As a Guest, I want to be kindly prompted to create an account when I click "Upload" so that I understand this is a community feature.
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

## Phase 4: Professional Toolkit

**Focus:** Tools for ceremony leaders.

### Epic 4.1: Setlists

**Story 4.1.1:** As a Musician, I want to create a named setlist so that I can prepare for a specific night.

```
Scenario: Create Setlist
  Given I am logged in
  When I go to "My Setlists" and click "New"
  And I name it "Full Moon Ceremony"
  Then a new empty setlist named "Full Moon Ceremony" should exist
```

**Story 4.1.2:** As a Musician, I want to reorder songs in my setlist so that the flow matches the ceremony intensity.

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

**Story 4.1.8:** As a Musician, I want to duplicate a playlist so that I can create variations without rebuilding from scratch.

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

## Roles & Permissions Summary

| Feature / Action | Guest | Member | Musician | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Browse & Search Songs** | ✅ | ✅ | ✅ | ✅ |
| **View Chords & Lyrics** | ✅ | ✅ | ✅ | ✅ |
| **Listen to Audio/Video** | ✅ | ✅ | ✅ | ✅ |
| **Play Melody (Synth)** | ✅ | ✅ | ✅ | ✅ |
| **Favorite Songs** | ❌ | ✅ | ✅ | ✅ |
| **Vote on Versions** | ❌ | ✅ | ✅ | ✅ |
| **Transpose Chords** | ❌ | ❌ | ✅ | ✅ |
| **Create/Edit Setlists** | ❌ | ❌ | ✅ | ✅ |
| **Export/Print PDF** | ❌ | ❌ | ✅ | ✅ |
| **Submit New Version** | ❌ | ❌ | ✅ | ✅ |
| **Add/Create Songs** | ❌ | ✅ | ✅ | ✅ |
| **Edit Own Songs** | ❌ | ✅ | ✅ | ✅ |
| **Edit All Songs** | ❌ | ❌ | ❌ | ✅ |
| **Delete Songs** | ❌ | ❌ | ❌ | ✅ |


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
