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
      | Song URL          | bottom left   |
      | Playlist: <title> | bottom middle |
      | Page X of Y       | bottom right  |

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
