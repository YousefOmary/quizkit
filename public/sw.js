const CACHE = 'atlas-sprint-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

/** Cache every hashed asset referenced by an index.html document. */
async function cacheAssetsFrom(html, cache) {
  const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1]);
  await Promise.all(assets.map(async (url) => {
    if (await cache.match(url, { ignoreVary: true })) return;
    const response = await fetch(url);
    if (response.ok) await cache.put(url, response);
  }));
}

/** Precache the shell and its current assets so offline play always works. */
async function precache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(CORE);
  try {
    const response = await fetch('./index.html', { cache: 'no-cache' });
    if (response.ok) await cacheAssetsFrom(await response.text(), cache);
  } catch {
    /* installing while offline — the core shell is already cached */
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

/** Network-first navigations keep deploys fresh and re-sync new assets. */
async function handleNavigate(event, request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        await cache.put('./index.html', clone.clone());
        await cacheAssetsFrom(await clone.text(), cache);
      })());
    }
    return response;
  } catch {
    return caches.match('./index.html', { ignoreVary: true });
  }
}

/** Cache-first for everything else, refilling the cache on the way through. */
async function handleAsset(event, request) {
  // ignoreVary: dev/preview servers send `Vary: Origin`, and a module
  // script's headers differ from the fetch() that filled the cache.
  const cached = await caches.match(request, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const clone = response.clone();
    event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, clone)));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith(
    request.mode === 'navigate' ? handleNavigate(event, request) : handleAsset(event, request),
  );
});
