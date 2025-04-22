import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { formatDistance, formatTime } from '@/lib/utils';

interface TripInformationProps {
  estimatedDistance: number | null;
  estimatedTime: number | null;
  isAlarmSet: boolean;
  onAlarmToggle: (isSet: boolean) => void;
}

const TripInformation = ({ 
  estimatedDistance, 
  estimatedTime, 
  isAlarmSet,
  onAlarmToggle
}: TripInformationProps) => {
  // Format displayed values
  const displayDistance = estimatedDistance 
    ? formatDistance(estimatedDistance)
    : '-- km';
    
  const displayTime = estimatedTime 
    ? formatTime(estimatedTime)
    : '-- mins';
  
  // Handle alarm toggle
  const handleAlarmToggle = () => {
    onAlarmToggle(!isAlarmSet);
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 my-4 transition-all duration-300 shadow-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <h3 className="text-white/80 text-sm">Distance</h3>
          <p className="text-white text-xl font-medium">{displayDistance}</p>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-white/80 text-sm">Est. Time</h3>
          <p className="text-white text-xl font-medium">{displayTime}</p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white text-sm">Arrival Alert</h3>
            <p className="text-white/70 text-xs">Notify when approaching destination</p>
          </div>
          <Switch 
            checked={isAlarmSet} 
            onCheckedChange={handleAlarmToggle}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default TripInformation;
