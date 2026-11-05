/**
 * Palette-class audit (Story 6.1.1 / G1.1, #385, ADR 0007). Components must use
 * semantic token utilities; this counts the remaining Tailwind palette classes
 * and arbitrary hex colours so restyle stories can only lower the number.
 */
import fs from 'node:fs';
import path from 'node:path';

const PALETTES = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black';
const PROPS = 'bg|text|border|border-[trblxy]|ring|ring-offset|from|to|via|fill|stroke|divide|outline|shadow|decoration|placeholder|caret|accent';
export const PALETTE_CLASS_RE = new RegExp(
  `(?<![\\w-])(?:[a-z0-9-]+:)*(?:${PROPS})-(?:${PALETTES})(?:-\\d{2,3})?(?:\\/\\d{1,3})?(?![\\w-])|\\[#[0-9a-fA-F]{3,8}\\]`,
  'g',
);

export function countPaletteClasses(source: string): number {
  return source.match(PALETTE_CLASS_RE)?.length ?? 0;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Palette-class counts per file under app/ and components/ (repo-relative paths). */
export function paletteUsage(root = path.resolve(__dirname, '..', '..')): Record<string, number> {
  const result: Record<string, number> = {};
  for (const dir of ['app', 'components']) {
    for (const file of walk(path.join(root, dir))) {
      const n = countPaletteClasses(fs.readFileSync(file, 'utf8'));
      if (n > 0) result[path.relative(root, file)] = n;
    }
  }
  return result;
}
