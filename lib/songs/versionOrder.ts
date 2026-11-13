/**
 * One stable order for a song's versions (Epic 6.1, Story 6.1.11 / G2.6, #395, UXA-049):
 * oldest first (`created_at`), identical timestamps broken by `id`. The song page, the
 * edit form and the list cards all go through this, so "the first version" is the same
 * everywhere and never depends on the order the database happens to return.
 */
export interface OrderedVersion {
  id?: string;
  created_at?: string | null;
}

function instant(value: string | null | undefined): number {
  const ms = value ? Date.parse(value) : NaN;
  return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms;
}

export function compareVersions(a: OrderedVersion, b: OrderedVersion): number {
  const byTime = instant(a.created_at);
  const other = instant(b.created_at);
  if (byTime !== other) return byTime < other ? -1 : 1;
  const idA = a.id ?? '';
  const idB = b.id ?? '';
  if (idA === idB) return 0;
  return idA < idB ? -1 : 1;
}

/** A sorted copy (rows without a timestamp last); the input is not modified. */
export function sortVersions<T extends OrderedVersion>(versions: ReadonlyArray<T> | null | undefined): T[] {
  return [...(versions ?? [])].sort(compareVersions);
}

/** The first (oldest) version, or `undefined` when there is none. */
export function firstVersion<T extends OrderedVersion>(versions: ReadonlyArray<T> | null | undefined): T | undefined {
  return sortVersions(versions)[0];
}

/** The version with this id, or the first one when the id is missing or unknown. */
export function pickVersion<T extends OrderedVersion>(
  versions: ReadonlyArray<T> | null | undefined,
  versionId: string | null | undefined
): T | undefined {
  const sorted = sortVersions(versions);
  return (versionId ? sorted.find((v) => v.id === versionId) : undefined) ?? sorted[0];
}

export const EDIT_VERSION_PARAM = 'version';

/** Edit link that opens the version the reader is looking at (`/songs/<id>/edit?version=<id>`). */
export function editSongHref(songId: string | undefined, versionId: string | null | undefined): string {
  const base = `/songs/${songId}/edit`;
  return versionId ? `${base}?${EDIT_VERSION_PARAM}=${encodeURIComponent(versionId)}` : base;
}

/** Song link that opens the reader on this version (`/songs/<id>?version=<id>`); where Save returns to. */
export function songVersionHref(songId: string | undefined, versionId: string | null | undefined): string {
  const base = `/songs/${songId}`;
  return versionId ? `${base}?${EDIT_VERSION_PARAM}=${encodeURIComponent(versionId)}` : base;
}
