# Version: 1.2 | Date: Nov 13, 2026
# Changelog
# 1.2 | Nov 13, 2026 | Owner decision: the reader switch is Original · Translation · Both (three options, `?view=original|translation|both`); the language switch lists languages only and picks the language of Translation / Both. Scenarios per option, the language default, the URL round trip, stale values and a song without a translation.
# 1.1 | Nov 13, 2026 | Review round PR #545: the steps run the page's own rules (lib/songs/readingState.ts); scenarios for transpose and source line in Both, the translator, and a stale ?view=both; each column's direction is read from its lyrics.
# 1.0 | Nov 13, 2026 | Story 6.2.14 (#517, G3.2): Translation · Both reading view; side by side from md up, line under line on a phone.
@ux-v3 @translation-both
Feature: Read the original and the translation together
  As a reader
  I want the original and the translation side by side or line under line
  So that I understand what I sing

  # Rules decided for this story (also in docs/design/application-analysis&design.md):
  #  - A song with at least one translation with lyrics shows the reader switch "Original · Translation · Both" next to
  #    the version switch; a song without one shows no switch and takes no space.
  #  - "Translation" and "Both" use the language picked in the language switch, by default its first language (by name
  #    in the app language). The language switch lists languages only (no "Original": there is one "Original" on
  #    screen) and shows next to Translation / Both when the song has two or more languages. Every state is at most two
  #    taps away: a view, then a language.
  #  - "Both" pairs stanza n of the original with stanza n of the translation: two aligned columns from md up, the
  #    stanza and then its translation on a phone. Extra stanzas on either side keep a row of their own; nothing is
  #    dropped. A stanza without lyrics (a chord intro, a comment) has its own row and does not shift the pairs.
  #  - Chords stay on the original (and follow the Chords switch); the translation is lyrics only.
  #  - A− / A+ size both columns alike. Each column carries its language and a direction read from its lyrics (not
  #    dir="auto", which a leading chord letter would turn left to right); stanzas use logical sides (right-to-left safe).
  #  - In Original and Both, Chords, transpose and the source line follow the original; the translator is named with a
  #    translation. A translation alone is not transposed and has no source line.
  #  - The view lives in the address, not in a device preference: it belongs to the song being read, survives a reload
  #    and travels with the share link. The original has no parameters; Translation / Both write
  #    `?lang=<tag>&view=translation|both`. A `?lang=` link without a view (from before this story) opens that
  #    translation. Values that do not match what is read (unknown view or language, a view on a song without a
  #    translation, `?view=original`) are replaced in the address. Picking another version returns to Original (that
  #    version's own text) and remembers the language. The layout itself (grid classes, logical sides) is covered by
  #    the RTL test testing/unit/tests/song/SongBilingualDisplay.test.tsx.

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
    Then the translation column has language "he" and direction "rtl"
    And the original column has direction "ltr"

  @unit
  Scenario: In Both, transpose and the source line follow the original
    Given a musician reading a song with chords and a translation by "Ana"
    When I pick "Both"
    And I transpose 2 semitones up
    Then the original is transposed 2 semitones and its source line is shown
    And the reader names the translator "Ana"

  @unit
  Scenario: The translation alone is not transposed
    Given a musician reading a song with chords and a translation by "Ana"
    When I pick "Translation"
    And I transpose 2 semitones up
    Then the translation alone is not transposed and shows no source line
    And the reader names the translator "Ana"

  @seed
  Scenario: A guest reads a public Quechua song and its Spanish translation together
    Given a public song with a Quechua original of 2 stanzas and a Spanish translation of 3 stanzas
    When a guest opens it with "Both"
    Then the guest sees 3 rows, the last holding only the Spanish stanza

  Rule: Original · Translation · Both

    @unit
    Scenario: A song opens on the original with the three-option switch
      Given a song with a translation on a 375 px screen
      Then the reader switch offers "Original", "Translation" and "Both" with "Original" chosen
      And the reader shows the original language
      And the reader shows no language switch

    @unit
    Scenario: Translation shows the translation alone
      Given a song with a translation on a 375 px screen
      When I pick "Translation"
      Then the translation "en" is shown alone
      And the address reads "?lang=en&view=translation"

    @unit
    Scenario: Original goes back to the original and clears the address
      Given a song with a translation on a 375 px screen
      When I pick "Both"
      And I pick "Original"
      Then the reader shows the original language
      And the address reads ""
      And the share link ends with "/songs/song-517"

    @unit
    Scenario: A song without a translation shows no reader switch
      Given a song without a translation
      Then the reader shows no reader switch
      And the reader shows no language switch

    @unit
    Scenario: One translation needs no language switch
      Given a song with a translation on a 375 px screen
      When I pick "Translation"
      Then the reader shows no language switch

    @unit
    Scenario: Translation and Both use the language of the language switch, the first one by default
      Given a song with a Dutch and an English translation
      When I pick "Translation"
      Then the translation "nl" is shown alone
      And the language switch lists "Dutch" and "English"
      When I tap the language "en"
      And I pick "Both"
      Then both languages are shown with "en"
      And the address reads "?lang=en&view=both"

    @unit
    Scenario: Original and back returns to the language I was reading
      Given a song with a Dutch and an English translation
      When I pick "Translation"
      And I tap the language "en"
      And I pick "Original"
      And I pick "Both"
      Then both languages are shown with "en"

    @unit
    Scenario: The view is kept in the address and in the share link
      Given a song with a translation on a 375 px screen
      When I pick "Both"
      Then the address reads "?lang=en&view=both"
      And the share link ends with "?lang=en&view=both"
      And opening "?lang=en&view=both" shows both languages

    @unit
    Scenario: Another version returns to the original and remembers the language
      Given a song with a Dutch and an English translation
      When I pick "Translation"
      And I tap the language "en"
      And I pick "Both"
      And I read another version of the song
      Then the address reads "?version=v2"
      And the reader shows the original language
      When I pick "Translation"
      Then the translation "en" is shown alone

    @unit
    Scenario Outline: Links open the right view and stale values are cleaned from the address
      Given a song with a Dutch and an English translation opened with "<link>"
      Then the reader shows "<view>"
      And the address reads "<address>"

      Examples:
        | link                      | view        | address                       |
        | ?lang=en                  | translation | ?lang=en&view=translation     |
        | ?lang=EN&view=Both        | both        | ?lang=en&view=both            |
        | ?view=both                | both        | ?lang=nl&view=both            |
        | ?view=translation&lang=xx | translation | ?lang=nl&view=translation     |
        | ?lang=en&view=side        | translation | ?lang=en&view=translation     |
        | ?lang=xx                  | original    |                               |
        | ?view=original&lang=en    | original    |                               |
        | ?version=v2&view=both     | both        | ?version=v2&lang=nl&view=both |

    @unit
    Scenario: A song without a translation drops a view from the address
      Given a song without a translation opened with "?lang=en&view=both"
      Then the reader shows "original"
      And the address reads ""
      And the reader shows no reader switch
