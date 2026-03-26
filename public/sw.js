const CACHE_NAME = 'party-space-v3';
const urlsToCache = [
  '/',
  '/landing',
  '/bet-awards',
  '/bet-awards/create',
  '/profile',
  '/manifest.json',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-128.png',
  '/icon-144.png',
  '/icon-152.png',
  '/icon-192.png',
  '/icon-384.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico'
];

// Track app installation
async function trackInstallation() {
  try {
    const deviceInfo = {
      userAgent: self.navigator.userAgent,
      platform: self.navigator.platform,
      language: self.navigator.language
    };

    // Detect install source
    let installSource = 'other';
    if (/android/i.test(deviceInfo.userAgent)) {
      installSource = 'android';
    } else if (/iphone|ipad|ipod/i.test(deviceInfo.userAgent)) {
      installSource = 'ios';
    } else if (/windows|mac|linux/i.test(deviceInfo.userAgent)) {
      installSource = 'desktop';
    }

    await fetch('/api/app-install', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceInfo,
        installSource
      })
    });
  } catch (error) {
    console.error('Failed to track installation:', error);
  }
}

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        }),
      trackInstallation()
    ])
  );
  self.skipWaiting();
});

// Fetch resources from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate service worker and clean up old caches
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
  return self.clients.claim();
});

// Handle push notifications (optional for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Party Space', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
