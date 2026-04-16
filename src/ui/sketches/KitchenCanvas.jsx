export default function KitchenCanvas({ children }) {
  return (
    <div className="relative min-h-screen w-full bg-[#fcfbf9] overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="kitchen-sketch" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M20 50 Q 40 40 60 50 T 100 50 M10 90 L 190 90 M50 90 L 50 150 M150 90 L 150 150" 
                    fill="none" stroke="#000" strokeWidth="1" strokeDasharray="5,2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kitchen-sketch)" />
        </svg>
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen bg-transparent shadow-2xl backdrop-blur-[2px]">
        {children}
      </div>
    </div>
  );
}