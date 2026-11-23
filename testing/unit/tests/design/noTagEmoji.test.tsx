// @vitest-environment jsdom
// Story 6.1.35 (#485): tags and tag categories render plain text, no emoji (owner decision Nov 24, 2026).
// The category data may still carry an `emoji` column; the UI never draws it.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DICTIONARIES } from '@/lib/i18n';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) =>
      Object.entries(p ?? {}).reduce((s, [n, v]) => s.replace(`{${n}}`, String(v)), dict[k] ?? k),
  }),
}));

const cats = [
  { id: 'c1', name: 'Fire', slug: 'fire', emoji: '🔥', parent_name: 'The Elements', song_count: 5 },
  { id: 'c2', name: 'Water', slug: 'water', emoji: '💧', parent_name: 'The Elements', song_count: 2 },
  { id: 'c3', name: 'Moon', slug: 'moon', emoji: '🌙', parent_name: 'Spiritual Concepts', song_count: 1 },
];
vi.mock('@/lib/hooks/useTaxonomy', () => ({
  useTaxonomy: () => ({
    categories: cats,
    grouped: [
      { parentName: 'The Elements', categories: cats.slice(0, 2) },
      { parentName: 'Spiritual Concepts', categories: cats.slice(2) },
    ],
    isLoading: false,
    error: null,
  }),
}));

import { TagPill } from '@/components/ui/TagPill';
import CategorySelector from '@/components/song/CategorySelector';
import TagSelector from '@/components/library/TagSelector';

afterEach(cleanup);

const EMOJI = /\p{Extended_Pictographic}/u;

describe('tags carry no emoji', () => {
  it('TagPill draws its label only, in every variant', () => {
    const { container } = render(
      <>
        <TagPill label="Fire" />
        <TagPill label="Fire" variant="filter" selected onClick={() => {}} />
        <TagPill label="Fire" variant="selectable" selected onClick={() => {}} count={3} />
      </>,
    );
    expect(container.textContent).not.toMatch(EMOJI);
    expect(container.textContent).toContain('Fire');
  });

  it('a badge keeps its grey Tag icon', () => {
    const { container } = render(<TagPill label="Fire" />);
    expect(container.querySelectorAll('svg.lucide-tag').length).toBe(1);
  });

  it('a selected selectable TagPill keeps its check icon, an unselected one has no icon', () => {
    const { container, rerender } = render(<TagPill label="Fire" variant="selectable" selected onClick={() => {}} />);
    expect(container.querySelectorAll('svg.lucide-check').length).toBe(1);
    rerender(<TagPill label="Fire" variant="selectable" onClick={() => {}} />);
    expect(container.querySelectorAll('svg').length).toBe(0);
  });

  it('the Edit song tag picker shows no emoji even when the category data has one', () => {
    const { container } = render(<CategorySelector selectedIds={['c1']} onChange={() => {}} />);
    expect(screen.getAllByText(/Fire/).length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(EMOJI);
  });

  it('the search tag selector shows no emoji in the active chips or the dropdown list', () => {
    const { container } = render(
      <TagSelector
        tags={['fire']}
        onCategoryChange={() => {}}
        onTagsChange={() => {}}
        onClearAll={() => {}}
      />,
    );
    fireEvent.focus(screen.getByRole('textbox'));
    expect(screen.getAllByText(/Water/).length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(EMOJI);
  });
});
