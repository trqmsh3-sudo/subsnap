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
    <div className="bg-white/[0.03] rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-[#44e2cd]/40 transition-all shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base text-white">{sub.name}</h4>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-[#44e2cd] border border-white/10">
              {sub.frequency === 'monthly' ? 'חודשי' : sub.frequency === 'yearly' ? 'שנתי' : sub.frequency}
            </span>
          </div>
          {entry?.notes ? (
            <p className="text-xs text-slate-400 mt-1">{entry.notes}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">{sub.category}</p>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="font-black text-lg text-white">{sub.amount}</span>
          <button
            onClick={() => {
              if (open) { setOpen(false) } else {
                window.open(cancelUrl, '_blank', 'noopener,noreferrer')
                setOpen(true)
              }
            }}
            className="text-xs rounded-xl px-4 py-2.5 font-bold transition-all gemini-btn-primary flex items-center gap-1"
          >
            <span>{open ? 'סגור ✕' : 'בטל מנוי ➔'}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 w-full rounded-xl bg-black/40 border border-[#44e2cd]/20 p-4 space-y-3 animate-fadeIn">
          <p className="text-xs font-bold text-slate-200">
            ✓ עמוד הביטול נפתח בחלון נפרד.
          </p>
          {entry?.steps && entry.steps.length > 0 && (
            <div className="space-y-1.5 text-xs text-slate-400 bg-white/[0.02] p-3 rounded-lg border border-white/5">
              <p className="font-semibold text-slate-300 mb-1">הנחיות לביטול מהיר:</p>
              {entry.steps.map((s, idx) => (
                <p key={idx}><span className="text-[#44e2cd] font-bold">{idx + 1}.</span> {s}</p>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <a
              href={cancelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#44e2cd] bg-[#44e2cd]/10 hover:bg-[#44e2cd]/20 font-bold px-3.5 py-2 rounded-lg transition-colors inline-block"
            >
              פתח שוב את עמוד הביטול ↗
            </a>
            {loginUrl && (
              <a
                href={loginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 bg-white/5 hover:bg-white/10 font-medium px-3.5 py-2 rounded-lg transition-colors inline-block"
              >
                עמוד התחברות
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Preview({ subscriptions }: { subscriptions: Subscription[] }) {
  if (subscriptions.length === 0) return null

  return (
    <div className="space-y-3">
      {subscriptions.map((sub, i) => (
        <SubscriptionCard key={`${sub.name}-${i}`} sub={sub} />
      ))}
    </div>
  )
}
