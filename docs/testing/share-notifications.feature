# Sacred Fire Songs – Notifications for Shared Rehearsal Recordings
# Version: 1.1 | Date: Nov 4, 2026
#
# Living Gherkin specification for Story 4.6.6 (GitHub #373).
# Layering:
#   @unit – Cucumber steps over the pure email helpers in lib/notifications/email.ts
#           (testing/bdd/steps/share-notifications.steps.ts).
#   @seed – Cucumber steps against the local Supabase database: notification trigger,
#           row-level security and the claim_recording_share_email RPC. Writes run in a
#           rolled-back transaction.
# Server action and share wiring: testing/unit/tests/shareNotifications.test.ts and
# testing/unit/tests/recordingSharing.test.ts (Vitest).
#
# Run: npm run test:bdd:unit, npm run test:bdd:seed
#
# Changelog
#   1.0 – Nov 4, 2026 – Initial specification: in-app notification, transactional email,
#                       email opt-out, non-blocking dispatch.
#   1.1 – Nov 4, 2026 – The share email links to the email notification setting
#                       (/account/settings?tab=preferences) and to the recording permalink
#                       (/recordings/<recordingId>, redirects to /songs/<id>?recording=<id>).

@shareNotifications
Feature: Notifications for shared rehearsal recordings
  As a registered user,
  I want to be told when someone shares a rehearsal recording with me,
  So that I find the take without having to browse to the song.

  @unit
  Scenario: The share email names the sender and song and links to the song
    Given "Maria" shared the recording "Take 2" of "Danza del Cielo" with "Ana"
    When the share email is built for the site "https://songs.example.org"
    Then the email subject mentions "Maria" and "Danza del Cielo"
    And the email body links to "https://songs.example.org/recordings/rec-1"
    And the email links to the email notification settings at "https://songs.example.org/account/settings?tab=preferences"

  @unit
  Scenario: A recording has its own link on the song page
    Then the recording link is "/recordings/rec-1"

  @unit
  Scenario Outline: Only well-formed recording links open a recording
    Given a recording link with "<value>"
    Then the song page <verdict> the recording

    Examples:
      | value                                | verdict |
      | 0ee67b53-1d2c-4a8f-9a3b-2c1d0e9f8a7b | opens   |
      | not-a-uuid                           | ignores |
      |                                      | ignores |

  @unit
  Scenario: User-controlled names are escaped in the html email
    Given "<b>Maria</b>" shared the recording "Take 2" of "Danza del Cielo" with "Ana"
    When the share email is built for the site "https://songs.example.org"
    Then the html email contains no raw markup from user names

  @unit
  Scenario: Email is skipped when no SMTP server is configured
    Given no SMTP host is configured
    Then no SMTP transport is created

  @seed
  Scenario: Sharing a recording creates an in-app notification for the recipient only
    Given the member owns a recording
    When the member shares that recording with the musician
    Then the musician has an unread "recording_shared" notification naming the member
    And the gatekeeper cannot read the musician's notification

  @seed
  Scenario: Recipients cannot create notifications themselves
    Then the musician cannot insert a notification for the gatekeeper

  @seed
  Scenario: Revoking a share removes its notification
    Given the member owns a recording
    And the member has shared that recording with the musician
    When the member revokes the share
    Then the musician has no notification for that recording

  @seed
  Scenario: The share email is claimed once, by the owner only
    Given the member owns a recording
    And the member has shared that recording with the musician
    Then the gatekeeper cannot claim the share email
    And the member claims the share email once with the musician's address
    And a second claim by the member returns nothing

  @seed
  Scenario: Recipients who opted out of email get no share email
    Given the member owns a recording
    And the musician has turned off email notifications
    And the member has shared that recording with the musician
    Then the member's claim of the share email returns nothing
