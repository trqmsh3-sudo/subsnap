import { NextRequest, NextResponse } from 'next/server'
import { PLANS } from '@/lib/credits'

const LS_API = 'https://api.lemonsqueezy.com/v1'
const STORE_ID = '341528'

export async function POST(req: NextRequest) {
  const { planId, userId } = await req.json()
  const plan = PLANS.find((p) => p.id === planId)
  if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3007'

  const res = await fetch(`${LS_API}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            custom: {
              userId: userId ?? 'anonymous',
              planId: plan.id,
              credits: plan.credits.toString(),
            },
          },
          product_options: {
            redirect_url: `${baseUrl}/success?order_id={order_id}`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: STORE_ID } },
          variant: { data: { type: 'variants', id: plan.variantId } },
        },
      },
    }),
  })

  const data = await res.json()
  const url = data?.data?.attributes?.url
  if (!url) {
    console.error('[checkout] LemonSqueezy error:', JSON.stringify(data))
    return NextResponse.json({ error: 'Checkout creation failed' }, { status: 500 })
  }

  return NextResponse.json({ url })
}
