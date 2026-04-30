import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodyFaceWidget from './FoodyFaceWidget.jsx';

const RatChefSVG = () => (
  <svg viewBox="0 0 100 100" className="w-5 h-5 md:w-8 md:h-8 shrink-0 origin-bottom transform transition-transform group-hover:rotate-6 group-hover:scale-110">
    <path d="M 80 30 L 75 90 L 65 90 L 70 30 Z" fill="#d4a373" stroke="black" strokeWidth="3" strokeLinejoin="round" />
    <ellipse cx="75" cy="20" rx="10" ry="15" fill="#d4a373" stroke="black" strokeWidth="3" />
    <path d="M 30 90 L 60 90 L 55 60 L 35 60 Z" fill="#d1d5db" stroke="black" strokeWidth="3" />
    <path d="M 60 60 C 60 75, 15 75, 10 70 C 10 65, 30 50, 45 50 C 55 50, 60 55, 60 60 Z" fill="#d1d5db" stroke="black" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="55" cy="55" r="10" fill="#d1d5db" stroke="black" strokeWidth="3" />
    <circle cx="55" cy="55" r="5" fill="#fca5a5" />
    <circle cx="10" cy="70" r="4" fill="#fca5a5" stroke="black" strokeWidth="2" />
    <circle cx="35" cy="60" r="3" fill="black" />
    <circle cx="34" cy="59" r="1" fill="white" />
    <path d="M 20 70 L 5 75 M 20 72 L 5 80" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 35 50 L 30 25 C 20 15, 60 10, 60 25 L 55 50 Z" fill="#fcfbf9" stroke="black" strokeWidth="3" strokeLinejoin="round" />
    <path d="M 28 40 L 62 40" stroke="black" strokeWidth="3" strokeLinecap="round" />
    <circle cx="68" cy="65" r="5" fill="#d1d5db" stroke="black" strokeWidth="2" />
  </svg>
);

const DIET_FILTERS = ['ALL', 'VEG', 'NON-VEG', 'EGG'];
const CATEGORY_FILTERS = ['ALL', 'FAMILY FOOD', 'MUNCHIES', 'BAKERY', 'HEALTHY', 'SAUCES', 'SUMMER SPECIAL'];

const getHoverColorClass = (diet) => {
  if (diet === 'VEG') return 'group-hover:text-green-600';
  if (diet === 'EGG') return 'group-hover:text-yellow-500';
  return 'group-hover:text-red-600'; 
};

const getDynamicBadgeStyle = (diet) => {
  if (diet === 'VEG') return 'bg-green-600 text-white';
  if (diet === 'NON-VEG') return 'bg-red-600 text-white';
  if (diet === 'EGG') return 'bg-yellow-500 text-black';
  return 'bg-black text-white'; 
};

const MultiColorText = ({ text }) => {
  if (text === 'ALL') {
    return (
      <>
        <span className="text-green-600">A</span>
        <span className="text-red-600">L</span>
        <span className="text-yellow-500">L</span>
      </>
    );
  }

  const pattern = ['text-green-600', 'text-green-600', 'text-red-600', 'text-yellow-500'];
  let colorIndex = 0;

  return (
    <>
      {text.split('').map((char, i) => {
        if (char === ' ') return <span key={i}> </span>;
        const colorClass = pattern[colorIndex % pattern.length];
        colorIndex++;
        return <span key={i} className={colorClass}>{char}</span>;
      })}
    </>
  );
};

const getGridSpanClass = (index, total) => {
  let baseSpan = "col-span-12"; 
  let smSpan = "sm:col-span-6";
  if (total % 2 === 1 && index === total - 1) smSpan = "sm:col-span-12"; 
  let lgSpan = "lg:col-span-4";
  if (total % 3 === 1 && index === total - 1) lgSpan = "lg:col-span-12"; 
  else if (total % 3 === 2 && index >= total - 2) lgSpan = "lg:col-span-6"; 
  return `${baseSpan} ${smSpan} ${lgSpan}`;
};

export default function Dashboard({ availableDishes, onSelectRecipe, userXP, userCoins, rankIntel, activeRecipeId, isCooking, onToggleFoody }) {
  const [dietFilter, setDietFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showCoinSurprise, setShowCoinSurprise] = useState(false);

  const progressPercent = rankIntel.target === userXP ? 100 : (userXP / rankIntel.target) * 100;

  const filteredDishes = availableDishes.filter(dish => {
    return (dietFilter === 'ALL' || dish.diet === dietFilter) && (categoryFilter === 'ALL' || dish.category === categoryFilter);
  });

  const getActiveCategoryColor = () => {
    if (dietFilter === 'VEG') return 'text-green-600';
    if (dietFilter === 'EGG') return 'text-yellow-500';
    if (dietFilter === 'NON-VEG') return 'text-red-600';
    return 'multi'; 
  };

  const handleCoinInteraction = () => {
    if (showCoinSurprise) return;
    setShowCoinSurprise(true);
    setTimeout(() => setShowCoinSurprise(false), 4000);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 font-sans text-black flex flex-col items-center bg-transparent relative overflow-hidden w-full">
      <div className="w-full flex-grow flex flex-col relative z-10">
        
        <header className="border-b-4 border-black pb-4 mb-4 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 w-full">
          
          <div className="flex flex-col w-full md:flex-1 md:justify-end">
             <div className="flex items-center justify-between w-full md:justify-start gap-3 md:gap-6 flex-nowrap">
               <h1 
                 className="text-[34px] min-[375px]:text-[40px] sm:text-5xl md:text-6xl lg:text-8xl xl:text-[100px] font-black uppercase tracking-tighter leading-none shrink-0 select-none"
                 style={{
                  color: "#facc15", 
                  WebkitTextStroke: "1.5px #b91c1c", 
                  textShadow: "-1px -1px 0px #ef4444, 1px -1px 0px #ef4444, -1px 1px 0px #ef4444, 1px 1px 0px #ef4444, 0px 3px 0px #991b1b",
                  fontFamily: "'Courier New', Courier, monospace"
                 }}
               >
                 VeryFryd
               </h1>
               
               <div className="shrink-0 z-50 md:hidden">
                 <FoodyFaceWidget onClick={onToggleFoody} />
               </div>
             </div>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center shrink-0 z-50 md:pb-4 lg:pb-6">
             <FoodyFaceWidget onClick={onToggleFoody} />
          </div>

          {/* THE FIX: Flex-row on mobile puts Coins and Rank perfectly side-by-side */}
          <div className="flex flex-row md:flex-col gap-2 md:gap-3 w-full md:w-72 shrink-0 relative mt-1 md:mt-0">
            
            <AnimatePresence>
              {showCoinSurprise && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-[calc(100%+12px)] md:bottom-auto md:top-[calc(100%+12px)] right-0 w-[200px] md:w-[240px] bg-white border-4 border-black p-2 md:p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[60]"
                >
                  <div className="absolute -bottom-2.5 md:-bottom-auto md:-top-2.5 right-6 w-4 h-4 bg-white border-b-4 border-r-4 md:border-b-0 md:border-r-0 md:border-t-4 md:border-l-4 border-black transform rotate-45"></div>
                  <p className="font-black text-[9px] md:text-[10px] uppercase tracking-widest text-black leading-tight text-center md:text-left">
                    Stay curious,<br/>we got surprises. 🐀
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleCoinInteraction}
              className="flex-1 md:w-full group border-[3px] md:border-4 border-black bg-yellow-400 p-2 md:p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-1.5 md:gap-2">
                <RatChefSVG />
                <span className="font-black text-[9px] min-[375px]:text-[10px] md:text-xs uppercase tracking-widest text-black mt-0.5">Coins</span>
              </div>
              <span className="font-black text-[11px] min-[375px]:text-xs md:text-base text-black tabular-nums mt-0.5">{userCoins || 0} 🪙</span>
            </button>

            <div className="flex-1 md:w-full border-[3px] md:border-4 border-black bg-white p-2 md:p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center">
              <div className="flex justify-between items-baseline mb-1.5 md:mb-2 gap-1 md:gap-2">
                <span className={`text-[8px] min-[375px]:text-[9px] md:text-xs font-black uppercase tracking-tighter truncate ${rankIntel.color}`}>
                  <span className="hidden md:inline">Rank: </span>{rankIntel.title}
                </span>
                <span className="hidden min-[375px]:inline text-[8px] md:text-[11px] font-black text-gray-400 shrink-0 tabular-nums">
                  {userXP}/{rankIntel.target !== userXP ? rankIntel.target : 'MAX'}
                </span>
              </div>
              <div className="w-full h-2 md:h-3 bg-gray-200 border-2 border-black overflow-hidden relative">
                <motion.div className="h-full bg-black" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, ease: "easeOut" }} />
              </div>
            </div>

          </div>
        </header>

        <div className="w-full flex-grow flex flex-col pb-8">
          
          <div className="mb-6 md:mb-8 w-full">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black mb-4">Make Your Mood</h2>
            
            <div className="flex flex-wrap gap-x-6 md:gap-x-8 gap-y-3 md:gap-y-4 items-center">
              
              <div className="flex items-center gap-3 md:gap-4">
                <div className="text-[10px] md:text-sm font-black uppercase tracking-widest text-black border-r-2 md:border-r-4 border-black pr-3 md:pr-4 text-right">DIET</div>
                <div className="flex flex-wrap gap-3 md:gap-6">
                  {DIET_FILTERS.map(f => {
                    const dietColorClass = f === 'VEG' ? 'text-green-600' : f === 'EGG' ? 'text-yellow-500' : f === 'NON-VEG' ? 'text-red-600' : 'multi';
                    const isActive = dietFilter === f;
                    
                    return (
                      <button key={f} onClick={() => setDietFilter(f)} className={`relative group text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-200 origin-left whitespace-nowrap ${isActive ? 'scale-110' : ''}`}>
                        <span className={`block ${isActive ? 'opacity-0' : 'text-black group-hover:opacity-0 transition-opacity'}`}>{f}</span>
                        <span className={`absolute top-0 left-0 w-full h-full flex items-center ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'} ${dietColorClass !== 'multi' ? dietColorClass : ''}`}>
                          {dietColorClass === 'multi' ? <MultiColorText text={f} /> : f}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex items-center gap-3 md:gap-4 mt-1 md:mt-0">
                <div className="text-[10px] md:text-sm font-black uppercase tracking-widest text-black border-r-2 md:border-r-4 border-black pr-3 md:pr-4 text-right">CLASS</div>
                <div className="flex flex-wrap gap-3 md:gap-6">
                  {CATEGORY_FILTERS.map(f => {
                    const catColorClass = getActiveCategoryColor();
                    const isActive = categoryFilter === f;

                    return (
                      <button key={f} onClick={() => setCategoryFilter(f)} className={`relative group text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-200 origin-left whitespace-nowrap ${isActive ? 'scale-110' : ''}`}>
                        <span className={`block ${isActive ? 'opacity-0' : 'text-black group-hover:opacity-0 transition-opacity'}`}>{f}</span>
                        <span className={`absolute top-0 left-0 w-full h-full flex items-center ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'} ${catColorClass !== 'multi' ? catColorClass : ''}`}>
                          {catColorClass === 'multi' ? <MultiColorText text={f} /> : f}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-12 gap-5 md:gap-8 overflow-y-auto pr-1 md:pr-2 pb-4 w-full">
            <AnimatePresence>
              {filteredDishes.length > 0 ? (
                filteredDishes.map((dish, index) => {
                  const timeParts = dish.time.split(' ');
                  const timeNum = timeParts[0];
                  const timeUnit = timeParts[1] || 'MINS';
                  
                  const hoverColorClass = getHoverColorClass(dish.diet);
                  const badgeStyle = getDynamicBadgeStyle(dish.diet);
                  const isActiveCooking = isCooking && activeRecipeId === dish.id;

                  return (
                    <motion.div 
                      key={dish.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }} 
                      transition={{ duration: 0.2 }} 
                      whileHover={{ x: 4, y: -4, shadow: isActiveCooking ? "6px 6px 0px 0px rgba(220,38,38,1)" : "6px 6px 0px 0px rgba(0,0,0,1)" }} 
                      className={`${getGridSpanClass(index, filteredDishes.length)} border-[3px] md:border-4 border-black p-5 md:p-10 transition-all cursor-pointer group flex flex-col relative w-full ${isActiveCooking ? 'bg-red-50 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] md:shadow-[10px_10px_0px_0px_rgba(220,38,38,1)]' : 'bg-[#fcfbf9] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'}`} 
                      onClick={() => onSelectRecipe(dish.id)}
                    >
                      {isActiveCooking && (
                        <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-[10px] md:text-sm px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2 border-b-[3px] md:border-b-4 border-l-[3px] md:border-l-4 border-black translate-x-1 -translate-y-1 md:translate-x-2 md:-translate-y-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-20">
                           <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white animate-pulse"></span>
                           COOKING
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4 md:mb-6 gap-3 md:gap-4">
                        <div className="flex flex-wrap gap-2">
                          <span className={`${badgeStyle} font-black text-[9px] md:text-xs px-2.5 md:px-4 py-1.5 md:py-2 uppercase tracking-widest border-2 border-transparent`}>
                            {dish.category}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-end leading-none shrink-0 mt-[-5px]">
                          <span className={`text-gray-400 font-black uppercase text-4xl md:text-6xl tracking-tighter ${hoverColorClass} transition-colors`}>{timeNum}</span>
                          <span className="text-gray-400 font-black uppercase text-[9px] md:text-sm tracking-widest mt-1 md:mt-2">{timeUnit}</span>
                        </div>
                      </div>
                      
                      <h3 className={`text-2xl md:text-4xl font-black uppercase tracking-tight ${hoverColorClass} transition-colors leading-tight`}>{dish.title}</h3>
                      <p className="mt-2 md:mt-3 text-gray-500 font-bold uppercase text-[11px] md:text-base tracking-tight leading-snug">{dish.desc}</p>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-12 w-full p-8 md:p-12 border-4 border-dashed border-gray-300 text-center">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-lg md:text-2xl">NO DISHES FOUND FOR THIS LOADOUT.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </div>
  );
}