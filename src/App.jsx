// src/App.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { supabase } from './lib/supabaseClient.js'; 
import { useStore } from './lib/store.js'; 

import BottomNav from "./ui/layout/BottomNav.jsx";
import MerchantCRM from './ui/layout/MerchantCRM.jsx';
import CommandCenter from './ui/layout/CommandCenter.jsx';
import TrophyRoom from "./ui/layout/TrophyRoom.jsx";

import LandingPage from "./ui/layout/LandingPage.jsx";
import Dashboard from "./ui/layout/Dashboard.jsx"; 
import TheField from "./ui/layout/TheField.jsx"; 
import KitchenCanvas, { THEMES } from "./ui/sketches/KitchenCanvas.jsx";
import PrepChecklist from "./ui/layout/PrepChecklist.jsx";
import StageManager from "./ui/layout/StageManager.jsx";
import ErrorBoundary from './ui/layout/ErrorBoundary.jsx';
import Foody from './ui/layout/Foody.jsx';
import CommsShield from './ui/layout/CommsShield.jsx'; 
import SpiceSelector from './ui/layout/SpiceSelector.jsx'; 
import VerificationProtocol from './ui/layout/VerificationProtocol.jsx'; 
import Auth from './ui/layout/Auth.jsx'; 
import LevelUpLab from './ui/layout/LevelUpLab.jsx'; 
import PublicMenu from './ui/layout/PublicMenu.jsx'; 

const generateVFTag = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = 'VF-';
  for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const generateSessionToken = () => {
  return 'TAB_' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const getRankIntel = (xp) => {
  if (xp < 500) return { id: 'commis', title: 'Commis Chef', target: 500, color: 'text-gray-500', theme: 'commis' };
  if (xp < 1500) return { id: 'demi', title: 'Demi Chef de Partie', target: 1500, color: 'text-gray-600', theme: 'demi' };
  if (xp < 3000) return { id: 'cdp', title: 'Chef de Partie', target: 3000, color: 'text-blue-500', theme: 'cdp' };
  if (xp < 5000) return { id: 'sous', title: 'Sous Chef', target: 5000, color: 'text-purple-500', theme: 'sous' };
  if (xp < 10000) return { id: 'head', title: 'Head Chef', target: 10000, color: 'text-amber-500', theme: 'head' };
  return { id: 'ratatouille', title: 'Ratatouille', target: xp, color: 'text-red-600', theme: 'ratatouille' }; 
};

function ConsumerApp({ onNavigate }) {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('landing');
  
  // --- ZUSTAND VAULT CONNECTIONS ---
  const activeTableId = useStore((state) => state.activeTableId);
  const sessionToken = useStore((state) => state.sessionToken);
  const viewingMerchantId = useStore((state) => state.viewingMerchantId);
  const pendingBatch = useStore((state) => state.pendingBatch);
  const sentItems = useStore((state) => state.sentItems);

  const setTableSession = useStore((state) => state.setTableSession);
  const clearTableSession = useStore((state) => state.clearTableSession);
  const addToBatch = useStore((state) => state.addToBatch);

  const setViewingMerchantId = (id) => useStore.setState({ viewingMerchantId: id });
  const addDirectlyToSent = (items) => useStore.setState((state) => ({ sentItems: [...state.sentItems, ...items] }));

  const [activeRecipeData, setActiveRecipeData] = useState(null);
  const [activeSpiceLevel, setActiveSpiceLevel] = useState(null);
  const [isCooking, setIsCooking] = useState(false); 
  const [showTrophyRoom, setShowTrophyRoom] = useState(false); 
  const [isFoodyOpen, setIsFoodyOpen] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0); 
  
  const [userXP, setUserXP] = useState(parseInt(localStorage.getItem('veryfryd_xp')) || 0);
  const [userCoins, setUserCoins] = useState(parseInt(localStorage.getItem('veryfryd_coins')) || 0);
  const [vfTag, setVfTag] = useState(localStorage.getItem('veryfryd_remembered_tag') || null);
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem('veryfryd_theme') || 'commis');

  const [showVerification, setShowVerification] = useState(false);
  const [pendingXP, setPendingXP] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [justUnlockedRank, setJustUnlockedRank] = useState(null);
  const [justUnlockedTheme, setJustUnlockedTheme] = useState(null);
  const [tutorialMessage, setTutorialMessage] = useState(null);

  const [recipeDictionary, setRecipeDictionary] = useState({});
  const [dynamicDishes, setDynamicDishes] = useState([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(true);

  const [systemError, setSystemError] = useState(null);

  const rankIntel = getRankIntel(userXP);

  const handleThemeChange = (newTheme) => {
    setActiveTheme(newTheme);
    localStorage.setItem('veryfryd_theme', newTheme);
  };

  // =========================================================================
  // SURGICAL PATCH: PERFECTED NFC ROUTING
  // =========================================================================
  useEffect(() => {
    const initNFC = async () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('t');
        const m = params.get('m'); 
        
        if (t && m) {
          const newToken = generateSessionToken();
          setTableSession(t, newToken, m); 
          
          localStorage.setItem('vf_active_table', t);
          localStorage.setItem('vf_active_merchant', m); 
          localStorage.setItem('vf_session_token', newToken);
          
          window.history.replaceState({}, '', window.location.pathname);

          // Check merchant tier before routing
          const { data: merchantRow } = await supabase
            .from('merchants')
            .select('partnership_tier')
            .eq('id', m)
            .single();

          const tier = merchantRow?.partnership_tier;

          if (tier === 'STEALTH_ELITE') {
            // Stealth Elite: bypass all auth, drop straight into clean menu
            setCurrentView('stealth_menu');
          } else {
            // Elite Partner: Silent Ghost Login
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
              const { data: ghostData, error } = await supabase.auth.signInAnonymously();
              if (!error && ghostData?.user) {
                const newTag = generateVFTag();
                await supabase.from('profiles').upsert([{ id: ghostData.user.id, vf_tag: newTag, total_xp: 0, rank_name: 'Commis Chef' }], { onConflict: 'id' });
              }
            }
            // PHASE 1 LOCKDOWN: Force them to the Kitchen, completely bypassing the Field!
            setViewingMerchantId(m);
            setCurrentView('kitchen'); 
          }
        } else {
          const savedTable = localStorage.getItem('vf_active_table');
          const savedToken = localStorage.getItem('vf_session_token');
          const savedMerchant = localStorage.getItem('vf_active_merchant');
          if (savedTable && savedToken) {
            setTableSession(savedTable, savedToken, savedMerchant); 
          }
        }
      }
    };
    initNFC();
  }, []);
  // =========================================================================

  useEffect(() => {
    const fetchCloudRecipes = async () => {
      setIsLoadingCloud(true);
      try {
        const targetMerchantId = localStorage.getItem('vf_active_merchant');
        
        let query = supabase.from('recipes').select('*');
        if (targetMerchantId) {
          query = query.eq('merchant_id', targetMerchantId);
        } else {
          query = query.is('merchant_id', null); 
        }

        const { data, error } = await query;
        if (error) throw error;
        
        if (data) {
          const dict = {};
          const arr = [];
          data.forEach(row => {
            const recipe = row.data;
            dict[recipe.id] = recipe;
            arr.push({
              id: recipe.id, title: recipe.title || 'UNKNOWN PROTOCOL', time: recipe.time || '15 MINS',
              desc: recipe.desc || 'Loadout details classified.', diet: recipe.diet || 'VEG', category: recipe.category || 'MUNCHIES',
              price: recipe.price || null
            });
          });
          setRecipeDictionary(dict);
          setDynamicDishes(arr);
        }
      } catch (err) { console.error("Cloud Intel sync failed:", err); } 
      finally { setIsLoadingCloud(false); }
    };
    
    if (currentView === 'kitchen' || currentView === 'landing') fetchCloudRecipes();
  }, [currentView, activeTableId]);

  const sendBatchToKitchen = async (itemsArray, specificToken, specificTable) => {
    const tableToUse = specificTable || activeTableId;
    const tokenToUse = specificToken || sessionToken;
    if (!tableToUse || !tokenToUse) return;
    
    const targetMerchantId = localStorage.getItem('vf_active_merchant'); 

    for (const item of itemsArray) {
      const { error } = await supabase.from('culinary_telemetry').insert([{
        merchant_id: targetMerchantId, 
        event_type: `nfc_order_table_${tableToUse}`, 
        recipe_id: item.title, 
        recipe_category: item.category,
        spice_protocol: item.spice || 'N/A', 
        stage_reached: item.stages || 0, 
        platform: 'web',
        event_data: { session_token: tokenToUse } 
      }]);
      
      if (error) {
        setSystemError(error.message);
        setTimeout(() => setSystemError(null), 5000);
      }
    }
  };

  useEffect(() => {
    const masterClock = setInterval(() => {
      const state = useStore.getState();
      if (state.batchTimer !== null) {
        if (state.batchTimer > 1) {
          state.decrementTimer();
        } else if (state.batchTimer === 1) {
          state.decrementTimer();
          if (state.pendingBatch.length > 0) {
             sendBatchToKitchen(state.pendingBatch, state.sessionToken, state.activeTableId);
          }
          state.markBatchSent(); 
        }
      }
    }, 1000);
    return () => clearInterval(masterClock);
  }, []);

  const handleFieldCheckout = (loadoutItems) => {
    if (!activeTableId) return false; 
    
    const formattedItems = loadoutItems.map(item => ({
      title: item.name,
      category: item.category || 'MUNCHIES', 
      spice: item.spice?.name || 'Standard',
      stages: 0
    }));

    const drinks = [];
    const food = [];
    
    formattedItems.forEach(item => {
       if (item.category === 'DRINKS' || item.category === 'BEVERAGE' || item.category === 'SUMMER SPECIAL') {
         drinks.push(item);
       } else {
         food.push(item);
       }
    });

    if (drinks.length > 0) {
       sendBatchToKitchen(drinks);
       addDirectlyToSent(drinks); 
    }
    if (food.length > 0) {
       addToBatch(food); 
    }
    
    return true; 
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        setSession(currentSession);
        fetchOrInitializeProfile(currentSession.user);
      } 
    };
    initializeAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchOrInitializeProfile(session.user);
        setCurrentView((prev) => {
          if (prev === 'auth' || prev === 'landing') return 'kitchen';
          return prev;
        });
        if (showVerification) {
          setShowVerification(false);
          if (pendingXP > 0) applyRewards(pendingXP, 0); 
        }
      } 
    });
    return () => subscription.unsubscribe();
  }, [showVerification, pendingXP]);

  const fetchOrInitializeProfile = async (user) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error && error.code === 'PGRST116') {
        const startingXP = user.is_anonymous ? 0 : (parseInt(localStorage.getItem('veryfryd_xp')) || 0);
        const newTag = localStorage.getItem('veryfryd_remembered_tag') || generateVFTag();
        const { data: newProfile, error: insertError } = await supabase.from('profiles').insert([{
          id: user.id, vf_tag: newTag, total_xp: startingXP, rank_name: 'Commis Chef'
        }]).select().single();
        
        if (!insertError && newProfile) {
          setVfTag(newProfile.vf_tag);
          setUserXP(newProfile.total_xp);
        }
      } else if (data) {
        setVfTag(data.vf_tag);
        setUserXP(data.total_xp);
      }
    } catch (err) { console.error("Database sync failed:", err); }
  };

  const applyRewards = async (amountXP, amountCoins) => {
    const oldRankInfo = getRankIntel(userXP);
    const newXP = userXP + amountXP;
    const newCoins = userCoins + amountCoins;
    const newRankInfo = getRankIntel(newXP);
    if (newRankInfo.title !== oldRankInfo.title && amountXP > 0) {
       setJustUnlockedRank(newRankInfo.title);
       setJustUnlockedTheme(newRankInfo.theme);
       setShowLevelUp(true);
    }
    setUserXP(newXP);
    setUserCoins(newCoins);
    localStorage.setItem('veryfryd_xp', newXP.toString());
    localStorage.setItem('veryfryd_coins', newCoins.toString());
    if (session?.user && amountXP > 0) await supabase.from('profiles').update({ total_xp: newXP }).eq('id', session.user.id);
    setPendingXP(0);
  };

  const handleDishComplete = async (earnedXP, earnedCoins) => { 
    if (activeRecipeData) {
      const orderedItem = {
        title: activeRecipeData.title || activeRecipeData.id,
        category: activeRecipeData.category,
        spice: activeSpiceLevel?.name || 'Standard',
        stages: activeRecipeData.stages?.length || currentStageIndex
      };

      if (activeTableId) {
        if (orderedItem.category === 'BEVERAGE' || orderedItem.category === 'SUMMER SPECIAL' || orderedItem.category === 'DRINKS') {
          sendBatchToKitchen([orderedItem]);
          addDirectlyToSent([orderedItem]); 
        } else {
          addToBatch([orderedItem]); 
        }
      } else {
        if (session?.user) {
          supabase.from('events').insert([{ user_id: session.user.id, event_category: 'KITCHEN_ACTION', event_type: 'RECIPE_COMPLETED', event_data: orderedItem }]).then(); 
        }
      }
    }
    
    if (session?.user?.is_anonymous) {
      setPendingXP(earnedXP); 
      applyRewards(0, earnedCoins); 
      setShowVerification(true); 
    } else {
      applyRewards(earnedXP, earnedCoins); 
      setCurrentView('kitchen'); 
    }
  };

  const handleEnterKitchen = async (mode) => {
    if (mode === 'login') {
      setCurrentView('auth');
    } else if (mode === 'guest') {
      setCurrentView('kitchen');
      localStorage.removeItem('veryfryd_remembered_tag'); localStorage.removeItem('veryfryd_xp'); localStorage.removeItem('veryfryd_theme'); localStorage.removeItem('veryfryd_coins');
      setUserXP(0); setUserCoins(0); setVfTag(null); setActiveTheme('commis');
      try {
        await supabase.auth.signOut();
        const { data: ghostData, error } = await supabase.auth.signInAnonymously();
        if (!error && ghostData?.user) {
          const newTag = generateVFTag();
          await supabase.from('profiles').upsert([{ id: ghostData.user.id, vf_tag: newTag, total_xp: 0, rank_name: 'Commis Chef' }], { onConflict: 'id' });
          setSession({ user: ghostData.user }); setVfTag(newTag);
        }
      } catch (err) { console.log("Auth bypass engaged."); }
    } else { setCurrentView('kitchen'); }
  };

  const startRecipe = (recipeId) => {
    if (activeRecipeData && activeRecipeData.id === recipeId && isCooking) {
      setCurrentView('stages'); return;
    }
    const selectedData = recipeDictionary[recipeId];
    if (selectedData) {
      setActiveRecipeData(selectedData);
      if (selectedData.category === 'BAKERY' || (selectedData.category === 'SAUCES' && !selectedData.requiresSpice)) {
        setActiveSpiceLevel({ name: 'Standard', level: 0 }); setCurrentStageIndex(0); setIsCooking(false); setCurrentView('prep');
      } else { setCurrentView('spice-select'); }
      setIsFoodyOpen(false); 
    }
  };

  const handleSpiceSelection = async (spiceObj) => {
    setActiveSpiceLevel(spiceObj); 
    setCurrentStageIndex(0); setIsCooking(false); setCurrentView('prep'); 
  };

  const handleCancelDish = () => {
    setIsCooking(false); setCurrentStageIndex(0); setActiveRecipeData(null); setCurrentView('kitchen');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); 
    setSession(null); setUserXP(0); setUserCoins(0); setVfTag(null); setActiveTheme('commis'); setPendingXP(0);
    clearTableSession(); 
    setCurrentView('landing'); setShowTrophyRoom(false);
  };

  return (
    <CommsShield>
      <KitchenCanvas activeTheme={activeTheme}>
        
        <AnimatePresence>
          {systemError && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-red-600 text-white font-black uppercase text-[10px] md:text-xs tracking-widest px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center w-[90%] max-w-md pointer-events-auto"
            >
              🔥 SYSTEM FAILURE: {systemError}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLevelUp && <div className="fixed inset-0 z-[1000]"><LevelUpLab rankTitle={justUnlockedRank} onClose={(shouldEquip) => { if (shouldEquip) handleThemeChange(justUnlockedTheme); setShowLevelUp(false); }} /></div>}
        </AnimatePresence>

        <AnimatePresence>
          {activeTableId && currentView === 'field' && viewingMerchantId === localStorage.getItem('vf_active_merchant') && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className="fixed top-20 right-4 lg:right-12 z-[900] w-48 md:w-56 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 pointer-events-auto"
            >
              <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
                <span className="font-black uppercase text-xs">Table {activeTableId} Tab</span>
                <span className="text-[8px] bg-black text-white px-1.5 py-0.5">{sessionToken}</span>
              </div>
              
              {pendingBatch.length > 0 && (
                <div className="mb-3 bg-yellow-100 border-2 border-black p-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black uppercase text-yellow-800">Pending Batch</span>
                    <span className="text-[10px] font-black text-red-600 animate-pulse">{useStore.getState().batchTimer}s</span>
                  </div>
                  {pendingBatch.map((item, idx) => (
                    <div key={idx} className="text-[10px] font-bold text-black border-t border-yellow-300 pt-1 mt-1 truncate">
                      + {item.title}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <span className="text-[9px] font-black uppercase text-gray-500 mb-1 block">Fired to Kitchen</span>
                {sentItems.length === 0 && pendingBatch.length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic font-bold">Tab is empty.</p>
                ) : (
                  <div className="space-y-1">
                    {sentItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] font-bold text-gray-800 border-b border-gray-200 pb-1">
                        <span className="truncate pr-2">1x {item.title}</span>
                        <span className="text-green-600">✓</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showVerification && <VerificationProtocol onSkip={() => { setShowVerification(false); if (pendingXP > 0) applyRewards(pendingXP, 0); }} onLoginRedirect={() => { setShowVerification(false); if (pendingXP > 0) applyRewards(pendingXP, 0); setCurrentView('auth'); }} rememberedTag={vfTag} />}

        {session && !session.user.is_anonymous && currentView !== 'auth' && currentView !== 'lab' && currentView !== 'stealth_menu' && (
          <button onClick={handleSignOut} className="fixed bottom-6 left-6 z-[100] bg-black text-white px-3 py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-red-600 hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">Disconnect</button>
        )}

        {currentView !== 'landing' && currentView !== 'auth' && currentView !== 'lab' && currentView !== 'stealth_menu' && (
          <Foody isOpen={isFoodyOpen} onToggle={() => setIsFoodyOpen(!isFoodyOpen)} activeRecipeData={currentView === 'stages' || currentView === 'prep' ? activeRecipeData : null} currentStageIndex={currentView === 'stages' ? currentStageIndex : 0} recipeDictionary={recipeDictionary} tutorialMessage={tutorialMessage} onClearTutorial={() => setTutorialMessage(null)} />
        )}

        {showTrophyRoom && (
          <ErrorBoundary>
            <TrophyRoom 
              vfTag={vfTag || 'VF-UNKNOWN'} 
              userXP={userXP} 
              rankIntel={rankIntel} 
              activeTheme={activeTheme} 
              setTheme={handleThemeChange} 
              isAnonymous={session?.user?.is_anonymous} 
              onClose={() => setShowTrophyRoom(false)} 
              onSignOut={handleSignOut} 
            />
          </ErrorBoundary>
        )}

        {currentView !== 'lab' && currentView !== 'stealth_menu' && (
          <BottomNav 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
            onOpenDossier={() => setShowTrophyRoom(true)} 
            isDossierOpen={showTrophyRoom} 
          />
        )}

        <main className={`p-0 w-full mx-auto flex flex-col relative min-h-screen ${
          currentView === 'landing' || currentView === 'lab' || currentView === 'stealth_menu'
            ? 'max-w-none' 
            : 'max-w-[1440px] pb-24 px-4 md:px-8 lg:px-12'
        }`}>
          {currentView === 'lab' && <LevelUpLab />}
          {currentView === 'landing' && <LandingPage onEnter={handleEnterKitchen} rememberedTag={vfTag} />}
          {currentView === 'auth' && <Auth onBack={() => setCurrentView('landing')} />}
          
          {currentView === 'stealth_menu' && (
            <PublicMenu
              merchantId={localStorage.getItem('vf_active_merchant')}
              tableId={localStorage.getItem('vf_active_table')}
              sessionToken={localStorage.getItem('vf_session_token')}
            />
          )}

          {currentView === 'kitchen' && <Dashboard availableDishes={dynamicDishes} onSelectRecipe={startRecipe} userXP={userXP} userCoins={userCoins} rankIntel={rankIntel} activeRecipeId={activeRecipeData?.id} isCooking={isCooking} onToggleFoody={() => setIsFoodyOpen(!isFoodyOpen)} />}
          
          {/* --- PHASE 1 LOCKDOWN: TheField Rendering Removed --- */}
          {/* 
          {currentView === 'field' && (
             <TheField 
               userXP={userXP} 
               isAnonymous={session?.user?.is_anonymous} 
               onRequireAuth={() => setShowVerification(true)} 
               onFieldCheckout={handleFieldCheckout} 
             />
          )} 
          */}

          {currentView === 'spice-select' && <ErrorBoundary><SpiceSelector recipeData={activeRecipeData} onSelectSpice={handleSpiceSelection} onBack={() => setCurrentView('kitchen')} /></ErrorBoundary>}
          {currentView === 'prep' && <ErrorBoundary><PrepChecklist recipeData={activeRecipeData} isCooking={isCooking} onStartCooking={() => { setIsCooking(true); setCurrentView('stages'); }} onBackToDashboard={() => setCurrentView('kitchen')} /></ErrorBoundary>}

          <div style={{ display: currentView === 'stages' ? 'block' : 'none', width: '100%' }}>
            {activeRecipeData && isCooking && <ErrorBoundary><StageManager recipeData={activeRecipeData} currentStageIndex={currentStageIndex} setCurrentStageIndex={setCurrentStageIndex} onDishComplete={handleDishComplete} onBackToDashboard={() => setCurrentView('kitchen')} onViewPrep={() => setCurrentView('prep')} onCancelDish={handleCancelDish} /></ErrorBoundary>}
          </div>
        </main>
      </KitchenCanvas>
    </CommsShield>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [hostname, setHostname] = useState(window.location.hostname);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isMerchantPortal = hostname === 'merchant.veryfryd.com' || currentPath === '/merchant';
  const isDirectorPortal = hostname === 'command.veryfryd.com' || currentPath === '/director';

  if (isMerchantPortal) {
    return (
      <CommsShield>
        <KitchenCanvas activeTheme="sous">
          <ErrorBoundary>
            <div className="relative z-10 w-full bg-transparent">
              <MerchantCRM targetGateway="merchant" onExit={() => navigateTo('/')} />
            </div>
          </ErrorBoundary>
        </KitchenCanvas>
      </CommsShield>
    );
  }

  if (isDirectorPortal) {
    return (
      <CommsShield>
        <KitchenCanvas activeTheme="ratatouille">
          <ErrorBoundary>
            <CommandCenter onExit={() => navigateTo('/')} />
          </ErrorBoundary>
        </KitchenCanvas>
      </CommsShield>
    );
  }

  return <ConsumerApp onNavigate={navigateTo} />;
}