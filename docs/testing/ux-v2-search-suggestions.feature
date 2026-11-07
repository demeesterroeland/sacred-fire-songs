# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.29 / G7.1 (#413): recent searches (last 5) and category chips when the search field is focused.
@story-6.1.29
Feature: UX v2 search suggestions
  As a Guest
  I want recent searches and category chips when I focus the search field
  So that I can repeat or narrow a search in one tap

  @unit
  Scenario: Recent searches keep the last 5 searches
    Given a guest who searched "a1", "b2", "c3", "d4", "e5" and "f6" in that order
    Then the recent searches are "f6", "e5", "d4", "c3" and "b2"

  @unit
  Scenario: A repeated search moves to the top
    Given a guest who searched "agua" and then "fuego"
    When they search "agua" again
    Then the recent searches are "agua" and "fuego"

  @unit
  Scenario: Recent searches can be cleared one at a time and all at once
    Given a guest who searched "agua" and then "fuego"
    When they remove "agua" from the recent searches
    Then the recent searches are "fuego"
    When they clear all recent searches
    Then there are no recent searches

  @unit
  Scenario: Blocked browser storage never breaks the search field
    Given a browser that refuses to store site data
    Then reading, adding, removing and clearing recent searches does not fail

  @unit
  Scenario: The suggestion panel is calm and easy to tap
    Given the search suggestion panel
    Then it uses only design tokens and no palette colours
    And every control in it is at least 44 px tall

  @e2e
  Scenario: Recent searches
    Given a guest searched "agua" earlier
    When they focus the search field
    Then "agua" is offered under "Recent searches"

  @e2e
  Scenario: Category chips narrow the song list
    Given a guest on a phone with the search field focused and empty
    When they tap the "Nature" chip
    Then the song list is filtered to that category
    And the "Nature" chip is shown as selected

  @e2e
  Scenario: The panel closes
    Given the suggestion panel is open
    When the guest presses Escape or taps outside it
    Then the panel is gone

  @e2e
  Scenario: The Search tab opens the suggestions
    Given a guest on Home
    When they tap "Search" in the bottom bar
    Then the song list opens, the search field has focus and the suggestions are shown
