# Importing Songbooks

**Version:** 1.0
**Status:** Living Document
**Date:** Nov 11, 2026

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | Nov 11, 2026 | Initial note for importers (Story 6.2.1, #504): tables, stable keys, version order, translations, access. |

## Purpose

Song collections compiled from printed songbooks carry more than a title and lyrics: a stable song id, other titles, several authors, the books a song was printed in (with page numbers), per-book variants with their own capo, key, beats and note, and translations. This note describes where an importer stores each of these. Importers are not part of this repository; they only rely on the schema below (migration `supabase/migrations/20261111150000_songbook_data_model.sql`, fresh install `docs/design/db-schema.sql`).

The app does not show most of these fields yet (UX v3, Epic 6.2). Title, lyrics and chords, key and capo, and every version through the version switch already work.

## Tables

| Table | Holds | Stable key for upserts |
| --- | --- | --- |
| `compositions` | One row per song. `catalog_slug` (external song id), `aliases` (other titles), `authors` (every author). Keep `original_author` filled with the display text, e.g. `"Author A & Author B"`. | `catalog_slug` (unique) |
| `song_versions` | One row per version of a song. `catalog_source_id` (external version id within the song, usually the songbook id), `version_kind`, `key`, `capo`, `beats`, `song_note`, `version_name` (the label in the version switch), `content_chordpro`. | `(composition_id, catalog_source_id)` (unique) |
| `songbooks` | One row per source book: `title`, `short_name`, `compiler`, `community`, `year`, `languages`, `attribution` (licence or credit line). | `id` (the book's external id, text) |
| `song_version_sources` | Where a version was printed: `songbook_id`, `original_title`, `page` (text, e.g. `12` or `12-13`), `source_file`, `is_primary`. At most one primary source per version. | `(song_version_id, songbook_id)` (unique) |
| `song_translations` | One translation per song and language: `language` (BCP 47 tag such as `nl` or `pt-BR`), `title`, `lyrics`, `translator`. | `(composition_id, language)` (unique) |

Every new column is nullable or has a default, so songs created in the app keep working: they have no `catalog_slug`, empty `aliases` and `authors`, and `version_kind = 'original'`.

## Rules for importers

1. **Use the stable keys.** Upsert songs on `catalog_slug`, versions on `(composition_id, catalog_source_id)`, sources on `(song_version_id, songbook_id)` and translations on `(composition_id, language)`, so a second run updates rows instead of duplicating them. Never key on the generated `id` columns or on titles.
2. **Version order is oldest first.** The app shows a song's versions ordered by `created_at`, then `id` (`lib/songs/versionOrder.ts`); the first one is the default. Insert the main version first, then the variants, so the main version opens by default and later runs keep that order (an upsert does not change `created_at`).
3. **Version kinds.** `original` is the main version, `variant` is the same song as printed in another book (its own key, capo, beats, note), `translation` is a version in another language. Any other value is refused.
4. **Translations.** Store a translation in `song_translations` when it is a translation of the lyrics. Until the language switch (#516) ships, an importer may also (or instead) store it as a `song_versions` row with `version_kind = 'translation'` and a `version_name` that names the language, so members can already read it through the version switch. Both forms are valid.
5. **Edited rows.** Members and admins may correct imported songs in the app. Protecting those corrections from the next run, and reporting them back to the source catalog, is Story 6.2.21 (#524). Until then, an importer that overwrites existing rows also overwrites such corrections.
6. **Songs linked as versions of another song** (#512) keep their sources and their `catalog_source_id`; because that key is unique per song, give each version of a song a different `catalog_source_id`.

## Access

- **Read:** a source, translation or songbook is readable exactly when its song is readable (public songs for everyone; private songs for their owner and admins). A songbook that no readable version cites is visible to admins only.
- **Write:** admins only. Members cannot write these tables. Contributors and admins may edit `version_kind`, `beats` and `song_note` like `key` and `capo`; `composition_id`, `contributor_id` and `catalog_source_id` are not updatable through the API.
- **Upserting importers use the service role** (a trusted server process with the service role key, or a direct database connection). An upsert on `song_versions` also writes its key columns, which an admin session may insert but not update. An admin session can still insert new rows and upsert `songbooks`, `song_version_sources` and `song_translations`.
- Treat imports like any other data load: run them against a local database first (`npx supabase start`) and keep the service role key out of client code.
