// Story 6.1.24 / G5.3 (#408), UXD-1: the bottom bar is Home · Search · Library.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { BOTTOM_NAV_ITEMS, isBottomNavActive, type BottomNavItem } from '@/lib/navigation';
import { SUPPORTED_LOCALES, tWithLocale } from '@/lib/i18n';
import en from '@/messages/en';

const root = path.resolve(__dirname, '..', '..', '..', '..');
const item = (id: BottomNavItem['id']) => BOTTOM_NAV_ITEMS.find((i) => i.id === id)!;

describe('BOTTOM_NAV_ITEMS', () => {
  it('has exactly Home, Search, Library in that order', () => {
    expect(BOTTOM_NAV_ITEMS.map((i) => i.id)).toEqual(['home', 'search', 'library']);
    expect(BOTTOM_NAV_ITEMS.map((i) => i.href)).toEqual(['/', '/songs', '/library/playlists']);
    expect(BOTTOM_NAV_ITEMS.map((i) => i.labelKey)).toEqual(['nav.home', 'nav.search', 'nav.library']);
  });

  it('only Search moves focus to the search field', () => {
    expect(BOTTOM_NAV_ITEMS.filter((i) => i.focusSearch).map((i) => i.id)).toEqual(['search']);
  });
});

describe('isBottomNavActive', () => {
  it('marks Home only on "/"', () => {
    expect(isBottomNavActive('/', item('home'))).toBe(true);
    expect(isBottomNavActive('/songs', item('home'))).toBe(false);
    expect(isBottomNavActive('/library/playlists', item('home'))).toBe(false);
  });

  it('marks Search on the song list and song pages, not on Create', () => {
    expect(isBottomNavActive('/songs', item('search'))).toBe(true);
    expect(isBottomNavActive('/songs/abc', item('search'))).toBe(true);
    expect(isBottomNavActive('/songs/add', item('search'))).toBe(false);
    expect(isBottomNavActive('/', item('search'))).toBe(false);
  });

  it('marks Library on every /library page', () => {
    expect(isBottomNavActive('/library/playlists', item('library'))).toBe(true);
    expect(isBottomNavActive('/library/recently-viewed', item('library'))).toBe(true);
    expect(isBottomNavActive('/library', item('library'))).toBe(true);
    expect(isBottomNavActive('/songs', item('library'))).toBe(false);
  });

  it('marks at most one item on any page (one accent)', () => {
    for (const p of ['/', '/songs', '/songs/x', '/songs/add', '/library/playlists', '/library/artists', '/account']) {
      expect(BOTTOM_NAV_ITEMS.filter((i) => isBottomNavActive(p, i)).length).toBeLessThanOrEqual(1);
    }
  });
});

describe('/explore is gone', () => {
  it('has no route file', () => {
    expect(fs.existsSync(path.join(root, 'app', 'explore'))).toBe(false);
  });

  it('has no nav.explore message left in any locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const src = fs.readFileSync(path.join(root, 'messages', `${locale}.ts`), 'utf8');
      expect(src, locale).not.toContain("'nav.explore'");
    }
  });

  it('no source links to /explore', () => {
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        return e.isDirectory() ? walk(full) : /\.(tsx?|mjs)$/.test(e.name) ? [full] : [];
      });
    const hits = ['app', 'components', 'lib', 'hooks', 'context']
      .filter((d) => fs.existsSync(path.join(root, d)))
      .flatMap((d) => walk(path.join(root, d)))
      .filter((f) => /['"`]\/explore(?![\w-])/.test(fs.readFileSync(f, 'utf8')));
    expect(hits.map((f) => path.relative(root, f))).toEqual([]);
  });
});

describe('nav.search copy', () => {
  it('exists in all locales and the English label is "Search"', () => {
    expect(en['nav.search']).toBe('Search');
    for (const locale of SUPPORTED_LOCALES) {
      expect(tWithLocale(locale, 'nav.search'), locale).not.toBe('nav.search');
    }
  });
});

describe('MobileBottomNav markup', () => {
  const src = fs.readFileSync(path.join(root, 'components/common/MobileBottomNav.tsx'), 'utf8');
  it('uses 44 px targets, the safe area, and tokens only', () => {
    expect(src).toContain('min-h-tap');
    expect(src).toContain('safe-area-bottom');
    expect(src).not.toMatch(/(gray|red|amber|purple)-\d{2,3}/);
    expect(src).not.toMatch(/text-\[\d/);
  });
  it('renders only the three items from BOTTOM_NAV_ITEMS (no Create action)', () => {
    expect(src).toContain('BOTTOM_NAV_ITEMS');
    expect(src).not.toContain('CreateSheet');
    expect(src).not.toContain("'nav.create'");
  });
});
