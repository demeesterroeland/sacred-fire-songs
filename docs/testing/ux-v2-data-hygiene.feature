# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.33 / G9.1 (#417): the demo seed holds no E2E or smoke-test playlists.
@story-6.1.33
Feature: UX v2 clean demo data
  As a Contributor
  I want the demo seed free of E2E and smoke-test playlists
  So that screenshots and demos show real-looking data

  @seed
  Scenario: Clean seed
    Given the local seed is applied
    Then no playlist title contains "E2E" or "Smoke Test"
