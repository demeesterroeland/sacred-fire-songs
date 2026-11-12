import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Admin export of catalog songs and versions corrected in the app (Story 6.2.21, #524).
 *
 * The rows come from the admin-only RPC `fn_catalog_edits_export()` (migration
 * 20261112160000): every marked row with its catalog keys, `edited_at`, the edited fields and
 * their current values. The download wraps them in a small versioned file that a catalog
 * maintainer feeds back into the external catalog the songs came from.
 *
 * Queries take the Supabase client as a parameter so they run against the server client and
 * test doubles alike. Do not import from client components.
 */

export const CATALOG_EDITS_FORMAT = 'sacred-fire-songs/catalog-edits';
export const CATALOG_EDITS_FILE_VERSION = 1;

export type CatalogEditKind = 'song' | 'version';

export interface CatalogSongEdit {
  song_id: string;
  catalog_slug: string;
  title: string;
  edited_at: string | null;
  edited_fields: string[];
  /** Current value of every edited field. */
  values: Record<string, unknown>;
}

export interface CatalogVersionEdit {
  song_id: string;
  version_id: string;
  /** The song's catalog slug; null when the version sits on a song without one. */
  catalog_slug: string | null;
  catalog_source_id: string;
  title: string;
  version_name: string | null;
  edited_at: string | null;
  edited_fields: string[];
  values: Record<string, unknown>;
}

export interface CatalogEditsExport {
  songs: CatalogSongEdit[];
  versions: CatalogVersionEdit[];
}

export interface CatalogEditsFile extends CatalogEditsExport {
  format: typeof CATALOG_EDITS_FORMAT;
  version: typeof CATALOG_EDITS_FILE_VERSION;
  exported_at: string;
}

export type CatalogEditsClient = Pick<SupabaseClient, 'rpc'>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isStringOrNull = (value: unknown): value is string | null => value === null || isString(value);
const isStringList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);

function isSongEdit(row: unknown): row is CatalogSongEdit {
  return (
    isRecord(row) &&
    isString(row.song_id) &&
    isString(row.catalog_slug) &&
    isString(row.title) &&
    isStringOrNull(row.edited_at) &&
    isStringList(row.edited_fields) &&
    isRecord(row.values)
  );
}

function isVersionEdit(row: unknown): row is CatalogVersionEdit {
  return (
    isRecord(row) &&
    isString(row.song_id) &&
    isString(row.version_id) &&
    isStringOrNull(row.catalog_slug) &&
    isString(row.catalog_source_id) &&
    isString(row.title) &&
    isStringOrNull(row.version_name) &&
    isStringOrNull(row.edited_at) &&
    isStringList(row.edited_fields) &&
    isRecord(row.values)
  );
}

/** Validates the RPC result; malformed rows are dropped. */
export function parseCatalogEditsExport(raw: unknown): CatalogEditsExport {
  if (!isRecord(raw)) return { songs: [], versions: [] };
  return {
    songs: Array.isArray(raw.songs) ? raw.songs.filter(isSongEdit) : [],
    versions: Array.isArray(raw.versions) ? raw.versions.filter(isVersionEdit) : [],
  };
}

/** `catalog-edits-YYYY-MM-DD.json`, by the UTC day of the export. */
export function catalogEditsFileName(exportedAt: Date): string {
  return `catalog-edits-${exportedAt.toISOString().slice(0, 10)}.json`;
}

export function buildCatalogEditsFile(edits: CatalogEditsExport, exportedAt: Date): CatalogEditsFile {
  return {
    format: CATALOG_EDITS_FORMAT,
    version: CATALOG_EDITS_FILE_VERSION,
    exported_at: exportedAt.toISOString(),
    songs: edits.songs,
    versions: edits.versions,
  };
}

/** The marked rows, or null when the caller is not an admin (the RPC refuses with 42501). */
export async function fetchCatalogEdits(supabase: CatalogEditsClient): Promise<CatalogEditsExport | null> {
  const { data, error } = await supabase.rpc('fn_catalog_edits_export');
  if (error) {
    if (error.code !== '42501') console.error('[fetchCatalogEdits]', error);
    return null;
  }
  return parseCatalogEditsExport(data);
}

/** Clears one marker once the external catalog has the correction. False when refused or not marked. */
export async function clearCatalogEdit(
  supabase: CatalogEditsClient,
  kind: CatalogEditKind,
  id: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('fn_clear_catalog_edit', { p_kind: kind, p_id: id });
  if (error) {
    if (error.code !== '42501') console.error('[clearCatalogEdit]', error);
    return false;
  }
  return data === true;
}
