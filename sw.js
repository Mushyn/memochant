const CACHE='memochant-v0.1.2';
const ASSETS=['./','./index.html','./style.css','./app.js','./patterns.js','./storage.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('memochant-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return; e.respondWith((async()=>{try{const fresh=await fetch(e.request);if(fresh.ok){const cache=await caches.open(CACHE);cache.put(e.request,fresh.clone())}return fresh}catch{return await caches.match(e.request)||Response.error()}})())});
