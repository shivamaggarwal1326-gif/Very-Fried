import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const TacticalSlider = ({ text, onUnlock, colorClass }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const trackRef = useRef(null);
  const [dragBoundary, setDragBoundary] = useState(0);

  useEffect(() => {
    if (trackRef.current) {
      setDragBoundary(trackRef.current.offsetWidth - 120); 
    }
  }, []);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > dragBoundary * 0.7) {
      setIsUnlocked(true);
      setTimeout(() => onUnlock(), 400); 
    }
  };

  return (
    <div ref={trackRef} className="w-full border-[3px] md:border-4 border-black bg-white p-1.5 md:p-2 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center h-14 md:h-16 overflow-hidden z-50 pointer-events-auto">
      <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none">
         <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Right swipe to enter →</span>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: dragBoundary > 0 ? dragBoundary : 100 }}
        dragSnapToOrigin={!isUnlocked} 
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.02 }}
        whileTap={{ cursor: "grabbing" }}
        className={`h-full bg-black flex items-center justify-center px-4 relative z-10 cursor-grab border-2 border-black transition-colors ${isUnlocked ? colorClass : ""}`}
      >
        <span className="text-white text-[10px] md:text-sm font-black uppercase tracking-widest whitespace-nowrap">{text}</span>
      </motion.div>
    </div>
  );
};

const BouncyWord = ({ text, positionClass, rotate, colorClass, containerRef }) => {
  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.8} 
      dragMomentum={true}
      dragTransition={{ bounceStiffness: 200, bounceDamping: 15 }} 
      whileHover={{ scale: 1.15, zIndex: 100 }}
      whileDrag={{ scale: 1.2, cursor: "grabbing", zIndex: 100 }}
      className={`absolute z-40 ${colorClass} ${positionClass} border-[3px] border-black px-3 py-1.5 md:px-4 md:py-2 font-black uppercase tracking-widest text-[10px] md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-grab select-none active:shadow-none transition-shadow pointer-events-auto`}
      style={{ rotate: rotate }}
    >
      {text}
    </motion.div>
  );
};

export default function LandingPage({ onEnter }) {
  const brandName = "VERYFRYD".split("");
  const fullScreenRef = useRef(null);

  // THE FIX: Since App.jsx is now 100vw, these percentages will push them to the TRUE edges of the monitor
  const SCATTERED_WORDS = [
    { text: "OUR", positionClass: "top-[10%] left-[5%] md:top-[15%] md:left-[12%]", rotate: -15, colorClass: "bg-yellow-400 text-black" },
    { text: "RECIPE,", positionClass: "top-[25%] left-[2%] md:top-[30%] md:left-[8%]", rotate: 10, colorClass: "bg-red-500 text-white" },
    { text: "YOU", positionClass: "top-[45%] left-[6%] md:top-[50%] md:left-[12%]", rotate: -5, colorClass: "bg-green-500 text-white" },
    { text: "GRIND", positionClass: "top-[70%] left-[3%] md:top-[75%] md:left-[10%]", rotate: 12, colorClass: "bg-yellow-400 text-black" },
    
    { text: "OUR", positionClass: "top-[10%] right-[5%] md:top-[15%] md:right-[12%]", rotate: 15, colorClass: "bg-green-500 text-white" },
    { text: "PARTNERS,", positionClass: "top-[25%] right-[2%] md:top-[30%] md:right-[8%]", rotate: -10, colorClass: "bg-yellow-400 text-black" },
    { text: "YOU", positionClass: "top-[45%] right-[6%] md:top-[50%] md:right-[12%]", rotate: 5, colorClass: "bg-red-500 text-white" },
    { text: "DINE", positionClass: "top-[70%] right-[3%] md:top-[75%] md:right-[10%]", rotate: -12, colorClass: "bg-green-500 text-white" },
  ];

  return (
    // Outer Screen Container: Uses true 100vw because App.jsx constraint is gone
    <div ref={fullScreenRef} className="h-[100dvh] w-[100vw] flex flex-col items-center justify-center font-sans text-black overflow-hidden relative !bg-transparent -mx-4 md:-mx-8 lg:-mx-12">
      
      {/* Throwable words */}
      {SCATTERED_WORDS.map((word, i) => (
        <BouncyWord 
          key={i} 
          text={word.text} 
          positionClass={word.positionClass}
          rotate={word.rotate} 
          colorClass={word.colorClass}
          containerRef={fullScreenRef} 
        />
      ))}

      {/* Center Layout Container for Logo and Sliders */}
      <div className="relative w-full max-w-[1100px] flex flex-col items-center justify-center pointer-events-none z-10">
        
        <div className="flex flex-col items-center justify-center relative w-full z-10 mt-[-20px] md:mt-[-40px]">
          
          <div className="mb-6 md:mb-10 relative z-20 bg-white px-4 md:px-6 py-1.5 md:py-2 border-[3px] md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center pointer-events-auto">
            <p className="text-xl md:text-4xl font-black tracking-widest text-black uppercase flex items-center">
              <span className="mr-1.5 md:mr-2">WELC</span>
              <motion.span className="inline-flex items-center justify-center w-6 h-6 md:w-10 md:h-10 border-[3px] md:border-4 border-black rounded-full relative mx-[2px] bg-white">
                <svg viewBox="0 0 100 100" className="w-4 h-4 md:w-6 md:h-6 text-black">
                  <circle cx="30" cy="35" r="8" fill="currentColor" />
                  <circle cx="70" cy="35" r="8" fill="currentColor" />
                  <path d="M 20 60 Q 50 85 80 60" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </motion.span>
              <span className="ml-1.5 md:ml-2">ME TO</span>
            </p>
          </div>
          
          <div className="flex items-center justify-center relative z-20 w-full px-2" style={{ perspective: "1000px" }}>
            {brandName.map((char, index) => (
              <motion.span
                key={index}
                animate={{
                  y: [0, -6, 0], 
                  rotateX: [0, 15, 0], 
                  rotateZ: [0, index % 2 === 0 ? 3 : -3, 0], 
                }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, delay: index * 0.1 }}
                className="text-[11vw] sm:text-[70px] md:text-[100px] lg:text-[130px] font-black uppercase inline-block origin-center mx-[1px] md:mx-[3px]"
                style={{
                  color: "#facc15", 
                  WebkitTextStroke: "2px #b91c1c", 
                  textShadow: "-2px -2px 0px #ef4444, 2px -2px 0px #ef4444, -2px 2px 0px #ef4444, 2px 2px 0px #ef4444, 0px 5px 0px #991b1b",
                  transformStyle: "preserve-3d",
                  fontFamily: "'Courier New', Courier, monospace" 
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="w-[85%] max-w-[280px] md:max-w-[360px] flex flex-col gap-3 md:gap-4 z-50 mt-12 md:mt-20 pointer-events-auto">
          <TacticalSlider text="CHEF (Login)" colorClass="bg-red-600" onUnlock={() => onEnter('login')} />
          <TacticalSlider text="ROOKIE (Sign up)" colorClass="bg-green-600" onUnlock={() => onEnter('guest')} />
        </div>
        
      </div>
    </div>
  );
}