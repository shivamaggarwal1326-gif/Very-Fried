import React from 'react';
import InkUtensil from './InkUtensil.jsx';

export const Utilities = {
  ChefHat: ({ className = "" }) => (
    <svg viewBox="0 0 100 100" className={`overflow-visible ${className}`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M25,60 C10,60 10,40 20,35 C15,20 30,10 45,15 C55,0 75,5 80,20 C95,20 95,40 80,55 C90,65 75,70 70,60" className="stroke-[3px]" />
      <path d="M25,60 L30,85 L70,85 L75,60 Z" className="stroke-[3px] fill-white/50" />
      <path d="M35,60 L35,80 M50,60 L50,85 M65,60 L65,80" className="stroke-[1.5px]" />
      <path d="M40,25 C45,20 50,25 45,35 M70,30 C75,25 80,30 75,40" className="stroke-[1.5px]" />
    </svg>
  )
};

// --- WATERCOLOR PROVISIONS ---
export const Provisions = {
  
  Beetroot: ({ className = "" }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <path d="M25,75 C20,55 65,50 60,80 C50,95 30,95 25,75 Z" className="fill-fuchsia-700/50 mix-blend-multiply" />
        <path d="M45,55 C35,20 15,10 30,25 C40,40 45,55 45,55 Z" className="fill-emerald-500/40 mix-blend-multiply" />
        <path d="M50,60 C65,15 85,5 70,25 C60,40 50,60 50,60 Z" className="fill-emerald-500/40 mix-blend-multiply" />
        <circle cx="15" cy="40" r="2" className="fill-emerald-600/60" />
        <circle cx="75" cy="85" r="2" className="fill-fuchsia-700/60" />
        <path d="M30,70 C20,55 70,55 60,75 C55,85 35,85 30,70 Z" className="stroke-black stroke-[2px] fill-none stroke-linecap-round" />
        <path d="M45,65 Q35,20 20,10 M48,65 Q65,20 80,10" className="stroke-black stroke-[2px] fill-none stroke-linecap-round" />
      </svg>
    </InkUtensil>
  ),

  Pizza: ({ className = "" }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <path d="M12,22 L88,22 L55,92 Z" className="fill-amber-400/50 mix-blend-multiply" />
        <path d="M8,12 C40,8 60,8 92,12 L88,28 L12,28 Z" className="fill-orange-800/40 mix-blend-multiply" />
        <circle cx="35" cy="45" r="14" className="fill-red-600/60 mix-blend-multiply" />
        <path d="M45,25 C50,15 65,20 55,35 Z" className="fill-emerald-700/60 mix-blend-multiply" />
        <path d="M15,25 L85,25 L50,85 Z" className="stroke-black stroke-[2px] fill-none stroke-linecap-round stroke-linejoin-round" />
        <path d="M10,20 C40,15 60,15 90,20 C85,30 15,30 10,20 Z" className="stroke-black stroke-[2px] fill-none stroke-linecap-round" />
        <circle cx="35" cy="45" r="12" className="stroke-black stroke-[1.5px] fill-none" />
      </svg>
    </InkUtensil>
  ),

  RedOnion: ({ className = "" }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <path d="M15,55 C5,25 45,5 55,35 C65,65 25,85 15,55 Z" className="fill-purple-700/50 mix-blend-multiply" />
        <path d="M35,80 C25,65 65,60 75,75 C85,90 45,95 35,80 Z" className="fill-pink-200/50 mix-blend-multiply" />
        <path d="M25,55 C15,30 45,10 55,40 C65,70 35,80 25,55 Z" className="stroke-black stroke-[2px] fill-none stroke-linecap-round" />
        <ellipse cx="50" cy="80" rx="20" ry="12" className="stroke-black stroke-[2px] fill-none" />
        <ellipse cx="50" cy="80" rx="10" ry="6" className="stroke-black stroke-[1px] fill-none" />
      </svg>
    </InkUtensil>
  ),

  Tomato: ({ className = "" }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <path d="M10,50 C5,15 85,5 95,45 C100,85 15,95 10,50 Z" className="fill-red-500/60 mix-blend-multiply" />
        <path d="M45,25 C50,15 65,15 70,25 C75,35 45,35 45,25 Z" className="fill-green-600/60 mix-blend-multiply" />
        <path d="M15,50 C10,20 85,10 90,50 C95,85 20,90 15,50 Z" className="stroke-black stroke-[2.5px] fill-none stroke-linecap-round" />
        <path d="M55,35 L50,15 M55,35 L70,25 M55,35 L40,40" className="stroke-black stroke-[2px] fill-none stroke-linecap-round" />
      </svg>
    </InkUtensil>
  ),

  // --- NEW: RUNNY FRIED EGG ---
  FriedEggRunny: ({ className = "" }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* White Wash */}
        <path d="M20,40 C10,20 40,10 60,20 C85,30 95,60 70,85 C40,100 10,80 20,40 Z" className="fill-yellow-50/70 mix-blend-multiply" />
        <path d="M25,45 C15,30 40,15 55,25 C75,35 85,55 65,75 C45,90 20,70 25,45 Z" className="fill-amber-100/40 mix-blend-multiply" />
        {/* Yolk & Runny Drip Wash */}
        <circle cx="45" cy="45" r="22" className="fill-amber-400/70 mix-blend-multiply" />
        <path d="M45,60 C55,60 65,80 75,85 C85,90 70,100 60,95 C50,90 35,60 45,60 Z" className="fill-amber-500/80 mix-blend-multiply" />
        <circle cx="40" cy="40" r="5" className="fill-white/80" />
        {/* Sketchy Ink */}
        <path d="M22,42 C12,22 42,12 62,22 C87,32 97,62 72,87 C42,102 12,82 22,42 Z" className="stroke-black stroke-[1.5px] fill-none stroke-linecap-round stroke-linejoin-round" />
        <circle cx="45" cy="45" r="21" className="stroke-black stroke-[2px] fill-none" />
        <path d="M41,65 C48,70 60,85 70,85 C78,85 68,96 60,92 C52,88 40,75 35,60" className="stroke-black stroke-[1.5px] fill-none stroke-linecap-round" />
      </svg>
    </InkUtensil>
  ),

  // --- NEW: CRACKED EGGSHELL ---
  Eggshell: ({ className = "" }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Shell Wash */}
        <path d="M20,50 C20,90 80,90 80,50 L70,30 L50,45 L30,25 Z" className="fill-orange-300/60 mix-blend-multiply" />
        <path d="M25,55 C25,85 75,85 75,55 L65,40 L50,55 L35,35 Z" className="fill-orange-800/40 mix-blend-multiply" />
        {/* Inner Yolk Wash */}
        <circle cx="50" cy="65" r="18" className="fill-amber-500/70 mix-blend-multiply" />
        <circle cx="45" cy="60" r="4" className="fill-white/80" />
        {/* Splatters */}
        <circle cx="50" cy="95" r="3" className="fill-orange-800/30 mix-blend-multiply" />
        {/* Sketchy Ink */}
        <path d="M18,48 C18,92 82,92 82,48 L72,28 L50,48 L28,22 Z" className="stroke-black stroke-[2px] fill-none stroke-linecap-round stroke-linejoin-round" />
        <path d="M22,50 C22,88 78,88 78,50 L68,34 L50,52 L32,28 Z" className="stroke-black stroke-[1px] fill-none stroke-linecap-round stroke-linejoin-round" />
        <circle cx="50" cy="65" r="18" className="stroke-black stroke-[1.5px] fill-none" />
      </svg>
    </InkUtensil>
  ),

  // --- NEW: POTATO CHIPS ---
  Chips: ({ className = "" }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Chip Washes */}
        <path d="M20,30 C10,50 40,80 60,70 C80,60 60,20 40,20 Z" className="fill-yellow-400/60 mix-blend-multiply" />
        <path d="M40,50 C30,70 60,100 80,90 C100,80 80,40 60,40 Z" className="fill-amber-500/50 mix-blend-multiply" />
        <path d="M10,60 C5,80 30,100 50,90 C70,80 40,50 20,50 Z" className="fill-yellow-300/60 mix-blend-multiply" />
        {/* Splatters */}
        <circle cx="85" cy="30" r="2" className="fill-amber-600/60" />
        <circle cx="15" cy="25" r="1.5" className="fill-yellow-500/50" />
        {/* Sketchy Ink Overlaps */}
        <path d="M20,30 C10,50 40,80 60,70 C80,60 60,20 40,20 Z" className="stroke-black stroke-[1.5px] fill-none stroke-linecap-round" />
        <path d="M25,35 C15,55 45,75 55,65" className="stroke-black stroke-[1px] fill-none stroke-linecap-round" />
        <path d="M40,50 C30,70 60,100 80,90 C100,80 80,40 60,40 Z" className="stroke-black stroke-[2px] fill-none stroke-linecap-round" />
        <path d="M10,60 C5,80 30,100 50,90 C70,80 40,50 20,50 Z" className="stroke-black stroke-[1.5px] fill-none stroke-linecap-round" />
        {/* Crosshatch shading */}
        <path d="M70,85 L80,75 M65,88 L75,78 M50,95 L60,85" className="stroke-black stroke-[0.5px] fill-none" />
      </svg>
    </InkUtensil>
  ),

  // --- NEW: CROISSANT ---
  Croissant: ({ className = "" }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Flaky Washes */}
        <path d="M10,60 C10,20 50,10 80,20 C95,25 90,50 70,70 C50,90 10,95 10,60 Z" className="fill-amber-600/60 mix-blend-multiply" />
        <path d="M15,60 C15,30 45,20 70,30 C80,35 80,50 65,65 C45,80 15,85 15,60 Z" className="fill-orange-400/50 mix-blend-multiply" />
        {/* Sketchy Ink (Crescent & Flakes) */}
        <path d="M10,60 C10,20 50,10 80,20 C95,25 90,50 70,70 C50,90 10,95 10,60 Z" className="stroke-black stroke-[2px] fill-none stroke-linecap-round" />
        {/* Segment Lines */}
        <path d="M15,40 C30,35 50,40 65,30" className="stroke-black stroke-[1.5px] fill-none" />
        <path d="M12,55 C35,50 60,55 75,45" className="stroke-black stroke-[1.5px] fill-none" />
        <path d="M14,70 C35,70 55,75 65,60" className="stroke-black stroke-[1.5px] fill-none" />
        {/* Shadow hash */}
        <path d="M85,50 L95,50 M80,60 L100,60 M70,70 L95,70 M60,80 L85,80 M50,90 L70,90" className="stroke-black stroke-[0.5px] fill-none" />
      </svg>
    </InkUtensil>
  ),

  // --- NEW: MACARONS ---
  Macarons: ({ className = "" }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Stack Washes */}
        <ellipse cx="40" cy="30" rx="30" ry="15" className="fill-yellow-400/60 mix-blend-multiply" />
        <ellipse cx="60" cy="55" rx="32" ry="16" className="fill-purple-500/60 mix-blend-multiply" />
        <ellipse cx="35" cy="75" rx="34" ry="18" className="fill-pink-500/60 mix-blend-multiply" />
        {/* Splatters */}
        <circle cx="85" cy="25" r="2" className="fill-yellow-500/60" />
        <circle cx="10" cy="45" r="1.5" className="fill-pink-500/60" />
        {/* Sketchy Ink Outlines */}
        {/* Top Yellow */}
        <ellipse cx="40" cy="30" rx="30" ry="15" className="stroke-black stroke-[1.5px] fill-none" />
        <path d="M10,32 C20,35 60,35 70,32" className="stroke-black stroke-[2px] fill-none border-dashed" strokeDasharray="2 2"/>
        {/* Middle Purple */}
        <path d="M28,55 C28,46 42,39 60,39 C78,39 92,46 92,55 C92,64 78,71 60,71 C48,71 36,67 30,60" className="stroke-black stroke-[1.5px] fill-none" />
        <path d="M28,57 C40,62 80,62 92,57" className="stroke-black stroke-[2px] fill-none" strokeDasharray="2 2"/>
        {/* Bottom Pink */}
        <ellipse cx="35" cy="75" rx="34" ry="18" className="stroke-black stroke-[2px] fill-none" />
        <path d="M1,77 C15,82 55,82 69,77" className="stroke-black stroke-[2px] fill-none" strokeDasharray="2 2"/>
        {/* Highlights */}
        <path d="M25,22 Q35,18 45,20" className="stroke-white stroke-[3px] fill-none stroke-linecap-round" />
        <path d="M20,68 Q30,62 45,65" className="stroke-white stroke-[3px] fill-none stroke-linecap-round" />
      </svg>
    </InkUtensil>
  ),

  // --- NEW: POPSICLE ---
  Popsicle: ({ className = "" }) => (
    <InkUtensil className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Washes */}
        <path d="M45,70 L55,70 L55,95 L45,95 Z" className="fill-amber-700/50 mix-blend-multiply" />
        <path d="M25,15 C25,5 75,5 75,15 L75,70 L25,70 Z" className="fill-rose-500/60 mix-blend-multiply" />
        <path d="M25,40 L75,40 L75,70 L25,70 Z" className="fill-rose-200/50 mix-blend-multiply" />
        {/* Splatters */}
        <circle cx="85" cy="50" r="2" className="fill-rose-500/60" />
        <circle cx="15" cy="80" r="1.5" className="fill-rose-400/50" />
        {/* Sketchy Ink */}
        {/* Stick */}
        <path d="M45,70 L45,95 C45,98 55,98 55,95 L55,70" className="stroke-black stroke-[2px] fill-none stroke-linecap-round" />
        {/* Body with Bite Mark */}
        <path d="M25,70 L25,15 C25,5 50,5 55,5 C55,10 65,10 65,15 C65,15 75,15 75,25 L75,70 Z" className="stroke-black stroke-[2px] fill-none stroke-linecap-round stroke-linejoin-round" />
        {/* Crevices */}
        <path d="M35,15 L35,60 M65,25 L65,60" className="stroke-black stroke-[1.5px] fill-none stroke-linecap-round" />
      </svg>
    </InkUtensil>
  )
};