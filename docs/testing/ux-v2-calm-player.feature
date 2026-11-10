# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.13 / G3.2 (#397): calm and exact player and reference tab.
@story-6.1.13
Feature: Calm and exact player and reference tab
  As a guest
  I want the player and the reference tab to be calm and exact
  So that I always know which provider or take is playing

  @unit
  Scenario: Only available providers are offered
    Given a song with a YouTube link and no Spotify link
    When the Listen tab opens
    Then a "YouTube" button is shown and no "Spotify" button

  @unit
  Scenario: Providers keep a fixed order
    Given a song with a Spotify link, a YouTube link and a SoundCloud link
    When the Listen tab opens
    Then the provider buttons are "YouTube", "SoundCloud", "Spotify"

  @unit
  Scenario: The player names its state in words
    Given a reference track is playing
    Then the player says "Playing"
    When the reference track is paused
    Then the player says "Paused"

  @unit
  Scenario: Control Track is called Open player
    Then the button that opens the Listen tab from the Record tab reads "Open player"

  @e2e
  Scenario: The player is calm and the status line wraps
    Given a member pressed play on the reference track at 390 px width
    Then the mini player has a plain surface and only the play button uses the accent
    And the reference status line is not truncated
    And the Listen tab says which provider is playing
