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
          () => resolve(false)
        );
      });
      
      if (!locationPermission) {
        console.error('Location permission denied');
        return false;
      }
    } else {
      console.error('Geolocation not supported');
      return false;
    }
    
    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('Notification permission denied');
        return false;
      }
    } else {
      console.error('Notifications not supported');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}

/**
 * Show a notification
 */
export function showNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    // Create notification
    const notification = new Notification(title, {
      body,
      icon: '/icon.png' // You'd need to provide this icon
    });
    
    // Close notification after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  } else {
    console.log('Notification:', title, body);
  }
}