'use client'

import React from 'react'
import { findCancellationEntry } from '@/lib/cancellationDb'

interface Subscription {
  name: string
  amount: string
  frequency: string
  category: string
}

interface PreviewProps {
  subscriptions: Subscription[]
}

function CancelButton({ name }: { name: string }) {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleCancel() {
    setStatus('loading')
    const res = await fetch('/api/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionName: name }),
    })
    const data = await res.json()
    setStatus(data.success ? 'done' : 'error')
  }

  return (
    <button
      onClick={handleCancel}
      disabled={status === 'loading' || status === 'done'}
      className={`text-xs border rounded-lg px-3 py-1 transition
        ${status === 'idle' ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' : ''}
        ${status === 'loading' ? 'bg-gray-50 text-gray-400 border-gray-200' : ''}
        ${status === 'done' ? 'bg-green-50 text-green-600 border-green-200' : ''}
        ${status === 'error' ? 'bg-red-100 text-red-700 border-red-300' : ''}
      `}
    >
      {status === 'idle' && 'Cancel →'}
      {status === 'loading' && 'Opening...'}
      {status === 'done' && 'Opened ✓'}
      {status === 'error' && 'Failed'}
    </button>
  )
}

export default function Preview({ subscriptions }: PreviewProps) {
  if (subscriptions.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Found {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
      </h2>
      <div className="space-y-2">
        {subscriptions.map((sub) => {
          const entry = findCancellationEntry(sub.name)
          return (
            <div
              key={sub.name}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-medium text-gray-800">{sub.name}</p>
                <p className="text-sm text-gray-400">{sub.frequency} · {sub.category}</p>
                {entry?.notes && (
                  <p className="text-xs text-gray-300 mt-0.5">{entry.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">{sub.amount}</span>
                {entry ? (
                  <CancelButton name={sub.name} />
                ) : (
                  <span className="text-xs text-gray-300 px-3 py-1">
                    Manual cancel
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
