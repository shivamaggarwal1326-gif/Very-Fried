import React from 'react';
import { Utilities, Vegetables } from '../sketches/AssetLibrary';

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 space-y-12">
      
      {/* Brand Header */}
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tighter text-gray-900">
          Very fried.
        </h1>
        <p className="text-gray-500 mt-2 font-medium tracking-wide">
          No Zomato tonight, chef.
        </p>
      </div>

      {/* The Active Recipe Step Card */}
      <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-gray-200 w-full max-w-md text-center relative overflow-hidden">
        
        <h2 className="text-2xl font-bold mb-8 text-gray-800">
          Step 1: The Setup
        </h2>
        
        {/* The Visual Instruction Area */}
        <div className="flex justify-center items-center gap-8 mb-10">
          
          {/* The Ink Utility */}
          <div className="flex flex-col items-center gap-3">
            <Utilities.FryingPan className="w-20 h-20 transform -rotate-12 transition-transform hover:rotate-0" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Heat Pan
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-gray-300"></div>

          {/* The Watercolor Vegetable */}
          <div className="flex flex-col items-center gap-3">
            <Vegetables.Tomato className="w-20 h-20 hover:scale-105 transition-transform" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Prep
            </span>
          </div>

        </div>

        {/* The Action Button (Where your useTimer hook will eventually connect) */}
        <button className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 active:scale-[0.98] transition-all">
          Start 2:00 Timer
        </button>
      </div>

    </div>
  );
}