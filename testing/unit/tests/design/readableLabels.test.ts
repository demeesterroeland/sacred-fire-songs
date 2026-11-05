// Story 6.1.3 / G1.3 (#387): small labels are readable — no text below 12 px and
// no grey-on-grey micro labels. The guard fails on any `text-[9px|10px|11px]`
// (or other sub-12 px arbitrary size) under app/ and components/.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { MICRO_TEXT_ALLOW_LIST, microTextHits, microTextHitsIn } from '@/lib/design/labelAudit';
import { MIN_TEXT_CONTRAST, contrastRatio, parseCssBlock, resolveToken } from '@/lib/design/tokens';
import { SUPPORTED_LOCALES } from '@/lib/i18n';

const root = path.resolve(__dirname, '..', '..', '..', '..');

describe('micro-text audit', () => {
  it('detects arbitrary font sizes below 12 px only', () => {
    expect(microTextHitsIn('text-[9px] md:text-[10px] hover:text-[11px] text-[0.7rem]').length).toBe(4);
    expect(microTextHitsIn('text-[12px] text-[0.75rem] text-[14px] text-caption text-meta')).toEqual([]);
  });

  it('keeps the allow-list to the Practice drawer that #399/#400 rework', () => {
    expect(MICRO_TEXT_ALLOW_LIST).toEqual(['components/song/RehearsalDrawer.tsx']);
  });

  it('app/ and components/ contain no text smaller than 12 px', () => {
    const hits = microTextHits();
    expect(hits.map((h) => `${h.file}:${h.line} ${h.match}`)).toEqual([]);
  });
});

describe('no uppercase micro labels', () => {
  const SECTION_TITLE_FILES = [
    'app/page.tsx',
    'app/library/playlists/page.tsx',
    'components/home/LibrarySummary.tsx',
    'components/library/RecentlyViewed.tsx',
    'components/library/NewSinceLastVisit.tsx',
    'components/library/SearchFiltersModal.tsx',
    'components/song/MediaEmbeds.tsx',
    'components/song/SongDisplay.tsx',
  ];

  it.each(SECTION_TITLE_FILES)('%s has no uppercase tracking-wide section label', (file) => {
    const src = fs.readFileSync(path.join(root, file), 'utf8');
    expect(src).not.toMatch(/uppercase[^"'`]*tracking-|tracking-[^"'`]*uppercase/);
  });
});

describe('section title copy', () => {
  const KEYS = [
    'explore.categories.heading',
    'library.heading',
    'playlists.publicPlaylists',
    'playlists.smartPlaylists',
    'playlists.myPrivatePlaylists',
    'recentlyViewed.section',
    'newSinceLastVisit.section',
  ];

  it('is sentence case in English (only the first word capitalised)', async () => {
    const { default: en } = await import('@/messages/en');
    for (const k of KEYS) {
      const v = (en as Record<string, string>)[k];
      expect(v, k).toBeTruthy();
      expect(v.slice(1), `${k}: "${v}"`).not.toMatch(/\b[A-Z][a-z]/);
    }
  });

  it('is never ALL CAPS in any locale', async () => {
    for (const locale of SUPPORTED_LOCALES) {
      const { default: m } = await import(`@/messages/${locale}`);
      for (const k of KEYS) {
        const v = (m as Record<string, string>)[k];
        expect(v, `${locale} ${k}`).toBeTruthy();
        expect(v === v.toUpperCase() && /\p{L}{4}/u.test(v), `${locale} ${k}: "${v}"`).toBe(false);
      }
    }
  });
});

describe('label text colour tokens', () => {
  const css = fs.readFileSync(path.join(root, 'app/styles/sober.css'), 'utf8');
  const light = parseCssBlock(css, ':root[data-style="sober"]');
  const dark = { ...light, ...parseCssBlock(css, ':root[data-style="sober"].dark') };

  it.each([
    ['light', light],
    ['dark', dark],
  ] as const)('text-fg-muted and text-fg-subtle reach 4.5:1 on every surface (%s)', (_mode, tokens) => {
    for (const fg of ['--text-muted', '--text-subtle']) {
      for (const bg of ['--bg', '--surface', '--surface-2']) {
        const ratio = contrastRatio(resolveToken(tokens, fg)!, resolveToken(tokens, bg)!);
        expect(ratio, `${fg} on ${bg}`).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      }
    }
  });
});
