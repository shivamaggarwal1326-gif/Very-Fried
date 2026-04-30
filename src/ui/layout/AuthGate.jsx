import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AuthGate({ onExit, onVerifyAccess, initialMode = 'login' }) {
  const [authMode, setAuthMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); setIsAuthenticating(true); setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await onVerifyAccess(data.user.id);
    } catch (error) { setErrorMsg(error.message); } finally { setIsAuthenticating(false); }
  };

  const handleResetRequest = async (e) => {
    e.preventDefault(); setIsAuthenticating(true); setErrorMsg(''); setResetMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (error) throw error;
      setResetMessage('A secure recovery link has been dispatched to your email.');
    } catch (error) { setErrorMsg(error.message); } finally { setIsAuthenticating(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault(); setIsAuthenticating(true); setErrorMsg('');
    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      setAuthMode('login'); setPassword(''); setResetMessage('Password successfully updated. Proceed to login.');
    } catch (error) { setErrorMsg(error.message); } finally { setIsAuthenticating(false); }
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-black font-mono flex flex-col items-center justify-center p-4 relative z-50">
      <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative z-10 backdrop-blur-md">
        <h1 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-4 text-black">
          {authMode === 'login' ? 'System Authentication' : authMode === 'forgot' ? 'Protocol Recovery' : 'Update Credentials'}
        </h1>
        {errorMsg && <div className="bg-red-100 border-4 border-red-500 text-red-600 p-3 mb-4 text-xs font-black uppercase">{errorMsg}</div>}
        {resetMessage && <div className="bg-green-100 border-4 border-green-500 text-green-700 p-3 mb-4 text-xs font-black uppercase">{resetMessage}</div>}
        
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="email" placeholder="Access ID (Email)" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-4 border-black text-black placeholder-gray-500 p-3 font-bold" required />
            <input type="password" placeholder="Passcode" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-4 border-black text-black placeholder-gray-500 p-3 font-bold" required />
            <button type="submit" disabled={isAuthenticating} className="bg-black text-white font-black uppercase py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
              {isAuthenticating ? 'Authorizing...' : 'Enter System'}
            </button>
            <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs font-bold text-gray-600 hover:text-black uppercase mt-2">Forgot Passcode?</button>
          </form>
        )}
        {authMode === 'forgot' && (
          <form onSubmit={handleResetRequest} className="flex flex-col gap-4">
            <p className="text-xs font-bold text-gray-600 mb-2">Enter Access ID. secure recovery link will be sent.</p>
            <input type="email" placeholder="Access ID (Email)" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-4 border-black text-black placeholder-gray-500 p-3 font-bold" required />
            <button type="submit" disabled={isAuthenticating} className="bg-black text-white font-black uppercase py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">Request Link</button>
            <button type="button" onClick={() => {setAuthMode('login'); setResetMessage(''); setErrorMsg('');}} className="text-xs font-bold text-gray-600 hover:text-black uppercase mt-2">Back to Login</button>
          </form>
        )}
        {authMode === 'update' && (
          <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
            <p className="text-xs font-bold text-gray-600 mb-2">Link verified. Establish new passcode.</p>
            <input type="password" placeholder="New Passcode" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-4 border-black text-black placeholder-gray-500 p-3 font-bold" required minLength={6} />
            <button type="submit" disabled={isAuthenticating} className="bg-green-600 text-white font-black uppercase py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">Secure Passcode</button>
          </form>
        )}
        <button onClick={onExit} className="w-full mt-6 font-bold text-xs text-gray-600 hover:text-black uppercase border-t-2 border-black pt-4">[ Exit to Hub ]</button>
      </div>
    </div>
  );
}