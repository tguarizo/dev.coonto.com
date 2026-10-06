const STATIC_CACHE='coonto-shell-v196b5';
const PROTECTED_CACHE='coonto-protected-v2';
const SHELL=['/offline/reader.html','/offline/library.html','/offline/rc-reader.html','/manifest.webmanifest','/favicon.png','/images/coonto-logo.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  self.clients.claim(),
  caches.keys().then(keys=>Promise.all(keys.filter(key=>(key.startsWith('coonto-shell-')&&key!==STATIC_CACHE)||(key.startsWith('coonto-protected-')&&key!==PROTECTED_CACHE)).map(key=>caches.delete(key))))
 ]));
});
async function authorizedWork(){const cache=await caches.open(PROTECTED_CACHE);const work=await cache.match('/offline/o-alienista.html');return work&&Date.parse(work.headers.get('X-Coonto-Expires')||'')>Date.now()?work:null;}
async function offlineResponse(path){if(!await authorizedWork())return new Response('Conecte-se à internet, entre na sua conta e use Salvar neste aparelho para preparar a obra.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});const cache=await caches.open(PROTECTED_CACHE);return await cache.match(path)||new Response('Prepare esta obra novamente com internet.',{status:503});}
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(url.pathname==='/api/auth/logout'){event.respondWith(caches.delete(PROTECTED_CACHE).then(()=>fetch(event.request)));return;}
 const rcMatch=/^\/offline\/(memorias-de-martha|divina-comedia-canto-i)\.html$/.exec(url.pathname);
 async function rcOffline(slug,file){const cache=await caches.open(PROTECTED_CACHE),work=await cache.match('/offline/'+slug+'.html');if(!work||Date.parse(work.headers.get('X-Coonto-Expires')||'')<=Date.now())return new Response('Conecte-se e baixe esta obra novamente pela sua conta.',{status:503});return await cache.match(file)||new Response('Este arquivo não foi baixado.',{status:503});}
 if(rcMatch){event.respondWith(rcOffline(rcMatch[1],url.pathname));return;}
 const rcAudio=/^\/api\/audio\/rc\/(memorias-de-martha|divina-comedia-canto-i)\//.exec(url.pathname);
 if(rcAudio){event.respondWith(fetch(event.request).then(response=>response.status>=500?rcOffline(rcAudio[1],url.pathname):response).catch(()=>rcOffline(rcAudio[1],url.pathname)));return;}
 const rcPage=/^\/rc\/(memorias-de-martha|divina-comedia-canto-i)$/.exec(url.pathname);
 if(rcPage&&event.request.mode==='navigate'){
  // A cached fetch Response retains its URL. Build the offline shell explicitly
  // instead of using Response.url to distinguish it from a live page.
  const offlineReader=async()=>{const response=await rcOffline(rcPage[1],'/offline/rc-reader.html');if(!response.ok)return response;const html=await response.text();return new Response(html.replace("new URL(location.href).searchParams.get('work')",JSON.stringify(rcPage[1])),{headers:{'Content-Type':'text/html; charset=utf-8'}});};
  event.respondWith(fetch(event.request).then(response=>response.status>=500?offlineReader():response).catch(()=>offlineReader()));return;
 }
 if(url.pathname==='/offline/rc-reader.html'){const slug=url.searchParams.get('work');if(['memorias-de-martha','divina-comedia-canto-i'].includes(slug))event.respondWith(rcOffline(slug,url.pathname));return;}
 if(url.pathname.startsWith('/api/audio/o-alienista/s')){event.respondWith(fetch(event.request).then(response=>response.status>=500?offlineResponse(url.pathname):response).catch(()=>offlineResponse(url.pathname)));return;}
 if(url.pathname==='/offline/o-alienista.html'){event.respondWith(offlineResponse(url.pathname));return;}
 if(url.pathname==='/offline/reader.html'||url.pathname==='/offline/texto-o-alienista.html'){
  event.respondWith(fetch(event.request).then(response=>response.status>=500?offlineResponse(url.pathname):response).catch(()=>offlineResponse(url.pathname)));return;
 }
 if(event.request.mode==='navigate'&&url.pathname==='/minha-biblioteca'){event.respondWith(fetch(event.request).catch(()=>caches.match('/offline/library.html')));return;}
 if(url.pathname==='/offline/library.html'){event.respondWith(caches.match(url.pathname));return;}
 if(event.request.mode==='navigate'&&url.pathname==='/leitura/o-alienista'){
  event.respondWith(fetch(event.request).then(response=>response.status>=500?offlineResponse('/offline/reader.html'):response).catch(()=>offlineResponse('/offline/reader.html')));return;
 }
 if(event.request.mode==='navigate'&&url.pathname==='/texto/o-alienista'){
  event.respondWith(fetch(event.request).then(response=>response.status>=500?offlineResponse('/offline/texto-o-alienista.html'):response).catch(()=>offlineResponse('/offline/texto-o-alienista.html')));return;
 }
 // Never cache authenticated pages, APIs or CRM HTML.
 if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/backoffice')||event.request.mode==='navigate')return;
 if(SHELL.includes(url.pathname)||url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/images/')){
  event.respondWith(fetch(event.request).then(response=>{if(response.ok)event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.put(event.request,response.clone())));return response;}).catch(()=>caches.match(event.request).then(response=>response||new Response('',{status:503}))));
 }
});
