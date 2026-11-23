/* Service worker: precaches every file so the app works offline after the first open.
   App shell (HTML, JS, CSS, manifest, data) is network-first so updates reach phones automatically;
   images are cache-first. On activation, open pages are reloaded so even pages running older code switch over. */
const CACHE='iconostasis-1bd60f4b9f';
const FILES=['./', 'index.html', 'app.css', 'app.js', 'data.js', 'manifest.webmanifest', 'icons/apple-touch-icon-180.png', 'icons/favicon-32.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'img/iconostasis.jpg', 'img/sec_left.jpg', 'img/sec_middle.jpg', 'img/sec_right.jpg', 'img/church/apl1.jpg', 'img/church/apl2.jpg', 'img/church/apl3.jpg', 'img/church/apl4.jpg', 'img/church/apl5.jpg', 'img/church/apl6.jpg', 'img/church/apr1.jpg', 'img/church/apr2.jpg', 'img/church/apr3.jpg', 'img/church/apr4.jpg', 'img/church/apr5.jpg', 'img/church/apr6.jpg', 'img/church/baptist.jpg', 'img/church/christ.jpg', 'img/church/doors.jpg', 'img/church/michael.jpg', 'img/church/nicholas.jpg', 'img/church/standl.jpg', 'img/church/standr.jpg', 'img/church/theotokos.jpg', 'img/church/topl.jpg', 'img/church/topr.jpg', 'img/church/trinity.jpg', 'img/church/walll.jpg', 'img/church/wallr.jpg', 'img/booklet/p01.jpg', 'img/booklet/p02.jpg', 'img/booklet/p03.jpg', 'img/booklet/p04.jpg', 'img/booklet/p05.jpg', 'img/booklet/p06.jpg', 'img/booklet/p07.jpg', 'img/booklet/p08.jpg', 'img/booklet/p09.jpg', 'img/booklet/p10.jpg', 'img/booklet/p11.jpg', 'img/booklet/p12.jpg', 'img/booklet/p13.jpg', 'img/booklet/p14.jpg', 'img/booklet/p15.jpg', 'img/booklet/p16.jpg', 'img/booklet/p17.jpg', 'img/booklet/p18.jpg', 'img/booklet/p19.jpg', 'img/booklet/p20.jpg', 'img/cross/topl.jpg', 'img/cross/topr.jpg'];
const SHELL=/(\/|\.html|\.js|\.css|\.webmanifest|\.json)$/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{
  let upgraded=false;
  const done=caches.keys().then(ks=>{const old=ks.filter(k=>k!==CACHE);upgraded=old.length>0;return Promise.all(old.map(k=>caches.delete(k)))}).then(()=>self.clients.claim());
  e.waitUntil(done);
  // After activation (not inside waitUntil, which would block the reload's own fetch), reload open pages
  // so pages still running older app code switch to the new version (only on an upgrade, not the first install).
  done.then(()=>upgraded&&setTimeout(()=>self.clients.matchAll({type:'window'}).then(cs=>cs.forEach(c=>c.navigate(c.url).catch(()=>{}))),50));
});
function put(req,resp){if(resp&&resp.ok){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return resp}
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;
  if(req.mode==='navigate'||SHELL.test(url.pathname)){
    // network-first, fall back to cache when offline
    // (a navigation Request can't be re-created with options, so build a plain one from its URL)
    const net=req.mode==='navigate'?new Request(url.href,{cache:'no-cache',credentials:'same-origin'}):new Request(req,{cache:'no-cache'});
    e.respondWith(fetch(net).then(r=>put(req,r)).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||(req.mode==='navigate'?caches.match('index.html'):Response.error()))));
    return;
  }
  // images and icons: cache-first
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(resp=>put(req,resp))));
});
