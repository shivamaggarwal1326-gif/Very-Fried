import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EquipmentIcon = ({ name }) => {
  const lowerName = name.toLowerCase();
  const baseClasses = "w-5 h-5 md:w-6 md:h-6 text-black drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]";
  
  if (lowerName.includes('knife')) return (
    <svg viewBox="0 0 100 100" className={baseClasses}>
      <motion.path d="M 20 80 L 40 60 L 80 20 C 90 10, 95 20, 85 30 L 35 85 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} />
      <motion.path d="M 20 80 L 10 90 M 40 60 L 25 75" stroke="currentColor" strokeWidth="6" strokeLinecap="square" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
    </svg>
  );

  if (lowerName.includes('pan') || lowerName.includes('skillet')) return (
    <svg viewBox="0 0 100 100" className={baseClasses}>
      <motion.ellipse cx="40" cy="50" rx="30" ry="15" fill="none" stroke="currentColor" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
      <motion.path d="M 15 50 C 15 70, 65 70, 65 50" fill="none" stroke="currentColor" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.2 }} />
      <motion.line x1="65" y1="50" x2="95" y2="35" stroke="currentColor" strokeWidth="6" strokeLinecap="square" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1 }} />
    </svg>
  );

  if (lowerName.includes('pot')) return (
    <svg viewBox="0 0 100 100" className={baseClasses}>
      <motion.path d="M 20 30 L 20 70 C 20 85, 80 85, 80 70 L 80 30 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
      <motion.ellipse cx="50" cy="30" rx="30" ry="10" fill="none" stroke="currentColor" strokeWidth="4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
      <motion.path d="M 20 45 C 10 45, 10 65, 20 65 M 80 45 C 90 45, 90 65, 80 65" fill="none" stroke="currentColor" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5 }} />
    </svg>
  );

  if (lowerName.includes('colander') || lowerName.includes('strainer')) return (
    <svg viewBox="0 0 100 100" className={baseClasses}>
      <motion.path d="M 15 40 C 15 80, 85 80, 85 40 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
      <motion.line x1="10" y1="40" x2="90" y2="40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} />
      {[...Array(5)].map((_, i) => <motion.circle key={i} cx={30 + (i * 10)} cy={55 + (i % 2 === 0 ? 5 : 0)} r="2" fill="currentColor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + (i * 0.1) }} />)}
    </svg>
  );

  return (
    <svg viewBox="0 0 100 100" className={baseClasses}>
      <motion.path d="M 30 30 Q 50 10, 70 30 Q 50 50, 30 30 Z" fill="none" stroke="currentColor" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
      <motion.line x1="35" y1="35" x2="15" y2="85" stroke="currentColor" strokeWidth="6" strokeLinecap="square" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} />
    </svg>
  );
};

const TacticalCheckbox = ({ label, icon }) => {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }} onClick={() => setIsChecked(!isChecked)} className={`p-2.5 md:p-3 border-2 border-black flex items-center gap-3 cursor-pointer transition-colors ${isChecked ? 'bg-gray-200 opacity-60' : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'}`}>
      <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-black shrink-0 flex items-center justify-center bg-[#fcfbf9] relative">
        {isChecked && (
          <motion.svg viewBox="0 0 100 100" className="absolute w-6 h-6 md:w-8 md:h-8 text-red-600 z-10">
             <motion.path d="M 20 50 L 40 70 L 80 20" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="square" strokeLinejoin="miter" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.2 }} />
          </motion.svg>
        )}
      </div>
      {icon && <div className="shrink-0">{icon}</div>}
      <span className={`text-xs md:text-sm font-bold uppercase tracking-tight leading-tight ${isChecked ? 'line-through decoration-red-600 decoration-2' : ''}`}>{label}</span>
    </motion.div>
  );
};

export default function PrepChecklist({ recipeData, onStartCooking, onBackToDashboard, isCooking }) {
  if (!recipeData) return null;
  
  // DEFENSIVE DESTRUCTURING
  const equipment = recipeData?.miseEnPlace?.equipment || recipeData?.equipment || [];
  const rawIngredients = recipeData?.miseEnPlace?.ingredients || recipeData?.ingredients || recipeData?.prep || {};

  // NORMALIZATION ENGINE
  let normalizedIngredients = {};
  if (Array.isArray(rawIngredients)) {
    normalizedIngredients = { "General Loadout": rawIngredients };
  } else {
    normalizedIngredients = rawIngredients;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="min-h-screen p-3 md:p-6 font-sans text-black flex flex-col items-center">
      <div className="w-full max-w-5xl h-full flex flex-col justify-center">
        
        <div className="border-b-2 md:border-b-4 border-black pb-3 mb-6 flex flex-col md:flex-row justify-between md:items-end gap-3">
          <div className="flex flex-col gap-3">
            <button 
              onClick={onBackToDashboard}
              className="text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors text-left self-start"
            >
              ← MAKE YOUR MOOD
            </button>
            <div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">Mise en Place</h1>
              <p className="text-[10px] md:text-sm font-bold mt-1 text-red-600 uppercase tracking-widest">Verify the loadout</p>
            </div>
          </div>
          <div className="bg-black text-[#fcfbf9] px-3 py-1.5 font-black uppercase text-[9px] md:text-xs border-2 border-black self-start md:self-auto">Prep Phase</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div>
            <h2 className="text-base md:text-xl font-black mb-3 border-b-2 border-black inline-block uppercase tracking-widest">The Arsenal</h2>
            <div className="flex flex-col gap-2">
              {equipment.length > 0 ? (
                equipment.map((item, idx) => <TacticalCheckbox key={`eq-${idx}`} label={item} icon={<EquipmentIcon name={item} />} />)
              ) : (
                <p className="text-xs font-bold text-gray-500 uppercase">No special equipment required.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-base md:text-xl font-black mb-3 border-b-2 border-black inline-block uppercase tracking-widest">Provisions</h2>
            {Object.keys(normalizedIngredients).length > 0 ? (
              Object.entries(normalizedIngredients).map(([station, items], sIdx) => (
                <div key={sIdx} className="mb-4 md:mb-5">
                  <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 border-l-2 border-red-600 pl-2">{station.replace('_', ' ')}</h3>
                  <div className="flex flex-col gap-2">
                    {Array.isArray(items) ? (
                      items.map((item, idx) => <TacticalCheckbox key={`${station}-${idx}`} label={item} />)
                    ) : (
                      <p className="text-xs font-bold text-gray-500 uppercase">Invalid ingredient structure.</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-bold text-gray-500 uppercase">No ingredients listed.</p>
            )}
          </div>
        </div>

        <div className="mt-8 mb-12 flex justify-center w-full">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onStartCooking} className="bg-red-600 text-[#fcfbf9] text-sm md:text-lg font-black uppercase px-8 py-3 md:py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all flex items-center gap-2 md:gap-3">
            {isCooking ? 'Return to Kitchen' : 'Enter Stage Manager'} <span className="text-xl">→</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}