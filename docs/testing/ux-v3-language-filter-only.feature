# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.2.24 / G5.7 (#569): language is chosen only in the Language filter, not in the category/tag selector; old links with a language slug as category or tag still filter and select Language.
@ux-v3 @language-filter-only
Feature: Choose a language only in the Language filter
  As a Guest
  I want to choose a language only in the Language filter
  So that the search options don't offer the same choice twice

  @unit
  Scenario: The tag selector has no Languages group
    Given the taxonomy has a "Languages" group with "Dutch" and "Spanish"
    When I open Search options on /songs
    Then the category and tag selector shows no "Languages" group
    And I can choose "Dutch" in the Language filter

  @unit
  Scenario: Searching tags does not offer languages
    Given the taxonomy has a "Languages" group with "Dutch"
    When I type "dut" in the category and tag selector
    Then "Dutch" is not offered there

  @unit
  Scenario: An old language link still filters
    Given a bookmarked link "/songs?category=dutch"
    When I open the bookmarked link
    Then only songs in the Dutch language category are listed
    And the Language filter shows "Dutch"

  @unit
  Scenario: An old language tag link still filters
    Given a bookmarked link "/songs?tag=dutch"
    When I open the bookmarked link
    Then only songs in the Dutch language category are listed
    And the Language filter shows "Dutch"
