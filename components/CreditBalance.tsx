'use client'

import { useEffect, useState } from 'react'
import { getLocalCredits } from '@/lib/clientCredits'

export default function CreditBalance() {
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    setCredits(getLocalCredits())
  }, [])

  if (credits === null) return null

  return (
    <div
      className="text-sm px-4 py-2.5 rounded-xl inline-flex items-center gap-2 mb-6 border"
      style={
        credits > 0
          ? {
              backgroundColor: 'rgba(16,185,129,0.1)',
              borderColor: 'rgba(16,185,129,0.3)',
              color: '#10B981',
            }
          : {
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#6b7280',
            }
      }
    >
      <span>{credits > 0 ? '💳' : '○'}</span>
      {credits > 0 ? (
        <span>
          You have <strong className="font-bold">{credits}</strong> credit
          {credits !== 1 ? 's' : ''} remaining
        </span>
      ) : (
        <span>No credits — your first cancel guide is free</span>
      )}
    </div>
  )
}
