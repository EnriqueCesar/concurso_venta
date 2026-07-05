const CACHE = 'concurso-venta-usd-real-v2-2026-07-03';
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "data/contest-data.js",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/products_clean/dona.jpg",
  "assets/products_clean/cheesecake.jpg",
  "assets/products_clean/pan.jpg",
  "assets/products_clean/cookie.jpg",
  "assets/managers_clean/SM_Coacalco.jpeg",
  "assets/managers_clean/SM_Cosmopol.jpeg",
  "assets/managers_clean/SM_CosmopolN1.jpeg",
  "assets/managers_clean/SM_GaleriasPerinorte.jpeg",
  "assets/managers_clean/SM_IzcalliMega.jpeg",
  "assets/managers_clean/SM_LunaPark.jpeg",
  "assets/managers_clean/SM_PatioEcatepec.jpeg",
  "assets/managers_clean/SM_LasFlores.jpeg",
  "assets/managers_clean/SM_SanMarcos.jpeg",
  "assets/managers_clean/SM_SanMiguelIzcalli.jpeg"
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
