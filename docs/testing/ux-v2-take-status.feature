# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.16 / G4.3 (#400): text labels next to take status icons.
@story-6.1.16
Feature: Take status is readable without hovering
  As a member
  I want text labels next to take status icons
  So that I understand "public", "shared" and "pending invite" without a tooltip

  @unit
  Scenario: A public take shared with two people shows both texts
    Given a public take shared with two people
    When the take row lists its status
    Then its row shows the texts "Public" and "Shared · 2"

  @unit
  Scenario: A singer without an account shows a pending invite
    Given a take sung by "Ana" who has no account yet
    When the take row lists its status
    Then its row shows the text "Pending invite"

  @unit
  Scenario: A singer who is a verified musician shows it in words
    Given a take sung by the verified musician "Nina"
    When the take row lists its status
    Then its row shows the text "Verified musician"

  @unit
  Scenario: A private take nobody has seen shows no status
    Given a private take that is not shared
    When the take row lists its status
    Then its row shows no status

  @unit
  Scenario: Status texts exist in every language
    Then every language has the status texts

  @e2e
  Scenario: Status is readable on a phone without hovering
    Given a member with a public take shared with two people
    When they open the Record tab on a phone
    Then the take row shows the texts "Public" and "Shared · 2"
    And no status icon depends on a tooltip
