import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

    const { data: events, error } = await supabase
      .from('events')
      .select('event_data, created_at')
      .order('created_at', { ascending: false })
      .limit(500); 

    if (error) throw error;

    let highSpiceCount = 0;
    let lateNightCooks = 0;
    const totalEvents = events ? events.length : 0;
    
    if (events) {
        events.forEach(evt => {
          const payload = evt.event_data || {};
          if (payload.spice_level && payload.spice_level >= 3) highSpiceCount++;
          const hour = new Date(evt.created_at).getHours();
          if (hour >= 21 || hour <= 2) lateNightCooks++; 
        });
    }

    const dataSummary = `In the last 7 days, out of ${totalEvents} tracked cooking events, ${highSpiceCount} were high-spice level, and ${lateNightCooks} occurred late at night.`;

    // THE UPGRADE: Switching to Gemini 3.1 Flash-Lite (Optimized for high traffic)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`;
    
    const llmResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are Foody, a ruthless, highly-analytical restaurant consultant. Analyze the provided local food telemetry data. Output exactly two things in JSON format: 1. 'ai_insight' (a 2-sentence macro trend observation), 2. 'actionable_advice' (a specific, highly-tactical promotion a Mexican restaurant should run today to capitalize on this data)." }]
        },
        contents: [{
          parts: [{ text: dataSummary }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const llmData = await llmResponse.json();
    
    if (!llmData.candidates) {
        return new Response(JSON.stringify({ error: "Gemini API Capacity Issue", details: llmData }), {
            headers: { "Content-Type": "application/json" },
            status: 400
        });
    }

    const rawContent = llmData.candidates[0].content.parts[0].text;
    const parsedIntel = JSON.parse(rawContent);

    const { error: insertError } = await supabase
      .from('partner_intel')
      .insert([{
        target_zone: 'Sector 29, Gurugram',
        ai_insight: parsedIntel.ai_insight,
        actionable_advice: parsedIntel.actionable_advice
      }]);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "B2B Radar Report Generated Successfully", intel: parsedIntel }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})