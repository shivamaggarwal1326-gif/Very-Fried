// api/analyst.js
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge',
};

// UPSTASH RATE LIMITER
const redis = new Redis({
  url: process.env.VITE_UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.VITE_UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), 
});

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    // 1. RATE LIMITING SHIELD
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await ratelimit.limit(`analyst_${ip}`);
    if (!success) {
      return new Response(JSON.stringify({ error: "Network busy. Rate limit exceeded." }), { status: 429 });
    }

    // 2. SECURE KEY CHECK
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server Configuration Error: API Key missing." }), { status: 500 });
    }

    const anthropicClient = createAnthropic({ apiKey });

    // 3. PARSE BODY FOR EDGE
    const body = await req.json();
    const { messages, systemPrompt } = body;

    if (!messages || !systemPrompt) {
      return new Response(JSON.stringify({ error: "Malformed payload." }), { status: 400 });
    }

    // --- THE ABSOLUTE FIX: HARD-LOCKED TO SONNET 3.5 ---
    // All dynamic switching logic is gone. 
    // This strictly forces the API to use the flagship model every single time.
    const selectedModel = 'claude-3-5-sonnet-20241022';

    // 4. GENERATE
    const result = await generateText({
      model: anthropicClient(selectedModel), 
      system: systemPrompt,
      messages: messages,
      maxTokens: 1500, 
    });

    return new Response(JSON.stringify({ text: result.text }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("ANALYST API ERROR:", error);
    return new Response(JSON.stringify({ error: "AI core failure.", details: error.message }), { status: 500 });
  }
}