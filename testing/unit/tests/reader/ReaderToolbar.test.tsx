// @vitest-environment jsdom
// Story 6.1.6 / G2.1 (#390): Chords · A− · A+ toolbar (RTL component test, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReaderToolbar } from '@/components/song/ReaderToolbar';
import { LYRIC_STEPS } from '@/lib/design/tokens';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string) =>
      ({
        'viewer.toolbar': 'Reading options',
        'viewer.chords': 'Chords',
        'viewer.fontSmaller': 'Smaller text',
        'viewer.fontLarger': 'Larger text',
      })[k] ?? k,
  }),
}));

afterEach(cleanup);

describe('ReaderToolbar', () => {
  it('renders a labelled toolbar with the chords switch and A− / A+', () => {
    render(<ReaderToolbar step={1} chords hasChords onChange={() => {}} />);
    expect(screen.getByRole('toolbar', { name: 'Reading options' })).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Chords' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('button', { name: 'Smaller text' }).textContent).toBe('A−');
    expect(screen.getByRole('button', { name: 'Larger text' }).textContent).toBe('A+');
  });

  it('A+ grows and A− shrinks the size one step', () => {
    const onChange = vi.fn();
    render(<ReaderToolbar step={2} chords hasChords onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Larger text' }));
    expect(onChange).toHaveBeenLastCalledWith({ step: 3, chords: true });
    fireEvent.click(screen.getByRole('button', { name: 'Smaller text' }));
    expect(onChange).toHaveBeenLastCalledWith({ step: 1, chords: true });
  });

  it('marks A− / A+ aria-disabled at the ends, keeps them focusable and ignores taps', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ReaderToolbar step={0} chords hasChords onChange={onChange} />);
    const smaller = screen.getByRole('button', { name: 'Smaller text' }) as HTMLButtonElement;
    expect(smaller.getAttribute('aria-disabled')).toBe('true');
    expect(smaller.disabled).toBe(false);
    fireEvent.click(smaller);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Larger text' }).getAttribute('aria-disabled')).toBe('false');
    rerender(<ReaderToolbar step={LYRIC_STEPS.length - 1} chords hasChords onChange={onChange} />);
    const larger = screen.getByRole('button', { name: 'Larger text' });
    expect(larger.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(larger);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('toggles chords, and hides the switch for songs without chords', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ReaderToolbar step={1} chords hasChords onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Chords' }));
    expect(onChange).toHaveBeenLastCalledWith({ step: 1, chords: false });
    rerender(<ReaderToolbar step={1} chords hasChords={false} onChange={onChange} />);
    expect(screen.queryByRole('switch')).toBeNull();
  });
});
