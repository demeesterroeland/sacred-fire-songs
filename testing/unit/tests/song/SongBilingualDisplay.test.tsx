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

  // Physical sides (left/right) flip the wrong way in a right-to-left column; only logical ones (start/end) may be used.
  const PHYSICAL = /(^|\s|:)-?(pl|pr|ml|mr|left|right|border-l|border-r|rounded-l|rounded-r)-/;

  it('marks each column with its language and a direction read from its lyrics (RTL-safe), logical spacing only', () => {
    renderBoth({ translation: 'אמא [G]אדמה\nחיים\n\n{soc}\nאבא שמש\n{eoc}', translationLanguage: 'he' });
    const translation = screen.getAllByTestId('stanza-translation')[0];
    expect(translation.getAttribute('lang')).toBe('he');
    expect(translation.getAttribute('dir')).toBe('rtl');
    // The original starts with a chord letter (G), but its lyrics are left to right.
    expect(screen.getAllByTestId('stanza-original')[0].getAttribute('dir')).toBe('ltr');
    const root = screen.getByTestId('song-bilingual');
    // Every element of every stanza (label, chorus rule, line indent, words, comments) uses logical sides.
    const sections = screen.getAllByTestId('song-section');
    expect(sections.length).toBeGreaterThan(0);
    for (const el of [root, ...root.querySelectorAll('*')]) {
      expect(el.getAttribute('class') ?? '', el.outerHTML.slice(0, 120)).not.toMatch(PHYSICAL);
    }
    expect(root.outerHTML).not.toMatch(/gray-|red-|amber-|#[0-9a-f]{3,6}/i);
  });

  it('pulls the first word of a line into the indent on the start side, so in RTL the second word does not overlap it', () => {
    renderBoth({ translation: 'אמא אדמה יפה', translationLanguage: 'he' });
    const words = within(screen.getByTestId('stanza-translation')).getAllByTestId('lyric').map((l) => l.parentElement!);
    expect(words[0].className).toContain('-ms-4');
    for (const w of words.slice(1)) expect(w.className).not.toMatch(/-m[se]-/);
  });

  it('a Hebrew original with chords flows right to left', () => {
    renderBoth({ original: '[Am]אמא [G]אדמה', translation: 'Mother earth' });
    expect(screen.getByTestId('stanza-original').getAttribute('dir')).toBe('rtl');
    expect(screen.getByTestId('stanza-translation').getAttribute('dir')).toBe('ltr');
  });

  it('a chorus translation on a phone has one rule (its own), not the wrapper rule as well', () => {
    renderBoth({ original: 'One\n\nTwo', translation: 'Uno\n\n{soc}\nDos\n{eoc}' });
    const [verse, chorus] = screen.getAllByTestId('stanza-translation');
    expect(verse.className).toContain('border-s-2');
    expect(chorus.className).not.toContain('border-s-2');
    expect(within(chorus).getByTestId('song-section').className).toContain('border-s-2');
  });

  it('spaces the rows like the normal reader spaces its stanzas', () => {
    renderBoth();
    const pairs = screen.getAllByTestId('stanza-pair');
    expect(pairs[0].className).not.toMatch(/\bmt-/);
    for (const pair of pairs.slice(1)) expect(pair.className).toContain('mt-8');
    cleanup();
    renderBoth({ showChords: false });
    for (const pair of screen.getAllByTestId('stanza-pair').slice(1)) expect(pair.className).toContain('mt-6');
  });

  it('shows the melody of the original once, below both languages', () => {
    renderBoth({ melodyNotation: 'X:1' });
    expect(screen.getAllByText('X:1')).toHaveLength(1);
  });
});
