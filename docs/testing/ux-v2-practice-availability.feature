# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.1.40 / G4 (#586): one availability dot on Practice; Listen and Record tab counts.
@story-6.1.40
Feature: Practice shows whether there is something to listen to or practise
  As someone viewing a song
  I want to see at a glance whether media or recordings are available, and in the Practice drawer which tab holds them
  So that I can choose what to listen to or practise without opening each tab first

  @unit
  Scenario: A member sees a dot when the song has media or recordings
    Given I am a member
    And the song has 2 reference links and 3 takes I can open
    When I view the song
    Then the Practice button shows the availability dot
    And the Listen tab shows 2
    And the Record tab shows 3

  @unit
  Scenario: Recordings alone show the dot
    Given I am a member
    And the song has 0 reference links and 1 takes I can open
    When I view the song
    Then the Practice button shows the availability dot
    And the Listen tab shows no count
    And the Record tab shows 1

  @unit
  Scenario: A guest hears public takes under Listen
    Given I am a guest
    And the song has 1 reference links and 2 takes I can open
    When I view the song
    Then the Practice button shows the availability dot
    And the Listen tab shows 3
    And the Record tab shows no count

  @unit
  Scenario: Nothing available: no dot and no counts
    Given I am a guest
    And the song has 0 reference links and 0 takes I can open
    When I view the song
    Then the Practice button shows no availability dot
    And the Listen tab shows no count
    And the Record tab shows no count
