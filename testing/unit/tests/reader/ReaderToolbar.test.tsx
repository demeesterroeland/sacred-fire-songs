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
    // The visible glyph is hidden from assistive technology; the translated words are the name (Story 6.1.34, #418).
    expect(screen.getByRole('button', { name: 'Smaller text' }).querySelector('[aria-hidden]')?.textContent).toBe('A−');
    expect(screen.getByRole('button', { name: 'Larger text' }).querySelector('[aria-hidden]')?.textContent).toBe('A+');
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

  // Story 6.1.10 / G2.5 (#394): auto-scroll joins the same toolbar. Validation 2, item 11: the ⋯ button is gone (the song
  // page's ⋮ menu holds transpose, speed and the screen switch).
  describe('auto-scroll', () => {
    const base = { step: 1, chords: true, speed: 3, hasChords: true, onChange: () => {} };

    it('shows an Auto-scroll toggle when wired, and no second ⋯ menu button', () => {
      render(<ReaderToolbar {...base} scrolling={false} onToggleScroll={() => {}} />);
      const toggle = screen.getByRole('button', { name: 'Auto-scroll' });
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
      expect(screen.queryByRole('button', { name: /More reading tools/ })).toBeNull();
      expect(screen.queryByTestId('reader-tools-button')).toBeNull();
    });

    it('the toggle reflects the playing state and calls back', () => {
      const onToggleScroll = vi.fn();
      render(<ReaderToolbar {...base} scrolling onToggleScroll={onToggleScroll} />);
      const toggle = screen.getByRole('button', { name: 'Auto-scroll' });
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
      fireEvent.click(toggle);
      expect(onToggleScroll).toHaveBeenCalledTimes(1);
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

    it('every control is a 44 px target', () => {
      render(<ReaderToolbar {...base} onToggleScroll={() => {}} />);
      for (const b of screen.getAllByRole('button')) expect(b.className).toMatch(/min-h-tap/);
    });
  });

  // Validation 1 review, M1: a focused button that goes away must not drop focus to <body>.
  it('moves focus to A+ when the focused ▶ goes away (the window grew, the song now fits)', () => {
    const base = { step: 1, chords: true, speed: 3, hasChords: true, onChange: () => {} };
    const { rerender } = render(<ReaderToolbar {...base} onToggleScroll={() => {}} />);
    screen.getByTestId('autoscroll-toggle').focus();
    expect(document.activeElement).toBe(screen.getByTestId('autoscroll-toggle'));
    rerender(<ReaderToolbar {...base} />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Larger text' }));
  });

  it('leaves focus alone when it was not on the button that went away', () => {
    const base = { step: 1, chords: true, speed: 3, hasChords: true, onChange: () => {} };
    const { rerender } = render(<ReaderToolbar {...base} onToggleScroll={() => {}} />);
    screen.getByRole('switch', { name: 'Chords' }).focus();
    rerender(<ReaderToolbar {...base} />);
    expect(document.activeElement).toBe(screen.getByRole('switch', { name: 'Chords' }));
  });
});

// Chord tools in one place (#566): `Chords [switch] · [− n +] transpose · A− · A+`; the stepper only while chords are on.
describe('ReaderToolbar — transpose stepper', () => {
  const base = { step: 1, chords: true, speed: 3, hasChords: true, onChange: () => {} };
  const transpose = (over: Partial<{ semitones: number; onShift: (d: -1 | 1) => void; onReset: () => void }> = {}) => ({
    semitones: 0,
    onShift: vi.fn(),
    onReset: vi.fn(),
    ...over,
  });

  it('sits right after the Chords switch and before A−', () => {
    render(<ReaderToolbar {...base} transpose={transpose()} />);
    const order = [...screen.getByTestId('reader-toolbar').querySelectorAll('[role="switch"], button, [data-testid="transpose-stepper"]')]
      .map((el) => el.getAttribute('data-testid') === 'transpose-stepper' ? 'stepper' : (el.getAttribute('aria-label') ?? el.textContent ?? ''));
    const at = (needle: string) => order.findIndex((x) => x.includes(needle));
    expect(at('Chords')).toBeLessThan(at('stepper'));
    expect(at('stepper')).toBeLessThan(at('Smaller text'));
  });

  it('is one labelled group with − n + and the shift in words, signed', () => {
    render(<ReaderToolbar {...base} transpose={transpose({ semitones: 2 })} />);
    const group = screen.getByRole('group', { name: 'Transpose' });
    expect(group.getAttribute('data-testid')).toBe('transpose-stepper');
    expect(screen.getByRole('button', { name: 'Down a semitone' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Up a semitone' })).toBeTruthy();
    expect(screen.getByTestId('transpose-value').textContent).toBe('+2');
  });

  it('+ and − shift by one semitone', () => {
    const tr = transpose();
    render(<ReaderToolbar {...base} transpose={tr} />);
    fireEvent.click(screen.getByRole('button', { name: 'Up a semitone' }));
    expect(tr.onShift).toHaveBeenLastCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: 'Down a semitone' }));
    expect(tr.onShift).toHaveBeenLastCalledWith(-1);
  });

  it('keeps ± aria-disabled and inert at the ends of the range', () => {
    const tr = transpose({ semitones: 11 });
    render(<ReaderToolbar {...base} transpose={tr} />);
    const up = screen.getByRole('button', { name: 'Up a semitone' });
    expect(up.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(up);
    expect(tr.onShift).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Down a semitone' }).getAttribute('aria-disabled')).toBe('false');
  });

  it('tapping the value goes back to the original key, only after a change, and its accessible name keeps the shift', () => {
    const none = transpose();
    const { rerender } = render(<ReaderToolbar {...base} transpose={none} />);
    expect(screen.queryByRole('button', { name: /Original key/ })).toBeNull();
    expect(screen.getByTestId('transpose-value').textContent).toBe('0');
    const changed = transpose({ semitones: -3 });
    rerender(<ReaderToolbar {...base} transpose={changed} />);
    const resetBtn = screen.getByRole('button', { name: '−3 — Original key' });
    fireEvent.click(resetBtn);
    expect(changed.onReset).toHaveBeenCalledTimes(1);
  });

  it('keeps one stable live region across 0 -> +1 -> 0 so screen readers announce the first change', () => {
    const { rerender } = render(<ReaderToolbar {...base} transpose={transpose({ semitones: 0 })} />);
    const live = screen.getByTestId('transpose-live');
    expect(live.getAttribute('aria-live')).toBe('polite');
    expect(live.textContent).toBe('Transposed 0');
    rerender(<ReaderToolbar {...base} transpose={transpose({ semitones: 1 })} />);
    expect(screen.getByTestId('transpose-live')).toBe(live);
    expect(live.textContent).toBe('Transposed +1');
    rerender(<ReaderToolbar {...base} transpose={transpose({ semitones: 0 })} />);
    expect(screen.getByTestId('transpose-live')).toBe(live);
    expect(live.textContent).toBe('Transposed 0');
  });

  it('is hidden while chords are off', () => {
    render(<ReaderToolbar {...base} chords={false} transpose={transpose()} />);
    expect(screen.queryByTestId('transpose-stepper')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Up a semitone' })).toBeNull();
    // The Chords switch and the text size stay.
    expect(screen.getByRole('switch', { name: 'Chords' }).getAttribute('aria-checked')).toBe('false');
    expect(screen.getByRole('button', { name: 'Larger text' })).toBeTruthy();
  });

  it('shows with the switch and goes when it is flipped off (the toolbar follows the preference)', () => {
    const { rerender } = render(<ReaderToolbar {...base} transpose={transpose()} />);
    expect(screen.getByTestId('transpose-stepper')).toBeTruthy();
    rerender(<ReaderToolbar {...base} chords={false} transpose={transpose()} />);
    expect(screen.queryByTestId('transpose-stepper')).toBeNull();
  });

  it('is not there for a reader who may not transpose, or for a song without chords', () => {
    const { rerender } = render(<ReaderToolbar {...base} />);
    expect(screen.queryByTestId('transpose-stepper')).toBeNull();
    rerender(<ReaderToolbar {...base} hasChords={false} transpose={transpose()} />);
    expect(screen.queryByRole('switch')).toBeNull();
    expect(screen.queryByTestId('transpose-stepper')).toBeNull();
  });

  it('every stepper control is a 44 px target, and the value does not shrink below readable text', () => {
    render(<ReaderToolbar {...base} transpose={transpose({ semitones: 1 })} />);
    for (const name of ['Down a semitone', 'Up a semitone', '+1 — Original key']) {
      expect(screen.getByRole('button', { name }).className).toMatch(/min-h-tap/);
    }
    expect(screen.getByTestId('transpose-value').className).not.toMatch(/text-\[(?:\d|1[01])px\]|text-xs/);
  });

  it('lets the row wrap on a narrow phone instead of scrolling sideways', () => {
    render(<ReaderToolbar {...base} transpose={transpose()} />);
    const cls = screen.getByTestId('reader-toolbar').className;
    expect(cls).toMatch(/flex-wrap/);
    expect(cls).not.toMatch(/overflow-x-(auto|scroll)/);
  });
});
