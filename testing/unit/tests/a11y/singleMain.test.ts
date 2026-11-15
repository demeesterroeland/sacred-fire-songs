// Validation 2, item 15: one <main> landmark per page. The root layout owns it (app/layout.tsx); no page,
// nested layout or component may render a second one inside it.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx|jsx)$/.test(name)) out.push(full);
  }
  return out;
}

describe('landmarks', () => {
  it('only app/layout.tsx renders <main>', () => {
    const offenders = ['app', 'components']
      .flatMap((d) => walk(d))
      .filter((f) => f !== join('app', 'layout.tsx'))
      .filter((f) => /<main[\s>]/.test(readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')));
    expect(offenders).toEqual([]);
  });

  it('the root layout has exactly one <main>', () => {
    expect(readFileSync('app/layout.tsx', 'utf8').match(/<main[\s>]/g)).toHaveLength(1);
  });
});
