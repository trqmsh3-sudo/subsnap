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
    <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-emerald-300 transition-all shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base text-slate-900">{sub.name}</h4>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {sub.frequency === 'monthly' ? 'חודשי' : sub.frequency === 'yearly' ? 'שנתי' : sub.frequency}
            </span>
          </div>
          {entry?.notes ? (
            <p className="text-xs text-slate-500 mt-1">{entry.notes}</p>
          ) : (
            <p className="text-xs text-slate-400 mt-1">{sub.category}</p>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="font-black text-lg text-slate-900">{sub.amount}</span>
          <button
            onClick={() => {
              if (open) { setOpen(false) } else {
                window.open(cancelUrl, '_blank', 'noopener,noreferrer')
                setOpen(true)
              }
            }}
            className="text-xs rounded-xl px-4 py-2.5 font-bold transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1"
          >
            <span>{open ? 'סגור ✕' : 'בטל מנוי ➔'}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 w-full rounded-xl bg-white border border-emerald-100 p-4 space-y-3 animate-fadeIn">
          <p className="text-xs font-bold text-slate-800">
            ✓ עמוד הביטול נפתח בחלון חדש.
          </p>
          {entry?.steps && entry.steps.length > 0 && (
            <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-700 mb-1">הנחיות לביטול:</p>
              {entry.steps.map((s, idx) => (
                <p key={idx}>{idx + 1}. {s}</p>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <a
              href={cancelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold px-3 py-2 rounded-lg transition-colors inline-block"
            >
              פתח שוב את עמוד הביטול ↗
            </a>
            {loginUrl && (
              <a
                href={loginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold px-3 py-2 rounded-lg transition-colors inline-block"
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
