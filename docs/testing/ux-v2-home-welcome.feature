# Version: 1.0 | Date: Nov 6, 2026
# Changelog
# 1.0 | Nov 6, 2026 | Story 6.1.28 / G6.3 (#412): guests see a one-line welcome, a search field and a "Recently added" row on Home; members keep Your library.
@story-6.1.28
Feature: UX v2 Home welcome for first-time visitors
  As a first-time Visitor
  I want a one-line welcome, a search box and a "Recently added" row on Home
  So that I understand the site and find a song fast

  @unit
  Scenario: The welcome texts exist in every language
    Given the Home welcome texts
    Then every language has a welcome line, a search field and a "Recently added" heading

  @unit
  Scenario: Recently added shows only public songs
    Given a library with public songs and a private draft
    When the Recently added row is built
    Then the query asks for public songs only, newest first, at most 5

  @unit
  Scenario: The Home welcome block is calm and easy to tap
    Given the Home welcome block
    Then the Home welcome block uses only design tokens

  @e2e
  Scenario: First visit
    Given a guest on the home page
    Then a one-line description of the site, a search field and a "Recently added" row are visible

  @e2e
  Scenario: Search from Home
    Given a guest on the home page
    When they type "agua" in the Home search field and submit
    Then the song list opens filtered by "agua"

  @e2e
  Scenario: Recently added rows open a song
    Given a guest on the home page
    When they tap a row in "Recently added"
    Then the song opens

  @e2e
  Scenario: One search field on Home for guests
    Given a guest on the home page
    Then only the Home search field is shown, not a second one in the header

  @e2e
  Scenario: Members keep Your library
    Given a signed-in member on the home page
    Then "Your library" is shown and the welcome block is not
