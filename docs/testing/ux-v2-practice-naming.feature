# Version: 1.1 | Date: Nov 5, 2026
# Changelog
# 1.1 | Nov 5, 2026 | Review fixes for #398: recorder, dialogs, share e-mail and mini-player say "take"; every literal t('key') exists in en.ts.
# 1.0 | Nov 5, 2026 | Story 6.1.14 / G4.1 (#398): one name, "Practice", for the rehearsal feature.
@story-6.1.14
Feature: UX v2 one name for the rehearsal feature
  As a Member
  I want one name — Practice — for the rehearsal feature
  So that menu, drawer, tabs, badge and library all say the same thing

  @unit
  Scenario: Consistent naming
    Given a member on a song page
    When they open the song menu, the Practice drawer and the Library
    Then the feature is called "Practice" in every place
    And the tabs read "Listen" and "Record"

  @unit
  Scenario: Takes, badge, smart playlist and guest card use the same vocabulary
    Given the English messages
    Then the list heading reads "My takes"
    And the song badge reads "Takes"
    And the smart playlist reads "Your takes"
    And the guest card reads "Sign in to record"

  @unit
  Scenario: No legacy name is left in any language
    Given every supported locale
    Then none defines the superseded rehearsal, recordings or voice recorder keys
    And no English string contains "Rehearsal Space", "Voice Recorder", "Your Recordings" or "Personal Audio Recorder"

  @unit
  Scenario: The recorder, dialogs and e-mail call the audio item a take
    Given the English messages
    Then the save button reads "Save Take"
    And the delete confirmation reads "Delete take?"
    And the shared-take e-mail subject mentions a practice take
    And the mini-player source groups are headed by the Listen tab and the My takes list
