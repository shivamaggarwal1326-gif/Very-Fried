import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // FIXED: Standardized import
import imageCompression from 'browser-image-compression';

export default function Foody({ 
  isOpen, 
  onToggle, 
  activeRecipeData, 
  currentStageIndex, 
  onGeneratedRecipe, 
  recipeDictionary,
  tutorialMessage, 
  onClearTutorial  
}) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false); 
  const [displayedText, setDisplayedText] = useState(""); 
  
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'HI, MY NAME IS FOODY. I AM THE COMMAND CENTER SOUS-CHEF. I KNOW EVERY DISH, CATEGORY, AND DIET IN THIS DATABASE. TELL ME WHAT IS IN THE FRIDGE, UPLOAD A PHOTO, OR ASK FOR A RECOMMENDATION.' }
  ]);
  
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null); 

  // Auto-scroll for the chat interface
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, isTyping, isScanning, isOpen]);

  // TYPEWRITER EFFECT FOR TUTORIALS
  useEffect(() => {
    if (tutorialMessage && isOpen) {
      let i = 0;
      setDisplayedText("");
      const interval = setInterval(() => {
        setDisplayedText(tutorialMessage.slice(0, i));
        i++;
        if (i > tutorialMessage.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [tutorialMessage, isOpen]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    // Filter out previous loading messages
    const cleanHistory = chatHistory.filter(msg => msg.content !== '[UPLOADING PANTRY INTEL...]');
    setChatHistory([...cleanHistory, { role: 'user', content: '[UPLOADING PANTRY INTEL...]' }]);

    try {
      // 1. THE COMPRESSION ENGINE (Fixes Vercel 413 Payload Error)
      const compressionOptions = {
        maxSizeMB: 0.5, 
        maxWidthOrHeight: 1024, 
        useWebWorker: true, 
      };
      
      const compressedFile = await imageCompression(file, compressionOptions);
      const base64Image = await convertToBase64(compressedFile);

      // 2. VERCEL AI SDK MULTI-MODAL FORMAT
      const userMessage = { 
        role: 'user', 
        content: [
          { type: 'text', text: 'I am scanning these ingredients. What menu protocols match this? If none, output JSON for a new recipe loadout.' },
          { type: 'image', image: base64Image }
        ] 
      };

      // 3. SEND DIRECTLY TO SECURE ANTHROPIC BRIDGE
      await executeLogicModel(null, [...cleanHistory, userMessage]);

    } catch (error) {
      console.error(error);
      setChatHistory(prev => {
         const filtered = prev.filter(msg => msg.content !== '[UPLOADING PANTRY INTEL...]');
         return [...filtered, { role: 'assistant', content: `SCANNER ERROR: ${error.message}` }];
      });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const executeLogicModel = async (userText, currentHistory) => {
    setIsTyping(true);
    
    let newHistory = currentHistory;
    if (userText) {
       newHistory = [...currentHistory, { role: 'user', content: userText }];
    }
    setChatHistory(newHistory);

    try {
      let systemPrompt = "";

      if (activeRecipeData) {
        const activeRecipeDetails = JSON.stringify({
           title: activeRecipeData.title,
           ingredients: activeRecipeData.prep,
           equipment: activeRecipeData.equipment,
           stages: activeRecipeData.stages
        });
        systemPrompt = `You are Foody, a culinary AI. The operative is currently executing this exact recipe loadout: ${activeRecipeDetails}. The active phase is Stage ${currentStageIndex + 1}. You perfectly understand all ingredients, steps, and utensils for this recipe. Answer cooking questions brutally and concisely based on this data. Do NOT generate JSON.`;
      } else {
        let catalog = "";
        if (recipeDictionary) {
           const completeDB = Object.values(recipeDictionary).map(r => ({
               id: r.id, 
               title: r.title, 
               ingredients: r.prep, 
               equipment: r.equipment, 
               steps: r.stages
           }));
           catalog = JSON.stringify(completeDB);
        }

        systemPrompt = `You are Foody, a culinary AI. 
        APP STRUCTURE: Filters: DIET (VEG, NON-VEG, EGG, ALL), CLASS (FAMILY FOOD, MUNCHIES, BAKERY, HEALTHY, SAUCES, SUMMER SPECIAL).
        OFFICIAL DATABASE MEMORY: ${catalog}. 
        
        You have direct access to all recipe ingredients, utensils, and steps in the OFFICIAL DATABASE MEMORY. If asked for recommendations, cross-reference this database and reply in plain text.
        
        HOWEVER, if the user uploads an image of ingredients or requests a custom dish, output ONLY valid JSON for a new recipe loadout. 
        JSON Structure: {"id": "gen-dish", "title": "[Clean Name]", "xp": 250, "diet": "VEG/NON-VEG/EGG", "category": "MUNCHIES/FAMILY FOOD/ETC", "nutrients": {"calories": 450, "protein": 25, "carbs": 30, "fats": 15}, "miseEnPlace": {"equipment": ["pan"], "ingredients": {"Loadout": ["item 1"]}}, "stages": [{"stageId": 1, "name": "PREP", "tasks": ["Task 1"], "burnerOne": null, "burnerTwo": null}]}. 
        ESTIMATE NUTRIENTS REASONABLY. Do NOT wrap the JSON in markdown blocks like \`\`\`json, just output the raw object. Do NOT use the word "Tactical" in the title.`;
      }

      // ROUTE TO THE RATE-LIMITED SECURE ENDPOINT
      const payload = {
        messages: newHistory,
        systemPrompt: systemPrompt
      };

      const response = await fetch("/api/analyst", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Comms Failure");

      // PARSE VERCEL AI SDK FORMAT
      let responseText = data.text;

      try {
        if (responseText.includes('miseEnPlace') && responseText.includes('stages')) {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedRecipe = JSON.parse(jsonMatch[0]);
            
            // FIXED: Safety lock to prevent app crash if prop is missing
            if (onGeneratedRecipe) {
              onGeneratedRecipe(parsedRecipe); 
            } else {
              console.warn("VeryFryd: Recipe generated, but onGeneratedRecipe prop is missing.");
            }
            
            responseText = "NEW LOADOUT ACQUIRED. ROUTING TO PREP PHASE NOW.";
          }
        }
      } catch (parseError) {
        console.log("Not a JSON payload, treating as text conversation.");
      }

      setChatHistory(prev => {
        const filtered = prev.filter(msg => msg.content !== '[UPLOADING PANTRY INTEL...]');
        return [...filtered, { role: 'assistant', content: responseText }];
      });

    } catch (error) {
      console.error(error);
      setChatHistory(prev => {
        const filtered = prev.filter(msg => msg.content !== '[UPLOADING PANTRY INTEL...]');
        return [...filtered, { role: 'assistant', content: `ERROR: ${error.message}` }];
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isScanning) return;
    const userMsg = input;
    setInput('');
    executeLogicModel(userMsg, chatHistory);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
            className="fixed top-0 right-0 h-full w-[280px] md:w-[350px] bg-[#111] border-l-4 border-red-600 z-[900] flex flex-col font-mono text-[10px] md:text-xs pt-16 md:pt-20">
            
            {/* HEADER */}
            <div className="bg-red-600 text-[#fcfbf9] p-3 border-y-4 border-black flex justify-between items-center shrink-0">
              <span className="font-black tracking-widest uppercase">Foody Secure Link</span>
              
              <div className="flex items-center gap-3">
                <span className="text-[8px] animate-pulse bg-black px-2 py-0.5 text-red-500">REC: ON</span>
                <button 
                  onClick={() => {
                    if (tutorialMessage) onClearTutorial();
                    onToggle();
                  }}
                  className="text-xl font-black leading-none hover:text-black transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* DYNAMIC VIEW: Tutorial Mode vs Chat Mode */}
            {tutorialMessage ? (
              
              // --- TUTORIAL OVERLAY VIEW ---
              <div className="flex-grow flex flex-col items-center justify-center p-6 text-center gap-6 bg-[#0a0000]">
                {/* Massive Foody Avatar */}
                <div className="w-20 h-20 rounded-full bg-red-600 border-2 border-black flex flex-col items-center justify-center relative shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.3)] animate-bounce">
                  <div className="absolute -top-1 w-6 h-4 bg-green-500 border-2 border-black rounded-tl-full rounded-br-full rotate-12 z-20"></div>
                  <div className="flex gap-1.5 mb-1.5"><div className="w-2.5 h-3.5 bg-black rounded-full"></div><div className="w-2.5 h-3.5 bg-black rounded-full"></div></div>
                  <div className="w-5 h-2 bg-black rounded-b-full"></div>
                </div>

                {/* Typewriter Text Box */}
                <div className="bg-[#330000] border-2 border-red-600 text-red-100 p-4 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] w-full text-left">
                  <p className="font-bold text-[11px] md:text-xs uppercase leading-relaxed min-h-[100px]">
                    {displayedText}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    onClearTutorial(); 
                    onToggle(); 
                  }}
                  className="mt-4 bg-[#fcfbf9] text-black border-2 border-black font-black uppercase px-6 py-3 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:shadow-none hover:translate-y-1 hover:bg-black hover:text-white transition-all w-full"
                >
                  Understood
                </button>
              </div>

            ) : (

              // --- STANDARD CHAT & SCANNER VIEW ---
              <>
                <div ref={scrollRef} className="flex-grow p-3 overflow-y-auto flex flex-col gap-4 bg-[#0a0000]">
                  {chatHistory.map((log, i) => (
                    <div key={i} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start gap-2'}`}>
                      
                      {log.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-red-600 border border-black flex flex-col items-center justify-center relative shrink-0 shadow-[inset_-1px_-1px_0px_rgba(0,0,0,0.3)] mt-1">
                          <div className="absolute -top-1 w-3 h-2 bg-green-500 border border-black rounded-tl-full rounded-br-full rotate-12 z-20"></div>
                          <div className="flex gap-0.5 mb-0.5"><div className="w-1 h-1.5 bg-black rounded-full"></div><div className="w-1 h-1.5 bg-black rounded-full"></div></div>
                          <div className="w-2 h-1 bg-black rounded-b-full"></div>
                        </div>
                      )}

                      <span className={`px-3 py-2 border-2 font-bold uppercase tracking-tight max-w-[85%] ${log.role === 'user' ? 'border-black text-black bg-[#fcfbf9]' : 'border-red-600 text-red-100 bg-[#330000] shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]'}`}>
                        {typeof log.content === 'string' ? log.content : '[MULTIMODAL PAYLOAD]'}
                      </span>
                    </div>
                  ))}
                  {(isTyping || isScanning) && <div className="text-red-500 animate-pulse uppercase font-black pl-8">FOODY IS PROCESSING...</div>}
                </div>
                
                <form onSubmit={handleSend} className="p-3 border-t-4 border-red-600 bg-[#111] flex gap-2 shrink-0 items-center">
                  
                  <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current.click()} disabled={isTyping || isScanning} className="bg-gray-800 text-white p-2 border border-gray-600 hover:bg-red-600 hover:border-red-600 transition-colors shrink-0 flex items-center justify-center disabled:opacity-50" title="Scan Pantry">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 md:w-6 md:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={isTyping || isScanning} placeholder="QUERY/UPLOAD..." className="flex-grow bg-[#220000] border-2 border-red-900 text-[#fcfbf9] p-2 focus:outline-none focus:border-red-500" />
                  <button type="submit" disabled={isTyping || isScanning} className="bg-red-600 text-white font-black px-3 py-2 border-2 border-black transition-colors hover:bg-white hover:text-red-600 disabled:opacity-50">SEND</button>
                </form>
              </>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}