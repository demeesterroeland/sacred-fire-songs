# Version: 1.0 | Date: Nov 6, 2026
# Changelog
# 1.0 | Nov 6, 2026 | Story 6.1.5 / G1.5 (#389): unfinished features (Albums, avatar upload, Privacy & Data, planned preferences, melody notation) are hidden behind lib/features.ts.
@story-6.1.5
Feature: Unfinished features are hidden
  As a Member
  I want unfinished features hidden
  So that I do not meet "Coming soon" placeholders

  @e2e
  Scenario: No placeholders in navigation
    Given a signed-in member
    When they open Library and Account Settings
    Then no element labelled "Coming soon" is visible

  @e2e
  Scenario: A deep link to the hidden Privacy tab opens Profile
    Given a signed-in member
    When they open Account Settings with the tab "privacy"
    Then the Profile tab is shown and no privacy settings are visible

  @e2e
  Scenario: The song form has no Melody notation section
    Given a signed-in member
    When they open Add song
    Then no "Melody notation" section is visible

  @unit
  Scenario: Privacy & Data tab is hidden and its deep link opens Profile
    Given the unfinished features are switched off
    Then the Settings tabs are Profile, Security and Preferences
    And the Settings tab for "privacy" is Profile

  @unit
  Scenario: Every unfinished feature is off by default
    Given the unfinished features are switched off
    Then the Library tabs do not include Albums
    And the avatar, planned preferences and melody notation sections are off

  @unit
  Scenario: The "Coming soon" copy is gone from all 8 locales
    Given the message catalogues of all 8 locales
    Then no message key is a "Coming soon" label
