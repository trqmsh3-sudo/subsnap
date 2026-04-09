'use client'

import React from 'react'
import { findCancellationEntry } from '@/lib/cancellationDb'

interface Subscription {
  name: string
  amount: string
  frequency: string
  category: string
}

function SubscriptionCard({ sub }: { sub: Subscription }) {
  const [open, setOpen] = React.useState(false)
  const entry = findCancellationEntry(sub.name)

  const loginUrl = entry?.loginUrl
    ?? `https://www.google.com/search?q=${encodeURIComponent(sub.name + ' login')}`
  const cancelUrl = entry?.cancelUrl
    ?? `https://www.google.com/search?q=${encodeURIComponent('how to cancel ' + sub.name + ' subscription')}`

  return (
    <div className="bg-surface-container-high rounded-xl px-5 py-4 border border-outline-variant/10 hover:border-secondary/20 transition-colors">
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
          <button
            onClick={() => {
              if (open) { setOpen(false) } else {
                window.open(loginUrl, '_blank', 'noopener,noreferrer')
                setOpen(true)
              }
            }}
            className="text-xs rounded-lg px-4 py-2 font-semibold transition-all hover:scale-[1.02] bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20"
          >
            {open ? 'Close ✕' : 'Cancel Guide →'}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 w-full rounded-xl bg-surface-container-low border border-outline-variant/20 p-4">
          <p className="text-sm font-semibold text-on-surface mb-3">
            ✓ Login page opened — sign in there, then come back here
          </p>
          <button
            onClick={() => window.open(cancelUrl, '_blank', 'noopener,noreferrer')}
            className="w-full text-left text-xs bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-medium rounded-lg px-3 py-2.5 transition-colors"
          >
            I&apos;m logged in → Go to cancel page →
          </button>
        </div>
      )}
    </div>
  )
}

export default function Preview({ subscriptions }: { subscriptions: Subscription[] }) {
  if (subscriptions.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest">
        {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''} detected
      </p>
      {subscriptions.map((sub) => (
        <SubscriptionCard key={sub.name} sub={sub} />
      ))}
    </div>
  )
}
