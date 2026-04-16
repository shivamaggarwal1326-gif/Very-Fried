// src/components/sketches/AssetLibrary.jsx
import InkUtensil from './InkUtensil';
import WatercolorFood from './WatercolorFood';

// --- THE UTILITY DRAWER (Black & White Ink) ---
export const Utilities = {
  FryingPan: ({ className }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        {/* Loose sketch of a pan */}
        <path d="M10,40 C10,70 90,70 90,40 Z" />
        <path d="M90,40 L110,30" className="stroke-[3px]" /> 
      </svg>
    </InkUtensil>
  ),
  Spatula: ({ className }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        {/* Loose sketch of a spatula */}
        <path d="M40,20 L60,20 L55,50 L45,50 Z" />
        <path d="M50,50 L50,90" className="stroke-[3px]" />
      </svg>
    </InkUtensil>
  )
};

// --- THE PANTRY (Scattered Color Watercolor) ---
export const Vegetables = {
  Tomato: ({ className }) => (
    <WatercolorFood 
      colorClass="bg-red-500" // The watercolor bleed color
      className={className}
      sketch={
        <svg viewBox="0 0 100 100" className="w-12 h-12">
          {/* Loose sketch of a tomato outline */}
          <path d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50 Z" />
          {/* The little green stem sketch */}
          <path d="M40,30 Q50,20 60,30" />
        </svg>
      }
    />
  ),
  Strawberry: ({ className }) => (
    <WatercolorFood 
      colorClass="bg-rose-500" 
      className={className}
      sketch={
        <svg viewBox="0 0 100 100" className="w-12 h-12">
          {/* Loose sketch of a strawberry outline */}
          <path d="M30,30 C50,10 70,30 50,80 C30,30 30,30 30,30 Z" />
          {/* Strawberry seeds */}
          <circle cx="45" cy="45" r="1" fill="black" />
          <circle cx="55" cy="55" r="1" fill="black" />
        </svg>
      }
    />
  )
};