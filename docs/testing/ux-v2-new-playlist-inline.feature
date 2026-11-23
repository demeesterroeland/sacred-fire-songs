# Version: 1.0 | Date: Nov 15, 2026
# Changelog
# 1.0 | Nov 15, 2026 | #604: the inline "New playlist" field on Library → Playlists creates only on Enter or Create.
#
# @unit – Cucumber steps in testing/bdd/steps/ux-v2-new-playlist-inline.steps.ts (lib/playlists/inlineCreate.ts).
# The DOM behaviour (focus kept on Create, blur towards Create) is covered by
# testing/unit/tests/playlists/CreatePlaylistInput.test.tsx.
@bug-604
Feature: The inline New playlist field never creates a playlist by accident
  As a Member
  I want a playlist to be created only when I confirm it
  So that tapping elsewhere does not leave stray playlists

  @unit
  Scenario: Clicking away never creates a playlist
    Given I am logged in and the "New playlist" field has the name "Fire Circle" typed
    When I click or tap outside the field
    Then no playlist is created
    And the field is closed

  @unit
  Scenario: Escape cancels
    Given I am logged in and the "New playlist" field has the name "Fire Circle" typed
    When I press Escape
    Then no playlist is created
    And the field is closed

  @unit
  Scenario Outline: Enter or Create creates the playlist
    Given I am logged in and the "New playlist" field has the name "Fire Circle" typed
    When I <action>
    Then the playlist "Fire Circle" is created

    Examples:
      | action             |
      | press Enter        |
      | press Create       |

  @unit
  Scenario: An empty name creates nothing
    Given I am logged in and the "New playlist" field has the name "   " typed
    When I press Enter
    Then no playlist is created
