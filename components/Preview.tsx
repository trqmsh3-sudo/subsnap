'use client'

import React from 'react'
import { findCancellationEntry, CancellationEntry } from '@/lib/cancellationDb'

interface Subscription {
  name: string
  amount: string
  frequency: string
  category: string
}

type Status = 'idle' | 'loading' | 'done' | 'manual' | 'error'

function CancelButton({ entry }: { entry: CancellationEntry }) {
  const [status, setStatus] = React.useState<Status>('idle')
  const [manualUrl, setManualUrl] = React.useState('')

  async function handleCancel() {
    setStatus('loading')
    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionName: entry.name }),
      })
      const data = await res.json()

      if (data.tier === 'manual' || data.message?.toLowerCase().includes('need_human')) {
        setManualUrl(data.cancelUrl ?? entry.cancelUrl)
        setStatus('manual')
      } else if (!data.success) {
        setStatus('error')
      } else {
        setStatus('done')
      }
    } catch {
      setStatus('error')
    }
  }

  // ── Manual fallback (need_human) ────────────────────────────────────────────
  if (status === 'manual') {
    return (
      <div className="mt-3 w-full rounded-xl bg-surface-container-low border border-outline-variant/20 p-4 text-xs text-on-surface-variant">
        <p className="font-semibold text-on-surface mb-2">This service requires manual cancellation</p>
        {entry.notes && <p className="text-outline mb-2">{entry.notes}</p>}
        <button
          onClick={() => window.open(manualUrl, '_blank', 'noopener,noreferrer')}
          className="inline-block bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-medium rounded-lg px-3 py-1.5 transition-colors"
        >
          Open cancellation page →
        </button>
      </div>
    )
  }

  // ── Simple button ───────────────────────────────────────────────────────────
  return (
    <button
      onClick={handleCancel}
      disabled={status === 'loading' || status === 'done'}
      className={`text-xs rounded-lg px-4 py-2 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50
        ${status === 'idle' ? 'bg-error/20 text-error border border-error/30 hover:bg-error/30' : ''}
        ${status === 'loading' ? 'bg-surface-container-highest text-on-surface-variant' : ''}
        ${status === 'done' ? 'bg-secondary/20 text-secondary border border-secondary/30' : ''}
        ${status === 'error' ? 'bg-error/30 text-error border border-error/40' : ''}
      `}
    >
      {status === 'idle' && 'Cancel →'}
      {status === 'loading' && 'Cancelling…'}
      {status === 'done' && 'Cancelled ✓'}
      {status === 'error' && 'Failed'}
    </button>
  )
}

export default function Preview({ subscriptions }: { subscriptions: Subscription[] }) {
  if (subscriptions.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">
        {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''} detected
      </p>
      {subscriptions.map((sub) => {
        const entry = findCancellationEntry(sub.name)
        return (
          <div
            key={sub.name}
            className="bg-surface-container-high rounded-xl px-5 py-4 border border-outline-variant/10 hover:border-secondary/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-on-surface">{sub.name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {sub.frequency} · {sub.category}
                </p>
                {entry?.notes && (
                  <p className="text-xs text-outline mt-0.5">{entry.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <span className="font-bold text-on-surface">{sub.amount}</span>
                {entry ? (
                  <CancelButton entry={entry} />
                ) : (
                  <span className="text-xs text-outline px-3 py-1">Manual cancel</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
