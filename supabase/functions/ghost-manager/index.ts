import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

// Initialize Supabase Client using environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    console.log("👻 BOOTING GHOST MANAGER...");

    // 1. Fetch all active merchants
    const { data: merchants, error: merchantErr } = await supabase
      .from('merchants')
      .select('id, business_name');

    if (merchantErr) throw merchantErr;

    for (const merchant of merchants) {
      console.log(`Analyzing: ${merchant.business_name}`);

      // 2. Fetch their inventory
      const { data: inventory } = await supabase
        .from('merchant_inventory')
        .select('*')
        .eq('merchant_id', merchant.id);

      if (!inventory) continue;

      const criticalItems = inventory.filter(item => item.stock <= item.alert_level);

      // 3. If there are critical items, we trigger the alert protocol
      if (criticalItems.length > 0) {
        const itemNames = criticalItems.map(i => i.name).join(", ");
        const alertMessage = `⚠️ FOODY ALERT: ${merchant.business_name}, you are critically low on: ${itemNames}. Restock immediately to prevent revenue loss.`;
        
        console.log(`[TRIGGER WHATSAPP/SMS]: ${alertMessage}`);

        // Note: In production, you would place your Twilio or WhatsApp Business API call here!
        /*
        await fetch('https://api.twilio.com/...', {
            method: 'POST',
            body: JSON.stringify({ message: alertMessage, to: ownerPhoneNumber })
        });
        */
       
        // 4. Log this automated action in a system log so the owner sees it in their dashboard later
        await supabase.from('merchant_chat_history').insert([{
          merchant_id: merchant.id,
          role: 'assistant',
          content: `[AUTOMATED GHOST ALERT SENT]: Warned about low stock for ${itemNames}.`
        }]);
      }
    }

    return new Response(JSON.stringify({ status: "Ghost Manager Execution Complete" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
})