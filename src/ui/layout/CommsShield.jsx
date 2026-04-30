import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommsShield({ children }) {
  const [showPermissionOverlay, setShowPermissionOverlay] = useState(false);

  useEffect(() => {
    // Check if the user already dismissed this permanently
    const isDismissed = localStorage.getItem('vf_intel_dismissed');
    
    // Only ask for permission if it hasn't been granted, denied, or dismissed
    if (!isDismissed && "Notification" in window && Notification.permission === "default") {
      const timer = setTimeout(() => setShowPermissionOverlay(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("✅ COMMS ESTABLISHED", { body: "VeryFryd tactical alerts are now active." });
      }
    }
    setShowPermissionOverlay(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('vf_intel_dismissed', 'true'); // Remember dismissal forever
    setShowPermissionOverlay(false);
  };

  return (
    <>
      {children}

      <AnimatePresence>
        {showPermissionOverlay && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 50, opacity: 0 }} 
            className="fixed bottom-20 left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0 md:bottom-8 md:right-8 z-[100] w-[90%] md:w-80 bg-black border-4 border-red-600 p-4 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] text-[#fcfbf9]"
          >
            <h3 className="font-black uppercase text-base mb-1 text-red-500">ENABLE INTEL ALERTS</h3>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 mb-4 leading-tight">
              We need comms access to alert you when your burners hit zero. Enable cross-platform notifications.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={handleDismiss} 
                className="flex-1 bg-gray-800 text-white py-2 text-[10px] font-black uppercase border-2 border-transparent hover:border-white transition-colors"
              >
                Dismiss
              </button>
              <button 
                onClick={requestNotifications} 
                className="flex-1 bg-red-600 text-white py-2 text-[10px] font-black uppercase border-2 border-red-600 hover:bg-white hover:text-red-600 transition-colors"
              >
                Authorize
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}