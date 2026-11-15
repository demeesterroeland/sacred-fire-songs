# Version: 1.1 | Date: Nov 5, 2026
# Changelog
# 1.1 | Nov 5, 2026 | Review fixes (#396): a take of another song never shows the bar; scrolled-to-end and navigation scenarios.
# 1.0 | Nov 5, 2026 | Story 6.1.12 / G3.1 (#396), UXD-5: the mini player appears only after play.
@story-6.1.12
Feature: Mini player appears only after play
  As a reader
  I want the mini player to appear only after I press play
  So that it does not cover the lyrics and sheets on every song

  @unit
  Scenario: Fresh song page has no player bar
    Given any song page just loaded
    Then the mini player is not rendered

  @unit
  Scenario: Player appears after play and stays when paused
    Given any song page just loaded
    When the user presses play on a reference track
    Then the mini player is rendered
    When the user pauses the track
    Then the mini player is rendered

  @unit
  Scenario: A take of another song does not show the bar on this song
    Given any song page just loaded
    And a take of another song is still the active playback
    Then the mini player is not rendered
    And nothing is reserved at the bottom

  @unit
  Scenario: Player disappears after stop
    Given any song page just loaded
    When the user presses play on a reference track
    And the user stops the player
    Then the mini player is not rendered

  @unit
  Scenario: Sheets and the drawer reserve room while the player is visible
    Given any song page just loaded
    When the user presses play on a reference track
    Then the reserved bottom space equals the bar height plus the bottom nav
    When the user stops the player
    Then nothing is reserved at the bottom

  @e2e
  Scenario: Player appears after play and does not cover the drawer
    Given a member opened the Practice drawer and pressed play on the reference track
    When the drawer is scrolled to the end
    Then the last row is fully visible above the mini player

  @e2e
  Scenario: Playback does not follow the user to another song
    Given a member pressed play on a take of song A
    When the member opens song B
    Then the mini player is not rendered
