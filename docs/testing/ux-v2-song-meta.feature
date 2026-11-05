# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.7 / G2.2 (#391): song meta and technical values on one grey line each.
@story-6.1.7
Feature: UX v2 song page meta lines
  As a reader
  I want Key, Capo, Tuning and the tags on one grey line each
  So that the first lyric line is visible without scrolling

  @e2e
  Scenario: Lyrics above the fold
    Given a seeded song on a 390 x 844 viewport
    When the page loads
    Then the first lyric line is inside the viewport without scrolling
    And the metadata occupies at most two lines
