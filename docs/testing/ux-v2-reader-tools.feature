# Version: 1.0 | Date: Nov 6, 2026
# Changelog
# 1.0 | Nov 6, 2026 | Story 6.1.10 / G2.5 (#394): auto-scroll and transpose in the reader toolbar, stay-awake indicator.
@story-6.1.10
Feature: UX v2 reader tools
  As a musician
  I want auto-scroll and transpose next to the text size and chords controls
  So that all reading tools live in one place

  @unit
  Scenario: Transpose from the toolbar
    Given a song in key E with the chords E, A and B
    When I tap transpose "+" twice
    Then every chord is shown two semitones higher: F#, B and C#
    And the key reads "F#"
    And the shift is shown as "+2"

  @unit
  Scenario: Transposing never leaves the range of one octave
    Given a song in key E with the chords E, A and B
    When I tap transpose "+" twelve times
    Then the shift is "+11"
    When I tap "Original key"
    Then the shift is "0" and the chords and key are as written

  @unit
  Scenario: Only musicians can transpose
    Then musicians, experts and admins can transpose
    And members, gatekeepers and guests cannot

  @unit
  Scenario: Auto-scroll has five speeds and keeps its fraction of a pixel
    Given auto-scroll at the default speed
    When I press "Faster" ten times
    Then the speed is level 5
    When I press "Slower" ten times
    Then the speed is level 1
    And the slowest speed still moves the page by whole pixels over time

  @unit
  Scenario: The auto-scroll speed is remembered on this device
    Given the reader preferences at the default size
    When I choose speed level 2 and the preferences are read back from the same storage
    Then the stored speed is level 2
    And older stored preferences without a speed get the default level

  @e2e
  Scenario: Musician transposes from the toolbar on a phone
    Given a musician on a seeded song in key E on a 390 x 844 viewport
    When they open "More reading tools" and tap "Up a semitone" twice
    Then the chords are two semitones higher and the song page shows "Key F#"

  @e2e
  Scenario: One row of 44 px controls that does not cover the lyrics
    Given a seeded song with chords on a 390 x 844 viewport
    Then the toolbar shows Chords, A−, A+, Auto-scroll and More reading tools in one row
    And every control is at least 44 px high and inside the viewport
    And the lyrics start below the toolbar and the last line ends above the action bar

  @e2e
  Scenario: Auto-scroll keeps the toolbar in reach and pauses on a touch
    Given a seeded song with chords on a 390 x 844 viewport
    When I start auto-scroll
    Then the page scrolls and the toolbar sticks right under the title bar
    When I tap the lyrics
    Then auto-scroll is paused and the toolbar scrolls away with the page again

  @e2e
  Scenario: Members and guests get auto-scroll but no transpose
    Given a member on a seeded song with chords on a 390 x 844 viewport
    Then "Auto-scroll" is in the toolbar and "Transpose" is not in the reading tools

  @e2e
  Scenario: Stay-awake indicator
    Given a browser that grants the screen wake lock
    When I open a seeded song
    Then the toolbar shows "Screen stays on" and the reading tools say so in words
