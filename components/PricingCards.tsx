'use client'

import { useState } from 'react'
import { PLANS } from '@/lib/credits'

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function PricingCards({ userId }: { userId?: string }) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handlePurchase(planId: string) {
    setLoading(planId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: userId ?? 'anonymous' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-base font-semibold text-white mb-0.5">
        Get cancellation credits
      </h2>
      <p className="text-sm text-gray-500 mb-5">Your first cancellation is always free.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="relative rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5"
            style={{
              borderColor: plan.popular ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)',
              backgroundColor: plan.popular ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
              boxShadow: plan.popular ? '0 0 30px rgba(16,185,129,0.1)' : undefined,
            }}
          >
            {plan.popular && (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full text-black whitespace-nowrap"
                style={{ backgroundColor: '#10B981' }}
              >
                Most Popular
              </span>
            )}

            <div>
              <p className="font-semibold text-white text-sm">{plan.name}</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${plan.price.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <CheckIcon />
                {plan.credits} credit{plan.credits > 1 ? 's' : ''} &nbsp;·&nbsp; ${(plan.price / plan.credits).toFixed(2)} each
              </p>
            </div>

            <button
              onClick={() => handlePurchase(plan.id)}
              disabled={loading === plan.id}
              className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
              style={
                plan.popular
                  ? { backgroundColor: '#10B981', color: 'black' }
                  : { border: '1px solid rgba(255,255,255,0.12)', color: 'white' }
              }
            >
              {loading === plan.id ? 'Redirecting…' : 'Buy now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
