import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { addCredits } from '@/lib/credits'
import { hasWebhookBeenProcessed, markWebhookProcessed } from '@/lib/webhookLog'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('x-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing x-signature' }, { status: 400 })
  }

  const hmac = createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!).update(body).digest('hex')
  const hmacBuf = Buffer.from(hmac, 'hex')
  const sigBuf = Buffer.from(sig, 'hex')
  if (hmacBuf.length !== sigBuf.length || !timingSafeEqual(hmacBuf, sigBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.meta?.event_name === 'order_created' && event.data?.attributes?.status === 'paid') {
    const eventId = event.data?.id
    if (eventId && (await hasWebhookBeenProcessed(eventId))) {
      console.log(`[lemonsqueezy] duplicate delivery for order ${eventId}, skipping`)
      return NextResponse.json({ received: true, duplicate: true })
    }

    const custom = event.meta?.custom_data
    const userId = custom?.userId
    const credits = parseInt(custom?.credits ?? '0', 10)

    if (userId && credits > 0) {
      await addCredits(userId, credits)
      if (eventId) await markWebhookProcessed(eventId)
      console.log(`[lemonsqueezy] Added ${credits} credits to user ${userId}`)
    }
  }

  return NextResponse.json({ received: true })
}
