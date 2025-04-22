import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AppInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AppInfoModal = ({ isVisible, onClose }: AppInfoModalProps) => {
  // Close when clicking outside of modal content
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOutsideClick}
        >
          <motion.div 
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-lg"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="px-6 py-4 flex justify-between items-center border-b border-white/10">
              <h2 className="text-white text-xl font-medium">About Location Tracker</h2>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full"
                onClick={onClose}
              >
                <i className="ri-close-line"></i>
              </Button>
            </div>
            
            <div className="p-6">
              <p className="text-white/90 mb-4">
                Location Tracker helps you set destination alarms that notify you when you're approaching your target location.
              </p>
              
              <h3 className="text-white font-medium mb-2">How to use:</h3>
              <ul className="text-white/90 space-y-2 mb-4">
                <li className="flex items-start">
                  <i className="ri-search-line mt-1 mr-2 text-blue-400"></i>
                  <span>Search for a destination or tap on the map</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-alarm-line mt-1 mr-2 text-blue-400"></i>
                  <span>Set the alarm to be notified on approach</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-notification-3-line mt-1 mr-2 text-blue-400"></i>
                  <span>Receive alerts 30 minutes before and upon arrival</span>
                </li>
              </ul>
              
              <p className="text-white/70 text-sm">Version 1.0.0</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppInfoModal;
