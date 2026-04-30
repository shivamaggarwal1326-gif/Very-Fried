import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

export default function Auth({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Verification protocol sent. Check your email to confirm clearance.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-black flex flex-col items-center justify-center bg-transparent relative overflow-hidden w-full">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#fcfbf9] border-4 border-black p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] relative z-10 flex flex-col">
        
        <button onClick={onBack} className="text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors self-start mb-6">
          ← ABORT
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black text-[#fcfbf9] flex items-center justify-center border-2 border-red-600 animate-pulse">
            <span className="font-black text-2xl tracking-tighter">VF</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-tight text-center mb-2">{isSignUp ? 'ENLIST NOW' : 'SECURE LOGIN'}</h1>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-8">Verify credentials to access the Command Center</p>
        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-black text-red-500 font-mono text-xs p-3 mb-6 border border-red-600 uppercase tracking-tight">
              🔥 ERROR: {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-2 border-black p-3 text-sm font-bold focus:outline-none focus:border-red-600 transition-colors" required />
          </div>
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[10px] font-black uppercase tracking-widest">Passcode</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-2 border-black p-3 text-sm font-bold focus:outline-none focus:border-red-600 transition-colors" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 border-2 border-black hover:bg-black transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
            {loading ? 'PROCESSING...' : (isSignUp ? 'INITIATE ENLISTMENT' : 'AUTHORIZE ENTRY')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5">
            {isSignUp ? 'ALREADY ENLISTED? LOGIN HERE.' : 'NEW RECRUIT? ENLIST HERE.'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}