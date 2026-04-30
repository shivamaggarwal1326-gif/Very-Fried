import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function OnboardingInterview({ merchantData, onComplete }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // The 5 core metrics we need to extract
  const [formData, setFormData] = useState({
    baseline_weekday_rev: 15000,
    baseline_weekend_rev: 40000,
    rush_start_hour: 13,
    expected_dwell_mins: 45,
    focus_margin_item: '',
    weekly_loss_tolerance: 2000
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const savePriorsToDatabase = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        baseline_weekday_rev: Number(formData.baseline_weekday_rev),
        baseline_weekend_rev: Number(formData.baseline_weekend_rev),
        rush_start_hour: Number(formData.rush_start_hour),
        expected_dwell_mins: Number(formData.expected_dwell_mins),
        focus_margin_item: formData.focus_margin_item || 'Coffee',
        weekly_loss_tolerance: Number(formData.weekly_loss_tolerance)
      };

      const { error } = await supabase
        .from('merchants')
        .update({ merchant_priors: payload })
        .eq('id', merchantData.id);

      if (error) throw error;
      
      // Tell MerchantCRM we are done so it can close the modal
      onComplete(payload);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full p-8 flex flex-col gap-6">
        
        <div className="border-b-4 border-black pb-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-black">FOODY Initialization</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Establishing Artificial Baseline [Step {step}/4]</p>
        </div>

        {saveError && (
          <div className="bg-red-600 text-white font-black uppercase text-xs tracking-widest px-4 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            ⚠️ Sync Failed: {saveError}
          </div>
        )}

        {/* STEP 1: VOLUME */}
        {step === 1 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <p className="text-sm font-bold bg-blue-100 text-blue-800 p-3 border-2 border-blue-800">
              "Hello. I am FOODY. I need 50 orders to mathematically understand your business. Until then, I need your gut intuition to set our starting targets."
            </p>
            <label className="flex flex-col text-xs font-black uppercase gap-1">
              Average Weekday Revenue (₹)
              <input type="number" name="baseline_weekday_rev" value={formData.baseline_weekday_rev} onChange={handleChange} className="border-4 border-black p-3 text-lg outline-none focus:bg-yellow-100 transition-colors" />
            </label>
            <label className="flex flex-col text-xs font-black uppercase gap-1">
              Average Weekend Revenue (₹)
              <input type="number" name="baseline_weekend_rev" value={formData.baseline_weekend_rev} onChange={handleChange} className="border-4 border-black p-3 text-lg outline-none focus:bg-yellow-100 transition-colors" />
            </label>
            <button onClick={() => setStep(2)} className="bg-black text-white font-black uppercase py-4 border-4 border-black hover:bg-gray-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all mt-4">Next Phase &gt;</button>
          </div>
        )}

        {/* STEP 2: VELOCITY */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <p className="text-sm font-bold bg-blue-100 text-blue-800 p-3 border-2 border-blue-800">
              "How fast do your tables turn? If they stay longer than this estimate, I will trigger a bottleneck alert."
            </p>
            <label className="flex flex-col text-xs font-black uppercase gap-1">
              Expected Table Dwell Time (Minutes)
              <input type="number" name="expected_dwell_mins" value={formData.expected_dwell_mins} onChange={handleChange} className="border-4 border-black p-3 text-lg outline-none focus:bg-yellow-100 transition-colors" />
            </label>
            <label className="flex flex-col text-xs font-black uppercase gap-1">
              Primary Rush Start Hour (24H Format, e.g., 13 for 1 PM)
              <input type="number" name="rush_start_hour" value={formData.rush_start_hour} onChange={handleChange} className="border-4 border-black p-3 text-lg outline-none focus:bg-yellow-100 transition-colors" max="23" min="0" />
            </label>
            <div className="flex gap-4 mt-4">
              <button onClick={() => setStep(1)} className="w-1/3 bg-white text-black font-black uppercase py-4 border-4 border-black hover:bg-gray-100 transition-all">&lt; Back</button>
              <button onClick={() => setStep(3)} className="w-2/3 bg-black text-white font-black uppercase py-4 border-4 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">Next Phase &gt;</button>
            </div>
          </div>
        )}

        {/* STEP 3: MARGINS */}
        {step === 3 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <p className="text-sm font-bold bg-blue-100 text-blue-800 p-3 border-2 border-blue-800">
              "Which specific item on your menu generates the highest profit margin? I will prioritize pushing this item during promotions."
            </p>
            <label className="flex flex-col text-xs font-black uppercase gap-1">
              Highest Margin Item Name
              <input type="text" name="focus_margin_item" value={formData.focus_margin_item} onChange={handleChange} placeholder="e.g., Iced Caramel Macchiato" className="border-4 border-black p-3 text-lg outline-none focus:bg-yellow-100 transition-colors" />
            </label>
            <div className="flex gap-4 mt-4">
              <button onClick={() => setStep(2)} className="w-1/3 bg-white text-black font-black uppercase py-4 border-4 border-black hover:bg-gray-100 transition-all">&lt; Back</button>
              <button onClick={() => setStep(4)} className="w-2/3 bg-black text-white font-black uppercase py-4 border-4 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">Next Phase &gt;</button>
            </div>
          </div>
        )}

        {/* STEP 4: LOSS PREVENTION */}
        {step === 4 && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <p className="text-sm font-bold bg-blue-100 text-blue-800 p-3 border-2 border-blue-800">
              "Finally, what is your acceptable limit for weekly financial loss (staff comps, mistakes, voids) before I should alert you?"
            </p>
            <label className="flex flex-col text-xs font-black uppercase gap-1">
              Weekly Loss Tolerance (₹)
              <input type="number" name="weekly_loss_tolerance" value={formData.weekly_loss_tolerance} onChange={handleChange} className="border-4 border-black p-3 text-lg outline-none focus:bg-yellow-100 transition-colors" />
            </label>
            <div className="flex gap-4 mt-4">
              <button onClick={() => setStep(3)} className="w-1/3 bg-white text-black font-black uppercase py-4 border-4 border-black hover:bg-gray-100 transition-all">&lt; Back</button>
              <button onClick={savePriorsToDatabase} disabled={isSubmitting} className="w-2/3 bg-green-500 text-black font-black uppercase py-4 border-4 border-black hover:bg-green-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50">
                {isSubmitting ? 'Syncing...' : 'Boot FOODY Core'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}