# Version: 1.1 | Date: Nov 7, 2026
# Changelog
# 1.1 | Nov 7, 2026 | Validation round 2, item 11: the ⋮ menu is the one song menu (reading tools and the Screen stays on switch added).
# 1.0 | Nov 5, 2026 | Story 6.1.9 / G2.4 (#393): sticky Practice · Playlist · ♥ action bar on the song page.
@story-6.1.9
Feature: Sticky action bar on the song page
  As a member
  I want Practice, Playlist and the heart in thumb reach on the song page
  So that the main actions are one tap away and Practice is not hidden behind the ⋮ menu

  @unit
  Scenario: Practice opens Listen when the song has reference media
    Given a song with a reference track
    When the user taps Practice in the action bar
    Then the Practice drawer opens on the "Listen" tab

  @unit
  Scenario: Practice opens Record when the song has no media
    Given a song without reference media
    When the user taps Practice in the action bar
    Then the Practice drawer opens on the "Record" tab

  @unit
  Scenario: The bar hides when scrolling down and shows when scrolling up
    Given a song page with the auto-hide preference on
    When the reader scrolls down 200 px
    Then the action bar is hidden
    When the reader scrolls up 40 px
    Then the action bar is visible

  @unit
  Scenario: The bar always shows when the auto-hide preference is off
    Given a song page with the auto-hide preference off
    When the reader scrolls down 200 px
    Then the action bar is visible

  @unit
  Scenario: The bar sits above the bottom nav and the mini player
    Given any song page just loaded
    Then the action bar is placed above the bottom nav, the mini player and the safe area
    And the page reserves the height of the action bar

  @unit
  Scenario: The bottom nav height is reported whenever the nav is on screen
    Given a song page with the auto-hide preference off
    Then the bottom nav height is "3.5rem"

  @e2e
  Scenario: Two taps to the recorder
    Given a signed-in member on a song page
    When they tap "Practice" and then "Record"
    Then the recorder is ready within two taps

  @e2e
  Scenario: Guest taps the heart
    Given a guest on a song page
    When they tap the heart in the action bar
    Then the sign-in sheet opens with the reason "favorites" and the current path in next=

  @e2e
  Scenario: Guest taps Playlist
    Given a guest on a song page
    When they tap "Playlist" in the action bar
    Then the sign-in sheet opens with the reason "add to playlist" and the current path in next=

  @e2e
  Scenario: The ⋮ menu keeps the song actions and the reading tools
    Given a member who owns a song
    When they open the ⋮ menu on the song page
    Then it offers "Share Song", "Edit" and "Delete", then the reading tools and "Screen stays on"
    And it no longer offers Practice, Playlist or the heart
