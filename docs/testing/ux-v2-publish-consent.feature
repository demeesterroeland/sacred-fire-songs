# Version: 1.2 | Date: Nov 6, 2026
# Changelog
# 1.2 | Nov 6, 2026 | #405 review round 2: a song visibility that cannot be read is said so (no Publish); a guest is opened on Listen by Practice (also on a wide screen) and by a take link, with the take highlighted; copy: takes already public on the song are listed for everyone on the song page.
# 1.1 | Nov 6, 2026 | #405 review: a take on a private song starts with making the song public; guests hear public takes on the Listen tab (UXD-2); the reversible line no longer promises to undo what was heard; dialog layout and long names; steps now run the real audience rules and messages.
# 1.0 | Nov 6, 2026 | Story 6.1.21 / G4.8 (#405): the publish dialog names the song and says who will hear the take.
@story-6.1.21
Feature: The publish dialog makes consent informed
  As a recording owner
  I want the publish dialog to name the song and say who will hear the take
  So that my consent is informed

  @unit
  Scenario: Informed publish on a public song
    Given the owner of a take "Morning take" on the public song "Danza del Cielo"
    When they open "Make public" on the take
    Then the dialog shows the take "Morning take" and the song "Danza del Cielo"
    And the dialog states that everyone visiting the song, including guests, can listen
    And the dialog offers to publish the take
    And the dialog says the take can be made private again without undoing what was heard

  @unit
  Scenario: A take on a private song starts with the song
    Given the owner of a take "Morning take" on the private song "Danza del Cielo"
    When they open "Make public" on the take
    Then the dialog shows the take "Morning take" and the song "Danza del Cielo"
    And the dialog says the song is private and must be made public first
    And the dialog does not say that guests can listen
    And the dialog does not offer to publish the take
    And the dialog offers the owner to make the song public

  @unit
  Scenario: Someone who does not own the private song is told to ask the owner
    Given a member who does not own the private song "Danza del Cielo" with a take "Morning take"
    When they open "Make public" on the take
    Then the dialog does not offer to publish the take
    And the dialog tells them to ask the song owner

  @unit
  Scenario: The visibility of the song is not known yet
    Given the visibility of the song "Danza del Cielo" is not known yet
    Then the dialog does not offer to publish the take

  @unit
  Scenario: The visibility of the song could not be read
    Given the visibility of the song "Danza del Cielo" could not be read
    Then the dialog says it could not check whether the song is public
    And the dialog does not offer to publish the take

  @unit
  Scenario: A song without a visibility value counts as private
    Given takes on songs that are private, have no visibility value or cannot be read
    Then none of them counts as a take on a public song

  @unit
  Scenario Outline: Practice opens on the tab that lists the takes
    Given a "<who>" follows a take link and "<found>" the take
    Then Practice opens on "<tab>"

    Examples:
      | who    | found      | tab    |
      | member | can see    | Record |
      | guest  | can see    | Listen |
      | guest  | cannot see | Record |

  @unit
  Scenario: The audience sentences exist in every language
    Given every supported language
    Then each language has the audience sentences for a public and for a private song
    And the sentence for a public song names the guests in each language
    And the sentence for a private song does not name the guests in any language
    And the reversible line is reworded in every language

  @e2e
  Scenario: Informed publish in the browser
    Given the member owns a private take on a public song
    When they open "Make Public" in the take actions on a phone
    Then the dialog shows the take name, the song title and that guests can listen
    And the Publish button stays disabled until they confirm the singer consent
    And cancelling leaves the take private and focus returns to the take
    And confirming makes the take public with the singer consent recorded

  @e2e
  Scenario: A long unbroken name does not push the dialog off the screen
    Given the member owns a take with a very long name on a public song
    When they open "Make Public" in the take actions on a phone
    Then the dialog stays inside the screen and the Publish button can be reached

  @e2e
  Scenario: A take on a private song cannot be published
    Given the member owns a take on a private song
    When they open "Make Public" in the take actions on a phone
    Then the dialog says the song is private and must be made public first
    And there is no Publish button
    And making the song public lets the member publish the take

  @e2e
  Scenario: Guests hear public takes on the Listen tab
    Given a public song with a public take that has the singer consent
    When a guest opens Practice on the song page
    Then the Listen tab lists the take, read only, and it plays
    And a song without public takes shows an empty state

  @e2e
  Scenario: A take link opens a guest on the take
    Given a public song with a public take that has the singer consent
    When a guest opens the song page with the link of that take
    Then Practice opens on the Listen tab with the take highlighted and in view
    And the take plays

  @e2e
  Scenario: Practice on a wide screen opens a guest on Listen
    Given a public song with a public take that has the singer consent
    When a guest taps Practice in the header of a wide screen
    Then the Listen tab lists the take
