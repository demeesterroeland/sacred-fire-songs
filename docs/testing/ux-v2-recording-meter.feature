# Version: 1.0 | Date: Nov 6, 2026
# Changelog
# 1.0 | Nov 6, 2026 | Story 6.1.20 / G4.7 (#404): input level meter, optional 3-2-1 count-in and remaining time in the Practice recorder; Save as the single primary in review.
@story-6.1.20
Feature: Recorder level meter, count-in and remaining time
  As a Member
  I want a level meter, a count-in and the remaining time while recording
  So that I know the microphone works and when the 3-minute limit comes

  @unit
  Scenario: Remaining time shows from the last minute on
    Given a recording at 2:00
    Then the timer shows "1:00 left"
    And no remaining time shows at 1:59

  @unit
  Scenario: The limit is stated before recording
    Given the English messages
    Then the recorder says "Maximum recording length: 3 minutes"

  @unit
  Scenario: Count-in is optional
    Given the count-in is on
    Then the count-in shows 3, 2, 1
    When the count-in is off
    Then recording starts without a count-in

  @unit
  Scenario: Level meter reacts
    Given the recorder is running with a live microphone
    Then silence reads level 0
    And a louder input reads a higher level than a quieter one
    And the meter keeps a rolling history of 8 bars

  @unit
  Scenario: A silent microphone is pointed out
    Given a recording running for 3 seconds
    When no sound was heard
    Then the recorder hints that it hears no sound

  @unit
  Scenario: The no-sound hint is a rolling 3-second window
    Given a recording where the no-sound hint is showing
    When sound is heard again
    Then the hint goes away
    And it needs 3 silent seconds again before it comes back

  @unit
  Scenario: The count-in never counts as silence
    Given a count-in of 5 seconds in a quiet room
    Then no silence is counted towards the hint

  @unit
  Scenario: Every language has the new recorder copy
    Given every supported locale
    Then each defines the meter, limit, time left and count-in messages

  @e2e
  Scenario: Level meter moves with a fake microphone
    Given a member recording in the Practice drawer with the fake microphone
    Then the level meter moves with the input
    And the time left shows in the last minute
