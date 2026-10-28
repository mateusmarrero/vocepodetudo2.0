/**
 * Service Worker - Você Pode Tudo PWA (v4.9.7)
 * Resiliente, seguro e não invasivo.
 */

const CACHE_NAME = 'vocepodetudo-pwa-v4.9.7';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/curriculo.html',
  '/manifest.json',
  '/src/style.css',
  '/src/app.js',
  '/src/curriculo.js',
  '/src/curriculo.css',
  '/src/data/courses.js',
  '/src/data/career_quiz.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/logo.png',
  '/assets/logo-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((e) => console.warn('[PWA] Cache parcial:', e));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);

  // REGRA DE OURO: Intercepta APENAS requisições da mesma origem (vocepodetudo.com)
  // Qualquer CDN externa (Tailwind, Lucide, Google Fonts, VLibras, etc.) é tratada diretamente pelo browser!
  if (url.origin !== self.location.origin) return;

  // Ignora endpoints de API dinâmicos e área administrativa
  if (url.pathname.startsWith('/api/') || url.pathname.includes('admin')) return;

  // Para navegação HTML: Network-first com fallback para cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            if (url.pathname.includes('curriculo')) return caches.match('/curriculo.html');
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Para arquivos estáticos do mesmo domínio: Stale-While-Revalidate seguro
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          }
          return networkRes;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
