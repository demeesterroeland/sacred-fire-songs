# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.19 / G4.6 (#403), UXD-3: "Shared with me" page, unread count in the account menu, mark as read when Practice opens. The unread badge stays on the bell only (UXA-029).
@story-6.1.19
Feature: Shared with me
  As a member
  I want to be told when someone shares a take with me
  So that I do not have to guess which song to open

  @unit
  Scenario: The list shows the song, who shared it and the take
    Given "Alice" shared the take "Alice verse" of "Danza del Cielo" with me
    When I open "Shared with me"
    Then the list shows "Danza del Cielo" shared by "Alice" with the take "Alice verse"
    And the take opens through its link "\/recordings\/rec-1"

  @unit
  Scenario: A new share is marked "New" in words
    Given "Alice" shared the take "Alice verse" of "Danza del Cielo" with me
    And I have not opened that song's Practice drawer
    When I open "Shared with me"
    Then the row says "New"

  @unit
  Scenario: The account menu says the unread count in words
    Given I have 3 unread shared-take notifications
    Then the account menu entry reads "Shared with me" with "3 new"
    And no unread count shows when there is none

  @unit
  Scenario: Opening the song's Practice drawer marks its notifications read
    Given I have an unread notification about "Danza del Cielo" and one about "Fuego Sagrado"
    When I open the Practice drawer of "Danza del Cielo"
    Then the notification about "Danza del Cielo" is read
    And the notification about "Fuego Sagrado" is still unread

  @unit
  Scenario: A guest is asked to sign in
    Then the "Shared with me" page is a members-only screen with a sign-in gate

  @seed
  Scenario: A recipient sees only the shares and notifications addressed to them
    Given the member owns a take and shares it with the musician
    Then the musician sees one share and one unread notification for that take
    And the gatekeeper sees no share and no notification for that take
    And the musician can mark the song's notifications read

  @e2e
  Scenario: Recipient sees a badge and opens the song through "Shared with me"
    Given Alice shares a take with Bob
    When Bob opens the app
    Then the bell shows an unread badge
    And "Shared with me" in the account menu says "1 new"
    When Bob opens "Shared with me" and taps the take
    And Bob opens Practice
    Then the bell badge is gone
