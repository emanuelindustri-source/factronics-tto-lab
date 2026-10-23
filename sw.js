/* Factronics TTO Lab service worker (rev 1.2.0).
   Cache-first for static assets, network-first for page navigations. The
   question bank and the whole app shell are stored so the PWA opens offline. */
const VERSION = "1.2.0";
const CACHE = "factronics-tto-" + VERSION;

const CORE = [
  "./",
  "index.html",
  "generator/",
  "generator/index.html",
  "manifest.webmanifest",
  "assets/css/site.css",
  "assets/js/bank.js",
  "assets/js/i18n.js",
  "assets/js/progress.js",
  "assets/js/pwa.js",
  "assets/js/landing.js",
  "assets/js/generator.js",
  "assets/img/factronics-transparent.png",
  "assets/img/factronics-white.png",
  "assets/img/factronics.png",
  "assets/img/favicon.png",
  "assets/img/icon-192.png",
  "assets/img/icon-512.png",
  "assets/img/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map((url) =>
      cache.add(new Request(url, { cache: "reload" })).catch(() => null)
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try { url = new URL(request.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) {
          cache.put(request, fresh.clone()).catch(() => {});
          return fresh;
        }
      } catch (e) {
        /* offline: fall through to the cache */
      }
      const hit = await cache.match(request);
      if (hit) return hit;
      const fallback = url.pathname.includes("/generator/")
        ? await cache.match("generator/index.html") || await cache.match("generator/")
        : await cache.match("index.html") || await cache.match("./");
      return fallback || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(request);
    if (hit) return hit;
    try {
      const response = await fetch(request);
      if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
      return response;
    } catch (e) {
      return new Response("", { status: 504 });
    }
  })());
});
