import { LatLng } from 'leaflet';

/**
 * Calculate distance between two points using Haversine formula 
 * @param point1 First location point
 * @param point2 Second location point
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(point2.lat - point1.lat);
  const dLon = deg2rad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
}

/**
 * Calculate estimated time to reach destination based on distance
 * @param distance Distance in kilometers
 * @param speedKmPerHour Average speed in km/h (default: 50)
 * @returns Estimated time in minutes
 */
export function calculateEstimatedTime(distance: number, speedKmPerHour: number = 50): number {
  // Time in hours = distance / speed
  // Convert to minutes
  return (distance / speedKmPerHour) * 60;
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    // Convert to meters and round
    return `${Math.round(distance * 1000)} m`;
  } else if (distance < 10) {
    // For short distances, show one decimal place
    return `${distance.toFixed(1)} km`;
  } else {
    // For longer distances, round to nearest kilometer
    return `${Math.round(distance)} km`;
  }
}

/**
 * Format time for display
 * @param timeInMinutes Time in minutes
 * @returns Formatted time string
 */
export function formatTime(timeInMinutes: number): string {
  if (timeInMinutes < 1) {
    return 'Less than a minute';
  } else if (timeInMinutes < 60) {
    const minutes = Math.round(timeInMinutes);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = Math.round(timeInMinutes % 60);
    
    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  }
}

/**
 * Request location and notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    // Request geolocation permission
    if (navigator.geolocation) {
      const locationPermission = await new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          (error) => {
            console.error('Location permission issue:', error.message);
            resolve(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
      
      if (!locationPermission) {
        console.error('Location permission denied');
        // Continue with the app, but location features won't work
      }
    } else {
      console.error('Geolocation not supported by this browser');
    }
    
    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('Notification permission denied');
        // Continue with the app, but notifications won't work
      }
    } else {
      console.error('Notifications not supported by this browser');
    }
    
    // Return true to indicate the permissions flow completed
    // (not necessarily that permissions were granted)
    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}

/**
 * Show a notification with sound and vibration
 */
export function showNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    // Create notification
    const notification = new Notification(title, {
      body,
      silent: false // Enable default notification sound
    });
    
    // Try to play a beep sound
    try {
      const audio = new Audio('data:audio/wav;base64,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');
      audio.play().catch(e => console.error('Audio play error:', e));
    } catch (e) {
      console.error('Error playing notification sound:', e);
    }
    
    // Vibrate if supported (mobile devices)
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Close notification after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  } else {
    console.log('Notification not shown (permission not granted):', title, body);
  }
}