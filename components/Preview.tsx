'use client'

import React from 'react'
import { findCancellationEntry, CancellationEntry } from '@/lib/cancellationDb'

interface Subscription {
  name: string
  amount: string
  frequency: string
  category: string
}

interface PreviewProps {
  subscriptions: Subscription[]
}

type Status = 'idle' | 'preparing' | 'loading' | 'waiting_login' | 'done' | 'manual' | 'error'

function CancelButton({ entry }: { entry: CancellationEntry }) {
  const [status, setStatus] = React.useState<Status>('idle')
  const [manualUrl, setManualUrl] = React.useState('')

  // Fire the API call only after the prep card has rendered (tier 2)
  React.useEffect(() => {
    if (status !== 'preparing') return
    const timer = setTimeout(() => fireApiCall(), 2000)
    return () => clearTimeout(timer)
  }, [status])

  async function fireApiCall() {
    setStatus('loading')
    const res = await fetch('/api/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionName: entry.name }),
    })
    const data = await res.json()

    if (!data.success) {
      setStatus('error')
    } else if (data.tier === 'manual') {
      setManualUrl(data.cancelUrl ?? entry.cancelUrl)
      setStatus('manual')
    } else if (data.message?.toLowerCase().includes('login')) {
      setStatus('waiting_login')
    } else {
      setStatus('done')
    }
  }

  function handleCancel() {
    if (entry.tier === 'session') {
      // Show prep card first — useEffect above fires the API after 2s
      setStatus('preparing')
    } else {
      fireApiCall()
    }
  }

  // ── Tier 3: manual guide card ──────────────────────────────────────────────
  if (status === 'manual') {
    return (
      <div className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
        <p className="font-semibold text-gray-700 mb-1">This service requires manual cancellation</p>
        <ol className="list-decimal list-inside space-y-0.5 mb-2">
          <li>Visit the cancellation page</li>
          <li>Log in to your account</li>
          <li>Find and confirm cancellation</li>
        </ol>
        {entry.notes && <p className="text-gray-400 mb-2">{entry.notes}</p>}
        <a
          href={manualUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg px-3 py-1 transition"
        >
          Open cancellation page →
        </a>
      </div>
    )
  }

  // ── Tier 2: session bridge prep message ────────────────────────────────────
  if (status === 'preparing') {
    return (
      <div className="mt-2 w-full rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
        <p className="font-semibold mb-1">{entry.name} requires you to log in.</p>
        <p>We&apos;ll open the cancellation page directly — just sign in and we&apos;ll guide you from there.</p>
        <p className="mt-1 text-yellow-500">Opening browser...</p>
      </div>
    )
  }

  // ── Inline status messages (session tier) ──────────────────────────────────
  if (status === 'waiting_login') {
    return (
      <div className="mt-2 w-full rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
        <p className="font-semibold">Browser opened → Navigating → Waiting for you...</p>
        <p className="mt-1 text-yellow-600">Complete login in the browser window to continue.</p>
      </div>
    )
  }

  // ── Simple button (tier 1 auto + shared states) ────────────────────────────
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
      {status === 'loading' && (entry.tier === 'auto' ? 'Cancelling...' : 'Opening...')}
      {status === 'done' && 'Cancelled ✓'}
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
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{sub.name}</p>
                  <p className="text-sm text-gray-400">{sub.frequency} · {sub.category}</p>
                  {entry?.notes && (
                    <p className="text-xs text-gray-300 mt-0.5">{entry.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="font-semibold text-gray-700">{sub.amount}</span>
                  {entry ? (
                    <CancelButton entry={entry} />
                  ) : (
                    <span className="text-xs text-gray-300 px-3 py-1">
                      Manual cancel
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
