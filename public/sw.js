/* eslint-disable no-restricted-globals */
// Service Worker -- PWA ke do kaam: offline chalna aur install prompt milna.
//
// ⚠️ CACHE STRATEGY (badalna ho to dhyan se)
// Next.js har build me hashed chunk names banata hai (_next/static/...). Agar
// hum "cache-first" lagate, to purane deploy ke JS chunks serve hote aur naye
// HTML ke saath mismatch hota -- yani white screen. Isliye:
//   * HTML / navigation  -> NETWORK-FIRST (hamesha fresh, offline me cache)
//   * /_next/static/      -> CACHE-FIRST (hashed hai, kabhi nahi badalta)
//   * /api/               -> kabhi cache nahi (dynamic data)
//
// Naya deploy aane par CACHE_VERSION badal do -- purane caches activate step
// me apne aap delete ho jaate hain.

const CACHE_VERSION = "v1";
const STATIC_CACHE = `im-static-${CACHE_VERSION}`;
const PAGE_CACHE = `im-pages-${CACHE_VERSION}`;

// Install ke waqt precache: offline page + icons (taaki app pehli baar offline
// bhi kuch dikha sake, na ki blank screen)
const PRECACHE = ["/offline", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {
        /* koi ek resource fail ho to baaki bhi mat roko */
      })
      // NOTE: skipWaiting() jaan-boojh kar nahi call kiya. Isse purane page
      // chalte chalte naya SW control le leta aur chunk mismatch ho sakta hai.
      // Naya SW agle normal navigation par activate hoga -- safe.
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("im-") && k !== STATIC_CACHE && k !== PAGE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/fonts/") ||
  url.pathname.startsWith("/icons/");

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Sirf GET cache karte hain (POST /api/search ko chhedna nahi hai)
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin (fonts.gstatic, analytics...) -- browser ko chhod do
  if (url.origin !== self.location.origin) return;

  // API responses kabhi cache nahi -- hamesha live data
  if (url.pathname.startsWith("/api/")) return;

  // ---- Static assets: cache-first (content-hashed, safe) ----
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;
        return fetch(request).then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // ---- Pages (navigation): network-first, offline me cache ----
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match("/offline"))
        )
    );
  }
});
