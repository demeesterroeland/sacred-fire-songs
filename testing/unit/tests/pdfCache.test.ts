import { describe, it, expect, vi } from 'vitest';
import {
  exportFingerprint,
  getOrCreatePdf,
  memoryPdfStore,
  pdfCacheKey,
  type ExportFingerprintInput,
  type PdfCacheStore,
} from '@/lib/export/pdfCache';

const base: ExportFingerprintInput = {
  userId: 'user-1',
  playlistId: 'pl-1',
  locale: 'en',
  baseUrl: 'https://songbook.example.org',
  title: 'Ceremony',
  description: 'Full moon',
  songs: [
    { title: 'Agua', author: 'Mãe', key: 'Am', capo: 2, transposition: 0, content: '[Am]Agua', url: '/songs/a' },
    { title: 'Fuego', key: 'C', content: '[C]Fuego', url: '/songs/b' },
  ],
};

const blob = (text: string) => new Blob([text], { type: 'application/pdf' });

describe('exportFingerprint() – is the playlist dirty?', () => {
  it('is stable for identical input', async () => {
    expect(await exportFingerprint(base)).toBe(await exportFingerprint(structuredClone(base)));
  });

  it.each<[string, (i: ExportFingerprintInput) => void]>([
    ['song order changed', (i) => i.songs.reverse()],
    ['song added', (i) => i.songs.push({ title: 'Tierra', content: '[G]Tierra' })],
    ['song removed', (i) => i.songs.pop()],
    ['song content edited', (i) => (i.songs[0].content += '\n[G]more')],
    ['song key edited', (i) => (i.songs[0].key = 'Bm')],
    ['capo / transposition edited', (i) => (i.songs[0].transposition = 2)],
    ['playlist title changed', (i) => (i.title = 'New moon')],
    ['playlist description changed', (i) => (i.description = 'Half moon')],
    ['interface language switched', (i) => (i.locale = 'nl')],
    ['other site (base URL) used', (i) => (i.baseUrl = 'http://localhost:3000')],
    ['other user', (i) => (i.userId = 'user-2')],
  ])('changes when %s', async (_case, mutate) => {
    const changed = structuredClone(base);
    mutate(changed);
    expect(await exportFingerprint(changed)).not.toBe(await exportFingerprint(base));
  });
});

describe('getOrCreatePdf()', () => {
  it('generates on first export and reuses the PDF while nothing changed', async () => {
    const store = memoryPdfStore();
    const generate = vi.fn(async () => blob('v1'));
    const first = await getOrCreatePdf({ store, key: 'k', fingerprint: 'f1', generate });
    const second = await getOrCreatePdf({ store, key: 'k', fingerprint: 'f1', generate });
    expect(generate).toHaveBeenCalledTimes(1);
    expect(first.reused).toBe(false);
    expect(second.reused).toBe(true);
    expect(await second.blob.text()).toBe('v1');
  });

  it('regenerates and replaces the cached PDF when the playlist is dirty', async () => {
    const store = memoryPdfStore();
    await getOrCreatePdf({ store, key: 'k', fingerprint: 'f1', generate: async () => blob('v1') });
    const dirty = await getOrCreatePdf({ store, key: 'k', fingerprint: 'f2', generate: async () => blob('v2') });
    expect(dirty.reused).toBe(false);
    expect(await dirty.blob.text()).toBe('v2');
    const again = await getOrCreatePdf({ store, key: 'k', fingerprint: 'f2', generate: async () => blob('v3') });
    expect(await again.blob.text()).toBe('v2');
  });

  it('keeps playlists and users apart', async () => {
    const store = memoryPdfStore();
    await getOrCreatePdf({ store, key: pdfCacheKey('u1', 'p1'), fingerprint: 'f', generate: async () => blob('u1p1') });
    const other = await getOrCreatePdf({ store, key: pdfCacheKey('u2', 'p1'), fingerprint: 'f', generate: async () => blob('u2p1') });
    const otherPlaylist = await getOrCreatePdf({ store, key: pdfCacheKey('u1', 'p2'), fingerprint: 'f', generate: async () => blob('u1p2') });
    expect(await other.blob.text()).toBe('u2p1');
    expect(await otherPlaylist.blob.text()).toBe('u1p2');
  });

  it('still exports when the cache cannot be read or written', async () => {
    const broken: PdfCacheStore = {
      get: async () => {
        throw new Error('IndexedDB unavailable');
      },
      set: async () => {
        throw new Error('quota exceeded');
      },
      clear: async () => {},
    };
    const result = await getOrCreatePdf({ store: broken, key: 'k', fingerprint: 'f', generate: async () => blob('ok') });
    expect(result.reused).toBe(false);
    expect(await result.blob.text()).toBe('ok');
  });

  it('clear() forgets every cached PDF (used on sign-out)', async () => {
    const store = memoryPdfStore();
    await getOrCreatePdf({ store, key: 'k', fingerprint: 'f', generate: async () => blob('v1') });
    await store.clear();
    const generate = vi.fn(async () => blob('v2'));
    await getOrCreatePdf({ store, key: 'k', fingerprint: 'f', generate });
    expect(generate).toHaveBeenCalledTimes(1);
  });
});
