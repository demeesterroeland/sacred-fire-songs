# Sacred Fire Songs – Private Song Sharing & Recording Attribution
# Version: 1.0 | Date: Nov 4, 2026
#
# Living Gherkin specification for Epic 4.6 Extension: Private Song Sharing & Recording Attribution.
# Layering:
#   @unit – Fast in-memory Cucumber steps in testing/bdd/steps/recording-sharing.steps.ts
#
# Changelog
#   1.0 – Nov 4, 2026 – Initial specification covering user-to-user sharing, DRM-lite permissions,
#                       public publication with consent disclaimer, and singer attribution.

@recordingSharing
Feature: Private Song Sharing and Recording Attribution
  As a recording owner,
  I want to share my private song rehearsals with specific registered users or make them public with singer consent,
  And attribute the singer/musician appropriately,
  So that musical collaboration is protected and respected.

  @unit
  Scenario: Owner shares private recording with another registered user
    Given a recording owner "Alice" has a private recording "Vocal Harmony Take 1"
    When Alice shares the recording with registered user "Bob"
    Then the recording should be shared with "Bob"
    And "Bob" should see the recording marked as "Shared with you"

  @unit
  Scenario: DRM-lite prevents shared recipient from downloading audio
    Given a recording owner "Alice" has shared a recording "Vocal Harmony Take 1" with "Bob"
    When "Bob" attempts to download the audio file
    Then the download request should be rejected with "Shared recordings cannot be downloaded"
    And "Bob" should not have download permissions on the recording

  @unit
  Scenario: DRM-lite prevents shared recipient from resharing to others
    Given a recording owner "Alice" has shared a recording "Vocal Harmony Take 1" with "Bob"
    When "Bob" attempts to share the recording with "Charlie"
    Then the sharing request should be rejected with "Only the recording owner can share this recording."

  @unit
  Scenario: Transitioning private recording to public requires singer consent confirmation
    Given a recording owner "Alice" has a private recording "Medicine Song Chants"
    When Alice attempts to make the recording public without confirming singer consent
    Then the publication should be rejected with "Singer consent must be explicitly confirmed"
    And the recording should remain private

  @unit
  Scenario: Publishing recording publicly succeeds when singer consent is confirmed
    Given a recording owner "Alice" has a private recording "Medicine Song Chants"
    When Alice confirms singer consent and publishes the recording
    Then the recording visibility should be updated to public
    And the singer consent confirmation should be recorded

  @unit
  Scenario: Singer attribution links to registered musician profile
    Given a registered musician "Danit" exists with a verified musician profile
    When a recording owner attributes "Danit" as the singer on "Aguita de la Vida"
    Then the recording should display singer attribution with a verified musician badge
    And the singer attribution should link to the musician profile

  @unit
  Scenario: Singer attribution gracefully handles unregistered singers without accounts
    Given a singer "Unknown Fire Keeper" does not have an account yet
    When a recording owner attributes "Unknown Fire Keeper" with optional email "keeper@sacredfire.org"
    Then the recording should display the singer name without crashing
    And the recording should display a pending invite status without a profile link
