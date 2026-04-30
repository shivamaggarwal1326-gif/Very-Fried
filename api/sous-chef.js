// api/sous-chef.js
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const config = { maxDuration: 60 };

// UPSTASH RATE LIMITER: 5 requests per minute per IP
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), 
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1. RATE LIMITING SHIELD
    const ip = req.headers['x-forwarded-for'] || '127.0.0.1';
    const { success } = await ratelimit.limit(`souschef_${ip}`);
    if (!success) {
      return res.status(429).json({ error: "FOODY IS OVERWHELMED. Wait 60 seconds." });
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { messages, activeMenu, userProfile, restaurantName } = payload;

    const systemPrompt = `
You are FOODY, the hyper-engaging, high-energy AI Sous Chef for the VeryFryd app.
Deployed at: ${restaurantName || 'an Elite Partner'}.
USER RANK: ${userProfile?.rank || 'Rookie'} | DIET: ${userProfile?.diet || 'No restrictions'}

=== LIVE MENU DATABASE ===
${JSON.stringify(activeMenu || [])}

RULES:
1. Tone: Hyped, street-smart, tactical. Use "Loadout", "Protocol", "XP Grind".
2. DIETARY COMPLIANCE: If VEG/VEGAN, NEVER suggest NON-VEG.
3. THE UPSELL: Subtly suggest pairings for more XP.
4. Keep it under 3-4 short sentences.
5. If the user uploads a photo of ingredients, tell them exactly what menu item they can make from it, or what menu item matches their vibe.
    `;

    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-latest'), // Sonnet handles vision much better
      system: systemPrompt,
      messages: messages,
      maxTokens: 300, 
    });

    return res.status(200).json({ text: result.text });

  } catch (error) {
    console.error("SOUS CHEF API ERROR:", error);
    return res.status(500).json({ error: "Foody core failure." });
  }
}