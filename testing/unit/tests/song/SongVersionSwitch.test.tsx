// @vitest-environment jsdom
// Story 6.1.11 / G2.6 (#395): greyscale segmented control for song versions (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SongVersionSwitch } from '@/components/song/SongVersionSwitch';
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

const two = [
  { id: 'a', version_name: 'Original' },
  { id: 'b', version_name: 'Simplified' },
];

describe('SongVersionSwitch', () => {
  it('renders nothing for a single version', () => {
    const { container } = render(
      <SongVersionSwitch versions={[{ id: 'a', version_name: 'Standard' }]} selectedIndex={0} onSelect={() => {}} />
    );
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('renders nothing without versions', () => {
    const { container } = render(<SongVersionSwitch versions={[]} selectedIndex={0} onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a labelled control with both version names, the current one pressed', () => {
    render(<SongVersionSwitch versions={two} selectedIndex={1} onSelect={() => {}} />);
    const group = screen.getByRole('radiogroup', { name: 'Song version' });
    expect(group).toBeTruthy();
    const original = screen.getByRole('radio', { name: /Original/ });
    const simplified = screen.getByRole('radio', { name: /Simplified/ });
    expect(original.getAttribute('aria-checked')).toBe('false');
    expect(simplified.getAttribute('aria-checked')).toBe('true');
    // Pressed is also underlined, so the state never depends on colour alone.
    expect(simplified.querySelector('span')!.className).toContain('underline');
    expect(original.querySelector('span')!.className).not.toContain('underline');
  });

  it('tapping a segment selects that version index; the current one is a no-op', () => {
    const onSelect = vi.fn();
    render(<SongVersionSwitch versions={two} selectedIndex={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('radio', { name: /Original/ }));
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('radio', { name: /Simplified/ }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('keeps 44 px targets and token classes only', () => {
    render(<SongVersionSwitch versions={two} selectedIndex={0} onSelect={() => {}} />);
    const btn = screen.getByRole('radio', { name: /Original/ });
    expect(btn.className).toContain('min-h-tap');
    expect(screen.getByRole('radiogroup').outerHTML).not.toMatch(/gray-|red-|amber-|#[0-9a-f]{3,6}/i);
  });
});
