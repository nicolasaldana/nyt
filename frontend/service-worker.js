const CACHE_NAME = 'nyt-books-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  if (event.request.url.includes('/api/')) {
    // Network First para las APIs
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => 
          caches.match(event.request).then(cachedResponse => {
            return cachedResponse || new Response(
              JSON.stringify({ error: 'Network error and no cache available' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          })
        )
    );
  } else {
    // Cache First para recursos estáticos
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }).catch(() => {
             // Fallback para recursos estáticos si fallan red y caché
             if (event.request.mode === 'navigate') {
               return caches.match('./index.html');
             }
             return new Response('Network error', { status: 408 });
          });
        })
    );
  }
});
