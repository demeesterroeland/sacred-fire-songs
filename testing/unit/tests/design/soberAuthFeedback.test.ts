// Story 6.1.35 (#485), auth and feedback pages: the sign-up code page, the auth
// error page, finish registration, the access-denied screen and the app loading
// screen use semantic tokens only. Every file under app/auth is covered too.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(path.relative(ROOT, full));
  }
  return out;
}

const FILES = [
  'app/auth/sign-up-success/page.tsx',
  'app/auth/error/page.tsx',
  'components/finish-registration-form.tsx',
  'components/forgot-password-form.tsx',
  'components/update-password-form.tsx',
  'components/common/feedback/AccessDenied.tsx',
  'app/loading.tsx',
  ...walk(path.join(ROOT, 'app/auth')),
];

describe('sober auth and feedback pages (#485)', () => {
  it.each([...new Set(FILES)])('%s uses no palette classes', (file) => {
    expect(countPaletteClasses(fs.readFileSync(path.join(ROOT, file), 'utf8'))).toBe(0);
  });

  it('the loading screen draws embers from the accent token, not a hex colour', () => {
    const src = fs.readFileSync(path.join(ROOT, 'app/loading.tsx'), 'utf8');
    expect(src).not.toMatch(/#[0-9a-fA-F]{6}/);
    expect(src).toContain('var(--accent)');
  });

  it('error messages are announced and labelled by text, in the danger token', () => {
    const src = fs.readFileSync(path.join(ROOT, 'app/auth/sign-up-success/page.tsx'), 'utf8');
    expect(src).toContain('AuthNotice');
  });
});
