# Version: 1.1 | Date: Nov 15, 2026
# Changelog
# 1.1 | Nov 15, 2026 | #601 (#510): on a phone the open technical line wraps and keeps each value whole, so the beats are never cut off.
# 1.0 | Nov 11, 2026 | Story 6.2.7 / G1.2 (#510): beats of the selected version join Key · Capo · Tuning in the meta line.
@ux-v3 @beats-meta
Feature: Beats in the song page meta line
  As a Musician
  I want the key, capo and beats of the selected version in the meta line
  So that I play the version as printed in its book

  @unit
  Scenario: Meta line follows the selected version
    Given a song whose versions have capo 5 with beats "8" and capo 0 without beats
    When I switch versions
    Then the meta line shows the values of the selected version

  @unit
  Scenario: The line appears when only beats is set
    Given a version with no key, capo or tuning and beats "8y4"
    Then the meta line shows "Beats 8y4" alone

  @unit
  Scenario: A blank beats value shows nothing
    Given a version with no key, capo or tuning and beats "   "
    Then the meta line shows no technical values

  @unit
  Scenario: Every language names the beats
    Then all languages have a beats label with the value placeholder

  # Playwright: e2e/tests/ux-v2-song-meta.spec.ts ("the technical line keeps the beats on screen on a phone").
  @e2e @bug-601
  Scenario: Long values never cut off the beats on a phone
    Given a 390 px wide phone screen
    And a version with key, capo, tuning and long beats "8y4 then 6y3 to the end"
    When I open the song details
    Then the technical line shows "Beats 8y4 then 6y3 to the end" in full
    And no value reaches past the edge of the line
