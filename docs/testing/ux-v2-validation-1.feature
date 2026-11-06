# Version: 1.1 | Date: Nov 7, 2026
# Changelog
# 1.1 | Nov 7, 2026 | Review round on PR #474: pressing a song under the open suggestions opens that song (B1), the column keeps its scroll position (H1), the auto-scroll fold counts the bars and not the padding (H2), the tools sheet and focus when the song starts to fit (M1), one focus cue per field (M2), tag counts meet AA (M3), localised error toasts (M4), Search options in full on a phone (M5), a bracketed section label is not a chord (M6), toolbar alignment (L6), favourites wording (L7).
# 1.0 | Nov 6, 2026 | UX v2 validation round 1 (Part of #375): auto-scroll only when the lyrics run below the fold, expanded meta, one focus style for text fields, suggestions panel in the page flow, search options on tokens, translated feedback, song flags across versions.
@validation-1
Feature: UX v2 validation round 1 fixes
  As someone using the app on a phone
  I want the controls to appear only when they do something, and to look and speak consistently
  So that the owner's validation findings are gone

  # Fix 1 ─────────────────────────────────────────────────────────────────────
  @unit
  Scenario: Auto-scroll is offered only when the end of the lyrics is below the fold
    Given a screen 800 px high
    When the end of the lyrics is 600 px from the top of the page
    Then auto-scroll is not offered
    When the end of the lyrics is 1500 px from the top of the page
    Then auto-scroll is offered

  @e2e
  Scenario: Auto-scroll follows the size of the lyrics and of the window
    Given a guest on a seeded song with chords on a 390 px wide phone
    When the window is tall enough for the whole song
    Then there is no play button and no reading tools button
    When the window becomes short again
    Then the play button is back

  # Fix 2 ─────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: The expanded meta line shows each author and tag once, as underlined links
    Given a seeded song with an author and tags
    When I expand the meta line
    Then the author and every tag appear once, as links that are underlined without hover
    And the chevron collapses the list again

  # Fix 3 ─────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: A text field shows one focus cue
    Given the New Playlist page
    When the name field has focus
    Then it shows a 2 px accent underline and no focus box
    And a boxed text field shows the 2 px focus outline and no ring on top of it

  # Fix 4 ─────────────────────────────────────────────────────────────────────
  @e2e
  Scenario: The search suggestions push the page down
    Given the song list on a phone
    When I focus the search field
    Then the suggestions are above the first song, not over it
    And Escape closes them and the list moves back up

  # Fix 5 ─────────────────────────────────────────────────────────────────────
  @unit
  Scenario: A selected category shows its name, never its slug
    Given the category "spiritual-concepts" named "Spiritual Concepts"
    Then its chip reads "Spiritual Concepts"
    And a category that is not known yet reads "Medicine and healing" for "medicine-and-healing"

  @e2e
  Scenario: Search options use the one accent
    Given the song list filtered on a category
    When I open the search options
    Then "Show results" is the accent and the selected category chip is neutral with a check

  # Fix 6 ─────────────────────────────────────────────────────────────────────
  @unit
  Scenario: Feedback the hooks give is translated in all 8 languages
    Then every language has the keys for the favourite toasts, the delete error, the rename toast and the settings intro

  # Fix 7 ─────────────────────────────────────────────────────────────────────
  @unit
  Scenario: A song has chords when any version has them; the reader follows the version shown
    Given a song whose Original has chords and whose Simplified is lyrics only
    Then the song is flagged as having chords
    And the Original offers the Chords switch and transpose
    And the Simplified offers neither

  @e2e
  Scenario: Showing the lyrics-only version hides the Chords switch, the song is still found by the chords filter
    Given a public song whose Original has chords and whose Simplified is lyrics only
    When I show the Simplified version
    Then there is no Chords switch
    And the Chords filter on the song list still finds the song

# Review round (PR #474) ─────────────────────────────────────────────────────
# Component test (jsdom): testing/unit/tests/search/searchFieldFocus.test.tsx
@component
Scenario: A press on a song under the open suggestions opens that song
  Given the suggestions are open and a press is down on a link outside them
  When focus moves to that link before the finger is lifted
  Then the suggestions are still open
  And they close on the click that follows

@e2e
Scenario: Pressing a song below the open suggestions opens that song, on a phone and on a desktop
  Given the song list with the suggestions open
  When I press and release a song that lies below the panel
  Then that song opens and the panel is closed

@e2e
Scenario: Opening and closing the suggestions keeps the scroll position of the page column
  Given a desktop window with the song list scrolled down
  When I open the suggestions and close them again
  Then the column is scrolled exactly as far as before and the panel was visible while open

@unit
Scenario: Lyrics behind the fixed bars count as below the fold
  Given a screen 466 px high with 112 px of fixed bars
  When the end of the lyrics is 450 px from the top of the page
  Then auto-scroll is offered

@e2e
Scenario: Padding below the text is not lyrics
  Given a desktop window where the whole text is visible with 30 px to spare
  Then there is no play button and no reading tools button

@e2e
Scenario: The tools sheet closes when the song starts to fit and focus stays in the toolbar
  Given the reading tools sheet is open on a song that runs below the fold
  When the window becomes tall enough for the whole song
  Then the sheet is gone and focus is on the larger text button

@e2e
Scenario: A field has one focus cue
  Given the tag field of Search options, the artist field and the key, capo and tuning selects
  When each has focus
  Then it shows the 2 px outline once, with no ring and no border change on top

@e2e
Scenario: Tag counts in the open tag browser meet AA contrast
  Given the open tag browser in light and dark
  Then axe finds no colour contrast violation

@unit
Scenario: Failures reach the person in their language, never as sent by the server
  Given a server answer "Playlist not found" and a raw database message
  Then the first is shown as its translated message and the second as the generic message

@e2e
Scenario: Search options show full labels on a phone in every language
  Given a member on a 390 px phone
  When I open Search options in each of the eight languages
  Then no label is cut off

@unit
Scenario: A bracketed section label is not a chord
  Given the versions "[Chorus]" with lyrics, "[Am]" with lyrics and "[am]" with lyrics
  Then only the version with "[Am]" has chords

# Vitest, in an in-memory Postgres (PGlite), also in CI: testing/unit/tests/songs/flagsMigration.test.ts
@component
Scenario: The SQL chord rule agrees with the TypeScript rule
  Given a corpus of texts with labels, chords, a leading byte order mark and U+0085
  Then the migration's helper and hasChords() answer the same for every text

@unit
Scenario: The favourite toasts use the word of the user menu
  Then in every language but Runasimi the favourite toasts name the favourites like the user menu does
