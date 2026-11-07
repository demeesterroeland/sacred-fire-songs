# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.3 / G1.3 (#387): small labels are readable — no text below 12 px, sentence-case section titles, axe-core colour-contrast check.
@story-6.1.3
Feature: UX v2 readable small labels
  As a Member
  I want small labels to be readable
  So that section headings and meta text are not grey-on-grey

  @unit
  Scenario: No rendered text is smaller than 12 px
    Given the app and component sources
    When they are scanned for font sizes below 12 px
    Then no sub-12 px font size is found outside the documented allow-list

  @unit
  Scenario: Section titles are sentence case, never ALL CAPS
    Given the section title copy keys of the home, library and playlists pages
    Then every English section title is sentence case
    And no locale writes a section title in capitals

  @unit
  Scenario: Label text colours reach 4.5:1 on every surface
    Given the sober light and dark tokens
    Then "--text-muted" and "--text-subtle" reach 4.5:1 on "--bg", "--surface" and "--surface-2" in both themes

  @e2e
  Scenario: Minimum text size and contrast
    Given the home, songs, song detail and library pages
    When axe-core runs the color-contrast rule
    Then no violation is reported
    And no rendered text is smaller than 12 px
