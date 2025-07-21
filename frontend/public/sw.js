const CACHE_NAME = 'san2stic-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Assets that should be cached with a cache-first strategy
const CACHE_FIRST_ASSETS = [
  '/static/',
  '/assets/',
  '/images/'
];

// API endpoints that should be cached with a network-first strategy
const NETWORK_FIRST_APIS = [
  '/api/recordings',
  '/api/social'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (NETWORK_FIRST_APIs.some(api => url.pathname.startsWith(api))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If we got a valid response, cache it
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (CACHE_FIRST_ASSETS.some(asset => url.pathname.startsWith(asset))) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          });
        })
    );
    return;
  }

  // Default strategy for other requests
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Get pending actions from IndexedDB
  const pendingActions = await getPendingActions();
  
  for (const action of pendingActions) {
    try {
      switch (action.type) {
        case 'LIKE_RECORDING':
          await fetch(`/api/social/recordings/${action.recordingId}/like`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${action.token}`,
              'Content-Type': 'application/json'
            }
          });
          break;
        case 'RATE_RECORDING':
          await fetch(`/api/social/recordings/${action.recordingId}/rate`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${action.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating: action.rating })
          });
          break;
      }
      
      // Remove completed action
      await removePendingAction(action.id);
    } catch (error) {
      console.error('Background sync failed for action:', action, error);
    }
  }
}

// IndexedDB helpers for storing offline actions
async function getPendingActions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('san2stic-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function removePendingAction(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('san2stic-offline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}