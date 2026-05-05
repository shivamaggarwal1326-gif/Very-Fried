import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import FoodyFaceWidget from './FoodyFaceWidget.jsx';

export default function MenuMatrix({ merchantData, inventoryStock, onMenuUpdate }) {
  const [recipes, setRecipes] = useState([]);
  const [boms, setBoms] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Foody Forge (AI) State
  const [rawText, setRawText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [statusLog, setStatusLog] = useState('');

  // Editor State
  const [editForm, setEditForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Inline delete confirm instead of window.confirm()
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // BOM State
  const [newIngredient, setNewIngredient] = useState({ inventory_item_id: '', quantity_used: '' });

  useEffect(() => {
    if (merchantData?.id) fetchMenuData();
  }, [merchantData?.id]);

  const fetchMenuData = async () => {
    const { data: recipeData } = await supabase
      .from('recipes')
      .select('*')
      .eq('merchant_id', merchantData.id);
    if (recipeData) setRecipes(recipeData);

    const { data: bomData } = await supabase
      .from('menu_item_ingredients')
      .select('id, menu_item_name, quantity_used, inventory_item_id, merchant_inventory (name, unit)')
      .eq('merchant_id', merchantData.id);

    if (bomData) {
      const grouped = {};
      bomData.forEach(row => {
        if (!grouped[row.menu_item_name]) grouped[row.menu_item_name] = [];
        grouped[row.menu_item_name].push({
          id: row.id,
          inventory_item_id: row.inventory_item_id,
          name: row.merchant_inventory?.name || 'Unknown',
          unit: row.merchant_inventory?.unit || '',
          quantity_used: row.quantity_used
        });
      });
      setBoms(grouped);
    }
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setDeleteConfirmId(null);
    setEditForm({
      title: recipe.data.title || '',
      price: recipe.data.price || 0,
      cost_price: recipe.data.cost_price || 0,
      category: recipe.data.category || 'MUNCHIES',
      diet: recipe.data.diet || 'VEG',
      desc: recipe.data.desc || ''
    });
    setNewIngredient({ inventory_item_id: '', quantity_used: '' });
  };

  // 1. THE FOODY FORGE (AI MENU GENERATOR)
  const handleAIGenerate = async () => {
    if (!rawText.trim()) return;
    setIsProcessingAI(true);
    setStatusLog('Foody is architecting the JSON...');

    try {
      const systemPrompt = `You are Foody, the operational AI for VeryFryd POS. Convert the raw text into the exact JSON format.
      JSON MUST match this exactly:
      {
        "id": "url-friendly-name-no-spaces",
        "title": "Clean Name",
        "time": "X MINS",
        "desc": "Short tactical description.",
        "diet": "VEG", "NON-VEG", or "EGG",
        "category": "MUNCHIES", "FAMILY FOOD", "BAKERY", "HEALTHY", "SAUCES", or "SUMMER SPECIAL",
        "xp": 150,
        "price": 199,
        "cost_price": 60,
        "stages": [ { "stageId": 1, "name": "PREP", "tasks": ["Do this", { "text": "Boil", "timer": 60 }] } ]
      }
      ESTIMATE IF MISSING. DO NOT use Markdown formatting. RAW JSON ONLY.`;

      const response = await fetch('/api/analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: rawText }], systemPrompt })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Foody encountered an error.');

      // --- THE SYNTAX FIX IS APPLIED RIGHT HERE ---
      let outputText = data.text.trim();
      if (outputText.startsWith('```json')) {
        outputText = outputText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (outputText.startsWith('```')) {
        outputText = outputText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const recipeJSON = JSON.parse(outputText);

      setStatusLog('Injecting dish into the Menu Matrix...');
      const { error: dbError } = await supabase.from('recipes').insert([{
        id: `${merchantData.id}_${recipeJSON.id}`,
        merchant_id: merchantData.id,
        data: recipeJSON
      }]);

      if (dbError) throw dbError;

      setStatusLog('SUCCESS: Dish added.');
      setRawText('');
      await fetchMenuData();
      if (onMenuUpdate) onMenuUpdate();
      setTimeout(() => setStatusLog(''), 3000);

    } catch (err) {
      setStatusLog(`ERROR: ${err.message}`);
    } finally { setIsProcessingAI(false); }
  };

  // 2. THE EDITOR (PRICE & DETAILS)
  const handleUpdateDetails = async () => {
    setIsSaving(true);
    const updatedData = { ...selectedRecipe.data, ...editForm };

    const { error } = await supabase
      .from('recipes')
      .update({ data: updatedData })
      .eq('id', selectedRecipe.id);

    if (!error) {
      await fetchMenuData();
      if (onMenuUpdate) onMenuUpdate();
      handleSelectRecipe({ ...selectedRecipe, data: updatedData });
    }
    setIsSaving(false);
  };

  // Two-step inline delete
  const handleDeleteItem = async (id) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    await supabase.from('recipes').delete().eq('id', id);
    setSelectedRecipe(null);
    setDeleteConfirmId(null);
    await fetchMenuData();
    if (onMenuUpdate) onMenuUpdate();
  };

  // 3. THE BOM MAPPER
  const handleAddIngredient = async () => {
    const selectedItemName = selectedRecipe?.data?.title;
    
    if (!selectedItemName || !newIngredient.inventory_item_id || !newIngredient.quantity_used) return;

    const { error } = await supabase.from('menu_item_ingredients').insert([{
      merchant_id: merchantData.id,
      menu_item_name: selectedItemName,
      inventory_item_id: newIngredient.inventory_item_id,
      quantity_used: parseFloat(newIngredient.quantity_used)
    }]);

    if (!error) {
      setNewIngredient({ inventory_item_id: '', quantity_used: '' });
      await fetchMenuData();
    }
  };

  const handleRemoveIngredient = async (rowId) => {
    await supabase.from('menu_item_ingredients').delete().eq('id', rowId);
    await fetchMenuData();
  };

  // We still define this here for the UI render logic below
  const selectedItemName = selectedRecipe?.data?.title;
  const currentBOM = selectedItemName ? (boms[selectedItemName] || []) : [];

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-white/95 backdrop-blur-sm border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6 gap-6 w-full">

      {/* LEFT PANE: THE ROSTER */}
      <div className="w-full lg:w-1/3 flex flex-col border-r-0 lg:border-r-4 border-black pr-0 lg:pr-6 pb-6 lg:pb-0 min-h-[300px] lg:min-h-0 shrink-0">
        <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-none mb-1">Menu Matrix</h2>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Command your digital storefront</p>

        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 border-t-4 border-black pt-4">
          {recipes.length === 0 ? (
            <p className="text-[10px] font-black text-gray-400 uppercase">No items on menu. Use Foody Forge to add your first dish.</p>
          ) : (
            recipes.map(recipe => {
              const isActive = selectedRecipe?.id === recipe.id;
              const title = recipe.data.title || 'UNKNOWN';
              const hasBOM = boms[title] && boms[title].length > 0;

              return (
                <button
                  key={recipe.id}
                  onClick={() => handleSelectRecipe(recipe)}
                  className={`w-full text-left p-3 border-[3px] border-black transition-all flex items-center justify-between ${isActive ? 'bg-black text-white translate-x-2 shadow-none' : 'bg-white hover:bg-gray-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1'}`}
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="text-[11px] md:text-xs font-black uppercase truncate">{title}</span>
                    <span className={`text-[9px] font-bold uppercase mt-0.5 ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>₹{recipe.data.price || 0}</span>
                  </div>
                  <div
                    className={`w-3 h-3 border-2 border-black rounded-full shrink-0 ${hasBOM ? 'bg-green-500' : 'bg-red-500'}`}
                    title={hasBOM ? 'BOM Mapped — Inventory auto-deducts on sale' : 'BOM Missing — Map ingredients to enable auto-deduction'}
                  />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: THE FORGE & EDITOR */}
      <div className="w-full lg:w-2/3 flex flex-col min-h-0">

        {/* TOP: THE FOODY FORGE */}
        <div className="mb-6 bg-red-50 border-4 border-black p-4 shrink-0 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
          <div className="flex items-center gap-4 mb-3">
            <div className="scale-75 origin-left -ml-2 -mt-2">
              <FoodyFaceWidget onClick={() => {}} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-red-700">The Foody Forge</h3>
              <p className="text-[9px] font-black uppercase text-red-500">Command Foody to write your recipes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Add Truffle Fries for ₹250. Takes 10 mins. Veg."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isProcessingAI && rawText.trim() && handleAIGenerate()}
              disabled={isProcessingAI}
              className="flex-1 border-2 border-black px-3 py-2 text-[10px] md:text-xs font-bold outline-none focus:ring-2 focus:ring-red-600"
            />
            <button
              onClick={handleAIGenerate}
              disabled={isProcessingAI || !rawText.trim()}
              className="bg-black text-white border-2 border-black px-4 font-black uppercase text-[10px] md:text-xs hover:bg-red-600 disabled:opacity-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5"
            >
              {isProcessingAI ? 'Forging...' : 'Deploy'}
            </button>
          </div>
          {statusLog && (
            <p className={`text-[10px] font-black uppercase mt-2 ${statusLog.startsWith('ERROR') ? 'text-red-600' : statusLog.startsWith('SUCCESS') ? 'text-green-600' : 'text-red-600 animate-pulse'}`}>
              {statusLog}
            </p>
          )}
        </div>

        {/* BOTTOM: THE EDITOR */}
        {!selectedRecipe ? (
          <div className="flex-1 flex items-center justify-center border-4 border-dashed border-gray-300">
            <p className="text-gray-400 font-black uppercase text-[10px] md:text-xs tracking-widest">Select a dish to edit or map ingredients</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-hide gap-6">

            {/* Basic Info Editor */}
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="font-black uppercase text-sm tracking-widest bg-yellow-400 px-2 border-2 border-black">Operational Data</span>

                {deleteConfirmId === selectedRecipe.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteItem(selectedRecipe.id)}
                      className="text-[9px] font-black bg-red-600 text-white uppercase px-2 py-1 border border-black hover:bg-red-700"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="text-[9px] font-black bg-white text-black uppercase px-2 py-1 border border-black hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeleteItem(selectedRecipe.id)}
                    className="text-[9px] font-black text-red-600 hover:underline uppercase"
                  >
                    Delete Item
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-[9px] font-black uppercase text-gray-500 mb-1">Title</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full border-2 border-black px-2 py-1 text-xs font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-gray-500 mb-1">Sell Price (₹)</label>
                  <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})} className="w-full border-2 border-black px-2 py-1 text-xs font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-gray-500 mb-1">Cost Price (₹) — For Foody margin calc</label>
                  <input type="number" value={editForm.cost_price} onChange={e => setEditForm({...editForm, cost_price: parseFloat(e.target.value)})} className="w-full border-2 border-black px-2 py-1 text-xs font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-gray-500 mb-1">Diet</label>
                  <select value={editForm.diet} onChange={e => setEditForm({...editForm, diet: e.target.value})} className="w-full border-2 border-black px-2 py-1 text-[10px] font-bold outline-none bg-white">
                    <option value="VEG">VEG</option>
                    <option value="NON-VEG">NON-VEG</option>
                    <option value="EGG">EGG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase text-gray-500 mb-1">Category</label>
                  <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full border-2 border-black px-2 py-1 text-[10px] font-bold outline-none bg-white">
                    <option value="MUNCHIES">MUNCHIES</option>
                    <option value="FAMILY FOOD">FAMILY FOOD</option>
                    <option value="BAKERY">BAKERY</option>
                    <option value="HEALTHY">HEALTHY</option>
                    <option value="SAUCES">SAUCES</option>
                    <option value="SUMMER SPECIAL">SUMMER SPECIAL</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] font-black uppercase text-gray-500 mb-1">Description</label>
                  <input type="text" value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})} className="w-full border-2 border-black px-2 py-1 text-xs font-bold outline-none" placeholder="Short description for the menu..." />
                </div>
              </div>

              <button
                onClick={handleUpdateDetails}
                disabled={isSaving}
                className="w-full bg-black text-white font-black uppercase text-[10px] py-2 hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
              >
                {isSaving ? 'Syncing to Field...' : '⚡ Update & Push Live'}
              </button>
              <p className="text-[8px] font-bold text-gray-400 uppercase text-center mt-1">
                Changes reflect instantly in TheField & Stealth Menu Page
              </p>
            </div>

            {/* Bill of Materials (BOM) Mapper */}
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="font-black uppercase text-sm tracking-widest bg-green-400 px-2 border-2 border-black">Bill of Materials</span>
                <span className="text-[9px] font-black uppercase text-gray-500">{currentBOM.length} ingredients linked</span>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {currentBOM.length === 0 ? (
                  <p className="text-[9px] font-bold text-gray-400 uppercase italic py-2">
                    No inventory linked. Foody will estimate runouts for this item.
                  </p>
                ) : (
                  currentBOM.map(ing => (
                    <div key={ing.id} className="flex justify-between items-center border-b-2 border-gray-100 pb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase">{ing.name}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{ing.quantity_used} {ing.unit} per serve</span>
                      </div>
                      <button
                        onClick={() => handleRemoveIngredient(ing.id)}
                        className="text-[8px] font-black text-red-600 uppercase border border-red-600 px-1 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Unlink
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t-2 border-black">
                <select
                  value={newIngredient.inventory_item_id}
                  onChange={e => setNewIngredient({...newIngredient, inventory_item_id: e.target.value})}
                  className="flex-1 border-2 border-black px-2 py-1 text-[9px] font-bold outline-none bg-white"
                >
                  <option value="">Select ingredient from inventory...</option>
                  {inventoryStock.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.unit}) — {item.stock} in stock
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Qty"
                  value={newIngredient.quantity_used}
                  onChange={e => setNewIngredient({...newIngredient, quantity_used: e.target.value})}
                  className="w-16 border-2 border-black px-2 py-1 text-[9px] font-bold outline-none text-center"
                />
                <button
                  onClick={handleAddIngredient}
                  className="bg-green-500 text-black border-2 border-black px-3 font-black text-[9px] uppercase hover:bg-green-600 transition-colors"
                >
                  Link
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}