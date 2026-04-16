export default function InkUtensil({ children, className = "" }) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* The SVG stroke needs to be pure black with a varying stroke-width to mimic 
        the bold brush lines from the fork/knife reference. 
      */}
      <div className="stroke-black fill-none stroke-[2.5px] custom-ink-filter">
        {children}
      </div>
    </div>
  );
}