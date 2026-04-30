import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

export default function InventoryMatrix({ inventoryStock, setInventoryStock, merchantData }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeRestockId, setActiveRestockId] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [editItemData, setEditItemData] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [newItemData, setNewItemData] = useState({
    name: '', category: 'Produce', unit: 'Kg', alert_level: 5, stock: ''
  });

  const handleAddInventory = async (e) => {
    e.preventDefault();
    const { data } = await supabase.from('merchant_inventory').insert([{
        merchant_id: merchantData.id, name: newItemData.name, category: newItemData.category,
        unit: newItemData.unit, stock: Number(newItemData.stock) || 0, alert_level: Number(newItemData.alert_level)
    }]).select().single();
    if (data) setInventoryStock(prev => [...prev, data]);
    setIsAddModalOpen(false); setNewItemData({ name: '', category: 'Produce', unit: 'Kg', alert_level: 5, stock: '' });
  };

  const confirmRestock = async (id) => {
    const amount = parseFloat(restockAmount);
    if (isNaN(amount) || amount <= 0) { setActiveRestockId(null); return; }
    const item = inventoryStock.find(i => i.id === id);
    const { data } = await supabase.from('merchant_inventory').update({ stock: (item?.stock || 0) + amount }).eq('id', id).select().single();
    if (data) setInventoryStock(prev => prev.map(i => i.id === id ? data : i));
    setActiveRestockId(null); setRestockAmount('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { data } = await supabase.from('merchant_inventory').update({
        name: editItemData.name, category: editItemData.category, unit: editItemData.unit, stock: editItemData.stock, alert_level: editItemData.alert_level
    }).eq('id', editItemData.id).select().single();
    if (data) setInventoryStock(prev => prev.map(i => i.id === data.id ? data : i));
    setEditItemData(null);
  };

  const handleDeleteInventory = async (id) => {
    if (deleteConfirmId !== id) { setDeleteConfirmId(id); return; }
    await supabase.from('merchant_inventory').delete().eq('id', id);
    setInventoryStock(prev => prev.filter(i => i.id !== id));
    setEditItemData(null);
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white/95 backdrop-blur-sm p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <AnimatePresence>
        {editItemData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white border-4 border-black p-6 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
              <h2 className="text-xl font-black uppercase mb-4 border-b-2 border-black pb-2">Modify Protocol</h2>
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                <input type="text" required value={editItemData.name} onChange={e => setEditItemData({...editItemData, name: e.target.value})} className="border-4 border-black p-2 font-bold text-sm w-full" placeholder="Name" />
                <div className="flex gap-4">
                  <select value={editItemData.category} onChange={e => setEditItemData({...editItemData, category: e.target.value})} className="border-4 border-black p-2 font-bold text-sm bg-white flex-1"><option>Produce</option><option>Meat</option><option>Dairy</option><option>Dry Goods</option><option>Liquids</option><option>Sauces</option></select>
                  <select value={editItemData.unit} onChange={e => setEditItemData({...editItemData, unit: e.target.value})} className="border-4 border-black p-2 font-bold text-sm bg-white flex-1"><option>Kg</option><option>L</option><option>ml</option><option>Units</option><option>Batches</option></select>
                </div>
                <div className="flex gap-4">
                  <input type="number" required min="0" step="any" value={editItemData.stock} onChange={e => setEditItemData({...editItemData, stock: Number(e.target.value)})} className="border-4 border-black p-2 font-bold text-sm flex-1" placeholder="Stock" />
                  <input type="number" required min="1" step="any" value={editItemData.alert_level} onChange={e => setEditItemData({...editItemData, alert_level: Number(e.target.value)})} className="border-4 border-black p-2 font-bold text-sm flex-1" placeholder="Alert" />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <button type="submit" className="bg-blue-600 text-white font-black uppercase p-3 border-4 border-black hover:bg-blue-700 w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-1 hover:shadow-none">Lock</button>
                  {deleteConfirmId === editItemData.id ? (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleDeleteInventory(editItemData.id)} className="bg-red-600 text-white font-black uppercase p-3 border-4 border-black hover:bg-red-700 w-2/3 transition-colors">Confirm Delete</button>
                      <button type="button" onClick={() => setDeleteConfirmId(null)} className="bg-white text-black font-black uppercase p-3 border-4 border-black hover:bg-gray-100 w-1/3 transition-colors">Cancel</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => handleDeleteInventory(editItemData.id)} className="bg-white text-red-600 font-black uppercase p-3 border-4 border-red-600 hover:bg-red-50 w-full transition-colors">Delete</button>
                  )}
                  <button type="button" onClick={() => { setEditItemData(null); setDeleteConfirmId(null); }} className="text-gray-400 font-bold text-xs uppercase hover:text-black mt-2 self-center">[ Cancel ]</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-4 shrink-0">
        <div><h2 className="text-xl font-black uppercase tracking-tighter leading-none text-black">Inventory Matrix</h2><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Live Telemetry & Supply</p></div>
        <button onClick={() => setIsAddModalOpen(!isAddModalOpen)} className="bg-black text-white px-4 py-2 font-black uppercase text-xs border-2 border-black hover:bg-green-500 hover:text-black transition-colors">{isAddModalOpen ? '[ Close Form ]' : '+ Add Inventory'}</button>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddInventory} className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-4 items-end overflow-hidden shrink-0 mb-6">
            <div className="flex-1 w-full flex flex-col gap-1 min-w-40"><label className="text-[10px] font-black uppercase text-gray-500">Item Name</label><input type="text" required value={newItemData.name} onChange={e => setNewItemData({...newItemData, name: e.target.value})} className="border-4 border-black p-2 font-bold text-sm" placeholder="e.g. Mango" /></div>
            <div className="w-full md:w-32 flex flex-col gap-1"><label className="text-[10px] font-black uppercase text-gray-500">Category</label><select value={newItemData.category} onChange={e => setNewItemData({...newItemData, category: e.target.value})} className="border-4 border-black p-2 font-bold text-sm"><option>Produce</option><option>Meat</option><option>Dairy</option><option>Dry Goods</option><option>Liquids</option><option>Sauces</option></select></div>
            <div className="w-full md:w-28 flex flex-col gap-1"><label className="text-[10px] font-black uppercase text-gray-500">Unit</label><select value={newItemData.unit} onChange={e => setNewItemData({...newItemData, unit: e.target.value})} className="border-4 border-black p-2 font-bold text-sm"><option>Kg</option><option>L</option><option>ml</option><option>Units</option><option>Batches</option></select></div>
            <div className="w-full md:w-24 flex flex-col gap-1"><label className="text-[10px] font-black uppercase text-gray-500">Stock</label><input type="number" required min="0" step="any" value={newItemData.stock} onChange={e => setNewItemData({...newItemData, stock: e.target.value})} className="border-4 border-black p-2 font-bold text-sm" placeholder="0" /></div>
            <div className="w-full md:w-24 flex flex-col gap-1"><label className="text-[10px] font-black uppercase text-gray-500">Alert</label><input type="number" required min="1" step="any" value={newItemData.alert_level} onChange={e => setNewItemData({...newItemData, alert_level: e.target.value})} className="border-4 border-black p-2 font-bold text-sm" placeholder="5" /></div>
            <button type="submit" className="bg-blue-600 text-white font-black uppercase p-3 border-4 border-black hover:bg-blue-700 w-full md:w-auto h-11">Inject</button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start">
          {inventoryStock.map(item => {
            const isCrit = item.stock <= item.alert_level;
            const isLow = item.stock <= item.alert_level * 1.5 && !isCrit;
            const isRestockingThis = activeRestockId === item.id;
            return (
              <div key={item.id} className="p-3 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[170px] gap-2">
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex justify-between items-start mb-2 gap-2"><h3 className="font-black uppercase text-xs truncate flex-1 leading-tight">{item.name}</h3><span className="text-[8px] font-black bg-gray-200 px-1 border border-black uppercase truncate max-w-[60px] leading-none py-0.5 shrink-0">{item.category}</span></div>
                  <div className="flex justify-between items-end mb-2 flex-1">
                    <span className={`text-3xl font-black leading-none ${isCrit ? 'text-red-600' : isLow ? 'text-yellow-500' : 'text-green-600'}`} style={{ WebkitTextStroke: "1px black" }}>{item.stock.toFixed(1)}</span>
                    <div className="flex flex-col items-end gap-0.5 min-w-0 ml-2"><span className="text-[10px] font-black uppercase leading-none truncate w-full text-right">{item.unit}</span><span className="text-[8px] font-black text-gray-400 uppercase leading-none truncate w-full text-right">/ {item.alert_level} ALRT</span></div>
                  </div>
                  <div className="w-full bg-gray-200 h-2 border-2 border-black overflow-hidden mb-2 shrink-0"><div className={`h-full transition-all duration-1000 ${isCrit ? 'bg-red-500' : isLow ? 'bg-yellow-400' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (item.stock / (item.alert_level * 3)) * 100)}%` }}></div></div>
                </div>
                {isRestockingThis ? (
                  <div className="flex gap-1 h-8 shrink-0 mt-auto">
                    <input type="number" autoFocus placeholder={`+ ${item.unit}`} value={restockAmount} onChange={(e) => setRestockAmount(e.target.value)} className="w-full border-2 border-black p-1 text-xs font-bold outline-none text-center min-w-0" />
                    <button onClick={() => confirmRestock(item.id)} className="bg-green-500 text-black w-8 shrink-0 border-2 border-black font-black text-xs hover:bg-green-400">✓</button>
                  </div>
                ) : (
                  <div className="flex gap-1 h-8 shrink-0 mt-auto">
                    <button onClick={() => setEditItemData(item)} className="w-1/3 bg-gray-200 border-2 border-black text-[9px] font-black uppercase hover:bg-gray-300 transition-colors">EDIT</button>
                    <button onClick={() => { setActiveRestockId(item.id); setRestockAmount(''); }} className="w-2/3 bg-white border-2 border-black text-[9px] font-black uppercase hover:bg-yellow-400 transition-colors">RESTOCK</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}