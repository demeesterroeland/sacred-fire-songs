# Version: 1.1 | Date: Nov 13, 2026
# Changelog
# 1.1 | Nov 13, 2026 | Owner decision & review fixes: omit standard tuning completely from the meta line; cover Both view, Translation-only view, and UXA-032 member/guest role chain through readingState + chordTools.
# 1.0 | Nov 13, 2026 | #566: transpose next to the Chords switch; key, capo and tuning only while chords are on. Owner decisions: beats stay with chords off; the tuning is named ("Tuning: Drop D"); after a transpose only the new key shows.
@ux-v3 @chord-tools
Feature: Chord tools in one place
  As a Musician
  I want transpose next to the Chords switch and the chord details shown only while chords are on
  So that everything about chords lives in one place and singers see a clean page

  @unit
  Scenario: Chords on
    Given a reader on a song in key D with tuning Drop D
    When the Chords switch is on
    Then the toolbar shows the transpose stepper next to the Chords switch
    And the meta line shows "Key D · Tuning: Drop D"

  @unit
  Scenario: Standard tuning is omitted from the meta line
    Given a reader on a song in key Am with capo 2, tuning Standard and beats "8"
    When the Chords switch is on
    Then the meta line shows "Key Am · Capo 2 · Beats 8"

  @unit
  Scenario: Chords off
    Given a reader on the same song
    When they switch Chords off
    Then the transpose stepper is hidden
    And key, capo and tuning are hidden
    And the lyrics stay

  @unit
  Scenario: Transpose follows the key
    Given the Chords switch is on
    When the reader taps transpose "+" twice
    Then every chord is two semitones higher
    And the meta line shows "Key E · Tuning: Drop D"

  @unit
  Scenario: Both view with chords on keeps the stepper and shifts the key
    Given a musician reading a song in key D with tuning Drop D and a lyrics-only Dutch translation in "Both" view
    When the Chords switch is on
    Then the toolbar shows the transpose stepper next to the Chords switch
    When the reader taps transpose "+" twice
    Then the meta line shows "Key E · Tuning: Drop D"

  @unit
  Scenario: Translation-only view hides chord tools and keeps beats
    Given a musician reading a song in key D with tuning Drop D, beats "8" and a lyrics-only Dutch translation in "Translation" view
    When the Chords switch is on
    Then there is no Chords switch, no transpose stepper and no key line
    And the meta line shows only "Beats 8"

  @unit
  Scenario: One place only
    Given a reader opens the song page ⋮ menu
    Then it has no Transpose item

  @unit
  Scenario: Song without chords
    Given a song without chords
    Then there is no Chords switch, no transpose stepper and no key line

  # Owner decision: no longer an open question.
  @unit
  Scenario: Beats stay with chords off
    Given a reader on a song in key D with tuning Drop D and beats "8"
    When they switch Chords off
    Then the meta line shows only "Beats 8"

  @unit
  Scenario: A reader who may not transpose still sees the chord details, but no stepper
    Given a member on a song in key D with tuning Drop D
    When the Chords switch is on
    Then the transpose stepper is hidden
    And the meta line shows "Key D · Tuning: Drop D"

  @unit
  Scenario: A guest sees the chord details while chords are on, but no stepper
    Given a guest on a song in key D with tuning Drop D
    When the Chords switch is on
    Then the transpose stepper is hidden
    And the meta line shows "Key D · Tuning: Drop D"

  @unit
  Scenario: The meta line without a Chords switch is as before apart from the tuning label
    Given a version in key D with capo 2, tuning Drop D and beats "8"
    Then a screen that has no Chords switch (the PDF) gets "Key D · Capo 2 · Tuning: Drop D · Beats 8"

  @unit
  Scenario: Every language names the tuning
    Then all languages have a tuning label with the tuning placeholder
