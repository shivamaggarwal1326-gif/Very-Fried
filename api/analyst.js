// api/analyst.js
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
    const { success } = await ratelimit.limit(`analyst_${ip}`);
    if (!success) {
      return res.status(429).json({ error: "Network busy. Rate limit exceeded. Please wait 60 seconds." });
    }

    // 2. SECURE KEY CHECK
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Server Configuration Error: API Key missing." });
    }

    const { messages, systemPrompt } = req.body;
    if (!messages || !systemPrompt) return res.status(400).json({ error: "Malformed payload." });

    const latestMessage = messages[messages.length - 1].content;
    const requiresDeepThinking = typeof latestMessage === 'string' && (latestMessage.includes('MONTHLY') || latestMessage.includes('PREDICTIVE'));

    const selectedModel = requiresDeepThinking 
      ? 'claude-3-5-sonnet-latest' 
      : 'claude-3-5-haiku-latest';

    const result = await generateText({
      model: anthropic(selectedModel),
      system: systemPrompt,
      messages: messages,
      maxTokens: 500,
    });

    return res.status(200).json({ text: result.text });

  } catch (error) {
    console.error("ANALYST API ERROR:", error);
    return res.status(500).json({ error: "AI core failure. Check logs." });
  }
}