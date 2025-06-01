// src/sw.js
// Đặt file này trong thư mục src và cập nhật vite.config.js

// Tên cache và các tài nguyên cần cache
const CACHE_NAME = 'find-smallest-number-v1';
const urlsToCache = [
  '/find-smallest-number-game/',
  '/find-smallest-number-game/index.html',
  '/find-smallest-number-game/public/pwa-192x192.png',
  '/find-smallest-number-game/public/pwa-512x512.png'
];


// Cài đặt Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Chiến lược cache-first
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request).catch(() => caches.match('/index.html')))
  );
});


// Nhận thông báo push
self.addEventListener('push', (event) => {
  const title = 'Find the Smallest Number';
  const options = {
    body: 'Quay lại chơi game thôi!',
    icon: '/pwa-192x192.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});