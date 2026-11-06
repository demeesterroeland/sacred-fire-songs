/**
 * Version switch under the song title (Epic 6.1, Story 6.1.11 / G2.6, #395).
 *
 * A song with more than one `song_versions` row gets a segmented control; a song with
 * zero or one version gets nothing, so single-version songs look exactly as before.
 * The language switch of the planned translation layer will sit in the same slot; no
 * translation data exists yet, so nothing is rendered for it.
 */
import type { TranslateFn } from '@/lib/i18n';

export interface VersionLike {
  id: string;
  version_name?: string | null;
}

export interface VersionOption {
  value: string;
  label: string;
}

/** The version the reader chose: it belongs to one song, like the transpose shift. */
export interface VersionChoice {
  songId: string | undefined;
  versionId: string;
}

/**
 * Index of the chosen version in `versions`, or 0 when there is no choice, the choice was
 * made on another song (client navigation between songs) or the version is gone. The page
 * (content) and the switch (control) both use this, so they can never disagree.
 */
export function resolveVersionIndex(
  versions: ReadonlyArray<{ id: string }> | null | undefined,
  choice: VersionChoice | null,
  songId: string | undefined
): number {
  if (!versions || !choice || choice.songId !== songId) return 0;
  const index = versions.findIndex((v) => v.id === choice.versionId);
  return index < 0 ? 0 : index;
}

/**
 * True when a tap on `nextId` must NOT switch the version: the recorder holds a take (counting in,
 * recording, paused, stopped but unsaved, a file picked) and switching remounts the Practice drawer,
 * which would drop it. Tapping the version that is already shown never blocks.
 */
export function blocksVersionSwitch(recorderDirty: boolean, currentId: string | undefined, nextId: string): boolean {
  return recorderDirty && currentId !== nextId;
}

/** Longest `?version=` value we accept (a uuid is 36 characters). */
const MAX_VERSION_PARAM_LENGTH = 64;

/**
 * The initial choice from `/songs/<id>?version=<versionId>` (where Save on the edit form returns to).
 * It goes through `resolveVersionIndex`, so an unknown or removed version falls back to the first one.
 */
export function linkedVersionChoice(songId: string | undefined, param: string | null | undefined): VersionChoice | null {
  const versionId = param?.trim();
  if (!versionId || versionId.length > MAX_VERSION_PARAM_LENGTH) return null;
  return { songId, versionId };
}

/**
 * Segment options for the song's versions, in the given order, or `null` when there is
 * no choice to offer (0 or 1 version). Blank names become "Version N" (N = position);
 * names used more than once are numbered with the translated `song.version.numbered`
 * ("Standard 1", "Standard 2"), skipping numbers another version already uses, so two
 * segments never share a label.
 */
export function versionOptions(
  versions: ReadonlyArray<VersionLike> | null | undefined,
  t: TranslateFn
): VersionOption[] | null {
  if (!versions || versions.length < 2) return null;
  const names = versions.map((v, i) => v.version_name?.trim() || t('song.version.fallback', { n: i + 1 }));
  const total = new Map<string, number>();
  for (const n of names) total.set(n, (total.get(n) ?? 0) + 1);
  // Names that stay as they are are taken; numbered labels must steer around them.
  const taken = new Set(names.filter((n) => total.get(n) === 1));
  const counter = new Map<string, number>();
  return versions.map((v, i) => {
    const name = names[i];
    if (total.get(name) === 1) return { value: v.id, label: name };
    let n = counter.get(name) ?? 0;
    let label: string;
    do {
      n += 1;
      label = t('song.version.numbered', { name, n });
    } while (taken.has(label));
    counter.set(name, n);
    taken.add(label);
    return { value: v.id, label };
  });
}
