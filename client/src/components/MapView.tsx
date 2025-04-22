import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoLocation, Destination } from '@/types/location';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  userLocation: GeoLocation | null;
  destination: Destination | null;
  onMapClick?: (location: GeoLocation) => void;
  className?: string;
}

const MapView = ({ userLocation, destination, onMapClick, className = 'h-screen w-full' }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  
  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) {
      // Create a custom icon for user location
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `<div class="h-4 w-4 rounded-full bg-blue-500 border-2 border-white pulse"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      // Create a custom icon for destination
      const destinationIcon = L.divIcon({
        className: 'custom-destination-marker',
        html: `<div class="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
               </div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

      // Initialize the map with a dark theme
      const map = L.map('map', {
        center: userLocation 
          ? [userLocation.latitude, userLocation.longitude] 
          : [40.7128, -74.0060], // Default to New York if no location
        zoom: 15,
        zoomControl: false, // We'll add custom zoom controls
        attributionControl: false
      });

      // Add a dark theme tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add attribution in the bottom right
      L.control.attribution({
        position: 'bottomright'
      }).addTo(map);

      // Set up the click handler
      if (onMapClick) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onMapClick({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          });
        });
      }

      // Store the map reference
      mapRef.current = map;
      setIsMapInitialized(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapInitialized(false);
      }
    };
  }, []);

  // Update user marker when location changes
  useEffect(() => {
    if (!mapRef.current || !isMapInitialized || !userLocation) return;

    const map = mapRef.current;
    const userLatLng = L.latLng(userLocation.latitude, userLocation.longitude);

    // Create a custom icon for user location
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div class="h-4 w-4 rounded-full bg-blue-500 border-2 border-white pulse"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Update or create the user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLatLng);
    } else {
      userMarkerRef.current = L.marker(userLatLng, { icon: userIcon }).addTo(map);
    }

    // Center map on user if no destination is set
    if (!destination) {
      map.setView(userLatLng, map.getZoom());
    }

    // Update the route if destination exists
    if (destination) {
      updateRoute();
    }
  }, [userLocation, isMapInitialized]);

  // Update destination marker when destination changes
  useEffect(() => {
    if (!mapRef.current || !isMapInitialized) return;
    
    const map = mapRef.current;

    // Remove old destination marker if it exists
    if (destinationMarkerRef.current) {
      map.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }

    // Remove old route if it exists
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Add new destination marker if destination exists
    if (destination) {
      const destLatLng = L.latLng(destination.latitude, destination.longitude);
      
      // Create a custom icon for destination
      const destinationIcon = L.divIcon({
        className: 'custom-destination-marker',
        html: `<div class="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <div class="text-xs font-semibold bg-yellow-500 text-neutral-800 px-2 py-1 rounded mt-1">${destination.name}</div>
               </div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

      destinationMarkerRef.current = L.marker(destLatLng, { icon: destinationIcon }).addTo(map);
      
      // Fit both markers in view
      if (userLocation) {
        const bounds = L.latLngBounds(
          L.latLng(userLocation.latitude, userLocation.longitude),
          destLatLng
        ).pad(0.3); // Add some padding
        map.fitBounds(bounds);
        
        // Update the route
        updateRoute();
      } else {
        // If no user location, just center on destination
        map.setView(destLatLng, 15);
      }
    }
  }, [destination, isMapInitialized]);

  // Function to update the route between user and destination
  const updateRoute = () => {
    if (!mapRef.current || !userLocation || !destination) return;
    
    const map = mapRef.current;
    
    // Remove old route if it exists
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }
    
    // Create a simple straight line route
    const userLatLng = L.latLng(userLocation.latitude, userLocation.longitude);
    const destLatLng = L.latLng(destination.latitude, destination.longitude);
    
    routeLayerRef.current = L.polyline(
      [userLatLng, destLatLng],
      { 
        color: '#03A9F4', 
        weight: 4, 
        opacity: 0.7,
        dashArray: '10, 10',
        lineCap: 'round'
      }
    ).addTo(map);
  };

  // Methods to expose for external controls
  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const centerOnUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView(
        L.latLng(userLocation.latitude, userLocation.longitude),
        16
      );
    }
  };

  // Expose methods to parent
  useEffect(() => {
    // @ts-ignore - Attaching methods to the element for external access
    document.getElementById('map').zoomIn = zoomIn;
    // @ts-ignore
    document.getElementById('map').zoomOut = zoomOut;
    // @ts-ignore
    document.getElementById('map').centerOnUser = centerOnUser;
  }, [isMapInitialized, userLocation]);

  return (
    <div id="map" className={className}></div>
  );
};

export default MapView;
