// public/sw.js
// Minimal service worker — satisfies PWA installability criteria.
// Offline caching is implemented in Story 4.5.1.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// No fetch handler — browser handles all requests natively.
// Offline caching will be added in Story 4.5.1.
