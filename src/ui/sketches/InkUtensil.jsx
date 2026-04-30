import React from 'react';

export default function InkUtensil({ children, className = "" }) {
  return (
    <div className={`relative inline-block ${className}`}>
      
      {/* Invisible SVG to generate the raw ink bleed texture */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="ink-bleed">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* The sketch container with the filter applied via inline style */}
      <div 
        className="stroke-current fill-none stroke-[2.5px]" 
        style={{ filter: "url(#ink-bleed)" }}
      >
        {children}
      </div>
      
    </div>
  );
}