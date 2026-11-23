# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.2.19 / G5.2 (#522): the search filter sheet filters songs by songbook and by language, with a count per option; a book or language in the URL that no song has reads "Unknown …".
@ux-v3 @browse-filters
Feature: Filter songs by songbook and language
  As a Guest
  I want to filter songs by songbook and language
  So that I can browse one book or one language

  Background:
    Given these songs:
      | title          | songbooks              | language |
      | Huey Tonantzin | Songbook A             | Spanish  |
      | Fire Song      | Songbook B             | English  |
      | Water Song     | Songbook A, Songbook B | English  |
      | Loose Song     |                        |          |

  @unit
  Scenario: Filter on a songbook
    When I filter on "Songbook B"
    Then only these songs are listed: "Fire Song", "Water Song"

  @unit
  Scenario: A song printed in several books is listed under each of them
    When I filter on "Songbook A"
    Then only these songs are listed: "Huey Tonantzin", "Water Song"

  @unit
  Scenario: Filter on a language
    When I filter on the language "English"
    Then only these songs are listed: "Fire Song", "Water Song"

  @unit
  Scenario: Songbook and language combine
    When I filter on "Songbook A"
    And I filter on the language "English"
    Then only these songs are listed: "Water Song"

  @unit
  Scenario: Without a filter every song is listed
    Then only these songs are listed: "Huey Tonantzin", "Fire Song", "Water Song", "Loose Song"

  @unit
  Scenario: Every option shows how many songs it holds
    Then the songbook options read "Songbook A (2)", "Songbook B (2)"
    And the language options read "English (2)", "Spanish (1)"

  @unit
  Scenario: The songbook counts follow the chosen language
    When I filter on the language "English"
    Then the songbook options read "Songbook A (1)", "Songbook B (2)"

  @unit
  Scenario: The language counts follow the chosen songbook
    When I filter on "Songbook B"
    Then the language options read "English (2)", "Spanish (0)"

  @unit
  Scenario: A count never narrows by its own choice
    When I filter on "Songbook B"
    Then the songbook options read "Songbook A (2)", "Songbook B (2)"

  @unit
  Scenario: A songbook that is not in the catalog is called "Unknown songbook"
    When I filter on the songbook id "bk-old"
    Then the songbook options read "Songbook A (2)", "Songbook B (2)", "Unknown songbook (0)"

  @unit
  Scenario: A songbook is read from the one sources embed of the song list
    Then the song list select embeds the sources once and nests the songbook in it

  @unit
  Scenario Outline: The filter sheet is translated
    Then the filter sheet labels exist in "<locale>"

    Examples:
      | locale |
      | en     |
      | nl     |
      | es     |
      | it     |
      | ru     |
      | qu     |
      | fr     |
      | pt     |
