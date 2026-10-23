const VERSION = "reader-v3";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const SHELL = [
  "./",
  "./index.html",
  "./Libraryv10-mobile.html",
  "./manifest.webmanifest",
  "./manifest-mobile.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith("reader-") && ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isStaticThirdPartyAsset(url) {
  const host = url.hostname;
  if (host === "cdnjs.cloudflare.com") {
    return /\/(ajax\/libs\/(jszip\/|epub\.js\/|pdf\.js\/))/.test(url.pathname);
  }
  if (host === "fonts.googleapis.com" || host === "fonts.gstatic.com") return true;
  return false;
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cache third-party libraries and fonts after a successful online load.
  // Never cache API calls or arbitrary third-party responses.
  if (url.origin !== self.location.origin) {
    if (!isStaticThirdPartyAsset(url)) return;
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      if (cached) {
        event.waitUntil(fetch(request).then(response => {
          if (response && (response.ok || response.type === "opaque")) {
            return cache.put(request, response);
          }
        }).catch(() => {}));
        return cached;
      }
      try {
        const response = await fetch(request);
        if (response && (response.ok || response.type === "opaque")) {
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        return Response.error();
      }
    })());
    return;
  }

  // Network-first for same-origin files so updates appear online; use saved
  // copies when offline. Only navigations fall back to the app entry point.
  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    try {
      const response = await fetch(request, { cache: "no-store" });
      if (response && response.ok) {
        const runtime = await caches.open(RUNTIME_CACHE);
        runtime.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        return (await caches.match("./Libraryv10-mobile.html")) ||
               (await caches.match("./index.html")) ||
               Response.error();
      }
      return Response.error();
    }
  })());
});
