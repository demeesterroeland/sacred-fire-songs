# Version: 1.0 | Date: Nov 11, 2026
# Changelog
# 1.0 | Nov 11, 2026 | Story 6.2.6 (#509, G1.1): versions labelled by songbook or language, ordered original, variants, translations; the switch fits a 375 px phone.
@ux-v3 @version-labels
Feature: Versions named after their book or language
  As a reader
  I want each version labelled with its songbook or language and the switch to fit my phone
  So that I know which version I am reading

  @unit
  Scenario: Versions are named after their book
    Given a song with versions from "Songbook A" and "Songbook B"
    Then the switch shows both book names

  @unit
  Scenario: A translation is named after its language, in my language
    Given a song with an original from "Songbook A" and a translation named "English"
    When the app language is Dutch
    Then the switch shows "Songbook A" and "Engels"

  @unit
  Scenario: Without a book or a known language the version name is shown
    Given a song with versions named "Standard" and "Simplified" and no songbook
    Then the switch shows "Standard" and "Simplified"

  @unit
  Scenario: Original first, then variants, then translations
    Given a song with a translation, a variant and an original, created in that order
    Then the versions are ordered original, variant, translation

  @e2e
  Scenario: Many versions fit a phone
    Given a song with 4 versions on a 375 px screen
    Then every option is reachable without the page scrolling sideways
