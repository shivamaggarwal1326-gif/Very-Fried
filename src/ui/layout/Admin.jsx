import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Admin() {
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST' | 'NEW' | 'EDIT'
  const [recipes, setRecipes] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState(null);
  
  const [rawText, setRawText] = useState('');
  const [statusLogs, setStatusLogs] = useState(['> GLOBAL RECIPE NETWORK ONLINE.']);
  const [isProcessing, setIsProcessing] = useState(false);
  const logScrollRef = useRef(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (logScrollRef.current) logScrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [statusLogs, isProcessing, viewMode]);

  const fetchRecipes = async () => {
    logStatus('SYNCING WITH CLOUD DATABASE...');
    // BUG FIXED: Removed the .order('created_at') so it doesn't crash on the missing column
    const { data, error } = await supabase.from('recipes').select('*');
    
    if (data) {
      setRecipes(data);
      logStatus(`SYNC COMPLETE. ${data.length} PROTOCOLS FOUND.`);
    }
    if (error) logStatus(`SYNC ERROR: ${error.message}`);
  };

  const logStatus = (msg) => {
    setStatusLogs(prev => [...prev, `> ${msg}`]);
  };

  // --- 1. CREATE: The AI Parser ---
  const processAndDeployNew = async () => {
    if (!rawText.trim()) { logStatus('ERROR: NO INTEL DETECTED.'); return; }
    setIsProcessing(true);
    logStatus('INITIATING LLaMA-3.3-70B FORMATTING PROTOCOL...');

    try {
      const systemPrompt = `You are a strict data parser. Convert the provided raw recipe text into the exact JSON format required by the application. 
      JSON Structure MUST match this exactly:
      {
        "id": "url-friendly-name-no-spaces",
        "title": "Clean Name",
        "time": "X MINS",
        "desc": "Short tactical description.",
        "diet": "VEG", "NON-VEG", or "EGG",
        "category": "MUNCHIES", "FAMILY FOOD", "BAKERY", "HEALTHY", "SAUCES", or "SUMMER SPECIAL",
        "xp": 150,
        "nutrients": { "calories": 0, "protein": 0, "carbs": 0, "fats": 0 },
        "prep": ["ingredient 1", "ingredient 2"],
        "equipment": ["pan", "knife"],
        "price": 199,
        "cost_price": 60,
        "stages": [
          {
            "stageId": 1,
            "name": "PREP",
            "tasks": ["Chop onions", { "text": "Boil water", "timer": 600 }],
            "burnerOne": null,
            "burnerTwo": null
          }
        ]
      }
      ESTIMATE NUTRIENTS AND PRICES IF MISSING. DO NOT use Markdown formatting (\`\`\`json). Output RAW JSON ONLY.`;

      const payload = {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: rawText }]
      };

      const response = await fetch("/api/groq", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Secure routing failed.");

      logStatus('LLaMA-3.3 SUCCESS: JSON BLOCKS GENERATED.');
      
      let outputText = data.choices[0].message.content.trim();
      if (outputText.startsWith('```json')) outputText = outputText.replace(/^```json/, '').replace(/```$/, '').trim();
      else if (outputText.startsWith('```')) outputText = outputText.replace(/^```/, '').replace(/```$/, '').trim();

      let recipeJSON;
      try { recipeJSON = JSON.parse(outputText); } catch (err) { throw new Error("AI returned malformed JSON."); }

      logStatus('INITIATING CLOUD DEPLOYMENT TO SUPABASE...');
      const { error: dbError } = await supabase.from('recipes').insert([{ id: recipeJSON.id, data: recipeJSON }]);
      if (dbError) throw dbError;

      logStatus(`SUCCESS! [${recipeJSON.title}] IS LIVE ON THE NETWORK.`);
      setRawText('');
      await fetchRecipes();
      setViewMode('LIST');

    } catch (err) {
      logStatus(`CRITICAL FAILURE: ${err.message}`);
    } finally { setIsProcessing(false); }
  };

  // --- 2. UPDATE: Direct JSON Override ---
  const handleUpdate = async () => {
    setIsProcessing(true);
    logStatus('VALIDATING JSON STRUCTURE...');
    try {
      const parsedData = JSON.parse(rawText);
      logStatus('JSON VALID. DEPLOYING DIRECT OVERRIDE...');
      
      const { error } = await supabase.from('recipes').update({ data: parsedData }).eq('id', activeRecipe.id);
      if (error) throw error;
      
      logStatus(`SUCCESS: [${activeRecipe.id}] NETWORK PROTOCOL OVERWRITTEN.`);
      setRawText('');
      await fetchRecipes();
      setViewMode('LIST');
    } catch (err) {
      logStatus(`FORMAT ERROR: ${err.message}. Check JSON syntax.`);
    } finally { setIsProcessing(false); }
  };

  // --- 3. DELETE: Purge from Network ---
  const handleDelete = async (recipeId) => {
    if(!window.confirm("WARNING: This will instantly wipe this recipe from all consumer and merchant terminals globally. Proceed?")) return;
    
    setIsProcessing(true);
    logStatus(`INITIATING PURGE PROTOCOL FOR [${recipeId}]...`);
    
    const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
    
    if (error) {
      logStatus(`PURGE FAILED: ${error.message}`);
    } else {
      logStatus(`SUCCESS: [${recipeId}] EXPUNGED FROM GLOBAL NETWORK.`);
      if (activeRecipe?.id === recipeId) setViewMode('LIST');
      await fetchRecipes();
    }
    setIsProcessing(false);
  };

  // UI Handlers
  const openNewMode = () => { setRawText(''); setViewMode('NEW'); logStatus("AI FORGE OPEN. AWAITING RAW TEXT."); };
  const openEditMode = (recipe) => { 
    setActiveRecipe(recipe); 
    setRawText(JSON.stringify(recipe.data, null, 2)); 
    setViewMode('EDIT'); 
    logStatus(`DIRECT OVERRIDE MODE: [${recipe.id}]. MODIFY JSON CAREFULLY.`); 
  };
  const cancelToNetwork = () => { setRawText(''); setActiveRecipe(null); setViewMode('LIST'); logStatus("RETURNED TO NETWORK OVERVIEW."); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 h-auto min-h-[632px]">
      
      {/* LEFT COLUMN: THE WORKSPACE */}
      <div className="lg:col-span-2 flex flex-col w-full h-full bg-white/95 backdrop-blur-md border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* Workspace Header */}
        <div className="flex justify-between items-center border-b-4 border-black p-4 shrink-0 bg-gray-50">
          <h2 className="text-sm font-black uppercase text-black tracking-widest">
            {viewMode === 'LIST' ? 'Global Recipe Database' : viewMode === 'NEW' ? 'AI Intel Forge' : 'Direct JSON Override'}
          </h2>
          <div className="flex gap-2">
            {viewMode !== 'LIST' && <button onClick={cancelToNetwork} className="text-[10px] font-black uppercase text-gray-600 bg-gray-200 px-2 py-1 border-2 border-gray-600 hover:bg-gray-300">CANCEL</button>}
            {viewMode === 'LIST' && <button onClick={openNewMode} className="text-[10px] font-black uppercase text-purple-600 bg-purple-100 px-2 py-1 border-2 border-purple-600 hover:bg-purple-200 hover:shadow-sm">+ ADD NEW INTEL</button>}
          </div>
        </div>

        {/* WORKSPACE CONTENT ROUTER */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* MODE 1: LIST */}
          {viewMode === 'LIST' && (
            <div className="absolute inset-0 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-100">
              {recipes.length === 0 ? (
                <div className="col-span-full flex items-center justify-center h-full text-xs font-black text-gray-400 uppercase italic">No protocols found on network.</div>
              ) : (
                recipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2 relative group">
                    <div className="flex justify-between items-start">
                      <span className="font-black text-sm uppercase truncate pr-4">{recipe.data?.title || recipe.id}</span>
                      <span className="text-[9px] font-bold uppercase bg-gray-200 px-1 border border-black">{recipe.data?.category || 'UNKNOWN'}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold truncate">{recipe.data?.desc || 'No description available.'}</p>
                    <div className="flex justify-between items-center mt-2 border-t-2 border-gray-100 pt-2">
                      <span className="text-[10px] font-black uppercase text-green-600">₹{recipe.data?.price || '???'}</span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditMode(recipe)} className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 hover:bg-gray-800">EDIT</button>
                        <button onClick={() => handleDelete(recipe.id)} className="text-[10px] font-black uppercase bg-red-100 text-red-600 border border-red-600 px-2 py-1 hover:bg-red-600 hover:text-white transition-colors">PURGE</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MODE 2: NEW (AI FORGE) */}
          {viewMode === 'NEW' && (
            <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col">
              <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                disabled={isProcessing}
                placeholder="Paste human-readable ingredients and steps. The AI will translate it to machine code..."
                className="relative z-10 flex-1 w-full p-6 bg-transparent text-green-400 font-mono text-sm outline-none resize-none placeholder-green-900 focus:ring-inset focus:ring-4 focus:ring-purple-600 transition-all"
                spellCheck="false"
              />
            </div>
          )}

          {/* MODE 3: EDIT (JSON OVERRIDE) */}
          {viewMode === 'EDIT' && (
            <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col">
              <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="bg-yellow-400 text-black font-black text-[10px] text-center py-1 uppercase tracking-widest relative z-10 border-b-2 border-black">
                ⚠ WARNING: DIRECT JSON OVERRIDE. INVALID SYNTAX WILL CRASH DEPLOYMENT. ⚠
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                disabled={isProcessing}
                className="relative z-10 flex-1 w-full p-6 bg-transparent text-yellow-500 font-mono text-sm outline-none resize-none focus:ring-inset focus:ring-4 focus:ring-yellow-600 transition-all"
                spellCheck="false"
              />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: STATUS TERMINAL */}
      <div className="flex flex-col h-full bg-black/90 backdrop-blur-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:col-span-1">
        
        {/* Terminal Header */}
        <div className="bg-red-600 p-3 border-b-4 border-black flex justify-between items-center shrink-0">
          <span className="text-white font-black uppercase text-xs tracking-widest">Status Terminal</span>
          <div className={`w-2 h-2 rounded-full bg-white ${isProcessing ? 'animate-pulse' : ''}`}></div>
        </div>

        {/* Logs Output */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-transparent scrollbar-hide min-h-[300px]">
          {statusLogs.map((log, i) => (
            <div key={i} className={`font-mono text-[10px] uppercase break-words leading-relaxed ${log.includes('FAILURE') || log.includes('ERROR') || log.includes('PURGE FAILED') ? 'text-red-500 font-bold' : log.includes('SUCCESS') ? 'text-green-400' : log.includes('WARNING') ? 'text-yellow-400' : 'text-gray-400'}`}>
              {log}
            </div>
          ))}
          {isProcessing && <div className="text-blue-400 font-mono text-[10px] animate-pulse">&gt; EXECUTING DIRECTIVE...</div>}
          <div ref={logScrollRef} />
        </div>

        {/* Dynamic Action Button */}
        <div className="p-4 bg-gray-900 border-t-4 border-black shrink-0">
          {viewMode === 'LIST' ? (
             <button disabled className="w-full py-4 font-black uppercase tracking-widest text-xs border-4 border-black bg-gray-800 text-gray-500 cursor-not-allowed">
               STANDBY
             </button>
          ) : viewMode === 'NEW' ? (
            <button onClick={processAndDeployNew} disabled={isProcessing || !rawText.trim()} className={`w-full py-4 font-black uppercase tracking-widest text-xs border-4 border-black transition-all ${isProcessing || !rawText.trim() ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none hover:bg-purple-700'}`}>
              {isProcessing ? 'Deploying...' : 'Format & Deploy To Cloud'}
            </button>
          ) : (
            <button onClick={handleUpdate} disabled={isProcessing || !rawText.trim()} className={`w-full py-4 font-black uppercase tracking-widest text-xs border-4 border-black transition-all ${isProcessing || !rawText.trim() ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none hover:bg-yellow-600'}`}>
              {isProcessing ? 'Overwriting...' : 'FORCE OVERRIDE UPDATE'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}