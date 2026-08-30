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
      return NextResponse.json({ targetSelector: null, bestMatchIndex: -1, reason: 'no_elements' })
    }

    // 1. Quick check against Redis distributed cache
    if (redis && hostname) {
      try {
        const cached = await redis.get<string>(`selector:${hostname.toLowerCase()}`)
        if (cached) {
          return NextResponse.json({ targetSelector: cached, source: 'redis_cache', confidence: 1.0 })
        }
      } catch {}
    }

    // 2. Run Gemini 2.5 Flash on the DOM snapshot
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ targetSelector: null, bestMatchIndex: -1, reason: 'no_api_key' })
    }

    const genai = new GoogleGenerativeAI(apiKey)
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are SubSnap Self-Healing DOM Scout.
Analyze this list of interactive elements from the subscription/billing page of "${serviceName || hostname}".
Your mission is to find the single element that initiates subscription cancellation, stopping auto-renewal, or ending membership.

Elements Snapshot:
${JSON.stringify(elements.slice(0, 40), null, 2)}

STRICT SAFETY & ACCURACY RULES:
1. NEVER pick "Delete account", "Close account", "Cancel order", or payment removal.
2. NEVER pick "Upgrade", "Buy", "Purchase", "Get Pro", "Start Free Trial", or new subscription signups. Those are for BUYING, NOT CANCELLING!
3. If the page only has upgrade, purchase, marketing, or general navigation buttons and NO option to cancel an existing subscription, you MUST return: bestMatchIndex: -1, targetSelector: null, confidence: 0.
4. Pick ONLY genuine cancellation, ending plan renewal, or ending membership buttons.

Return ONLY a JSON object:
{
  "bestMatchIndex": number (0-based index in the elements array, or -1 if no genuine cancel button is found),
  "targetSelector": "CSS selector if uniquely identifiable, or null",
  "confidence": number (0.0 to 1.0, must be 0 if bestMatchIndex is -1),
  "isFreeTier": boolean (set to true if the elements show the user is currently on a Free/Basic plan, e.g. "Current Plan" on Free, or only upgrade/pro purchase buttons exist without an active paid subscription),
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
                              matched.aria ? `${matched.tag}[aria-label="${matched.aria}"]` :
                              parsed.targetSelector || null

      if (derivedSelector && redis && hostname) {
        try {
          await redis.set(`selector:${hostname.toLowerCase()}`, derivedSelector, { ex: 60 * 60 * 24 * 7 })
        } catch {}
      }

      return NextResponse.json({
        targetSelector: derivedSelector,
        bestMatchIndex: parsed.bestMatchIndex,
        confidence: parsed.confidence,
        isFreeTier: !!parsed.isFreeTier,
        source: 'gemini_dom_scout'
      })
    }

    return NextResponse.json({
      targetSelector: null,
      bestMatchIndex: -1,
      isFreeTier: !!(parsed && parsed.isFreeTier),
      source: 'no_confident_match'
    })
  } catch (err) {
    console.warn('[DOM Scout Error]:', err)
    return NextResponse.json({ targetSelector: null, bestMatchIndex: -1, error: String(err) })
  }
}
