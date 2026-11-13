# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | #578: non-UUID ids on [id] routes render not-found; song load error shows translated message instead of raw error.message.
@issue-578
Feature: Broken song links
  As a visitor who opens a broken song link
  I want the friendly "not found" page
  So that I never see a technical database message

  @unit
  Scenario: Non-UUID ids are rejected before querying the database
    Given the UUID check for route parameters
    Then "xyz" is not a valid UUID
    And "00000000-0000-4000-8000-000000000000" is a valid UUID
    And every [id] route renders not-found when the id is not a UUID

  @unit
  Scenario: The song load-error state shows the translated message, never error.message
    Given the song detail page error view
    Then it renders the translated "song.error.loadFailed" and "song.error.unexpected" copy with "song.error.retry"
    And it logs the error to the console without rendering songError.message

  @e2e
  Scenario: Malformed id
    Given a visitor opens /songs/xyz
    Then they see the not-found page
    And no Retry button is shown

  @e2e
  Scenario: Valid but missing id
    Given a visitor opens /songs/00000000-0000-4000-8000-000000000000
    Then they see the same not-found page

  @e2e
  Scenario: Real load failure
    Given the song request fails for another reason
    Then the page shows a translated error with Retry
    And the raw database message is not shown
