import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationCoordinates } from './LocationTracker';
import { calculateDistance, calculateTime } from '@/lib/utils';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapContainerProps {
  userLocation: LocationCoordinates | null;
  destinationLocation: LocationCoordinates | null;
  onMapClick: (coords: LocationCoordinates) => void;
  onDistanceUpdate: (distance: number | null) => void;
  onTimeUpdate: (time: number | null) => void;
}

const MapContainer = ({ 
  userLocation, 
  destinationLocation, 
  onMapClick,
  onDistanceUpdate,
  onTimeUpdate
}: MapContainerProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Create custom icons
  const createUserIcon = () => {
    return L.divIcon({
      html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>`,
      className: 'custom-div-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };
  
  const createDestinationIcon = () => {
    return L.divIcon({
      html: `<div class="w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <i class="ri-map-pin-line text-white text-xs"></i>
             </div>`,
      className: 'custom-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };
  
  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Create map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([40.7128, -74.0060], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add click handler
    map.on('click', (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    
    mapRef.current = map;
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onMapClick]);
  
  // Update user marker when location changes
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    
    const userIcon = createUserIcon();
    
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapRef.current);
      
      // Center map on user location
      mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation]);
  
  // Update destination marker when destination changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (destinationMarkerRef.current && !destinationLocation) {
      mapRef.current.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
      return;
    }
    
    if (!destinationLocation) return;
    
    const destinationIcon = createDestinationIcon();
    
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setLatLng([destinationLocation.lat, destinationLocation.lng]);
    } else {
      destinationMarkerRef.current = L.marker(
        [destinationLocation.lat, destinationLocation.lng], 
        { icon: destinationIcon }
      ).addTo(mapRef.current);
    }
    
    // Fit map to show both markers
    if (userLocation) {
      const bounds = L.latLngBounds(
        [userLocation.lat, userLocation.lng],
        [destinationLocation.lat, destinationLocation.lng]
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [destinationLocation, userLocation]);
  
  // Calculate and update estimated distance and time
  useEffect(() => {
    if (!userLocation || !destinationLocation) {
      onDistanceUpdate(null);
      onTimeUpdate(null);
      return;
    }
    
    const distance = calculateDistance(
      userLocation.lat, userLocation.lng,
      destinationLocation.lat, destinationLocation.lng
    );
    
    const timeInMinutes = calculateTime(distance);
    
    onDistanceUpdate(distance);
    onTimeUpdate(timeInMinutes);
  }, [userLocation, destinationLocation, onDistanceUpdate, onTimeUpdate]);
  
  // Handle map control actions
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };
  
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };
  
  const handleRecenter = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
  };
  
  return (
    <div className="flex-grow my-4 relative z-10 min-h-[400px]">
      <div ref={mapContainerRef} className="h-full w-full rounded-2xl overflow-hidden shadow-lg" />
      
      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button 
          className="bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition shadow-lg border border-white/20"
          onClick={handleZoomIn}
        >
          <i className="ri-zoom-in-line"></i>
        </button>
        <button 
          className="bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition shadow-lg border border-white/20"
          onClick={handleZoomOut}
        >
          <i className="ri-zoom-out-line"></i>
        </button>
        <button 
          className="bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition shadow-lg border border-white/20"
          onClick={handleRecenter}
        >
          <i className="ri-focus-2-line"></i>
        </button>
      </div>
    </div>
  );
};

export default MapContainer;
