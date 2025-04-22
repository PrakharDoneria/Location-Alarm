import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlarmModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const AlarmModal = ({ isOpen, onClose }: AlarmModalProps) => {
  // Audio ref for alarm sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element for alarm sound
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
      audioRef.current.loop = true;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play/pause alarm sound based on isOpen state
  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Error playing alarm sound:', err);
      });
      
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate([500, 300, 500]);
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
      if (navigator.vibrate) {
        navigator.vibrate(0); // Stop vibration
      }
    }
  }, [isOpen]);

  // Stop alarm when clicking Stop button
  const handleStopAlarm = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-gradient-to-b from-indigo-900 to-blue-900 rounded-lg max-w-sm w-full p-6 shadow-lg border border-indigo-500/30"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-center text-white mb-2">
              Destination Reached!
            </h2>
            
            <p className="text-gray-300 text-center mb-6">
              You have arrived at your destination. The alarm has been triggered.
            </p>
            
            <div className="flex justify-center">
              <Button
                className={cn(
                  "bg-white text-indigo-900 hover:bg-gray-100 px-6 py-5 text-lg font-medium"
                )}
                onClick={handleStopAlarm}
              >
                Stop Alarm
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlarmModal;