/**
 * Micro-label audit (Story 6.1.3 / G1.3, #387). No rendered text may be smaller
 * than 12 px: this finds Tailwind arbitrary font sizes below the minimum
 * (`text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[0.7rem]` …) under app/
 * and components/. Use `text-caption` (12 px) or `text-meta` (13 px) instead.
 */
import fs from 'node:fs';
import path from 'node:path';

/** Arbitrary Tailwind font size, e.g. `text-[10px]` or `md:text-[0.65rem]`. */
export const ARBITRARY_TEXT_SIZE_RE = /(?<![\w-])(?:[a-z0-9-]+:)*text-\[(\d+(?:\.\d+)?)(px|rem|em)\]/g;

export const MIN_TEXT_PX = 12;

/**
 * Files exempt from the guard. RehearsalDrawer.tsx is being reworked by the
 * Practice stories (#399, #400), which apply the same rule there; remove this
 * entry once they have merged.
 */
export const MICRO_TEXT_ALLOW_LIST: readonly string[] = ['components/song/RehearsalDrawer.tsx'];

export function textSizePx(value: number, unit: string): number {
  return unit === 'px' ? value : value * 16;
}

export interface MicroTextHit {
  file: string;
  line: number;
  match: string;
}

export function microTextHitsIn(source: string): Omit<MicroTextHit, 'file'>[] {
  const hits: Omit<MicroTextHit, 'file'>[] = [];
  source.split('\n').forEach((text, i) => {
    for (const m of text.matchAll(ARBITRARY_TEXT_SIZE_RE)) {
      if (textSizePx(parseFloat(m[1]), m[2]) < MIN_TEXT_PX) hits.push({ line: i + 1, match: m[0] });
    }
  });
  return hits;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Sub-12 px arbitrary font sizes under app/ and components/ (repo-relative paths). */
export function microTextHits(
  root = path.resolve(__dirname, '..', '..'),
  allowList: readonly string[] = MICRO_TEXT_ALLOW_LIST,
): MicroTextHit[] {
  const result: MicroTextHit[] = [];
  for (const dir of ['app', 'components']) {
    for (const full of walk(path.join(root, dir))) {
      const file = path.relative(root, full);
      if (allowList.includes(file)) continue;
      for (const h of microTextHitsIn(fs.readFileSync(full, 'utf8'))) result.push({ file, ...h });
    }
  }
  return result;
}
