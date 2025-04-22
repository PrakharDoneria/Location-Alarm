import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { GeoLocation } from '@/types/location';

interface GeolocationHook {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
  getLocation: () => Promise<GeoLocation | null>;
  watchLocation: () => void;
  stopWatching: () => void;
}

export function useGeolocation(): GeolocationHook {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const handleLocationError = (error: GeolocationPositionError) => {
    let errorMessage = 'Unknown error occurred';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'User denied the request for geolocation';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'The request to get user location timed out';
        break;
    }
    
    setError(errorMessage);
    setLoading(false);
    toast({
      title: "Location Error",
      description: errorMessage,
      variant: "destructive"
    });
  };

  const handleLocationSuccess = (position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
    setError(null);
    setLoading(false);
  };

  const getLocation = useCallback(async (): Promise<GeoLocation | null> => {
    if (!navigator.geolocation) {
      const errorMessage = 'Geolocation is not supported by this browser';
      setError(errorMessage);
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(newLocation);
          setError(null);
          setLoading(false);
          resolve(newLocation);
        },
        (error) => {
          handleLocationError(error);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }, []);

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    
    const id = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
    
    setWatchId(id);
  }, []);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    loading,
    getLocation,
    watchLocation,
    stopWatching
  };
}
