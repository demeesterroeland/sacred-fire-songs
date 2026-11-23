// @vitest-environment jsdom
// Story 6.2.19 / G5.2 (#522): the filter sheet offers a songbook and a language select with a count per option.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, vars?: Record<string, string | number>) => {
      const text = (DICTIONARIES.en as Record<string, string>)[k] ?? k;
      return vars ? text.replace(/\{(\w+)\}/g, (_m, name) => String(vars[name])) : text;
    },
  }),
}));
vi.mock('@/lib/hooks/useTaxonomy', () => ({ useTaxonomy: () => ({ categories: [], grouped: [] }) }));

import SearchFiltersModal from '@/components/library/SearchFiltersModal';

afterEach(cleanup);

const en = DICTIONARIES.en as Record<string, string>;
const options = {
  songbooks: [
    { value: 'bk-a', label: 'Songbook A', count: 12 },
    { value: 'bk-b', label: 'Songbook B', count: 3 },
    { value: 'bk-c', label: 'Songbook C', count: 0 },
  ],
  languages: [
    { value: 'english', label: 'English', count: 20 },
    { value: 'espanol', label: 'Spanish', count: 1500 },
  ],
};

function sheet(props: Record<string, unknown> = {}, setFilter = vi.fn()) {
  const view = render(
    <SearchFiltersModal
      isOpen
      onClose={() => {}}
      onSubmit={() => {}}
      state={{ status: 'all', songbook: undefined, language: undefined } as never}
      setFilter={setFilter}
      resetFilters={() => {}}
      sortBy="title"
      setSortBy={() => {}}
      taxonomy={[]}
      hasActiveFilters={false}
      isAuthenticated={false}
      localSearch=""
      setLocalSearch={() => {}}
      browseOptions={options}
      {...props}
    />,
  );
  return { ...view, setFilter };
}

describe('SearchFiltersModal: songbook and language', () => {
  it('lists every songbook with its count after an "All songbooks" choice', () => {
    sheet();
    const select = screen.getByRole('combobox', { name: en['search.songbook'] }) as HTMLSelectElement;
    const labels = within(select).getAllByRole('option').map((o) => o.textContent);
    expect(labels).toEqual([en['search.songbook.all'], 'Songbook A (12)', 'Songbook B (3)', 'Songbook C (0)']);
    expect(select.value).toBe('');
  });

  it('lists every language with its count, written by the shared count formatter', () => {
    sheet();
    const select = screen.getByRole('combobox', { name: en['search.language'] });
    const labels = within(select).getAllByRole('option').map((o) => o.textContent);
    expect(labels[0]).toBe(en['search.language.all']);
    expect(labels[1]).toBe('English (20)');
    expect(labels[2]).toBe('Spanish (1500)');
  });

  it('an option nobody has right now is disabled, unless it is the chosen one', () => {
    sheet();
    const select = screen.getByRole('combobox', { name: en['search.songbook'] });
    const c = within(select).getByRole('option', { name: 'Songbook C (0)' }) as HTMLOptionElement;
    expect(c.disabled).toBe(true);
    cleanup();
    sheet({ state: { status: 'all', songbook: 'bk-c' } });
    const chosen = within(screen.getByRole('combobox', { name: en['search.songbook'] })).getByRole('option', { name: 'Songbook C (0)' }) as HTMLOptionElement;
    expect(chosen.disabled).toBe(false);
  });

  it('shows the chosen songbook', () => {
    sheet({ state: { status: 'all', songbook: 'bk-b' } });
    expect((screen.getByRole('combobox', { name: en['search.songbook'] }) as HTMLSelectElement).value).toBe('bk-b');
  });

  it('choosing "Songbook B" stores its id; "All songbooks" clears the filter', () => {
    const { setFilter } = sheet({ state: { status: 'all', songbook: 'bk-b' } });
    const select = screen.getByRole('combobox', { name: en['search.songbook'] });
    fireEvent.change(select, { target: { value: 'bk-a' } });
    expect(setFilter).toHaveBeenLastCalledWith('songbook', 'bk-a');
    fireEvent.change(select, { target: { value: '' } });
    expect(setFilter).toHaveBeenLastCalledWith('songbook', undefined);
  });

  it('choosing a language stores its slug', () => {
    const { setFilter } = sheet();
    fireEvent.change(screen.getByRole('combobox', { name: en['search.language'] }), { target: { value: 'espanol' } });
    expect(setFilter).toHaveBeenCalledWith('language', 'espanol');
  });

  it('shows neither select when there are no options (for example before the songs load)', () => {
    sheet({ browseOptions: { songbooks: [], languages: [] } });
    expect(screen.queryByRole('combobox', { name: en['search.songbook'] })).toBeNull();
    expect(screen.queryByRole('combobox', { name: en['search.language'] })).toBeNull();
    cleanup();
    sheet({ browseOptions: undefined });
    expect(screen.queryByRole('combobox', { name: en['search.songbook'] })).toBeNull();
  });

  it('only a book or only a language: the other select is not shown', () => {
    sheet({ browseOptions: { songbooks: options.songbooks, languages: [] } });
    expect(screen.getByRole('combobox', { name: en['search.songbook'] })).toBeTruthy();
    expect(screen.queryByRole('combobox', { name: en['search.language'] })).toBeNull();
  });

  it('uses tokens only and a 44 px target (min-h-tap)', () => {
    const { container } = sheet();
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
    for (const name of [en['search.songbook'], en['search.language']]) {
      expect(screen.getByRole('combobox', { name }).className).toMatch(/min-h-tap/);
    }
  });
});

describe('search.songbook / search.language copy', () => {
  const KEYS = ['search.songbook', 'search.language', 'search.songbook.all', 'search.language.all'] as const;
  it.each(SUPPORTED_LOCALES)('%s has all four labels', (locale) => {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    for (const key of KEYS) expect(dict[key]?.trim(), `${locale}: ${key}`).toBeTruthy();
  });
  it.each(SUPPORTED_LOCALES.filter((l) => l !== 'en'))('%s is translated, not the English text', (locale) => {
    const dict = DICTIONARIES[locale] as Record<string, string>;
    for (const key of KEYS) expect(dict[key], `${locale}: ${key}`).not.toBe(en[key]);
  });
});
