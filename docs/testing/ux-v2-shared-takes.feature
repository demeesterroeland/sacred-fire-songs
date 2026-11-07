# Version: 1.1 | Date: Nov 5, 2026
# Changelog
# 1.1 | Nov 5, 2026 | Review: public takes of others get their own list; no e-mail as sharer name.
# 1.0 | Nov 5, 2026 | Story 6.1.15 / G4.2 (#399), UXD-3: takes shared with me listed separately from my own takes.
@story-6.1.15
Feature: Takes shared with me are listed separately
  As a member
  I want takes shared with me in their own list
  So that I see who shared what and never confuse them with my own takes

  @unit
  Scenario: Shared takes are not listed under My recordings
    Given I own the takes "Morning" and "Evening"
    And "Nina" shared the take "Nina's verse" with me
    When the Record tab lists the takes
    Then "My recordings" lists "Morning" and "Evening"
    And "Shared with me" lists "Nina's verse"
    And "Nina's verse" is not listed under "My recordings"

  @unit
  Scenario: The shared row names who shared it
    Given "Nina" shared the take "Nina's verse" with me
    When the Record tab lists the takes
    Then the shared row shows "Shared by Nina"

  @unit
  Scenario: Public recordings of others are not called shared
    Given "Ana" made the take "Ana's song" public
    And "Nina" shared the take "Nina's verse" with me
    When the Record tab lists the takes
    Then "Public recordings" lists "Ana's song"
    And "Shared with me" lists "Nina's verse"

  @unit
  Scenario: The sharer is never named by e-mail
    Then a sharer without a full name is not named

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
    And the take is not listed under "My recordings"
    And the shared row has no download, share or delete action
