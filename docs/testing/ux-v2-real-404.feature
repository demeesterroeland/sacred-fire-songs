# Version: 1.1 | Date: Nov 5, 2026
# Changelog
# 1.1 | Nov 5, 2026 | Reworded the copy step to what it checks; the rendered page and status are covered by e2e/tests/real-404.spec.ts.
# 1.0 | Nov 5, 2026 | Story 6.1.22 / G5.1 (#406): unknown URLs show a real 404 page for every role.
@story-6.1.22
Feature: Unknown URLs show a real 404 page
  As a Guest
  I want an unknown URL to show a 404 page
  So that I am not sent to a login screen for content that does not exist

  @unit
  Scenario: Unknown path as guest
    Given a guest opens a path that does not exist
    Then the proxy does not redirect to the login page
    And the "Page not found" copy and a "Go home" label exist in all 8 locales

  @unit
  Scenario: Protected areas still send a guest to login
    Given a guest opens "/admin"
    Then the proxy redirects to the login page

  @unit
  Scenario: Song and recording pages keep their own not-found copy
    Given the song and recording not-found pages
    Then each uses its own title, distinct from "Page not found"
