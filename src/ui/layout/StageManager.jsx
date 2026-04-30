import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- NEW: GLOBAL AUDIO CONTEXT ---
let globalAudioCtx = null;

export const unlockAudioContext = () => {
  if (!globalAudioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    globalAudioCtx = new AudioContext();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
};

const playTimerStartSound = () => {
  try {
    if (!globalAudioCtx) unlockAudioContext();
    const ctx = globalAudioCtx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); 
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch(e) { 
    console.log("Audio intel suppressed by browser."); 
  }
};

const TimerBrain = ({ timers, setTimers }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        let updated = { ...prev };
        let hasChanges = false;
        Object.keys(updated).forEach(timerId => {
          const t = updated[timerId];
          if (t.isActive && t.timeLeft > 0) {
            updated[timerId] = { ...t, timeLeft: t.timeLeft - 1 };
            hasChanges = true;
            if (updated[timerId].timeLeft === 0) {
              updated[timerId].isActive = false; 
              if ("Notification" in window && Notification.permission === "granted") new Notification("🔥 VERYFRYD ALERT 🔥", { body: `${t.label} COMPLETE!` });
              else setTimeout(() => alert(`🔥 VERYFRYD ALERT: ${t.label} COMPLETE! 🔥`), 100);
            }
          }
        });
        return hasChanges ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [setTimers]);
  return null; 
};

const MicroTimer = ({ timerData, onToggle }) => {
  if (!timerData) return null;
  const formatTime = (s) => `${Math.floor(s/60)}:${s%60 < 10 ? '0':''}${s%60}`;
  return (
    <div className="ml-auto pl-3 flex items-center gap-2 shrink-0 border-l border-gray-200">
      <span className={`text-base md:text-xl font-black tabular-nums tracking-tighter ${timerData.timeLeft === 0 ? 'text-red-600 animate-pulse' : 'text-gray-400'}`}>
        {formatTime(timerData.timeLeft)}
      </span>
      <button onClick={onToggle} className={`px-2 py-1 font-black uppercase text-[9px] border border-black transition-all ${timerData.isActive ? 'bg-red-500 text-white' : 'bg-gray-200 text-black hover:bg-black hover:text-white'}`}>
        {timerData.isActive ? 'PAUSE' : 'START'}
      </button>
    </div>
  );
};

const BoilingAnimation = ({ isActive }) => (
  <div className="w-full h-full flex items-center justify-center relative bg-white">
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
    <svg viewBox="0 0 100 100" className="w-16 md:w-24 text-black overflow-visible relative z-10">
      <motion.path d="M 35 30 Q 40 10, 30 -10 M 65 30 Q 60 10, 70 -10 M 50 35 Q 55 15, 45 -5" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" animate={isActive ? { y: [0, -10, -20], opacity: [0, 0.5, 0] } : { opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
      <path d="M 20 40 L 20 85 C 20 95, 80 95, 80 85 L 80 40 Z" fill="#fcfbf9" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="M 10 45 L 20 45 M 80 45 L 90 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M 20 40 C 40 45, 60 45, 80 40" fill="none" stroke="currentColor" strokeWidth="4" />
      {[30, 45, 60, 70].map((cx, i) => <motion.circle key={i} cx={cx} cy="75" r="3" fill="currentColor" animate={isActive ? { y: [0, -15, -25], opacity: [0.8, 1, 0], scale: [1, 1.5, 0.5] } : { opacity: 0 }} transition={{ duration: 0.8 + (i * 0.2), repeat: Infinity, delay: i * 0.1 }} />)}
    </svg>
  </div>
);

const SearingAnimation = ({ isActive, cookedProgress }) => {
  const getChickenColor = (p) => { if (p < 20) return "#fecdd3"; if (p < 40) return "#fed7aa"; if (p < 60) return "#fdba74"; if (p < 80) return "#f59e0b"; return "#b45309"; };
  return (
    <div className="w-full h-full flex items-center justify-center relative bg-white">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
      <svg viewBox="0 0 120 100" className="w-20 md:w-28 text-black overflow-visible relative z-10">
        {[20, 50, 80].map((cx, i) => <motion.path key={i} d={`M ${cx} 60 L ${cx + (i % 2 === 0 ? 5 : -5)} 40`} fill="none" stroke="orange" strokeWidth="2" strokeLinecap="round" animate={isActive && cookedProgress > 10 ? { y: [0, -10], opacity: [0, 0.8, 0], x: [0, i % 2 === 0 ? 2 : -2] } : { opacity: 0 }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} />)}
        <path d="M 10 70 L 90 70 L 80 90 L 20 90 Z" fill="#222" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M 90 70 L 115 55" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <motion.path d="M 30 85 C 25 75, 40 70, 50 75 C 60 70, 75 75, 70 85 C 65 90, 35 90, 30 85 Z" fill={getChickenColor(cookedProgress)} stroke="currentColor" strokeWidth="3" strokeLinejoin="round" animate={{ fill: getChickenColor(cookedProgress) }} transition={{ duration: 1 }} />
      </svg>
    </div>
  );
};

const BurnerTimer = ({ action, type, timerData, onToggle }) => {
  if (!timerData) return null; 
  const { label, timeLeft, initialSeconds, isActive } = timerData;
  const progressPercentage = (timeLeft / initialSeconds) * 100;
  const cookedProgress = 100 - progressPercentage;
  const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

  return (
    <div className="border-2 md:border-4 border-black p-3 md:p-4 bg-[#fcfbf9] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full w-full">
      <div className="flex justify-start w-full mb-2">
        <h3 className="font-black text-[10px] md:text-[11px] bg-black text-[#fcfbf9] px-2 py-0.5 uppercase tracking-widest inline-block">{label}</h3>
      </div>
      <p className="text-[11px] md:text-sm font-bold leading-snug mb-3 break-words">{action}</p>
      
      <div className="w-full h-[90px] md:h-[130px] shrink-0 border-y-2 border-black mb-3 relative overflow-hidden bg-white">
        {type === 'boil' ? <BoilingAnimation isActive={isActive} /> : <SearingAnimation isActive={isActive} cookedProgress={cookedProgress} />}
      </div>
      
      <div className="flex flex-col w-full mt-auto shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-2xl md:text-4xl font-black tabular-nums tracking-tighter ${timeLeft === 0 ? 'text-red-600 animate-pulse' : 'text-black'}`}>{formatTime(timeLeft)}</span>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onToggle} className={`px-3 py-1.5 md:py-2 text-[9px] md:text-[11px] font-black uppercase tracking-wide border-2 border-black ${isActive ? 'bg-red-500 text-white' : 'bg-green-400 text-black'}`}>
            {isActive ? 'PAUSE' : 'START'}
          </motion.button>
        </div>
        <div className="w-full h-1.5 md:h-2.5 bg-gray-300 border border-black overflow-hidden relative">
          <motion.div className={`h-full ${timeLeft < (initialSeconds * 0.2) ? 'bg-red-600' : 'bg-black'}`} initial={{ width: "100%" }} animate={{ width: `${progressPercentage}%` }} transition={{ ease: "linear", duration: 1 }} />
        </div>
      </div>
    </div>
  );
};

export default function StageManager({ recipeData, currentStageIndex, setCurrentStageIndex, onDishComplete, onBackToDashboard, onViewPrep, onCancelDish }) {
  const [missionComplete, setMissionComplete] = useState(false);
  const [timers, setTimers] = useState({});
  const [isBrowsingMode, setIsBrowsingMode] = useState(false); 

  useEffect(() => {
    if (recipeData && recipeData.stages) {
      const initialTimers = {};
      recipeData.stages.forEach((stage, sIdx) => {
        if (stage.burnerOne) initialTimers[`${sIdx}-b1`] = { timeLeft: stage.burnerOne.timer, initialSeconds: stage.burnerOne.timer, isActive: false, label: 'Burner 1' };
        if (stage.burnerTwo) initialTimers[`${sIdx}-b2`] = { timeLeft: stage.burnerTwo.timer, initialSeconds: stage.burnerTwo.timer, isActive: false, label: 'Burner 2' };
        if (stage.tasks) stage.tasks.forEach((task, tIdx) => { if (typeof task === 'object' && task.timer) initialTimers[`${sIdx}-t${tIdx}`] = { timeLeft: task.timer, initialSeconds: task.timer, isActive: false, label: 'Prep Timer' }; });
      });
      setTimers(initialTimers);
    }
  }, [recipeData]);

  if (!recipeData || !recipeData.stages) return <div className="p-4 font-black">LOADING...</div>;

  const stages = recipeData.stages;
  const currentStage = stages[currentStageIndex];
  const isLastStage = currentStageIndex === stages.length - 1;

  const rawData = recipeData.nutrients || recipeData.nutrition || {};
  
  const parseMacro = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseInt(val.replace(/\D/g, ''), 10) || 0;
    return 0;
  };

  const displayNutrients = {
    calories: parseMacro(rawData.calories),
    protein: parseMacro(rawData.protein),
    carbs: parseMacro(rawData.carbs),
    fats: parseMacro(rawData.fats !== undefined ? rawData.fats : rawData.fat)
  };

  const stageNavInfo = stages.map((stage, idx) => {
    let hasTimer = false;
    if (stage.burnerOne || stage.burnerTwo) hasTimer = true;
    if (stage.tasks && stage.tasks.some(t => typeof t === 'object' && t.timer)) hasTimer = true;
    return { id: idx, name: stage.name, hasTimer };
  });

  const toggleTimer = (timerId) => {
    // --- NEW: Audio Unlock on Interaction ---
    unlockAudioContext();

    try { 
      if (!timers[timerId].isActive && "Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission(); 
      }
    } catch (e) { }

    setTimers(prev => {
      const isStarting = !prev[timerId].isActive;
      if (isStarting && prev[timerId].timeLeft > 0) {
        playTimerStartSound(); 
      }
      return { ...prev, [timerId]: { ...prev[timerId], isActive: isStarting } };
    });
  };

  const allTimersDone = Object.values(timers).every(t => t.timeLeft === 0);
  const isStrictlyCompleted = allTimersDone && !isBrowsingMode;
  
  const earnedXP = isStrictlyCompleted ? (recipeData.xp || 150) : 0;
  let earnedCoins = 0;
  if (isStrictlyCompleted) {
    const timeStr = recipeData.time || "15";
    const timeMatch = timeStr.match(/\d+/);
    earnedCoins = timeMatch ? parseInt(timeMatch[0], 10) : 15;
  }

  const canFinishMission = isBrowsingMode || allTimersDone;

  const handleFinish = () => {
    setMissionComplete(true);
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-6 font-sans text-black flex flex-col items-center justify-start overflow-x-hidden relative pt-20 pb-20">
      <TimerBrain timers={timers} setTimers={setTimers} />

      <div className="w-full max-w-4xl mx-auto flex justify-end mb-4">
        <button 
          onClick={() => setIsBrowsingMode(!isBrowsingMode)}
          className={`px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest border-2 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 ${isBrowsingMode ? 'bg-yellow-400 border-black text-black' : 'bg-white border-gray-400 text-gray-500 hover:border-black hover:text-black'}`}
        >
          <div className={`w-3 h-3 border border-black ${isBrowsingMode ? 'bg-black' : 'bg-white'}`}></div>
          BROWSE MODE (SKIP TIMERS)
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto relative z-10 flex flex-col gap-4 md:gap-6 my-auto">
        
        <div className="border-b-2 md:border-b-4 border-black pb-2 flex flex-col gap-2 bg-[#fcfbf9] p-3 md:p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
            <div className="flex-grow flex flex-wrap items-center gap-3">
              <button onClick={onBackToDashboard} className="text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors">← COOK YOUR MOOD</button>
              <button onClick={onViewPrep} className="text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-1 border-l-2 border-gray-300 pl-3">PREP LIST</button>
              <button onClick={onCancelDish} className="text-white bg-red-600 px-3 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-1 border-2 border-black ml-auto md:ml-3">✖ CANCEL DISH</button>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-2 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight break-words">{recipeData.title}</h1>
              <p className="text-xs font-bold mt-1 text-gray-800">Operational Timeline</p>
            </div>
            <div className="flex gap-x-4 gap-y-2 flex-wrap md:justify-end items-center md:border-l border-gray-200 md:pl-4">
              <div className="text-gray-400 font-black uppercase text-[10px] tracking-widest">INTEL</div>
              {[
                { label: 'CAL', value: displayNutrients.calories },
                { label: 'PRO', value: `${displayNutrients.protein}g` },
                { label: 'CARB', value: `${displayNutrients.carbs}g` },
                { label: 'FAT', value: `${displayNutrients.fats}g` }
              ].map(stat => (
                <div key={stat.label} className="flex gap-1.5 items-baseline">
                  <span className="text-xs md:text-sm font-black tabular-nums">{stat.value}</span>
                  <span className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-200">
          {stageNavInfo.map((info) => (
            <button
              key={info.id}
              onClick={() => setCurrentStageIndex(info.id)}
              className={`shrink-0 px-4 py-2 border-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 transition-all outline-none
              ${currentStageIndex === info.id ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]' : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'}`}
            >
              <span>{info.id + 1}. {info.name}</span>
              {info.hasTimer && (
                <span className={`text-[8px] px-1.5 py-0.5 border ${currentStageIndex === info.id ? 'border-red-500 text-red-400 bg-black' : 'border-red-300 text-red-500 bg-red-50'}`}>
                  ⏱ TIMER
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentStageIndex} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-3 md:gap-5 w-full">
            {currentStage.tasks && (
              <div className="border-2 md:border-4 border-black p-3 md:p-4 bg-[#fcfbf9] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full">
                <h2 className="text-sm md:text-base font-black mb-2 border-b border-black inline-block uppercase tracking-tight">Action Items</h2>
                <ul className="space-y-2">
                  {currentStage.tasks.map((task, idx) => {
                    const isObj = typeof task === 'object';
                    const text = isObj ? task.text : task;
                    const timerId = `${currentStageIndex}-t${idx}`;
                    return (
                      <li key={idx} className="flex items-center text-[11px] md:text-sm font-bold break-words border border-gray-200 bg-white p-2">
                        <span className="mr-2 md:mr-3 text-sm md:text-base font-black text-gray-400 shrink-0">0{idx + 1}.</span>
                        <span className="flex-grow pr-2">{text}</span>
                        {isObj && task.timer && timers[timerId] && <MicroTimer timerData={timers[timerId]} onToggle={() => toggleTimer(timerId)} />}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {(currentStage.burnerOne || currentStage.burnerTwo) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 w-full items-stretch">
                {currentStage.burnerOne && <BurnerTimer action={currentStage.burnerOne.action} type={currentStage.burnerOne.action.toLowerCase().includes('boil') ? 'boil' : 'sear'} timerData={timers[`${currentStageIndex}-b1`]} onToggle={() => toggleTimer(`${currentStageIndex}-b1`)} />}
                {currentStage.burnerTwo && <BurnerTimer action={currentStage.burnerTwo.action} type={currentStage.burnerTwo.action.toLowerCase().includes('sear') ? 'sear' : 'boil'} timerData={timers[`${currentStageIndex}-b2`]} onToggle={() => toggleTimer(`${currentStageIndex}-b2`)} />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between w-full pt-2 flex-col sm:flex-row gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
            onClick={() => setCurrentStageIndex(prev => prev > 0 ? prev - 1 : prev)} 
            disabled={currentStageIndex === 0} 
            className={`bg-white text-black text-xs font-black uppercase px-4 py-2.5 md:py-3 border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${currentStageIndex === 0 ? 'opacity-50 shadow-none' : ''}`}
          >
            ← Previous
          </motion.button>
          
          {isLastStage ? (
            <motion.button 
              whileHover={canFinishMission ? { scale: 1.02 } : {}} 
              whileTap={canFinishMission ? { scale: 0.98 } : {}} 
              onClick={() => { 
                if (canFinishMission) handleFinish(); 
                else alert("🔥 MISSION INCOMPLETE: Finish all active timers across all stages first, or enable BROWSE MODE at the top of the screen to skip.");
              }} 
              className={`text-[#fcfbf9] text-xs font-black uppercase px-4 py-2.5 md:py-3 border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${canFinishMission ? 'bg-red-600' : 'bg-gray-500 cursor-not-allowed'}`}
            >
              {canFinishMission ? 'Verify Dish' : 'Timers Pending...'}
            </motion.button>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
              onClick={() => setCurrentStageIndex(p => p + 1)} 
              className="bg-black text-[#fcfbf9] text-xs font-black uppercase px-4 py-2.5 md:py-3 border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            >
              Next Stage →
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {missionComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="border-4 border-black p-6 md:p-8 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[#fcfbf9] max-w-sm w-full text-center">
              
              <div className="w-16 h-16 rounded-full bg-red-600 border-4 border-black flex flex-col items-center justify-center relative overflow-visible shadow-[inset_-4px_-4px_0px_rgba(0,0,0,0.3)] mb-4">
                <div className="absolute -top-3 w-6 h-4 bg-green-500 border-2 border-black rounded-tl-full rounded-br-full z-20 origin-bottom-left rotate-12"></div>
                <div className="flex gap-2 mb-1"><div className="w-2 h-3 bg-black rounded-full"></div><div className="w-2 h-3 bg-black rounded-full"></div></div>
                <div className="w-4 h-2 bg-black rounded-b-full"></div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight border-b-2 border-red-600 pb-3 mb-4">
                Enjoy the food,<br/>
                <span className="text-red-600 text-3xl md:text-4xl mt-2 block">Foody :)</span>
              </h1>

              <div className="flex items-center gap-3 bg-black px-4 py-3 mb-6 w-full justify-center flex-wrap">
                {isStrictlyCompleted ? (
                  <>
                    <span className="text-yellow-400 text-xl font-black">★</span>
                    <span className="text-white text-base md:text-lg font-black uppercase">+{earnedXP} XP</span>
                    <span className="text-yellow-400 text-xl font-black">🪙</span>
                    <span className="text-white text-base md:text-lg font-black uppercase">+{earnedCoins} COINS</span>
                  </>
                ) : (
                  <span className="text-red-500 text-xs md:text-sm font-black uppercase text-center tracking-widest">Protocol Bypassed. Zero Yield Granted.</span>
                )}
              </div>

              <button 
                onClick={() => { if (onDishComplete) onDishComplete(earnedXP, earnedCoins); }} 
                className="bg-black text-white text-sm font-black uppercase px-6 py-3 border-2 border-black w-full hover:bg-white hover:text-black transition-colors"
              >
                Return to Base
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}