import { GeoLocation } from '@/types/location';

const EARTH_RADIUS_KM = 6371; // Radius of the earth in kilometers

/**
 * Calculates the distance between two geographical points using the Haversine formula
 * @param point1 First coordinates
 * @param point2 Second coordinates
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: GeoLocation, point2: GeoLocation): number {
  const deg2rad = (deg: number) => deg * (Math.PI / 180);
  
  const dLat = deg2rad(point2.latitude - point1.latitude);
  const dLon = deg2rad(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c; // Distance in kilometers
  
  return distance;
}

/**
 * Calculates the estimated time to reach a destination
 * @param distance Distance in kilometers
 * @param speedKmPerHour Average speed in km/h (default: 50 km/h)
 * @returns Estimated time in minutes
 */
export function calculateEstimatedTime(distance: number, speedKmPerHour: number = 50): number {
  // Convert distance and speed to time in minutes
  const timeInHours = distance / speedKmPerHour;
  const timeInMinutes = timeInHours * 60;
  
  return timeInMinutes;
}

/**
 * Formats the distance to a user-friendly string
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    // Convert to meters for distances less than 1 km
    const meters = Math.round(distance * 1000);
    return `${meters} m`;
  } else {
    // Round to 1 decimal place for kilometers
    return `${distance.toFixed(1)} km`;
  }
}

/**
 * Formats the time to a user-friendly string
 * @param timeInMinutes Time in minutes
 * @returns Formatted time string
 */
export function formatTime(timeInMinutes: number): string {
  if (timeInMinutes < 60) {
    // Round to nearest minute for times less than 1 hour
    return `${Math.round(timeInMinutes)} min`;
  } else {
    // Format as hours and minutes for longer durations
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = Math.round(timeInMinutes % 60);
    
    if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} min`;
    }
  }
}
