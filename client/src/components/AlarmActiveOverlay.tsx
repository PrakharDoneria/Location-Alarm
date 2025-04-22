import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AlarmActiveOverlayProps {
  isVisible: boolean;
  remainingTime: string;
  onStopAlarm: () => void;
}

const AlarmActiveOverlay = ({ 
  isVisible, 
  remainingTime, 
  onStopAlarm 
}: AlarmActiveOverlayProps) => {
  // Play alert sound when alarm becomes visible
  const playAlertSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
      audio.play().catch(err => console.error('Error playing sound:', err));
      
      // Vibration API if available
      if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300]);
      }
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  };
  
  // React to visibility changes
  if (isVisible) {
    playAlertSound();
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 bg-indigo-900/90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl max-w-md w-full mx-4 shadow-lg">
            <motion.div 
              className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <i className="ri-alarm-warning-line text-white text-4xl"></i>
            </motion.div>
            
            <h2 className="text-white text-2xl font-semibold mb-2">Approaching Destination!</h2>
            <p className="text-white/90 mb-6">
              You're getting close to your destination. Estimated arrival in <span>{remainingTime || '5 minutes'}</span>.
            </p>
            
            <div className="flex justify-center">
              <Button 
                className="bg-white text-indigo-900 hover:bg-gray-100 px-6 py-6 text-lg font-medium"
                onClick={onStopAlarm}
              >
                <i className="ri-stop-circle-line mr-2"></i> Stop Alarm
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlarmActiveOverlay;
