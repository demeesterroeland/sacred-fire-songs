// @vitest-environment jsdom
// Validation 1 (fix 5): Search options use tokens only (no red, amber or gray palette classes), the primary
// action is the one accent, selected tags are neutral (inverted + check), and a selected category shows its
// name, never its slug.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DICTIONARIES } from '@/lib/i18n';
import { countPaletteClasses } from '@/lib/design/paletteAudit';
import { categoryDisplayName } from '@/lib/taxonomy/categoryName';
import type { TaxonomyNode } from '@/lib/taxonomyUtils';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, vars?: Record<string, string | number>) => {
      const text = (DICTIONARIES.en as Record<string, string>)[k] ?? k;
      return vars ? text.replace(/\{(\w+)\}/g, (_m, name) => String(vars[name])) : text;
    },
  }),
}));

const cats = [
  { id: 'c1', name: 'Lullaby', slug: 'lullaby', emoji: null, parent_name: 'Spiritual Concepts', song_count: 3 },
  { id: 'c2', name: 'Fire', slug: 'fire', emoji: null, parent_name: 'The Elements', song_count: 5 },
  { id: 'c3', name: 'Dutch', slug: 'dutch', emoji: null, parent_name: 'Languages', song_count: 4 },
  { id: 'c4', name: 'Spanish', slug: 'spanish', emoji: null, parent_name: 'Languages', song_count: 2 },
];
vi.mock('@/lib/hooks/useTaxonomy', () => ({
  useTaxonomy: () => ({
    categories: cats,
    grouped: [
      { parentName: 'Spiritual Concepts', categories: [cats[0]] },
      { parentName: 'The Elements', categories: [cats[1]] },
      { parentName: 'Languages', categories: [cats[2], cats[3]] },
    ],
    isLoading: false,
    error: null,
  }),
}));

import TagSelector from '@/components/library/TagSelector';
import SearchFiltersModal from '@/components/library/SearchFiltersModal';
import CategorySelector from '@/components/song/CategorySelector';

afterEach(cleanup);

const tree: TaxonomyNode[] = [
  { id: 't1', name: 'Spiritual Concepts', slug: 'spiritual-concepts', emoji: null, icon_name: null, children: [] },
];

describe('categoryDisplayName', () => {
  it('finds the name in the tree, then in the flat list', () => {
    expect(categoryDisplayName('spiritual-concepts', tree, cats)).toBe('Spiritual Concepts');
    expect(categoryDisplayName('lullaby', tree, cats)).toBe('Lullaby');
    expect(categoryDisplayName('t1', tree, cats)).toBe('Spiritual Concepts');
  });
  it('never shows a raw slug: an unknown one is made readable', () => {
    expect(categoryDisplayName('medicine-and-healing', [], [])).toBe('Medicine and healing');
  });
});

describe('TagSelector', () => {
  it('shows the category name, not the slug, in the selected chip', () => {
    render(
      <TagSelector
        category="spiritual-concepts"
        tags={[]}
        taxonomy={tree}
        onCategoryChange={() => {}}
        onTagsChange={() => {}}
        onClearAll={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /Category: Spiritual Concepts/ })).toBeTruthy();
    expect(screen.queryByText(/spiritual-concepts/)).toBeNull();
  });

  it('selected tags are neutral: inverted chip with a check and aria-pressed, no palette classes', () => {
    const { container } = render(
      <TagSelector category={undefined} tags={['fire']} onCategoryChange={() => {}} onTagsChange={() => {}} onClearAll={() => {}} />,
    );
    const chip = screen.getByRole('button', { name: /Fire/ });
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(chip.className).toMatch(/bg-chip-active/);
    expect(chip.querySelector('svg')).toBeTruthy(); // the check
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });

  it('Story 6.2.24 (#569): does not show the Languages group when opened', () => {
    render(
      <TagSelector category={undefined} tags={[]} onCategoryChange={() => {}} onTagsChange={() => {}} onClearAll={() => {}} />,
    );
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getByText('Spiritual Concepts')).toBeTruthy();
    expect(screen.getByText('The Elements')).toBeTruthy();
    expect(screen.queryByText('Languages')).toBeNull();
    expect(screen.queryByRole('button', { name: /Dutch/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Spanish/ })).toBeNull();
  });

  it('Story 6.2.24 (#569): typing "dut" or "lang" does not offer languages', () => {
    render(
      <TagSelector category={undefined} tags={[]} onCategoryChange={() => {}} onTagsChange={() => {}} onClearAll={() => {}} />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'dut' } });
    expect(screen.queryByRole('button', { name: /Dutch/ })).toBeNull();
    fireEvent.change(input, { target: { value: 'lang' } });
    expect(screen.queryByText('Languages')).toBeNull();
    expect(screen.queryByRole('button', { name: /Dutch/ })).toBeNull();
  });
});

describe('CategorySelector (song edit forms)', () => {
  it('Story 6.2.24 (#569): still shows the Languages group so song edit forms can assign a language', () => {
    render(<CategorySelector selectedIds={[]} onChange={() => {}} />);
    expect(screen.getByText('Languages')).toBeTruthy();
    expect(screen.getByText('Dutch')).toBeTruthy();
    expect(screen.getByText('Spanish')).toBeTruthy();
  });
});

describe('SearchFiltersModal', () => {
  function modal() {
    return render(
      <SearchFiltersModal
        isOpen
        onClose={() => {}}
        onSubmit={() => {}}
        state={{ category: 'spiritual-concepts', tags: [], chords: true } as never}
        setFilter={() => {}}
        resetFilters={() => {}}
        sortBy="title"
        setSortBy={() => {}}
        taxonomy={tree}
        browseOptions={{
          songbooks: [],
          languages: [
            { value: 'dutch', label: 'Dutch', count: 4 },
            { value: 'spanish', label: 'Spanish', count: 2 },
          ],
        }}
        hasActiveFilters
        isAuthenticated
        localSearch=""
        setLocalSearch={() => {}}
      />,
    );
  }

  it('uses semantic tokens only: no red, amber, violet, emerald or gray palette classes', () => {
    const { container } = modal();
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });

  it('the primary action (Show results) is the accent; Clear all is secondary', () => {
    modal();
    const show = screen.getByRole('button', { name: DICTIONARIES.en['search.showResults'] });
    expect(show.className).toMatch(/bg-accent/);
    expect(show.className).toMatch(/text-on-accent/);
    const clear = screen.getByRole('button', { name: DICTIONARIES.en['search.clearAll'] });
    expect(clear.className).not.toMatch(/bg-accent/);
  });

  it('an active filter toggle is neutral and says so beyond colour (pressed state)', () => {
    modal();
    const chords = screen.getByRole('button', { name: new RegExp(DICTIONARIES.en['search.filter.chords']) });
    expect(chords.getAttribute('aria-pressed')).toBe('true');
    expect(chords.className).toMatch(/bg-chip-active/);
    expect(within(chords).getByTestId('toggle-check')).toBeTruthy();
  });

  it('the selected category chip reads its name', () => {
    modal();
    expect(screen.getByRole('button', { name: /Category: Spiritual Concepts/ })).toBeTruthy();
  });

  it('Story 6.2.24 (#569): offers Dutch in the Language filter while TagSelector omits Languages', () => {
    modal();
    const langSelect = screen.getByRole('combobox', { name: DICTIONARIES.en['search.language'] });
    expect(within(langSelect).getByRole('option', { name: 'Dutch (4)' })).toBeTruthy();
    fireEvent.focus(screen.getByPlaceholderText(DICTIONARIES.en['search.tagSelector.addMoreTags']));
    expect(screen.queryByText('Languages')).toBeNull();
  });
});
