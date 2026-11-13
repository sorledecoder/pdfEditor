// sw.js — caches the app shell so PDF Editor opens fully offline.
// Bump CACHE whenever you upload a new index.html so users get the update.
const CACHE = 'pdfeditor-v4';
const SHELL = [
  './',
  './index.html',
  './style.css',
  './install.js',
  './manifest.json',
  './PDF.ico',
  './PDF-192.png',
  './PDF-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // add one by one so a missing file doesn't break the whole install
      Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: always try the live file (so updates show up at once),
// fall back to the cached copy when offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() =>
      caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))
    )
  );
});
