// Story 6.1.1 / G1.1 (#385, ADR 0007): components move from palette classes to
// semantic tokens. The baseline only goes DOWN: when a restyle story removes
// palette classes, lower PALETTE_BASELINE to the new total. Never raise it.
import { describe, expect, it } from 'vitest';
import { countPaletteClasses, paletteUsage } from '@/lib/design/paletteAudit';

const PALETTE_BASELINE = 2715;

describe('palette ratchet', () => {
  it('detects palette classes and hex colours, not semantic tokens', () => {
    expect(countPaletteClasses('bg-gray-900 dark:text-red-500/80 hover:border-amber-500 text-white bg-[#1a0505]')).toBe(5);
    expect(countPaletteClasses('bg-surface text-fg-muted border-line bg-accent text-on-accent text-chord')).toBe(0);
  });

  it(`app/ and components/ use no more palette classes than the baseline`, () => {
    const usage = paletteUsage();
    const total = Object.values(usage).reduce((a, b) => a + b, 0);
    const top = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 10);
    expect(total, `top files: ${JSON.stringify(top)}`).toBeLessThanOrEqual(PALETTE_BASELINE);
  });
});
