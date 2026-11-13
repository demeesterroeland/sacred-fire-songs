// @vitest-environment jsdom
// Story 6.1.35 (#485), group 1 — docs/testing/ux-v2-sober-colours.feature. Tags and categories use one neutral
// tag style; the song form tag editors use semantic tokens and translated copy.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';
import { countPaletteClasses } from '@/lib/design/paletteAudit';
import { tagPillClasses } from '@/lib/design/tagStyles';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) =>
      Object.entries(p ?? {}).reduce((s, [n, v]) => s.replace(`{${n}}`, String(v)), dict[k] ?? k),
  }),
}));

const cats = [
  { id: 'c1', name: 'Fire', slug: 'fire', emoji: null, parent_name: 'The Elements', song_count: 5 },
  { id: 'c2', name: 'Water', slug: 'water', emoji: null, parent_name: 'The Elements', song_count: 2 },
  { id: 'c3', name: 'Ayahuasca', slug: 'ayahuasca', emoji: null, parent_name: 'Medicine & Healing', song_count: 1 },
];
vi.mock('@/lib/hooks/useTaxonomy', () => ({
  useTaxonomy: () => ({
    categories: cats,
    grouped: [
      { parentName: 'The Elements', categories: cats.slice(0, 2) },
      { parentName: 'Medicine & Healing', categories: cats.slice(2) },
    ],
    isLoading: false,
    error: null,
  }),
}));

const artistRows = [{ original_author: 'Ana' }, { original_author: 'Ana' }, { original_author: 'Bo' }];
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ not: () => Promise.resolve({ data: artistRows, error: null }) }) }),
  }),
}));

import CategorySelector from '@/components/song/CategorySelector';
import { ArtistTagInput } from '@/components/song/ArtistTagInput';

afterEach(cleanup);

const NEW_KEYS = [
  'search.tags.loading',
  'search.tags.selected',
  'search.tags.selectedCount',
  'search.tags.clearSearch',
  'search.tags.noMatch',
  'songForm.artists.addNew',
  'songForm.artists.remove',
];

describe('one neutral tag style', () => {
  it('uses chip tokens only: inverted greys when selected, a hover only when the tag is a control', () => {
    expect(tagPillClasses()).toMatch(/\bbg-chip\b.*\btext-on-chip\b/);
    expect(tagPillClasses({ selected: true })).toMatch(/\bbg-chip-active\b.*\btext-on-chip-active\b/);
    expect(tagPillClasses()).not.toMatch(/hover:/);
    expect(tagPillClasses({ interactive: true })).toMatch(/hover:bg-line/);
    for (const c of [tagPillClasses(), tagPillClasses({ selected: true }), tagPillClasses({ interactive: true })]) {
      expect(countPaletteClasses(c)).toBe(0);
    }
  });

  it('the Edit song tag picker draws every category tag the same way', () => {
    render(<CategorySelector selectedIds={['c1']} onChange={() => {}} />);
    const unselected = ['Water', 'Ayahuasca'].map((n) => screen.getByRole('button', { name: new RegExp(`^${n}`) }));
    expect(new Set(unselected.map((b) => b.className)).size).toBe(1);
    for (const b of unselected) expect(b.getAttribute('aria-pressed')).toBe('false');

    const selected = screen.getAllByRole('button', { name: /^Fire/ });
    expect(selected.length).toBe(2); // in the "Selected tags" bar and in the grid
    for (const b of selected) {
      expect(b.getAttribute('aria-pressed')).toBe('true');
      expect(b.className).toMatch(/\bbg-chip-active\b/);
    }
    expect(countPaletteClasses(document.body.innerHTML)).toBe(0);
  });

  it('the tag picker copy is translated', () => {
    const onChange = vi.fn();
    render(<CategorySelector selectedIds={['c1']} onChange={onChange} />);
    expect(screen.getByText('Selected tags (1)')).toBeTruthy();
    expect(screen.getByText('1 selected')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onChange).toHaveBeenCalledWith([]);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzz' } });
    expect(screen.getByText('No tags match "zzz".')).toBeTruthy();
  });

  it('the artist field uses tokens, shows song counts between parentheses and a translated remove label', async () => {
    const onChange = vi.fn();
    render(<ArtistTagInput selectedArtists={['Bo']} onChange={onChange} />);
    fireEvent.focus(screen.getByRole('textbox'));
    expect(await screen.findByText('Ana')).toBeTruthy();
    expect(screen.getByText('(2)')).toBeTruthy();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Cy' } });
    expect(screen.getByText('Add new artist "Cy"')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Remove Bo' }));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(countPaletteClasses(document.body.innerHTML)).toBe(0);
  });

  it('every new key exists in all locales', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const d = DICTIONARIES[locale] as Record<string, string>;
      for (const k of NEW_KEYS) expect(d[k], `${locale}:${k}`).toBeTruthy();
    }
  });
});
