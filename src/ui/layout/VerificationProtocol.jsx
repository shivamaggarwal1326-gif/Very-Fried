import React from 'react';

export default function VerificationProtocol({ onSkip, onLoginRedirect, rememberedTag }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#fcfbf9] border-4 border-black shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] w-full max-w-md p-8 relative flex flex-col items-center text-center">
        
        <div className="w-16 h-16 bg-red-600 text-white flex items-center justify-center border-4 border-black mb-6 shadow-[inset_-4px_-4px_0px_rgba(0,0,0,0.3)]">
          <span className="font-black text-2xl tracking-tighter animate-pulse">VF</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black leading-none mb-2">Secure Your Progress</h2>
        <p className="text-sm font-bold uppercase tracking-widest text-red-600 mb-6">Warning: Ghost Status Detected</p>

        <div className="bg-black text-white p-4 w-full flex justify-between items-center mb-6">
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Alias</p>
            <p className="text-lg font-black font-mono tracking-widest">{rememberedTag || 'UNKNOWN'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</p>
            <p className="text-sm font-black text-red-500 animate-pulse">UNVERIFIED</p>
          </div>
        </div>

        <p className="text-sm font-medium mb-8 text-gray-800">
          Chef, you just earned XP. To deploy your VIP codes in the field and permanently save your culinary rank, you must log in or sign up.
        </p>

        <button 
          onClick={onLoginRedirect} 
          className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 text-lg border-4 border-black hover:bg-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 mb-6"
        >
          Sign Up / Log In
        </button>

        <button 
          onClick={onSkip} 
          className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black underline decoration-gray-300 hover:decoration-black underline-offset-4 transition-colors"
        >
          Stay Anonymous (Risk Losing Data)
        </button>

      </div>
    </div>
  );
}