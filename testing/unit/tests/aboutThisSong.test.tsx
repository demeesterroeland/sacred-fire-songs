// @vitest-environment jsdom
// Story 6.2.8 / G1.3 (#511): "About this song" shows the selected version's note, collapsed by default under the
// meta line. Gherkin: docs/testing/ux-v3-about-this-song.feature (@unit). Disclosure semantics are checked here (L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AboutThisSong } from '@/components/song/AboutThisSong';
import { songNoteParagraphs } from '@/lib/songs/songNote';
import { DICTIONARIES } from '@/lib/i18n';

vi.mock('@/context/LocaleContext', () => ({
  useLocale: () => ({
    t: (k: string) => (DICTIONARIES.en as Record<string, string>)[k] ?? k,
  }),
}));

afterEach(cleanup);

describe('songNoteParagraphs', () => {
  it('is empty for a missing, empty or whitespace-only note', () => {
    expect(songNoteParagraphs(null)).toEqual([]);
    expect(songNoteParagraphs(undefined)).toEqual([]);
    expect(songNoteParagraphs('')).toEqual([]);
    expect(songNoteParagraphs(' \n\t \r\n ')).toEqual([]);
  });

  it('splits on blank lines and keeps single line breaks inside a paragraph', () => {
    expect(songNoteParagraphs('First.\nStill first.\n\n  Second.  \r\n\r\nThird.')).toEqual([
      'First.\nStill first.',
      'Second.',
      'Third.',
    ]);
  });
});

describe('AboutThisSong', () => {
  it('renders nothing when the note is empty or only whitespace', () => {
    const { container: empty } = render(<AboutThisSong note={null} />);
    expect(empty.innerHTML).toBe('');
    cleanup();
    const { container: blank } = render(<AboutThisSong note={'  \n  '} />);
    expect(blank.innerHTML).toBe('');
  });

  it('is collapsed by default: a button with aria-expanded=false and its panel hidden', () => {
    render(<AboutThisSong note="Sung at the first gathering." />);
    const button = screen.getByRole('button', { name: 'About this song' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    expect(panel).not.toBeNull();
    expect(panel!.hidden).toBe(true);
  });

  it('opens to show the note, and collapses again', () => {
    render(<AboutThisSong note="Sung at the first gathering." />);
    const button = screen.getByRole('button', { name: 'About this song' });
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '')!;
    expect(panel.hidden).toBe(false);
    expect(panel.textContent).toContain('Sung at the first gathering.');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
  });

  it('keeps paragraph breaks as separate paragraphs', () => {
    render(<AboutThisSong note={'One verse.\n\nTwo verse.'} />);
    fireEvent.click(screen.getByRole('button', { name: 'About this song' }));
    const paragraphs = [...document.querySelectorAll('p')].map((p) => p.textContent);
    expect(paragraphs).toEqual(['One verse.', 'Two verse.']);
  });

  it('treats Unicode line and paragraph separators as line breaks', () => {
    expect(songNoteParagraphs('One.\u2029\u2029Two.')).toEqual(['One.', 'Two.']);
  });

  it('renders the note as plain text, never as HTML', () => {
    const { container } = render(<AboutThisSong note={'<img src=x onerror="alert(1)"> <b>bold</b>'} />);
    fireEvent.click(screen.getByRole('button', { name: 'About this song' }));
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(container.textContent).toContain('<b>bold</b>');
  });

  it('the disclosure button uses the min-h-tap token class (44 px touch target)', () => {
    render(<AboutThisSong note="Note." />);
    expect(screen.getByRole('button', { name: 'About this song' }).className).toMatch(/min-h-tap/);
  });

  it('starts collapsed again when the version changes (keyed by version id)', () => {
    const { rerender } = render(<AboutThisSong key="v1" note="Note of version 1." />);
    fireEvent.click(screen.getByRole('button', { name: 'About this song' }));
    expect(screen.getByRole('button', { name: 'About this song' }).getAttribute('aria-expanded')).toBe('true');
    rerender(<AboutThisSong key="v2" note="Note of version 2." />);
    const button = screen.getByRole('button', { name: 'About this song' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById(button.getAttribute('aria-controls') ?? '')!.hidden).toBe(true);
  });
});
