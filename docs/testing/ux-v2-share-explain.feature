# Version: 1.0 | Date: Nov 5, 2026
# Changelog
# 1.0 | Nov 5, 2026 | Story 6.1.18 / G4.5 (#402): the Share dialog explains who can be found and what sharing does on a private song.
@story-6.1.18
Feature: The Share dialog explains itself
  As a recording owner
  I want the Share dialog to explain who can be found and what happens with a private song
  So that sharing has no surprises

  @unit
  Scenario: Sharing on a private own song
    Given a member owns a private song with a take "Morning take"
    When they share the take
    Then the Share dialog opens on a confirmation
    And the confirmation explains that the song lyrics become public
    And the confirmation explains that the take "Morning take" is shared with the members they pick
    And nothing changes until they confirm

  @unit
  Scenario: Confirming makes the song public and continues to the member search
    Given a member owns a private song with a take "Morning take"
    And they share the take
    When they confirm
    Then the song is public
    And the Share dialog shows the member search

  @unit
  Scenario: A member who does not own the private song gets an explanation, not a toast
    Given a member has a take on a private song they do not own
    When they share the take
    Then the Share dialog opens on an explanation
    And the explanation says only the song owner can make the lyrics public
    And no member search is offered

  @unit
  Scenario: A public song goes straight to the member search
    Given a member owns a public song with a take "Morning take"
    When they share the take
    Then the Share dialog shows the member search

  @unit
  Scenario: The dialog says who can be found
    Then the helper text reads "You can share with registered members only. Someone without an account needs to sign up first."
    And an empty search for "zzz" reads 'No registered member found for "zzz". Someone without an account needs to sign up first.'

  @unit
  Scenario: Every language carries the new copy
    Then all 8 languages have a translated version of the share explanation
