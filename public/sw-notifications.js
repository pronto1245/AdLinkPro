// Service Worker for AdLinkPro Push Notifications
const CACHE_NAME = 'adlinkpro-notifications-v1';
const NOTIFICATION_TAG = 'adlinkpro-notification';

// Install event - set up the service worker
self.addEventListener('install', (event) => {
  console.log('AdLinkPro Notification Service Worker installed');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('AdLinkPro Notification Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle push events for notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'AdLinkPro',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: NOTIFICATION_TAG,
    requireInteraction: false,
    actions: []
  };

  // Parse the push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.message || data.body || notificationData.body,
        tag: data.tag || NOTIFICATION_TAG,
        data: data.data || {},
        requireInteraction: data.priority === 'high' || data.priority === 'urgent',
      };

      // Add action buttons based on notification type
      if (data.type === 'offer_request_created') {
        notificationData.actions = [
          {
            action: 'view',
            title: 'View Request'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ];
      } else if (data.type === 'payment_received') {
        notificationData.actions = [
          {
            action: 'view-finances',
            title: 'View Finances'
          }
        ];
      } else if (data.type === 'antifraud_alert') {
        notificationData.actions = [
          {
            action: 'view-alert',
            title: 'View Alert'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ];
        notificationData.requireInteraction = true;
      }

      // Set appropriate icon based on notification type
      if (data.type?.includes('antifraud') || data.type?.includes('fraud')) {
        notificationData.icon = '/icon-warning-192x192.png';
      } else if (data.type?.includes('payment') || data.type?.includes('commission')) {
        notificationData.icon = '/icon-money-192x192.png';
      } else if (data.type?.includes('offer')) {
        notificationData.icon = '/icon-offer-192x192.png';
      }

    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Determine the URL to open based on the action and notification type
  let url = '/dashboard';

  if (action === 'view' || (!action && data.type === 'offer_request_created')) {
    url = '/dashboard/advertiser/access-requests';
  } else if (action === 'view-finances' || data.type === 'payment_received') {
    url = '/dashboard/finances';
  } else if (action === 'view-alert' || data.type?.includes('antifraud')) {
    url = '/dashboard/advertiser/antifraud';
  } else if (action === 'dismiss') {
    // Just close the notification, no URL to open
    return;
  } else {
    // Default action - open notifications page
    url = '/dashboard/notifications';
  }

  // Open the appropriate page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open with the target URL
      for (let client of clientList) {
        if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no window is open with the target URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  const notification = event.notification;
  const data = notification.data || {};

  // Optional: Send analytics or telemetry about notification dismissal
  if (data.notificationId) {
    // Could send a fetch request to mark the notification as seen/dismissed
    // but we'll keep it simple for now
    console.log(`Notification ${data.notificationId} was closed`);
  }
});

// Handle background sync for offline notification actions
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'notification-action') {
    event.waitUntil(
      // Handle any pending notification actions that couldn't be completed while offline
      handleOfflineNotificationActions()
    );
  }
});

// Helper function to handle offline notification actions
async function handleOfflineNotificationActions() {
  try {
    // Get any pending actions from IndexedDB or localStorage
    // This could include marking notifications as read, or other actions
    // For now, we'll just log that we're handling offline actions
    console.log('Handling offline notification actions');
    
    // In a full implementation, you might:
    // 1. Get pending actions from storage
    // 2. Try to sync them with the server
    // 3. Clear them from storage if successful
    
  } catch (error) {
    console.error('Error handling offline notification actions:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SHOW_NOTIFICATION':
      // Show a notification programmatically
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        tag: payload.tag || NOTIFICATION_TAG,
        data: payload.data || {}
      });
      break;
      
    case 'CLEAR_NOTIFICATIONS':
      // Clear all notifications
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach(notification => notification.close());
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Keep the service worker alive
self.addEventListener('fetch', (event) => {
  // We don't need to handle fetch events for notifications
  // but having this listener prevents the service worker from being terminated
  // This is especially important for push notifications to work reliably
});