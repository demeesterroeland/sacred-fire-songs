import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// The app selects user_recordings by an explicit list (RECORDING_COLUMNS in lib/actions/rehearsal.ts),
// and the database grants SELECT on exactly those columns: every column except singer_email.
// A column added to one side only would make every take query fail, so both lists must match.

const root = join(__dirname, '..', '..', '..');

function appColumns(): string[] {
  const src = readFileSync(join(root, 'lib/actions/rehearsal.ts'), 'utf8');
  const match = src.match(/const RECORDING_COLUMNS =([\s\S]*?);/);
  expect(match, 'RECORDING_COLUMNS not found').toBeTruthy();
  const joined = [...match![1].matchAll(/"([^"]*)"/g)].map((m) => m[1]).join('');
  return joined.split(',').map((c) => c.trim()).filter(Boolean).sort();
}

function grantedColumns(sql: string): string[] {
  const match = sql.match(/grant select \(([^)]*)\)\s*on public\.user_recordings to anon, authenticated/i);
  expect(match, 'column grant on user_recordings not found').toBeTruthy();
  return match![1].split(',').map((c) => c.trim()).filter(Boolean).sort();
}

function latestMigrationGrant(): string[] {
  const dir = join(root, 'supabase/migrations');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  const withGrant = files.filter((f) =>
    /grant select \([^)]*\)\s*on public\.user_recordings/i.test(readFileSync(join(dir, f), 'utf8'))
  );
  expect(withGrant.length).toBeGreaterThan(0);
  return grantedColumns(readFileSync(join(dir, withGrant[withGrant.length - 1]), 'utf8'));
}

describe('user_recordings column privileges', () => {
  it('the app selects exactly the granted columns, never singer_email', () => {
    const app = appColumns();
    expect(app).not.toContain('singer_email');
    expect(app).toEqual(latestMigrationGrant());
  });

  it('the fresh-install schema grants the same columns', () => {
    const schema = readFileSync(join(root, 'docs/design/db-schema.sql'), 'utf8');
    expect(grantedColumns(schema)).toEqual(appColumns());
  });
});
