// @vitest-environment jsdom
// Story 6.1.4 / G1.4 (#388): the home category grid is calm and monochrome (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CategoryGrid from '@/components/home/CategoryGrid';
import { countPaletteClasses } from '@/lib/design/paletteAudit';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';
import type { TaxonomyNode } from '@/lib/taxonomyUtils';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, p?: Record<string, string | number>) =>
      Object.entries(p ?? {}).reduce((s, [n, v]) => s.replace(`{${n}}`, String(v)), dict[k] ?? k),
  }),
}));

const node = (id: string, name: string, children: TaxonomyNode[] = [], song_count = 3): TaxonomyNode => ({
  id,
  name,
  slug: name.toLowerCase().replace(/[^a-z]+/g, '-'),
  emoji: null,
  icon_name: 'Flame',
  song_count,
  children,
});

const tree: TaxonomyNode[] = [
  node('c1', 'The Elements', ['Fire', 'Water', 'Earth', 'Air', 'Ether', 'Thunder'].map((n, i) => node(`t${i}`, n, [], i + 1))),
  node('c2', 'Nature', [node('t9', 'Forest', [], 7)]),
];

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: tree, isLoading: false }),
}));

afterEach(cleanup);

describe('CategoryGrid', () => {
  it('uses no palette colours: greyscale tokens and the one accent only', () => {
    const { container } = render(<CategoryGrid />);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
    // The accent appears only on pressed / focus states, never at rest.
    const classes = Array.from(container.querySelectorAll('[class]')).flatMap((el) => el.getAttribute('class')!.split(/\s+/));
    const restingAccent = classes.filter((c) => /(^|:)?(text|bg|border)-accent/.test(c) && !/^(active|focus-visible|group-active):/.test(c));
    expect(restingAccent).toEqual([]);
  });

  it('shows tags as plain text links with a grey count, not coloured chips', () => {
    render(<CategoryGrid />);
    const fire = screen.getByRole('link', { name: /Fire\s*\(1\)/ });
    expect(fire.getAttribute('href')).toBe('/songs?tag=fire');
    expect(fire.querySelector('[data-testid="tag-count"]')?.className).toContain('text-fg-subtle');
    expect(fire.className).not.toMatch(/rounded-(full|pill)|bg-/);
  });

  it('makes every category link at least 44 px tall', () => {
    render(<CategoryGrid />);
    for (const link of screen.getAllByRole('link')) {
      expect(link.className).toMatch(/min-h-tap/);
    }
    const more = screen.getByRole('button', { name: '+2 more' });
    expect(more.className).toMatch(/min-h-tap/);
  });

  it('reveals the hidden tags with the translated "more" button', () => {
    render(<CategoryGrid />);
    fireEvent.click(screen.getByRole('button', { name: '+2 more' }));
    expect(screen.queryByRole('button', { name: '+2 more' })).toBeNull();
  });

  it('has the "more" and description texts in every language', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const d = DICTIONARIES[locale] as Record<string, string>;
      expect(d['explore.categories.more'], locale).toContain('{count}');
      expect(d['explore.category.description'], locale).toContain('{category}');
    }
  });
});
