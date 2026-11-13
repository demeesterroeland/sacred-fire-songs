// @vitest-environment jsdom
// Story 6.2.13 (#516), 6.2.14 (#517): the language switch picks the language of the translation (RTL, L3).
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
  it('renders nothing without translations, or when no translation has lyrics', () => {
    const { container, rerender } = render(<SongLanguageSwitch visible translations={[]} selected={null} onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
    rerender(<SongLanguageSwitch visible translations={[{ language: 'nl', lyrics: ' ' }]} selected={null} onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing with one language: Translation in the view switch already picks it', () => {
    const { container } = render(<SongLanguageSwitch visible translations={[both[0]]} selected="nl" onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing while the original is read (visible=false)', () => {
    const { container } = render(<SongLanguageSwitch visible={false} translations={both} selected="en" onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('is a labelled control with the languages by name and no "Original", the current one checked', () => {
    render(<SongLanguageSwitch visible translations={both} selected="en" onSelect={() => {}} />);
    expect(screen.getByRole('radiogroup', { name: 'Language of the translation' })).toBeTruthy();
    expect(screen.getAllByRole('radio').map((r) => r.textContent)).toEqual(['Dutch', 'English']);
    expect(screen.getByRole('radio', { name: 'English' }).getAttribute('aria-checked')).toBe('true');
  });

  it('reports the tag of the tapped language', () => {
    const onSelect = vi.fn();
    render(<SongLanguageSwitch visible translations={both} selected="en" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Dutch' }));
    expect(onSelect).toHaveBeenLastCalledWith('nl');
  });

  it('keeps 44 px targets and token classes only', () => {
    render(<SongLanguageSwitch visible translations={both} selected="nl" onSelect={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Dutch' }).className).toContain('min-h-tap');
    expect(screen.getByRole('radiogroup').outerHTML).not.toMatch(/gray-|red-|amber-|#[0-9a-f]{3,6}/i);
  });
});
