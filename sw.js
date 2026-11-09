const CACHE = "visit-table";
const SNAPSHOT_URL = "https://raw.githubusercontent.com/vadash/gas_notify_test_5/data/snapshot.json";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url === SNAPSHOT_URL) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(e.request);
        if (res && res.ok) await cache.put(e.request, res.clone());
        return res;
      } catch {
        return (await cache.match(e.request)) || Response.error();
      }
    })());
    return;
  }
  if (e.request.destination !== "document") return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request);
    const network = fetch(e.request).then((res) => {
      if (res && res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => null);
    if (cached) {
      e.waitUntil(network);
      return cached;
    }
    const res = await network;
    return res || new Response("Нет сети, и копия отчёта ещё не сохранена.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  })());
});
