# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.17 / G4.4 (#401): take actions in a grouped bottom action sheet.
@story-6.1.17
Feature: Take actions in a grouped bottom sheet
  As a member
  I want the actions of my take in a grouped bottom sheet
  So that Delete is never one tap from Share

  @unit
  Scenario: My own take groups its actions with Delete alone at the bottom
    Given a take that I own
    When I list the actions of the take
    Then the action groups are "Play, Edit recording name, Download recording", "Share, Singer Attribution, Make Public, Copy link" and "Delete recording"

  @unit
  Scenario: Delete is never in the same group as Share
    Given a take that I own
    When I list the actions of the take
    Then "Delete recording" is alone in the last group

  @unit
  Scenario: A take shared with me only offers Play
    Given a take that someone shared with me
    When I list the actions of the take
    Then the action groups are "Play"
    And the take opens no action sheet

  @unit
  Scenario: A swipe down on the sheet handle closes the sheet
    Then a swipe of 120 px down closes the sheet
    And a tap on the handle keeps the sheet open

  @unit
  Scenario: The action labels exist in every language
    Then every language has the texts of the take actions

  @e2e
  Scenario: Grouped actions
    Given a member with a take on a song
    When they tap the actions button of the take on a phone
    Then a bottom sheet opens with "Delete recording" in its own group at the bottom
    And every action row is at least 44 px tall
    And the sheet closes on a swipe down, and on choosing an action
    And "Delete recording" still asks for confirmation
