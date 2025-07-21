// Service Worker registration and management

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

// Check if service worker is supported
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

// Register service worker
export const registerSW = () => {
  if (!isServiceWorkerSupported()) {
    console.log('Service Worker not supported');
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

    if (isLocalhost) {
      // This is running on localhost. Let's check if a service worker still exists or not.
      checkValidServiceWorker(swUrl);

      // Add some additional logging to localhost, pointing developers to the
      // service worker/PWA documentation.
      navigator.serviceWorker.ready.then(() => {
        console.log(
          'This web app is being served cache-first by a service ' +
            'worker. To learn more, visit https://cra.link/PWA'
        );
      });
    } else {
      // Is not localhost. Just register service worker
      registerValidSW(swUrl);
    }
  });
};

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('SW registered: ', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Show update available notification
              showUpdateAvailableNotification();
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');
              showOfflineReadyNotification();
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

// Unregister service worker
export const unregisterSW = () => {
  if (!isServiceWorkerSupported()) {
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => {
      registration.unregister();
    })
    .catch((error) => {
      console.error(error.message);
    });
};

// Check if app is running offline
export const isOnline = () => {
  return navigator.onLine;
};

// Listen for online/offline events
export const setupOnlineListener = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Queue actions for when back online
let offlineQueue = [];

export const queueOfflineAction = (action) => {
  offlineQueue.push({
    ...action,
    timestamp: Date.now(),
    id: Math.random().toString(36).substr(2, 9)
  });
  
  // Store in IndexedDB for persistence
  storeOfflineAction(action);
};

export const processOfflineQueue = async () => {
  if (!isOnline() || offlineQueue.length === 0) {
    return;
  }

  const actionsToProcess = [...offlineQueue];
  offlineQueue = [];

  for (const action of actionsToProcess) {
    try {
      await executeOfflineAction(action);
      removeStoredOfflineAction(action.id);
    } catch (error) {
      console.error('Failed to execute offline action:', error);
      // Re-queue failed actions
      offlineQueue.push(action);
    }
  }
};

// Execute a queued offline action
const executeOfflineAction = async (action) => {
  const token = localStorage.getItem('token');
  
  switch (action.type) {
    case 'LIKE_RECORDING':
      const response = await fetch(`/api/social/recordings/${action.recordingId}/like`, {
        method: action.isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to sync like');
      break;
      
    case 'RATE_RECORDING':
      const rateResponse = await fetch(`/api/social/recordings/${action.recordingId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating: action.rating })
      });
      if (!rateResponse.ok) throw new Error('Failed to sync rating');
      break;
      
    default:
      console.warn('Unknown offline action type:', action.type);
  }
};

// IndexedDB operations for offline actions
const storeOfflineAction = (action) => {
  const request = indexedDB.open('san2stic-offline', 1);
  
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains('actions')) {
      db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
    }
  };
  
  request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction(['actions'], 'readwrite');
    const store = transaction.objectStore('actions');
    store.add(action);
  };
};

const removeStoredOfflineAction = (actionId) => {
  const request = indexedDB.open('san2stic-offline', 1);
  
  request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction(['actions'], 'readwrite');
    const store = transaction.objectStore('actions');
    store.delete(actionId);
  };
};

// Show notifications to user
const showUpdateAvailableNotification = () => {
  // This can be implemented with a toast notification
  console.log('App update available! Refresh to get the latest version.');
};

const showOfflineReadyNotification = () => {
  // This can be implemented with a toast notification
  console.log('App is ready for offline use!');
};

// Request background sync (for modern browsers)
export const requestBackgroundSync = (tag) => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register(tag);
    });
  }
};