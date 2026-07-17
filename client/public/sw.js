const STATIC_CACHE = "contactos-static-v1";
const API_CACHE = "contactos-api-v1";

const STATIC_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => ![STATIC_CACHE, API_CACHE].includes(name))
          .map((name) => caches.delete(name)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // writes go through the app's own sync queue, not the SW cache

  const url = new URL(request.url);

  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const fallback = await caches.match("/");
    return fallback || new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

// Background Sync: fires when the browser regains connectivity, even if no
// tab triggered the 'online' event (e.g. the tab was reloaded mid-offline).
// Registered from lib/background-sync.ts whenever an operation is queued -
// "sync-contacts" and "sync-domains" both just wake the app up to drain
// whichever queues actually have pending items.
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-contacts" || event.tag === "sync-domains") {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => client.postMessage({ type: "SYNC_QUEUES" }));
}
