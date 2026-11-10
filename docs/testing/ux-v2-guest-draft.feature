# Version: 1.0 | Date: Nov 5, 2026
# Changelog
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
