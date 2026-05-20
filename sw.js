const CACHE_NAME = 'biass-kasa-v7';
const ASSETS = ['./index.html', './manifest.json'];

// Install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Push notification
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Biass Kasa', {
      body: data.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      data: data
    })
  );
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.openWindow('./')
  );
});

// Background sync — check reminders daily
self.addEventListener('periodicsync', e => {
  if (e.tag === 'check-reminders') {
    e.waitUntil(checkReminders());
  }
});

async function checkReminders() {
  const cache = await caches.open(CACHE_NAME);
  // Reminders are checked via the app itself on open
}
