export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 space-y-12">
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tighter text-gray-900">
          Very fried.
        </h1>
        <p className="text-gray-500 mt-2 font-medium tracking-wide">
          No Zomato tonight, chef.
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-gray-200 w-full max-w-md text-center relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">
          Step 1: The Setup
        </h2>
        
        <div className="flex justify-center items-center gap-8 mb-10">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Heat Pan
          </span>
          <div className="w-px h-16 bg-gray-300"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Prep Veg
          </span>
        </div>

        <button className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 active:scale-[0.98] transition-all">
          Start 2:00 Timer
        </button>
      </div>
    </div>
  );
}