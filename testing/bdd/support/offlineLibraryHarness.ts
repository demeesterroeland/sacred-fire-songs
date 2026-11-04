/**
 * IndexedDB harness for the offline library (Story 4.3.2, #358).
 *
 * fake-indexeddb runs IndexedDB in Node, so the local library store can be
 * tested without a browser. Every scenario gets a brand-new factory, hence an
 * empty database. Shared by the Cucumber hook below and by Vitest
 * (testing/unit/tests/offlineLibraryHarness.test.ts).
 */
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

export const TEST_DB_NAME = 'sfs-offline-library-harness-selftest';

/** A new, empty IndexedDB: no database exists in it yet. */
export function freshIndexedDb(): IDBFactory {
  return new IDBFactory();
}

/**
 * Makes a fresh factory the global `indexedDB` (as in a browser), so code under
 * test that calls `indexedDB.open(...)` starts from an empty database.
 */
export function installFreshIndexedDb(): IDBFactory {
  const idb = freshIndexedDb();
  Object.assign(globalThis, { indexedDB: idb, IDBKeyRange });
  return idb;
}

/** Opens the self-test database (one store `items`, keyPath `id`). */
export function openTestDb(idb: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = idb.open(TEST_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('items', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
