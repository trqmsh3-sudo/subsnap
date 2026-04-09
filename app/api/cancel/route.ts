import { NextRequest, NextResponse } from 'next/server'
import { findCancellationEntry } from '@/lib/cancellationDb'
import { cancelHourlyRatelimit, cancelBurstRatelimit, logBlocked } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  // Check burst limit first (cheaper check), then hourly
  const [burst, hourly] = await Promise.all([
    cancelBurstRatelimit.limit(ip),
    cancelHourlyRatelimit.limit(ip),
  ])

  if (!burst.success || !hourly.success) {
    const reset = !burst.success ? burst.reset : hourly.reset
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    await logBlocked(ip, '/api/cancel', retryAfter)
    console.warn(`[cancel] rate limited ip=${ip} burst=${burst.success} hourly=${hourly.success} retryAfter=${retryAfter}s`)
    return NextResponse.json(
      { error: 'Too many requests', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const { subscriptionName } = await req.json()
    console.log('[cancel] subscriptionName:', subscriptionName)

    const entry = findCancellationEntry(subscriptionName)
    if (!entry) {
      console.log('[cancel] not found in DB')
      return NextResponse.json({ success: false, message: 'Service not found in database' })
    }

    const railwayUrl = process.env.RAILWAY_SERVER_URL
    if (!railwayUrl) {
      console.error('[cancel] RAILWAY_SERVER_URL is not set')
      return NextResponse.json({
        success: false,
        message: 'Cancellation server is not configured. Please try again later.',
      })
    }

    console.log(`[cancel] tier=${entry.tier} | forwarding to Railway: ${railwayUrl}/cancel`)

    const railwayRes = await fetch(`${railwayUrl}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceName: entry.name,
        cancelUrl: entry.cancelUrl,
        difficulty: entry.difficulty,
        steps: entry.steps,
      }),
      // 3-minute timeout — Playwright flows can take ~60–90s
      signal: AbortSignal.timeout(180_000),
    })

    if (!railwayRes.ok) {
      const text = await railwayRes.text()
      console.error(`[cancel] Railway returned ${railwayRes.status}: ${text}`)
      return NextResponse.json({ success: false, message: 'Cancellation server error' })
    }

    const result = await railwayRes.json()
    console.log('[cancel] Railway result:', result)

    // need_human means the site requires an active login session — treat as manual
    if (result.message?.toLowerCase().includes('need_human')) {
      return NextResponse.json({
        success: true,
        tier: 'manual',
        cancelUrl: result.cancelUrl ?? entry.cancelUrl,
        notes: entry.notes,
        message: result.message,
      })
    }

    return NextResponse.json({ ...result, tier: entry.tier })

  } catch (error) {
    console.error('[cancel] error:', error)
    return NextResponse.json({ success: false, message: String(error) })
  }
}
