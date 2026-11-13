# Version: 1.1 | Date: Nov 13, 2026
# Changelog
# 1.1 | Nov 13, 2026 | #574: /explore has no page; old links redirect to /songs (ux-v2-explore-redirect.feature).
# 1.0 | Nov 5, 2026 | Story 6.1.24 / G5.3 (#408): bottom bar is Home · Search · Library (UXD-1); /explore removed.
@story-6.1.24
Feature: UX v2 bottom bar
  As a phone user
  I want a bottom bar with Home, Search and Library
  So that Home, Search and Explore stop overlapping

  @unit
  Scenario: The bar has exactly the decided items
    Given the bottom bar definition
    Then it shows exactly "Home", "Search" and "Library" in that order
    And "Search" opens the song list with the search field focused

  @unit
  Scenario: One item is active at a time
    Given the bottom bar definition
    Then on every page at most one item is marked active

  @unit
  Scenario: Explore is removed
    Given the bottom bar definition
    Then the "\/explore" route and the "nav.explore" message no longer exist

  @e2e
  Scenario: Bottom bar on every page
    Given a phone viewport of 390 px
    When I open Home, the song list and Library
    Then the bottom bar shows exactly Home, Search and Library
    And each item is at least 44 px high with a label of at least 12 px

  @e2e
  Scenario: Search tab
    Given I am on Home
    When I tap "Search" in the bottom bar
    Then I land on the song list and the search field has focus

  @e2e
  Scenario: Create lives in Library
    Given I am a signed-in member on Library
    When I tap "+"
    Then a sheet offers "Add Song" and "New Playlist"
