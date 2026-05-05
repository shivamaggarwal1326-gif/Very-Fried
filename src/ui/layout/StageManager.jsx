import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function StageManager({ 
  recipeData, 
  currentStageIndex, 
  setCurrentStageIndex, 
  onDishComplete, 
  onBackToDashboard, 
  onViewPrep, 
  onCancelDish 
}) {
  const stages = recipeData?.stages || [];
  const currentStage = stages[currentStageIndex];
  const isLastStage = currentStageIndex === stages.length - 1;

  // Safe fallback for nutrients if they don't exist in the DB
  const nutrients = recipeData?.nutrients || { calories: '--', protein: '--', carbs: '--', fats: '--' };

  // --- TIMER LOGIC ---
  const [timers, setTimers] = useState({});

  useEffect(() => {
    if (!currentStage) return;
    const initialTimers = {};
    currentStage.tasks?.forEach((task, idx) => {
      if (typeof task === 'object' && task.timer) {
        initialTimers[idx] = task.timer;
      }
    });
    setTimers(initialTimers);
  }, [currentStageIndex, currentStage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach(key => {
          if (next[key] > 0) {
            next[key] -= 1;
            updated = true;
          }
        });
        return updated ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleNext = () => {
    if (isLastStage) {
       const earnedXP = recipeData.xp || 150;
       const earnedCoins = 50; 
       onDishComplete(earnedXP, earnedCoins);
    } else {
       setCurrentStageIndex(prev => prev + 1);
    }
  };

  if (!currentStage) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-4 md:p-8 flex flex-col items-center w-full font-sans text-black pb-24 z-10 relative">
      <div className="w-full max-w-5xl flex flex-col gap-4 md:gap-6 mt-10 md:mt-20">
        
        {/* TOP NAVIGATION BARS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-3 gap-4">
          <div className="flex gap-4 items-center font-black text-[10px] md:text-xs uppercase tracking-widest">
            <button onClick={onBackToDashboard} className="hover:text-red-600 transition-colors">-- COOK YOUR MOOD</button>
            <span className="text-gray-300">|</span>
            <button onClick={onViewPrep} className="hover:text-red-600 transition-colors">PREP LIST</button>
            <span className="text-gray-300">|</span>
            <button onClick={onCancelDish} className="bg-red-600 text-white px-3 py-1 flex items-center gap-1.5 border-2 border-black hover:bg-white hover:text-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5">
              <span className="text-sm font-normal">&times;</span> CANCEL DISH
            </button>
          </div>
        </div>

        {/* HEADER: TITLE & NUTRITIONAL INTEL */}
        <div className="border-[3px] md:border-4 border-black p-4 md:p-6 bg-white flex flex-col md:flex-row justify-between md:items-end shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-1 md:mb-2">{recipeData?.title}</h1>
            <p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Operational Timeline</p>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4 border-t-2 md:border-t-0 border-gray-200 pt-3 md:pt-0">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">INTEL</span>
            <div className="flex items-baseline gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span className="text-sm md:text-base text-black">{nutrients.calories}</span> CAL
            </div>
            <div className="flex items-baseline gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span className="text-sm md:text-base text-black">{nutrients.protein}g</span> PRO
            </div>
            <div className="flex items-baseline gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span className="text-sm md:text-base text-black">{nutrients.carbs}g</span> CARB
            </div>
            <div className="flex items-baseline gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span className="text-sm md:text-base text-black">{nutrients.fats}g</span> FAT
            </div>
          </div>
        </div>

        {/* STAGE TABS ROW */}
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {stages.map((stg, idx) => {
            const isActive = idx === currentStageIndex;
            const hasTimer = stg.tasks?.some(t => typeof t === 'object' && t.timer);

            return (
              <button 
                key={idx} 
                onClick={() => setCurrentStageIndex(idx)} 
                className={`snap-start border-[3px] border-black px-4 py-3 min-w-[140px] md:min-w-[160px] flex flex-col items-start justify-center transition-all ${isActive ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-gray-400 hover:border-red-600'}`}
              >
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-black'}`}>
                  {idx + 1}. {stg.name}
                </span>
                {hasTimer && !isActive && (
                  <span className="mt-2 text-[8px] font-black uppercase text-red-600 border border-red-200 px-1.5 py-0.5 flex items-center gap-1">
                    ⏱ TIMER
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ACTION ITEMS BOX (MASSIVE VISUAL UPGRADE) */}
        <div className="border-[3px] md:border-4 border-black p-4 md:p-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-sm md:text-xl font-black uppercase border-b-[3px] border-black pb-2 mb-4 md:mb-8 inline-block tracking-widest">
            Action Items
          </h2>
          
          <div className="flex flex-col gap-4 md:gap-6">
            {currentStage?.tasks?.map((task, idx) => {
              const isTimer = typeof task === 'object' && task.timer;
              const taskText = isTimer ? task.text : task;
              const timeLeft = isTimer ? timers[idx] || 0 : null;

              return (
                <div key={idx} className="border-[3px] border-black p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-white hover:bg-gray-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-start md:items-center gap-4 md:gap-5">
                    <span className="text-red-600 font-black text-2xl md:text-4xl shrink-0 leading-none mt-1 md:mt-0">
                      {(idx + 1).toString().padStart(2, '0')}.
                    </span>
                    <span className="font-black text-sm md:text-xl uppercase tracking-tight leading-snug">
                      {taskText}
                    </span>
                  </div>
                  
                  {isTimer && (
                    <div className={`font-mono text-xl md:text-3xl font-black border-[3px] border-black px-4 py-2 flex items-center justify-center min-w-[100px] md:min-w-[120px] shrink-0 ${timeLeft === 0 ? 'bg-red-600 text-white animate-pulse shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-100 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                      {formatTime(timeLeft)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER CONTROLS */}
        <div className="flex justify-between items-center mt-2 md:mt-4">
          {currentStageIndex > 0 ? (
            <button onClick={() => setCurrentStageIndex(prev => prev - 1)} className="border-2 md:border-[3px] border-black bg-white px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
              -- PREVIOUS
            </button>
          ) : <div />}
          
          <button onClick={handleNext} className={`border-2 md:border-[3px] border-black px-6 md:px-10 py-3 md:py-4 text-xs md:text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all ${isLastStage ? 'bg-green-500 text-black' : 'bg-black text-white'}`}>
            {isLastStage ? 'COMPLETE DISH' : 'NEXT STAGE ➔'}
          </button>
        </div>

      </div>
    </motion.div>
  );
}