# Version: 1.0 | Date: Nov 6, 2026
# Changelog
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
