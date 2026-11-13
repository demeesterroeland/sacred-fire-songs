/**
 * Design-token constants and helpers (Epic 6.1, Story 6.1.1 / G1.1, #385).
 *
 * The token values live in app/styles/<style>.css and are documented in
 * docs/design/design-tokens.md. This module holds the few values JavaScript
 * needs (browser theme colour, lyric size steps) plus pure helpers used by the
 * token tests (CSS parsing, WCAG contrast).
 */

/** Styles that exist as token files (ADR 0007 / UXD-7). Only "sober" ships now. */
export const STYLES = ['sober'] as const;
export type StyleName = (typeof STYLES)[number];
export const ACTIVE_STYLE: StyleName = 'sober';

/** `<meta name="theme-color">` per mode: equals `--bg` of the active style. */
export const THEME_COLOR = { light: '#fbfaf9', dark: '#0f0e0d' } as const;

/** Reader-controlled lyric sizes in px (A− / A+, Story 6.1.5 / G2.1). */
export const LYRIC_STEPS = [15, 17, 19, 21, 24, 28] as const;
export const DEFAULT_LYRIC_STEP = 1; // 17 px

/** Smallest allowed font size anywhere in the UI. */
export const MIN_FONT_PX = 12;
/** WCAG 2.2 AA minimum for normal text. */
export const MIN_TEXT_CONTRAST = 4.5;
/** Minimum touch target in px. */
export const MIN_TAP_PX = 44;

export type TokenMap = Record<string, string>;

/** Extract the custom properties of the first CSS rule whose selector equals `selector`. */
export function parseCssBlock(css: string, selector: string): TokenMap {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean))) {
    if (m[1].trim() !== selector) continue;
    const out: TokenMap = {};
    for (const decl of m[2].split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const name = decl.slice(0, i).trim();
      if (name.startsWith('--')) out[name] = decl.slice(i + 1).trim();
    }
    return out;
  }
  return {};
}

/** Resolve `var(--x)` references (one or more levels) against a token map. */
export function resolveToken(tokens: TokenMap, name: string, depth = 0): string | undefined {
  const v = tokens[name];
  if (v === undefined || depth > 8) return v;
  const ref = /^var\((--[a-z0-9-]+)\)$/i.exec(v);
  return ref ? resolveToken(tokens, ref[1], depth + 1) : v;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours. */
export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function isHexColour(v: string | undefined): v is string {
  return !!v && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}
