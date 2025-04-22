import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { LatLng } from 'leaflet';
import { calculateDistance, calculateEstimatedTime, showNotification } from '@/lib/locationUtils';
import { useToast } from '@/hooks/use-toast';

export interface LocationResult {
  name: string;
  address: string;
  formatted?: string;
  lat: number;
  lon: number;
}

interface LocationContextType {
  userLocation: LatLng | null;
  destinationLocation: LatLng | null;
  destinationInfo: {
    name: string;
    address: string;
  } | null;
  searchQuery: string;
  searchResults: LocationResult[];
  isSearching: boolean;
  estimatedDistance: number | null;
  estimatedTime: number | null;
  alarmSet: boolean;
  alarmTriggered: boolean;
  earlyWarningTriggered: boolean;
  setUserLocation: (location: LatLng) => void;
  setDestination: (location: LatLng, info: { name: string; address: string }) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: LocationResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setAlarm: (active: boolean) => void;
  stopAlarm: () => void;
  triggerAlarm: (isEarlyWarning?: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LatLng | null>(null);
  const [destinationInfo, setDestinationInfo] = useState<{ name: string; address: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [alarmSet, setAlarmSet] = useState<boolean>(false);
  const [alarmTriggered, setAlarmTriggered] = useState<boolean>(false);
  const [earlyWarningTriggered, setEarlyWarningTriggered] = useState<boolean>(false);
  const [locationCheckInterval, setLocationCheckInterval] = useState<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Set destination and update distance/time estimates
  const handleSetDestination = (location: LatLng, info: { name: string; address: string }) => {
    setDestinationLocation(location);
    setDestinationInfo(info);
    
    // Calculate distance and time if user location is available
    if (userLocation) {
      const distance = calculateDistance(userLocation, location);
      const time = calculateEstimatedTime(distance);
      setEstimatedDistance(distance);
      setEstimatedTime(time);
    }
  };

  // Update distance and time when user or destination location changes
  useEffect(() => {
    if (userLocation && destinationLocation) {
      const distance = calculateDistance(userLocation, destinationLocation);
      const time = calculateEstimatedTime(distance);
      setEstimatedDistance(distance);
      setEstimatedTime(time);
    } else {
      setEstimatedDistance(null);
      setEstimatedTime(null);
    }
  }, [userLocation, destinationLocation]);

  // Handle alarm activation/deactivation
  const handleSetAlarm = (active: boolean) => {
    setAlarmSet(active);
    
    if (active && destinationInfo) {
      toast({
        title: "Alarm Set",
        description: `You'll be notified when approaching ${destinationInfo.name}`,
      });
    } else if (!active) {
      setAlarmTriggered(false);
      setEarlyWarningTriggered(false);
      
      if (destinationInfo) {
        toast({
          title: "Alarm Canceled",
          description: `Alarm for ${destinationInfo.name} has been turned off`,
        });
      }
    }
  };

  // Stop the active alarm
  const handleStopAlarm = () => {
    setAlarmTriggered(false);
    setEarlyWarningTriggered(false);
  };

  // Trigger the alarm (normal or early warning)
  const handleTriggerAlarm = (isEarlyWarning: boolean = false) => {
    if (isEarlyWarning) {
      setEarlyWarningTriggered(true);
      if (destinationInfo) {
        showNotification(
          "Approaching Destination", 
          `You are getting close to ${destinationInfo.name}. Approximately ${estimatedTime} minutes away.`
        );
      }
    } else {
      setAlarmTriggered(true);
      if (destinationInfo) {
        showNotification(
          "Destination Reached", 
          `You have arrived at ${destinationInfo.name}`
        );
      }
    }
  };

  // Monitor location and trigger alarm when conditions are met
  useEffect(() => {
    if (alarmSet && userLocation && destinationLocation) {
      // Start interval to check distance
      const intervalId = setInterval(() => {
        const distance = calculateDistance(userLocation, destinationLocation);
        const timeInMinutes = calculateEstimatedTime(distance);
        
        // Trigger early warning at approximately 30min away (using 15km with 30km/h speed as example)
        if (!earlyWarningTriggered && distance <= 15 && distance > 0.5) {
          handleTriggerAlarm(true);
        }
        
        // Trigger arrival alarm when within 500 meters
        if (!alarmTriggered && distance <= 0.5) {
          handleTriggerAlarm();
          setAlarmSet(false); // Turn off alarm after triggered
        }
      }, 10000); // Check every 10 seconds
      
      setLocationCheckInterval(intervalId);
      
      return () => {
        clearInterval(intervalId);
        setLocationCheckInterval(null);
      };
    } else if (locationCheckInterval) {
      clearInterval(locationCheckInterval);
      setLocationCheckInterval(null);
    }
  }, [alarmSet, userLocation, destinationLocation]);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        destinationLocation,
        destinationInfo,
        searchQuery,
        searchResults,
        isSearching,
        estimatedDistance,
        estimatedTime,
        alarmSet,
        alarmTriggered,
        earlyWarningTriggered,
        setUserLocation,
        setDestination: handleSetDestination,
        setSearchQuery,
        setSearchResults,
        setIsSearching,
        setAlarm: handleSetAlarm,
        stopAlarm: handleStopAlarm,
        triggerAlarm: handleTriggerAlarm,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};