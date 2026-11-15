// @vitest-environment jsdom
// #601 / #586: the Practice drawer's Listen · Record tabs and their count badges (L3, English copy).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PracticeTabs } from '@/components/song/PracticeTabs';
import { DICTIONARIES } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k,
  }),
}));

afterEach(cleanup);

function setup(counts: { listen: number; record: number }, activeTab: 'media' | 'recorder' = 'media') {
  const onSelect = vi.fn();
  render(<PracticeTabs idPrefix="d" counts={counts} activeTab={activeTab} onSelect={onSelect} onKeyDown={vi.fn()} />);
  return { onSelect };
}

describe('PracticeTabs', () => {
  it('shows Listen and Record as tabs, the active one selected', () => {
    setup({ listen: 0, record: 0 }, 'recorder');
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.getAttribute('data-testid'))).toEqual(['practice-tab-listen', 'practice-tab-record']);
    expect(screen.getByTestId('practice-tab-record').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('practice-tab-listen').getAttribute('aria-selected')).toBe('false');
  });

  it('shows a count badge on each tab with something in it', () => {
    setup({ listen: 2, record: 3 });
    expect(screen.getByTestId('practice-tab-listen-count').textContent).toBe('2');
    expect(screen.getByTestId('practice-tab-record-count').textContent).toBe('3');
  });

  it('hides a zero count: takes without reference media show only the Record count', () => {
    setup({ listen: 0, record: 1 });
    expect(screen.queryByTestId('practice-tab-listen-count')).toBeNull();
    expect(screen.getByTestId('practice-tab-record-count').textContent).toBe('1');
  });

  it('selects a tab on click', () => {
    const { onSelect } = setup({ listen: 0, record: 1 });
    fireEvent.click(screen.getByTestId('practice-tab-record'));
    expect(onSelect).toHaveBeenCalledWith('recorder');
  });
});
