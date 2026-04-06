import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { PLANS } from '@/lib/credits'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const { planId, userId } = await req.json()

  const plan = PLANS.find((p) => p.id === planId)
  if (!plan) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(plan.price * 100),
          product_data: {
            name: `SubSnap — ${plan.name}`,
            description: `${plan.credits} cancellation credit${plan.credits > 1 ? 's' : ''}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: userId ?? 'anonymous',
      planId: plan.id,
      credits: plan.credits.toString(),
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3007'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3007'}/`,
  })

  return NextResponse.json({ url: session.url })
}
