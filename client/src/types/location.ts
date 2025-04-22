export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface LocationSearchResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  properties?: Record<string, any>;
}

export interface Destination {
  id?: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
}

export interface DistanceInfo {
  distance: number; // in kilometers
  estimatedTime: number; // in minutes
}