# Importing Songbooks

**Version:** 1.1
**Status:** Living Document
**Date:** Nov 11, 2026

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | Nov 11, 2026 | Initial note for importers (Story 6.2.1, #504): tables, stable keys, version order, translations, access. Review round on PR #527: set `created_at` explicitly for version order; who may write which catalog column; keys without surrounding spaces; lowercase languages; delete sources before their songbook. |
| **1.1** | Nov 11, 2026 | Story 6.2.6 (#509): how the version switch labels versions (songbook short name; language name for a translation, read from its `version_name`) and orders them (original, variants, translations). |

## Purpose

Song collections compiled from printed songbooks carry more than a title and lyrics: a stable song id, other titles, several authors, the books a song was printed in (with page numbers), per-book variants with their own capo, key, beats and note, and translations. This note describes where an importer stores each of these. Importers are not part of this repository; they only rely on the schema below (migration `supabase/migrations/20261111150000_songbook_data_model.sql`, fresh install `docs/design/db-schema.sql`).

The app does not show most of these fields yet (UX v3, Epic 6.2). Title, lyrics and chords, key and capo, and every version through the version switch already work. The switch labels a version with the short name of its primary songbook (`song_version_sources.is_primary`, else the first source; the songbook title when there is no short name), and a translation with its language; without a source it shows `version_name`.

## Tables

| Table | Holds | Stable key for upserts |
| --- | --- | --- |
| `compositions` | One row per song. `catalog_slug` (external song id, no surrounding spaces), `aliases` (other titles), `authors` (every author). Keep `original_author` filled with the display text, e.g. `"Author A & Author B"`. | `catalog_slug` (unique) |
| `song_versions` | One row per version of a song. `catalog_source_id` (external version id within the song, usually the songbook id; no surrounding spaces), `version_kind`, `key`, `capo`, `beats`, `song_note`, `version_name` (the label in the version switch), `content_chordpro`. | `(composition_id, catalog_source_id)` (unique) |
| `songbooks` | One row per source book (`id` without surrounding spaces): `title`, `short_name`, `compiler`, `community`, `year`, `languages`, `attribution` (licence or credit line). | `id` (the book's external id, text) |
| `song_version_sources` | Where a version was printed: `songbook_id`, `original_title`, `page` (text, e.g. `12` or `12-13`), `source_file`, `is_primary`. At most one primary source per version. A songbook that a source cites cannot be deleted: delete its sources first. | `(song_version_id, songbook_id)` (unique) |
| `song_translations` | One translation per song and language: `language` (lowercase BCP 47-style tag such as `nl` or `pt-br`; `pt-BR` is refused), `title`, `lyrics`, `translator`. | `(composition_id, language)` (unique) |

Every new column is nullable or has a default, so songs created in the app keep working: they have no `catalog_slug`, empty `aliases` and `authors`, and `version_kind = 'original'`.

## Rules for importers

1. **Use the stable keys.** Upsert songs on `catalog_slug`, versions on `(composition_id, catalog_source_id)`, sources on `(song_version_id, songbook_id)` and translations on `(composition_id, language)`, so a second run updates rows instead of duplicating them. Never key on the generated `id` columns or on titles.
2. **Version order.** The app shows a song's versions as original, then variants, then translations (`version_kind`), each group ordered by `created_at`, then `id` (`lib/songs/versionOrder.ts`); the first one is the default. `created_at` defaults to the start of the transaction, so every version written in one transaction (a multi-row insert, or a batch in one transaction) gets the same timestamp and the order falls back to the random `id`. Therefore **set `created_at` explicitly, strictly increasing per song: the main version gets the oldest value, then each variant in the order you want** (for example the import time plus 0, 1, 2 … seconds). Alternatively insert each version of a song in its own transaction, main version first. An upsert does not change `created_at`, so later runs keep the order unless you write `created_at` again.
3. **Version kinds.** `original` is the main version, `variant` is the same song as printed in another book (its own key, capo, beats, note), `translation` is a version in another language. Any other value is refused.
4. **Translations.** Store a translation in `song_translations` when it is a translation of the lyrics. Until the language switch (#516) ships, an importer may also (or instead) store it as a `song_versions` row with `version_kind = 'translation'` and a `version_name` that names the language, so members can already read it through the version switch. The switch shows the language in the reader's app language, which it reads from `version_name`: write the language name (`English`, `Nederlands`, …) or its tag (`nl`); any other text is shown as it is. Both forms are valid.
5. **Edited rows.** Members and admins may correct imported songs in the app. Protecting those corrections from the next run, and reporting them back to the source catalog, is Story 6.2.21 (#524). Until then, an importer that overwrites existing rows also overwrites such corrections.
6. **Songs linked as versions of another song** (#512) keep their sources and their `catalog_source_id`; because that key is unique per song, give each version of a song a different `catalog_source_id`.

## Access

- **Read:** a source, translation or songbook is readable exactly when its song is readable (public songs for everyone; private songs for their owner and admins). A songbook that no readable version cites is visible to admins only.
- **Write `songbooks`, `song_version_sources`, `song_translations`:** admins and the service role only. Members cannot write these tables.
- **Write the catalog keys:**

  | Column | Insert | Update |
  | --- | --- | --- |
  | `compositions.catalog_slug` | service role, admins (a song owner may insert a song only with `catalog_slug` null) | service role, admins |
  | `song_versions.catalog_source_id` | service role, admins (a song manager may insert a version only with `catalog_source_id` null) | service role only (signed-in users, admins included, have no update privilege on it) |
  | `compositions.aliases`, `authors` | song owner, admins, service role | song owner, admins, service role |
  | `song_versions.version_kind`, `beats`, `song_note` | song managers (owner of the song or admin), service role | the version's contributor, admins, service role (like `key` and `capo`) |

  Any other signed-in caller gets SQLSTATE `42501` (triggers `trg_guard_catalog_slug` and `trg_guard_catalog_source_id`, plus the column privileges). `composition_id` and `contributor_id` are not updatable through the API.
- **Importers use the service role** (a trusted server process with the service role key, or a direct database connection). Only the service role can run a full upsert of `song_versions` on `(composition_id, catalog_source_id)`: on a conflict the upsert updates `catalog_source_id`, which an admin session has no privilege for. An admin session can insert new songs and versions with their catalog keys, change a `catalog_slug`, and upsert `songbooks`, `song_version_sources` and `song_translations`; it cannot change the `catalog_source_id` of an existing version.
- Treat imports like any other data load: run them against a local database first (`npx supabase start`) and keep the service role key out of client code.
