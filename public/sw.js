const CACHE="rideperks-static-v1";
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.add("/offline.html")).then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("rideperks-static-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=="GET"||url.origin!==self.location.origin)return;
 if(request.mode==="navigate"){event.respondWith(fetch(request).catch(()=>caches.match("/offline.html")));return;}
 if(url.pathname.startsWith("/_next/static/"))event.respondWith(caches.open(CACHE).then(async cache=>{const saved=await cache.match(request);if(saved)return saved;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;}));
});
