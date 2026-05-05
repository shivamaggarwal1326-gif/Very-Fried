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
        className={`h-full bg-black flex items-center justify-center px-4 relative z-10 cursor-grab active:cursor-grabbing border-2 border-black hover:scale-105 transition-all ${isUnlocked ? colorClass : ""}`}
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
      dragElastic={0.2} 
      dragMomentum={false}
      className={`absolute z-40 ${colorClass} ${positionClass} border-[3px] border-black px-3 py-1.5 md:px-4 md:py-2 font-black uppercase tracking-widest text-[10px] md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-grab active:cursor-grabbing hover:scale-110 active:scale-110 active:shadow-none transition-all duration-200 pointer-events-auto`}
      style={{ rotate: rotate, willChange: 'transform' }}
    >
      {text}
    </motion.div>
  );
};

export default function LandingPage({ onEnter }) {
  const brandName = "VERYFRYD".split("");
  const fullScreenRef = useRef(null);

  // EXACT TARGET PROPORTIONS
  const SCATTERED_WORDS = [
    { text: "OUR", positionClass: "top-[14%] left-[8%] md:top-[15%] md:left-[12%]", rotate: -15, colorClass: "bg-yellow-400 text-black" },
    { text: "RECIPE,", positionClass: "top-[26%] left-[4%] md:top-[30%] md:left-[8%]", rotate: 10, colorClass: "bg-red-500 text-white" },
    { text: "YOU", positionClass: "top-[44%] left-[8%] md:top-[50%] md:left-[12%]", rotate: -5, colorClass: "bg-green-500 text-white" },
    { text: "GRIND", positionClass: "top-[64%] left-[6%] md:top-[75%] md:left-[10%]", rotate: 12, colorClass: "bg-yellow-400 text-black" },
    
    { text: "OUR", positionClass: "top-[14%] right-[8%] md:top-[15%] md:right-[12%]", rotate: 15, colorClass: "bg-green-500 text-white" },
    { text: "PARTNERS,", positionClass: "top-[24%] right-[4%] md:top-[30%] md:right-[8%]", rotate: -10, colorClass: "bg-yellow-400 text-black" },
    { text: "YOU", positionClass: "top-[44%] right-[8%] md:top-[50%] md:right-[12%]", rotate: 5, colorClass: "bg-red-500 text-white" },
    { text: "DINE", positionClass: "top-[64%] right-[6%] md:top-[75%] md:right-[10%]", rotate: -12, colorClass: "bg-green-500 text-white" },
  ];

  return (
    <div ref={fullScreenRef} className="h-[100dvh] w-[100vw] flex flex-col items-center justify-center font-sans text-black overflow-hidden relative !bg-transparent -mx-4 md:-mx-8 lg:-mx-12">
      
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

      {/* PERFECTLY CENTERED FLEX CONTAINER */}
      <div className="relative w-full h-full max-w-[1100px] flex flex-col items-center justify-center pointer-events-none z-10">
        
        <div className="flex flex-col items-center justify-center relative w-full z-10">
          <div className="mb-6 md:mb-10 relative z-20 bg-white px-4 md:px-6 py-1.5 md:py-2 border-[3px] md:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center pointer-events-auto">
            <p className="text-xl md:text-4xl font-black tracking-widest text-black uppercase flex items-center">
              <span className="mr-1.5 md:mr-2">WELC</span>
              <span className="inline-flex items-center justify-center w-6 h-6 md:w-10 md:h-10 border-[3px] md:border-4 border-black rounded-full relative mx-[2px] bg-white">
                <svg viewBox="0 0 100 100" className="w-4 h-4 md:w-6 md:h-6 text-black">
                  <circle cx="30" cy="35" r="8" fill="currentColor" />
                  <circle cx="70" cy="35" r="8" fill="currentColor" />
                  <path d="M 20 60 Q 50 85 80 60" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
              <span className="ml-1.5 md:ml-2">ME TO</span>
            </p>
          </div>
          
          <div className="flex items-center justify-center relative z-20 w-full px-2">
            {/* REMOVED 3D LAG - HARDWARE ACCELERATED BOUNCE */}
            {brandName.map((char, index) => (
              <motion.span
                key={index}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, delay: index * 0.1 }}
                className="text-[11vw] sm:text-[70px] md:text-[100px] lg:text-[130px] font-black uppercase inline-block origin-center mx-[1px] md:mx-[3px]"
                style={{
                  color: "#facc15", 
                  WebkitTextStroke: "2px #b91c1c", 
                  textShadow: "-2px -2px 0px #ef4444, 2px -2px 0px #ef4444, -2px 2px 0px #ef4444, 2px 2px 0px #ef4444, 0px 5px 0px #991b1b",
                  fontFamily: "'Courier New', Courier, monospace",
                  willChange: 'transform'
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="w-[85%] max-w-[280px] md:max-w-[360px] flex flex-col gap-3 md:gap-4 z-50 mt-10 md:mt-16 pointer-events-auto">
          <TacticalSlider text="CHEF (Login)" colorClass="bg-red-600" onUnlock={() => onEnter('login')} />
          <TacticalSlider text="ROOKIE (Sign up)" colorClass="bg-green-600" onUnlock={() => onEnter('guest')} />
        </div>
        
      </div>
    </div>
  );
}