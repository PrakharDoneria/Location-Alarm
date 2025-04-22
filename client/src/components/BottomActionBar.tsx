import { Button } from '@/components/ui/button';

interface BottomActionBarProps {
  isDestinationSet: boolean;
  destinationName: string;
  isAlarmSet: boolean;
  onSetAlarm: () => void;
  onClearDestination: () => void;
}

const BottomActionBar = ({ 
  isDestinationSet, 
  destinationName, 
  isAlarmSet,
  onSetAlarm,
  onClearDestination
}: BottomActionBarProps) => {
  // Determine status text based on current state
  const getStatusText = () => {
    if (!isDestinationSet) {
      return 'No destination set';
    }
    
    if (isAlarmSet) {
      return 'Alarm set for destination';
    }
    
    return 'Destination set (alarm off)';
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-white text-sm">{getStatusText()}</p>
            {isDestinationSet && (
              <p className="text-white/70 text-xs">
                Destination: <span>{destinationName}</span>
              </p>
            )}
          </div>
          
          <div className="flex space-x-2">
            {isDestinationSet && (
              <Button
                variant="ghost"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={onClearDestination}
              >
                <i className="ri-close-line mr-1"></i> Clear
              </Button>
            )}
            
            <Button
              className={`bg-blue-600 text-white hover:bg-blue-700 ${!isDestinationSet ? 'cursor-not-allowed opacity-70' : isAlarmSet ? 'bg-green-600 hover:bg-green-700' : 'animate-pulse'}`}
              onClick={onSetAlarm}
              disabled={!isDestinationSet}
            >
              <i className={`ri-alarm-line mr-1 ${isAlarmSet ? 'ri-alarm-fill' : 'ri-alarm-line'}`}></i>
              {isAlarmSet ? 'Alarm Active' : 'Set Alarm'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;
