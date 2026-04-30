import React from 'react';

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

export default function BottomNav({ currentView, setCurrentView, onOpenDossier }) {
  if (currentView === 'landing' || currentView === 'auth') return null;

  const isKitchenActive = ['kitchen', 'spice-select', 'prep', 'stages'].includes(currentView);

  return (
    <div className="w-full bg-transparent z-[100] pointer-events-none px-2 sm:px-4 md:px-8 lg:px-12 pt-4 md:pt-6 pb-2 md:pb-4">
      <div className="max-w-[1440px] mx-auto flex h-14 sm:h-16 md:h-20 lg:h-24 gap-2 sm:gap-3 md:gap-8">
        <NavButton 
          label="Kitchen" 
          subLabel="Grind" 
          onClick={() => setCurrentView('kitchen')} 
          isActive={isKitchenActive} 
        />
        <NavButton 
          label="Field" 
          subLabel="Heist" 
          onClick={() => setCurrentView('field')} 
          isActive={currentView === 'field'} 
        />
        <NavButton 
          label="VF Tag" 
          subLabel="View ID" 
          onClick={onOpenDossier} 
          isActive={false} 
          isDossier={true}
        />
      </div>
    </div>
  );
}