'use client'

import { useState } from 'react'
import { PLANS } from '@/lib/credits'

const plan = PLANS[0]

export default function PricingCards({ userId }: { userId?: string }) {
  const [loading, setLoading] = useState(false)

  async function handlePurchase() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, userId: userId ?? 'anonymous' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-base font-semibold text-white mb-0.5">
        Unlock full access
      </h2>
      <p className="text-sm text-gray-500 mb-5">Your first scan is always free.</p>

      <div
        className="relative rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5"
        style={{
          borderColor: 'rgba(68,226,205,0.4)',
          backgroundColor: 'rgba(68,226,205,0.06)',
          boxShadow: '0 0 30px rgba(68,226,205,0.08)',
        }}
      >
        <div>
          <p className="font-semibold text-white text-sm">Full Statement Scan</p>
          <p className="text-2xl font-bold text-white mt-1">$5</p>
          <p className="text-xs text-gray-500 mt-0.5">Full scan + unlimited cancel guides</p>
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: '#44E2CD', color: 'black' }}
        >
          {loading ? 'Redirecting…' : 'Get full access — $5'}
        </button>
      </div>
    </div>
  )
}
