# Sacred Fire Songs – Songbook data model
# Version: 1.0 | Date: Nov 11, 2026
#
# Living Gherkin description of the songbook tables (Story 6.2.1, #504): stable
# catalog keys on songs, per-book versions with their own musical data, source
# books with page numbers, and translations. Schema only; no screen changes.
#   @seed – Cucumber steps in testing/bdd/steps/songbook-data-model.steps.ts
#           running as the real database roles (anon / authenticated with
#           auth.uid()) against the local Supabase database (DATABASE_URL).
#           Writes run in a rolled-back transaction.
#
# Run: npm run test:bdd:seed
#
# Changelog
#   1.0 – Nov 11, 2026 – Initial catalogue (Story 6.2.1).

@songbookDataModel
Feature: Songbook data model

  Background:
    Given a second plain member account
    And a songbook "songbook-a" and a songbook "songbook-b"
    And a public catalog song "bdd-catalog-song" with a version from "songbook-a"
    And a private song of the other member with a version, a source and a translation

  Rule: The migration is purely additive

    @seed
    Scenario: Existing songs keep working after the migration
      Given a song created with only the columns that existed before the migration
      Then the song reads back with its original title, author and content
      And the version is an "original" version without catalog data
      And the song has no catalog slug, no aliases and no authors

  Rule: A song version keeps the musical data of its songbook

    @seed
    Scenario: A songbook variant keeps its own musical data
      Given a version with catalog_source_id "songbook-a", capo 5, beats "8" and a song note
      Then the row is stored with those values and is unique per song and book
      And a version of the same song from "songbook-b" can be added as a "variant"

    @seed
    Scenario: Only known version kinds are stored
      Then a version of kind "translation" can be added to the catalog song
      And a version of kind "medley" is refused

    @seed
    Scenario: The catalog slug identifies one song
      Then a second song with catalog slug "bdd-catalog-song" is refused
      And songs without a catalog slug can be added side by side

    @seed
    Scenario: The catalog song keeps aliases and several authors
      Then the catalog song lists the aliases "Alias One" and "Alias Two"
      And the catalog song lists the authors "Author A" and "Author B"

  Rule: Versions point to the songbooks they were printed in

    @seed
    Scenario: A version source records the book, title and page
      Then the catalog version is printed in "songbook-a" on page "12" as "Original Title"
      And a second primary source for the catalog version is refused
      And a second source of the catalog version in "songbook-a" is refused

    @seed
    Scenario: Deleting a version removes its sources
      When the catalog version is deleted
      Then no source of the catalog version remains

  Rule: A song has at most one translation per language

    @seed
    Scenario: Translations are stored per song and language
      Given a Dutch translation of the catalog song
      Then a second Dutch translation of the catalog song is refused
      And an English translation of the catalog song can be added
      And a translation with language "not a language" is refused

  Rule: Songbook data is readable when its song is readable and written by admins only

    @seed
    Scenario Outline: A <account> reads songbook data of a public song
      Then a <account> can read the songbook, the source and the translation of the catalog song

      Examples:
        | account |
        | guest   |
        | member  |
        | admin   |

    @seed
    Scenario Outline: A <account> <result> read songbook data of another member's private song
      Then a <account> <result> read the source and the translation of the private song
      And a <account> <result> read the songbook only cited by the private song

      Examples:
        | account      | result |
        | guest        | cannot |
        | member       | cannot |
        | other member | can    |
        | admin        | can    |

    @seed
    Scenario Outline: A <account> <result> write songbook data
      Then a <account> <result> add a songbook
      And a <account> <result> add a source to the catalog version
      And a <account> <result> add a translation to the catalog song

      Examples:
        | account | result |
        | guest   | cannot |
        | member  | cannot |
        | admin   | can    |
