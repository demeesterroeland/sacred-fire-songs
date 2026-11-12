// @vitest-environment jsdom
// Story 6.2.13 (#516): the language switch next to the version switch (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SongLanguageSwitch } from '@/components/song/SongLanguageSwitch';
import { DICTIONARIES } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k,
  }),
}));

afterEach(cleanup);

const both = [
  { language: 'nl', lyrics: 'Zing' },
  { language: 'en', lyrics: 'Sing' },
];

describe('SongLanguageSwitch', () => {
  it('renders nothing without translations', () => {
    const { container } = render(<SongLanguageSwitch translations={[]} selected={null} onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when no translation has lyrics', () => {
    const { container } = render(
      <SongLanguageSwitch translations={[{ language: 'nl', lyrics: ' ' }]} selected={null} onSelect={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('is a labelled control: Original first, then the languages by name, the current one checked', () => {
    render(<SongLanguageSwitch translations={both} selected="en" onSelect={() => {}} />);
    expect(screen.getByRole('radiogroup', { name: 'Language of the lyrics' })).toBeTruthy();
    expect(screen.getAllByRole('radio').map((r) => r.textContent)).toEqual(['Original', 'Dutch', 'English']);
    expect(screen.getByRole('radio', { name: 'English' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: 'Original' }).getAttribute('aria-checked')).toBe('false');
  });

  it('checks Original when no language is selected, or the selected one is not offered', () => {
    const { rerender } = render(<SongLanguageSwitch translations={both} selected={null} onSelect={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Original' }).getAttribute('aria-checked')).toBe('true');
    rerender(<SongLanguageSwitch translations={both} selected="xx" onSelect={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Original' }).getAttribute('aria-checked')).toBe('true');
  });

  it('reports the tag of the tapped language, and null for Original', () => {
    const onSelect = vi.fn();
    render(<SongLanguageSwitch translations={both} selected="en" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Dutch' }));
    expect(onSelect).toHaveBeenLastCalledWith('nl');
    fireEvent.click(screen.getByRole('radio', { name: 'Original' }));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it('keeps 44 px targets and token classes only', () => {
    render(<SongLanguageSwitch translations={both} selected={null} onSelect={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Dutch' }).className).toContain('min-h-tap');
    expect(screen.getByRole('radiogroup').outerHTML).not.toMatch(/gray-|red-|amber-|#[0-9a-f]{3,6}/i);
  });
});
