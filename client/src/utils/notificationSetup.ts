// Notification Setup Utility for AdLinkPro
// Handles service worker registration and push notification setup

interface NotificationPermissionResult {
  granted: boolean;
  serviceWorkerRegistered: boolean;
  error?: string;
}

interface PushNotificationSetup {
  permission: NotificationPermission;
  serviceWorkerSupported: boolean;
  pushSupported: boolean;
  registration?: ServiceWorkerRegistration;
}

export class NotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;

  /**
   * Initialize the notification system
   * Registers service worker and requests permissions
   */
  async initialize(): Promise<NotificationPermissionResult> {
    console.log('🔔 Initializing AdLinkPro notification system...');

    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers not supported');
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      // Register service worker
      const registration = await this.registerServiceWorker();
      this.registration = registration;

      // Request notification permission
      const permission = await this.requestNotificationPermission();

      console.log('✅ Notification system initialized successfully');
      this.isInitialized = true;

      return {
        granted: permission === 'granted',
        serviceWorkerRegistered: true,
        error: permission === 'denied' ? 'Notification permission denied' : undefined
      };

    } catch (error) {
      console.error('❌ Failed to initialize notification system:', error);
      return {
        granted: false,
        serviceWorkerRegistered: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Register the notification service worker
   */
  private async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    try {
      const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
        scope: '/'
      });

      console.log('✅ Service worker registered:', registration);

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

      return registration;
    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Request notification permission from the user
   */
  private async requestNotificationPermission(): Promise<NotificationPermission> {
    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Notification permission already denied');
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission result:', permission);

    return permission;
  }

  /**
   * Get current notification setup status
   */
  getSetupStatus(): PushNotificationSetup {
    return {
      permission: Notification.permission,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      pushSupported: 'PushManager' in window,
      registration: this.registration || undefined
    };
  }

  /**
   * Show a local notification (not push)
   */
  async showLocalNotification(title: string, options: NotificationOptions = {}) {
    if (!this.isInitialized) {
      console.warn('⚠️ Notification system not initialized');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted');
      return;
    }

    try {
      if (this.registration) {
        // Use service worker to show notification
        await this.registration.showNotification(title, {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          ...options
        });
      } else {
        // Fallback to direct notification
        new Notification(title, {
          icon: '/icon-192x192.png',
          ...options
        });
      }
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
    }
  }

  /**
   * Send message to service worker
   */
  sendMessageToServiceWorker(message: any) {
    if (!this.registration || !this.registration.active) {
      console.warn('⚠️ Service worker not active');
      return;
    }

    this.registration.active.postMessage(message);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    try {
      if (this.registration) {
        const notifications = await this.registration.getNotifications();
        notifications.forEach(notification => notification.close());
        console.log(`🧹 Cleared ${notifications.length} notifications`);
      }
    } catch (error) {
      console.error('❌ Failed to clear notifications:', error);
    }
  }

  /**
   * Subscribe to push notifications (requires backend endpoint)
   */
  async subscribeToPushNotifications(serverPublicKey?: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('❌ Service worker not registered');
      return null;
    }

    if (!('PushManager' in window)) {
      console.error('❌ Push notifications not supported');
      return null;
    }

    try {
      // Check if already subscribed
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('✅ Already subscribed to push notifications');
        return existingSubscription;
      }

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: serverPublicKey || this.getDefaultVAPIDKey()
      });

      console.log('✅ Subscribed to push notifications:', subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error('❌ Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.registration) {
      console.error('❌ Service worker not registered');
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Unsubscribed from push notifications');
        
        // Notify server about unsubscription
        await this.removeSubscriptionFromServer(subscription);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Send subscription details to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      const response = await fetch('/api/notifications/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Push subscription sent to server');
    } catch (error) {
      console.error('❌ Failed to send subscription to server:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(subscription: PushSubscription) {
    try {
      const response = await fetch('/api/notifications/push-unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Push subscription removed from server');
    } catch (error) {
      console.error('❌ Failed to remove subscription from server:', error);
    }
  }

  /**
   * Get default VAPID public key (should be configured in environment)
   */
  private getDefaultVAPIDKey(): string {
    // In production, this should be loaded from environment variables
    // For now, return a placeholder that would need to be replaced
    return 'BNxqJgHcR0xFBF9z8IZE9Hq3KGzqv6WKJbK2gNhbPH0yKWZqP7QjGk9Y6RrW9lKJvP4xGzN8VqL2k7BrM6Jw2X4';
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Export utility functions for easy access
export const initializeNotifications = () => notificationManager.initialize();
export const showNotification = (title: string, options?: NotificationOptions) => 
  notificationManager.showLocalNotification(title, options);
export const clearNotifications = () => notificationManager.clearAllNotifications();
export const getNotificationStatus = () => notificationManager.getSetupStatus();

// Auto-initialize when imported (optional)
if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize with a delay to not block page load
    setTimeout(() => {
      notificationManager.initialize().then(result => {
        if (result.granted) {
          console.log('🔔 AdLinkPro notifications ready');
        } else if (result.error) {
          console.log('⚠️ AdLinkPro notifications setup issue:', result.error);
        }
      });
    }, 2000);
  });
}