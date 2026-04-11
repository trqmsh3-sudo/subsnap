import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { addCredits } from '@/lib/credits'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('x-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing x-signature' }, { status: 400 })
  }

  const hmac = createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!).update(body).digest('hex')
  if (hmac !== sig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.meta?.event_name === 'order_created' && event.data?.attributes?.status === 'paid') {
    const custom = event.meta?.custom_data
    const userId = custom?.userId
    const credits = parseInt(custom?.credits ?? '0', 10)

    if (userId && credits > 0) {
      await addCredits(userId, credits)
      console.log(`[lemonsqueezy] Added ${credits} credits to user ${userId}`)
    }
  }

  return NextResponse.json({ received: true })
}
