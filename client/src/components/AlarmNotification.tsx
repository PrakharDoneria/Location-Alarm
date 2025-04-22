import { cn } from '@/lib/utils';
import { Destination } from '@/types/location';
import { formatDistance } from '@/utils/distance';

interface AlarmNotificationProps {
  isVisible: boolean;
  destination: Destination | null;
  distance: number;
  isEarlyWarning: boolean;
  onStopAlarm: () => void;
  className?: string;
}

const AlarmNotification = ({ 
  isVisible, 
  destination, 
  distance, 
  isEarlyWarning, 
  onStopAlarm, 
  className 
}: AlarmNotificationProps) => {
  if (!isVisible || !destination) {
    return null;
  }

  const title = isEarlyWarning ? 'Approaching Destination' : 'You\'ve Arrived!';
  const subtitle = isEarlyWarning ? 
    'You will reach your destination soon' : 
    'You are near your destination';

  return (
    <div className={cn(
      "fixed inset-0 flex items-center justify-center z-50 bg-neutral-900/80 backdrop-blur-sm",
      className
    )}>
      <div className="bg-neutral-800 rounded-xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="bg-indigo-800 p-4 text-center">
          <div className="text-2xl mb-1 font-bold">{title}</div>
          <div className="text-sm opacity-80">{subtitle}</div>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-indigo-800/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3F51B5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="font-medium">{destination.name}</div>
              <div className="text-xs text-neutral-400">{destination.address}</div>
            </div>
          </div>
          <div className="mb-4 text-sm text-neutral-300">
            {isEarlyWarning ? (
              <>You are approximately <span className="font-bold text-yellow-500">{Math.round(distance * 1000)}m</span> from your destination.</>
            ) : (
              <>You are approximately <span className="font-bold text-yellow-500">{formatDistance(distance)}</span> from your destination.</>
            )}
          </div>
          <button 
            type="button" 
            className="w-full bg-yellow-500 text-neutral-800 p-3 rounded-lg font-medium"
            onClick={onStopAlarm}
          >
            Stop Alarm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlarmNotification;
