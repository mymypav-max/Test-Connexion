const CACHE_NAME = 'testeur-connexion-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/icon-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ne jamais intercepter les requêtes de mesure de latence (autres domaines,
  // ou appels contenant le paramètre anti-cache _cb) : elles doivent toujours
  // atteindre le vrai réseau pour rester représentatives.
  if (url.origin !== self.location.origin || url.searchParams.has('_cb')) {
    return;
  }

  // Pour l'app elle-même : cache d'abord, réseau en secours.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
