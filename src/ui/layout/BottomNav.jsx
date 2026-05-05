import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NavButton = ({ label, subLabel, onClick, isActive, isDossier }) => {
  const activePattern = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIgLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiIC8+Cjwvc3ZnPg==')";
  const inactivePattern = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIgLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNykiIC8+Cjwvc3ZnPg==')";

  return (
    <button
      onClick={onClick}
      style={{ backgroundImage: isActive ? activePattern : inactivePattern }}
      className={`flex-1 flex flex-col items-center justify-center p-1.5 sm:p-2 md:p-4 relative transition-all group pointer-events-auto border-2 md:border-4 border-black ${
        isActive 
          ? 'bg-[#111] text-white translate-y-1 md:translate-y-2' 
          : 'bg-white text-black hover:bg-gray-100 shadow-[0px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[0px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 md:hover:translate-y-2 hover:shadow-none'
      }`}
    >
      {/* 
        The active red indicator line should show for the Kitchen/Field, 
        but we hide it for the Dossier so the styling remains distinct. 
      */}
      {isActive && !isDossier && (
        <div className="absolute bottom-0 left-0 w-full h-1 md:h-2 bg-red-600"></div>
      )}
      <span className="font-black uppercase tracking-widest text-[11px] sm:text-[13px] md:text-lg lg:text-xl z-10 drop-shadow-md whitespace-nowrap">
        {label}
      </span>
      <span className={`font-bold uppercase tracking-widest text-[8px] sm:text-[9px] md:text-xs lg:text-sm mt-0.5 z-10 ${isActive ? 'text-gray-400' : 'text-red-600 group-hover:text-red-700'}`}>
        {subLabel}
      </span>
    </button>
  );
};

export default function BottomNav({ currentView, setCurrentView, onOpenDossier, isDossierOpen }) {
  // --- NEW: State for the VeryFryd Bouncer Toast ---
  const [showBouncer, setShowBouncer] = useState(false);

  if (currentView === 'landing' || currentView === 'auth') return null;

  const isKitchenActive = ['kitchen', 'spice-select', 'prep', 'stages'].includes(currentView);

  // --- NEW: Custom handler that triggers the VeryFryd UI instead of a browser alert ---
  const handleFieldClick = () => {
    setShowBouncer(true);
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setShowBouncer(false);
    }, 3000);
  };

  return (
    <>
      {/* --- THE VERYFRYD BOUNCER TOAST --- */}
      <AnimatePresence>
        {showBouncer && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            className="fixed bottom-28 md:bottom-36 left-1/2 z-[9999] bg-[#fcfbf9] border-4 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-[90%] max-w-sm pointer-events-auto"
          >
            <button 
              onClick={() => setShowBouncer(false)} 
              className="absolute top-2 right-3 text-2xl font-black text-gray-400 hover:text-red-600 transition-colors leading-none"
            >
              ×
            </button>
            <div className="bg-red-600 text-white font-black text-[10px] md:text-xs uppercase tracking-widest px-2 py-1 inline-block mb-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Phase 2 Intel
            </div>
            <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter leading-tight text-black">
              Dine your Mood Soon :)
            </h3>
            <p className="font-bold text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-2">
              The Field is currently locked. Keep grinding in the Kitchen. 🐀
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ORIGINAL NAVBAR --- */}
      <div className="w-full bg-transparent z-[100] pointer-events-none px-2 sm:px-4 md:px-8 lg:px-12 pt-4 md:pt-6 pb-2 md:pb-4">
        <div className="max-w-[1440px] mx-auto flex h-14 sm:h-16 md:h-20 lg:h-24 gap-2 sm:gap-3 md:gap-8">
          <NavButton 
            label="Kitchen" 
            subLabel="Grind" 
            onClick={() => setCurrentView('kitchen')} 
            isActive={isKitchenActive && !isDossierOpen} 
          />
          <NavButton 
            label="Field" 
            subLabel="Heist" 
            onClick={handleFieldClick} 
            isActive={false} 
          />
          <NavButton 
            label="VF Tag" 
            subLabel="View ID" 
            onClick={onOpenDossier} 
            isActive={isDossierOpen} 
            isDossier={true}
          />
        </div>
      </div>
    </>
  );
}