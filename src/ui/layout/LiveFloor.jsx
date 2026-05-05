import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LiveFloor({ tables, setTables, liveMenu, merchantData, hasXP, onRefreshDashboard, setInventoryStock }) {
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  const activeTable = tables.find(t => t.id === selectedTableId);

  const addItemToTable = (menuItem) => {
    if (!selectedTableId) return;
    setTables(prev => prev.map(table => {
      if (table.id !== selectedTableId) return table;
      
      const existingItem = table.items.find(i => i.id === menuItem.id);
      const newItems = existingItem 
        ? table.items.map(i => i.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i)
        : [...table.items, { ...menuItem, qty: 1 }];
        
      const sessionStart = table.session_start || Date.now();
      
      return { ...table, items: newItems, status: 'OCCUPIED', session_start: sessionStart }; 
    }));
  };

  const voidItemFromTable = async (itemName) => {
    if (!selectedTableId) return;
    
    await supabase.from('culinary_telemetry').insert([{
      merchant_id: merchantData.id, recipe_id: itemName, event_type: 'void', quantity: 1
    }]);

    setTables(prev => prev.map(table => {
      if (table.id !== selectedTableId) return table;
      const existingItem = table.items.find(i => i.name === itemName);
      let newItems;
      if (existingItem.qty > 1) {
        newItems = table.items.map(i => i.name === itemName ? { ...i, qty: i.qty - 1 } : i);
      } else {
        newItems = table.items.filter(i => i.name !== itemName);
      }
      return { ...table, items: newItems, status: newItems.length === 0 && !table.activeToken ? 'VACANT' : 'OCCUPIED' };
    }));
  };

  const calculateBill = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = hasXP ? subtotal * 0.10 : 0; 
    const discountedTotal = subtotal - discount;
    const gst = discountedTotal * ((merchantData.gst_rate || 5) / 100); 
    return { subtotal, discount, gst, finalTotal: discountedTotal + gst };
  };

  const processTableBill = async (isComp = false) => {
    if (!activeTable || activeTable.items.length === 0) return;
    setIsProcessing(true);
    setErrorBanner(null);

    const { finalTotal } = calculateBill(activeTable.items);

    const endTime = Date.now();
    const durationMinutes = activeTable.session_start
      ? Math.round((endTime - activeTable.session_start) / 60000)
      : 0;

    try {
      const transactionStatus = isComp ? 'comped' : 'completed';
      const actualBill = isComp ? 0 : finalTotal;
      const discountAmount = isComp ? finalTotal : 0;

      // 1: Log the transaction
      const { data: transData, error: transErr } = await supabase
        .from('merchant_transactions')
        .insert([{
          merchant_id: merchantData.id,
          total_bill: actualBill,
          status: transactionStatus,
          discount_amount: discountAmount,
          order_type: `table-${activeTable.id}`,
          table_id: activeTable.id,
          server_id: null,
          order_duration_minutes: durationMinutes
        }])
        .select().single();

      if (transErr) throw transErr;

      // 2: Log culinary telemetry
      const telemetryInserts = activeTable.items.map(item => ({
        merchant_id: merchantData.id,
        transaction_id: transData.id,
        recipe_id: item.name,
        event_type: activeTable.type.toLowerCase(),
        quantity: item.qty
      }));
      await supabase.from('culinary_telemetry').insert(telemetryInserts);

      // 3: AUTO-DEDUCT INVENTORY (The BOM Engine)
      for (const item of activeTable.items) {
        const { data: bomRows, error: bomErr } = await supabase
          .from('menu_item_ingredients')
          .select('inventory_item_id, quantity_used')
          .eq('merchant_id', merchantData.id)
          .eq('menu_item_name', item.name);

        // Skip silently if no BOM is mapped
        if (bomErr || !bomRows || bomRows.length === 0) continue;

        for (const ingredient of bomRows) {
          const totalDeduction = ingredient.quantity_used * item.qty;
          // Trigger the atomic SQL function we just created
          await supabase.rpc('deduct_inventory', {
            item_id: ingredient.inventory_item_id,
            amount: totalDeduction
          });
        }
      }

      // ---> NEW: INSTANT UI REFRESH <---
      if (setInventoryStock) {
        const { data: freshInventory } = await supabase
          .from('merchant_inventory')
          .select('*')
          .eq('merchant_id', merchantData.id);
        if (freshInventory) setInventoryStock(freshInventory);
      }
      // ----------------------------------

      // 4: Clear the table
      setTables(prev => prev.map(t =>
        t.id === selectedTableId
          ? { ...t, items: [], status: 'VACANT', activeToken: null, session_start: null }
          : t
      ));
      setSelectedTableId(null);
      if (onRefreshDashboard) onRefreshDashboard(merchantData.id);

    } catch (error) {
      setErrorBanner(`POS Error: ${error.message}`);
      setTimeout(() => setErrorBanner(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 items-start relative">
      
      {errorBanner && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-black uppercase tracking-widest px-6 py-3 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse w-max max-w-[90%] text-center text-xs md:text-sm">
          ⚠️ {errorBanner}
        </div>
      )}

      <div className="lg:col-span-2 flex flex-col w-full h-full bg-white/95 backdrop-blur-md p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="flex justify-between items-center border-b-4 border-black pb-2 mb-4 shrink-0">
          <h2 className="text-xs font-black uppercase text-black">Floor Management</h2>
          <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-100 px-2 py-1 border-2 border-orange-600">NFC READY</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide grid grid-cols-2 md:grid-cols-3 gap-6 content-start">
          {tables.map(table => {
            const liveMins = table.session_start ? Math.floor((Date.now() - table.session_start) / 60000) : 0;
            return (
              <button key={table.id} onClick={() => setSelectedTableId(table.id)} className={`p-6 flex flex-col items-center justify-center border-4 border-black transition-all h-32 ${selectedTableId === table.id ? 'bg-black text-white translate-y-1' : 'bg-white text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}>
                <span className={`font-black mb-1 ${table.type === 'TAKEAWAY' ? 'text-2xl' : 'text-4xl'}`}>{table.label}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 ${table.status === 'VACANT' ? 'bg-green-100 text-green-700 border-green-600' : liveMins > 45 ? 'bg-red-100 text-red-700 border-red-600 animate-pulse' : 'bg-blue-100 text-blue-700 border-blue-600'}`}>
                  {table.status === 'VACANT' ? 'VACANT' : `${liveMins} MINS`}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      
      <div className="lg:col-span-1 bg-white/95 backdrop-blur-sm border-4 border-black p-6 flex flex-col h-[632px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sticky top-8">
        {!activeTable ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[10px] font-black uppercase text-gray-400 text-center border-2 border-dashed border-gray-300 m-4">SELECT A SECTOR</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2 shrink-0">
              <h2 className="text-xl font-black uppercase truncate pr-2 text-black">{activeTable.label} {activeTable.activeToken && `[#${activeTable.activeToken.slice(0,4)}]`}</h2>
              <button onClick={() => setSelectedTableId(null)} className="text-xs font-black bg-black text-white px-2 hover:bg-red-600 transition-colors shrink-0">[ X ]</button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 border-b-2 border-black scrollbar-hide">
              {activeTable.items.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase italic">No items engaged.</div>
              ) : (
                activeTable.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b-2 border-gray-100 py-3 hover:bg-gray-50 px-2 group">
                    <span className="text-xs font-black text-black">{item.qty}x {item.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-black">₹{item.price * item.qty}</span>
                      <button onClick={() => voidItemFromTable(item.name)} className="text-red-500 font-black text-[10px] border border-red-500 px-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">VOID</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 overflow-y-auto max-h-40 shrink-0 border-2 border-black p-2 bg-gray-50 scrollbar-hide">
              {liveMenu.map(item => (
                <button key={item.id} onClick={() => addItemToTable(item)} className="border-2 border-black bg-white text-black p-2 text-[10px] font-black uppercase hover:bg-yellow-300 hover:shadow-sm transition-colors text-left truncate">+ {item.name}</button>
              ))}
            </div>

            <div className="bg-gray-100 p-4 border-4 border-black shrink-0 mt-auto flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-black text-black mb-1"><span>Total Yield</span><span className="text-2xl text-orange-600">₹{calculateBill(activeTable.items).finalTotal.toFixed(0)}</span></div>
              <div className="flex gap-2">
                <button onClick={() => processTableBill(true)} disabled={isProcessing || activeTable.items.length === 0} className={`w-1/3 py-2 text-white border-2 border-black font-black uppercase text-[10px] transition-all ${activeTable.items.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>Comp Bill</button>
                <button onClick={() => processTableBill(false)} disabled={isProcessing || activeTable.items.length === 0} className={`w-2/3 py-2 text-white border-4 border-black font-black uppercase tracking-widest text-xs transition-all ${activeTable.items.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'}`}>{isProcessing ? 'Finalizing...' : 'Close Session'}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}