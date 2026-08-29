import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Redis } from '@upstash/redis'

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { serviceName, hostname, elements } = body

    if (!Array.isArray(elements) || elements.length === 0) {
      return NextResponse.json({ targetSelector: null, reason: 'no_elements' })
    }

    // 1. Check if we have an AI-healed selector in Redis
    if (redis && hostname) {
      const cachedSelector = await redis.get<string>(`selector:${hostname.toLowerCase()}`)
      if (cachedSelector) {
        return NextResponse.json({ targetSelector: cachedSelector, source: 'cached_playbook' })
      }
    }

    // 2. Run Gemini 2.5 Flash on the DOM snapshot
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ targetSelector: null, reason: 'no_api_key' })
    }

    const genai = new GoogleGenerativeAI(apiKey)
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are SubSnap Self-Healing DOM Scout.
Analyze this list of interactive elements from the subscription/billing page of "${serviceName || hostname}".
Find the single element that best corresponds to initiating subscription cancellation, managing plan, or ending membership.

Elements Snapshot:
${JSON.stringify(elements.slice(0, 40), null, 2)}

SAFETY RULE:
- NEVER pick "Delete account", "Close account", "Cancel order", or payment removal.
- Pick ONLY subscription cancellation or plan modification buttons.

Return ONLY a JSON object:
{
  "bestMatchIndex": number (0-based index in the elements array, or -1 if none found),
  "targetSelector": "CSS selector or unique identifier if applicable",
  "confidence": number (0.0 to 1.0),
  "explanation": "Short reason"
}
`

    const aiResponse = await model.generateContent([prompt])
    const text = aiResponse.response.text().trim()
    const cleanJson = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleanJson)

    if (parsed && parsed.bestMatchIndex >= 0 && parsed.bestMatchIndex < elements.length && parsed.confidence >= 0.7) {
      const matched = elements[parsed.bestMatchIndex]
      const derivedSelector = matched.testid ? `[data-testid="${matched.testid}"]` :
                              matched.uia ? `[data-uia="${matched.uia}"]` :
                              matched.id ? `#${matched.id}` :
                              matched.selector || null

      if (derivedSelector && redis && hostname) {
        try {
          await redis.set(`selector:${hostname.toLowerCase()}`, derivedSelector, { ex: 60 * 60 * 24 * 7 })
        } catch (e) {}
      }

      return NextResponse.json({
        targetSelector: derivedSelector,
        bestMatchIndex: parsed.bestMatchIndex,
        confidence: parsed.confidence,
        source: 'gemini_dom_scout'
      })
    }

    return NextResponse.json({ targetSelector: null, source: 'no_confident_match' })
  } catch (err) {
    console.warn('[DOM Scout Error]:', err)
    return NextResponse.json({ targetSelector: null, error: String(err) })
  }
}
