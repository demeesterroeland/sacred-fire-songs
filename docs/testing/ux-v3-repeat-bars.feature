# Version: 1.1 | Date: Nov 11, 2026
# Changelog
# 1.1 | Nov 11, 2026 | Review fixes: count step checks the parsed count; chords step named for what it checks.
# 1.0 | Nov 11, 2026 | Story 6.2.15 (#518, G4.1): repeat bars ‖: … :‖ (with ×N) around the lines between {start_of_repeat} and {end_of_repeat}.
@ux-v3 @repeat-bars
Feature: Repeat bars in the reader
  As a reader
  I want repeat bars shown in the lyrics
  So that I know which lines the circle sings twice

  @unit
  Scenario: Repeated lines are marked
    Given a song with lines between start_of_repeat and end_of_repeat
    Then those lines are shown between repeat bars

  @unit
  Scenario: The count is shown when it is given
    Given a song whose repeat ends with "{end_of_repeat: x2}"
    Then the repeat is marked to be sung 2 times

  @unit
  Scenario: The bars stay when the chords are off or written over the lyrics
    Given a song with a repeat, with its chords written over the lyrics
    Then the repeated lines are marked, whatever the chord layout

  @unit
  Scenario: Every language names the bars for a screen reader
    Then all languages have text for the repeat bars
