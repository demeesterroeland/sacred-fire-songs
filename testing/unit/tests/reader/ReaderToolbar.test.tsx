// @vitest-environment jsdom
// Story 6.1.6 / G2.1 (#390): Chords · A− · A+ toolbar (RTL component test, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReaderToolbar } from '@/components/song/ReaderToolbar';
import { LYRIC_STEPS } from '@/lib/design/tokens';
import { DICTIONARIES } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string, vars?: Record<string, string | number>) => {
      const text = (DICTIONARIES.en as Record<string, string>)[k] ?? k;
      return vars ? text.replace(/\{(\w+)\}/g, (_m, name) => String(vars[name])) : text;
    },
  }),
}));

afterEach(cleanup);

describe('ReaderToolbar', () => {
  it('renders a labelled toolbar with the chords switch and A− / A+', () => {
    render(<ReaderToolbar step={1} chords speed={3} hasChords onChange={() => {}} />);
    expect(screen.getByRole('toolbar', { name: 'Reading options' })).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Chords' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('button', { name: 'Smaller text' }).textContent).toBe('A−');
    expect(screen.getByRole('button', { name: 'Larger text' }).textContent).toBe('A+');
  });

  it('A+ grows and A− shrinks the size one step', () => {
    const onChange = vi.fn();
    render(<ReaderToolbar step={2} chords speed={3} hasChords onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Larger text' }));
    expect(onChange).toHaveBeenLastCalledWith({ step: 3, chords: true, speed: 3 });
    fireEvent.click(screen.getByRole('button', { name: 'Smaller text' }));
    expect(onChange).toHaveBeenLastCalledWith({ step: 1, chords: true, speed: 3 });
  });

  it('marks A− / A+ aria-disabled at the ends, keeps them focusable and ignores taps', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ReaderToolbar step={0} chords speed={3} hasChords onChange={onChange} />);
    const smaller = screen.getByRole('button', { name: 'Smaller text' }) as HTMLButtonElement;
    expect(smaller.getAttribute('aria-disabled')).toBe('true');
    expect(smaller.disabled).toBe(false);
    fireEvent.click(smaller);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Larger text' }).getAttribute('aria-disabled')).toBe('false');
    rerender(<ReaderToolbar step={LYRIC_STEPS.length - 1} chords speed={3} hasChords onChange={onChange} />);
    const larger = screen.getByRole('button', { name: 'Larger text' });
    expect(larger.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(larger);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('toggles chords, and hides the switch for songs without chords', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ReaderToolbar step={1} chords speed={3} hasChords onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Chords' }));
    expect(onChange).toHaveBeenLastCalledWith({ step: 1, chords: false, speed: 3 });
    rerender(<ReaderToolbar step={1} chords speed={3} hasChords={false} onChange={onChange} />);
    expect(screen.queryByRole('switch')).toBeNull();
  });

  // Story 6.1.10 / G2.5 (#394): auto-scroll and the overflow button join the same toolbar.
  describe('auto-scroll and reading tools', () => {
    const base = { step: 1, chords: true, speed: 3, hasChords: true, onChange: () => {} };

    it('shows an Auto-scroll toggle and a More reading tools button when wired', () => {
      render(<ReaderToolbar {...base} scrolling={false} onToggleScroll={() => {}} onOpenTools={() => {}} />);
      const toggle = screen.getByRole('button', { name: 'Auto-scroll' });
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
      expect(screen.getByRole('button', { name: /More reading tools/ })).toBeTruthy();
    });

    it('the toggle reflects the playing state and calls back', () => {
      const onToggleScroll = vi.fn();
      render(<ReaderToolbar {...base} scrolling onToggleScroll={onToggleScroll} onOpenTools={() => {}} />);
      const toggle = screen.getByRole('button', { name: 'Auto-scroll' });
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
      fireEvent.click(toggle);
      expect(onToggleScroll).toHaveBeenCalledTimes(1);
    });

    it('the overflow button opens the tools', () => {
      const onOpenTools = vi.fn();
      render(<ReaderToolbar {...base} onToggleScroll={() => {}} onOpenTools={onOpenTools} />);
      fireEvent.click(screen.getByRole('button', { name: /More reading tools/ }));
      expect(onOpenTools).toHaveBeenCalledTimes(1);
    });

    it('shows the transposition as text on the overflow button, and names it for screen readers', () => {
      render(<ReaderToolbar {...base} onOpenTools={() => {}} semitones={2} />);
      const more = screen.getByRole('button', { name: /More reading tools/ });
      expect(more.textContent).toContain('+2');
      expect(more.getAttribute('aria-label') ?? more.textContent).toMatch(/\+2/);
    });

    it('shows no transposition text at 0', () => {
      render(<ReaderToolbar {...base} onOpenTools={() => {}} semitones={0} />);
      expect(screen.getByRole('button', { name: /More reading tools/ }).textContent).not.toMatch(/[+\u2212]\d/);
    });

    it('marks itself as a place where touches do not stop auto-scroll', () => {
      render(<ReaderToolbar {...base} onToggleScroll={() => {}} />);
      expect(screen.getByTestId('reader-toolbar').closest('[data-autoscroll-keep]')).toBeTruthy();
    });

    it('shows the stay-awake indicator only while the wake lock is active', () => {
      const { rerender } = render(<ReaderToolbar {...base} awake={false} />);
      expect(screen.queryByTestId('stay-awake-indicator')).toBeNull();
      rerender(<ReaderToolbar {...base} awake />);
      const indicator = screen.getByTestId('stay-awake-indicator');
      expect(indicator.getAttribute('aria-label')).toBe('Screen stays on');
    });

    it('the overflow button says whether the tools are open, and hands out its element for focus return', () => {
      const ref = { current: null as HTMLButtonElement | null };
      const { rerender } = render(<ReaderToolbar {...base} onOpenTools={() => {}} toolsOpen={false} toolsButtonRef={ref} />);
      const more = screen.getByRole('button', { name: /More reading tools/ });
      expect(more.getAttribute('aria-expanded')).toBe('false');
      expect(ref.current).toBe(more);
      rerender(<ReaderToolbar {...base} onOpenTools={() => {}} toolsOpen toolsButtonRef={ref} />);
      expect(screen.getByRole('button', { name: /More reading tools/ }).getAttribute('aria-expanded')).toBe('true');
    });

    it('every control is a 44 px target', () => {
      render(<ReaderToolbar {...base} onToggleScroll={() => {}} onOpenTools={() => {}} />);
      for (const b of screen.getAllByRole('button')) expect(b.className).toMatch(/min-h-tap/);
    });
  });
});
