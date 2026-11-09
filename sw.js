const CACHE="fokuskompisen-v07-auth2";
const ASSETS=["./","./index.html","./manifest.webmanifest"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith("fokuskompisen-v07-auth2")&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener("fetch",event=>{if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith((async()=>{try{const response=await fetch(event.request);if(response.ok){const cache=await caches.open(CACHE);cache.put(event.request,response.clone())}return response}catch(e){return (await caches.match(event.request))||Response.error()}})())});
