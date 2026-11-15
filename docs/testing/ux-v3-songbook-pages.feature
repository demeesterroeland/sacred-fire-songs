# Version: 1.0 | Date: Nov 13, 2026
# Changelog
# 1.0 | Nov 13, 2026 | Story 6.2.11 (#514, G2.2): a page per songbook listing its songs by page, a /songbooks list with song counts, links from the source line; guests see public songs only; unknown book = 404.
@ux-v3 @songbook-pages @story-6.2.11
Feature: Songbook pages
  As a Guest
  I want a page per songbook listing its songs by page
  So that I can sing along with a printed book

  @unit
  Scenario: Songbook page lists songs by page
    Given the songbook "Songbook A"
    And "Songbook A" contains "Song C" on page "20", "Song A" on page "3" and "Song B" on page "11"
    When I open its page
    Then its songs are listed in page order with links to each song
    And the songs read "Song A", "Song B", "Song C"

  @unit
  Scenario Outline: Pages are ordered as a person reads them, not as text
    Given the songbook "Songbook A"
    And "Songbook A" has songs on the pages "<given>"
    When I open its page
    Then the pages are listed in the order "<listed>"

    Examples:
      | given               | listed              |
      | 10, 2, 1            | 1, 2, 10            |
      | 12a, 12, 13, 2      | 2, 12, 12a, 13      |
      | p. 10, 9            | 9, 10               |
      | 38-39, 40, 7        | 7, 38-39, 40        |
      | A-10, A-2, A-1      | A-1, A-2, A-10      |
      | iv, ix, v, x, xii   | iv, v, ix, x, xii   |

  @unit
  Scenario: Songs without a page come last, then by title
    Given the songbook "Songbook A"
    And "Songbook A" contains "Song Z" without a page, "Song B" on page "5", "Song A" without a page and "Song C" on page "5"
    When I open its page
    Then the songs read "Song B", "Song C", "Song A", "Song Z"

  @unit
  Scenario: A song printed on two pages is listed once per page and links to the right version
    Given the songbook "Songbook A"
    And "Songbook A" has the song "Song A" as version "v1" on page "4" and as version "v2" on page "30"
    When I open its page
    Then "Song A" is listed twice, on page "4" and on page "30"
    And the row on page "4" links to version "v1" and the row on page "30" links to version "v2"

  @unit
  Scenario: Two versions of a song on the same page are one row
    Given the songbook "Songbook A"
    And "Songbook A" has the song "Song A" as version "v1" on page "4" and as version "v2" on page "4"
    When I open its page
    Then "Song A" is listed once

  @unit
  Scenario: A row shows the original title only when it differs
    Given the songbook "Songbook A"
    And "Songbook A" has "Rise Up" on page "1" with the original title "Subir" and on page "2" with the original title "rise up"
    When I open its page
    Then the row on page "1" shows the original title "Subir"
    And the row on page "2" shows no original title

  @unit
  Scenario: A song count counts songs, not printed versions
    Given the songbook "Songbook A"
    And "Songbook A" has the song "Song A" as version "v1" on page "4" and as version "v2" on page "30"
    And "Songbook A" contains "Song B" on page "5"
    Then the songbook counts 2 songs

  @unit
  Scenario: The list shows books by title with their song counts
    Given the songbooks "Songbook B" with 3 songs, "Songbook A" with 1 song and "Songbook C" with 0 songs
    When I open the songbooks list
    Then the list reads "Songbook A (1 song)", "Songbook B (3 songs)"

  @unit
  Scenario: The source line links to the songbook page
    Given the version of "Songbook A" printed on page "38"
    Then the source line of the version links to the page of "Songbook A" at the row of that source

  @unit
  Scenario: The book id in a link is escaped
    Then the page of the songbook "a b/c" is "/songbooks/a%20b%2Fc"

  @unit
  Scenario: An unknown songbook answers 404
    When I open the page of a songbook that does not exist
    Then the page answers "not found"

  @unit
  Scenario: Every language has text for the songbook pages
    Then all languages have text for the songbook pages

  @seed
  Scenario: A guest sees the public songs of a book, not the private ones
    Given a songbook with a public song on page "10" and a private song on page "2"
    Then a guest reads the public song only
    And the guest's count of the book is 1 song

  @seed
  Scenario: A book with only private songs does not exist for a guest
    Given a songbook with only a private song
    Then a guest cannot read the songbook

  @seed
  Scenario: The owner of a private song sees it in the book
    Given a songbook with a public song on page "10" and a private song of a member on page "2"
    Then that member reads both songs, the private one first
    And another member reads the public song only

  @seed
  Scenario: The songbook page's real query is accepted by the local API
    Then the select of the songbook page and the songbook list run against the local API without error
