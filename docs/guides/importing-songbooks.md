# Importing Songbooks

**Version:** 1.4
**Status:** Living Document
**Date:** Nov 12, 2026

## Changelog

| Version | Date | Description of Changes |
| ----- | ----- | ----- |
| **1.0** | Nov 11, 2026 | Initial note for importers (Story 6.2.1, #504): tables, stable keys, version order, translations, access. Review round on PR #527: set `created_at` explicitly for version order; who may write which catalog column; keys without surrounding spaces; lowercase languages; delete sources before their songbook. |
| **1.1** | Nov 11, 2026 | Story 6.2.6 (#509): how the version switch labels versions (songbook short name; language name for a translation, read from its `version_name`) and orders them (original, variants, translations). |
| **1.2** | Nov 12, 2026 | Review of PR #530: rule 2 says the order is by `created_at` within each kind; rule 4: a translation's `version_name` may be any language tag (the language subtag written lowercase: `lkt`, `nv`, `gn`, `ay`, `arn`, `pt-BR`; `New` or `LKT` count as text), and a translation whose language is not recognised shows its songbook. |
| **1.3** | Nov 12, 2026 | Story 6.2.13 (#516, language switch): rule 4 changes. Importers write translations to `song_translations` only, no longer as `song_versions` rows with `version_kind = 'translation'`; the language switch reads `song_translations`, and migration `20261112140000_translation_versions_to_translations.sql` moves the interim translation versions there. Review of PR #535: importers must write translations to `song_translations` before that migration runs on real data (deleting a version also deletes its `catalog_source_id`, so an importer that still writes translations as versions would re-create them, and they are not migrated again); the migration leaves a translation version in place when it has chords and its key, capo or tuning differs from the original's, its lyrics are blank, it holds a melody, note, beats, media link or votes of its own, or it is lyrics-only in another key while a playlist transposes it, and it reports the contributor of a version it deletes; a playlist entry that opened the translation opens the original language afterwards. Changelog rows in ascending order. |
| **1.4** | Nov 12, 2026 | Story 6.2.21 (#524): new section *Corrections made in the app* — the database marks catalog songs and versions corrected in the app (`edited_in_app`, `edited_at`, `edited_fields`; migration `20261112160000_protect_catalog_app_edits.sql`); the importer contract (read the markers, skip and report marked rows, write as the service role), what counts as an app edit, the admin export and how to clear a marker. Rule 5 points there. |

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

1. **Use the stable keys.** Upsert songs on `catalog_slug`, versions on `(composition_id, catalog_source_id)`, sources on `(song_version_id, songbook_id)` and translations on `(composition_id, language)`, so a second run updates rows instead of duplicating them. Never key on the generated `id` columns or on titles. **Translations are written to `song_translations` (rule 4) before migration `20261112140000_translation_versions_to_translations.sql` runs on real data:** that migration deletes each translation version it moves, and with it its `catalog_source_id`, the key versions are upserted on. An importer that still wrote translations as versions would create them again on its next run, and they would not be migrated again.
2. **Version order.** The app shows a song's versions as original, then variants, then translations (`version_kind`), within each kind ordered by `created_at` (oldest first), then `id` (`lib/songs/versionOrder.ts`); the first one is the default. `created_at` defaults to the start of the transaction, so every version written in one transaction (a multi-row insert, or a batch in one transaction) gets the same timestamp and the order falls back to the random `id`. Therefore **set `created_at` explicitly, strictly increasing per song: the main version gets the oldest value, then each variant in the order you want** (for example the import time plus 0, 1, 2 … seconds). Alternatively insert each version of a song in its own transaction, main version first. An upsert does not change `created_at`, so later runs keep the order unless you write `created_at` again.
3. **Version kinds.** `original` is the main version, `variant` is the same song as printed in another book (its own key, capo, beats, note), `translation` is reserved: translations belong in `song_translations` (rule 4). Any other value is refused.
4. **Translations.** Store a translation in `song_translations` (`composition_id`, lowercase `language` tag, `title`, `lyrics`, `translator`), **not** as a `song_versions` row. The song page's language switch (next to the version switch, Story 6.2.13, #516) lists exactly the languages a song has in `song_translations` whose `lyrics` are not blank, labelled with the language name in the reader's app language (the tag in capitals when the runtime has no name for it), and shows the translation's `title` when it differs from the song's. The `translation` value of `version_kind` stays valid in the schema, but the app no longer expects it: a translation version that still exists is moved by migration `supabase/migrations/20261112140000_translation_versions_to_translations.sql` (language read from its `version_name` the way the app does, lyrics from `content_chordpro`, title from its primary source's `original_title`, recordings and playlist items re-pointed to the song's first original version, then the version deleted; its songbook and page are reported in the migration log, not kept, because `song_translations` has no source column; a playlist entry that opened the translation opens the original language afterwards). A translation version whose language cannot be read, one in a song without an original version, one with blank lyrics, one with a melody, song note, beats, YouTube/Spotify/SoundCloud link or votes that the original version does not have (`song_translations` cannot store them), one without chords whose key, capo or tuning differs while a playlist item on it is transposed, one with chords whose key, capo or tuning differs from the original version's (its chords would show with the wrong key), or one that differs from the text already stored for that language is left in place and reported, so fix those by hand or re-import them as `song_translations` rows. Upsert on `(composition_id, language)`.
5. **Edited rows.** Members and admins may correct imported songs in the app. The database marks such a row, and **an importer must skip a marked row and report it** instead of overwriting it: see *Corrections made in the app* below.
6. **Songs linked as versions of another song** (#512) keep their sources and their `catalog_source_id`; because that key is unique per song, give each version of a song a different `catalog_source_id`.

## Corrections made in the app

An importer updates the rows it owns on every run, so a correction made in the app (a wrong chord, a typo in the title, another capo) would be lost on the next run. The database therefore marks every catalog song and version that is corrected in the app (Story 6.2.21, #524; migration `supabase/migrations/20261112160000_protect_catalog_app_edits.sql`).

### The markers

`compositions` and `song_versions` both have:

| Column | Meaning |
| --- | --- |
| `edited_in_app` | `true` once the row was corrected in the app. |
| `edited_at` | When it was last corrected in the app. |
| `edited_fields` | Every tracked column corrected in the app since the marker was last cleared, sorted (e.g. `{capo,content_chordpro,key}`). |

The trigger `trg_track_catalog_edit` sets them. **A row is marked when all of these hold:**

- it has a catalog key: `compositions.catalog_slug`, or the version's own `song_versions.catalog_source_id` (a version without one is never marked, even on a catalog song);
- the writer is a signed-in app user: the request's JWT role (`auth.role()`) is `authenticated`. This includes database functions that a signed-in user calls (`SECURITY DEFINER` functions run as their owner, but the request is still the user's): **linking a song as a version of another song** moves catalog versions and merges aliases and authors, and those moves are marked, because they are the gatekeeper's or admin's decision;
- a tracked column actually changed (saving without a change marks nothing).

**Not marked:** writes as the **service role** (the importer itself) and writes without a signed-in user, such as a **data migration** or another direct database session.

**Tracked columns** (the catalog content an importer writes):

- `compositions`: `title`, `original_author`, `aliases`, `authors`
- `song_versions`: `version_name`, `content_chordpro`, `melody_notation`, `key`, `capo`, `tuning`, `soundcloud_url`, `youtube_url`, `spotify_url`, `version_kind`, `beats`, `song_note`, and `composition_id` (the version was moved to another song)

Not tracked: derived or app-only columns (`has_chords`, `has_melody`, `is_public`, `owner_id`, `vote_count`, `contributor_id`), the catalog keys themselves, and the admin-only tables `song_version_sources`, `songbooks` and `song_translations` (an importer that also corrects those should compare them itself). New rows are not marked: a new version is not a correction of an imported one.

Signed-in users cannot set or clear the markers: the trigger restores them on every API write (and resets them on insert).

### The contract

An importer that re-imports the catalog:

1. **Writes as the service role** (the service role key, or a direct database connection). Writes from an admin's signed-in session count as app edits and would mark the rows.
2. **Reads the markers** of the rows it is about to write, by their catalog keys: `compositions.edited_in_app` by `catalog_slug`, `song_versions.edited_in_app` by the song's `catalog_slug` and the version's `catalog_source_id`.
3. **Skips every marked row:** it does not update it (an insert of a new row is fine). A marked song still gets its new versions, and a marked version's song may still be updated.
4. **Reports the skipped rows**, with their keys, `edited_at` and `edited_fields`, so the correction can be taken over into the source catalog.

`lib/catalog/importContract.ts` holds the same rules as pure TypeScript helpers (`planCatalogImport`, `formatSkippedReport`, `catalogVersionKey`) for importers written in TypeScript; the behaviour is specified in `docs/testing/ux-v3-protect-app-edits.feature`.

```sql
-- Versions corrected in the app, by their catalog keys (run as the service role).
SELECT c.catalog_slug, v.catalog_source_id, v.edited_at, v.edited_fields
FROM public.song_versions v
JOIN public.compositions c ON c.id = v.composition_id
WHERE v.edited_in_app AND v.catalog_source_id IS NOT NULL;
```

### Export and clearing

- **Export:** admins open **Admin → Catalog edits** and download the corrections as JSON (`catalog-edits-YYYY-MM-DD.json`): format `sacred-fire-songs/catalog-edits`, version 1, and per song (`catalog_slug`) and per version (`catalog_slug`, `catalog_source_id`) the `edited_at`, the `edited_fields` and their current `values`. The same rows come from the RPC `fn_catalog_edits_export()`, which only admins (and the service role) may call.
- **Clear a marker** once the source catalog has the correction, so the next run updates the row again: the admin presses **Taken over** on that row (RPC `fn_clear_catalog_edit('song' | 'version', id)`, admins only), or the importer clears it as the service role:

```sql
UPDATE public.song_versions
SET edited_in_app = false, edited_at = NULL, edited_fields = '{}'
WHERE composition_id = (SELECT id FROM public.compositions WHERE catalog_slug = '<song-slug>')
  AND catalog_source_id = '<source-id>';
```

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
