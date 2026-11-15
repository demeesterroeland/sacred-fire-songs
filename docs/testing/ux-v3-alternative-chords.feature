# Version: 1.1 | Date: Nov 11, 2026
# Changelog
# 1.1 | Nov 11, 2026 | Review of #528: renamed from ux-v2-alternative-chords.feature (the stories of Epic 6.2 are UX v3; cucumber.json has the ux-v3-*.feature glob); three or more alternatives; chords written with ♭, alt, mi, ma or Δ move with their neighbours; spelling follows the key in effect.
# 1.0 | Nov 11, 2026 | Story 6.2.16 / G4.2 (#519): alternative chords such as A7/C7 transpose together; bass-note slash chords keep their bass.
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

  @unit
  Scenario: Three alternatives transpose together
    Given the chord "A7/C7/E7"
    When I transpose +2
    Then it shows "B7/D7/F#7"

  @unit
  Scenario: Chords in other spellings move with their neighbours
    Given the chord "B♭"
    When I transpose +2
    Then it shows "C"
    Given the chord "CΔ7"
    When I transpose +2
    Then it shows "DΔ7"
