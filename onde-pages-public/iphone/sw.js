'use strict';
const CACHE = 'onde-iphone-shell-v201';
const BASE = new URL('./', self.location.href);
const FILES = ['index.html','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png'].map(p=>new URL(p,BASE).href);
self.addEventListener('install', event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));
});
self.addEventListener('activate', event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('onde-iphone-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event=>{
  const request=event.request;
  const url=new URL(request.url);
  // No interception or caching of the API, thumbnails, YouTube or any audio/video.
  if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(new URL('index.html',BASE).href,copy)));}
      return response;
    }).catch(()=>caches.match(new URL('index.html',BASE).href).then(response=>response||new Response('Connexion nécessaire pour ouvrir Onde.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}))));
    return;
  }
  if(FILES.includes(url.href))event.respondWith(caches.match(request).then(hit=>hit||fetch(request)));
});
