// @vitest-environment jsdom
// Story 6.1.11 / G2.6 (#395): the segmented control is a radio group with roving tabindex (RTL, L3).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Segmented } from '@/components/ui/segmented';

afterEach(cleanup);

const options = [
  { value: 'a', label: 'Original' },
  { value: 'b', label: 'Simplified' },
  { value: 'c', label: 'Live' },
];

function setup(value = 'a', onChange = vi.fn()) {
  render(<Segmented aria-label="Song version" options={options} value={value} onChange={onChange} />);
  return { onChange, radios: screen.getAllByRole('radio') };
}

describe('Segmented', () => {
  it('is a labelled radio group; the current segment is checked', () => {
    const { radios } = setup('b');
    expect(screen.getByRole('radiogroup', { name: 'Song version' })).toBeTruthy();
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(radios.some((r) => r.hasAttribute('aria-pressed'))).toBe(false);
  });

  it('has one tab stop: only the checked segment is tabbable', () => {
    const { radios } = setup('b');
    expect(radios.map((r) => r.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('raises the pressed segment with a hairline ring and an underline on its label', () => {
    const { radios } = setup('a');
    expect(radios[0].className).toContain('ring-1');
    expect(radios[0].className).toContain('ring-line');
    expect(radios[1].className).not.toContain('ring-1');
    expect(radios[0].querySelector('span')!.className).toContain('underline');
  });

  it('has no redundant title tooltip', () => {
    const { radios } = setup();
    expect(radios.some((r) => r.hasAttribute('title'))).toBe(false);
  });

  it('ArrowRight / ArrowLeft move the selection and the focus, wrapping around', () => {
    const { onChange, radios } = setup('a');
    fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('b');
    fireEvent.keyDown(radios[0], { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('c');
    expect(document.activeElement).toBe(radios[2]);
  });

  it('Home and End jump to the first and last segment', () => {
    const { onChange, radios } = setup('b');
    fireEvent.keyDown(radios[1], { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('c');
    fireEvent.keyDown(radios[1], { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('a');
  });

  it('ignores other keys and a click on the checked segment', () => {
    const { onChange, radios } = setup('a');
    fireEvent.keyDown(radios[0], { key: 'Enter' });
    fireEvent.keyDown(radios[0], { key: 'a' });
    fireEvent.click(radios[0]);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(radios[2]);
    expect(onChange).toHaveBeenCalledWith('c');
  });
});

// Story 6.2.6 (#509): with four versions the checked segment can lie outside the visible part of the strip on a
// phone (`?version=<4th>`); the strip scrolls itself, never the page (no scrollIntoView).
describe('Segmented keeps the checked segment in view', () => {
  const four = ['a', 'b', 'c', 'd'].map((v) => ({ value: v, label: `Songbook ${v.toUpperCase()}` }));
  const WIDTH = 120; // a segment
  const VISIBLE = 300; // the strip on a 375 px phone, minus the page gutters

  function layout() {
    return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const strip = this.closest('[role="radiogroup"]') as HTMLElement | null;
      if (this.getAttribute('role') === 'radiogroup') {
        return { left: 0, right: VISIBLE, width: VISIBLE, top: 0, bottom: 44, height: 44, x: 0, y: 0, toJSON() {} } as DOMRect;
      }
      const index = Number(this.getAttribute('data-i'));
      const left = index * WIDTH - (strip?.scrollLeft ?? 0);
      return { left, right: left + WIDTH, width: WIDTH, top: 0, bottom: 44, height: 44, x: left, y: 0, toJSON() {} } as DOMRect;
    });
  }

  afterEach(() => vi.restoreAllMocks());

  const mark = () => screen.getAllByRole('radio').forEach((r, i) => r.setAttribute('data-i', String(i)));
  const visible = (strip: HTMLElement, radio: HTMLElement) => {
    const s = strip.getBoundingClientRect();
    const r = radio.getBoundingClientRect();
    return r.left >= s.left && r.right <= s.right;
  };

  it('scrolls the strip so a checked segment that starts outside it is visible', () => {
    layout();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    // data-i is set after the first paint in this test, so render once with the first segment, then check the fourth.
    const { rerender } = render(<Segmented aria-label="Song version" options={four} value="a" onChange={() => {}} />);
    mark();
    const strip = screen.getByRole('radiogroup');
    expect(strip.scrollLeft).toBe(0);
    rerender(<Segmented aria-label="Song version" options={four} value="d" onChange={() => {}} />);
    const fourth = screen.getAllByRole('radio')[3];
    expect(strip.scrollLeft).toBeGreaterThan(0);
    expect(visible(strip, fourth)).toBe(true);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls back when the checked segment is before the visible part', () => {
    layout();
    const { rerender } = render(<Segmented aria-label="Song version" options={four} value="d" onChange={() => {}} />);
    mark();
    const strip = screen.getByRole('radiogroup');
    strip.scrollLeft = 200;
    rerender(<Segmented aria-label="Song version" options={four} value="a" onChange={() => {}} />);
    expect(strip.scrollLeft).toBeLessThanOrEqual(0);
    expect(visible(strip, screen.getAllByRole('radio')[0])).toBe(true);
  });

  it('leaves the strip alone when the checked segment is already visible', () => {
    layout();
    const { rerender } = render(<Segmented aria-label="Song version" options={four} value="a" onChange={() => {}} />);
    mark();
    const strip = screen.getByRole('radiogroup');
    rerender(<Segmented aria-label="Song version" options={four} value="b" onChange={() => {}} />);
    expect(strip.scrollLeft).toBe(0);
  });
});
