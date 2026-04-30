import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';

// --- IMPORT OUR MODULAR COMPONENTS ---
import AuthGate from './AuthGate.jsx';
import LiveFloor from './LiveFloor.jsx';
import InventoryMatrix from './InventoryMatrix.jsx';
import IntelligenceDash from './IntelligenceDash.jsx';
import OnboardingInterview from './OnboardingInterview.jsx';

const INITIAL_TABLES = [
  ...Array.from({ length: 6 }, (_, i) => ({ 
    id: (i + 1).toString(), 
    label: `T-${i + 1}`, 
    type: 'DINE-IN', 
    status: 'VACANT', 
    items: [], 
    activeToken: null, 
    session_start: null 
  })),
  ...Array.from({ length: 3 }, (_, i) => ({ 
    id: `TA-${i + 1}`, 
    label: `TA-${i + 1}`, 
    type: 'TAKEAWAY', 
    status: 'VACANT', 
    items: [], 
    activeToken: null, 
    session_start: null 
  }))
];

const SVG_PATTERN_ACTIVE = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIgLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiIC8+Cjwvc3ZnPg==')";
const SVG_PATTERN_INACTIVE = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIgLz4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNykiIC8+Cjwvc3ZnPg==')";

const NavTab = ({ label, subLabel, onClick, isActive, accentColor }) => (
  <button onClick={onClick} style={{ backgroundImage: isActive ? SVG_PATTERN_ACTIVE : SVG_PATTERN_INACTIVE }} className={`flex-1 md:flex-none flex flex-col items-center justify-center px-6 py-2 relative transition-all group pointer-events-auto border-4 border-black ${isActive ? 'bg-[#111] text-white translate-y-1 backdrop-blur-md' : 'bg-white/90 backdrop-blur-sm text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'}`}>
    {isActive && <div className={`absolute bottom-0 left-0 w-full h-1.5 ${accentColor}`}></div>}
    <span className="font-black uppercase tracking-widest text-[10px] md:text-xs z-10 drop-shadow-md">{label}</span>
    <span className={`font-bold uppercase tracking-widest text-[8px] md:text-[9px] mt-0.5 z-10 ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>{subLabel}</span>
  </button>
);

export default function MerchantCRM({ onExit }) {
  const [session, setSession] = useState(null);
  const [merchantData, setMerchantData] = useState(null);
  const [activeView, setActiveView] = useState('TABLES'); 
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Global State
  const [partnershipTier, setPartnershipTier] = useState('CRM_ONLY');
  const [weatherData, setWeatherData] = useState({ temp: 32, condition: 'Clear' }); 
  const [liveMenu, setLiveMenu] = useState([]);
  const liveMenuRef = useRef([]);
  const [chatLog, setChatLog] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [inventoryTelemetry, setInventoryTelemetry] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [inventoryStock, setInventoryStock] = useState([]); 

  const canAccessAI = partnershipTier === 'ELITE_PARTNER' || partnershipTier === 'STEALTH_ELITE';
  const hasXP = partnershipTier === 'ELITE_PARTNER';
  const themeHexClass = canAccessAI ? 'bg-green-500' : 'bg-blue-500';
  const themeTextClass = canAccessAI ? 'text-green-600' : 'text-blue-600';

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) { setSession(currentSession); verifyMerchantAccess(currentSession.user.id); }
    };
    checkSession();
  }, []);

  // --- UPGRADED: Coordinates String Parser ---
  const fetchTargetedWeather = async (locationData) => {
    try {
      let url = `/api/weather?t=${Date.now()}`; 
      
      // If the new 'coordinates' string exists, split it!
      if (locationData?.coordinates) {
        const [lat, lon] = locationData.coordinates.split(',').map(c => c.trim());
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
      } 
      // Fallback for older test accounts that still have separate lat/lng
      else if (locationData?.lat && locationData?.lng) {
        url += `&lat=${locationData.lat}&lon=${locationData.lng}`;
      } 
      else if (locationData?.city) {
        url += `&city=${encodeURIComponent(locationData.city)}`;
      } 
      else {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const liveUrl = `/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&t=${Date.now()}`;
            const liveRes = await fetch(liveUrl);
            if (liveRes.ok) setWeatherData(await liveRes.json());
          });
          return; 
        }
      }
      
      const res = await fetch(url); 
      if (res.ok) setWeatherData(await res.json()); 
    } catch (err) { console.error("Weather Sync Failed", err); }
  };

  const fetchRealMenu = async (mId) => {
    const { data } = await supabase.from('recipes').select('*').eq('merchant_id', mId);
    if (data) {
      const formattedMenu = data.map(row => {
        const sellPrice = row.data.price || 199;
        const costPrice = row.data.cost_price || (sellPrice * 0.3); 
        return { 
          id: row.id, name: row.data.title || 'Unnamed Protocol', price: sellPrice,
          cost_price: costPrice, margin: sellPrice - costPrice
        };
      });
      setLiveMenu(formattedMenu); liveMenuRef.current = formattedMenu;
    }
  };

  useEffect(() => {
    if (!session || !merchantData) return;
    const channel = supabase.channel('public:culinary_telemetry').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'culinary_telemetry' }, (payload) => {
         const newRecord = payload.new;
         if (newRecord.merchant_id !== merchantData.id) return; 
         if (newRecord.event_type && newRecord.event_type.startsWith('nfc_order_table_')) {
           const incomingTableId = newRecord.event_type.split('table_').pop(); 
           const incomingToken = newRecord.event_data?.session_token; 
           const currentMenu = liveMenuRef.current;
           const matchedItem = currentMenu.find(m => m.name.toLowerCase() === newRecord.recipe_id.toLowerCase()) || { id: `custom_${Date.now()}`, name: newRecord.recipe_id, price: 199 };
           
           setTables(prev => prev.map(t => {
             if (t.id === incomingTableId) {
               if (t.status === 'OCCUPIED' && t.activeToken && t.activeToken !== incomingToken) return t; 
               const existing = t.items.find(i => i.name === matchedItem.name);
               let newItems = existing ? t.items.map(i => i.name === matchedItem.name ? { ...i, qty: i.qty + 1 } : i) : [...t.items, { ...matchedItem, qty: 1 }];
               const sessionStart = t.session_start || Date.now();
               return { ...t, items: newItems, status: 'OCCUPIED', activeToken: incomingToken, session_start: sessionStart };
             }
             return t;
           }));
         }
      }).subscribe();
    return () => { supabase.removeChannel(channel); }
  }, [session, merchantData]); 

  const loadChatHistory = async (merchantId) => {
    const { data } = await supabase.from('merchant_chat_history').select('role, content').eq('merchant_id', merchantId).order('created_at', { ascending: false }).limit(20); 
    if (data && data.length > 0) setChatLog(data.reverse()); 
  };

  const fetchLiveDashboardData = async (merchantId) => {
    try {
      const pastDate = new Date(); pastDate.setDate(pastDate.getDate() - 7);
      const { data: transData } = await supabase.from('merchant_transactions').select('created_at, total_bill').eq('merchant_id', merchantId).gte('created_at', pastDate.toISOString()); 
      if (transData) {
        setTotalOrders(transData.length);
        const dayTotals = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
        transData.forEach(t => { const dayName = new Date(t.created_at).toLocaleDateString('en-US', { weekday: 'short' }); if (dayTotals[dayName] !== undefined) dayTotals[dayName] += t.total_bill || 0; });
        setRevenueData(Object.keys(dayTotals).map(day => ({ day, revenue: dayTotals[day] })));
      }
      const { data: telemetryData } = await supabase.from('culinary_telemetry').select('recipe_id').eq('merchant_id', merchantId).gte('created_at', pastDate.toISOString()).limit(100); 
      if (telemetryData) {
        const itemCounts = {}; telemetryData.forEach(t => { itemCounts[t.recipe_id || 'Unknown'] = (itemCounts[t.recipe_id || 'Unknown'] || 0) + 1; });
        setInventoryTelemetry(Object.entries(itemCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 4));
      }
    } catch (error) { }
  };

  const fetchInventory = async (merchantId) => {
    const { data } = await supabase.from('merchant_inventory').select('*').eq('merchant_id', merchantId).order('created_at', { ascending: true });
    if (data) setInventoryStock(data);
  };

  const verifyMerchantAccess = async (userId) => {
    const { data } = await supabase.from('merchants').select('*').eq('id', userId).single();
    if (data) {
      setMerchantData(data); 
      setPartnershipTier(data.partnership_tier || 'CRM_ONLY');
      
      if (!data.merchant_priors || Object.keys(data.merchant_priors).length === 0) {
        setNeedsOnboarding(true);
      }
      
      fetchLiveDashboardData(data.id); 
      loadChatHistory(data.id); 
      fetchRealMenu(data.id); 
      fetchInventory(data.id); 
      fetchTargetedWeather(data.location_data);
    } else {
      await supabase.auth.signOut(); setSession(null);
    }
  };

  const generateBIPayload = async (days = 7) => {
    const pastDate = new Date(); pastDate.setDate(pastDate.getDate() - days);
    const dateString = pastDate.toISOString();
    const hoursElapsed = days * 24; 
    
    // --- THE WEIGHTED CROSS-FADE ALGORITHM ---
    const priors = merchantData.merchant_priors || {};
    const FADE_THRESHOLD = 50; 
    
    const realWeight = Math.min(totalOrders / FADE_THRESHOLD, 1);
    const priorWeight = 1 - realWeight;
    const isTransitioning = priorWeight > 0;
    
    const pWeekdayRev = priors.baseline_weekday_rev || 15000;
    const pWeekendRev = priors.baseline_weekend_rev || 40000;
    const pDwell = priors.expected_dwell_mins || 45;
    const pLossTol = priors.weekly_loss_tolerance || 2000;

    // 1. Fetch Transactions
    const { data: transData } = await supabase.from('merchant_transactions')
      .select('id, created_at, total_bill, status, discount_amount, order_duration_minutes')
      .gte('created_at', dateString)
      .eq('merchant_id', merchantData.id);
    
    let totalRevenue = 0;
    let totalCompedRevenue = 0;
    let compCount = 0;
    let totalDwellMinutes = 0;
    let validDwellCount = 0;

    const shiftPerformance = { morning_7am_12pm: { revenue: 0, orders: 0 }, lunch_12pm_4pm: { revenue: 0, orders: 0 }, evening_4pm_10pm: { revenue: 0, orders: 0 }, late_night_10pm_7am: { revenue: 0, orders: 0 } };

    transData?.forEach(t => {
      if (t.status === 'comped') {
        compCount++;
        totalCompedRevenue += (t.discount_amount || 0);
      } else {
        totalRevenue += (t.total_bill || 0);
      }

      if (t.order_duration_minutes && t.order_duration_minutes > 0) {
        totalDwellMinutes += t.order_duration_minutes;
        validDwellCount++;
      }
      
      const hour = new Date(t.created_at).getHours();
      if (hour >= 7 && hour < 12) { shiftPerformance.morning_7am_12pm.revenue += t.total_bill || 0; shiftPerformance.morning_7am_12pm.orders++; }
      else if (hour >= 12 && hour < 16) { shiftPerformance.lunch_12pm_4pm.revenue += t.total_bill || 0; shiftPerformance.lunch_12pm_4pm.orders++; }
      else if (hour >= 16 && hour < 22) { shiftPerformance.evening_4pm_10pm.revenue += t.total_bill || 0; shiftPerformance.evening_4pm_10pm.orders++; }
      else { shiftPerformance.late_night_10pm_7am.revenue += t.total_bill || 0; shiftPerformance.late_night_10pm_7am.orders++; }
    });

    const rawRealDwell = validDwellCount > 0 ? (totalDwellMinutes / validDwellCount) : pDwell;
    const blendedDwell = Math.round((rawRealDwell * realWeight) + (pDwell * priorWeight));

    const seatCount = merchantData.seat_count || 30; 
    const totalSeatHours = seatCount * hoursElapsed;
    const totalRevPash = totalSeatHours > 0 ? parseFloat((totalRevenue / totalSeatHours).toFixed(2)) : 0;
    
    const revpashMetrics = {
      overall_period_revpash_inr: totalRevPash,
      morning_revpash_inr: parseFloat((shiftPerformance.morning_7am_12pm.revenue / (seatCount * 5 * days)).toFixed(2)) || 0,
      lunch_revpash_inr: parseFloat((shiftPerformance.lunch_12pm_4pm.revenue / (seatCount * 4 * days)).toFixed(2)) || 0,
      evening_revpash_inr: parseFloat((shiftPerformance.evening_4pm_10pm.revenue / (seatCount * 6 * days)).toFixed(2)) || 0,
      network_benchmark_inr: 190 
    };
    
    // 2. Fetch Telemetry
    const { data: telData } = await supabase.from('culinary_telemetry').select('recipe_id, transaction_id, event_type').gte('created_at', dateString).eq('merchant_id', merchantData.id);
    
    const itemCounts = {}; let totalItemsSold = 0;
    const baskets = {}; 
    let voidCount = 0;

    telData?.forEach(t => { 
      if (t.event_type === 'void') { voidCount++; return; }
      const itemName = t.recipe_id || 'Unknown';
      itemCounts[itemName] = (itemCounts[itemName] || 0) + 1; 
      totalItemsSold++; 
      if (t.transaction_id) {
        if (!baskets[t.transaction_id]) baskets[t.transaction_id] = [];
        baskets[t.transaction_id].push(itemName);
      }
    });

    const pairCounts = {};
    Object.values(baskets).forEach(basket => {
      const uniqueItems = [...new Set(basket)].sort(); 
      for (let i = 0; i < uniqueItems.length; i++) {
        for (let j = i + 1; j < uniqueItems.length; j++) {
          const pair = `${uniqueItems[i]} + ${uniqueItems[j]}`;
          pairCounts[pair] = (pairCounts[pair] || 0) + 1;
        }
      }
    });
    const topTrendingPairs = Object.entries(pairCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(p => `${p[0]} (Paired ${p[1]} times)`);

    const currentDayOfWeek = new Date().getDay(); 
    const todayDateString = new Date().toDateString();
    
    let historicalMatchingDayRevenue = 0;
    let matchingDayCount = 0;
    let todayLiveRevenue = 0;

    transData?.forEach(t => {
      const tDate = new Date(t.created_at);
      const bill = t.total_bill || 0;
      if (tDate.toDateString() === todayDateString) {
        todayLiveRevenue += bill;
      } else if (tDate.getDay() === currentDayOfWeek) {
        historicalMatchingDayRevenue += bill;
        matchingDayCount++; 
      }
    });

    const uniqueMatchingDays = Math.max(1, Math.ceil(matchingDayCount / Math.max(1, (totalOrders / days)))); 
    const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;
    
    const rawRealBaseline = historicalMatchingDayRevenue > 0 ? (historicalMatchingDayRevenue / uniqueMatchingDays) : 0;
    const syntheticBaseline = isWeekend ? pWeekendRev : pWeekdayRev;
    
    const blendedBaseline = Math.round((rawRealBaseline * realWeight) + (syntheticBaseline * priorWeight));
      
    const trackingStatus = todayLiveRevenue >= blendedBaseline ? 'AHEAD_OF_SCHEDULE' : 'BEHIND_BASELINE';

    const demandModel = {
      current_day_name: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      historical_average_for_this_day: blendedBaseline,
      today_live_revenue_so_far: todayLiveRevenue,
      tracking_status: trackingStatus,
      deficit_to_baseline: blendedBaseline - todayLiveRevenue,
      blending_ratio: `${Math.round(realWeight * 100)}% Real / ${Math.round(priorWeight * 100)}% Priors`
    };

    const midpointTime = new Date().getTime() - ((days / 2) * 24 * 60 * 60 * 1000);
    let olderHalfRevenue = 0, recentHalfRevenue = 0, olderHalfOrders = 0, recentHalfOrders = 0;

    transData?.forEach(t => {
      const tTime = new Date(t.created_at).getTime();
      if (tTime < midpointTime) { olderHalfRevenue += (t.total_bill || 0); olderHalfOrders++; } 
      else { recentHalfRevenue += (t.total_bill || 0); recentHalfOrders++; }
    });

    const revenueTrajectory = olderHalfRevenue > 0 ? Math.round(((recentHalfRevenue - olderHalfRevenue) / olderHalfRevenue) * 100) : 0;
    const orderVelocityTrajectory = olderHalfOrders > 0 ? Math.round(((recentHalfOrders - olderHalfOrders) / olderHalfOrders) * 100) : 0;

    let brandHealthStatus = "STABLE";
    if (totalOrders < 20) {
      brandHealthStatus = "GATHERING_BASELINE_DATA";
    } else {
      if (revenueTrajectory <= -15 || orderVelocityTrajectory <= -15) brandHealthStatus = "CHURN_WARNING";
      if (revenueTrajectory >= 15 && orderVelocityTrajectory >= 15) brandHealthStatus = "GROWTH_SURGE";
    }

    const currentTemp = weatherData?.temp || 30;
    const currentCondition = weatherData?.condition?.toLowerCase() || 'clear';

    let environmentalStrategy = "STANDARD_OPERATIONS";
    let tacticalRecommendation = "";
    if (currentTemp >= 35) {
      environmentalStrategy = "EXTREME_HEAT_PROTOCOL";
      tacticalRecommendation = "Prioritize high-margin iced beverages and cold desserts. Suppress heavy hot meals on digital displays.";
    } else if (currentTemp <= 15) {
      environmentalStrategy = "COLD_WEATHER_PROTOCOL";
      tacticalRecommendation = "Push hot beverages, soups, and high-calorie comfort foods. Expect longer dwell times as customers seek shelter.";
    } else if (currentCondition.includes('rain') || currentCondition.includes('storm')) {
      environmentalStrategy = "INCLEMENT_WEATHER_PROTOCOL";
      tacticalRecommendation = "Walk-in foot traffic will drop sharply. Immediately activate TAKEAWAY/DELIVERY push notifications and combo deals to offload prep.";
    } else {
      environmentalStrategy = "OPTIMAL_CONDITIONS";
      tacticalRecommendation = "Focus on standard margin-drivers and table turn rates.";
    }

    const weatherIntelligence = {
      live_temp_celsius: currentTemp,
      live_condition: currentCondition,
      active_environmental_strategy: environmentalStrategy,
      tactical_recommendation: tacticalRecommendation
    };

    const currentMenu = liveMenuRef.current;
    const itemMargins = [];
    Object.entries(itemCounts).forEach(([itemName, count]) => {
      const menuItem = currentMenu.find(m => m.name.toLowerCase() === itemName.toLowerCase());
      const sellPrice = menuItem ? menuItem.price : 0;
      const costPrice = menuItem ? menuItem.cost_price : (sellPrice * 0.3);
      const unitMargin = sellPrice - costPrice;
      itemMargins.push({ name: itemName, units_sold: count, profit_margin_percent: sellPrice > 0 ? Math.round((unitMargin / sellPrice) * 100) : 0, total_profit_contributed: unitMargin * count });
    });
    const topProfitItems = [...itemMargins].sort((a,b) => b.total_profit_contributed - a.total_profit_contributed).slice(0,3);
    const worstProfitItems = [...itemMargins].sort((a,b) => a.total_profit_contributed - b.total_profit_contributed).slice(0,3);

    const inventorySnapshot = inventoryStock.map(item => {
      const unitsSoldInPeriod = itemCounts[item.name] || 0;
      const velocityPerHour = unitsSoldInPeriod / hoursElapsed;
      const hoursUntilRunout = velocityPerHour > 0 ? parseFloat((item.stock / velocityPerHour).toFixed(1)) : 999; 
      return { 
        name: item.name, category: item.category, current_stock: item.stock, unit: item.unit, alert_level: item.alert_level,
        velocity_per_hour: velocityPerHour > 0 ? parseFloat(velocityPerHour.toFixed(2)) : 0, projected_runout_hours: hoursUntilRunout,
        status: item.stock <= item.alert_level ? 'CRITICAL' : item.stock <= item.alert_level * 1.5 ? 'LOW' : 'OK' 
      };
    });

    // --- THE STEALTH ELITE CONFLICT ENGINE ---
    const weatherConflicts = [];
    const vulnerableItems = inventorySnapshot.filter(i => i.status === 'CRITICAL' || i.projected_runout_hours < 6);
    
    vulnerableItems.forEach(item => {
      const itemProfile = (item.name + ' ' + (item.category || '')).toLowerCase();
      
      if (environmentalStrategy === 'EXTREME_HEAT_PROTOCOL' && (itemProfile.includes('cold') || itemProfile.includes('ice') || itemProfile.includes('shake') || itemProfile.includes('beverage') || itemProfile.includes('drink'))) {
        weatherConflicts.push(`HEAT SURGE RISK: ${item.name} will run out in ${item.projected_runout_hours}hrs. High heat drives demand for this item. Action required: Restock or pause online orders.`);
      }
      if (environmentalStrategy === 'COLD_WEATHER_PROTOCOL' && (itemProfile.includes('hot') || itemProfile.includes('soup') || itemProfile.includes('coffee') || itemProfile.includes('tea') || itemProfile.includes('warm'))) {
        weatherConflicts.push(`COMFORT SURGE RISK: ${item.name} will run out in ${item.projected_runout_hours}hrs. Cold weather drives demand for this item. Action required: Restock immediately.`);
      }
      if (environmentalStrategy === 'INCLEMENT_WEATHER_PROTOCOL' && (itemProfile.includes('box') || itemProfile.includes('pack') || itemProfile.includes('bag') || itemProfile.includes('container') || itemProfile.includes('takeaway'))) {
        weatherConflicts.push(`DELIVERY SURGE RISK: ${item.name} will run out in ${item.projected_runout_hours}hrs. Rain forces delivery mode. Action required: Secure packaging now.`);
      }
    });

    // --- THE PREDICTION LEDGER (Silent Background Logging) ---
    if (realWeight > 0.5) {
      const predictionsToLog = [];
      const now = new Date();

      inventorySnapshot.filter(i => i.status === 'CRITICAL' || i.projected_runout_hours < 24).forEach(item => {
        const targetTime = new Date(now.getTime() + (item.projected_runout_hours * 60 * 60 * 1000));
        predictionsToLog.push({
          merchant_id: merchantData.id,
          prediction_category: 'INVENTORY_RUNOUT',
          prediction_text: `${item.name} projected to run out in ${item.projected_runout_hours} hours based on current velocity of ${item.velocity_per_hour}/hr.`,
          target_timestamp: targetTime.toISOString()
        });
      });

      if (trackingStatus === 'BEHIND_BASELINE') {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        predictionsToLog.push({
          merchant_id: merchantData.id,
          prediction_category: 'DEMAND_DEFICIT',
          prediction_text: `Projected to miss the ${demandModel.current_day_name} baseline by ₹${demandModel.deficit_to_baseline}.`,
          target_timestamp: endOfDay.toISOString()
        });
      }

      if (predictionsToLog.length > 0) {
        supabase.from('foody_predictions').insert(predictionsToLog).then(({error}) => {
          if(error) console.error("Ledger Sync Error:", error);
        });
      }
    }
    // --------------------------------------------------------------

    return {
      timeframe: `Last ${days} Days (${hoursElapsed} Hours)`, 
      gross_revenue_inr: totalRevenue, 
      transition_status: isTransitioning ? `Cross-fading synthetic data. Order count: ${totalOrders}/50` : "100% Live Telemetry",
      
      revpash_metrics: revpashMetrics,
      average_table_dwell_time_minutes: blendedDwell,
      shift_performance_metrics: shiftPerformance,
      
      live_demand_model: demandModel,
      velocity_trend_and_brand_health: {
  revenue_trajectory_pct: revenueTrajectory,
  order_velocity_trajectory_pct: orderVelocityTrajectory,
  brand_health_status: brandHealthStatus
},
      environmental_intelligence: weatherIntelligence,
      
      weather_inventory_conflicts: weatherConflicts.length > 0 ? weatherConflicts : ["No immediate weather/inventory conflicts detected."],
      
      total_items_moved: totalItemsSold,
      frequently_bought_together: topTrendingPairs.length > 0 ? topTrendingPairs : ["Not enough data"],
      
      loss_prevention_metrics: {
        total_items_voided_pre_checkout: voidCount,
        total_bills_comped: compCount,
        revenue_lost_to_comps_inr: totalCompedRevenue,
        loss_tolerance_breached: totalCompedRevenue > pLossTol
      },
      
      top_profit_drivers: topProfitItems.map(i => `${i.name} (₹${i.total_profit_contributed} total profit, ${i.profit_margin_percent}% margin)`),
      lowest_profit_contributors: worstProfitItems.map(i => `${i.name} (₹${i.total_profit_contributed} total profit, ${i.profit_margin_percent}% margin)`),
      
      inventory_telemetry: inventorySnapshot, 
      critical_runout_warnings: inventorySnapshot.filter(i => i.status === 'CRITICAL' || i.projected_runout_hours < 24),
      gst_rate: merchantData.gst_rate || 5
    };
  };

  if (!session || !merchantData) return <AuthGate onExit={onExit} onVerifyAccess={verifyMerchantAccess} />;

  if (needsOnboarding) {
    return (
      <OnboardingInterview 
        merchantData={merchantData} 
        onComplete={async (newPriors) => {
          // --- UPGRADED: Force database save immediately to break the loop ---
          const { error } = await supabase.from('merchants').update({ merchant_priors: newPriors }).eq('id', merchantData.id);
          if (error) console.error("Database Save Error:", error.message);
          
          setMerchantData(prev => ({ ...prev, merchant_priors: newPriors }));
          setNeedsOnboarding(false);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-black font-sans p-4 md:p-8 flex flex-col items-center relative w-full overflow-y-auto">
      <div className="w-full max-w-[1440px] flex flex-col flex-1 gap-8 relative z-10 h-full">
        
        {/* HEADER ROUTER */}
        <div className="border-b-4 border-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 bg-white/80 backdrop-blur-md p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <span className="bg-black text-white px-2 py-1 text-[10px] font-black uppercase tracking-widest">Tier: {partnershipTier}</span>
              <span className="bg-white border-2 border-black text-black px-2 py-1 text-[10px] font-black uppercase">{weatherData.temp}°C | {weatherData.condition}</span>
            </div>
            <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none ${themeTextClass}`} style={{ WebkitTextStroke: "1.5px #000" }}>{merchantData.business_name}</h1>
            <div className="flex flex-wrap gap-3 mt-4">
              <NavTab label="Live Floor" subLabel="POS" onClick={() => setActiveView('TABLES')} isActive={activeView === 'TABLES'} accentColor="bg-black" />
              <NavTab label="Intelligence" subLabel="Foody AI" onClick={() => setActiveView('DASHBOARD')} isActive={activeView === 'DASHBOARD'} accentColor={themeHexClass} />
              <NavTab label="Inventory" subLabel="Matrix" onClick={() => setActiveView('INVENTORY')} isActive={activeView === 'INVENTORY'} accentColor="bg-black" />
            </div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); setSession(null); setMerchantData(null); }} className="border-4 border-black bg-red-500 text-white font-black py-2 text-xs hover:bg-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all uppercase px-4 self-start md:self-end">Terminate Session</button>
        </div>

        {/* VIEW RENDERER */}
        {activeView === 'DASHBOARD' && (
           <IntelligenceDash revenueData={revenueData} inventoryTelemetry={inventoryTelemetry} totalOrders={totalOrders} merchantData={merchantData} partnershipTier={partnershipTier} weatherData={weatherData} generateBIPayload={generateBIPayload} chatLog={chatLog} setChatLog={setChatLog} />
        )}
        {activeView === 'TABLES' && (
          <LiveFloor tables={tables} setTables={setTables} liveMenu={liveMenu} merchantData={merchantData} hasXP={hasXP} onRefreshDashboard={fetchLiveDashboardData} />
        )}
        {activeView === 'INVENTORY' && (
          <InventoryMatrix inventoryStock={inventoryStock} setInventoryStock={setInventoryStock} merchantData={merchantData} />
        )}
      </div>
    </div>
  );
}