# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.2.17 (#520, G4.3): the PDF sheet of a song shows the version's book, capo, beats and repeat bars like the screen; the pinned version and the item's transposition are exported; labels follow the exporting user's language.
@ux-v3 @pdf-export @story-6.2.17
Feature: PDF sheets match the screen
  As a Member
  I want the PDF export to include the version's book, capo, beats and repeat bars
  So that printed sheets match the screen

  @unit
  Scenario: Exported sheet matches the screen
    Given a playlist with a catalog song version with capo 5, beats "8", repeats and the source "Songbook A" page "38" compiled by "Compiler A"
    When I export it to PDF
    Then the sheet shows the meta line "By Author A · Key E · Capo 5 · Standard · Beats 8"
    And the sheet shows the repeat bars "‖:" and ":‖ ×2" around the repeated lines
    And the sheet shows the source line "Songbook A · p. 38 · compiled by Compiler A" under the lyrics

  @unit
  Scenario: A song without capo, beats or source prints no empty labels
    Given a playlist with a song without key, capo, beats, tuning, author or source
    When I export it to PDF
    Then the sheet prints none of the labels "Key", "Capo", "Beats", "Standard", "compiled by"

  @unit
  Scenario: Beats alone still show
    Given a playlist with a song whose only technical value is the beats "8y4"
    When I export it to PDF
    Then the sheet shows the meta line "Beats 8y4"

  @unit
  Scenario: The source line is the one of the song page
    Given a playlist with a song version printed in "Songbook B" on page "2" and as the primary source in "Songbook A" on page "38"
    When I export it to PDF
    Then the sheet shows the same source lines as the song page, primary first

  @unit
  Scenario: Repeat bars share one left edge and a count follows the closing bar
    Given a playlist with a song with a repeat of two lines sung twice
    When I export it to PDF
    Then the repeated lines start at the same indent, right of the other lines
    And the closing bar with "×2" follows the last repeated line

  @unit
  Scenario: A song without repeats prints no bars
    Given a playlist with a song without repeats
    When I export it to PDF
    Then the sheet prints no repeat bars

  @unit
  Scenario: The item's transposition moves the printed key and chords
    Given a playlist item with a song in key "E" transposed by 2 semitones
    When I export it to PDF
    Then the sheet shows the meta line "Key F#"
    And the chords on the sheet are "F#" and "B"

  @unit
  Scenario: A playlist item prints the version it is pinned to
    Given a song with a first version in key "E" with capo 5 and a second version in key "G" without capo, both from different books
    And a playlist item pinned to the second version
    When the export reads the playlist item
    Then the exported song has the key, capo, beats, sources and lyrics of the second version

  @unit
  Scenario: A translation is never printed
    Given a song that has a translation
    Then the export asks for no translations, so the sheet shows the original lyrics

  @unit
  Scenario: The export asks for the sources exactly once
    Then the playlist export select embeds the sources once, from the shared fragment

  @unit
  Scenario Outline: Labels follow the exporting user's language
    Given a playlist with a catalog song version with capo 5, beats "8", repeats and the source "Songbook A" page "38" compiled by "Compiler A"
    When I export it to PDF in the language "<locale>"
    Then the sheet shows the meta line and source line in "<locale>"

    Examples:
      | locale |
      | en     |
      | es     |
      | fr     |
      | it     |
      | nl     |
      | pt     |
      | qu     |
      | ru     |

  @unit
  Scenario: Text added by this story is printed at 9 pt or larger
    Given a playlist with a catalog song version with capo 5, beats "8", repeats and the source "Songbook A" page "38" compiled by "Compiler A"
    When I export it to PDF
    Then the meta line, the source line and the repeat bars are printed at 9 pt or larger

  @unit
  Scenario: A changed beats value or source gives a new PDF
    Given a playlist with a catalog song version with capo 5, beats "8", repeats and the source "Songbook A" page "38" compiled by "Compiler A"
    When the beats or the sources of the song change
    Then the cached PDF is not reused

  @seed
  Scenario: The export's real query is accepted by the local API
    Then the select of the playlist export runs against the local API without error

  @seed
  Scenario: A public playlist item pinned to the second version exports that version
    Given a public playlist whose item is pinned to the second version of a song with a source and transposed by 2
    Then the rows a guest reads for that item export the second version with its source and transposition
