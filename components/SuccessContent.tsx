'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { addLocalCredits } from '@/lib/clientCredits'

interface Props {
  planName: string
  credits: number
}

export default function SuccessContent({ planName, credits }: Props) {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    const newTotal = addLocalCredits(credits)
    setTotal(newTotal)
  }, [credits])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
        <p className="text-gray-500 mb-6">
          Your <span className="font-semibold text-gray-700">{planName}</span> has been activated.
        </p>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-6 py-4 mb-3">
          <p className="text-3xl font-bold text-indigo-600">{credits}</p>
          <p className="text-sm text-indigo-400 mt-0.5">
            cancellation credit{credits !== 1 ? 's' : ''} added
          </p>
        </div>
        {total !== null && (
          <p className="text-sm text-gray-400 mb-6">
            Total balance: <span className="font-semibold text-gray-600">{total} credit{total !== 1 ? 's' : ''}</span>
          </p>
        )}
        <Link
          href="/"
          className="inline-block bg-indigo-500 text-white font-semibold rounded-xl px-6 py-3 hover:bg-indigo-600 transition"
        >
          Start cancelling →
        </Link>
      </div>
    </main>
  )
}
