// Story 6.1.11 / G2.6 (#395): which versions get a segmented control under the song title.
import { describe, expect, it } from 'vitest';
import { DICTIONARIES } from '@/lib/i18n';
import { blocksVersionSwitch, linkedVersionChoice, resolveVersionIndex, versionOptions } from '@/lib/songs/versionSwitch';

const t = (k: string, vars?: Record<string, string | number>) => {
  const text = (DICTIONARIES.en as Record<string, string>)[k] ?? k;
  return vars ? text.replace(/\{(\w+)\}/g, (_m, name) => String(vars[name])) : text;
};

describe('versionOptions', () => {
  it('returns null for no version, so nothing is rendered', () => {
    expect(versionOptions(undefined, t)).toBeNull();
    expect(versionOptions(null, t)).toBeNull();
    expect(versionOptions([], t)).toBeNull();
  });

  it('returns null for exactly one version (single-version songs do not change)', () => {
    expect(versionOptions([{ id: 'a', version_name: 'Standard' }], t)).toBeNull();
  });

  it('returns one option per version in order, labelled with the version name', () => {
    const opts = versionOptions(
      [
        { id: 'a', version_name: 'Original' },
        { id: 'b', version_name: 'Simplified' },
      ],
      t
    );
    expect(opts).toEqual([
      { value: 'a', label: 'Original' },
      { value: 'b', label: 'Simplified' },
    ]);
  });

  it('trims names and falls back to "Version N" for blank or missing names', () => {
    const opts = versionOptions(
      [
        { id: 'a', version_name: '  Live  ' },
        { id: 'b', version_name: '   ' },
        { id: 'c', version_name: null },
      ],
      t
    );
    expect(opts?.map((o) => o.label)).toEqual(['Live', 'Version 2', 'Version 3']);
  });

  it('numbers duplicate names so each segment stays distinguishable', () => {
    const opts = versionOptions(
      [
        { id: 'a', version_name: 'Standard' },
        { id: 'b', version_name: 'Standard' },
        { id: 'c', version_name: 'Live' },
      ],
      t
    );
    expect(opts?.map((o) => o.label)).toEqual(['Standard 1', 'Standard 2', 'Live']);
  });

  it('uses the translated numbered pattern, not a hardcoded "name n"', () => {
    const fr = (k: string, vars?: Record<string, string | number>) =>
      k === 'song.version.numbered' ? `${vars?.name} n°${vars?.n}` : t(k, vars);
    const opts = versionOptions([{ id: 'a', version_name: 'Live' }, { id: 'b', version_name: 'Live' }], fr);
    expect(opts?.map((o) => o.label)).toEqual(['Live n°1', 'Live n°2']);
  });

  it('never gives two segments the same label', () => {
    const cases: Array<Array<string | null>> = [
      ['Standard', 'Standard', 'Standard 1'],
      ['Version 2', null, 'Version 2'],
      ['A', 'A', 'A', 'A 2'],
      [null, null, 'Version 1'],
    ];
    for (const names of cases) {
      const opts = versionOptions(names.map((n, i) => ({ id: `v${i}`, version_name: n })), t)!;
      const labels = opts.map((o) => o.label);
      expect(new Set(labels).size, JSON.stringify(labels)).toBe(labels.length);
    }
  });

  it('keeps a real, unique name as typed and numbers around it', () => {
    const opts = versionOptions(
      [{ id: 'a', version_name: 'Standard' }, { id: 'b', version_name: 'Standard' }, { id: 'c', version_name: 'Standard 1' }],
      t
    );
    expect(opts?.map((o) => o.label)).toEqual(['Standard 2', 'Standard 3', 'Standard 1']);
  });

  it('distinguishes a real "Version 2" from the fallback of the second version', () => {
    const opts = versionOptions([{ id: 'a', version_name: 'Version 2' }, { id: 'b', version_name: null }], t);
    expect(opts?.map((o) => o.label)).toEqual(['Version 2 1', 'Version 2 2']);
  });
});

describe('resolveVersionIndex (control and content read the same selection)', () => {
  const versions = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  it('finds the chosen version of this song', () => {
    expect(resolveVersionIndex(versions, { songId: 's1', versionId: 'c' }, 's1')).toBe(2);
  });
  it('is 0 without a choice', () => {
    expect(resolveVersionIndex(versions, null, 's1')).toBe(0);
  });
  it('is 0 when the choice belongs to another song (client navigation between songs)', () => {
    expect(resolveVersionIndex(versions, { songId: 's0', versionId: 'c' }, 's1')).toBe(0);
  });
  it('is 0 when the chosen version no longer exists', () => {
    expect(resolveVersionIndex(versions, { songId: 's1', versionId: 'gone' }, 's1')).toBe(0);
  });
  it('is 0 for an empty list', () => {
    expect(resolveVersionIndex([], { songId: 's1', versionId: 'a' }, 's1')).toBe(0);
    expect(resolveVersionIndex(undefined, null, 's1')).toBe(0);
  });
});

describe('blocksVersionSwitch (a take in progress is never dropped by a version tap)', () => {
  it('blocks a switch to another version while the recorder holds a take', () => {
    expect(blocksVersionSwitch(true, 'a', 'b')).toBe(true);
  });
  it('lets the normal switch through instantly when nothing is in progress', () => {
    expect(blocksVersionSwitch(false, 'a', 'b')).toBe(false);
  });
  it('never blocks a tap on the version that is already shown', () => {
    expect(blocksVersionSwitch(true, 'a', 'a')).toBe(false);
  });
});

describe('linkedVersionChoice (?version= on the song page)', () => {
  it('becomes the initial choice for this song, resolved through resolveVersionIndex', () => {
    const choice = linkedVersionChoice('s1', 'b');
    expect(choice).toEqual({ songId: 's1', versionId: 'b' });
    expect(resolveVersionIndex([{ id: 'a' }, { id: 'b' }], choice, 's1')).toBe(1);
  });
  it('an unknown version falls back to the first one', () => {
    expect(resolveVersionIndex([{ id: 'a' }, { id: 'b' }], linkedVersionChoice('s1', 'gone'), 's1')).toBe(0);
  });
  it('no, blank or oversized parameter is no choice', () => {
    expect(linkedVersionChoice('s1', null)).toBeNull();
    expect(linkedVersionChoice('s1', '   ')).toBeNull();
    expect(linkedVersionChoice('s1', 'x'.repeat(200))).toBeNull();
  });
});

// Validation 2, item 5 (#395): a version has its own link.
import { versionSearch, versionShareUrl } from '@/lib/songs/versionSwitch';

describe('versionSearch', () => {
  it('sets ?version= for a version that is not the first', () => {
    expect(versionSearch('', 'v2', false)).toBe('?version=v2');
  });
  it('gives a clean URL for the default (first) version', () => {
    expect(versionSearch('?version=v2', 'v1', true)).toBe('');
    expect(versionSearch('', 'v1', true)).toBe('');
  });
  it('keeps parameters it does not own', () => {
    expect(versionSearch('?utm=a', 'v2', false)).toBe('?utm=a&version=v2');
    expect(versionSearch('?utm=a&version=v2', 'v1', true)).toBe('?utm=a');
  });
  // A recording link belongs to the version the recording is on. Switching away drops it, so a reload (or a shared
  // link) cannot open version B with a recording of version A.
  it('drops the recording parameter when the version changes', () => {
    expect(versionSearch('?recording=r1', 'v2', false)).toBe('?version=v2');
    expect(versionSearch('?recording=r1&version=v2', 'v1', true)).toBe('');
    expect(versionSearch('?utm=a&recording=r1', 'v2', false)).toBe('?utm=a&version=v2');
  });
  it('replaces an earlier version value, never repeats the parameter', () => {
    expect(versionSearch('?version=v2', 'v3', false)).toBe('?version=v3');
  });
  it('encodes the id', () => {
    expect(versionSearch('', 'a b', false)).toBe('?version=a+b');
  });
});

describe('versionShareUrl', () => {
  it('shares the link of the shown version, from the current location', () => {
    expect(versionShareUrl('https://x.test/songs/s1', 'v2', false)).toBe('https://x.test/songs/s1?version=v2');
    expect(versionShareUrl('https://x.test/songs/s1?version=v2', 'v1', true)).toBe('https://x.test/songs/s1');
    expect(versionShareUrl('https://x.test/songs/s1?version=v2#top', 'v2', false)).toBe('https://x.test/songs/s1?version=v2#top');
    expect(versionShareUrl('https://x.test/songs/s1?recording=r1', 'v2', false)).toBe('https://x.test/songs/s1?version=v2');
    expect(versionShareUrl('https://x.test/songs/s1?recording=r1&version=v2', 'v1', true)).toBe('https://x.test/songs/s1');
  });
});
