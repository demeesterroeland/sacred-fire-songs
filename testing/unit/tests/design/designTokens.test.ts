// Story 6.1.1 / G1.1 (#385): the design tokens are the single source of colour and type.
import { describe, expect, it } from 'vitest';
import {
  THEME_COLOR,
  MIN_FONT_PX,
  accentLikeTokens,
  contrastChecks,
  docMismatches,
  fontSizesPx,
  loadTokenSources,
  missingThemeReferences,
} from '@/lib/design/tokenAudit';
import { LYRIC_STEPS, contrastRatio, parseCssBlock, resolveToken } from '@/lib/design/tokens';
import { joinMeta } from '@/components/ui/meta-line';

const s = loadTokenSources();

describe('design tokens (sober style)', () => {
  it('defines light tokens and dark overrides', () => {
    expect(Object.keys(s.light).length).toBeGreaterThan(30);
    expect(s.darkOverrides['--bg']).toBeDefined();
  });

  it('every token used by the Tailwind theme exists in the style file', () => {
    expect(missingThemeReferences(s)).toEqual([]);
  });

  it('docs/design/design-tokens.md and the CSS agree on names and values', () => {
    expect(docMismatches(s)).toEqual([]);
  });

  it('defines exactly one accent colour per mode', () => {
    const hues = (m: Record<string, string>) => accentLikeTokens(m).filter((k) => k !== '--danger');
    expect(hues(s.light)).toEqual(['--accent']);
    expect(hues(s.dark)).toEqual(['--accent']);
  });

  it('uses only semantic colour utilities in the theme (no palette names)', () => {
    const names = Object.keys(s.theme).filter((k) => k.startsWith('--color-'));
    expect(names.filter((n) => /-(red|gray|amber|orange|blue|indigo)-?\d*$/.test(n))).toEqual([]);
  });

  it('has no font size below 12 px', () => {
    const sizes = fontSizesPx(s.light);
    expect(Object.keys(sizes).length).toBeGreaterThanOrEqual(5);
    for (const [name, px] of Object.entries(sizes)) expect(px, name).toBeGreaterThanOrEqual(MIN_FONT_PX);
    expect(Math.min(...LYRIC_STEPS)).toBeGreaterThanOrEqual(MIN_FONT_PX);
  });

  it('meets the contrast minimums in light and dark', () => {
    const failing = contrastChecks(s).filter((c) => c.ratio < c.min);
    expect(failing.map((c) => `${c.mode} ${c.fg} on ${c.bg}: ${c.ratio.toFixed(2)}`)).toEqual([]);
  });

  it('keeps the touch target at 44 px', () => {
    expect(s.light['--tap']).toBe('44px');
  });

  it('browser theme colour equals --bg', () => {
    expect(THEME_COLOR.light).toBe(s.light['--bg']);
    expect(THEME_COLOR.dark).toBe(s.dark['--bg']);
  });
});

describe('token helpers', () => {
  it('computes WCAG contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('parses a CSS block and resolves var() chains', () => {
    const map = parseCssBlock(':root.a { --x: #fff; --y: var(--x); } .b { --x: #000; }', ':root.a');
    expect(resolveToken(map, '--y')).toBe('#fff');
  });

  it('joins meta items with a middle dot and drops empties', () => {
    expect(joinMeta(['Herbert Quinteros', '', null, 'Fire', undefined, false, ' Spanish '])).toBe('Herbert Quinteros · Fire · Spanish');
  });
});
