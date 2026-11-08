// Kepçe service worker: uygulamayı önbelleğe alır, internet/sunucu yokken de açılsın.
const CACHE = "kepce-v5";
const DOSYALAR = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(DOSYALAR))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.pathname.endsWith("/saglik") || u.pathname.endsWith("/analiz")) return;
  // Önce ağdan dene (güncel sürüm), olmazsa önbellekten aç
  e.respondWith(fetch(e.request).then(r => {
    const kopya = r.clone(); caches.open(CACHE).then(c => c.put(e.request, kopya)); return r;
  }).catch(() => caches.match(e.request)));
});
