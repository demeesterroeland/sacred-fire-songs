/**
 * Test harness for the offline navigation fallback (issue #353).
 *
 * Runs public/sw.js and the inline script of public/offline.html in a Node vm
 * sandbox with small fakes for the browser APIs they use (Cache Storage,
 * navigator, localStorage, document). Shared by the Cucumber steps
 * (testing/bdd/steps/offline.steps.ts) and Vitest
 * (testing/unit/tests/offlineFallback.test.ts): no browser, milliseconds.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const SW_PATH = path.join(ROOT, 'public/sw.js');
const OFFLINE_PAGE_PATH = path.join(ROOT, 'public/offline.html');
const ORIGIN = 'http://localhost';

type Listener = (event: unknown) => void;

/** A stored response; `body` names what was cached so assertions stay readable. */
export interface FakeResponse {
  url: string;
  body: string;
}

class FakeCacheStorage {
  readonly stores = new Map<string, Map<string, FakeResponse>>();

  async open(name: string) {
    if (!this.stores.has(name)) this.stores.set(name, new Map());
    const store = this.stores.get(name)!;
    return {
      add: async (request: string | { url: string }) => {
        const url = typeof request === 'string' ? request : request.url;
        store.set(url, { url, body: `cached ${url}` });
      },
      put: async (url: string, response: FakeResponse) => {
        store.set(url, response);
      },
    };
  }

  async keys() {
    return [...this.stores.keys()];
  }

  async delete(name: string) {
    return this.stores.delete(name);
  }

  async match(request: string | { url: string }) {
    const url = typeof request === 'string' ? request : request.url;
    for (const store of this.stores.values()) {
      if (store.has(url)) return store.get(url);
    }
    return undefined;
  }
}

export interface FetchOutcome {
  /** True when the service worker called respondWith(). */
  answered: boolean;
  response?: FakeResponse | { type: 'error' };
}

export interface ServiceWorkerHarness {
  caches: FakeCacheStorage;
  setOnline(online: boolean): void;
  install(): Promise<void>;
  activate(): Promise<void>;
  fetch(url: string, init?: { mode?: string; method?: string }): Promise<FetchOutcome>;
  /** Fills a cache (created when missing) with URL to body entries, like a precache or an earlier visit. */
  preloadCache(name: string, entries: Record<string, string>): Promise<void>;
  /** Sets the online flag (when given), then sends a request; default is a non-navigation asset request. */
  request(url: string, options?: { online?: boolean; mode?: string; method?: string }): Promise<FetchOutcome>;
  /** Readable answer: the body served, 'network error' or 'none (left to the browser)'. */
  describeResponse(outcome: FetchOutcome): string;
}

/** Loads public/sw.js with an empty (or pre-filled) Cache Storage. */
export function loadServiceWorker(existingCaches: string[] = []): ServiceWorkerHarness {
  const listeners: Record<string, Listener[]> = {};
  const caches = new FakeCacheStorage();
  for (const name of existingCaches) caches.stores.set(name, new Map());
  const navigator = { onLine: true };

  const self = {
    addEventListener: (type: string, fn: Listener) => {
      (listeners[type] ??= []).push(fn);
    },
    skipWaiting: async () => undefined,
    clients: { claim: async () => undefined },
    navigator,
    location: { origin: ORIGIN },
  };
  class Request {
    constructor(
      readonly url: string,
      readonly init?: unknown,
    ) {}
  }
  const context = vm.createContext({
    self,
    caches,
    navigator,
    Request,
    Response: { error: () => ({ type: 'error' as const }) },
    URL,
    console,
  });
  vm.runInContext(readFileSync(SW_PATH, 'utf8'), context, { filename: 'public/sw.js' });

  const dispatchExtendable = async (type: string) => {
    const pending: Promise<unknown>[] = [];
    for (const fn of listeners[type] ?? []) fn({ waitUntil: (p: Promise<unknown>) => pending.push(p) });
    await Promise.all(pending);
  };

  const setOnline = (online: boolean) => {
    navigator.onLine = online;
  };

  const sendFetch: ServiceWorkerHarness['fetch'] = async (url, { mode = 'navigate', method = 'GET' } = {}) => {
    let answer: Promise<FakeResponse | { type: 'error' }> | undefined;
    const event = {
      request: { url: new URL(url, ORIGIN).href, mode, method },
      respondWith: (p: Promise<FakeResponse | { type: 'error' }>) => {
        answer = p;
      },
    };
    for (const fn of listeners.fetch ?? []) fn(event);
    return answer ? { answered: true, response: await answer } : { answered: false };
  };

  return {
    caches,
    setOnline,
    install: () => dispatchExtendable('install'),
    activate: () => dispatchExtendable('activate'),
    fetch: sendFetch,
    preloadCache: async (name, entries) => {
      const cache = await caches.open(name);
      for (const [url, body] of Object.entries(entries)) await cache.put(url, { url, body });
    },
    request: (url, { online, mode = 'cors', method = 'GET' } = {}) => {
      if (online !== undefined) setOnline(online);
      return sendFetch(url, { mode, method });
    },
    describeResponse: (outcome) => {
      if (!outcome.answered) return 'none (left to the browser)';
      const response = outcome.response;
      return response && 'body' in response ? response.body : 'network error';
    },
  };
}

// ─── Offline page ─────────────────────────────────────────────────────────────

export interface OfflinePageVisit {
  stored?: string | null;
  cookie?: string | null;
  browserLanguages?: string[];
}

export interface OfflinePage {
  lang: string;
  title: string;
  description: string;
  retry: string;
  reloads: number;
  pressRetry(): void;
  comeOnline(): void;
}

function readOfflinePage(): string {
  return readFileSync(OFFLINE_PAGE_PATH, 'utf8');
}

/** The per-locale texts embedded in public/offline.html. */
export function offlinePageMessages(): Record<string, Record<string, string>> {
  const match = readOfflinePage().match(/<script type="application\/json" id="offline-messages">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('public/offline.html has no #offline-messages JSON block');
  return JSON.parse(match[1]);
}

/** Runs the inline script of public/offline.html against a fake browser. */
export function showOfflinePage({ stored = null, cookie = null, browserLanguages = [] }: OfflinePageVisit = {}): OfflinePage {
  const html = readOfflinePage();
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  const json = html.match(/<script type="application\/json" id="offline-messages">([\s\S]*?)<\/script>/);
  if (!script || !json) throw new Error('public/offline.html is missing its inline script or messages');

  const clickListeners: Listener[] = [];
  const windowListeners: Record<string, Listener[]> = {};
  let reloads = 0;
  const element = () => ({ textContent: '' });
  const elements: Record<string, { textContent: string; addEventListener?: (t: string, fn: Listener) => void }> = {
    'offline-messages': { textContent: json[1] },
    'offline-title': element(),
    'offline-description': element(),
    'offline-retry': {
      textContent: '',
      addEventListener: (type, fn) => {
        if (type === 'click') clickListeners.push(fn);
      },
    },
  };
  const document = {
    getElementById: (id: string) => elements[id] ?? null,
    documentElement: { lang: '' },
    cookie: cookie ? `other=1; sacred-fire-songs-locale=${encodeURIComponent(cookie)}` : 'other=1',
    title: '',
  };
  const context = vm.createContext({
    document,
    localStorage: { getItem: (key: string) => (key === 'sacred-fire-songs-locale' ? stored : null) },
    navigator: { languages: browserLanguages, language: browserLanguages[0] ?? '' },
    location: { reload: () => void reloads++ },
    addEventListener: (type: string, fn: Listener) => {
      (windowListeners[type] ??= []).push(fn);
    },
  });
  vm.runInContext(script[1], context, { filename: 'public/offline.html' });

  return {
    lang: document.documentElement.lang,
    title: elements['offline-title'].textContent,
    description: elements['offline-description'].textContent,
    retry: elements['offline-retry'].textContent,
    get reloads() {
      return reloads;
    },
    pressRetry: () => clickListeners.forEach((fn) => fn({})),
    comeOnline: () => (windowListeners.online ?? []).forEach((fn) => fn({})),
  };
}
