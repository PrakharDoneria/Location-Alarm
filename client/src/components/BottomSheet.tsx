import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatDistance, formatTime } from '@/lib/locationUtils';
import { useLocation } from '@/contexts/LocationContext';

interface BottomSheetProps {
  className?: string;
}

const BottomSheet = ({ className }: BottomSheetProps) => {
  const { 
    destinationInfo, 
    destinationLocation,
    estimatedDistance,
    estimatedTime,
    alarmSet,
    setAlarm
  } = useLocation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  // Show bottom sheet when destination is set
  useEffect(() => {
    if (destinationInfo) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setIsExpanded(false);
    }
  }, [destinationInfo]);

  // Toggle bottom sheet expansion
  const toggleBottomSheet = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Toggle alarm
  const handleToggleAlarm = () => {
    setAlarm(!alarmSet);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      ref={bottomSheetRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-t-xl z-30 transform transition-transform duration-300 pb-safe",
        className,
        {
          "translate-y-full": !isVisible,
          "h-[85vh]": isExpanded
        }
      )}
    >
      {/* Handle for expanding/collapsing */}
      <div 
        className="flex justify-center py-2 cursor-pointer" 
        onClick={toggleBottomSheet}
      >
        <div className="w-10 h-1 bg-neutral-300 rounded-full"></div>
      </div>
      
      {/* Minimized Content */}
      {!isExpanded && (
        <div className="px-4 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFC107"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-3"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div>
              <div className="font-medium">{destinationInfo?.name}</div>
              <div className="text-xs text-neutral-300">{destinationInfo?.address}</div>
            </div>
          </div>
          <button 
            type="button" 
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm",
              {
                "bg-yellow-500 text-neutral-800": !alarmSet,
                "bg-red-500 text-white": alarmSet
              }
            )}
            onClick={handleToggleAlarm}
          >
            {alarmSet ? 'Cancel Alarm' : 'Set Alarm'}
          </button>
        </div>
      )}
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-12 overflow-y-auto h-full">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1">{destinationInfo?.name}</h2>
            <p className="text-sm text-neutral-300">{destinationInfo?.address}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <div className="text-xs text-neutral-400 mb-1">Distance</div>
              <div className="flex items-end">
                <span className="text-xl font-bold">
                  {estimatedDistance ? formatDistance(estimatedDistance).split(' ')[0] : '-'}
                </span>
                <span className="text-sm ml-1 text-neutral-300">
                  {estimatedDistance ? formatDistance(estimatedDistance).split(' ')[1] : 'km'}
                </span>
              </div>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <div className="text-xs text-neutral-400 mb-1">Est. Time</div>
              <div className="flex items-end">
                <span className="text-xl font-bold">
                  {estimatedTime ? Math.round(estimatedTime) : '-'}
                </span>
                <span className="text-sm ml-1 text-neutral-300">min</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium">Alarm Settings</div>
              <div className="relative inline-block w-12 h-6 transition rounded-full">
                <input 
                  type="checkbox" 
                  className={cn(
                    "appearance-none w-12 h-6 rounded-full outline-none transition focus:outline-none cursor-pointer",
                    alarmSet ? "bg-yellow-500" : "bg-neutral-700"
                  )}
                  checked={alarmSet}
                  onChange={handleToggleAlarm}
                />
                <span 
                  className={cn(
                    "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition transform",
                    alarmSet ? "translate-x-6" : ""
                  )}
                ></span>
              </div>
            </div>
            
            <div className="bg-neutral-800/50 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFC107"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span className="text-sm">Early Notification</span>
                </div>
                <span className="text-sm font-medium">30 min before</span>
              </div>
            </div>
            
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFC107"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                  <span className="text-sm">Arrival Radius</span>
                </div>
                <span className="text-sm font-medium">500 m</span>
              </div>
            </div>
          </div>
          
          <button 
            type="button" 
            className={cn(
              "w-full p-3 rounded-lg font-medium",
              {
                "bg-yellow-500 text-neutral-800": !alarmSet,
                "bg-red-500 text-white": alarmSet
              }
            )}
            onClick={handleToggleAlarm}
          >
            {alarmSet ? 'Cancel Alarm' : 'Set Alarm'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BottomSheet;