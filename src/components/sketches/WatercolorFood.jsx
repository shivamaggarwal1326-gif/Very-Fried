// src/components/sketches/WatercolorFood.jsx
export default function WatercolorFood({ sketch, colorClass, className = "" }) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* The offset watercolor bleed effect */}
      <div 
        className={`absolute inset-1 rounded-full blur-md opacity-60 mix-blend-multiply ${colorClass} scale-110 translate-x-1 translate-y-2`} 
      />
      {/* The crisp black sketch on top */}
      <div className="relative z-10 stroke-black fill-none stroke-[1.5px]">
        {sketch}
      </div>
    </div>
  );
}