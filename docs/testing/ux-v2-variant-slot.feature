# Version: 1.2 | Date: Nov 6, 2026
# Changelog
# 1.2 | Nov 6, 2026 | #395 review round 2: a take in progress blocks switching, ?version= deep link and Save return, song flags across versions, keyboard / Practice-follows / take-stops e2e scenarios.
# 1.1 | Nov 6, 2026 | #395 review fixes: unique numbered names (translated pattern), a choice made on another song falls back to the first version, e2e step names what is checked.
# 1.0 | Nov 6, 2026 | Story 6.1.11 / G2.6 (#395): reserved slot for a version switch under the song title.
@story-6.1.11
Feature: UX v2 variant slot under the song title
  As a Contributor
  I want a reserved slot for a variant / language switch under the song title
  So that song variants and translations fit the sober layout later

  @unit
  Scenario: Single version shows no switch
    Given a song with one version
    Then no variant control is rendered

  @unit
  Scenario: A song without versions shows no switch
    Given a song with no version
    Then no variant control is rendered

  @unit
  Scenario: Several versions show a segmented control
    Given a song with versions "Original" and "Simplified"
    Then a segmented control with the names "Original, Simplified" is rendered under the title

  @unit
  Scenario: Blank and repeated version names stay distinguishable
    Given a song with versions "Standard", "Standard" and " "
    Then a segmented control with the names "Standard 1, Standard 2, Version 3" is rendered under the title

  @unit
  Scenario: A real name is never mistaken for a numbered duplicate
    Given a song with versions "Standard", "Standard" and "Standard 1"
    Then a segmented control with the names "Standard 2, Standard 3, Standard 1" is rendered under the title

  @unit
  Scenario: A choice made on another song falls back to the first version
    Given a song with versions "Original" and "Simplified"
    And the reader chose the second version on another song
    Then the first version is shown

  @unit
  Scenario: A version that no longer exists falls back to the first version
    Given a song with versions "Original" and "Simplified"
    And the reader chose a version that was removed
    Then the first version is shown

  @e2e
  Scenario: Single-version song has no control and no extra space
    Given a seeded song with one version on a 390 x 844 viewport
    Then no variant control is rendered
    And the reader toolbar follows the meta lines with no extra gap

  @e2e
  Scenario: Switching versions changes the lyrics
    Given a seeded song with versions "Original" and "Simplified" on a 390 x 844 viewport
    Then the segmented control with both names is shown under the title
    When I tap "Simplified"
    Then the lyrics of the simplified version are shown
    And "Simplified" is the pressed segment

  @unit
  Scenario: A take in progress blocks a switch to another version
    Given a song with versions "Original" and "Simplified"
    And the recorder holds a take that is not saved
    When the reader taps the other version
    Then the version is not switched

  @unit
  Scenario: Without a take in progress the switch is instant
    Given a song with versions "Original" and "Simplified"
    And the recorder holds no take
    When the reader taps the other version
    Then the version is switched

  @unit
  Scenario: The version link opens that version and falls back safely
    Given a song with versions "Original" and "Simplified"
    And the address has the second version as its version parameter
    Then the second version is shown
    But an unknown version parameter shows the first version

  @unit
  Scenario: Saving a lyrics-only version keeps the chords of another version
    Given a song whose "Original" version has chords and whose "Simplified" version is lyrics only
    Then the song has chords
    And the song has chords after only the "Simplified" version is saved

  @unit
  Scenario: Save returns to the version that was edited
    Given the "Simplified" version of a song was edited
    Then the return address is the song with that version

  @e2e
  Scenario: Keyboard: arrow keys move through the versions
    Given a seeded song with versions "Original" and "Simplified" on a 390 x 844 viewport
    When I focus "Original" and press the right arrow
    Then "Simplified" is the pressed segment and its lyrics are shown
    And Home returns to "Original"

  @e2e
  Scenario: Practice follows the chosen version
    Given a seeded song whose "Simplified" version has a reference track and "Original" has none
    Then Practice opens on Record for "Original" without a Listen tab
    When I choose "Simplified"
    Then Practice shows the Listen tab

  @e2e
  Scenario: Switching versions stops a playing take and hides the mini player
    Given a signed-in member who saved a take on "Original" and plays it
    When I close the drawer and choose "Simplified"
    Then nothing keeps playing and the mini player is gone
    And the take and its audio file are removed again at the end of the test

  @e2e
  Scenario: A take in progress survives a tap on another version
    Given a signed-in member who picked an audio file and typed a take name in the Practice drawer
    When I close the drawer and tap "Simplified"
    Then "Original" stays selected and a message asks me to finish or discard the take
    And the Practice drawer is back on Record with the picked file and the typed name
    When I discard the take and tap "Simplified"
    Then "Simplified" is selected at once

  @e2e
  Scenario: A version link opens that version and coexists with a take link
    Given a seeded song with versions "Original" and "Simplified"
    When I open the song with the version link of "Simplified"
    Then "Simplified" is selected
    And tapping "Original" shows its lyrics without changing the address
    And an unknown version in the link shows "Original"
    And a take link next to the version link still shows "Simplified"

  @e2e
  Scenario: Editing the second version returns to it and names it
    Given a signed-in owner of a song whose "Original" version has chords and whose "Simplified" version is lyrics only
    When I open Edit on the "Simplified" version
    Then the form says "Editing version: Simplified"
    When I save
    Then the reader opens on "Simplified" and the song keeps its chords flag
    And a single-version song shows no version caption on Edit

