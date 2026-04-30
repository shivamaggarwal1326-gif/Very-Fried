import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Provisions } from './AssetLibrary.jsx'; 

export const THEMES = {
  'commis': { id: 'commis', name: 'Paper White', bg: 'bg-[#fcfbf9]', grid: '#000', sketch: 'text-black', reqXP: 0 },
  'demi': { id: 'demi', name: 'Grey Ops', bg: 'bg-gray-200', grid: '#000', sketch: 'text-gray-500', reqXP: 500 },
  'cdp': { id: 'cdp', name: 'Midnight Blue', bg: 'bg-blue-50', grid: '#1e3a8a', sketch: 'text-blue-400', reqXP: 1500 },
  'sous': { id: 'sous', name: 'Royal Purple', bg: 'bg-[#fcfbf9]', grid: '#d8b4fe', sketch: 'text-purple-400', reqXP: 3000 },
  'head': { id: 'head', name: 'Gold Mosaic', bg: 'bg-amber-50', grid: '#b45309', sketch: 'text-amber-500', reqXP: 5000 },
  'ratatouille': { id: 'ratatouille', name: 'Crimson', bg: 'bg-red-50', grid: '#7f1d1d', sketch: 'text-red-400', reqXP: 10000 }
};

const FloatingSketch = ({ children, startX, delay, duration, rotate, size, sketchColorClass, isMirrored = false }) => {
  return (
    <motion.div
      className={`absolute ${size} opacity-[0.15] pointer-events-none z-0`}
      style={{ left: startX }} /* <--- THE CRITICAL FIX */
      initial={{ y: '120vh', rotate: 0 }}
      animate={{ y: '-20vh', rotate: rotate }}
      transition={{ duration: duration, repeat: Infinity, ease: "linear", delay: delay }}
    >
      <div className={`${sketchColorClass} w-full h-full drop-shadow-sm ${isMirrored ? '-scale-x-100' : ''}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default function KitchenCanvas({ children, activeTheme = 'commis' }) {
  const theme = THEMES[activeTheme] || THEMES['commis'];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`relative min-h-screen w-full ${theme.bg} overflow-hidden transition-colors duration-1000`}>
      
      <div 
        className="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000"
        style={{ 
          backgroundImage: `linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)`, 
          backgroundSize: '40px 40px' 
        }}
      ></div>

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* --- LEFT SIDE --- */}
        <FloatingSketch startX="5%" delay={0} duration={20} rotate={45} size="w-20 md:w-32 lg:w-40" sketchColorClass={theme.sketch}>
          <Provisions.Tomato />
        </FloatingSketch>
        <FloatingSketch startX="15%" delay={5} duration={24} rotate={25} size="w-24 md:w-32 lg:w-40" sketchColorClass={theme.sketch}>
          <Provisions.Pizza />
        </FloatingSketch>
        <FloatingSketch startX="10%" delay={15} duration={26} rotate={-30} size="w-16 md:w-24 lg:w-28" sketchColorClass={theme.sketch}>
          <Provisions.Eggshell />
        </FloatingSketch>

        {/* --- RIGHT SIDE --- */}
        <FloatingSketch startX="85%" delay={2} duration={20} rotate={-45} size="w-20 md:w-32 lg:w-40" sketchColorClass={theme.sketch} isMirrored={true}>
          <Provisions.Tomato />
        </FloatingSketch>
        <FloatingSketch startX="75%" delay={7} duration={24} rotate={-25} size="w-24 md:w-32 lg:w-40" sketchColorClass={theme.sketch} isMirrored={true}>
          <Provisions.Pizza />
        </FloatingSketch>
        <FloatingSketch startX="90%" delay={17} duration={26} rotate={30} size="w-16 md:w-24 lg:w-28" sketchColorClass={theme.sketch} isMirrored={true}>
          <Provisions.Eggshell />
        </FloatingSketch>

        {/* --- DESKTOP ONLY: Extra background depth --- */}
        {!isMobile && (
          <>
            <FloatingSketch startX="25%" delay={8} duration={22} rotate={15} size="w-20 md:w-28 lg:w-36" sketchColorClass={theme.sketch}>
              <Provisions.RedOnion />
            </FloatingSketch>
            <FloatingSketch startX="65%" delay={12} duration={28} rotate={-10} size="w-32 md:w-44 lg:w-56" sketchColorClass={theme.sketch} isMirrored={true}>
              <Provisions.Beetroot />
            </FloatingSketch>
          </>
        )}
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
      
    </div>
  );
}