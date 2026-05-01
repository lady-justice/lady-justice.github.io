/**
 * JusticeApp service worker.
 * Strategy: precache shell + network-first w/ cache fallback for same-origin GETs.
 * Bump CACHE on every deploy to invalidate stale assets.
 */
const CACHE = 'justiceapp-v4';
const PRECACHE = [
  './',
  './index.html',
  './schedule.html',
  './book.html',
  './contact.html',
  './studio.html',
  './manifest.webmanifest',
  './assets/styles/main.css',
  './assets/js/app.js',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
