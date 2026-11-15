# Version: 1.0 | Date: Nov 6, 2026
# Changelog
# 1.0 | Nov 6, 2026 | Story 6.1.31 / G8.2 (#415): live chord preview and visible upload button on Add Song.
@story-6.1.31
Feature: A member sees what they are writing on Add Song
  As a Member
  I want a live chord preview and a visible upload button on Add Song
  So that I see what I am writing

  @unit
  Scenario: The preview uses the song page renderer
    Given the Add Song chord preview
    Then it renders through the song page renderer so output matches the song page
    And the preview follows typing after a short debounce
    And an empty preview explains itself in every language

  @unit
  Scenario: Preview and upload sit under the lyrics field
    Given the Add Song form with lyrics tools
    Then a Preview toggle and an Upload .cho / .txt button follow the lyrics field
    And both controls are at least 44 px tall
    And they sit side by side in two equal columns and long labels wrap inside the button
    And Upload refuses files above 512 KB and reads UTF-8 with a Windows-1252 fallback
    And the preview takes the place of the editor at the same height so nothing jumps
    And the melody notation section stays hidden behind its switch

  @e2e
  Scenario: Preview while typing
    Given a member on Add Song on a phone
    When they type "[Dm]Abre tus alas" and switch on Preview
    Then "Dm" is rendered above "Abre"
    And the Upload .cho / .txt button is visible without opening anything
    And Preview and Upload share one row at 390 px, also in Russian and French
