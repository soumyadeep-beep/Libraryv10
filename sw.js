const V="reader-v2",SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=="GET"||u.origin!==location.origin)return; /* leave Google, fonts and CDNs alone */
 /* always ask the server first (skipping the browser's own copy) so new uploads show up straight away; use the saved copy only when offline */
 e.respondWith(fetch(r,{cache:"no-store"}).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match("./index.html"))));
});
