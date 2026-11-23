# Version: 1.1 | Date: Nov 15, 2026
# Changelog
# 1.1 | Nov 15, 2026 | #607: sign-out clears the draft; a member's draft is never shown to someone else; a guest keeps the draft through sign-in.
# 1.0 | Nov 5, 2026 | Story 6.1.27 / G6.2 (#411): guest draft banner on Add Song; draft survives sign-in.
@story-6.1.27
Feature: A guest knows before typing that saving a song needs an account
  As a Guest
  I want to know before typing that saving a song needs an account
  So that I am not surprised at save

  @unit
  Scenario: The banner says saving needs an account
    Given the guest draft banner on Add Song
    Then it says that saving needs an account in every language
    And its sign-in link is at least 44 px tall and brings the guest back to Add Song

  @unit
  Scenario: The draft is kept on this device across sign-in
    Given the Add Song form
    Then the draft is read and written through the guarded draft helper
    And a guest who saves is sent to sign in with a way back to Add Song

  @e2e
  Scenario: Guest drafts a song
    Given a guest on Add Song
    Then a banner says that saving needs an account
    When they sign in from the banner
    Then the typed title and lyrics are still in the form

  # ── #607: shared devices ────────────────────────────────────────────────
  @unit
  Scenario: Logout clears the draft
    Given I am signed in as "member-a" and have an unsaved draft on Add Song
    When I sign out
    Then the stored draft is removed

  @unit
  Scenario: A member's draft is not shown to the next person
    Given I am signed in as "member-a" and have an unsaved draft on Add Song
    When "member-b" opens Add Song on the same device
    Then the form starts empty
    And the stored draft is removed

  @unit
  Scenario: A guest keeps their draft through sign-in
    Given I am a guest with a draft on Add Song
    When I sign in as "member-a" from the draft banner
    Then my draft is still there
