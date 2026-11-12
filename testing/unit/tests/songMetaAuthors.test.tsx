// @vitest-environment jsdom
// Story 6.2.12 / G2.3 (#515): every author of a song is shown, each one links to its author filter.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SongMetaLines } from '@/components/song/SongMetaLines';
import { DICTIONARIES } from '@/lib/i18n';

const ui = vi.hoisted(() => ({ locale: 'en' as string }));

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: ui.locale,
    t: (k: string, vars?: Record<string, string | number>) =>
      ((DICTIONARIES.en as Record<string, string>)[k] ?? k).replace(/\{(\w+)\}/g, (_, name: string) =>
        String(vars?.[name] ?? `{${name}}`)
      ),
  }),
}));

afterEach(() => {
  cleanup();
  ui.locale = 'en';
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

  it('shows Traditional when there is no author at all', () => {
    render(<SongMetaLines authors={null} originalAuthor={null} />);
    expect(authorLink('Traditional').getAttribute('href')).toBe('/songs?artist=Traditional');
  });

  it('joins the names with the UI locale', () => {
    ui.locale = 'es';
    render(<SongMetaLines authors={['Anna', 'Ben', 'Cari']} originalAuthor={null} />);
    expect(linkList().textContent).toBe('Anna, Ben y Cari');
  });
});
