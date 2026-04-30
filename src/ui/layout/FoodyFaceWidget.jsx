import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs'; 

export default function FoodyFaceWidget({ onClick }) {
  const topLeftRef = useRef(null);
  const bottomLeftRef = useRef(null);
  const topRightRef = useRef(null);
  const bottomRightRef = useRef(null);

  useEffect(() => {
    let timeoutId;

    const blink = () => {
      const targets = [
        topLeftRef.current, 
        bottomLeftRef.current, 
        topRightRef.current, 
        bottomRightRef.current
      ].filter(Boolean); 

      if (targets.length > 0) {
        animate(targets, {
          scaleY: [1, 0.1, 1],
          // Increased from 300ms to 800ms for a slow, cute blink
          duration: 800, 
          // Added a soft easing curve for a more natural eyelid movement
          ease: 'easeInOutSine' 
        });
      }

      // Spaced out the random interval to be between 3 and 7 seconds
      const nextBlinkDelay = Math.random() * (7000 - 3000) + 3000;
      timeoutId = setTimeout(blink, nextBlinkDelay);
    };

    timeoutId = setTimeout(blink, 2000);

    return () => clearTimeout(timeoutId); 
  }, []);

  return (
    <button 
      onClick={onClick}
      className="group relative cursor-pointer flex items-center justify-center outline-none transition-transform hover:translate-x-1 hover:translate-y-1 active:scale-95"
    >
      <div className="absolute top-2 left-2 w-full h-full bg-red-600 border-2 border-transparent transition-all group-hover:top-0 group-hover:left-0 z-0"></div>
      
      <div className="relative z-10 flex items-center bg-[#111] border-4 border-black px-4 py-2 gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none transition-shadow">
        
        {/* THE TOMATO FOODY AVATAR */}
        <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-black flex flex-col items-center justify-center relative overflow-visible shrink-0 shadow-[inset_-3px_-3px_0px_rgba(0,0,0,0.3)]">
          
          <div className="absolute -top-2.5 w-5 h-3 bg-green-500 border-2 border-black rounded-tl-full rounded-br-full z-20 origin-bottom-left rotate-12"></div>
          
          <div className="flex gap-1.5 mb-1 z-10 mt-1">
            <div className="w-2.5 h-3.5 bg-black rounded-full relative overflow-hidden flex items-center justify-center">
               <div ref={topLeftRef} className="absolute top-0 w-full h-1/2 bg-red-600 origin-top"></div>
               <div ref={bottomLeftRef} className="absolute bottom-0 w-full h-1/2 bg-red-600 origin-bottom"></div>
               <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5"></div>
            </div>
            
            <div className="w-2.5 h-3.5 bg-black rounded-full relative overflow-hidden flex items-center justify-center">
               <div ref={topRightRef} className="absolute top-0 w-full h-1/2 bg-red-600 origin-top"></div>
               <div ref={bottomRightRef} className="absolute bottom-0 w-full h-1/2 bg-red-600 origin-bottom"></div>
               <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5"></div>
            </div>
          </div>

          <div className="w-3.5 h-1.5 bg-black rounded-b-full z-10"></div>
        </div>

        <span className="text-[#fcfbf9] font-black uppercase text-xl md:text-2xl tracking-widest pt-1 pr-1">
          FOODY
        </span>
      </div>
    </button>
  );
}