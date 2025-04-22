import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/hooks/use-toast';

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
          // Don't set a user location if geolocation fails
          // Just keep the default map view
          map.setView(map.getCenter(), 13);
          // Show an error toast or notification to the user
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [map, setUserLocation]);

  return null;
};

// MapClickHandler component to handle map clicks
const MapClickHandler: React.FC = () => {
  const map = useMap();
  const { setDestination } = useLocation();
  const { toast } = useToast();
  const [clickLocation, setClickLocation] = useState<L.LatLng | null>(null);
  
  // Create a ripple effect at click location
  useEffect(() => {
    if (clickLocation) {
      // Add a temporary circle to show where the user clicked
      const circle = L.circle(clickLocation, {
        radius: 5,
        color: '#fff',
        fillColor: '#3498db',
        fillOpacity: 1,
        weight: 2,
        opacity: 0.7
      }).addTo(map);
      
      // Animate the circle expanding and fading out
      let radius = 5;
      let opacity = 0.7;
      
      const animationInterval = setInterval(() => {
        radius += 5;
        opacity -= 0.03;
        
        if (opacity <= 0) {
          clearInterval(animationInterval);
          map.removeLayer(circle);
          return;
        }
        
        circle.setRadius(radius);
        circle.setStyle({ opacity, fillOpacity: opacity });
      }, 20);
      
      // Clean up
      return () => {
        clearInterval(animationInterval);
        if (map.hasLayer(circle)) {
          map.removeLayer(circle);
        }
      };
    }
  }, [clickLocation, map]);
  
  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Set the click location for the ripple effect
      setClickLocation(new L.LatLng(lat, lng));
      
      // Show loading toast
      toast({
        title: "Setting destination...",
        description: "Finding location details",
        duration: 3000
      });
      
      // Reverse geocode to get location info
      fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const location = data.features[0].properties;
            const locationName = location.name || location.formatted.split(',')[0] || 'Selected Location';
            setDestination(
              new LatLng(lat, lng),
              { 
                name: locationName,
                address: location.formatted || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
              }
            );
            
            // Show success toast
            toast({
              title: "Destination set",
              description: `Location: ${locationName}`,
              duration: 3000
            });
          } else {
            // If reverse geocoding fails, use coordinates as name
            setDestination(
              new LatLng(lat, lng),
              { 
                name: 'Selected Location',
                address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
              }
            );
            
            // Show success toast
            toast({
              title: "Destination set",
              description: "Location set to selected point",
              duration: 3000
            });
          }
        })
        .catch(error => {
          console.error('Error reverse geocoding:', error);
          // If API call fails, still set the destination with basic info
          setDestination(
            new LatLng(lat, lng),
            { 
              name: 'Selected Location',
              address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
            }
          );
          
          // Show feedback
          toast({
            title: "Destination set",
            description: "Couldn't get location info, using coordinates only",
            duration: 3000
          });
        });
    };
    
    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, setDestination, toast]);
  
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

export interface MapProps {
  ref?: React.Ref<{ zoomIn: () => void; zoomOut: () => void; centerOnUser: () => void; }>;
}

const Map = forwardRef<{ zoomIn: () => void; zoomOut: () => void; centerOnUser: () => void; }, MapProps>((props, ref) => {
  const { userLocation, destinationLocation, destinationInfo } = useLocation();
  const mapControlsRef = useRef<{ zoomIn: () => void; zoomOut: () => void; centerOnUser: () => void; } | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  
  // Forward methods to parent component
  useImperativeHandle(ref, () => ({
    zoomIn: () => mapControlsRef.current?.zoomIn(),
    zoomOut: () => mapControlsRef.current?.zoomOut(),
    centerOnUser: () => mapControlsRef.current?.centerOnUser()
  }));

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
        <MapClickHandler />
        
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
});

export default Map;