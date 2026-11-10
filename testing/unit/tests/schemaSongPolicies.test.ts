import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const schema = readFileSync(join(process.cwd(), 'docs/design/db-schema.sql'), 'utf8')
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n');

/** Every `create policy` statement in the fresh-install script, as one line of text. */
const policies = (schema.match(/create policy[\s\S]*?;/gi) ?? []).map((p) => p.replace(/\s+/g, ' '));
const on = (table: string) => policies.filter((p) => p.includes(`on public.${table} `));

describe('db-schema.sql: song and version policies match the migrations', () => {
  it.each(['compositions', 'song_versions'])('%s has no policy that is open to everyone', (table) => {
    const open = on(table).filter((p) => /(using|with check) \(true\)/i.test(p));
    expect(open).toEqual([]);
  });

  it('guests read public songs only', () => {
    expect(on('compositions').join()).toContain('"Public songs are viewable by everyone"');
    expect(on('song_versions').join()).toContain('"Respect composition privacy for versions"');
  });

  it('signed-in users read public songs, their own songs and, as admin, all songs', () => {
    expect(on('compositions').join()).toContain('"Authenticated users can view appropriate songs"');
    expect(on('song_versions').join()).toContain('"Authenticated users can view appropriate versions"');
  });

  it('owners and admins can still create, change and delete', () => {
    expect(on('compositions').join()).toContain('"Owners can manage their songs"');
    expect(on('compositions').join()).toContain('"Admins can manage all songs"');
    expect(on('song_versions').join()).toContain('"Allow contributors and admins to delete versions"');
  });
});
