/**
 * Version switch under the song title (Epic 6.1, Story 6.1.11 / G2.6, #395).
 *
 * A song with more than one `song_versions` row gets a segmented control; a song with
 * zero or one version gets nothing, so single-version songs look exactly as before.
 * The language switch (Story 6.2.13, #516; `lib/songs/translations.ts`) sits next to it.
 */
import { DEFAULT_LOCALE, type Locale, type TranslateFn } from '@/lib/i18n';
import { primarySongbookName, versionBaseLabel, type LabelledVersion } from '@/lib/songs/versionLabels';
import { RECORDING_PARAM } from '@/lib/songs/recordingLink';
import { LANGUAGE_PARAM, ORIGINAL_VIEW, VIEW_PARAM, type ReadingView } from '@/lib/songs/translations';

export type VersionLike = LabelledVersion;

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
 * no choice to offer (0 or 1 version). A version is named after its songbook (original,
 * variant) or its language in the app `locale` (translation), else by `version_name`
 * (`versionBaseLabel`, #509). Blank names become "Version N" (N = position);
 * names used more than once are numbered with the translated `song.version.numbered`
 * ("Standard 1", "Standard 2"), skipping numbers another version already uses, so two
 * segments never share a label.
 */
export function versionOptions(
  versions: ReadonlyArray<VersionLike> | null | undefined,
  t: TranslateFn,
  locale: Locale = DEFAULT_LOCALE
): VersionOption[] | null {
  if (!versions || versions.length < 2) return null;
  const names = versions.map((v, i) => versionBaseLabel(v, locale) || t('song.version.fallback', { n: i + 1 }));
  const total = new Map<string, number>();
  for (const n of names) total.set(n, (total.get(n) ?? 0) + 1);
  // Equal names whose versions come from different songbooks (two English translations) are told apart by the
  // songbook ("English · Songbook B") instead of by a number; the same book twice still gets numbers.
  const labels = names.map((name, i) => {
    if (total.get(name) === 1) return name;
    const books = versions.flatMap((v, j) => (names[j] === name ? [primarySongbookName(v.song_version_sources)] : []));
    const book = primarySongbookName(versions[i].song_version_sources);
    const distinct = books.every((b) => b !== null && b !== name) && new Set(books).size === books.length;
    return distinct && book ? `${name} · ${book}` : name;
  });
  const labelCount = new Map<string, number>();
  for (const l of labels) labelCount.set(l, (labelCount.get(l) ?? 0) + 1);
  // Labels that stay as they are are taken; numbered labels must steer around them.
  const taken = new Set(labels.filter((l) => labelCount.get(l) === 1));
  const counter = new Map<string, number>();
  return versions.map((v, i) => {
    const name = labels[i];
    if (labelCount.get(name) === 1) return { value: v.id, label: name };
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

/**
 * The query part (`?version=<id>`, or '') of the page URL after switching to `versionId`. Parameters this code does not
 * own are kept. A `recording` link belongs to the version its recording is on, so it is dropped here: otherwise a
 * reload would open the new version with a recording of the old one. The language (`?lang=`, #516) is dropped too:
 * choosing a version returns to that version's own text. Pass `language` to keep one (the share link). The reading view
 * (`?view=both`, #517) goes with the language, and is kept only with one.
 */
export function versionSearch(
  currentSearch: string,
  versionId: string,
  isDefault: boolean,
  language: string | null = null,
  view: ReadingView | null = null
): string {
  const params = new URLSearchParams(currentSearch);
  params.delete('version');
  params.delete(RECORDING_PARAM);
  params.delete(LANGUAGE_PARAM);
  params.delete(VIEW_PARAM);
  if (!isDefault) params.append('version', versionId);
  if (language) params.append(LANGUAGE_PARAM, language);
  if (language && view && view !== ORIGINAL_VIEW) params.append(VIEW_PARAM, view);
  const search = params.toString();
  return search ? `?${search}` : '';
}

/** The link to share: the current location with the shown version (clean for the default version), language and view in it. */
export function versionShareUrl(
  href: string,
  versionId: string,
  isDefault: boolean,
  language: string | null = null,
  view: ReadingView | null = null
): string {
  const url = new URL(href);
  url.search = versionSearch(url.search, versionId, isDefault, language, view);
  return url.toString();
}
