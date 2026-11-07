// Story 6.1.1 / G1.1 (#385): the component-sheet primitives keep their token
// size AND colour classes after cn()/tailwind-merge, and no text is below 12 px.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { countSmallText, smallTextUsage } from '@/lib/design/paletteAudit';

const has = (classes: string, ...wanted: string[]) => {
  const list = classes.split(/\s+/);
  for (const w of wanted) expect(list, `${w} in "${classes}"`).toContain(w);
};

describe('cn() knows the token utilities', () => {
  it('keeps a token font size next to a token colour', () => {
    has(cn('text-meta text-fg-muted', 'text-on-chip-active'), 'text-meta', 'text-on-chip-active');
    has(cn('text-body', 'text-on-accent'), 'text-body', 'text-on-accent');
  });

  it('still lets a later size override an earlier one', () => {
    expect(cn('text-meta', 'text-body')).toBe('text-body');
    expect(cn('rounded-control', 'rounded-panel')).toBe('rounded-panel');
  });
});

describe('Button variants', () => {
  const variants = ['default', 'primary', 'destructive', 'outline', 'secondary', 'ghost', 'text', 'link'] as const;
  const sizes = ['default', 'sm', 'lg', 'icon'] as const;
  for (const variant of variants) {
    for (const size of sizes) {
      it(`${variant}/${size} keeps size, colour and a 44 px target`, () => {
        const c = cn(buttonVariants({ variant, size }));
        expect(c).toMatch(/\btext-(body|meta)\b/);
        expect(c).toMatch(/\btext-(on-accent|on-danger|fg|accent)\b/);
        expect(c).toMatch(/\b(min-h-tap|size-tap|min-h-12)\b/);
      });
    }
  }
});

describe('no text below 12 px', () => {
  it('detects arbitrary sizes below 12 px', () => {
    expect(countSmallText('text-[10px] md:text-[11px] text-[12px] text-[0.6rem] text-[0.75rem]')).toBe(3);
  });

  it('component primitives (components/ui) use none', () => {
    expect(smallTextUsage(['components/ui'])).toEqual({});
    for (const f of fs.readdirSync(path.resolve(__dirname, '../../../../components/ui'))) {
      const src = fs.readFileSync(path.resolve(__dirname, '../../../../components/ui', f), 'utf8');
      expect(src, f).not.toMatch(/\btext-(\[?[0-9.]+(px|rem)?\]?)?xxs\b/);
    }
  });

  // Ratchet: restyle stories (#387 first) lower this; never raise it.
  const SMALL_TEXT_BASELINE = 70;
  it('app/ and components/ have no more sub-12 px sizes than the baseline', () => {
    const total = Object.values(smallTextUsage()).reduce((a, b) => a + b, 0);
    expect(total).toBeLessThanOrEqual(SMALL_TEXT_BASELINE);
  });
});
