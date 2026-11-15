# Version: 1.0 | Date: Nov 6, 2026
# Changelog
# 1.0 | Nov 6, 2026 | Story 6.1.32 / G8.3 (#416): New Playlist explains private vs public in one line, with a visibility switch.
@story-6.1.32
Feature: New Playlist explains private versus public
  As a Member
  I want the New Playlist page to explain private versus public in one line
  So that I know what I am creating

  @unit
  Scenario: Creating a playlist
    Given a member on New Playlist
    Then the page states that the playlist is private unless made public
    And the visibility switch is off
    And the Create button is disabled
    When they type the name "Fire Circle"
    Then the Create button is enabled

  @unit
  Scenario: Making the playlist public changes the explanation
    Given a member on New Playlist
    When they switch the playlist to public
    Then the page states that anyone can find and open the playlist, with or without an account

  @unit
  Scenario: Private is what gets stored unless public was chosen
    Given a member on New Playlist
    When they type the name "Fire Circle"
    Then the playlist would be created private
    When they switch the playlist to public
    Then the playlist would be created public

  @unit
  Scenario: Add to playlist sheet says the same about a new playlist
    Given a member in the Add to playlist sheet
    Then a new playlist is private like on New Playlist

  @unit
  Scenario: Every language explains it
    Then every locale has the New Playlist visibility copy

  @e2e
  Scenario: Creating a public playlist from the phone
    Given a member on New Playlist at 390 px
    When they type a name, switch to public and tap Create
    Then the playlist exists and is public
