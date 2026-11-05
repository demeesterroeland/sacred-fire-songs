# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.30 / G8.1 (#414): Add to playlist is a bottom sheet, "New playlist" first, check marks, tap toggles.
@story-6.1.30
Feature: Add to playlist as a bottom sheet
  As a Member
  I want Add to playlist as a bottom sheet with "New playlist" first and check marks
  So that I see where the song already is

  @unit
  Scenario: Add to playlist sheet lists check marks and "New playlist" first
    Given the song is in the playlist "Water Ceremony" but not in "Fire Circle"
    When the Add to playlist sheet lists my playlists
    Then "New playlist" is the first row
    And "Water Ceremony" shows a check
    And "Fire Circle" shows no check

  @unit
  Scenario: Tapping a playlist with a check removes the song
    Given the song is in the playlist "Water Ceremony" but not in "Fire Circle"
    When I tap "Water Ceremony" in the sheet
    Then "Water Ceremony" shows no check
    And "Fire Circle" shows no check

  @unit
  Scenario: Tapping a playlist without a check adds the song
    Given the song is in the playlist "Water Ceremony" but not in "Fire Circle"
    When I tap "Fire Circle" in the sheet
    Then "Fire Circle" shows a check
    And "Water Ceremony" shows a check

  @unit
  Scenario: The sheet copy exists in every language
    Then every locale has the Add to playlist sheet copy

  @e2e
  Scenario: A member sees where the song already is
    Given a member with the playlists "Water Ceremony" and "Fire Circle" and a song in "Water Ceremony"
    When they tap "Add to playlist" on that song at 390 px
    Then a bottom sheet lists "New playlist" first, then "Water Ceremony" with a check and "Fire Circle" without
    And tapping "Fire Circle" adds the song and shows a check
    And tapping "Water Ceremony" removes the song and clears its check
