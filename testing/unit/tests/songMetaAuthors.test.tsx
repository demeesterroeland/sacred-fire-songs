// @vitest-environment jsdom
// Story 6.2.12 / G2.3 (#515): every author of a song is shown, each one links to its author filter.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SongMetaLines } from '@/components/song/SongMetaLines';
import { DICTIONARIES } from '@/lib/i18n';
import { songFilterConfig } from '@/lib/songs/filterConfig';
import type { Song } from '@/lib/songUtils';

const ui = vi.hoisted(() => ({ locale: 'en' as string, noLiterals: false }));

// A locale pattern with no literal between two names (e.g. "{0}{1}") yields no separators at all.
vi.mock('@/lib/songs/authors', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/songs/authors')>();
  return { ...actual, authorSeparators: (...args: Parameters<typeof actual.authorSeparators>) => (ui.noLiterals ? [] : actual.authorSeparators(...args)) };
});

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: ui.locale,
    t: (k: string, vars?: Record<string, string | number>) =>
      (((DICTIONARIES as Record<string, Record<string, string>>)[ui.locale] ?? DICTIONARIES.en)[k] ?? k).replace(/\{(\w+)\}/g, (_, name: string) =>
        String(vars?.[name] ?? `{${name}}`)
      ),
  }),
}));

afterEach(() => {
  cleanup();
  ui.locale = 'en';
  ui.noLiterals = false;
});

/** The visible list of links (the measuring copy is a second list). */
const linkList = () => document.querySelector('[data-testid="song-meta-lines"] ul') as HTMLElement;
const authorLink = (name: string) => screen.getByRole('link', { name });

describe('SongMetaLines — every author', () => {
  it('shows both authors of a co-written song, each linking to its own author filter', () => {
    render(<SongMetaLines authors={['Anna Lee', 'Ben Cruz']} originalAuthor="Anna Lee, Ben Cruz" />);
    expect(authorLink('Anna Lee').getAttribute('href')).toBe('/songs?artist=Anna%20Lee');
    expect(authorLink('Ben Cruz').getAttribute('href')).toBe('/songs?artist=Ben%20Cruz');
    expect(linkList().textContent).toBe('Anna Lee and Ben Cruz');
  });

  it('uses original_author when authors is empty, splitting it into links', () => {
    render(<SongMetaLines authors={[]} originalAuthor="Herbert Quinteros, Cari El" />);
    expect(authorLink('Herbert Quinteros')).toBeTruthy();
    expect(authorLink('Cari El')).toBeTruthy();
  });

  it('drops duplicate and blank authors', () => {
    render(<SongMetaLines authors={['Anna Lee', ' anna lee ', '']} originalAuthor="Anna Lee" />);
    expect(screen.getAllByRole('link', { name: 'Anna Lee' })).toHaveLength(1);
    expect(linkList().textContent).toBe('Anna Lee');
  });

  // Finding 9: "Traditional" stands for "no author"; a link to ?artist=Traditional would find nothing, so it is plain text.
  it('shows Traditional as plain text, not a link, when there is no author at all', () => {
    render(<SongMetaLines authors={null} originalAuthor={null} />);
    expect(screen.queryByRole('link', { name: 'Traditional' })).toBeNull();
    expect(linkList().textContent).toBe('Traditional');
    expect(linkList().querySelector('a')).toBeNull();
  });

  it('keeps the other links (tags) after the plain Traditional text', () => {
    render(<SongMetaLines authors={[]} originalAuthor="" categories={[{ name: 'Water', slug: 'water' }]} />);
    expect(screen.queryByRole('link', { name: 'Traditional' })).toBeNull();
    expect(authorLink('Water').getAttribute('href')).toBe('/songs?tag=water');
  });

  it('an author literally named Traditional is a real author: it links with the raw name, shown translated', () => {
    ui.locale = 'nl';
    render(<SongMetaLines authors={['Traditional']} originalAuthor="Traditional" />);
    // The label is translated, the URL keeps the name the author filter knows.
    expect(authorLink('Traditioneel').getAttribute('href')).toBe('/songs?artist=Traditional');
  });

  it('only shows the joiner after an author when the next item shows (no dangling dot)', () => {
    render(<SongMetaLines authors={['Anna']} originalAuthor={null} />);
    const items = [...linkList().children] as HTMLElement[];
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toBe('Anna');
  });

  it('joins the last author and the first tag with a dot, inside the author item', () => {
    render(<SongMetaLines authors={['Anna', 'Ben']} originalAuthor={null} categories={[{ name: 'Water', slug: 'water' }]} />);
    const items = [...linkList().children] as HTMLElement[];
    expect(items.map((li) => li.textContent)).toEqual(['Anna and ', 'Ben· ', 'Water']);
  });

  // Finding 4: the joiner sits right after the previous link, inside the same <li>; no gap before it ("Anna , Ben").
  it('puts the joiner after the previous author inside its <li>, with no list gap before it', () => {
    render(<SongMetaLines authors={['Anna', 'Ben', 'Cari']} originalAuthor={null} />);
    const items = [...linkList().children] as HTMLElement[];
    expect(items).toHaveLength(3);
    // item 1: "Anna" + ", "; item 2: "Ben" + ", and "; item 3: "Cari" alone.
    expect(items[0].querySelector('a')?.textContent).toBe('Anna');
    expect(items[0].textContent).toBe('Anna, ');
    expect(items[1].textContent).toBe('Ben, and ');
    expect(items[2].textContent).toBe('Cari');
    // The joiner is a sibling after the link, never before the next link.
    expect(items[0].lastElementChild?.tagName).toBe('SPAN');
    expect(items[0].lastElementChild?.textContent).toBe(', ');
    expect(items[2].querySelector('span')).toBeNull();
    // The list has no flex gap between items that would show as "Anna , Ben".
    expect(linkList().className).not.toMatch(/gap-x-/);
    // The link keeps its padding (touch area); the joiner is pulled back over it so no space shows before ", ".
    expect(items[0].lastElementChild?.className).toMatch(/-ms-1/);
    expect(items[0].textContent).not.toMatch(/\s,/);
  });

  it('uses the "· " fallback between names when the locale pattern has no literal between them', () => {
    ui.noLiterals = true;
    render(<SongMetaLines authors={['Anna', 'Ben']} originalAuthor={null} />);
    const items = [...linkList().children] as HTMLElement[];
    expect(items[0].textContent).toBe('Anna· ');
    expect(linkList().textContent).toBe('Anna· Ben');
  });

  // Finding 8: the href must carry the name so the artist filter finds the song again.
  it.each([
    ['José & María, Jr.'],
    ['Ana + Bo'],
    ['C# Group #1'],
    ['Smith/Jones? 50%'],
  ])('the author link round-trips %s through the URL into the artist filter', (name) => {
    render(<SongMetaLines authors={[name]} originalAuthor={name} />);
    const href = authorLink(name).getAttribute('href')!;
    const artist = new URL(href, 'http://x').searchParams.get('artist');
    expect(artist).toBe(name);
    const song = { title: 'T', author: name, authors: [name] } as unknown as Song;
    expect(songFilterConfig.artist!.match(song, artist!)).toBe(true);
  });

  it('joins the names with the UI locale', () => {
    ui.locale = 'es';
    render(<SongMetaLines authors={['Anna', 'Ben', 'Cari']} originalAuthor={null} />);
    expect(linkList().textContent).toBe('Anna, Ben y Cari');
  });

  // `qu` has no conjunction data in this ICU: it falls back to a plain list, still one joiner per gap.
  it('joins the names in qu with the plain-list fallback (no conjunction data), still one joiner per gap', () => {
    ui.locale = 'qu';
    render(<SongMetaLines authors={['Anna', 'Ben', 'Cari']} originalAuthor={null} />);
    const items = [...linkList().children] as HTMLElement[];
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toMatch(/^Anna.+$/);
    expect(items[1].textContent).toMatch(/^Ben.+$/);
    expect(items[2].textContent).toBe('Cari');
  });
});
