# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.2.14 (#517, G3.2): Translation · Both reading view; side by side from md up, line under line on a phone.
@ux-v3 @translation-both
Feature: Read the original and the translation together
  As a reader
  I want the original and the translation side by side or line under line
  So that I understand what I sing

  # Rules decided for this story (also in docs/design/application-analysis&design.md):
  #  - With a translation chosen in the language switch, a second switch "Translation · Both" appears next to it.
  #    The language switch keeps "Original language", so original · translation · both are each one tap away.
  #  - "Both" pairs stanza n of the original with stanza n of the translation: two aligned columns from md up, the
  #    stanza and then its translation on a phone. Extra stanzas on either side keep a row of their own; nothing is
  #    dropped. A stanza without lyrics (a chord intro, a comment) has its own row and does not shift the pairs.
  #  - Chords stay on the original (and follow the Chords switch); the translation is lyrics only.
  #  - A− / A+ size both columns alike. Each column carries its language and dir="auto" (right-to-left safe).
  #  - The view lives in the address (`?lang=en&view=both`), not in a device preference: it belongs to the song being
  #    read, survives a reload and travels with the share link. Picking another version or the original language
  #    drops it. The layout itself (grid classes, logical sides) is covered by the RTL test
  #    testing/unit/tests/song/SongBilingualDisplay.test.tsx.

  @unit
  Scenario: Both languages on a phone
    Given a song with a translation on a 375 px screen
    When I pick "Both"
    Then each stanza is followed by its translation

  @unit
  Scenario: Desktop shows two columns aligned per stanza
    Given a song with a translation on a desktop screen
    When I pick "Both"
    Then stanza 1 of the original and stanza 1 of the translation share a row
    And stanza 2 of the original and stanza 2 of the translation share a row

  @unit
  Scenario: The original has more stanzas than the translation
    Given a song whose original has 3 stanzas and whose translation has 2
    When I pick "Both"
    Then 3 rows are shown
    And the last row holds only the original

  @unit
  Scenario: The translation has more stanzas than the original
    Given a song whose original has 2 stanzas and whose translation has 3
    When I pick "Both"
    Then 3 rows are shown
    And the last row holds only the translation

  @unit
  Scenario: A chord intro does not shift the pairs
    Given a song whose original starts with a chord intro before 2 stanzas, with a translation of 2 stanzas
    When I pick "Both"
    Then the intro has a row of its own
    And stanza 1 of the original and stanza 1 of the translation share a row

  @unit
  Scenario: A song without a translation shows no Translation · Both switch
    Given a song without a translation
    Then the reader shows no Translation · Both switch

  @unit
  Scenario: The original language shows no Translation · Both switch
    Given a song with a translation on a 375 px screen
    When I read the original language
    Then the reader shows no Translation · Both switch

  @unit
  Scenario: Chords stay on the original
    Given a song with chords and a translation with chords
    When I pick "Both"
    Then the original shows its chords
    And the translation shows no chords

  @unit
  Scenario: The Chords switch hides the chords of the original in Both
    Given a song with chords and a translation with chords
    When I pick "Both"
    And I switch the chords off
    Then no column shows chords

  @unit
  Scenario: A− and A+ size both columns
    Given a song with a translation on a desktop screen
    When I pick "Both"
    And I press "A+"
    Then both columns use the larger lyric size

  @unit
  Scenario: A right-to-left translation flows right to left
    Given a song with a Hebrew translation
    When I pick "Both"
    Then the translation column has language "he" and sets its own direction
    And the original column sets its own direction

  @unit
  Scenario: The view is kept in the address and in the share link
    Given a song with a translation on a 375 px screen
    When I pick "Both"
    Then the address reads "?lang=en&view=both"
    And the share link ends with "?lang=en&view=both"
    And opening "?lang=en&view=both" shows both languages

  @unit
  Scenario: Another version drops the view with the language
    Given a song with a translation on a 375 px screen
    When I pick "Both"
    And I read another version of the song
    Then the address reads "?version=v2"

  @seed
  Scenario: A guest reads a public Quechua song and its Spanish translation together
    Given a public song with a Quechua original of 2 stanzas and a Spanish translation of 3 stanzas
    When a guest opens it with "Both"
    Then the guest sees 3 rows, the last holding only the Spanish stanza
