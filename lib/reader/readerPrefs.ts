import { LYRIC_STEPS, DEFAULT_LYRIC_STEP, MIN_FONT_PX } from '@/lib/design/tokens';

/**
 * Reader toolbar preferences (Epic 6.1, Story 6.1.6 / G2.1, #390): lyric size
 * step and the chords layer, stored per device in localStorage.
 */
export type ReaderPrefs = { step: number; chords: boolean };

export const READER_PREFS_KEY = 'sacred-fire-songs-reader';
export const DEFAULT_READER_PREFS: ReaderPrefs = { step: DEFAULT_LYRIC_STEP, chords: true };

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const LAST = LYRIC_STEPS.length - 1;
const clamp = (n: number) => Math.min(LAST, Math.max(0, Math.round(n)));

/** Next step after pressing A− (−1) or A+ (+1). */
export function stepBy(step: number, delta: -1 | 1): number {
  return clamp(step + delta);
}

/** Lyric font size in px for a step. */
export function lyricPx(step: number): number {
  return LYRIC_STEPS[clamp(step)];
}

/** Chord font size: about two thirds of the lyric size, never below the 12 px minimum. */
export function chordPx(step: number): number {
  return Math.max(MIN_FONT_PX, Math.round(lyricPx(step) * 0.7));
}

export function parseReaderPrefs(raw: string | null): ReaderPrefs {
  if (!raw) return DEFAULT_READER_PREFS;
  try {
    const v = JSON.parse(raw) as Partial<ReaderPrefs>;
    return {
      step: typeof v.step === 'number' && Number.isFinite(v.step) ? clamp(v.step) : DEFAULT_READER_PREFS.step,
      chords: typeof v.chords === 'boolean' ? v.chords : DEFAULT_READER_PREFS.chords,
    };
  } catch {
    return DEFAULT_READER_PREFS;
  }
}

export function loadReaderPrefs(storage?: StorageLike): ReaderPrefs {
  try {
    const s = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    return parseReaderPrefs(s?.getItem(READER_PREFS_KEY) ?? null);
  } catch {
    return DEFAULT_READER_PREFS;
  }
}

export function saveReaderPrefs(prefs: ReaderPrefs, storage?: StorageLike): void {
  try {
    const s = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    s?.setItem(READER_PREFS_KEY, JSON.stringify({ step: clamp(prefs.step), chords: prefs.chords }));
  } catch {
    /* private mode / blocked storage: keep the in-memory value */
  }
}
