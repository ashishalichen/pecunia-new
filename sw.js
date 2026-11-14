/* PECUNIA service worker
 * - Pages and files from this site: network first, so a new deploy shows up on the next launch.
 *   If the network fails (offline), the last good copy from the cache is used.
 * - /api/* (Google sign-in) and every other website (Google Drive, fonts, etc.) are never touched.
 * Bump CACHE when you want to force old caches to be dropped.
 */
const CACHE = "pecunia-shell-v6";
const SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/about",
  "/privacy",
  "/terms",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // one missing file must not break the install
      Promise.allSettled(SHELL.map((url) => cache.add(new Request(url, { cache: "reload" })))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Google Drive, fonts, etc.
  if (url.pathname.startsWith("/api/")) return; // sign-in endpoints must always hit the server

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        if (req.mode === "navigate") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }),
  );
});
