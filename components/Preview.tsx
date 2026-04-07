'use client'

import React from 'react'
import { findCancellationEntry, CancellationEntry } from '@/lib/cancellationDb'

interface Subscription {
  name: string
  amount: string
  frequency: string
  category: string
}

type Status = 'idle' | 'preparing' | 'loading' | 'waiting_login' | 'done' | 'manual' | 'error'

function CancelButton({ entry }: { entry: CancellationEntry }) {
  const [status, setStatus] = React.useState<Status>('idle')
  const [manualUrl, setManualUrl] = React.useState('')

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

    if (data.tier === 'manual' || data.message?.toLowerCase().includes('need_human')) {
      setManualUrl(data.cancelUrl ?? entry.cancelUrl)
      setStatus('manual')
    } else if (data.message?.toLowerCase().includes('login')) {
      setStatus('waiting_login')
    } else if (!data.success) {
      setStatus('error')
    } else {
      setStatus('done')
    }
  }

  function handleCancel() {
    if (entry.tier === 'session') {
      setStatus('preparing')
    } else {
      fireApiCall()
    }
  }

  // ── Tier 3: manual guide ────────────────────────────────────────────────────
  if (status === 'manual') {
    return (
      <div className="mt-3 w-full rounded-xl bg-surface-container-low border border-outline-variant/20 p-4 text-xs text-on-surface-variant">
        <p className="font-semibold text-on-surface mb-2">This service requires manual cancellation</p>
        <ol className="list-decimal list-inside space-y-0.5 mb-3">
          <li>Visit the cancellation page</li>
          <li>Log in to your account</li>
          <li>Find and confirm cancellation</li>
        </ol>
        {entry.notes && <p className="text-outline mb-2">{entry.notes}</p>}
        <a
          href={manualUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-medium rounded-lg px-3 py-1.5 transition-colors"
        >
          Open cancellation page →
        </a>
      </div>
    )
  }

  // ── Tier 2: session bridge prep ─────────────────────────────────────────────
  if (status === 'preparing') {
    return (
      <div className="mt-3 w-full rounded-xl border border-tertiary/30 bg-tertiary-container/10 p-4 text-xs text-on-tertiary-container">
        <p className="font-semibold mb-1">{entry.name} requires you to log in.</p>
        <p>We'll open the cancellation page directly — just sign in and we'll guide you from there.</p>
        <p className="mt-1 text-tertiary">Opening browser…</p>
      </div>
    )
  }

  if (status === 'waiting_login') {
    return (
      <div className="mt-3 w-full rounded-xl border border-tertiary/30 bg-tertiary-container/10 p-4 text-xs text-on-tertiary-container">
        <p className="font-semibold">Browser opened → Navigating → Waiting for you…</p>
        <p className="mt-1 text-tertiary">Complete login in the browser window to continue.</p>
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
      {status === 'loading' && (entry.tier === 'auto' ? 'Cancelling…' : 'Opening…')}
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
