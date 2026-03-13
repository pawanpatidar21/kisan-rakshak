// KisanRakshak Service Worker v1.0.0
// Offline-first strategy for farmers with poor connectivity

const CACHE_NAME = 'kisanrakshak-v1.0.0';
const STATIC_CACHE = 'kisanrakshak-static-v1';
const DYNAMIC_CACHE = 'kisanrakshak-dynamic-v1';

// Core files to cache on install
const PRECACHE_URLS = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// External resources to cache
const EXTERNAL_CACHE = [
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Hind:wght@400;500;600&display=swap',
];

// ===== INSTALL =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Pre-caching core assets');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ===== FETCH — Stale-While-Revalidate for HTML, Cache-First for assets =====
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Fonts: cache-first (rarely change)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // HTML: stale-while-revalidate (always serve fast, update in background)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Static assets (icons, images): cache-first
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Everything else: network-first with offline fallback
  event.respondWith(networkFirst(request));
});

// ===== STRATEGIES =====

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlinePage();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || await networkFetch || offlinePage();
}

function offlinePage() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="hi">
    <head><meta charset="UTF-8"><title>ऑफलाइन | KisanRakshak</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      body{font-family:sans-serif;background:#0d3b20;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:20px;}
      .icon{font-size:72px;margin-bottom:20px;}
      h1{font-size:24px;color:#ffd166;margin-bottom:10px;}
      p{color:#b7e4c7;font-size:14px;line-height:1.7;max-width:300px;}
      button{margin-top:20px;padding:12px 28px;background:#25a854;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;}
    </style>
    </head>
    <body>
      <div class="icon">🌿</div>
      <h1>इंटरनेट नहीं है</h1>
      <p>नेटवर्क की समस्या है। पहले से देखी गई जानकारी अभी भी उपलब्ध है।</p>
      <p style="margin-top:8px;font-size:12px;">No internet connection. Previously viewed content is still available.</p>
      <button onclick="location.reload()">🔄 फिर कोशिश करें / Retry</button>
    </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// ===== BACKGROUND SYNC — Queue failed actions =====
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Background sync triggered');
  }
});

// ===== PUSH NOTIFICATIONS (ready for future use) =====
self.addEventListener('push', event => {
  const data = event.data?.json() || {
    title: 'किसान रक्षक',
    body: 'नई जानकारी उपलब्ध है।',
    icon: '/icons/icon-192x192.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
