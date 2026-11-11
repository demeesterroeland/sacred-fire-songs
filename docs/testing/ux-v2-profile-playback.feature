# Version: 1.0 | Date: Nov 11, 2026
# Changelog
# 1.0 | Nov 11, 2026 | Story 6.1.37 (#490): play recordings from a singer profile.
#
# Layering:
#   @unit – Cucumber steps over lib/users/profileRecordings.ts
#           (testing/bdd/steps/ux-v2-profile-playback.steps.ts); the row itself is covered by
#           testing/unit/tests/profile/profileRecordings.test.tsx (Vitest, RTL).
#   @e2e  – e2e/tests/ux-v2-profile-playback.spec.ts (member, 390 px).
@story-6.1.37
Feature: Play recordings from a singer profile
  As a visitor of a singer's profile
  I want to play the recordings listed there
  So that I can hear the singer without opening every song first

  @unit
  Scenario: Only recordings whose file could be signed get a play URL
    Given the storage signed "a.mp3" and could not sign "b.mp3"
    When the profile recordings get their play URLs
    Then "a.mp3" has a play URL
    And "b.mp3" has no play URL

  @e2e
  Scenario: Play a recording on the profile
    Given a singer profile lists a recording I am allowed to hear
    When I press its play button
    Then the recording plays on the profile page
    And the button reads "Pause <name>"

  @e2e
  Scenario: One recording at a time
    Given a recording on the profile is playing
    When I press play on another recording
    Then the first recording stops and the second one plays

  @e2e
  Scenario: Open the take in its song
    Given a singer profile lists a recording
    When I open the recording's row
    Then the song page opens with that take selected

  @e2e
  Scenario: The play button is a 44 px target
    Given a singer profile lists a recording
    Then its play button is at least 44 by 44 px
