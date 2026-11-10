# Version: 1.1 | Date: Nov 11, 2026
# Changelog
# 1.1 | Nov 11, 2026 | Owner review: section labels at the x of the search field; members get the same layout under six personal counts; one dark background.
# 1.0 | Nov 10, 2026 | Story 6.1.36 (#488): Recently added on Home in the columns of the category grid and of /songs.
@story-6.1.36
Feature: UX v2 Home grid
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
    Then the song titles, the category headings and the category links start at the same x
    And the section labels "Recently added" and "Explore by category" start at the x of the search field

  @e2e
  Scenario: Members get the same layout with their library on top
    Given I am a signed-in member
    When I open the home page
    Then "Your library" comes first, then "Recently added", then the categories
    And "Your library" shows Favorites, Drafts, My songs, My recordings, Shared with me and Shared by me
    And "New songs" is not shown
    And on a screen at least 768 px wide the six counts are one row, three on each song column
    And on a phone they are two rows of three and nothing scrolls sideways
    And the first count of each group starts at the x of the song titles

  @e2e
  Scenario: Shared by me
    Given I am a signed-in member
    When I open "Shared by me" from the home page
    Then I see one row per recording I shared, with the names of the members I shared it with
    And the count on the home page equals the number of rows

  @e2e
  Scenario: One background in dark mode
    Given the dark theme
    When I open the Songs page or a Library page
    Then the content area has the same background as the page

  @e2e
  Scenario: Phone
    Given I am a guest on a phone (390 px)
    When I open the home page
    Then I see 5 recently added songs in one column
    And nothing scrolls sideways
