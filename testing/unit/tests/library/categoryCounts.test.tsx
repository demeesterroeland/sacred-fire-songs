// @vitest-environment jsdom
// Validation 2, item 4 (#388): an amount next to a name is written between parentheses, "Air (3)", never as a
// bare number or a count chip. Applies to category tags on Home, in the Search options and in the song form.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DICTIONARIES } from '@/lib/i18n';
import { formatCount } from '@/lib/format/count';
import type { TaxonomyNode } from '@/lib/taxonomyUtils';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) =>
      Object.entries(p ?? {}).reduce((s, [n, v]) => s.replace(`{${n}}`, String(v)), dict[k] ?? k),
  }),
}));

const cats = [{ id: 'c2', name: 'Fire', slug: 'fire', emoji: null, parent_name: 'The Elements', song_count: 5 }];
vi.mock('@/lib/hooks/useTaxonomy', () => ({
  useTaxonomy: () => ({ categories: cats, grouped: [{ parentName: 'The Elements', categories: cats }] }),
}));

const node = (id: string, name: string, children: TaxonomyNode[] = [], song_count = 3): TaxonomyNode => ({
  id, name, slug: name.toLowerCase(), emoji: null, icon_name: 'Flame', song_count, children,
});
const tree = [node('c1', 'The Elements', [node('t1', 'Air', [], 3)])];
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({ data: tree, isLoading: false }) }));

import CategoryGrid from '@/components/home/CategoryGrid';
import TagSelector from '@/components/library/TagSelector';
import { TagPill } from '@/components/ui/TagPill';

afterEach(cleanup);

describe('formatCount', () => {
  it('puts the amount between parentheses', () => {
    expect(formatCount(3)).toBe('(3)');
    expect(formatCount(0)).toBe('(0)');
  });
});

describe('category counts', () => {
  it('the Home category grid reads "Air (3)"', () => {
    render(<CategoryGrid />);
    expect(screen.getByRole('link', { name: 'Air (3)' })).toBeTruthy();
    expect(screen.getByTestId('tag-count').textContent).toBe('(3)');
  });

  it('the Search options tag browser reads "Fire (5)", without a chip around the number', () => {
    render(<TagSelector category={undefined} tags={[]} onCategoryChange={() => {}} onTagsChange={() => {}} onClearAll={() => {}} />);
    fireEvent.focus(screen.getByRole('textbox'));
    fireEvent.click(screen.getByRole('textbox'));
    expect(screen.getByRole('button', { name: /^Fire \(5\)$/ })).toBeTruthy();
  });

  it('a tag pill with a count (song form) reads "Fire (5)" as plain text', () => {
    const { container } = render(<TagPill label="Fire" count={5} variant="selectable" onClick={() => {}} />);
    expect(container.textContent).toContain('Fire');
    expect(container.textContent).toContain('(5)');
    expect(container.innerHTML).not.toMatch(/bg-white\/20|bg-gray-700/);
  });
});
