import { NextRequest, NextResponse } from 'next/server'
import { findCancellationEntry } from '@/lib/cancellationDb'
import { cancelSubscription } from '@/lib/playwrightCancel'

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

    console.log(`[cancel] tier=${entry.tier} launching browser for: ${entry.cancelUrl}`)
    const result = await cancelSubscription(entry.cancelUrl, entry.name, entry.difficulty, entry.tier, entry.steps)
    console.log('[cancel] result:', result)
    return NextResponse.json({ ...result, tier: entry.tier })
  } catch (error) {
    console.error('[cancel] error:', error)
    return NextResponse.json({ success: false, message: String(error) })
  }
}
