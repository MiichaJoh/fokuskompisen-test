// Behåll äldre cacheversioner för att undvika att offline-stöd bryts under uppdatering.
const CACHE = "fokuskompisen-v07-offline4";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest"];
const SUPABASE_SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
self.addEventListener("install", event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(ASSETS);
  // Offline-inloggning behöver även SDK-skriptet. Ett CDN-fel får inte stoppa installationen.
  try { await cache.add(new Request(SUPABASE_SDK, {mode:"cors"})); } catch (_) {}
  await self.skipWaiting();
})()));
self.addEventListener("activate", event => event.waitUntil((async () => {
  await self.clients.claim();
})()));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isSdk = url.href === SUPABASE_SDK;
  if (url.origin !== self.location.origin && !isSdk) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // CDN-skriptet måste kunna laddas offline; använd sparad kopia i första hand.
    if (isSdk) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
    }
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch (_) {
      return (await caches.match(event.request)) || Response.error();
    }
  })());
});
