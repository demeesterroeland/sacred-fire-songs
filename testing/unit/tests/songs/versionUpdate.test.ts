// Story 6.2.20 / G5.3 (#523): a write that row-level security filters returns no error and no row; it is not a save.
import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { DICTIONARIES } from '@/lib/i18n';
import { errorMessage } from '@/lib/errors/errorCode';
import { updateSourceRow, updateVersionRow, SOURCE_NOT_CORRECTED, VERSION_NOT_SAVED } from '@/lib/songs/versionUpdate';

const dict = DICTIONARIES.en as Record<string, string>;
const t = (key: string) => dict[key] ?? key;

/** A client whose update answers `result` and records the chain it was asked for. */
function fakeClient(result: { data: unknown; error: unknown }) {
  const calls: Array<[string, ...unknown[]]> = [];
  const chain: Record<string, unknown> = {};
  for (const op of ['update', 'eq', 'select']) {
    chain[op] = (...args: unknown[]) => {
      calls.push([op, ...args]);
      return op === 'select' ? Promise.resolve(result) : chain;
    };
  }
  const client = { from: (table: string) => (calls.push(['from', table]), chain) } as unknown as SupabaseClient;
  return { client, calls };
}

describe('updateVersionRow', () => {
  it('updates the version row and asks for the row back, so a refused write is visible', async () => {
    const { client, calls } = fakeClient({ data: [{ id: 'v1' }], error: null });
    await updateVersionRow(client, 'v1', { beats: '6' });
    expect(calls).toEqual([['from', 'song_versions'], ['update', { beats: '6' }], ['eq', 'id', 'v1'], ['select', 'id']]);
  });

  it('throws when no row came back: row-level security filtered the update without an error', async () => {
    const { client } = fakeClient({ data: [], error: null });
    const failure = await updateVersionRow(client, 'v1', { beats: '6' }).catch((e) => e);
    expect(failure).toMatchObject({ code: VERSION_NOT_SAVED });
    expect(errorMessage(failure, t)).toBe(dict['errors.versionNotSaved']);
  });

  it('rethrows the database error as it is', async () => {
    const error = { code: '42501', message: 'denied' };
    const { client } = fakeClient({ data: null, error });
    await expect(updateVersionRow(client, 'v1', {})).rejects.toBe(error);
  });
});

describe('updateSourceRow', () => {
  it('updates the source row by id and asks for the row back', async () => {
    const { client, calls } = fakeClient({ data: [{ id: 'src1' }], error: null });
    await updateSourceRow(client, 'src1', { page: '39' });
    expect(calls).toEqual([['from', 'song_version_sources'], ['update', { page: '39' }], ['eq', 'id', 'src1'], ['select', 'id']]);
  });

  it.each([
    ['no row came back', { data: [], error: null }],
    ['the database refused it', { data: null, error: { code: '42501', message: 'denied' } }],
  ])('says the version is saved but the source is not corrected when %s', async (_name, result) => {
    const { client } = fakeClient(result);
    const failure = await updateSourceRow(client, 'src1', { page: '39' }).catch((e) => e);
    expect(failure).toMatchObject({ code: SOURCE_NOT_CORRECTED });
    expect(errorMessage(failure, t)).toBe(dict['errors.sourceNotCorrected']);
  });
});
