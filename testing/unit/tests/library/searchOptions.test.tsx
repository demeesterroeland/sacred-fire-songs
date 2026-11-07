// @vitest-environment jsdom
// Validation 1 (fix 5): Search options use tokens only (no red, amber or gray palette classes), the primary
// action is the one accent, selected tags are neutral (inverted + check), and a selected category shows its
// name, never its slug.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
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
];
vi.mock('@/lib/hooks/useTaxonomy', () => ({
  useTaxonomy: () => ({ categories: cats, grouped: [{ parentName: 'Spiritual Concepts', categories: [cats[0]] }, { parentName: 'The Elements', categories: [cats[1]] }] }),
}));

import TagSelector from '@/components/library/TagSelector';
import SearchFiltersModal from '@/components/library/SearchFiltersModal';

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
});
