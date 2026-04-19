import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { analyzeRatelimit, logBlocked } from '@/lib/ratelimit'

const PROMPT = `You are analyzing a redacted bank statement image. Extract every recurring subscription charge you can identify.

Return ONLY a valid JSON array — no markdown, no explanation, no wrapper object. Each element must have exactly these fields:
- name: string (service name, e.g. "Netflix", "Spotify")
- amount: string (as it appears, e.g. "$14.99", "₪59")
- frequency: "monthly" | "yearly" | "weekly" | "unknown"
- category: "streaming" | "software" | "gaming" | "news" | "fitness" | "other"

If no subscriptions are found, return an empty array: []

Example output:
[
  { "name": "Netflix", "amount": "$15.49", "frequency": "monthly", "category": "streaming" },
  { "name": "Spotify", "amount": "$9.99", "frequency": "monthly", "category": "streaming" }
]`

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const { success, reset } = await analyzeRatelimit.limit(ip)
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    await logBlocked(ip, '/api/analyze', retryAfter)
    console.warn(`[analyze] rate limited ip=${ip} retryAfter=${retryAfter}s`)
    return NextResponse.json(
      { error: 'Too many requests', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ subscriptions: [] })
    }

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([
      PROMPT,
      { inlineData: { mimeType: 'image/png', data: imageBase64 } },
    ])

    const raw = result.response.text()
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const subscriptions = JSON.parse(cleaned)

    return NextResponse.json({ subscriptions: Array.isArray(subscriptions) ? subscriptions : [] })
  } catch (error) {
    console.error('[analyze] error:', error)
    return NextResponse.json({ subscriptions: [] })
  }
}
