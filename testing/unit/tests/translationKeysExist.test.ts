// Every literal t('key') used in the app must exist in messages/en.ts (the source of truth).
// Catches dead-key regressions when a story renames or removes message keys.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DICTIONARIES } from '@/lib/i18n';

const root = process.cwd();
const DIRS = ['app', 'components', 'lib', 'hooks', 'context'];
const en = DICTIONARIES.en as Record<string, string>;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

// t('a.b') and t("a.b") with a dotted literal key.
const CALL = /(?<![\w$])t\(\s*(['"])([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+)\1/g;

describe('translation keys used in code exist in messages/en.ts', () => {
  const used = new Map<string, string[]>();
  for (const dir of DIRS) {
    let files: string[] = [];
    try {
      files = walk(join(root, dir));
    } catch {
      continue;
    }
    for (const file of files) {
      const src = stripComments(readFileSync(file, 'utf8'));
      for (const m of src.matchAll(CALL)) {
        const list = used.get(m[2]) ?? [];
        list.push(relative(root, file));
        used.set(m[2], list);
      }
    }
  }

  it('finds the literal keys (sanity check on the scanner)', () => {
    expect(used.size).toBeGreaterThan(100);
    expect(used.has('practice.title')).toBe(true);
  });

  it('defines every literal key', () => {
    const missing = [...used.entries()]
      .filter(([key]) => !(key in en))
      .map(([key, files]) => `${key}  (${[...new Set(files)].join(', ')})`);
    expect(missing, `Missing in messages/en.ts:\n${missing.join('\n')}`).toEqual([]);
  });
});
