// Story 6.1.26 / G6.1 (#410) review fix: `next=` is validated where it is consumed, not only where
// the GuestGate builds the sign-in link. One hardened validator for every redirect target.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { safeNextPath } from '@/lib/auth/safeNext';
import { safeNextPath as reExported } from '@/lib/auth/guestGate';

const HOSTILE: Array<[string, string | null | undefined]> = [
  ['protocol-relative', '//evil.example'],
  ['backslash after slash', '/\\evil.example'],
  ['leading backslash', '\\evil.example'],
  ['encoded protocol-relative', '/%2F%2Fevil.example'],
  ['encoded slash then slash', '/%2F/evil.example'],
  ['encoded backslash', '/%5Cevil.example'],
  ['double-encoded backslash', '/%255Cevil.example'],
  ['tab inside (browsers drop it)', '/\t/evil.example'],
  ['encoded tab', '/%09/evil.example'],
  ['encoded newline', '/%0A/evil.example'],
  ['carriage return', '/\r/evil.example'],
  ['space', '/ /evil.example'],
  ['null byte', '/\u0000/evil.example'],
  ['dot segments collapse to //', '/.//evil.example'],
  ['encoded dot segments collapse to //', '/%2e%2e//evil.example'],
  ['authority @', '@evil.example'],
  ['authority @ after slash-less host', 'evil.example@evil.example'],
  ['absolute https', 'https://evil.example/x'],
  ['absolute http', 'http://evil.example'],
  ['javascript scheme', 'javascript:alert(1)'],
  ['data scheme', 'data:text/html,<script>1</script>'],
  ['malformed percent escape', '/%E0%A4%A'],
  ['empty', ''],
  ['null', null],
  ['undefined', undefined],
];

describe('safeNextPath', () => {
  it.each(HOSTILE)('falls back to / for %s', (_name, input) => {
    expect(safeNextPath(input)).toBe('/');
  });

  it('uses the caller fallback when given', () => {
    expect(safeNextPath('//evil.example', '/explore')).toBe('/explore');
  });

  it.each([
    ['/songs/1?x=1#y', '/songs/1?x=1#y'],
    ['/', '/'],
    ['/library/recently-viewed', '/library/recently-viewed'],
    ['/account/settings?tab=privacy', '/account/settings?tab=privacy'],
    ['/songs/a%20b?q=caf%C3%A9', '/songs/a%20b?q=caf%C3%A9'],
    ['/songs/fb193fc1-8d60-45db-85ab-b076d5985255/edit', '/songs/fb193fc1-8d60-45db-85ab-b076d5985255/edit'],
    ['/search?q=a@b.c', '/search?q=a@b.c'],
  ])('keeps same-site path %s', (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it('is the same function the GuestGate uses', () => {
    expect(reExported).toBe(safeNextPath);
  });
});

describe('every next= consumer runs the value through safeNextPath', () => {
  const root = path.resolve(__dirname, '../../..');
  const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

  it.each([
    'app/auth/login/page.tsx',
    'app/auth/sign-up/page.tsx',
    'app/auth/callback/route.ts',
    'app/auth/confirm/route.ts',
    'components/login-form.tsx',
    'components/finish-registration-form.tsx',
    'components/song/SongForm.tsx',
  ])('%s', (rel) => {
    expect(read(rel)).toContain('safeNextPath');
  });
});
