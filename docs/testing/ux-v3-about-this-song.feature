# Version: 1.0 | Date: Nov 12, 2026
# Changelog
# 1.0 | Nov 12, 2026 | Story 6.2.8 / G1.3 (#511): "About this song" under the meta line shows the selected version's note, collapsed by default; hidden when the note is empty or whitespace-only; paragraph breaks kept, plain text only.
@story-6.2.8
Feature: About this song
  As a Reader
  I want the note printed with a song in a collapsible "About this song"
  So that I learn its background without it pushing the lyrics down

  @unit
  Scenario: Note is collapsed until opened
    Given a version with the song note "Sung at the first gathering."
    Then "About this song" is shown collapsed
    When I open it
    Then the note is shown

  @unit
  Scenario: A whitespace-only note counts as empty
    Given a version with the song note "   "
    Then "About this song" is not shown

  @unit
  Scenario: A version without a note hides the panel
    Given a version with the song note ""
    Then "About this song" is not shown

  @unit
  Scenario: Switching version shows that version's note
    Given version "Original" with the song note "Written for a wedding."
    And version "Simplified" with the song note ""
    When I switch to version "Simplified"
    Then "About this song" is not shown
    When I switch to version "Original"
    Then "About this song" is shown collapsed

  @unit
  Scenario: Paragraph breaks are kept
    Given a version with the song note:
      """
      First paragraph.

      Second paragraph.
      """
    Then the note has 2 paragraphs
