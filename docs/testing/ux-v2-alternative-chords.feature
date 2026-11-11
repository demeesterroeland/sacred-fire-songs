# Version: 1.0 | Date: Nov 11, 2026
# Changelog
# 1.0 | Nov 11, 2026 | Story 6.2.16 / G4.2 (#519): alternative chords such as A7/C7 transpose together; bass-note slash chords keep their bass. Named ux-v2-* so the existing cucumber globs pick it up.
@story-6.2.16
Feature: Alternative chords
  As a Musician
  I want alternative chords like A7/C7 shown and transposed correctly
  So that the chord line stays right in every key

  @unit
  Scenario: Alternative chords transpose together
    Given the chord "A7/C7"
    When I transpose +2
    Then it shows "B7/D7"

  @unit
  Scenario: Slash chords keep their bass
    Given the chord "C/E"
    When I transpose +2
    Then it shows "D/F#"

  @unit
  Scenario: A slash with a full chord on each side is two alternatives, a bare note is a bass
    Then "Am/Em" is two alternatives "Am" and "Em"
    And "Am/C" is one chord with a bass note
