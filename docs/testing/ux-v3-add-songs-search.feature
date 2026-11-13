# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.2.22 / G5.5 (#542): the "+ Add Songs" sheet of a playlist finds songs by alias, any author and the title in a songbook, with the song list's matcher, ranking and "matched by ..." hint.
@ux-v3 @add-songs-search
Feature: The "+ Add Songs" sheet finds a song by the name I know
  As a Member
  I want the "+ Add Songs" sheet of a playlist to find songs by alias, any author and their title in a songbook
  So that I add a song by the name I know

  @unit
  Scenario: Add a song by its alias
    Given a catalog song "Madre Tierra" with the alias "Pachamama"
    When I search "pachamama" in the "+ Add Songs" sheet of a playlist
    Then "Madre Tierra" is offered with the hint "Matched by alias: Pachamama"

  @unit
  Scenario: Add a song by a co-author the row does not show
    Given a catalog song "Huey Tonantzin" by "Anna Lee" with authors "Anna Lee" and "Ben Cruz"
    When I search "ben cruz" in the "+ Add Songs" sheet of a playlist
    Then "Huey Tonantzin" is offered with the hint "Matched by author: Ben Cruz"

  @unit
  Scenario: Add a song by its title in a songbook
    Given a catalog song "Huey Tonantzin" printed as "Canto a la Madre Tierra" in a songbook
    When I search "canto a la" in the "+ Add Songs" sheet of a playlist
    Then "Huey Tonantzin" is offered with the hint "Matched by songbook title: Canto a la Madre Tierra"

  @unit
  Scenario: Case and accents do not matter
    Given a catalog song "Madre Tierra" with the alias "Pachamamá"
    When I search "PACHAMAMA" in the "+ Add Songs" sheet of a playlist
    Then "Madre Tierra" is offered

  @unit
  Scenario: A title match needs no hint and comes before an alias match
    Given a catalog song "Alpha" with the alias "Huey Madre"
    And a catalog song "Huey Tonantzin" with the alias "Nothing"
    When I search "huey" in the "+ Add Songs" sheet of a playlist
    Then "Huey Tonantzin" is offered without a hint
    And "Huey Tonantzin" is offered before "Alpha"

  @unit
  Scenario: A song that matches nothing is not offered
    Given a catalog song "Madre Tierra" with the alias "Pachamama"
    When I search "zzzz" in the "+ Add Songs" sheet of a playlist
    Then no song is offered

  @unit
  Scenario: The sheet reads the song list's rows, not a select of its own
    Then the "+ Add Songs" sheet loads its songs with the song list fetch and has no select of its own

  @unit
  Scenario: The load error is translated in every language
    Then every language has the "+ Add Songs" load error
