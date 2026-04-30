import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- RANK INTEL DATABASE ---
const RANK_DATA = {
  'COMMIS CHEF': { xp: 500, coins: 10, box: '#d97706', wall: '#92400e' }, // Wood
  'DEMI CHEF DE PARTIE': { xp: 1500, coins: 20, box: '#6b7280', wall: '#374151' }, // Iron
  'CHEF DE PARTIE': { xp: 3000, coins: 30, box: '#3b82f6', wall: '#1d4ed8' }, // Blue
  'SOUS CHEF': { xp: 5000, coins: 40, box: '#a855f7', wall: '#7e22ce' }, // Purple
  'HEAD CHEF': { xp: 10000, coins: 50, box: '#facc15', wall: '#ca8a04' }, // Gold
  'RATATOUILLE': { xp: 20000, coins: 60, box: '#ef4444', wall: '#b91c1c' } // Red
};

// --- CSS PHYSICS ENGINE ---
// Injected directly so it never crashes the React compiler
const physicsStyles = `
  @keyframes shatterIn {
      0% { opacity: 0; transform: scale(0) translate3d(var(--startX), var(--startY), -500px) rotateZ(var(--startRot)) rotateX(90deg); filter: blur(10px); }
      50% { opacity: 1; transform: scale(1.3) translate3d(0, 0, 0) rotateZ(10deg) rotateX(0deg); filter: blur(0px); }
      75% { transform: scale(0.9) rotateZ(-5deg); }
      100% { opacity: 1; transform: scale(1) translate3d(0, 0, 0) rotateZ(0deg); filter: blur(0px); }
  }
  .shatter-wrapper {
      display: inline-block;
      opacity: 0;
      animation: shatterIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      animation-delay: var(--shatterDelay);
  }
  @keyframes gentleWave {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px) rotateZ(2deg); }
  }
  .wave-inner {
      display: inline-block;
      animation: gentleWave 2.5s ease-in-out infinite;
      animation-delay: var(--waveDelay);
  }
  @keyframes boxPop {
      0% { transform: scale(0) translateY(150px); }
      40% { transform: scale(1.1, 0.8) translateY(-30px); } 
      70% { transform: scale(0.95, 1.1) translateY(10px); } 
      100% { transform: scale(1, 1) translateY(0); } 
  }
  .isometric-box {
      animation: boxPop 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      animation-delay: 1.2s; 
      transform: scale(0);
  }
  @keyframes lidFly {
      0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
      100% { transform: translate(-60px, -100px) rotate(-45deg) scale(0.8); opacity: 0; }
  }
  .isometric-lid {
      animation: lidFly 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      animation-delay: 1.5s;
  }
  @keyframes fountainLeft {
      0% { opacity: 0; transform: scale(0) translate(0, 0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1.3) translate(-40px, -150px) rotate(-20deg); }
      100% { opacity: 1; transform: scale(1) translate(-80px, 10px) rotate(-45deg); }
  }
  @keyframes fountainRight {
      0% { opacity: 0; transform: scale(0) translate(0, 0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1.3) translate(40px, -130px) rotate(20deg); }
      100% { opacity: 1; transform: scale(1) translate(80px, 30px) rotate(45deg); }
  }
  .reward-xp { opacity: 0; animation: fountainLeft 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards; animation-delay: 1.6s; }
  .reward-coin { opacity: 0; animation: fountainRight 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards; animation-delay: 1.7s; }
`;

export default function LevelUpLab({ rankTitle = "RATATOUILLE", onClose }) {
  const [showSkip, setShowSkip] = useState(false);

  const safeRankTitle = rankTitle.toUpperCase();
  const rankStats = RANK_DATA[safeRankTitle] || RANK_DATA['RATATOUILLE'];

  const preText = "WHOAAA, YOU HAVE BEEN";
  const mainText = `PROMOTED TO ${safeRankTitle}`;

  const generateStyle = (wIdx, cIdx, lineOffset) => {
    const shatterDelay = (lineOffset * 0.4) + (wIdx * 0.1) + (cIdx * 0.03);
    const waveDelay = shatterDelay + 0.8 + (cIdx * 0.05);
    
    return {
      '--startX': (Math.random() * 300 - 150) + 'px',
      '--startY': (Math.random() * -300 - 50) + 'px',
      '--startRot': (Math.random() * 180 - 90) + 'deg',
      '--shatterDelay': shatterDelay + 's',
      '--waveDelay': waveDelay + 's'
    };
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#fcfbf9]/85 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
    >
      <style>{physicsStyles}</style>

      <div className="absolute top-10 w-full flex justify-center z-50">
          <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest border-b-2 border-red-600 pb-1 shadow-sm bg-white/50 px-2 rounded">
              Clearance Upgraded
          </p>
      </div>

      <div className="flex flex-col items-center justify-center pt-10 relative z-40">
        
        <div className="flex flex-col items-center justify-center mb-6 z-20">
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-2">
                {preText.split(" ").map((word, wIdx) => (
                    <div key={'pre-'+wIdx} className="flex">
                        {word.split("").map((char, cIdx) => (
                            <span key={cIdx} className="shatter-wrapper" style={generateStyle(wIdx, cIdx, 0)}>
                                <span className="wave-inner text-2xl md:text-3xl font-black uppercase text-gray-800 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                                    {char === "," ? ",\u00A0" : char}
                                </span>
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-5xl">
                {mainText.split(" ").map((word, wIdx) => (
                    <div key={'main-'+wIdx} className="flex">
                        {word.split("").map((char, cIdx) => (
                            <span key={cIdx} className="shatter-wrapper" style={generateStyle(wIdx, cIdx, 1)}>
                                <span className="wave-inner text-5xl md:text-7xl lg:text-8xl font-black uppercase text-black drop-shadow-[4px_4px_0px_rgba(220,38,38,1)]">
                                    {char}
                                </span>
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
        
        <div className="relative flex flex-col items-center justify-center h-48 w-full">
            
            <div className="isometric-box relative z-10">
                <svg width="200" height="150" viewBox="0 0 160 120" className="drop-shadow-2xl">
                    <polygon points="80,10 150,40 80,70 10,40" fill="#111" />
                    <polygon points="10,40 80,70 80,110 10,80" fill={rankStats.box} stroke="black" strokeWidth="3" />
                    <polygon points="80,70 150,40 150,80 80,110" fill={rankStats.wall} stroke="black" strokeWidth="3" />
                </svg>
            </div>

            <div className="absolute bottom-12 z-20 flex justify-center items-center font-mono font-black text-xs md:text-sm">
                <div className="reward-xp absolute bg-black text-white px-5 py-2.5 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] whitespace-nowrap">
                    +{rankStats.xp} XP
                </div>
                <div className="reward-coin absolute bg-yellow-500 text-black px-5 py-2.5 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
                    +{rankStats.coins} COINS
                </div>
            </div>

            <div className="isometric-lid absolute z-30 bottom-10">
                <svg width="200" height="100" viewBox="0 0 160 80">
                    <polygon points="80,10 150,40 80,70 10,40" fill={rankStats.box} stroke="black" strokeWidth="4" />
                    <polygon points="10,40 80,70 80,80 10,50" fill="#111" stroke="black" strokeWidth="2" />
                    <polygon points="80,70 150,40 150,50 80,80" fill="#111" stroke="black" strokeWidth="2" />
                </svg>
            </div>
        </div>
      </div>

      {/* CONTINUE / SKIP CONTROLS */}
      <div className="absolute bottom-10 w-full flex justify-center z-50">
        {showSkip ? (
            <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onClose && onClose(true)}
                className="bg-red-600 text-white px-8 py-4 font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-black transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
                Equip Theme
            </motion.button>
        ) : (
            <button 
                onClick={() => onClose && onClose(false)}
                className="text-[10px] md:text-xs text-gray-500 hover:text-black font-bold uppercase tracking-widest underline transition-colors mt-4"
            >
                Skip Animation
            </button>
        )}
      </div>
    </motion.div>
  );
}