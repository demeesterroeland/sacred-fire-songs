Feature: Setlist PDF Export for Ceremony Printing
  As a Musician
  I want to generate a printable PDF of my setlist
  So that I can have paper chords and lyrics for the ceremony circle

  Background:
    Given I have a setlist titled "Ceremony Fire Circle"

  Scenario: Exporting a setlist with songs to PDF
    Given the setlist contains the following songs:
      | title           | author        | key | capo | content                                               |
      | Morning Sunrise | Shimshai      | Am  | 2    | [Am]Morning sun [C]shining bright [G]in the sky [Am]  |
      | Flor das Aguas  | Mestre Irineu | Em  | 0    | [Em]Flor das aguas da [B7]floresta [Em]sagrada        |
    When I export the setlist to PDF
    Then a valid PDF document should be generated
    And the PDF should include a header with "Ceremony Fire Circle" and song count
    And each song should display its title, author, key, and capo
    And chords should be rendered above their corresponding lyrics
    And the footer on each page should display:
      | Song QR code (1 cm) + site URL | bottom left   |
      | Playlist: <title>              | bottom middle |
      | Page X of Y                    | bottom right  |

  Scenario: Handling transposition override in PDF export
    Given the setlist contains a song "Down to the River" with content "[C]Down to the [G]river to [C]pray"
    And the song has a transposition override of +2 semitones
    When I export the setlist to PDF
    Then the exported song chords should be transposed to "[D]Down to the [A]river to [D]pray"
    And the key directive should be adjusted by 2 semitones

  Scenario: Handling embedded ChordPro capo and key directives
    Given the setlist contains a song with ChordPro content:
      """
      {title: Healing Waters}
      {author: Medicine Tribe}
      {key: G}
      {capo: 3}
      {c: Chorus}
      [G]Waters of [C]life [D]wash over me
      """
    When I export the setlist to PDF
    Then the song metadata in the PDF should extract Key "G" and Capo "3"
    And the comment directive "Chorus" should be styled as a section header or annotation
    And the raw ChordPro directives should not appear as plain lyric text

  Scenario: Handling an empty setlist
    Given the setlist contains 0 songs
    When I view the setlist details or options menu
    Then the PDF export action should be disabled or alert the musician that songs are required
    And no empty PDF file should be generated

  Scenario: Guest user attempts to export PDF
    Given I am an unauthenticated guest viewing a public setlist
    When I click the PDF export action or printer button
    Then the button should be visible
    And a login prompt modal should open with a link to log in
    And no PDF file should be generated

  Scenario: Attempting to export a setlist exceeding the 200 songs maximum limit
    Given the setlist contains 201 songs
    When I export the setlist to PDF
    Then the export should be blocked
    And an alert or message should inform me that maximum 200 songs can be exported
    And no PDF file should be generated

  # Story 4.2.3 (#303) – vitest: testing/unit/tests/pdfExport.test.ts › footer site URL and QR code
  @unit @pdfExport
  Scenario: Footer shows only the site URL and a QR code to the song
    Given the setlist is exported from "https://songbook.example.org"
    And the setlist contains songs with song page URLs
    When I export the setlist to PDF
    Then the bottom-left footer shows only "songbook.example.org"
    And each page shows a 1 cm × 1 cm QR code linking to the song on that page
    And continuation pages of a song reuse that song's QR code
    And pages without a song URL show no QR code

  # Story 4.2.4 (#304) – vitest: testing/unit/tests/pdfCache.test.ts
  @unit @pdfExport
  Scenario: An unchanged playlist reuses the previous PDF
    Given I exported the setlist to PDF
    And nothing in the setlist has changed
    When I export the setlist to PDF again
    Then the previously generated PDF is downloaded without regenerating it

  @unit @pdfExport
  Scenario Outline: A changed playlist generates a new PDF
    Given I exported the setlist to PDF
    When <change>
    And I export the setlist to PDF again
    Then a new PDF is generated

    Examples:
      | change                                   |
      | the song order is changed                |
      | a song is added                          |
      | a song is removed                        |
      | a song's content or key is edited        |
      | the setlist title or description changes |
      | the interface language is switched       |

  @unit @pdfExport
  Scenario: Cached PDFs stay private
    Given two users export setlists on the same device
    Then each user only ever receives their own cached PDF
    And signing out clears every cached PDF
