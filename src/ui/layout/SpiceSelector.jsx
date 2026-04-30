import React from 'react';
import { motion } from 'framer-motion';

// --- NEW TACTICAL SPICE CLASSIFICATIONS ---
const SPICE_LEVELS = [
  { id: 'spy', label: 'Spy', color: 'bg-green-500', desc: 'Mild tactical engagement. Safe for all.' },
  { id: 'spy-c', label: 'Spy C', color: 'bg-yellow-500', desc: 'Moderate heat. Standard issue.' },
  { id: 'spycy', label: 'Spycy', color: 'bg-red-500', desc: 'Aggressive thermal payload.' },
  { id: 'spycyyy', label: 'Spycyyy', color: 'bg-red-900', desc: 'Extreme danger. Proceed with caution.' }
];

export default function SpiceSelector({ recipeData, onSelectSpice, onBack }) {
  if (!recipeData) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="min-h-screen p-4 md:p-8 font-sans text-black flex flex-col items-center justify-center relative w-full">
      <div className="w-full max-w-2xl bg-[#fcfbf9] border-4 border-black p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10 flex flex-col">
        
        <button onClick={onBack} className="text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors self-start mb-6">
          ← ABORT
        </button>
        
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-2">CALIBRATE PAYLOAD</h2>
        <p className="text-sm md:text-base font-bold text-gray-500 uppercase tracking-widest mb-8">Select heat intensity for: <span className="text-black">{recipeData.title}</span></p>
        
        <div className="flex flex-col gap-4">
          {SPICE_LEVELS.map(level => (
            <motion.button 
              key={level.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectSpice(level.id)}
              className="flex items-center w-full border-4 border-black group overflow-hidden bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-left"
            >
              <div className={`w-20 md:w-28 h-full flex items-center justify-center p-4 ${level.color} border-r-4 border-black text-white shrink-0`}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                  <path d="M17.66 11.2C17.66 14.86 14.7 17.82 11.04 17.82C7.38001 17.82 4.42001 14.86 4.42001 11.2C4.42001 8.84 5.61001 6.74 7.42001 5.53C7.42001 5.53 7.55001 5.45 7.64001 5.37C7.72001 5.28 7.77001 5.16 7.78001 5.04C7.79001 4.92 7.75001 4.8 7.68001 4.7C7.61001 4.6 7.50001 4.54 7.39001 4.52C6.96001 4.47 6.55001 4.46 6.13001 4.48C7.14001 2.37 9.38001 1 11.89 1C15.93 1 19.34 4.09 19.68 8.04C20.65 9.07 21.25 10.45 21.25 11.97C21.25 15.11 18.7 17.65 15.56 17.65C14.79 17.65 14.06 17.5 13.39 17.22C15.89 16.32 17.66 13.96 17.66 11.2Z" />
                </svg>
              </div>
              <div className="flex flex-col p-4">
                <span className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-none mb-1 group-hover:text-red-600 transition-colors">{level.label}</span>
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">{level.desc}</span>
              </div>
            </motion.button>
          ))}
        </div>

      </div>
    </motion.div>
  );
}