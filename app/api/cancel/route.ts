import { NextRequest, NextResponse } from 'next/server'
import { findCancellationEntry } from '@/lib/cancellationDb'

export async function POST(req: NextRequest) {
  try {
    const { subscriptionName } = await req.json()
    console.log('[cancel] subscriptionName:', subscriptionName)

    const entry = findCancellationEntry(subscriptionName)
    if (!entry) {
      console.log('[cancel] not found in DB')
      return NextResponse.json({ success: false, message: 'Service not found in database' })
    }

    // Tier 3 — manual only, no browser
    if (entry.tier === 'manual') {
      return NextResponse.json({
        success: true,
        tier: 'manual',
        cancelUrl: entry.cancelUrl,
        notes: entry.notes,
      })
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
    return NextResponse.json({ ...result, tier: entry.tier })

  } catch (error) {
    console.error('[cancel] error:', error)
    return NextResponse.json({ success: false, message: String(error) })
  }
}
