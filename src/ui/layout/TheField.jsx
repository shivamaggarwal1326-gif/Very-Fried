import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient'; 
import { useStore } from '../../lib/store.js'; // --- ZUSTAND VAULT DIRECT CONNECTION ---

// --- TACTICAL CONSTANTS ---
const DIET_FILTERS = ['ALL', 'VEG', 'NON-VEG', 'EGG', 'VEGAN'];

const SPICE_GRADES = [
  { level: 1, name: 'Spy', color: 'bg-green-500', text: 'text-white' },
  { level: 2, name: 'Spy c', color: 'bg-yellow-400', text: 'text-black' },
  { level: 3, name: 'Spycy', color: 'bg-orange-500', text: 'text-white' },
  { level: 4, name: 'Spycyyy', color: 'bg-red-600', text: 'text-white' }
];

const DietBadge = ({ diet }) => {
  if (diet === 'VEG') return <span className="inline-flex items-center justify-center w-3 h-3 md:w-4 md:h-4 border border-green-700 bg-white mr-2 shrink-0"><span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-700 rounded-full"></span></span>;
  if (diet === 'NON-VEG') return <span className="inline-flex items-center justify-center w-3 h-3 md:w-4 md:h-4 border border-red-700 bg-white mr-2 shrink-0"><span className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent border-b-red-700 md:border-l-[4px] md:border-r-[4px] md:border-b-[6px] mt-0.5"></span></span>;
  if (diet === 'EGG') return <span className="inline-flex items-center justify-center w-3 h-3 md:w-4 md:h-4 border border-yellow-500 bg-white mr-2 shrink-0"><span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-500 rounded-full"></span></span>;
  if (diet === 'VEGAN') return <span className="inline-flex items-center justify-center text-[8px] md:text-[9px] font-black tracking-widest text-green-700 border border-green-700 bg-green-50 px-1 py-0.5 mr-2 shrink-0 uppercase">VGN</span>;
  return null;
};

// NOTICE: activeTableId and setViewingMerchantId are GONE from the props
export default function TheField({ userXP, isAnonymous, onRequireAuth, onFieldCheckout }) {
  
  // --- DIRECT VAULT ACCESS ---
  const activeTableId = useStore((state) => state.activeTableId);

  const [partneredRestaurants, setPartneredRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState(null);
  const [dietFilter, setDietFilter] = useState('ALL');
  const [menuCatFilter, setMenuCatFilter] = useState('ALL');
  const [tacticalLoadout, setTacticalLoadout] = useState([]);
  const [itemPendingSpice, setItemPendingSpice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElitePartners = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('id, business_name, partnership_tier')
          .eq('partnership_tier', 'ELITE_PARTNER'); 

        if (error) throw error;
        setPartneredRestaurants(data || []);
      } catch (err) {
        console.error("Deployment Error:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchElitePartners();
  }, []);

  useEffect(() => {
    if (!selectedRest) return;

    const fetchMenu = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('merchant_id', selectedRest.id);

      if (data) {
        const categories = [...new Set(data.map(r => r.data.category || 'MUNCHIES'))];
        const formattedMenu = categories.map(cat => ({
          title: cat,
          items: data
            .filter(r => (r.data.category || 'MUNCHIES') === cat)
            .map(r => ({
              id: r.id,
              name: r.data.title,
              price: `₹${r.data.price}`,
              desc: r.data.desc || r.data.description, 
              diet: r.data.diet || 'VEG' 
            }))
        }));
        
        setSelectedRest(prev => ({ ...prev, menuCategories: formattedMenu }));
      }
    };
    fetchMenu();
  }, [selectedRest?.id]);

  const deployCode = () => {
    if (isAnonymous && onRequireAuth) {
      onRequireAuth(); 
      return;
    }

    if (activeTableId && onFieldCheckout) {
      const fullLoadout = tacticalLoadout.map(item => {
        let itemCategory = 'MUNCHIES';
        selectedRest.menuCategories.forEach(cat => {
           if (cat.items.some(i => i.name === item.name)) itemCategory = cat.title;
        });
        return { ...item, category: itemCategory };
      });

      const success = onFieldCheckout(fullLoadout);
      if (success) {
        setTacticalLoadout([]);
      }
    }
  };

  const confirmSpiceSelection = (spice) => {
    if (itemPendingSpice.editIndex !== undefined) {
      const updated = [...tacticalLoadout];
      updated[itemPendingSpice.editIndex].spice = spice;
      setTacticalLoadout(updated);
    } else {
      setTacticalLoadout([...tacticalLoadout, { ...itemPendingSpice.item, spice }]);
    }
    setItemPendingSpice(null);
  };

  const removeFromLoadout = (index) => {
    const updated = [...tacticalLoadout];
    updated.splice(index, 1);
    setTacticalLoadout(updated);
  };

  return (
    <div className="w-full flex-grow flex flex-col relative z-10 pb-40 md:pb-12 pt-4">
      
      <AnimatePresence>
        {itemPendingSpice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#fcfbf9] border-4 border-black p-6 md:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] pointer-events-auto">
              <div className="flex justify-between items-start mb-4 border-b-4 border-black pb-4">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">{itemPendingSpice.item.name}</h3>
                <button onClick={() => setItemPendingSpice(null)} className="text-2xl font-black hover:text-red-600 transition-colors">×</button>
              </div>
              <p className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Select your Spice Protocol:</p>
              
              <div className="flex flex-col gap-3">
                {SPICE_GRADES.map((grade) => (
                  <button 
                    key={grade.level}
                    onClick={() => confirmSpiceSelection(grade)}
                    className={`w-full p-4 border-2 border-black flex justify-between items-center group transition-transform hover:translate-x-1 hover:-translate-y-1 ${grade.color} ${grade.text}`}
                  >
                    <span className="font-black text-lg md:text-xl uppercase tracking-widest">LVL {grade.level}: {grade.name}</span>
                    <span className="opacity-0 group-hover:opacity-100 font-black text-xl transition-opacity">→</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedRest ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-4 md:px-8">
          <div className="mb-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">Active Deployment Zones</h2>
            <p className="text-sm md:text-base font-bold text-gray-500 uppercase tracking-widest mt-1">Curated Elite Partners only.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-20 text-center font-black uppercase text-gray-400 animate-pulse tracking-widest">
                Scanning Deployment Zones...
              </div>
            ) : partneredRestaurants.map((rest) => (
              <motion.div 
                key={rest.id}
                whileHover={{ x: 4, y: -4, shadow: "6px 6px 0px 0px rgba(249,115,22,1)" }} 
                onClick={() => {
                  setSelectedRest({ ...rest, menuCategories: [] });
                  setTacticalLoadout([]); 
                  setDietFilter('ALL');
                  setMenuCatFilter('ALL');
                  // ZUSTAND UPDATE: Inject directly into the vault
                  useStore.setState({ viewingMerchantId: rest.id }); 
                }}
                className={`border-4 border-black p-6 bg-[#fcfbf9] cursor-pointer group flex flex-col transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`bg-orange-500 text-black border-2 border-black font-black text-[10px] md:text-xs px-3 py-1.5 uppercase tracking-widest`}>
                    VERIFIED PARTNER
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none mb-2 group-hover:text-orange-600 transition-colors">{rest.business_name}</h3>
                <div className="mt-auto pt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-black"></div>
                  <span className="font-black text-sm uppercase text-gray-600">Secure Protocol Active</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-8 relative pb-20">
          <button onClick={() => { 
            setSelectedRest(null); 
            // ZUSTAND UPDATE: Clear the vault
            useStore.setState({ viewingMerchantId: null }); 
          }} className="text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-orange-600 transition-colors self-start mb-6 flex items-center gap-2">
            <span className="text-lg leading-none pb-1">←</span> BACK TO ZONES
          </button>

          <div className="border-4 border-black bg-[#fcfbf9] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col mb-8 relative overflow-hidden min-h-[500px]">
            
            <div className="flex justify-between items-start border-b-4 border-black p-6 md:p-10 pb-4 shrink-0 bg-white">
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-2">{selectedRest.business_name}</h1>
                <p className="text-sm md:text-base font-black text-gray-500 uppercase tracking-widest">
                  VIP PERK: <span className="text-orange-600">Elite Status Verified</span>
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#00000005_10px,#00000005_20px)]">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black text-white p-8 border-4 border-orange-500 shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]"
                >
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4 text-orange-500">
                        Dine your mood soon :)
                    </h2>
                    <p className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-8 max-w-md mx-auto">
                        This Elite Partner is currently securing their operational protocols. The Consumer App network is temporarily locked for onboarding.
                    </p>
                    
                    <div className="border-t-2 border-gray-800 pt-6 mt-4 flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-900/30 px-3 py-1 mb-3">
                            Incoming Transmission
                        </span>
                        <p className="text-xs font-mono text-gray-500">
                            &gt; FOODY SOUS CHEF: Preparing tactical menu pairings...
                        </p>
                    </div>
                </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- STRICT CHECKOUT TERMINAL --- */}
      <AnimatePresence>
        {tacticalLoadout.length > 0 && selectedRest && (
          <div className="fixed inset-0 pointer-events-none z-50 flex justify-center">
            <div className="w-full max-w-5xl h-full relative">
              <motion.div 
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-0 right-0 md:bottom-8 md:right-4 lg:right-0 w-full md:w-[420px] bg-white border-t-4 md:border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[85vh] pointer-events-auto"
              >
                <div className="bg-black text-white px-4 py-3 flex justify-between items-center shrink-0">
                  <h3 className="font-black uppercase tracking-widest text-lg">Tactical Checkout</h3>
                  <span className="text-xs font-bold bg-white text-black px-2 py-1">{tacticalLoadout.length} ITEMS</span>
                </div>

                <div className="overflow-y-auto p-4 space-y-3 bg-[#fcfbf9] flex-grow">
                  {tacticalLoadout.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start border-2 border-gray-200 bg-white p-3 shadow-sm relative group">
                      <div className="flex flex-col pr-8">
                        <span className="font-black uppercase text-sm flex items-start"><DietBadge diet={item.diet} />{item.name}</span>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => setItemPendingSpice({ item, editIndex: idx })} className={`text-[9px] font-black uppercase px-2 py-1 ${item.spice.color} ${item.spice.text} border border-black`}>
                            {item.spice.name} ✎
                          </button>
                          <span className="text-xs font-black text-orange-600">{item.price}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromLoadout(idx)} className="absolute top-2 right-2 text-xl font-black text-gray-300 hover:text-red-600 transition-colors">×</button>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-white border-t-2 border-gray-200">
                  {activeTableId ? (
                    <button onClick={deployCode} className="w-full bg-orange-500 text-black font-black uppercase tracking-widest py-4 text-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                      TRANSMIT ORDER
                    </button>
                  ) : (
                    <div className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center">
                      <span className="text-lg animate-pulse mb-1">⚠️ NO TABLE DETECTED</span>
                      <span className="text-[10px] text-red-200">TAP THE NFC TAG ON YOUR TABLE TO PLACE THIS ORDER</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}