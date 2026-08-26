import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { analyzeRatelimit, logBlocked } from '@/lib/ratelimit'
import { hasFreeScan, consumeFreeScan, deductCredit, logScanResult } from '@/lib/credits'

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
  // ── Rate limit by IP ──────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const { success, reset } = await analyzeRatelimit.limit(ip)
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    await logBlocked(ip, '/api/analyze', retryAfter)
    return NextResponse.json(
      { error: 'Too many requests', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  let imageBase64: string | undefined
  let userId: string | undefined
  try {
    const body = await req.json()
    imageBase64 = body.imageBase64
    userId = body.userId
  } catch {
    return NextResponse.json({ subscriptions: [] }, { status: 400 })
  }

  if (!imageBase64) {
    return NextResponse.json({ subscriptions: [] })
  }

  // ── Credit gate ───────────────────────────────────────────────────────────
  const uid = typeof userId === 'string' && userId.length > 0 ? userId : 'anonymous'

  const free = await hasFreeScan(uid)
  if (free) {
    await consumeFreeScan(uid)
  } else {
    const debited = await deductCredit(uid)
    if (!debited) {
      return NextResponse.json(
        { error: 'No credits', message: 'Purchase a scan credit to continue.' },
        { status: 402 }
      )
    }
  }

  // ── AI analysis ───────────────────────────────────────────────────────────
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[analyze] GEMINI_API_KEY is not set. Please set GEMINI_API_KEY in .env.local')
      return NextResponse.json(
        { error: 'Missing Gemini API Key', message: 'GEMINI_API_KEY is not configured on server.', subscriptions: [] },
        { status: 500 }
      )
    }

    const genai = new GoogleGenerativeAI(apiKey)
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([
      PROMPT,
      { inlineData: { mimeType: 'image/png', data: imageBase64 } },
    ])

    const raw = result.response.text()
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const subscriptions = JSON.parse(cleaned)
    const list = Array.isArray(subscriptions) ? subscriptions : []

    // Log result for refund verification
    await logScanResult(uid, list.length)

    return NextResponse.json({ subscriptions: list })
  } catch (error) {
    console.error('[analyze] error:', error)
    await logScanResult(uid, 0).catch(() => {})
    return NextResponse.json({ subscriptions: [], error: 'Failed to analyze statement' })
  }
}
