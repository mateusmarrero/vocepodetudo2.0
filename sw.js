/**
 * Service Worker - Você Pode Tudo PWA (v4.93.0)
 * Resiliente, seguro e com expurgo ativo de cache.
 */

const CACHE_NAME = 'vocepodetudo-pwa-v4.93.0';

const PRECACHE_ASSETS = [
  '/',
  '/curso.php',
  '/index.html',
  '/curriculo.html',
  '/vagas.html',
  '/blog.html',
  '/calculadora-trabalhista.html',
  '/materiais-gratuitos.html',
  '/downloads.html',
  '/midia-kit.html',
  '/midia-kit',
  '/404.html',
  '/sobre.html',
  '/contato.html',
  '/src/cookie-banner.js',
  '/politica-privacidade.html',
  '/termos-de-uso.html',
  '/simulador-entrevista.html',
  '/teste-vocacional.html',
  '/cursos-gratis-informatica.html',
  '/cursos-gratis-excel.html',
  '/cursos-gratis-programacao.html',
  '/cursos-gratis-ia.html',
  '/cursos-gratis-administracao.html',
  '/cursos-gratis-ingles.html',
  '/vagas-jovem-aprendiz-2026.html',
  '/manifest.json',
  '/src/style.css',
  '/src/app.js',
  '/src/curriculo.js',
  '/src/curriculo.css',
  '/src/vagas.js',
  '/src/blog.js',
  '/src/simulador.js',
  '/src/teste-vocacional.js',
  '/src/data/courses.js',
  '/src/data/course_details.js',
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

  // Para scripts e estilos do portal: Network-first para nunca prender versões antigas em cache
  if (url.pathname.startsWith('/src/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          }
          return networkRes;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Para outros arquivos estáticos do mesmo domínio: Stale-While-Revalidate seguro
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


// ==============================================================
// WEB PUSH NOTIFICATIONS & INTERAÇÃO (PWA)
// ==============================================================
self.addEventListener('push', (event) => {
  let data = {
    title: 'Nova Oportunidade no Você Pode Tudo',
    body: 'Novos cursos gratuitos e vagas abertas acabaram de sair!',
    url: 'https://vocepodetudo.com'
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/assets/icon-192.png',
    badge: '/assets/logo-icon.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Ver Agora' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
