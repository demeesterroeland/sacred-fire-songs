# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.2.25 / G5.8 (#570): the global search window on every page offers Songbook and Language filters fed by a cheap SECURITY INVOKER count source (`fn_search_filter_counts`) fetched only while the window is open.
@ux-v3 @global-search-filters
Feature: Global search window offers Songbook and Language filters
  As a Guest
  I want the search window on every page to offer the Songbook and Language filters
  So that I can browse one book or one language from anywhere

  @unit
  Scenario: Closed window loads nothing
    Given I am on the home page with the search window closed
    When I do not open the search window
    Then no songbook or language counts are requested

  @unit
  Scenario: Filter by songbook from another page
    Given I am on the home page
    And the count source returns songbook "Book A" with id "book-a" and 12 songs
    When I open the search window
    Then the global search window offers a Songbook option "Book A (12)"
    When I choose the songbook "book-a" and submit the global search
    Then the global search navigates to "/songs?songbook=book-a"

  @unit
  Scenario: Filter by language from another page
    Given I am on a playlist page
    And the count source returns language "Spanish" with slug "spanish" and 7 songs
    When I open the search window
    Then the global search window offers a Language option "Spanish (7)"
    When I choose the language "spanish" and submit the global search
    Then the global search navigates to "/songs?language=spanish"

  @seed
  Scenario: Counts respect what I may read
    Given a test songbook "book-570" titled "Book 570" with 3 public songs and 2 private songs of another user
    When a guest requests search filter counts
    Then the guest sees songbook "book-570" with count 3
    When the private songs' owner requests search filter counts
    Then the owner sees songbook "book-570" with count 5
    When an admin requests search filter counts
    Then the admin sees songbook "book-570" with count 5

  @seed
  Scenario: A songbook with only private songs of another user is hidden from guests
    Given a test songbook "book-570-priv" titled "Private Book 570" with 1 private song of another user
    When a guest requests search filter counts
    Then the guest does not see songbook "book-570-priv"

  @seed
  Scenario: Language counts follow the Languages category group and song privacy, not translations
    Given a public song and a private song of another user both tagged with language "Spanish", and a public song with only a "nl" translation
    When a guest requests search filter counts
    Then the guest sees the "spanish" language count rise by 1 and the "nl" language count unchanged
