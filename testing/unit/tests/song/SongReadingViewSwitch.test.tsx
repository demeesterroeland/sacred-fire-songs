// @vitest-environment jsdom
// Story 6.2.14 (#517): the reader switch Original · Translation · Both (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SongReadingViewSwitch } from '@/components/song/SongReadingViewSwitch';
import { DICTIONARIES } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k,
  }),
}));

afterEach(cleanup);

describe('SongReadingViewSwitch', () => {
  it('renders nothing (and takes no space) for a song without a translation', () => {
    const { container } = render(<SongReadingViewSwitch visible={false} value="original" onChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('is a labelled radiogroup Original · Translation · Both with the current view checked', () => {
    render(<SongReadingViewSwitch visible value="both" onChange={() => {}} />);
    expect(screen.getByRole('radiogroup', { name: 'Show' })).toBeTruthy();
    expect(screen.getAllByRole('radio').map((r) => r.textContent)).toEqual(['Original', 'Translation', 'Both']);
    expect(screen.getByRole('radio', { name: 'Both' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: 'Original' }).getAttribute('aria-checked')).toBe('false');
  });

  it('reports each view in one tap', () => {
    const onChange = vi.fn();
    render(<SongReadingViewSwitch visible value="translation" onChange={onChange} />);
    for (const [name, view] of [['Original', 'original'], ['Both', 'both']] as const) {
      fireEvent.click(screen.getByRole('radio', { name }));
      expect(onChange).toHaveBeenLastCalledWith(view);
    }
  });

  it('keeps 44 px targets and token classes only', () => {
    render(<SongReadingViewSwitch visible value="original" onChange={() => {}} />);
    for (const radio of screen.getAllByRole('radio')) expect(radio.className).toContain('min-h-tap');
    expect(screen.getByRole('radiogroup').outerHTML).not.toMatch(/gray-|red-|amber-|#[0-9a-f]{3,6}/i);
  });
});
