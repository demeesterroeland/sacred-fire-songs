// Story 6.1.1 / G1.1 (#385, ADR 0007): components move from palette classes to
// semantic tokens. The baseline only goes DOWN: when a restyle story removes
// palette classes, lower PALETTE_BASELINE to the new total. Never raise it.
// Story 6.1.35 (#485): the audit also scans lib/ (category colours lived there).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { countPaletteClasses, PALETTE_DIRS, paletteUsage } from '@/lib/design/paletteAudit';

const PALETTE_BASELINE = 581;

describe('palette ratchet', () => {
  it('detects palette classes and hex colours, not semantic tokens', () => {
    expect(countPaletteClasses('bg-gray-900 dark:text-red-500/80 hover:border-amber-500 text-white bg-[#1a0505]')).toBe(5);
    expect(countPaletteClasses('bg-surface text-fg-muted border-line bg-accent text-on-accent text-chord')).toBe(0);
  });

  it('scans app/, components/ and lib/', () => {
    expect([...PALETTE_DIRS]).toEqual(['app', 'components', 'lib']);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'palette-'));
    for (const dir of PALETTE_DIRS) fs.mkdirSync(path.join(root, dir));
    fs.writeFileSync(path.join(root, 'lib', 'colours.ts'), "export const c = 'bg-red-500 text-white';");
    fs.writeFileSync(path.join(root, 'components', 'Ok.tsx'), "export const c = 'bg-surface';");
    expect(paletteUsage(root)).toEqual({ [path.join('lib', 'colours.ts')]: 2 });
    fs.rmSync(root, { recursive: true, force: true });
  });

  it(`app/, components/ and lib/ use no more palette classes than the baseline`, () => {
    const usage = paletteUsage();
    const total = Object.values(usage).reduce((a, b) => a + b, 0);
    const top = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 10);
    expect(total, `top files: ${JSON.stringify(top)}`).toBeLessThanOrEqual(PALETTE_BASELINE);
  });
});
