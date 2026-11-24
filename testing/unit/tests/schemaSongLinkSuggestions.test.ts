import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Story 6.2.26 / G1.5 (#598): the fresh-install script carries migration 20261124150000_song_link_suggestions.sql
 * with the same table, functions and access rules.
 */
const normalise = (sql: string) =>
  sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const schema = normalise(read('docs/design/db-schema.sql'));
const migration = normalise(read('supabase/migrations/20261124150000_song_link_suggestions.sql'));

const fn = (sql: string, name: string) => sql.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\$\\$;`))?.[0];

const PUBLIC_FUNCTIONS = [
  ['fn_suggest_song_link', '(uuid, uuid, text)'],
  ['fn_withdraw_song_link_suggestion', '(uuid)'],
  ['fn_decline_song_link_suggestion', '(uuid, text)'],
  ['fn_preview_song_link_suggestion', '(uuid, boolean)'],
  ['fn_accept_song_link_suggestion', '(uuid, boolean)'],
  ['fn_reopen_song_link_suggestion', '(uuid)'],
  ['fn_open_song_link_suggestion_count', '()'],
  ['fn_link_song_as_version', '(uuid, uuid)'],
] as const;

const INTERNAL_FUNCTIONS = [
  ['fn_assert_can_review_link', '(uuid, uuid)'],
  ['fn_link_song_as_version_core', '(uuid, uuid, uuid)'],
  ['fn_close_link_suggestions_on_song_delete', '()'],
] as const;

describe('db-schema.sql: song link suggestions (Story 6.2.26)', () => {
  it('the table exists with row-level security and no write grant for the API roles', () => {
    expect(schema).toContain('create table if not exists public.song_link_suggestions (');
    expect(schema).toContain('alter table public.song_link_suggestions enable row level security');
    expect(schema).toContain('revoke all on public.song_link_suggestions from anon, authenticated;');
    expect(schema).toContain('grant select on public.song_link_suggestions to authenticated;');
    expect(schema).not.toMatch(/grant (insert|update|delete|all)[^;]* on public\.song_link_suggestions to/);
  });

  it('a member reads their own suggestions, gatekeepers and admins read all of them', () => {
    expect(schema).toContain('using (suggested_by = (select auth.uid()))');
    expect(schema).toContain("using ((select role::text from public.profiles where id = (select auth.uid())) in ('admin', 'gatekeeper'))");
  });

  it('one open suggestion per pair, in either direction', () => {
    expect(schema).toContain('(least(source_id, target_id), greatest(source_id, target_id)) where status = \'open\'');
  });

  it('notes and reasons are capped at 280 characters in the table and the functions', () => {
    expect(schema).toContain('char_length(note) <= 280');
    expect(schema).toContain('char_length(decision_note) <= 280');
    expect(fn(schema, 'fn_suggest_song_link')).toContain('char_length(v_note) > 280');
    expect(fn(schema, 'fn_decline_song_link_suggestion')).toContain('char_length(v_reason) > 280');
  });

  it('a member has at most ten open suggestions, counted under an advisory lock', () => {
    const suggest = fn(schema, 'fn_suggest_song_link')!;
    expect(suggest).toContain('pg_advisory_xact_lock');
    expect(suggest).toContain("status = 'open') >= 10");
  });

  it('the notification types and the audit column exist', () => {
    expect(schema).toContain("check (type in ('recording_shared', 'link_suggestion_accepted', 'link_suggestion_declined'))");
    expect(schema).toContain('suggestion_id uuid references public.song_link_suggestions(id) on delete set null');
  });

  it.each([...PUBLIC_FUNCTIONS, ...INTERNAL_FUNCTIONS].map(([name]) => name))(
    '%s matches the migration, is SECURITY DEFINER and pins the search path',
    (name) => {
      const inSchema = fn(schema, name);
      expect(inSchema, name).toBeTruthy();
      expect(inSchema).toBe(fn(migration, name));
      expect(inSchema).toContain('security definer');
      expect(inSchema).toContain("set search_path = ''");
    }
  );

  it.each(PUBLIC_FUNCTIONS)('%s is for signed-in callers only (no anon, no service_role)', (name, args) => {
    expect(schema).toContain(`revoke all on function public.${name}${args} from public, anon, service_role;`);
    expect(schema).toContain(`grant execute on function public.${name}${args} to authenticated;`);
  });

  it.each(INTERNAL_FUNCTIONS)('%s is not callable by any API role', (name, args) => {
    expect(schema).toContain(`revoke all on function public.${name}${args} from public, anon, authenticated, service_role;`);
    expect(schema).not.toContain(`grant execute on function public.${name}`);
  });

  it('only reviewers decide: the database checks the role itself, an admin alone reopens', () => {
    for (const name of ['fn_decline_song_link_suggestion', 'fn_accept_song_link_suggestion', 'fn_preview_song_link_suggestion']) {
      expect(fn(schema, name), name).toContain("v_role not in ('admin', 'gatekeeper')");
    }
    expect(fn(schema, 'fn_reopen_song_link_suggestion')).toContain("v_role is distinct from 'admin'");
  });

  it('nobody suggests who can review, and only public songs are suggested', () => {
    const suggest = fn(schema, 'fn_suggest_song_link')!;
    expect(suggest).toContain("v_role in ('admin', 'gatekeeper')");
    expect(suggest).toContain('only public songs can be suggested');
  });

  it('a reviewer needs no ownership: the review check has no owner rule, the direct link keeps it', () => {
    expect(fn(schema, 'fn_assert_can_review_link')).not.toContain('owner_id');
    expect(fn(schema, 'fn_assert_can_link_song')).toContain('gatekeepers can only link songs they own');
  });

  it('the direct link is a thin wrapper over the core', () => {
    expect(fn(schema, 'fn_link_song_as_version')).toContain('fn_link_song_as_version_core(p_source, p_target, null)');
  });

  it('a song delete closes its open suggestions before the foreign keys run', () => {
    expect(schema).toContain('before delete on public.compositions for each row execute function public.fn_close_link_suggestions_on_song_delete()');
  });
});
