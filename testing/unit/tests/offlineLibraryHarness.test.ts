/**
 * Self-test of the IndexedDB harness (Story 4.3.2, #358): every test starts
 * from an empty database, in Node, without a browser.
 */
import { describe, it, expect } from 'vitest';
import { freshIndexedDb, openTestDb, TEST_DB_NAME } from '../../bdd/support/offlineLibraryHarness';

describe('offline library IndexedDB harness', () => {
  it('opens a database with a store in Node', async () => {
    const idb = freshIndexedDb();
    const db = await openTestDb(idb);
    expect(db.name).toBe(TEST_DB_NAME);
    expect([...db.objectStoreNames]).toEqual(['items']);
    db.close();
  });

  it.each([1, 2])('starts empty and leaves data behind (run %i)', async () => {
    const idb = freshIndexedDb();
    const db = await openTestDb(idb);
    const read = db.transaction('items').objectStore('items').count();
    const count = await new Promise<number>((resolve) => {
      read.onsuccess = () => resolve(read.result);
    });
    expect(count).toBe(0);
    await new Promise<void>((resolve) => {
      const tx = db.transaction('items', 'readwrite');
      tx.objectStore('items').put({ id: 'x' });
      tx.oncomplete = () => resolve();
    });
    db.close();
  });

  it('gives independent factories', async () => {
    const a = freshIndexedDb();
    const b = freshIndexedDb();
    (await openTestDb(a)).close();
    expect((await b.databases()).map((d) => d.name)).not.toContain(TEST_DB_NAME);
  });
});
