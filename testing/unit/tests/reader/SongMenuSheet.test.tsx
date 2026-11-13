// @vitest-environment jsdom
// Story 6.1.10 / G2.5 (#394) + validation 2, item 11: the ONE song menu: auto-scroll speed, the screen-stays-on
// switch, and the song actions (Share, Edit, Delete) (L3, English copy). Transpose is not here: it sits next to the
// Chords switch in the reader toolbar (#566).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { SongMenuSheet } from '@/components/song/SongMenuSheet';
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

function setup(over: Partial<React.ComponentProps<typeof SongMenuSheet>> = {}) {
  const props: React.ComponentProps<typeof SongMenuSheet> = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'River Song',
    description: 'by Ayla',
    actions: { onShare: vi.fn() },
    speed: 3,
    onSpeed: vi.fn(),
    scrolling: false,
    onToggleScroll: vi.fn(),
    keepAwake: true,
    onKeepAwakeChange: vi.fn(),
    awakeSupported: true,
    ...over,
  };
  render(<SongMenuSheet {...props} />);
  return props;
}

describe('SongMenuSheet', () => {
  it('has no Auto-scroll section when the song fits the screen (no toggle given)', () => {
    setup({ onToggleScroll: undefined });
    expect(screen.queryByTestId('tools-scroll-toggle')).toBeNull();
    expect(screen.queryByRole('group', { name: 'Auto-scroll' })).toBeNull();
    expect(screen.queryByTestId('scroll-speed')).toBeNull();
  });

  it('is a dialog named after the song, with the author under it', () => {
    setup();
    const dialog = screen.getByRole('dialog', { name: 'River Song' });
    expect(within(dialog).getByText('by Ayla')).toBeTruthy();
  });

  it('always has something to do: with no auto-scroll it still holds Share and the screen switch', () => {
    setup({ onToggleScroll: undefined });
    expect(screen.getByRole('button', { name: 'Share Song' })).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Screen stays on' })).toBeTruthy();
  });

  // Chord tools in one place (#566): transpose lives next to the Chords switch, never in this menu.
  it('has no Transpose item: not a group, not a stepper, not the key line', () => {
    setup();
    expect(screen.queryByRole('group', { name: 'Transpose' })).toBeNull();
    expect(screen.queryByText('Transpose')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Up a semitone' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Down a semitone' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Original key' })).toBeNull();
    expect(screen.queryByTestId('transpose-group')).toBeNull();
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

  it('has a real switch for "Screen stays on": on by default, and flipping it reports the new value', () => {
    const p = setup();
    const sw = screen.getByRole('switch', { name: 'Screen stays on' });
    expect(sw.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(sw);
    expect(p.onKeepAwakeChange).toHaveBeenLastCalledWith(false);
  });

  it('shows the switch off when the preference is off', () => {
    setup({ keepAwake: false });
    expect(screen.getByRole('switch', { name: 'Screen stays on' }).getAttribute('aria-checked')).toBe('false');
  });

  it('disables the switch and says why when the browser cannot keep the screen on', () => {
    setup({ awakeSupported: false });
    const sw = screen.getByRole('switch', { name: 'Screen stays on' }) as HTMLButtonElement;
    expect(sw.disabled).toBe(true);
    expect(screen.getByText('Not supported by your browser')).toBeTruthy();
  });

  it('is a place where touches do not stop auto-scroll', () => {
    setup();
    expect(screen.getByRole('dialog').closest('[data-autoscroll-keep]') ?? screen.getByRole('dialog').hasAttribute('data-autoscroll-keep')).toBeTruthy();
  });
});

describe('SongMenuSheet actions', () => {
  it('Share runs the share action', () => {
    const p = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Share Song' }));
    expect(p.actions.onShare).toHaveBeenCalledTimes(1);
  });

  it('offers Edit (a link to the editor) and Delete only to someone who may change the song', () => {
    setup();
    expect(screen.queryByRole('link', { name: 'Edit Song' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete Song' })).toBeNull();
    cleanup();
    const onDelete = vi.fn();
    setup({ actions: { onShare: vi.fn(), edit: { href: '/songs/s1/edit?version=v2' }, onDelete } });
    expect(screen.getByRole('link', { name: 'Edit Song' }).getAttribute('href')).toBe('/songs/s1/edit?version=v2');
    fireEvent.click(screen.getByRole('button', { name: 'Delete Song' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('keeps Delete neutral (no red) until the confirmation dialog', () => {
    setup({ actions: { onShare: vi.fn(), onDelete: vi.fn() } });
    expect(screen.getByRole('button', { name: 'Delete Song' }).className).not.toMatch(/danger|red-/);
  });

  it('closing the menu is a request to the page (Close button)', () => {
    const p = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(p.onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('SongMenuSheet focus', () => {
  it('returns focus to the button that opened it when it closes', async () => {
    const opener = { current: null as HTMLButtonElement | null };
    const base = {
      onOpenChange: vi.fn(),
      title: 'River Song',
      actions: { onShare: vi.fn() },
      speed: 3,
      onSpeed: vi.fn(),
      scrolling: false,
      keepAwake: true,
      onKeepAwakeChange: vi.fn(),
      awakeSupported: true,
    };
    const ui = (open: boolean) => (
      <>
        <button ref={opener}>more</button>
        <SongMenuSheet {...base} open={open} />
      </>
    );
    const { rerender } = render(ui(false));
    opener.current!.focus();
    rerender(ui(true));
    rerender(ui(false));
    await waitFor(() => expect(document.activeElement).toBe(opener.current));
  });
});

// Validation 4: the owner (or an admin) of a private song can make it public from the menu.
describe('SongMenuSheet — Make public', () => {
  it('shows "Make public" only when the page passes onPublish, and calls it', () => {
    const onPublish = vi.fn();
    setup({ actions: { onShare: vi.fn(), onPublish } });
    fireEvent.click(screen.getByRole('button', { name: 'Make public' }));
    expect(onPublish).toHaveBeenCalledOnce();
  });

  it('has no "Make public" for a public song or a reader who may not publish', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Make public' })).toBeNull();
  });
});
