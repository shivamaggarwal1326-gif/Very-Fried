import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient'; 

export default function PartnerHQ() {
  const [formData, setFormData] = useState({
    businessName: '', email: '', phone: '', password: '', partnershipTier: 'STEALTH_ELITE',
    locationData: { coordinates: '', city: '', pincode: '', locality: '' },
    directorKey: '' 
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [adminIdentity, setAdminIdentity] = useState(null);
  const [gpsError, setGpsError] = useState(null);

  useEffect(() => {
    const fetchAdminSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAdminIdentity(session.user.email);
      }
    };
    fetchAdminSession();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleLocationChange = (e) => setFormData(prev => ({ ...prev, locationData: { ...prev.locationData, [e.target.name]: e.target.value } }));

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setFormData(prev => ({ ...prev, locationData: { ...prev.locationData, coordinates: coords } }));
        },
        (error) => { setGpsError("GPS Detection Failed. Please enter coordinates manually."); setTimeout(() => setGpsError(null), 5000); }
      );
    }
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    setIsDeploying(true);
    setStatusMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Security Error: No active session found.");

      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify(formData) 
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Deployment failed.');

      setStatusMsg({ type: 'success', text: data.message });
      setFormData({ 
        businessName: '', email: '', phone: '', password: '', partnershipTier: 'STEALTH_ELITE', 
        locationData: { coordinates: '', city: '', pincode: '', locality: '' },
        directorKey: '' 
      });
    } catch (error) {
      setStatusMsg({ type: 'error', text: error.message });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mx-auto bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mt-8 relative">
      
      {adminIdentity && (
        <div className="absolute -top-3 right-6 bg-black text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-black flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          SECURE SESSION: {adminIdentity}
        </div>
      )}

      <div className="border-b-4 border-black pb-3 mb-4 flex justify-between items-end mt-2">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-black leading-none">Deploy Partner</h2>
          <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mt-1">Network Expansion Terminal</p>
        </div>
        <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse border-2 border-black"></div>
      </div>

      {statusMsg && (
        <div className={`mb-4 p-3 border-2 border-black font-black uppercase text-[10px] tracking-widest ${statusMsg.type === 'success' ? 'bg-green-400 text-black' : 'bg-red-500 text-white'}`}>
          {statusMsg.type === 'success' ? '✓ ' : '⚠️ '} {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleDeploy} className="flex flex-col gap-4">
        
        {/* Core Auth Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border-2 border-dashed border-gray-300">
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Business Name *</label>
            <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required className="border-2 border-black p-2 font-bold text-xs bg-[#fcfbf9] outline-none focus:bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Login Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="border-2 border-black p-2 font-bold text-xs bg-[#fcfbf9] outline-none focus:bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Contact Phone *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="border-2 border-black p-2 font-bold text-xs bg-[#fcfbf9] outline-none focus:bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Temporary Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" className="border-2 border-black p-2 font-bold text-xs bg-[#fcfbf9] outline-none focus:bg-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Network Tier *</label>
            <select name="partnershipTier" value={formData.partnershipTier} onChange={handleChange} className="border-2 border-black p-2 font-black text-xs bg-[#fcfbf9] outline-none focus:bg-white">
              <option value="STEALTH_ELITE">STEALTH ELITE</option>
              <option value="ELITE_PARTNER">ELITE PARTNER</option>
              <option value="CRM_ONLY">CRM ONLY</option>
            </select>
          </div>
        </div>

        {/* Location Block */}
        <div className="p-3 border-2 border-black bg-gray-50 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b-2 border-gray-300 pb-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-black">Geographic Intelligence</label>
            <button type="button" onClick={detectLocation} className="bg-black text-white px-2 py-1 text-[9px] font-black uppercase hover:bg-green-500 hover:text-black transition-colors">Detect GPS</button>
          </div>
          {gpsError && (
            <div className="bg-red-600 text-white font-black uppercase text-[9px] tracking-widest px-3 py-2 border-2 border-black">
              ⚠️ {gpsError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="text" name="coordinates" value={formData.locationData.coordinates} onChange={handleLocationChange} placeholder="Coordinates (Lat, Lng)" className="border-2 border-black p-2 font-bold text-xs" />
            <input type="text" name="city" value={formData.locationData.city} onChange={handleLocationChange} placeholder="City" className="border-2 border-black p-2 font-bold text-xs" />
            <input type="text" name="pincode" value={formData.locationData.pincode} onChange={handleLocationChange} placeholder="Pincode" className="border-2 border-black p-2 font-bold text-xs" />
            <input type="text" name="locality" value={formData.locationData.locality} onChange={handleLocationChange} placeholder="Locality / Street" className="border-2 border-black p-2 font-bold text-xs md:col-span-3" />
          </div>
        </div>

        {/* The Nuclear Launch Key */}
        <div className="p-3 bg-red-50 border-2 border-red-600 flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
            <span className="animate-pulse">⚠️</span> Director Override Key
          </label>
          <input 
            type="password" 
            name="directorKey" 
            value={formData.directorKey} 
            onChange={handleChange} 
            required 
            className="border-2 border-red-600 p-2 font-bold text-xs bg-white outline-none focus:bg-red-100" 
            placeholder="Enter secure deployment phrase" 
          />
        </div>

        <button type="submit" disabled={isDeploying} className={`py-3 border-4 border-black font-black uppercase tracking-widest text-xs transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none ${isDeploying ? 'bg-gray-400 text-black cursor-not-allowed' : 'bg-red-600 text-white'}`}>
          {isDeploying ? 'Transmitting...' : 'Authorize & Deploy'}
        </button>

      </form>
    </motion.div>
  );
}