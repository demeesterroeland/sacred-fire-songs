# Version: 1.0 | Date: Nov 11, 2026
# Changelog
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
