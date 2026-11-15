# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.6 / G2.1 (#390): Chords · A− · A+ reader toolbar under the song title.
@story-6.1.6
Feature: UX v2 reader toolbar
  As a reader
  I want a Chords switch and A− / A+ buttons under the song title
  So that I can read the song at my size, with or without chords

  @unit
  Scenario: Text size stays within the token steps
    Given the reader preferences at the default size
    When I press A+ ten times
    Then the size is the largest lyric step
    When I press A− ten times
    Then the size is the smallest lyric step
    And the chord size is never below 12 px at any step

  @unit
  Scenario: Preferences survive a reload, and broken storage falls back to the defaults
    Given the reader preferences at the default size
    When I press A+ twice and switch chords off
    And the preferences are read back from the same storage
    Then the size is two steps above the default and chords are off
    And unreadable stored preferences give the defaults

  @e2e
  Scenario: Text size persists across reload
    Given a seeded song with chords on a 390 x 844 viewport
    When I press A+ twice
    Then the lyrics grow by two steps
    And after a reload the lyrics keep that size

  @e2e
  Scenario: Chords off hides the chord layer without merging lines
    Given a seeded song with chords on a 390 x 844 viewport
    When I switch Chords off
    Then no chord symbols are shown
    And the number of lyric lines is unchanged
