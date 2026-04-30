import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { BarChart, Bar, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// THE NETWORK EXPANSION TOOLS
import Admin from './Admin.jsx';
import PartnerHQ from './PartnerHQ.jsx';

// --- TACTILE UI PATTERNS ---
const SVG_PATTERN_ACTIVE = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIgLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiIC8+Cjwvc3ZnPg==')";
const SVG_PATTERN_INACTIVE = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIgLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNykiIC8+Cjwvc3ZnPg==')";

const NavTab = ({ label, subLabel, onClick, isActive, accentColor }) => (
  <button onClick={onClick} style={{ backgroundImage: isActive ? SVG_PATTERN_ACTIVE : SVG_PATTERN_INACTIVE }} className={`flex-1 md:flex-none flex flex-col items-center justify-center px-6 py-2 relative transition-all group pointer-events-auto border-4 border-black ${isActive ? 'bg-[#111] text-white translate-y-1' : 'bg-[#fcfbf9] text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'}`}>
    {isActive && <div className={`absolute bottom-0 left-0 w-full h-1.5 ${accentColor}`}></div>}
    <span className="font-black uppercase tracking-widest text-[10px] md:text-xs z-10 drop-shadow-md">{label}</span>
    <span className={`font-bold uppercase tracking-widest text-[8px] md:text-[9px] mt-0.5 z-10 ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>{subLabel}</span>
  </button>
);

const CHART_COLORS = ['#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export default function CommandCenter({ onExit }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeView, setActiveView] = useState('DASHBOARD');

  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const chatScrollRef = useRef(null);

  const [globalRevenueData, setGlobalRevenueData] = useState([]);
  const [partnerBreakdown, setPartnerBreakdown] = useState([]);
  const [totalNetworkRevenue, setTotalNetworkRevenue] = useState(0);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isAnalyzing]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        verifyDirectorAccess(currentSession);
      }
    };
    checkSession();
  }, []);

  const verifyDirectorAccess = async (currentSession) => {
    setSession(currentSession);
    const { data, error } = await supabase.rpc('is_veryfryd_admin');

    if (data === true) {
      fetchGlobalDashboardData();
    } else {
      setErrorMsg('CRITICAL: God-Mode Clearance Required.');
      await supabase.auth.signOut();
      setSession(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await verifyDirectorAccess(data.session);
    } catch (error) { setErrorMsg(error.message); } 
    finally { setIsAuthenticating(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const fetchGlobalDashboardData = async (days = 7) => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    const dateString = pastDate.toISOString();

    try {
      const { data: merchants } = await supabase.from('merchants').select('id, business_name, partnership_tier');
      const merchantMap = {};
      const merchantTierMap = {};
      if (merchants) {
        merchants.forEach(m => {
          merchantMap[m.id] = m.business_name;
          merchantTierMap[m.id] = m.partnership_tier || 'CRM_ONLY';
        });
      }

      const { data: transData } = await supabase.from('merchant_transactions').select('created_at, merchant_id, total_bill').gte('created_at', dateString);
      let totalRev = 0;
      const dayTotals = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
      const partnerTotals = {};

      if (transData) {
        transData.forEach(t => {
          const bill = t.total_bill || 0;
          totalRev += bill;
          const dayName = new Date(t.created_at).toLocaleDateString('en-US', { weekday: 'short' });
          if (dayTotals[dayName] !== undefined) dayTotals[dayName] += bill;

          const pName = merchantMap[t.merchant_id] || 'Unknown Partner';
          const pTier = merchantTierMap[t.merchant_id] || 'CRM_ONLY';
          if (!partnerTotals[pName]) {
            partnerTotals[pName] = { value: 0, tier: pTier };
          }
          partnerTotals[pName].value += bill;
        });
      }

      const revenueData = Object.keys(dayTotals).map(day => ({ day, revenue: dayTotals[day] }));
      const breakdownArray = Object.entries(partnerTotals).map(([name, { value, tier }]) => ({ name, value, tier })).sort((a, b) => b.value - a.value);

      setTotalNetworkRevenue(totalRev);
      setGlobalRevenueData(revenueData);
      setPartnerBreakdown(breakdownArray);
      return { totalRev, revenueData, breakdownArray, merchantTierMap };
    } catch (error) { return null; }
  };

  const generateGlobalBIPayload = async (days) => {
    const result = await fetchGlobalDashboardData(days);
    if (!result) return { error: 'Data fetch failed' };
    return {
      timeframe: `Last ${days} Days`,
      total_network_revenue_inr: result.totalRev,
      partner_performance_breakdown: result.breakdownArray.map(p => ({
        name: p.name,
        revenue_inr: p.value,
        tier: p.tier
      }))
    };
  };

  const executeAnalysis = async (e, reportType = 'CUSTOM') => {
    if (e) e.preventDefault();
    if (isAnalyzing) return;
    const userPromptText = reportType === 'CUSTOM' ? query : `Generate a ${reportType} Network Business Intelligence Report.`;
    if (!userPromptText.trim()) return;

    const userMsg = { role: 'user', content: userPromptText };
    setChatLog(prev => [...prev, userMsg]);
    setQuery('');
    setIsAnalyzing(true);
    
    try {
      const days = reportType === 'MONTHLY' ? 30 : 7;
      const accurateDataPayload = await generateGlobalBIPayload(days);
      
      const systemPrompt = `You are FOODY, the strategic AI Chief of Staff. SCOPE: OMNI-NETWORK. DATA: ${JSON.stringify(accurateDataPayload)}. MISSION: Audit partner performance and suggest network strategies.`;

      const response = await fetch('/api/analyst', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...chatLog, userMsg], systemPrompt: systemPrompt })
      });
      const data = await response.json();
      setChatLog(prev => [...prev, { role: 'assistant', content: data.text || "FOODY CORE OFFLINE." }]);
    } catch (error) { 
      setChatLog(prev => [...prev, { role: 'assistant', content: `BI ERROR: ${error.message}` }]); 
    } 
    finally { setIsAnalyzing(false); }
  };

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-transparent text-black font-mono flex flex-col items-center justify-center p-4 relative z-50">
        <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative z-10 backdrop-blur-md">
          <h1 className="text-3xl font-black uppercase mb-6 border-b-4 border-black pb-4 text-purple-600">
            Global Command
          </h1>
          {errorMsg && <div className="bg-red-100 border-4 border-red-500 text-red-600 p-3 mb-4 text-xs font-black uppercase">{errorMsg}</div>}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="email" placeholder="Director Override ID" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-4 border-black p-3 font-bold" required />
            <input type="password" placeholder="Passcode" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-4 border-black p-3 font-bold" required />
            <button type="submit" disabled={isAuthenticating} className="bg-purple-600 text-white font-black uppercase py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
              {isAuthenticating ? 'Authorizing...' : 'Enter Override'}
            </button>
          </form>
          <button onClick={onExit} className="w-full mt-6 font-bold text-xs text-gray-500 hover:text-black uppercase border-t-2 border-black pt-4">[ Back to Hub ]</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-black font-sans p-4 md:p-8 flex flex-col items-center relative w-full overflow-y-auto pt-12">
      <div className="w-full max-w-[1440px] flex flex-col flex-1 gap-8 relative z-10 h-full">
        
        {/* --- HEADER --- */}
        <div className="border-b-4 border-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 bg-white/80 backdrop-blur-md p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <span className="bg-purple-600 text-white px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                Tier: OMNI-DIRECTOR
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-purple-600" style={{ WebkitTextStroke: "1.5px #000" }}>
              COMMAND CENTER
            </h1>

            <div className="flex flex-wrap gap-3 mt-4">
              <NavTab label="Intelligence" subLabel="Network AI" onClick={() => setActiveView('DASHBOARD')} isActive={activeView === 'DASHBOARD'} accentColor="bg-purple-500" />
              <NavTab label="Recipe HQ" subLabel="Global Control" onClick={() => setActiveView('RECIPES')} isActive={activeView === 'RECIPES'} accentColor="bg-purple-500" />
              <NavTab label="Partner HQ" subLabel="Expansion" onClick={() => setActiveView('PARTNERS')} isActive={activeView === 'PARTNERS'} accentColor="bg-red-600" />
            </div>
          </div>
          
          <button onClick={handleLogout} className="border-4 border-black bg-black text-white font-black py-2 text-xs hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all uppercase px-6">
            Secure Disconnect
          </button>
        </div>

        {/* --- DASHBOARD VIEW --- */}
        {activeView === 'DASHBOARD' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 h-auto">
             <div className="lg:col-span-2 flex flex-col gap-8">
               <div className="bg-white/95 backdrop-blur-md border-4 border-black p-6 h-[320px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                 <h2 className="text-sm font-black uppercase mb-4 border-b-2 border-black pb-1 inline-block">Global Network Revenue</h2>
                 <ResponsiveContainer width="100%" height="80%">
                   <BarChart data={globalRevenueData}>
                     <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{border: '4px solid black', borderRadius: 0, fontWeight: 900}} />
                     <Bar dataKey="revenue" fill="#a855f7" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
               
               <div className="grid grid-cols-2 gap-8 h-[280px]">
                 <div className="bg-white/95 backdrop-blur-md border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                   <h2 className="text-sm font-black uppercase mb-2 border-b-2 border-black pb-1 inline-block">Partner Breakdown</h2>
                   <div className="flex-1 min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie data={partnerBreakdown} innerRadius={40} outerRadius={60} dataKey="value" stroke="black" strokeWidth={2}>
                           {partnerBreakdown.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                         </Pie>
                         <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{border: '4px solid black', borderRadius: 0, fontWeight: 900}} />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
                 <div className="bg-white/95 backdrop-blur-md border-4 border-black p-6 flex flex-col justify-center items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center overflow-hidden">
                   <p className="text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Total Network Value (7D)</p>
                   <p className="text-4xl lg:text-5xl xl:text-6xl font-black text-purple-600 truncate w-full px-2">
                     ₹{totalNetworkRevenue.toLocaleString('en-IN')}
                   </p>
                 </div>
               </div>
             </div>

             <div className="flex flex-col h-[632px] bg-black/90 backdrop-blur-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:col-span-1">
              <div className="bg-purple-600 p-3 border-b-4 border-black flex justify-between items-center shrink-0">
                <span className="text-white font-black uppercase text-xs tracking-widest">Foody: Chief of Staff</span>
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              </div>
              
              <div className="flex gap-2 p-3 bg-black border-b-2 border-gray-800 shrink-0 flex-wrap">
                <button onClick={(e) => executeAnalysis(e, 'WEEKLY')} className="bg-gray-800 border-2 border-gray-600 px-2 py-1 font-black text-[10px] text-white uppercase hover:bg-gray-700 transition-all">
                  [ 7D Intel ]
                </button>
                <button onClick={(e) => executeAnalysis(e, 'MONTHLY')} className="bg-gray-800 border-2 border-gray-600 px-2 py-1 font-black text-[10px] text-white uppercase hover:bg-gray-700 transition-all">
                  [ 30D Audit ]
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent scrollbar-hide min-h-0">
                <div className="text-purple-400 font-mono opacity-70 text-xs">&gt; FOODY EXECUTIVE CORE ONLINE.</div>
                {chatLog.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 max-w-[90%] font-black border-2 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-white text-black border-black shadow-[3px_3px_0px_0px_rgba(168,85,247,1)]' : 'bg-gray-900 text-purple-300 border-purple-900 whitespace-pre-wrap'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAnalyzing && <div className="text-purple-400 font-mono text-[10px] animate-pulse">&gt; FOODY COMPILING NETWORK DATA...</div>}
                <div ref={chatScrollRef} />
              </div>
              <form onSubmit={(e) => executeAnalysis(e, 'CUSTOM')} className="p-3 bg-black border-t-2 border-gray-800 flex gap-2 shrink-0">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-[#111] border-2 border-gray-700 p-2 text-white font-mono text-xs focus:border-purple-500 outline-none" placeholder="Ask strategy..." />
                <button type="submit" className="bg-purple-600 border-2 border-black px-4 font-black text-xs text-white uppercase">Run</button>
              </form>
            </div>
           </div>
        )}

        {activeView === 'RECIPES' && (<Admin onExit={() => setActiveView('DASHBOARD')} />)}
        {activeView === 'PARTNERS' && (<PartnerHQ />)}
      </div>
    </div>
  );
}