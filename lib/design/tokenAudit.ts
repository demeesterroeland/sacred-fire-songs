/**
 * Token audit helpers shared by the Vitest and Cucumber suites (Story 6.1.1 / G1.1, #385).
 * Node-only (reads files). Compares app/styles/<style>.css, the @theme map in
 * app/globals.css and docs/design/design-tokens.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  ACTIVE_STYLE,
  MIN_FONT_PX,
  MIN_TEXT_CONTRAST,
  THEME_COLOR,
  contrastRatio,
  isHexColour,
  parseCssBlock,
  resolveToken,
  type TokenMap,
} from './tokens';

const ROOT = path.resolve(__dirname, '..', '..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

export interface TokenSources {
  light: TokenMap;
  dark: TokenMap; // light merged with dark overrides
  darkOverrides: TokenMap;
  theme: TokenMap; // @theme inline entries
  docLight: TokenMap;
  docDark: TokenMap; // '—' resolved to the light value
}

export function loadTokenSources(style = ACTIVE_STYLE): TokenSources {
  const css = read(`app/styles/${style}.css`);
  const light = parseCssBlock(css, `:root[data-style="${style}"]`);
  const darkOverrides = parseCssBlock(css, `:root[data-style="${style}"].dark`);
  const globals = read('app/globals.css');
  const themeBody = /@theme inline\s*\{([\s\S]*?)\n\}/.exec(globals.replace(/\/\*[\s\S]*?\*\//g, ''))?.[1] ?? '';
  const theme = parseCssBlock(`x{${themeBody}}`, 'x');
  const docLight: TokenMap = {};
  const docDark: TokenMap = {};
  for (const line of read('docs/design/design-tokens.md').split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    const name = /^`(--[a-z0-9-]+)`$/.exec(cells[1] ?? '')?.[1];
    if (!name) continue;
    const unq = (c: string) => c.replace(/^`|`$/g, '');
    docLight[name] = unq(cells[2]);
    // colour table: | token | light | dark | use |; size table: | token | value | tailwind | use |
    const third = unq(cells[3] ?? '');
    if (third === '—' || third.startsWith('#') || third.startsWith('rgba') || third.startsWith('0 ')) {
      docDark[name] = third === '—' ? docLight[name] : third;
    }
  }
  return { light, dark: { ...light, ...darkOverrides }, darkOverrides, theme, docLight, docDark };
}

/** Tokens referenced by the Tailwind theme that the style file does not define. */
export function missingThemeReferences(s: TokenSources): string[] {
  const missing: string[] = [];
  for (const value of Object.values(s.theme)) {
    for (const m of value.matchAll(/var\((--[a-z0-9-]+)/g)) {
      const ref = m[1];
      if (ref.startsWith('--font-geist')) continue; // next/font variables
      if (!(ref in s.light)) missing.push(ref);
    }
  }
  return [...new Set(missing)];
}

/** Tokens whose value in the doc differs from the CSS (both directions). */
export function docMismatches(s: TokenSources): string[] {
  const out: string[] = [];
  for (const [name, value] of Object.entries(s.light)) {
    if (s.docLight[name] !== value) out.push(`${name} light: css=${value} doc=${s.docLight[name]}`);
  }
  for (const name of Object.keys(s.docLight)) if (!(name in s.light)) out.push(`${name}: in doc, not in css`);
  for (const [name, value] of Object.entries(s.darkOverrides)) {
    if (name === 'color-scheme') continue;
    if (s.docDark[name] !== value) out.push(`${name} dark: css=${value} doc=${s.docDark[name]}`);
  }
  return out;
}

/** Raw (non-var) hue colours: hex values with HSL saturation >= 35 %. */
export function accentLikeTokens(tokens: TokenMap): string[] {
  return Object.entries(tokens)
    .filter(([, v]) => isHexColour(v) && saturation(v) >= 0.35)
    .map(([k]) => k);
}

function saturation(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return 0;
  return (max - min) / (1 - Math.abs(2 * l - 1));
}

export function fontSizesPx(tokens: TokenMap): Record<string, number> {
  return Object.fromEntries(
    Object.entries(tokens)
      .filter(([k]) => k.startsWith('--fs-'))
      .map(([k, v]) => [k, parseFloat(v)]),
  );
}

export interface ContrastCheck {
  mode: 'light' | 'dark';
  fg: string;
  bg: string;
  ratio: number;
  min: number;
}

/** Text/background pairs the component sheet relies on. */
export const CONTRAST_PAIRS: Array<[fg: string, bg: string, min: number]> = [
  ...['--text', '--text-muted', '--text-subtle', '--accent', '--danger'].flatMap((fg) =>
    ['--bg', '--surface'].map((bg) => [fg, bg, MIN_TEXT_CONTRAST] as [string, string, number]),
  ),
  ...['--text', '--text-muted', '--text-subtle'].map((fg) => [fg, '--surface-2', MIN_TEXT_CONTRAST] as [string, string, number]),
  ['--accent-ink', '--accent', MIN_TEXT_CONTRAST],
  ['--danger-ink', '--danger', MIN_TEXT_CONTRAST],
  ['--chip-text', '--chip-bg', MIN_TEXT_CONTRAST],
  ['--chip-text-active', '--chip-bg-active', MIN_TEXT_CONTRAST],
  ['--line-strong', '--bg', 3],
];

export function contrastChecks(s: TokenSources): ContrastCheck[] {
  const out: ContrastCheck[] = [];
  for (const [mode, map] of [['light', s.light], ['dark', s.dark]] as const) {
    for (const [fg, bg, min] of CONTRAST_PAIRS) {
      const a = resolveToken(map, fg);
      const b = resolveToken(map, bg);
      if (!isHexColour(a) || !isHexColour(b)) throw new Error(`${mode}: ${fg} / ${bg} must resolve to hex (got ${a}, ${b})`);
      out.push({ mode, fg, bg, ratio: contrastRatio(a, b), min });
    }
  }
  return out;
}

export { MIN_FONT_PX, THEME_COLOR };
