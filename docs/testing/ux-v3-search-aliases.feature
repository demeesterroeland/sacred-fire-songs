# Version: 1.2 | Date: Nov 13, 2026
# Changelog
# 1.2 | Nov 13, 2026 | Re-check of #538: keyset pages (created_at, id) until an empty page, so a server with a lower max_rows still yields the whole catalog.
# 1.1 | Nov 12, 2026 | Review of #538: songs whose title matched are listed before the others; the whole catalog is fetched in pages (PostgREST max_rows).
# 1.0 | Nov 12, 2026 | Story 6.2.18 / G5.1 (#521): search finds songs by alias, any author and the original title in a songbook; the "matched by ..." hint; guests never find private songs this way.
@ux-v3 @search-aliases
Feature: Search finds a song by the name I know
  As a Guest
  I want search to find songs by alias, any author and their title in a songbook
  So that I find a song by the name I know

  @unit
  Scenario: Found by alias
    Given a song "Huey Tonantzin" with alias "Gran Venerable Madre Tierra"
    When I search "Venerable"
    Then the song is in the results

  @unit
  Scenario: Found by a co-author that is only in the authors list
    Given a song "Huey Tonantzin" by "Anna Lee" with authors "Anna Lee" and "Ben Cruz"
    When I search "Ben Cruz"
    Then the song is in the results

  @unit
  Scenario: Found by the original title in a songbook
    Given a song "Huey Tonantzin" printed as "Canto a la Madre Tierra" in a songbook
    When I search "madre tierra"
    Then the song is in the results

  @unit
  Scenario: The original title of any version counts, not only the first
    Given a song "Huey Tonantzin" with two versions, the second printed as "Venerable Madre" in a songbook
    When I search "Venerable"
    Then the song is in the results

  @unit
  Scenario Outline: Case and accents do not matter
    Given a song "Huey Tonantzin" with alias "<alias>"
    When I search "<query>"
    Then the song is in the results

    Examples:
      | alias                        | query      |
      | Gran Venerable Madre Tierra  | venerable  |
      | Gran Venerable Madre Tierra  | VENERABLE  |
      | Pachamamá                    | pachamama  |
      | Pachamama                    | Pachamamá  |
      | Canción de la Ñusta          | LA NUSTA   |

  @unit
  Scenario: A song that matches nothing is not in the results
    Given a song "Huey Tonantzin" with alias "Gran Venerable Madre Tierra"
    When I search "Pachamama"
    Then the song is not in the results

  @unit
  Scenario: The hint names the alias when the title did not match
    Given a song "Huey Tonantzin" with alias "Gran Venerable Madre Tierra"
    When I search "Venerable"
    Then the hint reads "Matched by alias: Gran Venerable Madre Tierra"

  @unit
  Scenario: The hint names the songbook title
    Given a song "Huey Tonantzin" printed as "Canto a la Madre Tierra" in a songbook
    When I search "canto"
    Then the hint reads "Matched by songbook title: Canto a la Madre Tierra"

  @unit
  Scenario: The hint names a co-author the row does not show
    Given a song "Huey Tonantzin" by "Anna Lee" with authors "Anna Lee" and "Ben Cruz"
    When I search "Ben Cruz"
    Then the hint reads "Matched by author: Ben Cruz"

  @unit
  Scenario: No hint when the title matched, even if an alias matches too
    Given a song "Huey Tonantzin" with alias "Huey Madre"
    When I search "huey"
    Then the song is in the results
    And there is no hint

  @unit
  Scenario: The hint is translated in every language
    Then every language has the three "matched by" hints with their placeholder

  @unit
  Scenario: A song is listed once however many fields match
    Given a song "Huey Tonantzin" with alias "Venerable Madre" printed as "Venerable Canto" in a songbook, by "Venerable Voice"
    And a song "Other Song" with alias "Nothing"
    When I search "venerable"
    Then the results are the song "Huey Tonantzin" once

  @unit
  Scenario: The list rows carry the aliases and the original titles to the search
    Given a list row of the song "Huey Tonantzin" with alias "Gran Venerable Madre Tierra" printed as "Canto a la Madre Tierra" in a songbook
    When I search "canto"
    Then the song is in the results

  @unit
  Scenario: Songs whose title matched come before songs found by an alias
    Given a song "Alpha" with alias "Huey Madre"
    And a song "Huey Tonantzin" with alias "Nothing"
    When I search "huey" and rank the results
    Then the first result is "Huey Tonantzin"

  @unit
  Scenario: The whole catalog is fetched even when the server caps one request at 1000 rows
    Given a catalog of 1037 songs behind a server that returns at most 1000 rows per request
    When the whole song list is fetched
    Then all 1037 songs are fetched

  @unit
  Scenario: The whole catalog is fetched even when the server caps one request at 500 rows (self-hosted)
    Given a catalog of 1234 songs behind a server that returns at most 500 rows per request
    When the whole song list is fetched
    Then all 1234 songs are fetched

  @unit
  Scenario: The song list select asks for the original titles through one embed
    Then the song list select embeds the songbook sources once

  @seed
  Scenario: A guest finds a public catalog song by alias and by songbook title
    Given a public catalog song with alias "Gran Venerable Madre Tierra" printed as "Canto a la Madre Tierra"
    When a guest reads the song list and searches "venerable"
    Then the catalog song is in the guest's results
    When a guest reads the song list and searches "madre tierra"
    Then the catalog song is in the guest's results

  @seed
  Scenario: A guest never finds a private song through its alias or songbook title
    Given a private song of a member with alias "Gran Venerable Secreta" printed as "Canto Secreto" in a songbook
    When a guest reads the song list and searches "venerable secreta"
    Then the private song is not in the guest's results
    When a guest reads the song list and searches "canto secreto"
    Then the private song is not in the guest's results

  @seed
  Scenario: The owner finds their own private song through its alias
    Given a private song of a member with alias "Gran Venerable Secreta" printed as "Canto Secreto" in a songbook
    When its owner reads the song list and searches "venerable secreta"
    Then the private song is in the owner's results
