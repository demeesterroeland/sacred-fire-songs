# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | #564: a song that is not public is "Private", never "Draft". #565: a song without an author shows "No artist".
@issue-564 @issue-565
Feature: One word for private songs and for songs without an artist
  As a Member
  I want a song that is not public to be called "Private" everywhere, and a song without an author to show "No artist"
  So that the app uses one word for one thing and never claims a song is traditional when nobody entered an author

  # ── #564: Private, not Draft ──────────────────────────────────────────────────

  @unit
  Scenario: Search filter labels
    Given the English message file
    Then the song visibility options read "Public" and "Private"
    And no song visibility label contains the word "Draft"

  @unit
  Scenario: Song form save button
    Given the English message file
    Then the save option for a song that is not public reads "Save as private"

  @unit
  Scenario: Every locale
    Given the 8 locale files
    Then no song-visibility label uses the local word for "draft"

  @e2e
  Scenario: Search filter popup
    Given a signed-in member on /songs
    When they open the filter popup
    Then the visibility options read "Public" and "Private"
    And the word "Draft" does not appear

  @e2e
  Scenario: Song form
    Given a member on the Add Song form
    Then the save option for a song that is not public reads "Save as private"

  # ── #565: No artist, not Traditional ──────────────────────────────────────────

  @unit
  Scenario: Song row without an author
    Given a song row for a song with no author
    When the song row meta line is built in English
    Then the song row meta line reads "No artist"
    And it does not read "Traditional"

  @unit
  Scenario: Author entered as Traditional
    Given a song row for a song whose author is "Traditional"
    When the song row meta line is built in English
    Then the song row meta line reads "Traditional"

  @unit
  Scenario: Every locale has its own "No artist"
    Given the 8 locale files
    Then every locale says "No artist" with a word other than its "Traditional"
    And the admin artist fallback equals that locale's "No artist"

  @e2e
  Scenario: Song row and song page
    Given a public song with no author
    When a reader sees it in the song list or opens it
    Then the meta line shows "No artist"
    And it does not show "Traditional"

  @e2e
  Scenario: Admin detail
    Given an admin opens the member page of the owner of a song without an author
    Then the artist field shows "No artist"
