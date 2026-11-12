# Version: 1.0 | Date: Nov 12, 2026
# Changelog
# 1.0 | Nov 12, 2026 | Story 6.2.12 / G2.3 (#515): every author of a song is shown and opens its author filter; the share text names all authors.
@ux-v3 @all-authors
Feature: All authors of a song
  As a Reader
  I want every author of a song shown and tappable
  So that a co-written song credits everyone

  @unit
  Scenario: Co-written song credits both authors
    Given a song with authors "Anna Lee" and "Ben Cruz"
    Then both names are shown and each opens its author filter

  @unit
  Scenario: The author filter finds the song by any of its authors
    Given a song with authors "Anna Lee" and "Ben Cruz"
    Then the author filter for "Ben Cruz" finds the song

  @unit
  Scenario: Empty and duplicate authors are dropped
    Given a song whose authors are "Anna Lee", " anna lee ", "" and "Ben Cruz"
    Then the song shows the authors "Anna Lee" and "Ben Cruz"

  @unit
  Scenario: Without authors the original author is used
    Given a song with no authors and original author "Herbert Quinteros, Cari El"
    Then the song shows the authors "Herbert Quinteros" and "Cari El"

  @unit
  Scenario: Without any author the song is Traditional
    Given a song with no authors and no original author
    Then the song shows the author "Traditional"

  @unit
  Scenario: The joiner follows the UI language
    Given the UI language is "es"
    And a song with authors "Anna", "Ben" and "Cari"
    Then the authors are joined as "Anna, Ben y Cari"

  @unit
  Scenario: The share text names all authors
    Given a song with authors "Anna Lee" and "Ben Cruz"
    Then the share text names "Anna Lee and Ben Cruz"
