const CACHE = "visit-table";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.destination !== "document") return;
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
