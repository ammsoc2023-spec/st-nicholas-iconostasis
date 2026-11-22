/* Service worker: precaches every file of the app so it works offline after the first open. */
const CACHE='iconostasis-5bc43114e2';
const FILES=['./', 'index.html', 'app.css', 'app.js', 'data.js', 'manifest.webmanifest', 'icons/apple-touch-icon-180.png', 'icons/favicon-32.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'img/iconostasis.jpg', 'img/church/apl1.jpg', 'img/church/apl2.jpg', 'img/church/apl3.jpg', 'img/church/apl4.jpg', 'img/church/apl5.jpg', 'img/church/apl6.jpg', 'img/church/apr1.jpg', 'img/church/apr2.jpg', 'img/church/apr3.jpg', 'img/church/apr4.jpg', 'img/church/apr5.jpg', 'img/church/apr6.jpg', 'img/church/baptist.jpg', 'img/church/bishops.jpg', 'img/church/christ.jpg', 'img/church/doors.jpg', 'img/church/michael.jpg', 'img/church/nicholas.jpg', 'img/church/standl.jpg', 'img/church/standr.jpg', 'img/church/theotokos.jpg', 'img/church/topl.jpg', 'img/church/topr.jpg', 'img/church/trinity.jpg', 'img/church/walll.jpg', 'img/church/wallr.jpg', 'img/booklet/p01.jpg', 'img/booklet/p02.jpg', 'img/booklet/p03.jpg', 'img/booklet/p04.jpg', 'img/booklet/p05.jpg', 'img/booklet/p06.jpg', 'img/booklet/p07.jpg', 'img/booklet/p08.jpg', 'img/booklet/p09.jpg', 'img/booklet/p10.jpg', 'img/booklet/p11.jpg', 'img/booklet/p12.jpg', 'img/booklet/p13.jpg', 'img/booklet/p14.jpg', 'img/booklet/p15.jpg', 'img/booklet/p16.jpg', 'img/booklet/p17.jpg', 'img/booklet/p18.jpg', 'img/booklet/p19.jpg', 'img/booklet/p20.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(resp=>{
    if(resp.ok){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}
    return resp;
  }).catch(()=>e.request.mode==='navigate'?caches.match('index.html'):Response.error())))
});
