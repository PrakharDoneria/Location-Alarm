import React, { useEffect, useState, useRef } from 'react';
import Map from '@/components/Map';
import SearchBar from '@/components/SearchBar';
import BottomSheet from '@/components/BottomSheet';
import LocationControls from '@/components/LocationControls';
import AlarmModal from '@/components/AlarmModal';
import AlarmActiveOverlay from '@/components/AlarmActiveOverlay';
import InfoModal from '@/components/InfoModal';
import { useLocation } from '@/contexts/LocationContext';
import { requestPermissions, formatTime } from '@/lib/locationUtils';

const Home: React.FC = () => {
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const mapControlsRef = useRef<{ zoomIn: () => void; zoomOut: () => void; centerOnUser: () => void; } | null>(null);
  
  const { 
    alarmTriggered, 
    earlyWarningTriggered, 
    stopAlarm,
    estimatedTime
  } = useLocation();

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-neutral-900">
      {/* Map component (background) */}
      <Map />
      
      {/* Header with search bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Location Alarm</h1>
          </div>
          <div>
            <button
              type="button"
              className="p-2 rounded-full glassmorphism text-white flex items-center justify-center"
              onClick={() => setInfoModalOpen(true)}
            >
              <i className="fas fa-info"></i>
            </button>
          </div>
        </div>
        
        <div className="px-4 pb-2">
          <SearchBar />
        </div>
      </div>
      
      {/* Map Controls */}
      <LocationControls 
        onZoomIn={() => mapControlsRef.current?.zoomIn()}
        onZoomOut={() => mapControlsRef.current?.zoomOut()}
        onLocateUser={() => mapControlsRef.current?.centerOnUser()}
      />
      
      {/* Bottom sheet with destination details */}
      <BottomSheet />
      
      {/* Early warning notification */}
      <AlarmActiveOverlay 
        isVisible={earlyWarningTriggered && !alarmTriggered}
        remainingTime={estimatedTime ? formatTime(estimatedTime) : "a few minutes"}
        onStopAlarm={stopAlarm}
      />
      
      {/* Modals */}
      <InfoModal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)} />
      <AlarmModal isOpen={alarmTriggered} onClose={stopAlarm} />
    </div>
  );
};

export default Home;
