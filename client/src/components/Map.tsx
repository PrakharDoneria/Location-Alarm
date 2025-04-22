import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import { useLocation } from '@/contexts/LocationContext';

// Fix Leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMzQjgyRjYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDljMCA1LjI1IDcgMTMgNyAxM3M3LTcuNzUgNy0xM2MwLTMuODctMy4xMy03LTctN3ptMCA5LjVjLTEuMzggMC0yLjUtMS4xMi0yLjUtMi41czEuMTItMi41IDIuNS0yLjUgMi41IDEuMTIgMi41IDIuNS0xLjEyIDIuNS0yLjUgMi41eiIgZmlsbD0iI0YyMkM1MiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Set default icon
L.Marker.prototype.options.icon = userIcon;

// Component to update map view when user location changes
const LocationUpdater: React.FC = () => {
  const { setUserLocation } = useLocation();
  const map = useMap();

  useEffect(() => {
    // Initialize user location tracking
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = new LatLng(latitude, longitude);
          setUserLocation(newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000,
        }
      );

      // Initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = new LatLng(latitude, longitude);
          setUserLocation(newLocation);
          map.setView(newLocation, 16);
        },
        (error) => {
          console.error('Error getting initial location:', error);
          // Default to a fallback location (New York City) if geolocation fails
          const fallbackLocation = new LatLng(40.7128, -74.0060);
          setUserLocation(fallbackLocation);
          map.setView(fallbackLocation, 13);
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [map, setUserLocation]);

  return null;
};

// MapControlsRef component to expose map methods
export const MapControlsRef = forwardRef<{ zoomIn: () => void; zoomOut: () => void; centerOnUser: () => void; }, {}>((_, ref) => {
  const map = useMap();
  const { userLocation } = useLocation();

  useImperativeHandle(ref, () => ({
    zoomIn: () => map.zoomIn(),
    zoomOut: () => map.zoomOut(),
    centerOnUser: () => {
      if (userLocation) {
        map.setView(userLocation, 16);
      }
    }
  }));

  return null;
});

const Map: React.FC = () => {
  const { userLocation, destinationLocation, destinationInfo } = useLocation();
  const mapControlsRef = useRef<{ zoomIn: () => void; zoomOut: () => void; centerOnUser: () => void; } | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  // Expose map controls to parent components
  useEffect(() => {
    (window as any).mapControls = mapControlsRef.current;
  }, [mapControlsRef]);

  return (
    <div className="map-container h-screen w-full absolute inset-0 z-0">
      <MapContainer
        center={[51.505, -0.09]} // Default center, will be updated by LocationUpdater
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        ref={setMap}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <LocationUpdater />
        <MapControlsRef ref={mapControlsRef} />
        
        {userLocation && (
          <Marker position={userLocation} icon={userIcon} />
        )}
        
        {destinationLocation && destinationInfo && (
          <Marker position={destinationLocation} icon={destinationIcon}>
            <Popup>
              <div>
                <strong>{destinationInfo.name}</strong>
                <div>{destinationInfo.address}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;