# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.15 / G4.2 (#399), UXD-3: takes shared with me listed separately from my own takes.
@story-6.1.15
Feature: Takes shared with me are listed separately
  As a member
  I want takes shared with me in their own list
  So that I see who shared what and never confuse them with my own takes

  @unit
  Scenario: Shared takes are not listed under My takes
    Given I own the takes "Morning" and "Evening"
    And "Nina" shared the take "Nina's verse" with me
    When the Record tab lists the takes
    Then "My takes" lists "Morning" and "Evening"
    And "Shared with me" lists "Nina's verse"
    And "Nina's verse" is not listed under "My takes"

  @unit
  Scenario: The shared row names who shared it
    Given "Nina" shared the take "Nina's verse" with me
    When the Record tab lists the takes
    Then the shared row shows "Shared by Nina"

  @unit
  Scenario: Without shared takes the section is hidden
    Given I own the takes "Morning" and "Evening"
    When the Record tab lists the takes
    Then there is no "Shared with me" section

  @e2e
  Scenario: A member sees a take shared with them in its own section
    Given a member who received a shared take on a song
    When they open the Record tab
    Then a section "Shared with me" lists the take with "Shared by <owner name>"
    And the take is not listed under "My takes"
    And the shared row has no download, share or delete action
