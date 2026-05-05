import { createClient } from '@supabase/supabase-js';

const ALLOWED_TIERS = ['STEALTH_ELITE', 'ELITE_PARTNER', 'CRM_ONLY'];
const DIRECTOR_EMAILS = ['veryfrydd@gmail.com'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'CRITICAL: Method Not Allowed.' });
  }

  try {
    const { email, password, businessName, phone, partnershipTier, locationData, directorKey } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'CRITICAL: Missing Authorization Token. Access Denied.' });
    }
    const token = authHeader.split(' ')[1];

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, 
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return res.status(401).json({ error: 'CRITICAL: Invalid or expired session.' });
    }
    
    // 1. Identity Check
    if (!DIRECTOR_EMAILS.includes(user.email)) {
      console.warn(`SECURITY ALERT: Unauthorized deployment attempt by ${user.email}`);
      return res.status(403).json({ error: 'CRITICAL: God-Mode Clearance Required. Deploy aborted.' });
    }

    // 2. BULLETPROOF OVERRIDE KEY CHECK
    // This strips accidental spaces and guarantees a fallback for local development
    const providedKey = (directorKey || '').trim();
    const expectedKey = (process.env.VITE_DIRECTOR_OVERRIDE_KEY || process.env.DIRECTOR_OVERRIDE_KEY || 'Tomatocraxxrox').trim();

    if (providedKey !== expectedKey) {
      console.warn(`SECURITY ALERT: Key Mismatch. Provided: [${providedKey}], Expected: [${expectedKey}]`);
      return res.status(403).json({ error: 'CRITICAL: Invalid Override Key. Deployment locked.' });
    }

    if (!email || !password || !businessName || !phone || !partnershipTier) {
       return res.status(400).json({ error: 'CRITICAL: Malformed payload detected. Missing required fields.' });
    }

    if (!ALLOWED_TIERS.includes(partnershipTier)) {
       return res.status(403).json({ error: 'CRITICAL: Unauthorized Tier Selection.' });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true 
    });

    if (authError) throw authError;

    const { error: dbError } = await supabaseAdmin
      .from('merchants')
      .insert([{
        id: authData.user.id,
        business_name: businessName.trim(),
        phone: phone.trim(),
        partnership_tier: partnershipTier,
        location_data: locationData || {}
      }]);

    if (dbError) throw dbError;

    return res.status(200).json({ success: true, message: `Secure Deployment: ${businessName} initialized as ${partnershipTier}.` });

  } catch (error) {
    console.error("FIREWALL BLOCKED REQUEST:", error);
    return res.status(400).json({ error: error.message });
  }
}