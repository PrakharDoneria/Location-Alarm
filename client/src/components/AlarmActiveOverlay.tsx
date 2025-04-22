import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4 pb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg p-4 max-w-md w-full"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="mr-3 relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500 opacity-50"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center relative z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
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
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Approaching Destination</h3>
                  <p className="text-blue-200 text-sm">Estimated arrival in {remainingTime}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-100 border-blue-300/50 hover:bg-blue-600"
                onClick={onStopAlarm}
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlarmActiveOverlay;