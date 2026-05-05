import React, { useState, useEffect } from 'react';
import { THEMES } from '../sketches/KitchenCanvas.jsx';
import { supabase } from '../../lib/supabaseClient'; // THE FIX: Needed for live board

export default function TrophyRoom({ vfTag, userXP, rankIntel, activeTheme, setTheme, onClose, onSignOut, isAnonymous, stats = { missions: 0, highestSpice: 'None', favorite: 'None', deployments: 0 } }) {
  
  const [leaderboard, setLeaderboard] = useState([]);
  const progressPercent = Math.min(100, (userXP / rankIntel.target) * 100);

  // THE FIX: Real Database Leaderboard Fetch
  useEffect(() => {
    const fetchBoard = async () => {
      const { data } = await supabase.from('profiles').select('vf_tag, total_xp').order('total_xp', { ascending: false }).limit(3);
      if (data) setLeaderboard(data);
    };
    fetchBoard();
  }, []);

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-[#fcfbf9]/80 backdrop-blur-md overflow-y-auto">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="sticky top-0 bg-black text-white p-4 flex justify-between items-center z-10 shadow-lg">
        <h1 className="text-xl font-black uppercase tracking-widest">VF Tag</h1>
        <button onClick={onClose} className="text-xs font-bold border border-white px-3 py-1 hover:bg-white hover:text-black transition-colors uppercase tracking-wider">Close</button>
      </div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 relative z-10">
        
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-[100px] font-black text-gray-100 opacity-50 select-none pointer-events-none">VF</div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Operative Tag</p>
              <h2 className="text-4xl font-black font-mono tracking-tighter text-black">{vfTag || 'UNKNOWN'}</h2>
              {isAnonymous && <span className="inline-block bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 mt-2 animate-pulse">Ghost Status</span>}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Current Rank</p>
              <p className={`text-2xl font-black uppercase tracking-widest ${rankIntel.color}`}>{rankIntel.title}</p>
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
              <span>{userXP} XP</span>
              <span className="text-gray-400">Target: {rankIntel.target} XP</span>
            </div>
            <div className="w-full bg-gray-200 h-4 border-2 border-black overflow-hidden">
              <div className="bg-red-600 h-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <StatBlock label="Missions Completed" value={stats.missions} />
          <StatBlock label="Highest Spice" value={stats.highestSpice} />
          <StatBlock label="Favorite Partner" value={stats.favorite} />
          <StatBlock label="Field Heists" value={stats.deployments} />
        </div>

        <div className="mt-4 border-t-4 border-black pt-6">
          <h3 className="text-xl font-black uppercase tracking-widest mb-4">Fryd Board Global</h3>
          <div className="flex flex-col gap-3">
             {leaderboard.length > 0 ? leaderboard.map((user, idx) => {
                const isMe = user.vf_tag === vfTag;
                const colors = ['text-red-600', 'text-orange-500', 'text-black'];
                return (
                  <div key={idx} className={`border-2 border-black bg-white p-3 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isMe ? 'border-red-600 ring-2 ring-red-50' : ''}`}>
                    <span className={`font-black uppercase tracking-widest ${isMe ? 'text-black' : 'text-gray-400'}`}>{idx + 1}. {user.vf_tag}</span>
                    <span className={`font-black ${colors[idx] || 'text-black'}`}>{user.total_xp} XP</span>
                  </div>
                );
             }) : (
                <div className="text-center font-black text-gray-400 text-xs py-4">SYNCING NETWORK...</div>
             )}
          </div>
        </div>

        <div className="mt-4 border-t-4 border-black pt-6">
          <h3 className="text-xl font-black uppercase tracking-widest mb-4">Canvas Override</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Object.values(THEMES).map(t => {
               const isUnlocked = userXP >= t.reqXP;
               const isActive = activeTheme === t.id;
               return (
                 <button key={t.id} disabled={!isUnlocked} onClick={() => setTheme(t.id)} className={`p-3 border-2 transition-all flex flex-col items-center justify-between gap-3 ${isActive ? 'border-red-600 bg-red-50' : 'border-black bg-white'} ${!isUnlocked ? 'opacity-50 grayscale' : 'hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                    <div className={`w-full h-8 ${t.bg} border border-black`}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{t.name}</span>
                 </button>
               )
            })}
          </div>
        </div>

        <div className="mt-6 border-t-4 border-black pt-6 flex flex-col gap-4 pb-12">
          <h3 className="text-xl font-black uppercase tracking-widest">Settings & Comms</h3>
          <button className="w-full text-left p-4 border-2 border-black bg-white hover:bg-gray-100 font-bold uppercase tracking-widest flex justify-between items-center transition-colors">
            <span>Manage Foody Subscription (₹30/mo)</span>
            <span className="text-gray-400">➔</span>
          </button>
          <button onClick={onSignOut} className="w-full text-center p-4 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-black uppercase tracking-widest transition-colors mt-2">
            Burn Identity (Sign Out)
          </button>
        </div>

      </div>
    </div>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="border-2 border-black p-4 flex flex-col justify-center items-center text-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
      <span className="text-2xl font-black text-black mb-1">{value}</span>
      <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-gray-500 leading-tight">{label}</span>
    </div>
  );
}