# Version: 1.0 | Date: Nov 12, 2026
# Changelog
# 1.0 | Nov 12, 2026 | Story 6.2.20 / G5.3 (#523): the edit form changes the beats, note and (admins) the source page of a version; only changed fields are written, blank saves NULL.
@ux-v3 @edit-version-meta
Feature: Edit the beats, note and source of a version
  As a Contributor
  I want to edit the beats, the note and the source of a version in the edit form
  So that catalog data can be corrected in the app

  Beats are a count from 1 to 99, or counts joined with y, &, +, / , - or a comma ("8", "6", "8y4", "3/4"): that is
  what the meta line prints after "Beats" (#510) and what songbook importers write. Free text would read as a sentence there.

  @unit
  Scenario: Contributor corrects the beats
    Given a catalog version with beats "8"
    When a contributor changes it to "6" and saves
    Then the song page shows beats 6

  @unit
  Scenario: Clearing beats and note saves NULL, not an empty string
    Given a catalog version with beats "8" and the note "Old note"
    When a contributor clears both and saves
    Then beats and note are saved as NULL
    And the song page shows no beats and no "About this song"

  @unit
  Scenario: The note keeps its paragraph breaks and is saved as plain text
    Given a catalog version with the note "Old note"
    When a contributor saves the note:
      """
      First paragraph,
      second line.

      <b>Second</b> paragraph & more
      """
    Then the note is saved with its paragraph break and line break, exactly as typed
    And "About this song" shows 2 paragraphs, with the markup as plain text

  @unit
  Scenario Outline: Beats validation
    When a contributor types the beats "<beats>"
    Then the beats are <verdict>

    Examples:
      | beats  | verdict  |
      | 8      | accepted |
      | 6      | accepted |
      | 8y4    | accepted |
      | 8 y 4  | accepted |
      | 3/4    | accepted |
      | 99     | accepted |
      |        | accepted |
      | 0      | refused  |
      | 100    | refused  |
      | waltz  | refused  |
      | 8y     | refused  |
      | <b>8   | refused  |

  @unit
  Scenario: A note that is too long is refused
    When a contributor types a note of 4001 characters
    Then the note is refused as too long

  @unit
  Scenario: Editing an untouched form does not rewrite beats or note
    Given a catalog version with beats " 8 " and the note with extra blank lines
    When a contributor changes only the lyrics and saves
    Then the save writes neither beats nor note
    And a stored beats value that fails the format check ("waltz") does not block that save

  @unit
  Scenario: The source line is read-only for everyone and the correct link is for admins only
    Given a catalog version printed in "Songbook A" on page "38", compiled by "Compiler A"
    Then the edit form shows "Songbook A · p. 38 · compiled by Compiler A" as text
    And an admin is offered the "Correct source" link
    And a member, a gatekeeper and a guest are not
    And only an admin's save can write the source

  @unit
  Scenario: An admin's source correction writes only the changed page or original title
    Given a catalog version printed in "Songbook A" on page "38", compiled by "Compiler A"
    When an admin changes the page to " 39 " and saves
    Then only the page of that source is written, as "39"
    And clearing the original title writes NULL

  @unit
  Scenario: Every language has text for the new fields
    Then all languages have text for beats, note and source in the edit form

  @seed
  Scenario: A contributor saves new beats and the song page reads them
    Given a public song whose version the member contributed, with beats "8" and the note "Old note"
    When the member saves beats "6" through the edit form's update
    Then the stored beats are "6" and the song page meta line shows "Beats 6"

  @seed
  Scenario: Clearing beats and note stores database NULL
    Given a public song whose version the member contributed, with beats "8" and the note "Old note"
    When the member saves the form with beats and note cleared
    Then the database holds NULL for beats and song_note

  @seed
  Scenario: Another member cannot change the beats of that version
    Given a public song whose version the member contributed, with beats "8" and the note "Old note"
    Then the other member's save of beats "6" changes no row

  @seed
  Scenario: Only an admin can correct the source page; nobody changes the catalog keys
    Given a public song whose version the member contributed, with beats "8" and the note "Old note"
    And that version is printed in "Songbook A" on page "38"
    Then the member's correction of the page changes no row
    And an admin's correction of the page to "39" changes the page
    And the member still cannot change the catalog_source_id of that version

  @seed
  Scenario: The edit page's real query is accepted by the local API
    Then the select of the edit page runs against the local API without error and asks for beats and the note
