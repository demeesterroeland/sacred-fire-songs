// @vitest-environment jsdom
// Story 6.1.10 / G2.5 (#394): the overflow sheet with Transpose, auto-scroll speed and stay-awake (L3, English copy).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ReadingToolsSheet } from '@/components/song/ReadingToolsSheet';
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

function setup(over: Partial<React.ComponentProps<typeof ReadingToolsSheet>> = {}) {
  const props: React.ComponentProps<typeof ReadingToolsSheet> = {
    open: true,
    onOpenChange: vi.fn(),
    transpose: { semitones: 0, originalKey: 'E', onShift: vi.fn(), onReset: vi.fn() },
    speed: 3,
    onSpeed: vi.fn(),
    scrolling: false,
    onToggleScroll: vi.fn(),
    awake: false,
    ...over,
  };
  render(<ReadingToolsSheet {...props} />);
  return props;
}

describe('ReadingToolsSheet', () => {
  it('is a dialog titled Reading tools', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'Reading tools' })).toBeTruthy();
  });

  it('transpose + and − shift by one semitone', () => {
    const p = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Up a semitone' }));
    expect(p.transpose!.onShift).toHaveBeenLastCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: 'Down a semitone' }));
    expect(p.transpose!.onShift).toHaveBeenLastCalledWith(-1);
  });

  it('reads out the shift and the new key in words (E +2 → F#)', () => {
    setup({ transpose: { semitones: 2, originalKey: 'E', onShift: vi.fn(), onReset: vi.fn() } });
    const group = screen.getByRole('group', { name: 'Transpose' });
    expect(within(group).getByTestId('transpose-value').textContent).toBe('+2');
    expect(within(group).getByTestId('transpose-key').textContent).toContain('F#');
    expect(within(group).getByTestId('transpose-key').textContent).toContain('E');
  });

  it('offers the original key only after a change', () => {
    const p = setup();
    expect(screen.queryByRole('button', { name: 'Original key' })).toBeNull();
    cleanup();
    const q = setup({ transpose: { semitones: -3, originalKey: 'E', onShift: vi.fn(), onReset: vi.fn() } });
    fireEvent.click(screen.getByRole('button', { name: 'Original key' }));
    expect(q.transpose!.onReset).toHaveBeenCalledTimes(1);
    expect(p.transpose!.onReset).not.toHaveBeenCalled();
  });

  it('keeps ± as aria-disabled at the ends of the range', () => {
    setup({ transpose: { semitones: 11, originalKey: 'E', onShift: vi.fn(), onReset: vi.fn() } });
    expect(screen.getByRole('button', { name: 'Up a semitone' }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('button', { name: 'Down a semitone' }).getAttribute('aria-disabled')).toBe('false');
  });

  it('has no Transpose block for readers who cannot transpose', () => {
    setup({ transpose: undefined });
    expect(screen.queryByRole('group', { name: 'Transpose' })).toBeNull();
    expect(screen.getByRole('group', { name: 'Auto-scroll' })).toBeTruthy();
  });

  it('Start / Pause toggles auto-scroll, and the speed has Slower and Faster', () => {
    const p = setup();
    const group = screen.getByRole('group', { name: 'Auto-scroll' });
    fireEvent.click(within(group).getByRole('button', { name: 'Start' }));
    expect(p.onToggleScroll).toHaveBeenCalledTimes(1);
    fireEvent.click(within(group).getByRole('button', { name: 'Faster' }));
    expect(p.onSpeed).toHaveBeenLastCalledWith(1);
    fireEvent.click(within(group).getByRole('button', { name: 'Slower' }));
    expect(p.onSpeed).toHaveBeenLastCalledWith(-1);
    expect(within(group).getByTestId('scroll-speed').textContent).toBe('Speed 3 of 5');
  });

  it('shows Pause while scrolling', () => {
    setup({ scrolling: true });
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
  });

  it('Faster is aria-disabled at the top speed', () => {
    setup({ speed: 5 });
    expect(screen.getByRole('button', { name: 'Faster' }).getAttribute('aria-disabled')).toBe('true');
  });

  it('says in words that the screen stays on when the wake lock is active', () => {
    setup({ awake: true });
    expect(screen.getByTestId('stay-awake-row').textContent).toContain('Screen stays on');
    cleanup();
    setup({ awake: false });
    expect(screen.queryByTestId('stay-awake-row')).toBeNull();
  });

  it('is a place where touches do not stop auto-scroll', () => {
    setup();
    expect(screen.getByRole('dialog').closest('[data-autoscroll-keep]') ?? screen.getByRole('dialog').hasAttribute('data-autoscroll-keep')).toBeTruthy();
  });
});

describe('ReadingToolsSheet focus', () => {
  it('returns focus to the ⋯ button when it closes', async () => {
    const ref = { current: null as HTMLButtonElement | null };
    const base: React.ComponentProps<typeof ReadingToolsSheet> = {
      open: true,
      onOpenChange: vi.fn(),
      speed: 3,
      onSpeed: vi.fn(),
      scrolling: false,
      onToggleScroll: vi.fn(),
      awake: false,
      returnFocusRef: ref,
    };
    const ui = (open: boolean) => (
      <>
        <button ref={ref}>more</button>
        <ReadingToolsSheet {...base} open={open} />
      </>
    );
    const { rerender } = render(ui(true));
    rerender(ui(false));
    await waitFor(() => expect(document.activeElement).toBe(ref.current));
  });
});
