// @vitest-environment jsdom
// Story 6.1.29 / G7.1 (#413): the search suggestion panel (RTL, L3).
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import { countPaletteClasses } from '@/lib/design/paletteAudit';
import { DICTIONARIES } from '@/lib/i18n';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => dict[k] ?? k }),
}));

afterEach(cleanup);

const categories = [
  { id: 'c1', name: 'The Elements', slug: 'the-elements' },
  { id: 'c2', name: 'Nature', slug: 'nature' },
  { id: 'c3', name: 'Languages', slug: 'languages' },
];

function setup(over: Partial<React.ComponentProps<typeof SearchSuggestions>> = {}) {
  const props = {
    recent: ['agua', 'fuego'],
    categories,
    activeCategory: undefined,
    onSelectRecent: vi.fn(),
    onRemoveRecent: vi.fn(),
    onClearRecent: vi.fn(),
    onToggleCategory: vi.fn(),
    onClose: vi.fn(),
    onLeaveTop: vi.fn(),
    ...over,
  };
  render(<SearchSuggestions {...props} />);
  return props;
}

describe('SearchSuggestions', () => {
  it('offers recent searches and the top-level categories as chips', () => {
    setup();
    const recent = screen.getByRole('region', { name: 'Recent searches' });
    expect(within(recent).getByRole('button', { name: 'agua' })).toBeTruthy();
    expect(within(recent).getByRole('button', { name: 'fuego' })).toBeTruthy();
    const cats = screen.getByRole('region', { name: 'Categories' });
    expect(within(cats).getAllByRole('button').map((b) => b.textContent)).toEqual(['The Elements', 'Nature', 'Languages']);
  });

  it('shows the chips alone when there are no recent searches (no empty heading)', () => {
    setup({ recent: [] });
    expect(screen.queryByText('Recent searches')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Nature' })).toBeTruthy();
  });

  it('repeats a search in one tap', () => {
    const p = setup();
    fireEvent.click(screen.getByRole('button', { name: 'agua' }));
    expect(p.onSelectRecent).toHaveBeenCalledWith('agua');
  });

  it('clears one term, or all of them', () => {
    const p = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Remove "fuego"' }));
    expect(p.onRemoveRecent).toHaveBeenCalledWith('fuego');
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(p.onClearRecent).toHaveBeenCalledTimes(1);
  });

  it('toggles a category; the active one is pressed and carries a check', () => {
    const p = setup({ activeCategory: 'nature' });
    expect(screen.getByRole('button', { name: 'Nature' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Languages' }).getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Languages' }));
    expect(p.onToggleCategory).toHaveBeenCalledWith('languages');
  });

  it('closes on Escape', () => {
    const p = setup();
    fireEvent.keyDown(screen.getByRole('button', { name: 'agua' }), { key: 'Escape' });
    expect(p.onClose).toHaveBeenCalledTimes(1);
  });

  it('moves with the arrow keys and hands focus back to the field above the first item', () => {
    const p = setup();
    const items = screen.getAllByRole('button');
    items[0].focus();
    fireEvent.keyDown(items[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);
    fireEvent.keyDown(items[1], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(items[0], { key: 'ArrowUp' });
    expect(p.onLeaveTop).toHaveBeenCalledTimes(1);
    const last = items[items.length - 1];
    last.focus();
    fireEvent.keyDown(last, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(last);
  });

  it('uses 44 px targets, at least 12 px text and no palette colours', () => {
    setup();
    for (const b of screen.getAllByRole('button')) {
      expect(b.className, b.textContent ?? '').toMatch(/min-h-tap|size-tap/);
    }
    const source = fs.readFileSync(path.resolve(__dirname, '../../../../components/search/SearchSuggestions.tsx'), 'utf8');
    expect(countPaletteClasses(source)).toBe(0);
    expect(source).not.toMatch(/text-\[\d+px\]|text-xs\b/);
  });
});
