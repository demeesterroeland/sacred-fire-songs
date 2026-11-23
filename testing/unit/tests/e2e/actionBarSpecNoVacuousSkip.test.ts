import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error -- plain ESM seeder script without type declarations
import { ANCHOR_SONGS } from '../../../../scripts/db/random-seeder.mjs';

// #601 (#393): the action-bar E2E must not pass vacuously when the seed lacks a song.
const SPEC = 'e2e/tests/ux-v2-song-action-bar.spec.ts';
const src = readFileSync(path.resolve(__dirname, '../../../..', SPEC), 'utf8');

interface Anchor {
  title: string;
  is_public?: boolean;
  no_version?: boolean;
  versions?: unknown[];
  youtube?: string;
  spotify?: string;
  soundcloud?: string;
}
const hasMedia = (a: Anchor) => !!(a.youtube || a.spotify || a.soundcloud);
const singlePublic = (ANCHOR_SONGS as Anchor[]).filter((a) => a.is_public && !a.no_version && !a.versions?.length);

describe('ux-v2-song-action-bar.spec.ts', () => {
  it('never skips a test because the seed lacks a song', () => {
    expect(src).not.toMatch(/test\.skip\s*\(/);
  });

  it('fails with a clear message when the seed lacks a song', () => {
    expect(src).toMatch(/expect\(id, /);
  });
});

describe('E2E seed anchors used by the action-bar spec', () => {
  it('include a public one-version song without media', () => {
    expect(singlePublic.filter((a) => !hasMedia(a)).map((a) => a.title)).not.toEqual([]);
  });

  it('include a public one-version song with media', () => {
    expect(singlePublic.filter(hasMedia).map((a) => a.title)).not.toEqual([]);
  });
});
