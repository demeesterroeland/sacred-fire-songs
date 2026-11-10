// Validation 3: Home and Library have no cards. Design tokens rule 5: "Fewer surfaces", separated by spacing and
// `--line`. Boxes stay for inputs, buttons, sheets and dialogs only.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');

/** The classes that make a card: a rounded box, an icon tile, or a lift on hover. */
const CARD = /rounded-(panel|xl|2xl|3xl)|hover:-translate-y|border border-|bg-surface-2 rounded/;

describe('Home and Library rows are flat', () => {
  it.each([
    'components/home/CategoryGrid.tsx',
    'components/home/LibrarySummary.tsx',
    'components/playlists/PlaylistCard.tsx',
    'components/playlists/PublicPlaylistCard.tsx',
    'components/playlists/playlistRow.ts',
  ])('%s has no card classes', (file) => {
    // The rename field is an input, and inputs keep their box.
    expect(read(file).replace(/<input[\s\S]*?\/>/g, '')).not.toMatch(CARD);
  });

  it('the smart playlists are flat too', () => {
    const smart = read('components/playlists/PlaylistSubtitles.tsx');
    expect(smart).toContain('function SmartPlaylistCard');
    expect(smart).not.toMatch(CARD);
  });

  it('playlist lists are separated by lines, not gaps between boxes', () => {
    const page = read('app/library/playlists/page.tsx');
    expect(page).not.toContain('grid grid-cols-1 gap-3');
    expect(read('components/playlists/playlistRow.ts')).toMatch(/divide-y divide-line/);
  });
});

describe('Private playlists', () => {
  it('show a lock, public ones a globe, and no music icon', () => {
    const card = read('components/playlists/PlaylistCard.tsx');
    expect(card).toContain('<VisibilityIcon isPublic={isPublic}');
    expect(card).not.toContain('ListMusic');
  });
});

describe('Category list', () => {
  const grid = read('components/home/CategoryGrid.tsx');

  it('has two columns from md, like the song list on /songs (validation 4, #388)', () => {
    expect(grid).toMatch(/data-testid="category-grid"[^>]*grid-cols-1[^"]*md:grid-cols-2/);
    expect(grid).not.toContain('12rem_1fr');
  });

  it('has no icon tiles and no description that repeats the title', () => {
    expect(grid).not.toContain('renderCategoryIcon');
    expect(grid).not.toContain('explore.category.description');
  });

  it('keeps a real gap before the count: a space inside a flex link collapses and gives "Air(3)"', () => {
    expect(grid).toMatch(/<Link[\s\S]*?href=\{`\/songs\?tag=[\s\S]*?className=\{`[^`]*\bgap-1\b/);
  });

  it('the description text is gone from every language', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(DICTIONARIES[locale] as Record<string, string>, locale).not.toHaveProperty(['explore.category.description']);
    }
  });
});

describe('Your library summary', () => {
  // Story 6.1.36 (#488): two groups of three on the two content columns, a line between the counts.
  it('is two groups of three with a line between, without icon tiles', () => {
    const summary = read('components/home/LibrarySummary.tsx');
    expect(summary).toMatch(/md:grid-cols-2/);
    expect(summary).toMatch(/grid-cols-3[^"]*divide-x divide-line/);
    expect(summary).not.toContain('Icon');
  });
});
