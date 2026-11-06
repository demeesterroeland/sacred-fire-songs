// Validation 1 (fix 3): text fields have ONE focus style. The global `:focus-visible` outline in
// app/globals.css is unlayered, so it beats every Tailwind utility (`outline-none` never worked).
// Components must not stack their own ring / border change / outline on top of it.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../../../..');
const FOCUS_CLASS = /focus(-visible)?:(outline|ring|border)-?[\w/[\].#-]*|\boutline-none\b|focus:outline-\S+/g;

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.tsx')) out.push(full);
  }
  return out;
}

/** Opening tags of `<input` and `<textarea` elements (type checkbox/radio/file/hidden/range are not text fields). */
function textFieldTags(src: string): string[] {
  const tags: string[] = [];
  const re = /<(input|textarea)\b[\s\S]*?\/>|<textarea\b[\s\S]*?>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const tag = m[0];
    if (/type=["'](checkbox|radio|file|hidden|range|submit|button)["']/.test(tag)) continue;
    tags.push(tag);
  }
  return tags;
}

describe('text field focus style', () => {
  it('globals.css defines the single text-field focus rule and the underline variant', () => {
    const css = readFileSync(path.join(ROOT, 'app/globals.css'), 'utf8');
    expect(css).toMatch(/input:focus-visible/);
    expect(css).toMatch(/\.field-underline:focus-visible/);
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--focus\)/);
  });

  it('no text input or textarea stacks its own outline, ring or focus border on the global style', () => {
    const offenders: string[] = [];
    for (const file of [...walk(path.join(ROOT, 'components')), ...walk(path.join(ROOT, 'app'))]) {
      const src = readFileSync(file, 'utf8');
      for (const tag of textFieldTags(src)) {
        const cls = tag.match(FOCUS_CLASS);
        if (cls) offenders.push(`${path.relative(ROOT, file)}: ${cls.join(' ')}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('CreatePlaylistInput, and the inline edit fields of the playlist header and cards, use tokens, not amber or gray', () => {
    const palette = /\b(?:bg|text|border|placeholder)-(?:amber|gray|slate)-\d/;
    expect(readFileSync(path.join(ROOT, 'components/playlists/CreatePlaylistInput.tsx'), 'utf8')).not.toMatch(palette);
    for (const f of ['PlaylistDetailHeader', 'CreatePlaylistForm', 'PlaylistCard', 'PublicPlaylistCard']) {
      const src = readFileSync(path.join(ROOT, `components/playlists/${f}.tsx`), 'utf8');
      for (const tag of textFieldTags(src)) expect(tag, f).not.toMatch(palette);
    }
  });
});
