'use client'
import React, { useState } from 'react'

export default function AdversarialTestPage() {
  const [status, setStatus] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-[#131b2e] border border-slate-700/60 rounded-3xl p-8 space-y-6">
        <h1 className="text-lg font-black text-white">NimbusWork Settings</h1>

        {/* Decoy A: contains the word "cancel" but is NOT about subscription */}
        <button
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all block text-left"
          onClick={() => setStatus('❌ טעות: זה ביטל dark mode, לא מנוי')}
        >
          Cancel Dark Theme Preview
        </button>

        {/* Decoy B: negation trick — contains "cancel subscription" verbatim but means the OPPOSITE */}
        <button
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 font-semibold text-xs transition-all block text-left"
          onClick={() => setStatus('❌ טעות חמורה: זה השאיר את המנוי פעיל!')}
        >
          Don't cancel my subscription — Keep it active
        </button>

        {/* Decoy C: generic "Confirm" that belongs to the discount modal, not cancellation */}
        <button
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all block text-left"
          onClick={() => setStatus('❌ טעות: זה אישר הנחה, לא ביטול')}
        >
          Confirm
        </button>

        {/* Decoy D: "Remove" — sounds destructive/relevant but removes a payment method, not the sub */}
        <button
          className="w-full py-2.5 px-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 font-semibold text-xs transition-all block text-left"
          onClick={() => setStatus('❌ טעות: זה הסיר אמצעי תשלום בלבד')}
        >
          Remove saved card
        </button>

        {/* REAL TARGET: no "cancel" or "subscription" word at all — synonym only, styled as unimportant, buried last */}
        <div className="pt-6 border-t border-slate-800">
          <button
            id="pref_membership_end_77"
            className="text-[11px] text-slate-500 underline hover:text-slate-300"
            onClick={() => setStatus('🎉 הצלחה: זיהה נכון למרות שאין אף מילת מפתח!')}
          >
            I no longer wish to be a member here
          </button>
        </div>

        {status && <div className="p-4 rounded-xl bg-slate-800 text-xs font-bold animate-fadeIn">{status}</div>}
      </div>
    </div>
  )
}
