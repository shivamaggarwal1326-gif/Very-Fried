import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

// ============================================================
// PublicMenu.jsx (STEALTH ELITE V1)
// Zero-friction NFC ordering. No payment gateway. No XP.
// Pure operational utility that fires orders to LiveFloor.
// ============================================================

const DietDot = ({ diet }) => {
  if (diet === 'VEG') return (
    <span className="inline-flex items-center justify-center w-4 h-4 border border-green-700 bg-white mr-2 shrink-0">
      <span className="w-2 h-2 bg-green-700 rounded-full" />
    </span>
  );
  if (diet === 'NON-VEG') return (
    <span className="inline-flex items-center justify-center w-4 h-4 border border-red-700 bg-white mr-2 shrink-0">
      <span className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-red-700 mt-0.5" />
    </span>
  );
  if (diet === 'EGG') return (
    <span className="inline-flex items-center justify-center w-4 h-4 border border-yellow-500 bg-white mr-2 shrink-0">
      <span className="w-2 h-2 bg-yellow-500 rounded-full" />
    </span>
  );
  return null;
};

export default function PublicMenu({ merchantId, tableId, sessionToken }) {
  const [merchant, setMerchant] = useState(null);
  const [menuByCategory, setMenuByCategory] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null); 
  const [dietFilter, setDietFilter] = useState('ALL');

  useEffect(() => {
    if (!merchantId) return;
    const loadMenu = async () => {
      setIsLoading(true);
      try {
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('business_name, gst_rate')
          .eq('id', merchantId)
          .single();

        if (merchantData) setMerchant(merchantData);

        const { data: recipesData } = await supabase
          .from('recipes')
          .select('*')
          .eq('merchant_id', merchantId);

        if (recipesData && recipesData.length > 0) {
          const categoryMap = {};
          recipesData.forEach(row => {
            const item = row.data;
            const cat = item.category || 'MENU';
            if (!categoryMap[cat]) categoryMap[cat] = [];
            categoryMap[cat].push({
              id: row.id,
              name: item.title,
              price: item.price || 0,
              desc: item.desc || item.description || '',
              diet: item.diet || 'VEG',
              category: cat
            });
          });
          setMenuByCategory(Object.entries(categoryMap).map(([title, items]) => ({ title, items })));
        }
      } catch (err) {
        console.error('PublicMenu load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu();
  }, [merchantId]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter(i => i.id !== itemId);
      return prev.map(i => i.id === itemId ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const getCartQty = (itemId) => cart.find(i => i.id === itemId)?.qty || 0;

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gstRate = merchant?.gst_rate || 5;
  const gst = cartTotal * (gstRate / 100);
  const finalTotal = cartTotal + gst;

  // --- STEALTH ORDER ENGINE ---
  const placeOrder = async () => {
    if (cart.length === 0 || !tableId) return;
    setIsOrdering(true);

    try {
      // 1. Send the order silently to the Kitchen (LiveFloor & BOM Engine)
      const telemetryRows = cart.map(item => ({
        merchant_id: merchantId,
        event_type: `nfc_order_table_${tableId}`,
        recipe_id: item.name,
        recipe_category: item.category,
        quantity: item.qty,
        spice_protocol: 'N/A', 
        platform: 'stealth_menu', // Strictly tagged as Stealth
        event_data: { 
          session_token: sessionToken, 
          qty: item.qty 
        }
      }));

      const { error: dbError } = await supabase.from('culinary_telemetry').insert(telemetryRows);
      if (dbError) throw dbError;

      // 2. Trigger a clean, professional UI confirmation
      setCart([]);
      setOrderStatus('sent');
      setTimeout(() => setOrderStatus(null), 4000);

    } catch (err) {
      console.error("Order Error:", err);
      setOrderStatus('error');
      setTimeout(() => setOrderStatus(null), 4000);
    } finally {
      setIsOrdering(false);
    }
  };

  const filteredMenu = dietFilter === 'ALL'
    ? menuByCategory
    : menuByCategory.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.diet === dietFilter)
      })).filter(cat => cat.items.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black uppercase text-xs tracking-widest text-gray-500">Loading Menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf9] font-sans text-black pb-40">

      {/* HEADER */}
      <div className="bg-black text-white px-6 py-5 sticky top-0 z-30 shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-2xl mx-auto flex justify-between items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Welcome to</p>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">
              {merchant?.business_name || 'Restaurant'}
            </h1>
          </div>
          {tableId && (
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Table</p>
              <p className="text-xl font-black font-mono">{tableId}</p>
            </div>
          )}
        </div>
      </div>

      {/* ORDER STATUS BANNER */}
      <AnimatePresence>
        {orderStatus && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className={`fixed top-[72px] left-0 right-0 z-40 py-3 px-6 text-center font-black uppercase text-sm tracking-widest border-b-4 border-black ${
              orderStatus === 'sent' ? 'bg-green-400 text-black' : 'bg-red-600 text-white'
            }`}
          >
            {orderStatus === 'sent' ? '✓ Order sent to kitchen' : '⚠️ Order failed — tap to retry'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* DIET FILTER */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {['ALL', 'VEG', 'NON-VEG', 'EGG'].map(f => (
            <button
              key={f}
              onClick={() => setDietFilter(f)}
              className={`shrink-0 px-4 py-2 border-2 border-black font-black uppercase text-[10px] tracking-widest transition-all ${
                dietFilter === f
                  ? 'bg-black text-white shadow-none translate-y-0.5'
                  : 'bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* MENU CATEGORIES */}
        {filteredMenu.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-black uppercase text-xs tracking-widest">
            No items available
          </div>
        ) : (
          filteredMenu.map((category, catIdx) => (
            <div key={catIdx} className="mb-8">
              <h2 className="text-lg font-black uppercase tracking-tighter border-b-4 border-black pb-2 mb-4">
                {category.title}
              </h2>
              <div className="flex flex-col gap-3">
                {category.items.map((item, idx) => {
                  const qty = getCartQty(item.id);
                  return (
                    <div
                      key={idx}
                      className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-start gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start mb-1">
                          <DietDot diet={item.diet} />
                          <h3 className="font-black uppercase text-sm leading-tight">{item.name}</h3>
                        </div>
                        {item.desc && (
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide line-clamp-2 mb-2">{item.desc}</p>
                        )}
                        <p className="font-black text-base text-black">₹{item.price}</p>
                      </div>

                      {/* ADD / QTY CONTROL */}
                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="shrink-0 bg-black text-white font-black uppercase text-[10px] px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-500 hover:text-black hover:shadow-none hover:translate-y-0.5 transition-all"
                        >
                          + ADD
                        </button>
                      ) : (
                        <div className="shrink-0 flex items-center gap-2 border-2 border-black">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 font-black text-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="font-black text-sm w-6 text-center">{qty}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 font-black text-lg hover:bg-green-100 transition-colors flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* STICKY CART BOTTOM BAR */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t-4 border-black shadow-[0_-4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="max-w-2xl mx-auto px-4 py-4">
              <div className="flex flex-col gap-1 mb-3 max-h-32 overflow-y-auto scrollbar-hide">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] font-bold uppercase">
                    <span>{item.qty}× {item.name}</span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase border-t border-gray-200 pt-1 mt-1">
                  <span>GST ({gstRate}%)</span>
                  <span>₹{gst.toFixed(0)}</span>
                </div>
              </div>

              {tableId ? (
                <button
                  onClick={placeOrder}
                  disabled={isOrdering}
                  className="w-full bg-black text-white font-black uppercase tracking-widest py-4 text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex justify-between items-center px-6"
                >
                  <span>{isOrdering ? 'TRANSMITTING...' : 'PLACE ORDER'}</span>
                  <span className="text-lg">₹{finalTotal.toFixed(0)}</span>
                </button>
              ) : (
                <div className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-3 px-4 border-4 border-black text-center text-xs">
                  ⚠️ Tap NFC tag on your table to place order
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}