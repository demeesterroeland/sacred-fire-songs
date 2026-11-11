import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error plain .mjs script without types
import { fillRecordings, isAlreadyExists } from '../../../../scripts/db/upload-sample-recordings.mjs';

// `npm run seed:audio` gives every take an audio file. By default it only fills takes whose file is
// missing, so takes recorded or uploaded in the local app keep their own audio; `--force` replaces all.

function fakeClient(existing: Set<string>) {
  const uploads: { path: string; upsert: boolean }[] = [];
  const updates: string[] = [];
  const client = {
    storage: {
      from: () => ({
        upload: async (path: string, _body: unknown, opts: { upsert: boolean }) => {
          uploads.push({ path, upsert: opts.upsert });
          if (!opts.upsert && existing.has(path)) {
            return { error: { statusCode: '409', message: 'The resource already exists' } };
          }
          return { error: null };
        },
      }),
    },
    from: () => ({
      update: () => ({ eq: async (_c: string, id: string) => (updates.push(id), { error: null }) }),
    }),
  };
  return { client, uploads, updates };
}

const rows = [
  { id: 'a', storage_path: 'u/1.webm' },
  { id: 'b', storage_path: 'u/2.webm' },
  { id: 'c', storage_path: null },
];
const audio = [{ body: Buffer.from('x'), seconds: 30 }];

describe('upload-sample-recordings', () => {
  it('only fills takes whose file is missing and leaves existing audio alone', async () => {
    const { client, uploads, updates } = fakeClient(new Set(['u/1.webm']));
    const result = await fillRecordings(client, rows, audio, { force: false });
    expect(uploads.every((u) => u.upsert === false)).toBe(true);
    expect(updates).toEqual(['b']);
    expect(result).toEqual({ uploaded: 1, kept: 1 });
  });

  it('replaces every file with --force', async () => {
    const { client, uploads, updates } = fakeClient(new Set(['u/1.webm']));
    const result = await fillRecordings(client, rows, audio, { force: true });
    expect(uploads.map((u) => u.upsert)).toEqual([true, true]);
    expect(updates).toEqual(['a', 'b']);
    expect(result).toEqual({ uploaded: 2, kept: 0 });
  });

  it('recognises the storage "already exists" error', () => {
    expect(isAlreadyExists({ statusCode: '409', message: 'x' })).toBe(true);
    expect(isAlreadyExists({ message: 'The resource already exists' })).toBe(true);
    expect(isAlreadyExists({ statusCode: '400', message: 'Bucket not found' })).toBe(false);
  });

  it('does not run against the database when imported', () => {
    expect(vi.isMockFunction(fillRecordings)).toBe(false);
  });
});
