/**
 * Checks if notifications are supported in the browser
 * @returns Boolean indicating if notifications are supported
 */
export function areNotificationsSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Requests permission for browser notifications
 * @returns Promise that resolves with the permission status
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!areNotificationsSupported()) {
    console.error('Notifications are not supported in this browser');
    return 'denied';
  }
  
  return await Notification.requestPermission();
}

/**
 * Checks if notification permission is granted
 * @returns Boolean indicating if permission is granted
 */
export function hasNotificationPermission(): boolean {
  if (!areNotificationsSupported()) {
    return false;
  }
  
  return Notification.permission === 'granted';
}

/**
 * Shows a browser notification
 * @param title Notification title
 * @param options Notification options
 * @returns The notification object if successful, null otherwise
 */
export function showNotification(
  title: string, 
  options?: NotificationOptions
): Notification | null {
  if (!areNotificationsSupported() || !hasNotificationPermission()) {
    console.error('Notifications are not supported or permission not granted');
    return null;
  }
  
  try {
    // Play notification sound if audio URL is provided
    if (options?.silent === false && options?.sound) {
      const audio = new Audio(options.sound);
      audio.play().catch(err => console.error('Failed to play notification sound:', err));
    }
    
    // Create and return notification
    return new Notification(title, options);
  } catch (err) {
    console.error('Failed to show notification:', err);
    return null;
  }
}

/**
 * Creates an early warning notification for approaching destination
 * @param destinationName The name of the destination
 * @param timeToArrival Time to arrival in minutes
 * @returns The notification object if successful, null otherwise
 */
export function showEarlyWarningNotification(
  destinationName: string,
  timeToArrival: number
): Notification | null {
  return showNotification(
    'Approaching Destination',
    {
      body: `You will reach ${destinationName} in about ${Math.round(timeToArrival)} minutes!`,
      icon: '/path/to/notification-icon.png',
      badge: '/path/to/notification-badge.png',
      vibrate: [200, 100, 200],
      silent: false,
      requireInteraction: true,
      tag: 'location-approach'
    }
  );
}

/**
 * Creates an arrival notification for reached destination
 * @param destinationName The name of the destination
 * @param distance Current distance to the destination in meters
 * @returns The notification object if successful, null otherwise
 */
export function showArrivalNotification(
  destinationName: string,
  distance: number
): Notification | null {
  return showNotification(
    'Destination Reached',
    {
      body: `You are approximately ${Math.round(distance)}m from ${destinationName}!`,
      icon: '/path/to/notification-icon.png',
      badge: '/path/to/notification-badge.png',
      vibrate: [300, 100, 300, 100, 300],
      silent: false,
      requireInteraction: true,
      tag: 'location-arrival'
    }
  );
}
