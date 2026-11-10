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

/**
 * Opening tags of text fields: `<input`, `<textarea`, `<select` and the wrappers `<Input`, `<Textarea`
 * (type checkbox/radio/file/hidden/range are not text fields). The review round found the first version of
 * this test blind to `<Input>` (shadcn wrapper) and `<select>`, which still stacked their own cues.
 */
function textFieldTags(src: string): string[] {
  const tags: string[] = [];
  const re = /<(input|textarea|select|Input|Textarea)\b[^>]*?(?:=>[^>]*?)*\/?>/g;
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

  it('no element stacks a focus-within ring or border on the global style (one cue per field)', () => {
    // A container drawn around a field uses the `field-composite` class instead (globals.css).
    // The lyrics editor box is the other allowed pattern: its textarea has no outline of its own, so the box's
    // outline in the focus token is the single cue. The admin table row is not a text field.
    const stacked = /focus-within:(ring|border)-?[\w/[\].#-]*|focus-within:outline-(?!focus\b|2\b)\S+/g;
    const allowed = ['components/admin/AdminUsersTable.tsx'];
    const offenders: string[] = [];
    for (const file of [...walk(path.join(ROOT, 'components')), ...walk(path.join(ROOT, 'app'))]) {
      const rel = path.relative(ROOT, file);
      if (allowed.includes(rel)) continue;
      const hits = readFileSync(file, 'utf8').match(stacked);
      if (hits) offenders.push(`${rel}: ${hits.join(' ')}`);
    }
    expect(offenders).toEqual([]);
  });

  it('a field drawn as a container around its input has one cue: the container, none on the input', () => {
    const css = readFileSync(path.join(ROOT, 'app/globals.css'), 'utf8');
    expect(css).toMatch(/\.field-composite:has\(input:focus-visible\)\s*\{[^}]*outline:\s*2px solid var\(--focus\)/);
    expect(css).toMatch(/\.field-composite input:focus-visible\s*\{[^}]*outline:\s*none/);
    for (const f of ['components/library/TagSelector.tsx', 'components/song/ArtistTagInput.tsx']) {
      const src = readFileSync(path.join(ROOT, f), 'utf8');
      expect(src, f).toMatch(/field-composite/);
    }
  });

  it('sees <Input> and <select> tags (the first version of this test did not)', () => {
    expect(textFieldTags('<Input id="x" className="focus:outline-none focus:border-red-500" />')).toHaveLength(1);
    expect(textFieldTags('<select {...register("k")} className="focus:ring-1" >')).toHaveLength(1);
    expect(textFieldTags('<input type="checkbox" className="focus:ring-1" />')).toHaveLength(0);
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
