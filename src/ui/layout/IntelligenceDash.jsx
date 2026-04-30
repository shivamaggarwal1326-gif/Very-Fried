import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../lib/supabaseClient';

export default function IntelligenceDash({ revenueData, inventoryTelemetry, totalOrders, merchantData, partnershipTier, weatherData, generateBIPayload, chatLog, setChatLog }) {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cooldown, setCooldown] = useState(0); 
  const chatScrollRef = useRef(null);

  const canAccessAI = partnershipTier === 'ELITE_PARTNER' || partnershipTier === 'STEALTH_ELITE';
  const CHART_COLORS = canAccessAI ? ['#22c55e', '#4ade80', '#86efac', '#eab308'] : ['#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8'];

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isAnalyzing]);

  const executeAnalysis = async (e, reportType = 'CUSTOM') => {
    if (e) e.preventDefault();
    if (isAnalyzing || cooldown > 0) return; 
    
    const userPromptText = reportType === 'CUSTOM' ? query : `Generate a ${reportType} Business Intelligence Report.`;
    if (!userPromptText.trim()) return;

    const userMsg = { role: 'user', content: userPromptText };
    
    // 1. Update the UI chatLog with the new message so the user sees it immediately
    const updatedChatLog = [...chatLog, userMsg];
    setChatLog(updatedChatLog);
    setQuery('');
    setIsAnalyzing(true);
    
    try {
      await supabase.from('merchant_chat_history').insert([{ merchant_id: merchantData.id, role: 'user', content: userMsg.content }]);
      
      const days = reportType === 'MONTHLY' ? 30 : 7;
      const accurateDataPayload = await generateBIPayload(days);
      
      let systemPrompt = `You are FOODY, the AI BI Manager for ${merchantData.business_name}. TIER: ${partnershipTier}. 
      DATA: ${JSON.stringify(accurateDataPayload)}. 
      
      CRITICAL EVALUATION HIERARCHY (Must address in this strict order):
      1. IMMEDIATE THREATS: Check 'critical_runout_warnings' (runout < 4 hrs). This MUST be the first thing you mention if present.
      2. BRAND HEALTH: Check 'brand_health_status'. If CHURN_WARNING is active, alert the owner immediately.
      3. ENVIRONMENTAL SYNC: Check 'environmental_intelligence' and see if it conflicts with current inventory or demand.
      4. PERFORMANCE DEFICITS: Check 'live_demand_model' for tracking behind baseline, or 'revpash_metrics' for low seat-hour revenue.
      5. OPPORTUNITIES: Highlight 'top_profit_drivers' and 'frequently_bought_together' pairings.

      RULES: Base math ONLY on provided data. Do not hallucinate numbers. Be concise and authoritative. Frame recommendations with confidence levels.`;
      
      if (partnershipTier === 'STEALTH_ELITE') {
        systemPrompt += ` ENVIRONMENTAL DATA: ${weatherData.temp}°C, ${weatherData.condition}. MISSION: Generate physical in-house whiteboard offers to upsell walk-in customers today.`;
      } else if (partnershipTier === 'ELITE_PARTNER') {
        systemPrompt += ` ENVIRONMENTAL DATA: ${weatherData.temp}°C, ${weatherData.condition}. MISSION: Trigger "WHATSAPP SNIPER." Suggest geofenced notifications and XP multipliers to draw in users.`;
      }

      // --- CRITICAL FIX: SLIDING WINDOW CONTEXT ---
      // We slice the chatLog to only send the last 10 messages (including the new userMsg). 
      // This prevents the API payload from growing exponentially while maintaining enough conversational memory.
      const payloadMessages = updatedChatLog.slice(-10);

      const response = await fetch('/api/analyst', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ messages: payloadMessages, systemPrompt: systemPrompt }) 
      });
      
      const data = await response.json();
      const aiResponseText = data.text || "FOODY CORE OFFLINE.";
      
      await supabase.from('merchant_chat_history').insert([{ merchant_id: merchantData.id, role: 'assistant', content: aiResponseText }]);
      
      // Update UI with the AI's response
      setChatLog(prev => [...prev, { role: 'assistant', content: aiResponseText }]);
      
      setCooldown(60);

    } catch (error) { 
      setChatLog(prev => [...prev, { role: 'assistant', content: `BI ERROR: ${error.message}` }]); 
      setCooldown(10); 
    } 
    finally { setIsAnalyzing(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 h-auto">
      {/* LEFT COLUMN: VISUAL DASHBOARDS */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <div className="bg-white/95 backdrop-blur-md border-4 border-black p-6 h-[320px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-black font-black uppercase mb-4 border-b-2 border-black pb-1 inline-block">Revenue Forecasting</h2>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={revenueData}>
              <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{border: '4px solid black', borderRadius: 0, fontWeight: 900}} />
              <Bar dataKey="revenue" fill="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-8 h-[280px]">
          <div className="bg-white/95 backdrop-blur-md border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-black font-black uppercase mb-2 border-b-2 border-black pb-1 inline-block">Demand Cycles</h2>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={inventoryTelemetry} innerRadius={40} outerRadius={60} dataKey="value" stroke="black" strokeWidth={2}>
                  {inventoryTelemetry.map((e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{border: '4px solid black', borderRadius: 0, fontWeight: 900}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/95 backdrop-blur-md border-4 border-black p-6 flex flex-col justify-center items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center">
            <p className="text-xs font-black uppercase text-gray-500 mb-4 tracking-widest">Cycle Volume</p>
            <p className="text-6xl lg:text-8xl font-black text-black">{totalOrders}</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: FOODY AI TERMINAL */}
      <div className="flex flex-col h-[632px] bg-black/90 backdrop-blur-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:col-span-1">
        <div className="bg-blue-600 p-3 border-b-4 border-black flex justify-between items-center shrink-0">
          <span className="text-white font-black uppercase text-xs tracking-widest">Foody AI Assistant</span>
          {cooldown > 0 && <span className="text-red-400 font-black text-[10px] animate-pulse">API COOLDOWN: {cooldown}S</span>}
        </div>
        <div className="flex gap-2 p-3 bg-black border-b-2 border-gray-800 shrink-0 flex-wrap">
          <button onClick={(e) => executeAnalysis(e, 'WEEKLY')} disabled={isAnalyzing || cooldown > 0} className={`border-2 px-2 py-1 font-black text-[10px] uppercase transition-all ${cooldown > 0 ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'}`}>[ Weekly ]</button>
          <button onClick={(e) => executeAnalysis(e, 'MONTHLY')} disabled={isAnalyzing || cooldown > 0} className={`border-2 px-2 py-1 font-black text-[10px] uppercase transition-all ${cooldown > 0 ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'}`}>[ Monthly ]</button>
          <button onClick={(e) => executeAnalysis(e, 'PREDICTIVE')} disabled={isAnalyzing || !canAccessAI || cooldown > 0} className={`border-2 px-2 py-1 font-black text-[10px] uppercase transition-all ${canAccessAI && cooldown === 0 ? 'bg-blue-900 border-blue-500 text-white hover:bg-blue-800' : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'}`}>{!canAccessAI ? '[ Locked ]' : cooldown > 0 ? `[ Wait ${cooldown}s ]` : '[ Predictive ]'}</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent scrollbar-hide min-h-0">
          <div className="text-blue-400 font-mono opacity-70 text-xs">&gt; FOODY CORE STANDBY.</div>
          {chatLog.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 max-w-[90%] font-black border-2 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-white text-black border-black shadow-[3px_3px_0px_0px_rgba(59,130,246,1)]' : 'bg-gray-900 text-blue-300 border-blue-900 whitespace-pre-wrap'}`}>{msg.content}</div>
            </div>
          ))}
          {isAnalyzing && <div className="text-blue-400 font-mono text-[10px] animate-pulse">&gt; FOODY SYNCING TELEMETRY...</div>}
          <div ref={chatScrollRef} />
        </div>
        
        <form onSubmit={(e) => executeAnalysis(e, 'CUSTOM')} className="p-3 bg-black border-t-2 border-gray-800 flex gap-2 shrink-0">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} disabled={isAnalyzing || cooldown > 0} className="flex-1 bg-[#111] border-2 border-gray-700 p-2 text-white font-mono text-xs outline-none disabled:opacity-50" placeholder={cooldown > 0 ? "Systems cooling down..." : "Ask Foody..."} />
          <button type="submit" disabled={isAnalyzing || cooldown > 0} className={`border-2 px-4 font-black text-xs uppercase transition-all ${cooldown > 0 ? 'bg-gray-800 border-black text-gray-500 cursor-not-allowed' : 'bg-blue-600 border-black text-white hover:bg-blue-700'}`}>Run</button>
        </form>
      </div>
    </div>
  );
}