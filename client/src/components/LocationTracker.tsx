import { useState, useEffect } from 'react';
import AppHeader from './AppHeader';
import SearchBar from './SearchBar';
import MapContainer from './MapContainer';
import TripInformation from './TripInformation';
import BottomActionBar from './BottomActionBar';
import AlarmActiveOverlay from './AlarmActiveOverlay';
import AppInfoModal from './AppInfoModal';
import { requestNotificationPermission } from '@/lib/utils';

export interface LocationResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

const LocationTracker = () => {
  // State for location data
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationCoordinates | null>(null);
  const [destinationName, setDestinationName] = useState<string>('');
  
  // State for UI elements
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [isAlarmSet, setIsAlarmSet] = useState<boolean>(false);
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<string>('');
  
  // Location tracking interval
  useEffect(() => {
    // Request notification permission when component mounts
    requestNotificationPermission();
    
    // Start tracking user location
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location', error);
        // Fallback to default location (New York City)
        setUserLocation({ lat: 40.7128, lng: -74.0060 });
      },
      { 
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );
    
    // Clear watch when component unmounts
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);
  
  // Handle destination selection
  const handleDestinationSelect = (location: LocationResult) => {
    setDestinationLocation({ lat: location.lat, lng: location.lng });
    setDestinationName(location.name);
  };
  
  // Set destination from map click
  const handleMapClick = (coords: LocationCoordinates) => {
    setDestinationLocation(coords);
    setDestinationName('Selected Location');
  };
  
  // Set alarm
  const handleSetAlarm = () => {
    if (destinationLocation) {
      setIsAlarmSet(true);
    }
  };
  
  // Stop alarm
  const handleStopAlarm = () => {
    setIsAlarmActive(false);
    setIsAlarmSet(false);
  };
  
  // Clear destination
  const handleClearDestination = () => {
    setDestinationLocation(null);
    setDestinationName('');
    setEstimatedDistance(null);
    setEstimatedTime(null);
    setIsAlarmSet(false);
    setIsAlarmActive(false);
  };
  
  // Toggle info modal
  const toggleInfoModal = () => {
    setIsInfoModalOpen(!isInfoModalOpen);
  };
  
  return (
    <div className="bg-gradient-to-br from-primary to-secondary min-h-screen">
      <AppHeader onInfoClick={toggleInfoModal} />
      
      <main className="pt-16 pb-24 min-h-screen flex flex-col">
        <div className="container mx-auto px-4 flex flex-col h-full">
          <SearchBar onLocationSelect={handleDestinationSelect} />
          
          <MapContainer 
            userLocation={userLocation}
            destinationLocation={destinationLocation}
            onMapClick={handleMapClick}
            onDistanceUpdate={setEstimatedDistance}
            onTimeUpdate={setEstimatedTime}
          />
          
          <TripInformation 
            estimatedDistance={estimatedDistance}
            estimatedTime={estimatedTime}
            isAlarmSet={isAlarmSet}
            onAlarmToggle={setIsAlarmSet}
          />
        </div>
      </main>
      
      <BottomActionBar 
        isDestinationSet={!!destinationLocation}
        destinationName={destinationName}
        isAlarmSet={isAlarmSet}
        onSetAlarm={handleSetAlarm}
        onClearDestination={handleClearDestination}
      />
      
      <AlarmActiveOverlay 
        isVisible={isAlarmActive}
        remainingTime={remainingTime}
        onStopAlarm={handleStopAlarm}
      />
      
      <AppInfoModal 
        isVisible={isInfoModalOpen}
        onClose={toggleInfoModal}
      />
    </div>
  );
};

export default LocationTracker;
