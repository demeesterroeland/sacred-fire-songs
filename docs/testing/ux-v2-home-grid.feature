# Version: 1.0 | Date: Nov 10, 2026
# Changelog
# 1.0 | Nov 10, 2026 | Story 6.1.36 (#488): Recently added on Home in the columns of the category grid and of /songs.
@story-6.1.36
Feature: UX v2 Home grid for guests
  As a Guest
  I want the recently added songs on Home in the same columns as the categories and the song list
  So that the page reads as one tidy grid

  # @e2e: e2e/tests/ux-v2-home-grid.spec.ts (390, 768 and 1280 px)

  @e2e
  Scenario: Ten recently added songs in two columns
    Given I am a guest on a screen at least 768 px wide
    When I open the home page
    Then I see 10 recently added songs in two columns, filled row by row
    And the left and right song columns start at the same x as the left and right category columns

  @e2e
  Scenario: The same columns as the Songs page
    Given I am a guest on a screen at least 768 px wide
    When I compare the home page with the Songs page
    Then the song columns start at the same x on both pages

  @e2e
  Scenario: Titles line up with the categories
    When I open the home page as a guest
    Then the song titles, the category headings, the category links and the section labels start at the same x

  @e2e
  Scenario: Phone
    Given I am a guest on a phone (390 px)
    When I open the home page
    Then I see 5 recently added songs in one column
    And nothing scrolls sideways
