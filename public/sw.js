const CACHE_NAME = "engineeros-cache-v1";
const OFFLINE_URLS = [
  "/",
  "/learn",
  "/dsa",
  "/programming",
  "/cheat-sheets",
  "/manifest.json",
  "/favicon.ico",
];

// Install: precache offline core routes
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch((err) => {
        console.warn("[EngineerOS SW] Precache non-fatal warning:", err);
      });
    }),
  );
  self.skipWaiting();
});

// Activate: clean up older caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    }),
  );
  self.clients.claim();
});

// Fetch: Strategy based on URL
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // Static assets (CSS, JS, Fonts, Images): Cache First with background update
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((networkRes) => {
            if (networkRes.ok) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkRes;
          })
          .catch(() => cached);
      }),
    );
    return;
  }

  // Course Reading & Lesson routes: Stale While Revalidate for offline lesson reading
  if (url.pathname.startsWith("/learn") || url.pathname.startsWith("/cheat-sheets")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkRes) => {
            if (networkRes.ok) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkRes;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      }),
    );
    return;
  }

  // Default HTML navigation: Network First with Cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match("/");
          });
        }),
    );
  }
});
