# Sacred Fire Songs – Protect in-app edits of catalog songs
# Version: 1.1 | Date: Nov 13, 2026
#
# Living Gherkin description of Story 6.2.21 (#524): a catalog song or version that is
# corrected in the app is marked (edited_in_app, edited_at, edited_fields) so an importer
# that follows the contract in docs/guides/importing-songbooks.md skips it and reports it,
# and admins export the corrections to take them over into the external catalog.
#   @unit – the importer-contract helper (lib/catalog/importContract.ts) and the export
#           shape (lib/catalog/catalogEdits.ts), no database.
#   @seed – Cucumber steps in testing/bdd/steps/ux-v3-protect-app-edits.steps.ts running as
#           the real database roles (anon / authenticated with auth.uid() / service_role)
#           against the local Supabase database (DATABASE_URL). Writes run in a rolled-back
#           transaction.
#
# Run: npm run test:bdd:unit · npm run test:bdd:seed
#
# Changelog
#   1.0 – Nov 12, 2026 – Initial catalogue (Story 6.2.21).
#   1.1 – Nov 13, 2026 – Review of PR #540: "taken over" only clears the correction that was
#         downloaded; the service role cannot use the admin export or clear function and reads
#         and clears markers with plain SQL; a gatekeeper cannot edit someone else's catalog
#         version; removing a catalog key counts; a moved version exports its new song's slug;
#         the contract follows merge redirects.

@protectAppEdits
Feature: Protect in-app edits of catalog songs from re-import

  Rule: An importer that follows the contract never overwrites an app correction

    @unit
    Scenario: The contract skips edited rows and reports them
      Given the catalog holds version "songbook-a" of "bdd-song" corrected in the app
      And the catalog holds version "songbook-b" of "bdd-song" that nobody edited
      When an importer plans to write both versions again
      Then it writes version "songbook-b" of "bdd-song"
      And it skips version "songbook-a" of "bdd-song" and reports its edited fields

    @seed
    Scenario: Re-import keeps an app correction
      Given a catalog version corrected in the app
      When an importer that follows the contract runs again
      Then the correction stays and is reported as skipped

  Rule: Only app edits of catalog rows count

    @seed
    Scenario: An app edit marks the catalog version with the fields it changed
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When the member changes the lyrics, key and capo of the catalog version in the app
      Then the catalog version is marked as edited in the app now
      And its edited fields are "capo, content_chordpro, key"

    @seed
    Scenario: Every catalog field an editor can change counts
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When the member changes the beats, song note, tuning and YouTube link of the catalog version in the app
      Then its edited fields are "beats, song_note, tuning, youtube_url"

    @seed
    Scenario: Saving a catalog version without a change does not mark it
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When the member saves the catalog version in the app without changing it
      Then the catalog version is not marked as edited

    @seed
    Scenario: A version without a catalog key is never marked
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      And the member added a version of their own without a catalog key
      When the member changes the lyrics of their own version in the app
      Then their own version is not marked as edited

    @seed
    Scenario: An importer write does not mark the row as edited
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When the importer updates the lyrics of the catalog version and the song title as service_role
      Then the catalog version is not marked as edited
      And the catalog song is not marked as edited

    @seed
    Scenario: A data migration does not mark the row as edited
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When a data migration without a signed-in user changes the lyrics of the catalog version
      Then the catalog version is not marked as edited

    @seed
    Scenario: Song-level corrections mark the catalog song
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When the admin changes the title, aliases and authors of the catalog song in the app
      Then the catalog song is marked as edited in the app now
      And its song edited fields are "aliases, authors, title"
      And the catalog version is not marked as edited

    @seed
    Scenario: Changing only the song's chord and melody flags does not mark it
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When the member's app recomputes the chord and melody flags of the catalog song
      Then the catalog song is not marked as edited

    @seed
    Scenario: A database function acting for a signed-in user counts as an app edit
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When a security definer function moves the catalog version to song "bdd-target-song" for the admin
      Then the catalog version is marked as edited in the app now
      And its edited fields are "composition_id, version_kind"
      And the admin export gives "bdd-target-song" as the song the catalog version moved to

    @seed
    Scenario: Removing the catalog slug of a catalog song in the app counts
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When the admin removes the catalog slug of the catalog song in the app
      Then the catalog song is marked as edited in the app now
      And its song edited fields are "catalog_slug"
      And the admin export lists the catalog song without a catalog slug

    @seed
    Scenario: A gatekeeper cannot edit someone else's catalog version
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When the gatekeeper tries to change the lyrics of the catalog version in the app
      Then the catalog version still has its imported lyrics
      And the catalog version is not marked as edited

    @seed
    Scenario: Further edits add their fields to the earlier ones
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When the member changes the lyrics, key and capo of the catalog version in the app
      And the member changes the beats, song note, tuning and YouTube link of the catalog version in the app
      Then its edited fields are "beats, capo, content_chordpro, key, song_note, tuning, youtube_url"

  Rule: App users cannot set or clear the marker themselves

    @seed
    Scenario: An editor cannot clear the marker of a corrected version
      Given a catalog version corrected in the app
      When the member tries to clear the edit marker of the catalog version
      Then the catalog version is still marked as edited

    @seed
    Scenario: A song owner cannot clear the marker of a corrected song
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      And the admin changes the title, aliases and authors of the catalog song in the app
      When the member tries to clear the edit marker of the catalog song
      Then the catalog song is still marked as edited

    @seed
    Scenario: A new version cannot arrive already marked
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      When the member adds a version that claims to be edited in the app
      Then the new version is not marked as edited

  Rule: Admins export the corrections and clear them once the catalog has them

    @seed
    Scenario: The export lists edited rows with their catalog keys and changed fields
      Given a public catalog song "bdd-protect-song" with version "songbook-a" owned by the member
      And the member changes the lyrics, key and capo of the catalog version in the app
      And the admin changes the title, aliases and authors of the catalog song in the app
      When the admin exports the catalog edits
      Then the export lists song "bdd-protect-song" with its new title, aliases and authors
      And the export lists version "songbook-a" of "bdd-protect-song" with its new lyrics, key and capo
      And the export lists no unedited rows

    @seed
    Scenario Outline: Only admins can read the export
      Given a catalog version corrected in the app
      Then the <account> cannot export the catalog edits

      Examples:
        | account   |
        | guest     |
        | member    |
        | expert    |
        | gatekeeper |
        | importer   |

    @seed
    Scenario: An admin clears the marker after the catalog took the correction over
      Given a catalog version corrected in the app
      When the admin marks the catalog version as taken over
      Then the catalog version is not marked as edited
      And the admin export no longer lists it

    @seed
    Scenario: "Taken over" leaves a correction made after the download
      Given a catalog version corrected in the app
      And the admin downloaded the catalog edits before a later correction
      When the member changes the lyrics, key and capo of the catalog version in the app
      And the admin marks the downloaded correction of the catalog version as taken over
      Then the admin hears that the catalog version changed since the download
      And the catalog version is still marked with its fields "capo, content_chordpro, key"

    @seed
    Scenario: The importer reads and clears markers with plain SQL
      Given a catalog version corrected in the app
      When the importer reads the marker of the catalog version as service_role
      Then it sees the correction with its edited fields "content_chordpro"
      And the importer cannot use the admin clear function
      When the importer clears the marker of the catalog version with plain SQL as service_role
      Then the catalog version is not marked as edited

    @seed
    Scenario: Only admins can clear the marker
      Given a catalog version corrected in the app
      Then the member cannot mark the catalog version as taken over
      And the catalog version is still marked as edited

    @unit
    Scenario: The export file names every correction by its catalog keys
      Given an export with a corrected song "bdd-song" and a corrected version "songbook-a" of "bdd-song"
      When the admin downloads it
      Then the file is JSON named "catalog-edits-2026-11-12.json"
      And it holds the song "bdd-song" and the version "songbook-a" of "bdd-song" with their changed values

  Rule: An importer does not recreate a song that was merged in the app

    @unit
    Scenario: A merged catalog slug goes to the song that now holds it
      Given the song "bdd-merged" was linked in the app as a version of another song
      When an importer resolves the catalog slugs "bdd-merged" and "bdd-fresh"
      Then it does not recreate "bdd-merged" and writes it to the song it was merged into
      And it imports "bdd-fresh" as usual
