// @vitest-environment jsdom
// Story 6.1.31 / G8.2 (#415): live chord preview on Add Song (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import ChordPreview from '@/components/song/ChordPreview';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DICTIONARIES, SUPPORTED_LOCALES } from '@/lib/i18n';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

const dict = DICTIONARIES.en as Record<string, string>;
vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({ t: (k: string) => dict[k] ?? k }),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ChordPreview', () => {
  it('renders a chord above its lyric with the song page renderer', () => {
    render(<ChordPreview content="[Dm]Abre tus alas" />);
    const chord = screen.getByTestId('chord');
    expect(chord.textContent).toBe('Dm');
    const lyric = screen.getAllByTestId('lyric')[0];
    expect(lyric.textContent).toBe('Abre ');
    // Same flex column as the song page: chord first, lyric below it.
    expect(chord.nextElementSibling).toBe(lyric);
    expect(screen.getByTestId('song-display').getAttribute('data-chords')).toBe('on');
  });

  it('shows lyrics without chord rows when the text has no chords', () => {
    render(<ChordPreview content={'Abre tus alas\npajaro volar'} />);
    expect(screen.queryByTestId('chord')).toBeNull();
    expect(screen.getByTestId('song-display').getAttribute('data-chords')).toBe('off');
  });

  it('says what the preview is for when nothing is typed yet', () => {
    render(<ChordPreview content="  " />);
    expect(screen.getByText('Nothing to preview yet. Type or paste your lyrics and chords.')).toBeTruthy();
    expect(screen.queryByTestId('song-display')).toBeNull();
  });

  it('uses design tokens only', () => {
    const { container } = render(<ChordPreview content="[Dm]Abre tus alas" />);
    expect(countPaletteClasses(container.innerHTML)).toBe(0);
  });

  it('has its texts in every language', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const d = DICTIONARIES[locale] as Record<string, string>;
      for (const k of [
        'songForm.preview.toggle',
        'songForm.preview.empty',
        'songForm.preview.label',
        'songForm.upload.toggle',
        'songForm.upload.error',
        'songForm.upload.tooLarge',
      ]) {
        expect(d[k], `${locale} ${k}`).toBeTruthy();
      }
    }
  });
});

describe('useDebouncedValue', () => {
  it('follows the value only after the delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), { initialProps: { v: 'a' } });
    expect(result.current[0]).toBe('a');
    rerender({ v: 'ab' });
    rerender({ v: 'abc' });
    expect(result.current[0]).toBe('a');
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current[0]).toBe('a');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBe('abc');
  });

  it('flush() jumps to the latest value without waiting', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), { initialProps: { v: 'a' } });
    rerender({ v: 'abc' });
    expect(result.current[0]).toBe('a');
    act(() => result.current[1]());
    expect(result.current[0]).toBe('abc');
  });
});
