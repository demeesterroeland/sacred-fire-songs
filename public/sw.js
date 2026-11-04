// public/sw.js
// Service worker: PWA installability + an offline fallback for page navigations (#353).
// Reading songs offline (cached content) is the second scenario of Story 4.5.1.
//
// Only offline page navigations are answered. Everything else, including every
// request while online, is left to the browser: an earlier pass-through
// fetch(event.request) broke online navigations, so the online path stays native.
// Behaviour: docs/testing/offline.feature.

// Bump the version whenever public/offline.html changes, so clients refetch it.
const OFFLINE_CACHE = 'sfs-offline-v1';
const OFFLINE_CACHE_PREFIX = 'sfs-offline-';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith(OFFLINE_CACHE_PREFIX) && name !== OFFLINE_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.mode !== 'navigate' || request.method !== 'GET') return;
  if (self.navigator.onLine !== false) return;

  event.respondWith(caches.match(OFFLINE_URL).then((response) => response || Response.error()));
});
