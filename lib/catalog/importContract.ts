/**
 * Importer contract for catalog rows corrected in the app (Story 6.2.21, #524).
 *
 * The database marks a catalog song or version that a signed-in user changed in the app
 * (`edited_in_app`, `edited_at`, `edited_fields`; migration 20261112160000). An importer that
 * re-imports the catalog must not overwrite such a row: it skips it and reports it, so the
 * correction can be taken over into the external catalog first. See
 * docs/guides/importing-songbooks.md ("Corrections made in the app").
 *
 * Pure helpers, no database access: an importer reads the markers of the rows it is about to
 * write, plans with `planCatalogImport`, writes `plan.write` and prints `formatSkippedReport`.
 *
 * Not protected by the markers: rows deleted in the app (an importer recreates them unless it
 * checks), and songs merged in the app by linking them as a version of another song. For the
 * latter, an importer resolves every incoming catalog slug with `resolveCatalogSlug` against the
 * merge redirects it read (old song id, new song id, the old song's catalog slug), so it does not
 * recreate a merged song.
 */

/** The marker columns of `compositions` and `song_versions`. */
export interface CatalogEditMarker {
  edited_in_app: boolean;
  edited_at: string | null;
  edited_fields: string[];
}

/** One row the importer left alone because it was corrected in the app. */
export interface SkippedCatalogRow {
  key: string;
  editedAt: string | null;
  editedFields: string[];
}

export interface CatalogImportPlan<T> {
  /** Rows to insert or update: new rows and rows nobody edited in the app. */
  write: T[];
  /** Rows corrected in the app: not written, reported instead. */
  skipped: SkippedCatalogRow[];
}

/** Key of a version within the catalog: its song's catalog_slug and its catalog_source_id. */
export function catalogVersionKey(catalogSlug: string, catalogSourceId: string): string {
  return `${catalogSlug}/${catalogSourceId}`;
}

/**
 * Splits the rows an importer is about to write into rows to write and rows to skip.
 * `existing` maps the key of every row already in the database to its marker; a row without an
 * entry is new and is written.
 */
export function planCatalogImport<T>(
  incoming: readonly T[],
  existing: ReadonlyMap<string, CatalogEditMarker>,
  keyOf: (row: T) => string
): CatalogImportPlan<T> {
  const plan: CatalogImportPlan<T> = { write: [], skipped: [] };
  for (const row of incoming) {
    const key = keyOf(row);
    const marker = existing.get(key);
    if (marker?.edited_in_app) {
      plan.skipped.push({ key, editedAt: marker.edited_at, editedFields: [...marker.edited_fields] });
    } else {
      plan.write.push(row);
    }
  }
  return plan;
}

/** A plain-text report of the skipped rows, one per line, for the importer's log. */
export function formatSkippedReport(skipped: readonly SkippedCatalogRow[]): string {
  if (skipped.length === 0) return 'Skipped 0 rows edited in the app.';
  const lines = skipped.map(
    (row) => `  ${row.key} (edited ${row.editedAt ?? 'unknown'}: ${row.editedFields.join(', ')})`
  );
  return [`Skipped ${skipped.length} ${skipped.length === 1 ? 'row' : 'rows'} edited in the app:`, ...lines].join('\n');
}

/** A song merged into another one in the app: `catalog_slug` is the slug of the merged (old) song. */
export interface CatalogSlugRedirect {
  old_id: string;
  new_id: string;
  catalog_slug: string | null;
}

export type CatalogSlugResolution =
  /** Not merged: import the song under its slug as usual. */
  | { action: 'import'; slug: string }
  /** Merged in the app: do not recreate the song; write its catalog content to `targetSongId`. */
  | { action: 'redirect'; slug: string; targetSongId: string };

/**
 * Where an incoming catalog slug goes, given the merge redirects the importer read. A chain of
 * merges (A into B, then B into C) is followed to the last song; a cycle stops at the last song
 * not seen before.
 */
export function resolveCatalogSlug(slug: string, redirects: readonly CatalogSlugRedirect[]): CatalogSlugResolution {
  const first = redirects.find((r) => r.catalog_slug === slug);
  if (!first) return { action: 'import', slug };

  const byOldId = new Map(redirects.map((r) => [r.old_id, r.new_id]));
  const seen = new Set<string>([first.old_id]);
  let target = first.new_id;
  while (byOldId.has(target) && !seen.has(target)) {
    seen.add(target);
    target = byOldId.get(target) as string;
  }
  return { action: 'redirect', slug, targetSongId: target };
}
