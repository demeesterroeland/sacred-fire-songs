import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createAdminClient } from '@/lib/supabase/admin';

const root = join(__dirname, '..', '..', '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe('createAdminClient', () => {
  it('returns null without a secret key', () => {
    expect(createAdminClient({ NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321' })).toBeNull();
    expect(createAdminClient({ NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_SECRET_KEY: '  ' })).toBeNull();
  });

  it('returns null without a project URL', () => {
    expect(createAdminClient({ SUPABASE_SECRET_KEY: 'k' })).toBeNull();
  });

  it('uses the development URL in development', () => {
    expect(createAdminClient({ NODE_ENV: 'development', NEXT_PUBLIC_SUPABASE_URL: 'http://x', SUPABASE_SECRET_KEY: 'k' })).toBeNull();
    expect(createAdminClient({ NODE_ENV: 'development', NEXT_PUBLIC_SUPABASE_URL_DEV: 'http://127.0.0.1:54321', SUPABASE_SECRET_KEY: 'k' })).not.toBeNull();
  });

  it('is imported only by the share e-mail server action', () => {
    // The secret key bypasses row-level security: every new caller needs a review.
    const importers = ['app', 'components', 'hooks', 'context', 'lib']
      .flatMap((d) => sourceFiles(join(root, d)))
      .filter((f) => /from\s+['"](@\/lib\/supabase\/admin|\.{1,2}\/(supabase\/)?admin)['"]/.test(readFileSync(f, 'utf8')))
      .map((f) => relative(root, f));
    expect(importers).toEqual(['lib/actions/notifications.ts']);
    expect(readFileSync(join(root, 'lib/actions/notifications.ts'), 'utf8')).toMatch(/^'use server';/);
  });

  it('the secret key is never a public (NEXT_PUBLIC_) variable', () => {
    const src = readFileSync(join(root, 'lib/supabase/admin.ts'), 'utf8');
    expect(src).not.toMatch(/NEXT_PUBLIC_SUPABASE_SECRET|NEXT_PUBLIC_SUPABASE_SERVICE/);
  });
});
