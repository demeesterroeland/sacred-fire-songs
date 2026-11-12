# Version: 1.1 | Date: Nov 12, 2026
# Changelog
# 1.1 | Nov 12, 2026 | Review round (PR #531): page ranges and importer prefixes (`p. 38`, `A-12`, `38 & 40`), original title compared without accents, apostrophe style or trailing punctuation, plural label for several sources, @seed contract: the song page's real select runs against the local API.
# 1.0 | Nov 11, 2026 | Story 6.2.10 (#513, G2.1): grey source line under the lyrics with the songbook, page and compiler of the version being shown; original title when it differs; guests read it through the same RLS as the song.
@ux-v3 @songbook-source @story-6.2.10
Feature: Songbook source line under the lyrics
  As a reader
  I want to see in which songbook and on which page a version appears
  So that I can find it in the printed book and credit its compiler

  @unit
  Scenario: Source line credits the book
    Given a version from "Songbook A" page "38" compiled by "Compiler A"
    Then the song page shows the line "Songbook A · p. 38 · compiled by Compiler A"

  @unit
  Scenario: A page range is shown as pages
    Given a version from "Songbook A" page "12-13" compiled by "Compiler A"
    Then the song page shows the line "Songbook A · pp. 12-13 · compiled by Compiler A"

  @unit
  Scenario Outline: Page notation decides between "p." and "pp."
    Given a version from "Songbook A" page "<page>" compiled by "Compiler A"
    Then the song page shows the line "<line>"

    Examples:
      | page    | line                                              |
      | p. 38   | Songbook A · p. 38 · compiled by Compiler A       |
      | 38–39   | Songbook A · pp. 38–39 · compiled by Compiler A   |
      | 38 & 40 | Songbook A · pp. 38 & 40 · compiled by Compiler A |
      | 38 y 40 | Songbook A · pp. 38 y 40 · compiled by Compiler A |
      | A-12    | Songbook A · p. A-12 · compiled by Compiler A     |
      | II-4    | Songbook A · p. II-4 · compiled by Compiler A     |
      | 12a     | Songbook A · p. 12a · compiled by Compiler A      |

  @unit
  Scenario: The original title shows when it differs from the song title
    Given the song "Rise Up" has a version from "Songbook A" with the original title "Subir"
    Then the song page shows the line "Songbook A · Original title: Subir"

  @unit
  Scenario: The original title stays hidden when it is the song title
    Given the song "Rise Up" has a version from "Songbook A" with the original title "rise up"
    Then the song page shows the line "Songbook A"

  @unit
  Scenario Outline: A cosmetic difference in the original title is not a difference
    Given the song "<title>" has a version from "Songbook A" with the original title "<original>"
    Then the song page shows the line "Songbook A"

    Examples:
      | title      | original   |
      | Pachamama  | Pachamamá  |
      | Mother's   | Mother’s   |
      | Rise Up    | Rise  Up   |
      | Rise Up    | Rise Up!   |

  @unit
  Scenario: Several books are listed, the primary source first
    Given a version printed in "Songbook B" on page "2" and as the primary source in "Songbook A" on page "38"
    Then the song page lists the lines "Songbook A · p. 38" and "Songbook B · p. 2"
    And the list is labelled "Sources"

  @unit
  Scenario: The line follows the selected version
    Given a song with a version from "Songbook A" and a version from "Songbook B"
    When the reader opens the song with "?version=" the second version
    Then the song page shows the line "Songbook B"
    And with no version chosen the song page shows the line "Songbook A"

  @unit
  Scenario: Nothing is shown for a version without sources
    Given a version without sources
    Then the song page shows no source line

  @unit
  Scenario: Older cached song data without sources does not break the page
    Given cached song data from before the sources existed
    Then the song page shows no source line

  @unit
  Scenario: Every language has text for the source line
    Then all languages have text for the source line

  @seed
  Scenario: A guest reads the source of a public song, not of a private one
    Given a public song with a version from "Songbook A" page "38" compiled by "Compiler A"
    And a private song with a version from "Songbook A" page "7"
    Then a guest reads the book, page and compiler of the public version
    And a guest reads no source of the private version

  @seed
  Scenario: The song page's real query is accepted by the local API
    Then the select of the song page runs against the local API without error and returns the sources of each version as a list
