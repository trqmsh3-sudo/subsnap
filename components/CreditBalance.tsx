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
    <div className={`text-sm px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 mb-6
      ${credits > 0
        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
        : 'bg-gray-100 text-gray-400 border border-gray-200'
      }`}
    >
      <span>{credits > 0 ? '💳' : '○'}</span>
      {credits > 0
        ? <span>You have <strong>{credits}</strong> credit{credits !== 1 ? 's' : ''} remaining</span>
        : <span>No credits — your first cancellation is free</span>
      }
    </div>
  )
}
