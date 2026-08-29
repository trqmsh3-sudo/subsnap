import { NextRequest, NextResponse } from 'next/server'
import { findCancellationEntry, CANCELLATION_DB, CancellationEntry } from '@/lib/cancellationDb'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Redis } from '@upstash/redis'

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

const DYNAMIC_CACHE = new Map<string, CancellationEntry>()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''

  if (!query.trim()) {
    return NextResponse.json({ entry: null })
  }

  const qLower = query.toLowerCase().trim()

  // 1. Check Global Redis Distributed Cache
  if (redis) {
    try {
      const cached = await redis.get<CancellationEntry>(`scout:${qLower}`)
      if (cached) {
        return NextResponse.json({ entry: cached, source: 'global_redis_cache' })
      }
    } catch {}
  }

  // 2. Check local in-memory cache
  if (DYNAMIC_CACHE.has(qLower)) {
    return NextResponse.json({ entry: DYNAMIC_CACHE.get(qLower), source: 'cache' })
  }

  // 3. Direct local matching from static DB
  const directMatch = findCancellationEntry(query)
  if (directMatch) {
    return NextResponse.json({ entry: directMatch, source: 'static_db' })
  }

  // 4. Simple fuzzy keyword search
  for (const item of CANCELLATION_DB) {
    if (item.keywords.some((k) => qLower.includes(k) || k.includes(qLower))) {
      return NextResponse.json({ entry: item, source: 'fuzzy_db' })
    }
  }

  // 5. AUTONOMOUS AI SCOUT (Gemini 2.5 Flash)
  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey) {
    try {
      const genai = new GoogleGenerativeAI(apiKey)
      const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const prompt = `You are SubSnap Autonomous Subscription Cancellation AI Scout.
Analyze this user query / website / service name: "${query}".

Extract the exact direct subscription cancellation URL, login URL, and step-by-step cancellation instructions.

Return ONLY a valid JSON object matching this schema (no markdown, no backticks, no other text):
{
  "name": "Exact Service Name in English",
  "nameHe": "שם השירות בעברית",
  "loginUrl": "https://service.com/login",
  "cancelUrl": "https://service.com/settings/billing or direct cancellation endpoint",
  "notes": "Direct cancellation pathway instructions",
  "difficulty": "easy" or "hard",
  "steps": [
    "Step 1",
    "Step 2",
    "Step 3"
  ]
}

If it is an unknown arbitrary domain like "example.io", deduce the standard settings/billing route (e.g. https://example.io/settings/billing or https://example.io/account).
`

      const aiResponse = await model.generateContent([prompt])
      const text = aiResponse.response.text().trim()
      
      const cleanJson = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
      const parsed = JSON.parse(cleanJson)

      if (parsed && parsed.cancelUrl) {
        const entry: CancellationEntry = {
          name: parsed.name || query,
          nameHe: parsed.nameHe || parsed.name || query,
          keywords: [qLower, (parsed.name || '').toLowerCase(), (parsed.nameHe || '').toLowerCase()],
          loginUrl: parsed.loginUrl || `https://${qLower.replace(/^https?:\/\//, '')}/login`,
          cancelUrl: parsed.cancelUrl,
          method: 'url',
          notes: parsed.notes || 'Official billing and cancellation pathway',
          difficulty: parsed.difficulty === 'hard' ? 'hard' : 'easy',
          tier: 'auto',
          steps: Array.isArray(parsed.steps) ? parsed.steps : ['Go to account settings', 'Click cancel subscription', 'Confirm']
        }

        if (redis) {
          try {
            await redis.set(`scout:${qLower}`, entry)
            if (parsed.name) await redis.set(`scout:${parsed.name.toLowerCase()}`, entry)
          } catch {}
        }

        DYNAMIC_CACHE.set(qLower, entry)
        if (parsed.name) DYNAMIC_CACHE.set(parsed.name.toLowerCase(), entry)

        return NextResponse.json({ entry, source: 'ai_scout_persisted' })
      }
    } catch (err) {
      console.warn('[AI Scout Error]:', err)
    }
  }

  // 6. Smart Heuristic Fallback
  const isDomain = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(query) || query.includes('http')
  const cleanDomain = query.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()

  if (isDomain) {
    const heuristicEntry: CancellationEntry = {
      name: cleanDomain,
      nameHe: cleanDomain,
      keywords: [qLower, cleanDomain],
      loginUrl: `https://${cleanDomain}/login`,
      cancelUrl: `https://${cleanDomain}/settings/billing`,
      method: 'url',
      notes: `Direct navigation to ${cleanDomain} billing settings`,
      difficulty: 'easy',
      tier: 'auto',
      steps: [
        `Navigate to billing settings on ${cleanDomain}`,
        'Click Cancel Subscription or End Plan',
        'Confirm cancellation'
      ]
    }

    if (redis) {
      try {
        await redis.set(`scout:${qLower}`, heuristicEntry)
      } catch {}
    }
    DYNAMIC_CACHE.set(qLower, heuristicEntry)
    return NextResponse.json({ entry: heuristicEntry, source: 'heuristic_domain' })
  }

  return NextResponse.json({
    entry: {
      name: query,
      loginUrl: `https://www.google.com/search?q=${encodeURIComponent(query + ' login')}`,
      cancelUrl: `https://www.google.com/search?q=${encodeURIComponent('how to cancel ' + query + ' subscription')}`,
      method: 'url',
      difficulty: 'easy',
      tier: 'manual',
      notes: 'Searching official cancellation pathway',
    },
    source: 'fallback'
  })
}
