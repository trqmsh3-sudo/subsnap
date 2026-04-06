'use client'

import { useState } from 'react'
import { PLANS } from '@/lib/credits'

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
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Get cancellation credits</h2>
      <p className="text-sm text-gray-400 mb-4">Your first cancellation is always free.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-5 flex flex-col gap-3 transition
              ${plan.popular
                ? 'border-indigo-400 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white shadow-sm'
              }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                Most Popular
              </span>
            )}
            <div>
              <p className="font-semibold text-gray-800">{plan.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${plan.price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                {plan.credits} credit{plan.credits > 1 ? 's' : ''} · ${(plan.price / plan.credits).toFixed(2)} each
              </p>
            </div>
            <button
              onClick={() => handlePurchase(plan.id)}
              disabled={loading === plan.id}
              className={`mt-auto w-full py-2 rounded-xl text-sm font-semibold transition
                ${plan.popular
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                disabled:opacity-50`}
            >
              {loading === plan.id ? 'Redirecting...' : 'Buy now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
