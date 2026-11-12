// @vitest-environment jsdom
// Story 6.2.14 (#517): the "Translation · Both" switch and the two-language layout (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import SongBilingualDisplay from '@/components/song/SongBilingualDisplay';
import { SongReadingViewSwitch } from '@/components/song/SongReadingViewSwitch';
import { DICTIONARIES } from '@/lib/i18n';
import { lyricPx } from '@/lib/reader/readerPrefs';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    t: (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k,
  }),
}));

afterEach(cleanup);

const ORIGINAL = '[G]Pachamama [C]sumaq\n[D]kawsay\n\n[G]Second [D]stanza';
const TRANSLATION = '[G]Mother [C]earth\nlife\n\nSecond verse\n\nA third one';

describe('SongReadingViewSwitch', () => {
  it('renders nothing when no translation is being read', () => {
    const { container } = render(<SongReadingViewSwitch visible={false} value="translation" onChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('is a labelled radio group: Translation · Both, the current one checked', () => {
    render(<SongReadingViewSwitch visible value="both" onChange={() => {}} />);
    const group = screen.getByRole('radiogroup', { name: 'Show' });
    expect(within(group).getAllByRole('radio').map((r) => r.textContent)).toEqual(['Translation', 'Both']);
    expect(screen.getByRole('radio', { name: 'Both' }).getAttribute('aria-checked')).toBe('true');
  });

  it('reports the picked view and keeps 44 px targets and tokens only', () => {
    const onChange = vi.fn();
    render(<SongReadingViewSwitch visible value="translation" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Both' }));
    expect(onChange).toHaveBeenLastCalledWith('both');
    expect(screen.getByRole('radio', { name: 'Both' }).className).toContain('min-h-tap');
    expect(screen.getByRole('radiogroup').outerHTML).not.toMatch(/gray-|red-|amber-|#[0-9a-f]{3,6}/i);
  });
});

describe('SongBilingualDisplay', () => {
  const renderBoth = (props: Partial<React.ComponentProps<typeof SongBilingualDisplay>> = {}) =>
    render(
      <SongBilingualDisplay
        original={ORIGINAL}
        translation={TRANSLATION}
        translationLanguage="en"
        hasChords
        showChords
        sizeStep={2}
        {...props}
      />
    );

  it('puts each stanza right before its translation (phone: line under line) and drops no extra stanza', () => {
    renderBoth();
    const pairs = screen.getAllByTestId('stanza-pair');
    expect(pairs).toHaveLength(3);
    // DOM order inside a pair is original, then translation: on a phone they stack in that order.
    expect(within(pairs[0]).getAllByTestId(/^stanza-(original|translation)$/).map((el) => el.dataset.testid)).toEqual([
      'stanza-original',
      'stanza-translation',
    ]);
    expect(within(pairs[2]).queryByTestId('stanza-original')).toBeNull();
    expect(within(pairs[2]).getByTestId('stanza-translation').textContent?.replace(/ /g, ' ')).toContain('A third one');
  });

  it('is one column on a phone and two aligned columns from md up; a lone translation keeps the second column', () => {
    renderBoth();
    const pairs = screen.getAllByTestId('stanza-pair');
    for (const pair of pairs) expect(pair.className).toMatch(/\bgrid\b/);
    for (const pair of pairs) expect(pair.className).toContain('md:grid-cols-2');
    expect(within(pairs[2]).getByTestId('stanza-translation').className).toContain('md:col-start-2');
  });

  it('shows chords on the original only; the translation is lyrics only', () => {
    renderBoth();
    const [first] = screen.getAllByTestId('stanza-pair');
    expect(within(within(first).getByTestId('stanza-original')).getAllByTestId('chord').map((c) => c.textContent)).toEqual(['G', 'C', 'D']);
    expect(within(within(first).getByTestId('stanza-translation')).queryAllByTestId('chord')).toHaveLength(0);
  });

  it('hides the chords of the original with the Chords switch off', () => {
    renderBoth({ showChords: false });
    expect(screen.queryAllByTestId('chord')).toHaveLength(0);
  });

  it('scales both columns with A− / A+', () => {
    const { rerender } = renderBoth({ sizeStep: 0 });
    const sizes = () => new Set(screen.getAllByTestId('lyric').map((l) => (l as HTMLElement).style.fontSize));
    expect(sizes()).toEqual(new Set([`${lyricPx(0)}px`]));
    rerender(
      <SongBilingualDisplay original={ORIGINAL} translation={TRANSLATION} translationLanguage="en" hasChords showChords sizeStep={4} />
    );
    expect(sizes()).toEqual(new Set([`${lyricPx(4)}px`]));
  });

  it('marks each column with its language and lets the text set its own direction (RTL-safe), logical spacing only', () => {
    renderBoth({ translationLanguage: 'he' });
    const translation = screen.getAllByTestId('stanza-translation')[0];
    expect(translation.getAttribute('lang')).toBe('he');
    expect(translation.getAttribute('dir')).toBe('auto');
    expect(screen.getAllByTestId('stanza-original')[0].getAttribute('dir')).toBe('auto');
    const html = screen.getByTestId('song-bilingual').outerHTML;
    // The wrapper's own classes use logical sides (ps-/border-s), never left/right.
    for (const el of [translation, ...screen.getAllByTestId('stanza-pair')]) expect(el.className).not.toMatch(/\b(pl|pr|ml|mr|border-l|border-r)-/);
    expect(html).not.toMatch(/gray-|red-|amber-|#[0-9a-f]{3,6}/i);
  });

  it('shows the melody of the original once, below both languages', () => {
    renderBoth({ melodyNotation: 'X:1' });
    expect(screen.getAllByText('X:1')).toHaveLength(1);
  });
});
