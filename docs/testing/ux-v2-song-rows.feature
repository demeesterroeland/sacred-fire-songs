# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.2 / G1.2 (#386): song cards become compact rows with one grey meta line.
@story-6.1.2
Feature: UX v2 compact song rows
  As a Guest
  I want song cards and list rows to show a title and one grey meta line
  So that I can scan a list of songs quickly

  @unit
  Scenario: The meta line reads Author · Category · Language
    Given a song by "Herbert Quinteros" tagged "Spanish" (Languages), "Fire" (The Elements) and "Xavier Rudd" (Artists)
    When the song row meta line is built
    Then the meta line reads "Herbert Quinteros · Fire · Spanish"

  @unit
  Scenario: A song without author or tags
    Given a song without author or tags
    When the song row meta line is built
    Then the meta line reads "Traditional"

  @e2e
  Scenario: Compact song rows
    Given the /songs list on a 390 px wide viewport
    Then at least 6 song rows are visible without scrolling
    And each row shows the title and a single meta line
    And no row contains more than two coloured elements
