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
#   1.0 – Nov 11, 2026 – Initial catalogue (Story 6.2.1). Review round on PR #527:
#         only importers and admins set the catalog keys, keys without surrounding
#         spaces, lowercase translation languages, a cited songbook cannot be
#         deleted, versions with increasing created_at open the main version first.

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
    Scenario: Catalog keys have no surrounding spaces
      Then a song with catalog slug " bdd-padded " is refused
      And a version with catalog_source_id " songbook-c" is refused
      And a songbook with id "songbook-c " is refused

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

    @seed
    Scenario: A songbook that versions cite cannot be deleted
      Then deleting the songbook "songbook-a" is refused
      When the sources citing "songbook-a" are deleted
      Then the songbook "songbook-a" can be deleted

  Rule: Versions open in the order the importer gives them

    @seed
    Scenario: Versions inserted in one transaction without created_at share one timestamp
      Given a new song with the versions "Main" and "Variant" inserted in one statement without created_at
      Then both versions have the same created_at

    @seed
    Scenario: Versions with strictly increasing created_at open the main version first
      Given a new song with the versions "Variant two", "Main" and "Variant one" inserted in one statement, with created_at increasing from "Main" to "Variant one" to "Variant two"
      Then the app orders the versions "Main", "Variant one", "Variant two"

  Rule: A song has at most one translation per language

    @seed
    Scenario: Translations are stored per song and language
      Given a Dutch translation of the catalog song
      Then a second Dutch translation of the catalog song is refused
      And an English translation of the catalog song can be added
      And a translation with language "not a language" is refused
      And a translation with language "pt-BR" is refused
      And a translation with language "pt-br" can be added

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

  Rule: Only importers and admins set the catalog keys

    @seed
    Scenario: A song manager edits the per-book musical data but not the catalog key
      Given the member owns a song with a version they contributed
      Then the member can change the version kind, beats and song note of that version
      And the member cannot change the catalog_source_id of that version
      And the member cannot add a version with a catalog_source_id to that song
      And the member can add a version without a catalog_source_id to that song

    @seed
    Scenario: A member cannot claim a catalog slug
      Given the member owns a song with a version they contributed
      Then the member cannot give that song a catalog slug
      And the member cannot add a song with a catalog slug
      And the member can add a song without a catalog slug
      And the member can change the aliases and authors of that song

    @seed
    Scenario: An admin and the service role set the catalog keys
      Then an admin can change the catalog slug of the catalog song
      And an admin can add a song with a catalog slug
      And an admin can add a version with a catalog_source_id to the catalog song
      And an admin cannot change the catalog_source_id of the catalog version
      And the service role can change the catalog_source_id of the catalog version
