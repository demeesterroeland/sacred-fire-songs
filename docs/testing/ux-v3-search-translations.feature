# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.2.23 / G5.6 (#547): search also finds a song by the title of a translation; the hint names the language. Translation lyrics are not searched.
@ux-v3 @search-translations
Feature: Search finds a song by the title of its translation
  As a Guest
  I want search to find a song by the title of its translation
  So that I find a song by the name I know in my language

  @unit
  Scenario: Find a song by its translated title
    Given a song "Madre Tierra" with a Dutch translation titled "Moeder Aarde"
    When I search "moeder aarde"
    Then the song is in the results
    And the hint reads "Dutch: Moeder Aarde"

  @unit
  Scenario Outline: Case and accents do not matter for a translated title
    Given a song "Madre Tierra" with a Dutch translation titled "<title>"
    When I search "<query>"
    Then the song is in the results

    Examples:
      | title           | query       |
      | Moeder Aarde    | MOEDER      |
      | Mère Évangéline | evangeline  |
      | Mamá Pacha      | MAMA PACHA  |

  @unit
  Scenario: The hint names the language in the app language
    Given a song "Madre Tierra" with a Dutch translation titled "Moeder Aarde"
    When I search "aarde"
    Then the hint in Dutch reads "Nederlands: Moeder Aarde"

  @unit
  Scenario: A translation without a title is not searched by its lyrics
    Given a song "Madre Tierra" with a Dutch translation without a title but with the lyrics "Zingen voor de aarde"
    When I search "zingen"
    Then the song is not in the results

  @unit
  Scenario: No hint when the title matched, even if a translated title matches too
    Given a song "Madre Tierra" with a Dutch translation titled "Madre Aarde"
    When I search "madre"
    Then the song is in the results
    And there is no hint

  @unit
  Scenario: A language that is not recognised is named by its tag
    Given a song "Madre Tierra" with a "xx" translation titled "Moeder Aarde"
    When I search "aarde"
    Then the hint reads "XX: Moeder Aarde"

  @unit
  Scenario: The list rows carry the translated titles to the search
    Given a list row of the song "Madre Tierra" with a Dutch translation titled "Moeder Aarde"
    When I search "moeder"
    Then the song is in the results

  @unit
  Scenario: The translation hint is translated in every language
    Then every language has the translation hint with its language and text placeholders

  @unit
  Scenario: The song list select embeds the translations once
    Then the song list select embeds the translations once, asking only for language and title

  @seed
  Scenario: A guest finds a public catalog song by the title of its translation
    Given a public catalog song with a Dutch translation titled "Moeder Aarde"
    When a guest reads the song list and searches "moeder aarde"
    Then the catalog song is in the guest's results

  @seed
  Scenario: A guest never finds a private song through the title of its translation
    Given a private song of a member with a Dutch translation titled "Geheime Aarde"
    When a guest reads the song list and searches "geheime aarde"
    Then the private song is not in the guest's results
