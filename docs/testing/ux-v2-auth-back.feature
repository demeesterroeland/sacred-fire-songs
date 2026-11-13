# Version: 1.0 | Date: Nov 6, 2026
# Changelog
# 1.0 | Nov 6, 2026 | Story 6.1.25 / G5.4 (#409): auth pages have no fake ✕; "Back" returns to the page the guest came from, else Home.
@story-6.1.25
Feature: Auth pages have an honest way back
  As a Guest
  I want auth pages without a fake close button
  So that I always know where I go

  @unit
  Scenario: The login and sign-up forms have no close button
    Given the login and sign-up forms
    Then neither has a close button that leaves for Home
    And both use design tokens only

  @unit
  Scenario: Back leads to the page the guest came from
    Given the auth pages Back link
    When the next target is "\/songs\/abc"
    Then Back leads to "\/songs\/abc"
    And without a next target Back leads Home
    And a hostile or auth-page next target leads Home

  @unit
  Scenario: Forgot-password keeps the way back
    Given the forgot-password page
    Then its Back link and its sign-in link return to login with the same next target

  @e2e
  Scenario: Leaving the login page
    Given a guest on the login page coming from a song
    When they tap "Back"
    Then they return to that song
